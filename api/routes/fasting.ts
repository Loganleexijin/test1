import { Router, type Request, type Response } from 'express';
import { db, type FastingSession } from '../utils/simple-db.js';

const router = Router();

// Helper to calculate duration
const calculateDuration = (start: number, end: number) => Math.floor((end - start) / 60000);

// GET /api/fasting/current
// Returns the current active session or null
router.get('/current', (req: Request, res: Response) => {
  const data = db.read();
  // Find a session that is NOT completed (idle, fasting, eating, paused)
  // Logic: "active" usually means fasting_status is 'fasting' or 'paused'. 
  // 'eating' might be considered a state between fasts, but usually we track the *fasting* session.
  // For this app, let's assume we are looking for the latest session that is running.
  
  const activeSession = data.sessions.find((s) => !s.completed);
  
  res.json({
    success: true,
    data: activeSession || null
  });
});

// GET /api/fasting/history
router.get('/history', (req: Request, res: Response) => {
  const data = db.read();
  // Return completed sessions sorted by date desc
  const history = data.sessions
    .filter((s) => s.completed)
    .sort((a, b) => b.start_at - a.start_at);
    
  res.json({
    success: true,
    data: history
  });
});

// POST /api/fasting/start
router.post('/start', (req: Request, res: Response) => {
  const { targetHours, startTime, plan } = req.body;
  
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

  res.json({
    success: true,
    data: newSession
  });
});

// POST /api/fasting/end
router.post('/end', (req: Request, res: Response) => {
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
    res.status(404).json({ success: false, error: 'No active session found' });
    return;
  }

  res.json({
    success: true,
    data: updatedSession
  });
});

// POST /api/fasting/cancel
router.post('/cancel', (req: Request, res: Response) => {
  db.update((data) => {
    // Remove the active session
    data.sessions = data.sessions.filter((s) => s.completed);
  });

  res.json({
    success: true,
    message: 'Session cancelled'
  });
});

// POST /api/fasting/plan
router.post('/plan', (req: Request, res: Response) => {
  const { plan } = req.body;
  db.update((data) => {
    data.userSettings.plan = plan;
  });
  res.json({ success: true, data: { plan } });
});

// GET /api/fasting/plan
router.get('/plan', (req: Request, res: Response) => {
  const data = db.read();
  res.json({ success: true, data: { plan: data.userSettings.plan } });
});

export default router;
