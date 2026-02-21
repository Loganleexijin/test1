/**
 * This is a user authentication API route demo.
 * Handle user registration, login, token management, etc.
 */
import { Router, type Request, type Response } from 'express'
import { sendError, sendOk } from '../utils/api-response.js'
import { createSupabaseAnonClient, createSupabaseAuthedClient, getSupabaseEnv } from '../utils/supabase.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

/**
 * User Login
 * POST /api/auth/register
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const env = getSupabaseEnv()
  if (!env) {
    sendError(res, 500, 'Supabase env is not configured', 'SUPABASE_NOT_CONFIGURED')
    return
  }

  const { email, password } = (req.body ?? {}) as { email?: string; password?: string }
  if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
    sendError(res, 400, 'Invalid email or password', 'AUTH_INVALID_INPUT')
    return
  }

  const supabase = createSupabaseAnonClient()
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    sendError(res, 400, error.message, 'AUTH_SIGNUP_FAILED')
    return
  }

  if (data.user && data.session?.access_token) {
    const authed = createSupabaseAuthedClient(data.session.access_token)
    await authed.from('user_profiles').upsert(
      {
        user_id: data.user.id,
        last_login_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
  }

  sendOk(res, {
    user: data.user ? { id: data.user.id, email: data.user.email ?? null } : null,
    session: data.session
      ? {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at ?? null,
        }
      : null,
  })
})

/**
 * User Login
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const env = getSupabaseEnv()
  if (!env) {
    sendError(res, 500, 'Supabase env is not configured', 'SUPABASE_NOT_CONFIGURED')
    return
  }

  const { email, password } = (req.body ?? {}) as { email?: string; password?: string }
  if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
    sendError(res, 400, 'Invalid email or password', 'AUTH_INVALID_INPUT')
    return
  }

  const supabase = createSupabaseAnonClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.session || !data.user) {
    sendError(res, 401, error?.message || 'Invalid credentials', 'AUTH_LOGIN_FAILED')
    return
  }

  const authed = createSupabaseAuthedClient(data.session.access_token)
  await authed.from('user_profiles').upsert(
    {
      user_id: data.user.id,
      last_login_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )

  sendOk(res, {
    user: { id: data.user.id, email: data.user.email ?? null },
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at ?? null,
    },
  })
})

/**
 * User Logout
 * POST /api/auth/logout
 */
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  void req
  sendOk(res, null, 'ok')
})

router.get('/me', requireAuth, async (req: Request, res: Response): Promise<void> => {
  sendOk(res, { user: req.user ?? null })
})

router.post('/delete', async (req: Request, res: Response): Promise<void> => {
  const userId = (req.body as { userId?: string } | undefined)?.userId
  if (!userId || typeof userId !== 'string') {
    sendError(res, 400, 'Invalid userId')
    return
  }

  sendOk(res, {
    userId,
    deletedAt: new Date().toISOString(),
    ip: req.ip,
  })
})

export default router
