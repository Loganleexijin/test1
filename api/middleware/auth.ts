import type { NextFunction, Request, Response } from 'express'
import { createSupabaseAnonClient } from '../utils/supabase.js'
import { sendError } from '../utils/api-response.js'

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization
  const token = typeof header === 'string' && header.startsWith('Bearer ')
    ? header.slice('Bearer '.length).trim()
    : null

  if (!token) {
    sendError(res, 401, 'Unauthorized', 'AUTH_MISSING_TOKEN')
    return
  }

  try {
    const supabase = createSupabaseAnonClient()
    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data.user) {
      sendError(res, 401, 'Unauthorized', 'AUTH_INVALID_TOKEN')
      return
    }

    req.user = {
      id: data.user.id,
      email: data.user.email ?? null,
    }
    req.authToken = token

    next()
  } catch (e) {
    sendError(res, 500, e instanceof Error ? e.message : 'Auth error', 'AUTH_INTERNAL')
  }
}
