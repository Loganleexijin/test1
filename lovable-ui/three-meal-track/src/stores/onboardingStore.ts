import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export type GoalPrimary = 
  | 'weight_loss' 
  | 'metabolic_health' 
  | 'energy_focus' 
  | 'eating_habit' 
  | 'gut_comfort' 
  | 'other';

export type Sex = 'female' | 'male' | 'other' | 'prefer_not_to_say';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'high';

export type FastingExperience = 'beginner' | 'some' | 'regular';

export type TrainingType = 'strength' | 'cardio' | 'mixed' | 'none';

export type MealRegularity = 'regular' | 'semi_regular' | 'irregular';

export type LateSnackFreq = 'rare' | '1_2_week' | '3plus_week';

export type BreakfastTime = '7_9' | '9_11' | 'skip' | 'unstable';

export type LunchTime = '11_13' | '13_15' | 'unstable';

export type DinnerTime = '17_19' | '19_21' | 'after_21' | 'unstable';

export type SleepTime = 'before_23' | '23_1' | 'after_1';

export type SafetyFlag = 
  | 'diabetes_med' 
  | 'eating_disorder_history' 
  | 'underage' 
  | 'underweight_risk' 
  | 'ulcer_gastritis' 
  | 'chronic_disease';

export type PregnancyStatus = 'no' | 'pregnant' | 'breastfeeding' | 'trying' | 'unsure';

export type ReminderMode = 'notify_only' | 'notify_alarm' | 'silent';

export type StartDay = 'today' | 'tomorrow';

export interface OnboardingData {
  // Step1
  goal_primary: GoalPrimary | null;
  goal_secondary: GoalPrimary[];
  goal_custom_text: string;
  
  // Step2
  height_cm: number | null;
  weight_kg: number | null;
  age: number | null;
  sex: Sex | null;
  
  // Step3
  activity_level: ActivityLevel | null;
  fasting_experience: FastingExperience | null;
  training_type: TrainingType[];
  
  // Step4
  meal_regularity: MealRegularity | null;
  late_snack_freq: LateSnackFreq | null;
  breakfast_time: BreakfastTime | null;
  lunch_time: LunchTime | null;
  dinner_time: DinnerTime | null;
  sleep_time: SleepTime | null;
  
  // Step5
  safety_flags: SafetyFlag[];
  pregnancy_status: PregnancyStatus | null;
  
  // Step6
  recommended_plan_id: string | null;
  fasting_window_hours: number;
  eating_window_hint: string;
  reminder_mode: ReminderMode | null;
  start_day: StartDay | null;
}

export type OnboardingStep = 
  | 'splash' 
  | 'welcome' 
  | 'step1' 
  | 'step2' 
  | 'step3' 
  | 'step4' 
  | 'step5' 
  | 'step6' 
  | 'finish' 
  | 'completed';

interface OnboardingStore {
  currentStep: OnboardingStep;
  data: OnboardingData;
  isInSafeMode: boolean;
  showSafetyModal: boolean;
  
  setStep: (step: OnboardingStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateData: (updates: Partial<OnboardingData>) => void;
  setInSafeMode: (value: boolean) => void;
  setShowSafetyModal: (value: boolean) => void;
  resetOnboarding: () => void;
  completeOnboarding: () => void;
}

const initialData: OnboardingData = {
  goal_primary: null,
  goal_secondary: [],
  goal_custom_text: '',
  height_cm: null,
  weight_kg: null,
  age: null,
  sex: null,
  activity_level: null,
  fasting_experience: null,
  training_type: [],
  meal_regularity: null,
  late_snack_freq: null,
  breakfast_time: null,
  lunch_time: null,
  dinner_time: null,
  sleep_time: null,
  safety_flags: [],
  pregnancy_status: null,
  recommended_plan_id: null,
  fasting_window_hours: 12,
  eating_window_hint: '12:00–20:00',
  reminder_mode: null,
  start_day: null,
};

const stepOrder: OnboardingStep[] = [
  'splash',
  'welcome',
  'step1',
  'step2',
  'step3',
  'step4',
  'step5',
  'step6',
  'finish',
  'completed',
];

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      currentStep: 'splash',
      data: initialData,
      isInSafeMode: false,
      showSafetyModal: false,

      setStep: (step) => set({ currentStep: step }),
      
      nextStep: () => {
        const currentIndex = stepOrder.indexOf(get().currentStep);
        if (currentIndex < stepOrder.length - 1) {
          set({ currentStep: stepOrder[currentIndex + 1] });
        }
      },
      
      prevStep: () => {
        const currentIndex = stepOrder.indexOf(get().currentStep);
        if (currentIndex > 0) {
          set({ currentStep: stepOrder[currentIndex - 1] });
        }
      },
      
      updateData: (updates) => set((state) => ({
        data: { ...state.data, ...updates }
      })),
      
      setInSafeMode: (value) => set({ isInSafeMode: value }),
      
      setShowSafetyModal: (value) => set({ showSafetyModal: value }),
      
      resetOnboarding: () => set({
        currentStep: 'splash',
        data: initialData,
        isInSafeMode: false,
        showSafetyModal: false,
      }),
      
      completeOnboarding: () => set({ currentStep: 'completed' }),
    }),
    {
      name: 'flux-onboarding',
    }
  )
);

// Helper to generate recommended plan based on data
export const generateRecommendedPlan = (data: OnboardingData, isInSafeMode: boolean) => {
  let hours = 12;
  let planId = 'plan_12_12_beginner';
  
  if (isInSafeMode) {
    hours = 12;
    planId = 'plan_12_12_safe';
  } else if (data.fasting_experience === 'regular') {
    if (data.goal_primary === 'weight_loss') {
      hours = 16;
      planId = 'plan_16_8_weight_loss';
    } else {
      hours = 14;
      planId = 'plan_14_10_regular';
    }
  } else if (data.fasting_experience === 'some') {
    hours = 13;
    planId = 'plan_13_11_some';
  }
  
  // Calculate eating window based on meal times
  let startHour = 12;
  if (data.breakfast_time === '7_9') startHour = 8;
  else if (data.breakfast_time === '9_11') startHour = 10;
  else if (data.lunch_time === '11_13') startHour = 11;
  else if (data.lunch_time === '13_15') startHour = 13;
  
  const endHour = startHour + (24 - hours);
  const eating_window_hint = `${startHour.toString().padStart(2, '0')}:00–${endHour.toString().padStart(2, '0')}:00`;
  
  return {
    recommended_plan_id: planId,
    fasting_window_hours: hours,
    eating_window_hint,
  };
};

// Check if user should enter safe mode
export const checkSafetyMode = (data: OnboardingData): boolean => {
  const dangerousFlags: SafetyFlag[] = ['diabetes_med', 'eating_disorder_history'];
  const hasDangerousFlag = data.safety_flags.some(f => dangerousFlags.includes(f));
  
  const isPregnantOrBreastfeeding = 
    data.pregnancy_status === 'pregnant' || 
    data.pregnancy_status === 'breastfeeding';
  
  const isUnderage = data.age !== null && data.age < 18;
  
  // BMI check for underweight
  let isUnderweight = false;
  if (data.height_cm && data.weight_kg) {
    const heightM = data.height_cm / 100;
    const bmi = data.weight_kg / (heightM * heightM);
    isUnderweight = bmi < 18.5;
  }
  
  return hasDangerousFlag || isPregnantOrBreastfeeding || isUnderage || isUnderweight;
};
