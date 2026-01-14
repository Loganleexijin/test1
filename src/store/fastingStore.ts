import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  FastingSession, 
  FastingStatus, 
  SessionSource, 
  FastingPlan, 
  SubscriptionType,
  FoodAnalysisResult,
  MealRecord
} from '@/types';

interface NotificationSettings {
  fastingReminder: boolean;
  eatingWindowReminder: boolean;
  dailyCheckIn: boolean;
  dailyCheckInTime: string;
  badgeUnlock: boolean;
  achievementShare: boolean;
  systemNotification: true;
}

interface UserProfile {
  userId: string;
  nickname: string;
  avatarDataUrl: string | null;
  phone: string | null;
  phoneVerified: boolean;
  hasPassword: boolean;
  isPro: boolean;
  proExpireAt: number | null;
  notificationSettings: NotificationSettings;
  createdAt: string;
  lastLoginAt: string | null;
  nicknameChangedCount: number;
  nicknameLastChangedAt: number | null;
}

interface UserStats {
  mealCostSetting: number;
  initialWeight: number | null;
  currentWeight: number | null;
  actualAge: number | null;
  badgesUnlocked: string[];
}

interface FastingState {
  currentSession: FastingSession | null;
  historySessions: FastingSession[];
  fastingPlan: FastingPlan;
  notificationEnabled: boolean;
  subscriptionType: SubscriptionType;
  aiResults: Map<string, FoodAnalysisResult>;
  mealRecords: MealRecord[];
  authToken: string | null;
  passwordHash: string | null;
  passwordSalt: string | null;
  userProfile: UserProfile;
  userStats: UserStats;
  
  startFast: (targetHours: number) => void;
  endFast: () => void;
  cancelFast: () => void;
  updateSessionStatus: (status: FastingStatus) => void;
  adjustStartTime: (newStartTime: number) => void;
  backfillSession: (session: Omit<FastingSession, 'id' | 'duration_minutes' | 'completed'>) => void;
  setFastingPlan: (plan: FastingPlan) => void;
  updateCurrentSessionTarget: (newTargetHours: number) => void;
  setNotificationEnabled: (enabled: boolean) => void;
  setSubscriptionType: (type: SubscriptionType) => void;
  saveAIResult: (sessionId: string, result: FoodAnalysisResult) => void;
  addMealRecord: (record: MealRecord) => void;
  deleteMealRecord: (id: string) => void;
  clearAllData: () => void;
  loadSession: () => void;
  setAuthToken: (token: string | null) => void;
  setPasswordCreds: (creds: { passwordHash: string; passwordSalt: string } | null) => void;
  updateUserProfile: (patch: Partial<UserProfile>) => void;
  updateUserStats: (patch: Partial<UserStats>) => void;
  resetAll: () => void;
}

const createSession = (
  status: FastingStatus,
  startAt: number,
  targetHours: number,
  source: SessionSource,
  timezone: string
): FastingSession => {
  const endAt = status === 'completed' || status === 'eating' ? Date.now() : null;
  const durationMinutes = endAt 
    ? Math.floor((endAt - startAt) / 60000)
    : Math.floor((Date.now() - startAt) / 60000);
  const completed = durationMinutes >= targetHours * 60;

  return {
    id: crypto.randomUUID(),
    fasting_status: status,
    start_at: startAt,
    end_at: endAt,
    target_duration_hours: targetHours,
    duration_minutes: durationMinutes,
    completed,
    source,
    timezone,
  };
};

const createDefaultUserProfile = (): UserProfile => {
  const id = `FLUX_${Math.floor(100000 + Math.random() * 900000)}`;
  const now = new Date().toISOString();
  return {
    userId: id,
    nickname: 'Flux 用户',
    avatarDataUrl: null,
    phone: null,
    phoneVerified: false,
    hasPassword: false,
    isPro: false,
    proExpireAt: null,
    notificationSettings: {
      fastingReminder: true,
      eatingWindowReminder: false,
      dailyCheckIn: true,
      dailyCheckInTime: '20:00',
      badgeUnlock: true,
      achievementShare: false,
      systemNotification: true,
    },
    createdAt: now,
    lastLoginAt: null,
    nicknameChangedCount: 0,
    nicknameLastChangedAt: null,
  };
};

const createDefaultUserStats = (): UserStats => ({
  mealCostSetting: 30,
  initialWeight: null,
  currentWeight: null,
  actualAge: null,
  badgesUnlocked: [],
});

export const useFastingStore = create<FastingState>()(
  persist(
    (set, get) => ({
      currentSession: null,
      historySessions: [],
      fastingPlan: '16:8',
      notificationEnabled: false,
      subscriptionType: 'free',
      aiResults: new Map(),
      mealRecords: [],
      authToken: null,
      passwordHash: null,
      passwordSalt: null,
      userProfile: createDefaultUserProfile(),
      userStats: createDefaultUserStats(),

      startFast: (targetHours: number) => {
        const session = createSession(
          'fasting',
          Date.now(),
          targetHours,
          'manual_start',
          Intl.DateTimeFormat().resolvedOptions().timeZone
        );
        set({ currentSession: session });
      },

      endFast: () => {
        const { currentSession, historySessions } = get();
        if (!currentSession) return;

        const completedSession = {
          ...currentSession,
          fasting_status: 'completed' as FastingStatus,
          end_at: Date.now(),
          duration_minutes: Math.floor((Date.now() - currentSession.start_at) / 60000),
          completed: Math.floor((Date.now() - currentSession.start_at) / 60000) >= currentSession.target_duration_hours * 60,
        };

        set({
          currentSession: null,
          historySessions: [completedSession, ...historySessions].slice(0, 50),
        });
      },

      cancelFast: () => {
        const { currentSession } = get();
        if (!currentSession) return;
        set({ currentSession: null });
      },

      updateSessionStatus: (status: FastingStatus) => {
        set((state) => ({
          currentSession: state.currentSession
            ? { ...state.currentSession, fasting_status: status }
            : null,
        }));
      },

      adjustStartTime: (newStartTime: number) => {
        set((state) => ({
          currentSession: state.currentSession
            ? { ...state.currentSession, start_at: newStartTime, source: 'manual_edit' }
            : null,
        }));
      },

      backfillSession: (sessionData) => {
        const durationMinutes = Math.floor((Date.now() - sessionData.start_at) / 60000);
        const completed = durationMinutes >= sessionData.target_duration_hours * 60;

        const session: FastingSession = {
          id: crypto.randomUUID(),
          ...sessionData,
          duration_minutes: durationMinutes,
          completed,
        };

        set((state) => ({
          historySessions: [session, ...state.historySessions],
        }));
      },

      setFastingPlan: (plan: FastingPlan) => {
        set({ fastingPlan: plan });
      },

      updateCurrentSessionTarget: (newTargetHours: number) => {
        const { currentSession } = get();
        if (!currentSession) return;
        
        const updatedSession = {
          ...currentSession,
          target_duration_hours: newTargetHours,
          completed: currentSession.duration_minutes >= newTargetHours * 60
        };
        
        set({ currentSession: updatedSession });
      },

      setNotificationEnabled: (enabled: boolean) => {
        set({ notificationEnabled: enabled });
      },

      setSubscriptionType: (type: SubscriptionType) => {
        set({ subscriptionType: type });
      },

      saveAIResult: (sessionId: string, result: FoodAnalysisResult) => {
        set((state) => ({
          aiResults: new Map(state.aiResults).set(sessionId, result),
        }));
      },

      addMealRecord: (record: MealRecord) => {
        set((state) => ({
          mealRecords: [record, ...state.mealRecords],
        }));
      },

      deleteMealRecord: (id: string) => {
        set((state) => ({
          mealRecords: state.mealRecords.filter((r) => r.id !== id),
        }));
      },

      clearAllData: () => {
        set({
          currentSession: null,
          historySessions: [],
          aiResults: new Map(),
          mealRecords: [],
        });
      },

      loadSession: () => {
        const { currentSession } = get();
        if (!currentSession) return;

        const now = Date.now();
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        if (now < currentSession.start_at) {
          console.warn('System time anomaly detected');
          return;
        }

        const durationMinutes = Math.floor((now - currentSession.start_at) / 60000);
        const completed = durationMinutes >= currentSession.target_duration_hours * 60;
        
        let newStatus: FastingStatus = currentSession.fasting_status;
        if (completed) {
          newStatus = 'completed';
        }

        set((state) => ({
          currentSession: state.currentSession
            ? {
                ...state.currentSession,
                duration_minutes: durationMinutes,
                completed,
                fasting_status: newStatus,
                timezone,
              }
            : null,
        }));
      },

      setAuthToken: (token) => {
        set({ authToken: token });
        set((state) => ({ userProfile: { ...state.userProfile, lastLoginAt: token ? new Date().toISOString() : state.userProfile.lastLoginAt } }));
      },

      setPasswordCreds: (creds) => {
        if (!creds) {
          set({ passwordHash: null, passwordSalt: null });
          set((state) => ({ userProfile: { ...state.userProfile, hasPassword: false } }));
          return;
        }
        set({ passwordHash: creds.passwordHash, passwordSalt: creds.passwordSalt });
        set((state) => ({ userProfile: { ...state.userProfile, hasPassword: true } }));
      },

      updateUserProfile: (patch) => {
        set((state) => ({ userProfile: { ...state.userProfile, ...patch } }));
      },

      updateUserStats: (patch) => {
        set((state) => ({ userStats: { ...state.userStats, ...patch } }));
      },

      resetAll: () => {
        set({
          currentSession: null,
          historySessions: [],
          fastingPlan: '16:8',
          notificationEnabled: false,
          subscriptionType: 'free',
          aiResults: new Map(),
          mealRecords: [],
          authToken: null,
          passwordHash: null,
          passwordSalt: null,
          userProfile: createDefaultUserProfile(),
          userStats: createDefaultUserStats(),
        });
      },
    }),
    {
      name: 'fasting-storage',
      partialize: (state) => ({
        currentSession: state.currentSession,
        historySessions: state.historySessions,
        fastingPlan: state.fastingPlan,
        notificationEnabled: state.notificationEnabled,
        subscriptionType: state.subscriptionType,
        aiResults: Array.from(state.aiResults.entries()),
        mealRecords: state.mealRecords,
        authToken: state.authToken,
        passwordHash: state.passwordHash,
        passwordSalt: state.passwordSalt,
        userProfile: state.userProfile,
        userStats: state.userStats,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.aiResults) {
          const entries = state.aiResults as unknown as Array<[string, FoodAnalysisResult]>;
          state.aiResults = new Map(entries);
        }
        if (state) {
          if (!state.userProfile) state.userProfile = createDefaultUserProfile();
          if (!state.userStats) state.userStats = createDefaultUserStats();
          if (typeof state.authToken === 'undefined') state.authToken = null;
          if (typeof state.passwordHash === 'undefined') state.passwordHash = null;
          if (typeof state.passwordSalt === 'undefined') state.passwordSalt = null;
        }
      },
    }
  )
);
