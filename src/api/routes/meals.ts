import { Router, type Request, type Response } from 'express'
import { sendError, sendOk } from '../utils/api-response.js'
import { db } from '../utils/simple-db.js'
import { optionalAuth } from '../middleware/optional-auth.js'
import { createSupabaseAuthedClient } from '../utils/supabase.js'

const router = Router()

router.use(optionalAuth)

const imageBucket = 'meal-images'

function normalizeMeal(row: any) {
  return {
    id: row.id,
    timestamp: row.timestamp,
    type: row.type,
    imageUrl: row.image_url ?? row.imageUrl ?? null,
    foodName: row.food_name ?? row.foodName ?? null,
    calories: row.calories ?? null,
    aiAnalysis: row.ai_analysis ?? row.aiAnalysis ?? null,
  }
}

async function attachSignedImageUrls(
  supabase: ReturnType<typeof createSupabaseAuthedClient>,
  meals: Array<ReturnType<typeof normalizeMeal>>,
): Promise<Array<ReturnType<typeof normalizeMeal>>> {
  const signed = await Promise.all(
    meals.map(async (m) => {
      if (!m.imageUrl) return m
      if (typeof m.imageUrl === 'string' && /^https?:\/\//.test(m.imageUrl)) return m

      const { data, error } = await supabase.storage.from(imageBucket).createSignedUrl(String(m.imageUrl), 60 * 60)
      if (error || !data?.signedUrl) return m
      return { ...m, imageUrl: data.signedUrl }
    }),
  )
  return signed
}

router.get('/', async (req: Request, res: Response) => {
  const from = req.query.from ? Number(req.query.from) : null
  const to = req.query.to ? Number(req.query.to) : null

  if (req.user) {
    const supabase = createSupabaseAuthedClient(req.authToken!)
    let query = supabase
      .from('meal_records')
      .select('*')
      .eq('user_id', req.user.id)
      .order('timestamp', { ascending: false })

    if (from !== null && Number.isFinite(from)) query = query.gte('timestamp', from)
    if (to !== null && Number.isFinite(to)) query = query.lte('timestamp', to)

    const { data, error } = await query

    if (error) {
      sendError(res, 500, error.message, 'MEALS_QUERY_FAILED')
      return
    }

    const meals = (data ?? []).map(normalizeMeal)
    sendOk(res, await attachSignedImageUrls(supabase, meals))
    return
  }

  const data = db.read()
  let records = [...data.mealRecords]
  if (from !== null && Number.isFinite(from)) records = records.filter((m) => m.timestamp >= from)
  if (to !== null && Number.isFinite(to)) records = records.filter((m) => m.timestamp <= to)
  records.sort((a, b) => b.timestamp - a.timestamp)
  sendOk(res, records.map(normalizeMeal))
})

router.get('/today', async (req: Request, res: Response) => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const end = start + 24 * 60 * 60 * 1000 - 1

  if (req.user) {
    const supabase = createSupabaseAuthedClient(req.authToken!)
    const { data, error } = await supabase
      .from('meal_records')
      .select('*')
      .eq('user_id', req.user.id)
      .gte('timestamp', start)
      .lte('timestamp', end)
      .order('timestamp', { ascending: true })

    if (error) {
      sendError(res, 500, error.message, 'MEALS_QUERY_FAILED')
      return
    }

    const meals = (data ?? []).map(normalizeMeal)
    sendOk(res, await attachSignedImageUrls(supabase, meals))
    return
  }

  const data = db.read()
  const records = data.mealRecords
    .filter((m) => m.timestamp >= start && m.timestamp <= end)
    .sort((a, b) => a.timestamp - b.timestamp)
  sendOk(res, records.map(normalizeMeal))
})

router.post('/', async (req: Request, res: Response) => {
  const body = (req.body ?? {}) as {
    timestamp?: number
    type?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
    imageUrl?: string
    foodName?: string
    calories?: number
    aiAnalysis?: unknown
  }

  const timestamp = typeof body.timestamp === 'number' ? body.timestamp : Date.now()
  const type = body.type
  if (!type || (type !== 'breakfast' && type !== 'lunch' && type !== 'dinner' && type !== 'snack')) {
    sendError(res, 400, 'Invalid meal type', 'MEALS_INVALID_INPUT')
    return
  }

  if (req.user) {
    const supabase = createSupabaseAuthedClient(req.authToken!)
    const { data, error } = await supabase
      .from('meal_records')
      .insert({
        user_id: req.user.id,
        timestamp,
        type,
        image_url: body.imageUrl ?? null,
        food_name: body.foodName ?? null,
        calories: typeof body.calories === 'number' ? body.calories : null,
        ai_analysis: body.aiAnalysis ?? null,
      })
      .select('*')
      .single()

    if (error) {
      sendError(res, 500, error.message, 'MEALS_INSERT_FAILED')
      return
    }

    const meal = normalizeMeal(data)
    sendOk(res, (await attachSignedImageUrls(supabase, [meal]))[0])
    return
  }

  const record = {
    id: crypto.randomUUID(),
    timestamp,
    type,
    imageUrl: body.imageUrl,
    foodName: body.foodName || '未知',
    calories: typeof body.calories === 'number' ? body.calories : 0,
    aiAnalysis: body.aiAnalysis ?? null,
  }

  db.update((data) => {
    data.mealRecords.push(record)
  })

  sendOk(res, record)
})

router.patch('/:id', async (req: Request, res: Response) => {
  const id = req.params.id
  if (!id) {
    sendError(res, 400, 'Invalid id', 'MEALS_INVALID_INPUT')
    return
  }

  const body = (req.body ?? {}) as {
    timestamp?: number
    type?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
    imageUrl?: string | null
    foodName?: string | null
    calories?: number | null
    aiAnalysis?: unknown
  }

  if (req.user) {
    const supabase = createSupabaseAuthedClient(req.authToken!)
    const { data, error } = await supabase
      .from('meal_records')
      .update({
        timestamp: typeof body.timestamp === 'number' ? body.timestamp : undefined,
        type: body.type,
        image_url: body.imageUrl,
        food_name: body.foodName,
        calories: typeof body.calories === 'number' ? body.calories : body.calories,
        ai_analysis: body.aiAnalysis,
      })
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select('*')
      .maybeSingle()

    if (error) {
      sendError(res, 500, error.message, 'MEALS_UPDATE_FAILED')
      return
    }
    if (!data) {
      sendError(res, 404, 'Not found', 'MEALS_NOT_FOUND')
      return
    }

    const meal = normalizeMeal(data)
    sendOk(res, (await attachSignedImageUrls(supabase, [meal]))[0])
    return
  }

  let updated: any = null
  db.update((data) => {
    const idx = data.mealRecords.findIndex((m) => m.id === id)
    if (idx === -1) return
    const current = data.mealRecords[idx]
    const next = {
      ...current,
      timestamp: typeof body.timestamp === 'number' ? body.timestamp : current.timestamp,
      type: body.type ?? current.type,
      imageUrl: body.imageUrl === undefined ? current.imageUrl : body.imageUrl ?? undefined,
      foodName: body.foodName === undefined ? current.foodName : body.foodName ?? current.foodName,
      calories:
        typeof body.calories === 'number'
          ? body.calories
          : body.calories === null
            ? current.calories
            : current.calories,
      aiAnalysis: body.aiAnalysis === undefined ? current.aiAnalysis : body.aiAnalysis,
    }
    data.mealRecords[idx] = next
    updated = next
  })

  if (!updated) {
    sendError(res, 404, 'Not found', 'MEALS_NOT_FOUND')
    return
  }

  sendOk(res, updated)
})

router.delete('/:id', async (req: Request, res: Response) => {
  const id = req.params.id
  if (!id) {
    sendError(res, 400, 'Invalid id', 'MEALS_INVALID_INPUT')
    return
  }

  if (req.user) {
    const supabase = createSupabaseAuthedClient(req.authToken!)
    const { error } = await supabase.from('meal_records').delete().eq('id', id).eq('user_id', req.user.id)
    if (error) {
      sendError(res, 500, error.message, 'MEALS_DELETE_FAILED')
      return
    }
    sendOk(res, null, 'deleted')
    return
  }

  let removed = false
  db.update((data) => {
    const before = data.mealRecords.length
    data.mealRecords = data.mealRecords.filter((m) => m.id !== id)
    removed = data.mealRecords.length !== before
  })

  if (!removed) {
    sendError(res, 404, 'Not found', 'MEALS_NOT_FOUND')
    return
  }

  sendOk(res, null, 'deleted')
})

export default router
