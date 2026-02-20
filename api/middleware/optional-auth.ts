import type { NextFunction, Request, Response } from 'express'
import { createSupabaseAnonClient, getSupabaseEnv } from '../utils/supabase.js'

export async function optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  void res

  if (!getSupabaseEnv()) {
    next()
    return
  }

  const header = req.headers.authorization
  const token = typeof header === 'string' && header.startsWith('Bearer ')
    ? header.slice('Bearer '.length).trim()
    : null

  if (!token) {
    next()
    return
  }

  try {
    const supabase = createSupabaseAnonClient()
    const { data, error } = await supabase.auth.getUser(token)

    if (!error && data.user) {
      req.user = {
        id: data.user.id,
        email: data.user.email ?? null,
      }
      req.authToken = token
    }
  } catch {
  } finally {
    next()
  }
}
