import { Router, type Request, type Response } from 'express'
import { sendError, sendOk } from '../utils/api-response.js'
import { optionalAuth } from '../middleware/optional-auth.js'
import { createSupabaseAdminClient, createSupabaseAuthedClient, getSupabaseEnv } from '../utils/supabase.js'

const router = Router()

router.use(optionalAuth)

const bucket = 'meal-images'

function extFromContentType(contentType: string): string {
  if (contentType === 'image/jpeg') return 'jpg'
  if (contentType === 'image/png') return 'png'
  if (contentType === 'image/webp') return 'webp'
  return 'bin'
}

router.post('/upload', async (req: Request, res: Response) => {
  if (!getSupabaseEnv()) {
    sendError(res, 500, 'Supabase env is not configured', 'SUPABASE_NOT_CONFIGURED')
    return
  }

  if (!req.user) {
    sendError(res, 401, 'Unauthorized', 'AUTH_MISSING_TOKEN')
    return
  }

  const { dataUrl } = (req.body ?? {}) as { dataUrl?: string }
  if (!dataUrl || typeof dataUrl !== 'string') {
    sendError(res, 400, 'Invalid dataUrl', 'FILES_INVALID_INPUT')
    return
  }

  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (!match) {
    sendError(res, 400, 'Invalid dataUrl format', 'FILES_INVALID_INPUT')
    return
  }

  const contentType = match[1]
  const base64 = match[2]
  const estimatedBytes = Math.floor((base64.length * 3) / 4)
  if (estimatedBytes > 10 * 1024 * 1024) {
    sendError(res, 413, 'File too large', 'FILES_TOO_LARGE')
    return
  }

  const buffer = Buffer.from(base64, 'base64')
  const ext = extFromContentType(contentType)
  const path = `${req.user.id}/${Date.now()}-${crypto.randomUUID()}.${ext}`

  let supabase: ReturnType<typeof createSupabaseAuthedClient>
  try {
    supabase = createSupabaseAdminClient() as any
  } catch {
    supabase = createSupabaseAuthedClient(req.authToken!)
  }

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, new Uint8Array(buffer), { contentType })

  if (uploadError) {
    sendError(res, 500, uploadError.message, 'FILES_UPLOAD_FAILED')
    return
  }

  const { data, error: signError } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60)
  if (signError) {
    sendError(res, 500, signError.message, 'FILES_SIGN_FAILED')
    return
  }

  sendOk(res, {
    bucket,
    path,
    url: data.signedUrl,
    contentType,
    size: buffer.byteLength,
  })
})

router.get('/signed-url', async (req: Request, res: Response) => {
  if (!getSupabaseEnv()) {
    sendError(res, 500, 'Supabase env is not configured', 'SUPABASE_NOT_CONFIGURED')
    return
  }

  if (!req.user) {
    sendError(res, 401, 'Unauthorized', 'AUTH_MISSING_TOKEN')
    return
  }

  const bucketName = typeof req.query.bucket === 'string' ? req.query.bucket : bucket
  const path = typeof req.query.path === 'string' ? req.query.path : null
  const expiresIn = typeof req.query.expiresIn === 'string' ? Number(req.query.expiresIn) : 60

  if (!path) {
    sendError(res, 400, 'Invalid path', 'FILES_INVALID_INPUT')
    return
  }

  let supabase: ReturnType<typeof createSupabaseAuthedClient>
  try {
    supabase = createSupabaseAdminClient() as any
  } catch {
    supabase = createSupabaseAuthedClient(req.authToken!)
  }
  const { data, error } = await supabase.storage.from(bucketName).createSignedUrl(path, expiresIn)
  if (error) {
    sendError(res, 500, error.message, 'FILES_SIGN_FAILED')
    return
  }

  sendOk(res, { signedUrl: data.signedUrl })
})

export default router
