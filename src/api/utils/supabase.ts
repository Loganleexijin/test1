import { createClient, type SupabaseClient } from '@supabase/supabase-js'

type SupabaseEnv = {
  url: string
  anonKey: string
  serviceRoleKey?: string
}

export function getSupabaseEnv(): SupabaseEnv | null {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !anonKey) return null
  return { url, anonKey, serviceRoleKey }
}

export function createSupabaseAnonClient(): SupabaseClient {
  const env = getSupabaseEnv()
  if (!env) {
    throw new Error('Supabase env is not configured')
  }

  return createClient(env.url, env.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

export function createSupabaseAuthedClient(accessToken: string): SupabaseClient {
  const env = getSupabaseEnv()
  if (!env) {
    throw new Error('Supabase env is not configured')
  }

  return createClient(env.url, env.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  })
}

export function createSupabaseAdminClient(): SupabaseClient {
  const env = getSupabaseEnv()
  if (!env) {
    throw new Error('Supabase env is not configured')
  }
  if (!env.serviceRoleKey) {
    throw new Error('Supabase service role key is not configured')
  }

  return createClient(env.url, env.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

export function createSupabaseServerClient(): SupabaseClient {
  const env = getSupabaseEnv()
  if (!env) {
    throw new Error('Supabase env is not configured')
  }

  if (env.serviceRoleKey) return createSupabaseAdminClient()
  return createSupabaseAnonClient()
}
