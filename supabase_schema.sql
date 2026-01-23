-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (Stores user profile and stats)
-- Note: We use text for user_id to match the current app's UUID string format
CREATE TABLE IF NOT EXISTS public.user_profiles (
    user_id TEXT PRIMARY KEY,
    nickname TEXT,
    avatar_url TEXT,
    phone TEXT,
    phone_verified BOOLEAN DEFAULT FALSE,
    has_password BOOLEAN DEFAULT FALSE,
    is_pro BOOLEAN DEFAULT FALSE,
    pro_expire_at BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    
    -- Notification Settings (JSONB for flexibility)
    notification_settings JSONB DEFAULT '{
        "fastingReminder": true,
        "eatingWindowReminder": true,
        "dailyCheckIn": true,
        "dailyCheckInTime": "09:00",
        "badgeUnlock": true,
        "achievementShare": true,
        "systemNotification": true
    }'::jsonb,

    -- User Stats
    meal_cost_setting NUMERIC DEFAULT 0,
    initial_weight NUMERIC,
    current_weight NUMERIC,
    actual_age INTEGER,
    badges_unlocked TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- 2. Fasting Sessions Table
CREATE TABLE IF NOT EXISTS public.fasting_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    fasting_status TEXT NOT NULL, -- 'idle', 'fasting', 'eating', 'paused', 'completed'
    start_at BIGINT NOT NULL,
    end_at BIGINT,
    target_duration_hours INTEGER,
    duration_minutes INTEGER,
    completed BOOLEAN DEFAULT FALSE,
    source TEXT, -- 'manual', 'auto'
    timezone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Meal Records Table
CREATE TABLE IF NOT EXISTS public.meal_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    timestamp BIGINT NOT NULL,
    type TEXT NOT NULL, -- 'breakfast', 'lunch', 'dinner', 'snack'
    image_url TEXT,
    food_name TEXT,
    calories INTEGER,
    ai_analysis JSONB, -- Stores full AI result
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
-- This ensures users can only access their own data
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fasting_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_records ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies (Simple version: allow public access for now since we handle auth in app logic)
-- IMPORTANT: In a production app with real Auth, you should change 'true' to 'auth.uid()::text = user_id'
CREATE POLICY "Allow public access to profiles" ON public.user_profiles FOR ALL USING (true);
CREATE POLICY "Allow public access to sessions" ON public.fasting_sessions FOR ALL USING (true);
CREATE POLICY "Allow public access to meals" ON public.meal_records FOR ALL USING (true);
