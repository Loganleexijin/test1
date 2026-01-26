import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  FastingSession, 
  FastingStatus, 
  FastingPlan, 
  SubscriptionType,
  FoodAnalysisResult,
  MealRecord
} from '@/types';
import { computeBadgeStats, getUnlockedBadgeIds } from '@/utils/badges';

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
  remainingFreeAnalyses: number;
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
  stageCopyIndex: Record<string, number>;
  
  startFast: (targetHours: number) => Promise<void>;
  endFast: () => Promise<void>;
  cancelFast: () => Promise<void>;
  updateSessionStatus: (status: FastingStatus) => void;
  adjustStartTime: (newStartTime: number) => void;
  backfillSession: (session: Omit<FastingSession, 'id' | 'duration_minutes' | 'completed'>) => void;
  setFastingPlan: (plan: FastingPlan) => void;
  updateCurrentSessionTarget: (newTargetHours: number) => void;
  setNotificationEnabled: (enabled: boolean) => void;
  setSubscriptionType: (type: SubscriptionType) => void;
  saveAIResult: (sessionId: string, result: FoodAnalysisResult) => void;
  addMealRecord: (record: MealRecord) => void;
  updateMealRecord: (id: string, patch: Partial<MealRecord>) => void;
  deleteMealRecord: (id: string) => void;
  clearAllData: () => void;
  loadSession: () => Promise<void>;
  setAuthToken: (token: string | null) => void;
  setPasswordCreds: (creds: { passwordHash: string; passwordSalt: string } | null) => void;
  updateUserProfile: (patch: Partial<UserProfile>) => void;
  updateUserStats: (patch: Partial<UserStats>) => void;
  resetAll: () => void;
  setStageCopyIndex: (stageId: string, index: number) => void;
  updateHistorySessionTimes: (id: string, startAt: number, endAt: number) => void;
  refreshBadges: () => void;
  analyzeMeal: (recordId: string, image: string) => Promise<void>;
}

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
      
      userProfile: {
        userId: crypto.randomUUID(),
        nickname: 'User',
        avatarDataUrl: null,
        phone: null,
        phoneVerified: false,
        hasPassword: false,
        isPro: false,
        proExpireAt: null,
        notificationSettings: {
          fastingReminder: true,
          eatingWindowReminder: true,
          dailyCheckIn: false,
          dailyCheckInTime: '09:00',
          badgeUnlock: true,
          achievementShare: true,
          systemNotification: true,
        },
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        nicknameChangedCount: 0,
        nicknameLastChangedAt: null,
        remainingFreeAnalyses: 3,
      },
      
      userStats: {
        mealCostSetting: 30,
        initialWeight: null,
        currentWeight: null,
        actualAge: null,
        badgesUnlocked: [],
      },
      
      stageCopyIndex: {},

      startFast: async (targetHours: number) => {
        try {
          const response = await fetch('/api/fasting/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              targetHours, 
              startTime: Date.now(),
              plan: get().fastingPlan 
            })
          });
          const { data } = await response.json();
          if (data) {
            set({ currentSession: data });
          }
        } catch (error) {
          console.error('Failed to start fast:', error);
        }
      },

      endFast: async () => {
        try {
          const response = await fetch('/api/fasting/end', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
          const { data } = await response.json();
          if (data) {
            set((state) => ({
              currentSession: null, // Clear active session
              historySessions: [data, ...state.historySessions],
              // Keep plan, don't reset stats immediately
            }));
          }
        } catch (error) {
          console.error('Failed to end fast:', error);
        }
      },

      cancelFast: async () => {
        try {
          await fetch('/api/fasting/cancel', { method: 'POST' });
          set({ currentSession: null });
        } catch (error) {
          console.error('Failed to cancel fast:', error);
        }
      },

      updateSessionStatus: (status: FastingStatus) => {
        const { currentSession } = get();
        if (!currentSession) return;
        set({ currentSession: { ...currentSession, fasting_status: status } });
      },

      adjustStartTime: (newStartTime: number) => {
        const { currentSession } = get();
        if (!currentSession) return;
        set({ currentSession: { ...currentSession, start_at: newStartTime } });
      },

      backfillSession: (sessionData) => {
        const { historySessions } = get();
        const newSession: FastingSession = {
          ...sessionData,
          id: crypto.randomUUID(),
          duration_minutes: Math.floor((sessionData.end_at! - sessionData.start_at) / 60000),
          completed: true,
        };
        
        set({
          historySessions: [newSession, ...historySessions].sort((a, b) => b.start_at - a.start_at)
        });
      },

      setFastingPlan: (plan: FastingPlan) => {
        set({ fastingPlan: plan });
      },

      updateCurrentSessionTarget: (newTargetHours: number) => {
        const { currentSession } = get();
        if (!currentSession) return;
        set({ currentSession: { ...currentSession, target_duration_hours: newTargetHours } });
      },

      setNotificationEnabled: (enabled: boolean) => {
        set({ notificationEnabled: enabled });
      },

      setSubscriptionType: (type: SubscriptionType) => {
        set({ subscriptionType: type });
      },

      saveAIResult: (sessionId: string, result: FoodAnalysisResult) => {
        const { aiResults } = get();
        const newResults = new Map(aiResults);
        newResults.set(sessionId, result);
        set({ aiResults: newResults });
      },

      addMealRecord: (record: MealRecord) => {
        set((state) => ({
          mealRecords: [...state.mealRecords, record]
        }));
      },

      updateMealRecord: (id, patch) => {
        set((state) => ({
          mealRecords: state.mealRecords.map(m => m.id === id ? { ...m, ...patch } : m)
        }));
      },

      deleteMealRecord: (id) => {
        set((state) => ({
          mealRecords: state.mealRecords.filter(m => m.id !== id)
        }));
      },

      clearAllData: () => {
        set({
          currentSession: null,
          historySessions: [],
          mealRecords: [],
          aiResults: new Map(),
        });
      },

      loadSession: async () => {
        try {
          // Load current session
          const currentRes = await fetch('/api/fasting/current');
          const currentJson = await currentRes.json();
          
          // Load plan
          const planRes = await fetch('/api/fasting/plan');
          const planJson = await planRes.json();

          set({ 
            currentSession: currentJson.data,
            fastingPlan: planJson.data?.plan || '16:8'
          });
        } catch (error) {
          console.error('Failed to load session:', error);
        }
      },

      setAuthToken: (token) => set({ authToken: token }),
      setPasswordCreds: (creds) => {
        if (creds) {
          set({ passwordHash: creds.passwordHash, passwordSalt: creds.passwordSalt });
        } else {
          set({ passwordHash: null, passwordSalt: null });
        }
      },

      updateUserProfile: (patch) => {
        set((state) => ({
          userProfile: { ...state.userProfile, ...patch }
        }));
      },

      updateUserStats: (patch) => {
        set((state) => ({
          userStats: { ...state.userStats, ...patch }
        }));
      },

      resetAll: () => {
        set({
          currentSession: null,
          historySessions: [],
          authToken: null,
          passwordHash: null,
          passwordSalt: null,
          mealRecords: [],
        });
      },

      setStageCopyIndex: (stageId, index) => {
        set((state) => ({
          stageCopyIndex: {
            ...state.stageCopyIndex,
            [stageId]: index
          }
        }));
      },

      updateHistorySessionTimes: (id, startAt, endAt) => {
        set((state) => ({
          historySessions: state.historySessions.map(s => 
            s.id === id 
              ? { 
                  ...s, 
                  start_at: startAt, 
                  end_at: endAt,
                  duration_minutes: Math.floor((endAt - startAt) / 60000)
                }
              : s
          )
        }));
      },

      refreshBadges: () => {
        const { historySessions, userStats } = get();
        const stats = computeBadgeStats(historySessions);
        const unlocked = getUnlockedBadgeIds(stats);
        
        // Check for newly unlocked
        const newBadges = unlocked.filter(id => !userStats.badgesUnlocked.includes(id));
        if (newBadges.length > 0) {
          set({
            userStats: {
              ...userStats,
              badgesUnlocked: unlocked
            }
          });
          // Here you could trigger a notification
        }
      },

      analyzeMeal: async (recordId, image) => {
        // This would now call the backend AI API
        console.log('Analyzing meal via API...', recordId);
      }
    }),
    {
      name: 'fasting-storage',
      version: 1,
      partialize: (state) => ({
        // We persist less now, relying on API
        fastingPlan: state.fastingPlan,
        authToken: state.authToken,
        userProfile: state.userProfile,
        userStats: state.userStats,
        stageCopyIndex: state.stageCopyIndex
      }),
    }
  )
);
