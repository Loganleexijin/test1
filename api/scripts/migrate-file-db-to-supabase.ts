import { db } from '../utils/simple-db.js'
import { createSupabaseServerClient, getSupabaseEnv } from '../utils/supabase.js'

async function main(): Promise<void> {
  const env = getSupabaseEnv()
  if (!env) {
    throw new Error('Supabase env is not configured')
  }

  const userId = process.env.MIGRATION_USER_ID
  if (!userId) {
    throw new Error('MIGRATION_USER_ID is required')
  }

  const data = db.read()
  const supabase = createSupabaseServerClient()

  await supabase.from('user_profiles').upsert({ user_id: userId, plan: data.userSettings.plan }, { onConflict: 'user_id' })

  if (data.sessions.length > 0) {
    const { error } = await supabase.from('fasting_sessions').upsert(
      data.sessions.map((s) => ({
        id: s.id,
        user_id: userId,
        fasting_status: s.fasting_status,
        start_at: s.start_at,
        end_at: s.end_at,
        target_duration_hours: s.target_duration_hours,
        duration_minutes: s.duration_minutes,
        completed: s.completed,
        source: s.source,
        timezone: s.timezone,
      })),
      { onConflict: 'id' },
    )
    if (error) throw error
  }

  if (data.mealRecords.length > 0) {
    const { error } = await supabase.from('meal_records').upsert(
      data.mealRecords.map((m) => ({
        id: m.id,
        user_id: userId,
        timestamp: m.timestamp,
        type: m.type,
        image_url: m.imageUrl ?? null,
        food_name: m.foodName ?? null,
        calories: m.calories ?? null,
      })),
      { onConflict: 'id' },
    )
    if (error) throw error
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
