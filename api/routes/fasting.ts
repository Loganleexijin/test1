import { Router, type Request, type Response } from 'express';
import { db, type FastingSession } from '../utils/simple-db.js';
import { sendError, sendOk } from '../utils/api-response.js';
import { optionalAuth } from '../middleware/optional-auth.js';
import { createSupabaseAuthedClient } from '../utils/supabase.js';

const router = Router();

router.use(optionalAuth);

// Helper to calculate duration
const calculateDuration = (start: number, end: number) => Math.floor((end - start) / 60000);

// GET /api/fasting/current
// Returns the current active session or null
router.get('/current', (req: Request, res: Response) => {
  if (req.user) {
    void (async () => {
      const supabase = createSupabaseAuthedClient(req.authToken!);
      const { data, error } = await supabase
        .from('fasting_sessions')
        .select('*')
        .eq('user_id', req.user!.id)
        .eq('completed', false)
        .order('start_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        sendError(res, 500, error.message, 'FASTING_QUERY_FAILED');
        return;
      }

      sendOk(res, data ?? null);
    })();
    return;
  }

  const data = db.read();
  // Find a session that is NOT completed (idle, fasting, eating, paused)
  // Logic: "active" usually means fasting_status is 'fasting' or 'paused'. 
  // 'eating' might be considered a state between fasts, but usually we track the *fasting* session.
  // For this app, let's assume we are looking for the latest session that is running.
  
  const activeSession = data.sessions.find((s) => !s.completed);
  
  sendOk(res, activeSession || null);
});

// GET /api/fasting/history
router.get('/history', (req: Request, res: Response) => {
  if (req.user) {
    void (async () => {
      const supabase = createSupabaseAuthedClient(req.authToken!);
      const { data, error } = await supabase
        .from('fasting_sessions')
        .select('*')
        .eq('user_id', req.user!.id)
        .eq('completed', true)
        .order('start_at', { ascending: false });

      if (error) {
        sendError(res, 500, error.message, 'FASTING_QUERY_FAILED');
        return;
      }

      sendOk(res, data ?? []);
    })();
    return;
  }

  const data = db.read();
  // Return completed sessions sorted by date desc
  const history = data.sessions
    .filter((s) => s.completed)
    .sort((a, b) => b.start_at - a.start_at);
    
  sendOk(res, history);
});

// POST /api/fasting/start
router.post('/start', (req: Request, res: Response) => {
  const { targetHours, startTime, plan } = req.body;

  if (req.user) {
    void (async () => {
      const supabase = createSupabaseAuthedClient(req.authToken!);
      const resolvedStart = startTime && typeof startTime === 'number' ? startTime : Date.now();
      const resolvedTarget = typeof targetHours === 'number' && targetHours > 0 ? targetHours : 16;
      const now = Date.now();

      const { data: actives, error: activeError } = await supabase
        .from('fasting_sessions')
        .select('id,start_at')
        .eq('user_id', req.user!.id)
        .eq('completed', false);

      if (activeError) {
        sendError(res, 500, activeError.message, 'FASTING_QUERY_FAILED');
        return;
      }

      await Promise.all(
        (actives ?? []).map((s: any) =>
          supabase
            .from('fasting_sessions')
            .update({
              completed: true,
              end_at: now,
              duration_minutes: calculateDuration(Number(s.start_at), now),
              fasting_status: 'completed',
            })
            .eq('id', s.id)
            .eq('user_id', req.user!.id),
        ),
      );

      const { data: inserted, error: insertError } = await supabase
        .from('fasting_sessions')
        .insert({
          user_id: req.user!.id,
          fasting_status: 'fasting',
          start_at: resolvedStart,
          end_at: null,
          target_duration_hours: resolvedTarget,
          duration_minutes: 0,
          completed: false,
          source: 'manual_start',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        })
        .select('*')
        .single();

      if (insertError) {
        sendError(res, 500, insertError.message, 'FASTING_INSERT_FAILED');
        return;
      }

      if (typeof plan === 'string' && plan.trim().length > 0) {
        await supabase.from('user_profiles').upsert({ user_id: req.user!.id, plan }, { onConflict: 'user_id' });
      }

      sendOk(res, inserted);
    })();
    return;
  }
  
  const newSession: FastingSession = {
    id: crypto.randomUUID(),
    fasting_status: 'fasting',
    start_at: startTime && typeof startTime === 'number' ? startTime : Date.now(),
    end_at: null,
    target_duration_hours: targetHours || 16,
    duration_minutes: 0,
    completed: false,
    source: 'manual_start',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };

  db.update((data) => {
    // Complete any existing active sessions first (safety check)
    data.sessions.forEach((s: any) => {
      if (!s.completed) {
        s.completed = true;
        s.end_at = Date.now();
        s.duration_minutes = calculateDuration(s.start_at, s.end_at);
        s.fasting_status = 'completed';
      }
    });
    
    // Add new session
    data.sessions.push(newSession);
    
    // Update plan setting if provided
    if (plan) {
      data.userSettings.plan = plan;
    }
  });

  sendOk(res, newSession);
});

// POST /api/fasting/end
router.post('/end', (req: Request, res: Response) => {
  if (req.user) {
    void (async () => {
      const supabase = createSupabaseAuthedClient(req.authToken!);
      const { data: active, error: activeError } = await supabase
        .from('fasting_sessions')
        .select('*')
        .eq('user_id', req.user!.id)
        .eq('completed', false)
        .order('start_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (activeError) {
        sendError(res, 500, activeError.message, 'FASTING_QUERY_FAILED');
        return;
      }
      if (!active) {
        sendError(res, 404, 'No active session found');
        return;
      }

      const now = Date.now();
      const { data: updated, error: updateError } = await supabase
        .from('fasting_sessions')
        .update({
          completed: true,
          end_at: now,
          duration_minutes: calculateDuration(Number(active.start_at), now),
          fasting_status: 'completed',
        })
        .eq('id', (active as any).id)
        .eq('user_id', req.user!.id)
        .select('*')
        .single();

      if (updateError) {
        sendError(res, 500, updateError.message, 'FASTING_UPDATE_FAILED');
        return;
      }

      sendOk(res, updated);
    })();
    return;
  }

  let updatedSession = null;

  db.update((data) => {
    const session = data.sessions.find((s: any) => !s.completed);
    if (session) {
      session.completed = true;
      session.end_at = Date.now();
      session.duration_minutes = calculateDuration(session.start_at, session.end_at);
      session.fasting_status = 'completed';
      updatedSession = session;
    }
  });

  if (!updatedSession) {
    sendError(res, 404, 'No active session found');
    return;
  }

  sendOk(res, updatedSession);
});

// POST /api/fasting/cancel
router.post('/cancel', (req: Request, res: Response) => {
  if (req.user) {
    void (async () => {
      const supabase = createSupabaseAuthedClient(req.authToken!);
      const { error } = await supabase
        .from('fasting_sessions')
        .delete()
        .eq('user_id', req.user!.id)
        .eq('completed', false);

      if (error) {
        sendError(res, 500, error.message, 'FASTING_DELETE_FAILED');
        return;
      }

      sendOk(res, null, 'Session cancelled');
    })();
    return;
  }

  db.update((data) => {
    // Remove the active session
    data.sessions = data.sessions.filter((s) => s.completed);
  });

  sendOk(res, null, 'Session cancelled');
});

// POST /api/fasting/plan
router.post('/plan', (req: Request, res: Response) => {
  const { plan } = req.body;
  if (req.user) {
    void (async () => {
      if (!plan || typeof plan !== 'string') {
        sendError(res, 400, 'Invalid plan', 'FASTING_INVALID_INPUT');
        return;
      }

      const supabase = createSupabaseAuthedClient(req.authToken!);
      const { error } = await supabase
        .from('user_profiles')
        .upsert({ user_id: req.user!.id, plan }, { onConflict: 'user_id' });

      if (error) {
        sendError(res, 500, error.message, 'PROFILE_UPDATE_FAILED');
        return;
      }

      sendOk(res, { plan });
    })();
    return;
  }

  db.update((data) => {
    data.userSettings.plan = plan;
  });
  sendOk(res, { plan });
});

// GET /api/fasting/plan
router.get('/plan', (req: Request, res: Response) => {
  if (req.user) {
    void (async () => {
      const supabase = createSupabaseAuthedClient(req.authToken!);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('plan')
        .eq('user_id', req.user!.id)
        .maybeSingle();

      if (error) {
        sendError(res, 500, error.message, 'PROFILE_QUERY_FAILED');
        return;
      }

      const plan = (data as any)?.plan || '16:8';
      sendOk(res, { plan });
    })();
    return;
  }

  const data = db.read();
  sendOk(res, { plan: data.userSettings.plan });
});

export default router;
