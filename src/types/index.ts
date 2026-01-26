export type FastingStatus = 'idle' | 'fasting' | 'eating' | 'paused' | 'completed';

export type SessionSource = 'manual_start' | 'manual_edit' | 'backfill' | 'auto_recover';

export type FastingPlan = '12:12' | '16:8' | '18:6' | '20:4' | '23:1' | 'custom';

export type SubscriptionType = 'free' | 'monthly' | 'yearly' | 'lifetime';

export interface FastingSession {
  id: string;
  fasting_status: FastingStatus;
  start_at: number;
  end_at: number | null;
  target_duration_hours: number;
  duration_minutes: number;
  completed: boolean;
  source: SessionSource;
  timezone: string;
}

export interface AIAnalysisResult {
  cal_est: string;
  gi_level: 'high' | 'medium' | 'low';
  one_liner: string;
  detected_items: string[];
  confidence: 'low' | 'medium' | 'high';
  assumptions: string;
  safety_note: string;
  nutritional_advice?: string;
  action_guide?: string;
  tags?: string[];
  calories_value?: number;
}

export interface FoodAnalysisResult {
  foodName: string;
  calories: number;
  macros?: {
    protein: string;
    fat: string;
    carbs: string;
  };
  tags: string[];
  advice: string;
  nextStep: string;
}

export interface FoodAnalysisError {
  error: true;
  message: string;
}

export type FoodAnalysisResponse = FoodAnalysisResult | FoodAnalysisError;

export interface MealRecord {
  id: string;
  timestamp: number;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  imageUrl?: string;
  foodName: string;
  calories: number;
  analysisCompletedAt?: number;
  nutrients?: {
    protein: string;
    fat: string;
    carbs: string;
  };
  tags?: string[];
  aiAnalysis?: FoodAnalysisResult;
  status?: 'analyzing' | 'done' | 'error';
  analysisError?: string;
}

export interface FastingStage {
  id: 'phase1' | 'phase2' | 'phase3' | 'phase4' | 'phase5';
  name: string;
  nameEn: string;
  rangeStart: number; // hours
  rangeEnd: number | null; // hours, null for infinite
  description: string;
  detail?: string;
  tip?: string;
  color: string; // HSL
}

export interface DailyAnalysisReport {
  date: string;
  totalCalories: number;
  nutritionalEvaluation: {
    score: number; // 0-100
    summary: string;
    deficiencies: string[];
    excesses: string[];
  };
  advice: string;
}

export interface AppState {
  currentSession: FastingSession | null;
  historySessions: FastingSession[];
  fastingPlan: FastingPlan;
  notificationEnabled: boolean;
  subscriptionType: SubscriptionType;
  aiResults: Map<string, FoodAnalysisResult>;
  mealRecords: MealRecord[];
}
