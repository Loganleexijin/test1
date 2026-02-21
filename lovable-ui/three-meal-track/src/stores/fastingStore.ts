import { create } from 'zustand';
import { get as apiGet, post as apiPost } from '@/lib/api';

export interface FastingSession {
  id: string;
  fasting_status: 'idle' | 'fasting' | 'eating' | 'paused' | 'completed';
  start_at: number;
  end_at: number | null;
  target_duration_hours: number;
  duration_minutes: number;
  completed: boolean;
  source: 'manual_start' | 'manual_edit' | 'backfill' | 'auto_recover';
  timezone: string;
}

interface FastingState {
  // UI 状态
  showFastingComplete: boolean;
  showEarlyEndConfirm: boolean;
  
  // 断食数据
  isFasting: boolean;
  fastingStartTime: number | null;
  targetHours: number;
  planType: string;
  isLoading: boolean;
  error: string | null;
  fastingHistory: FastingSession[];
  
  // 最近完成的断食记录
  lastCompletedFasting: {
    hours: number;
    minutes: number;
    completionRate: number;
    endReason?: string;
  } | null;
  
  // 新解锁的勋章
  newBadge: { id: string; name: string; icon: string } | null;
  
  // Actions
  setShowFastingComplete: (show: boolean) => void;
  setShowEarlyEndConfirm: (show: boolean) => void;
  init: () => Promise<void>;
  fetchCurrentStatus: () => Promise<void>;
  startFasting: (targetHours?: number, startTime?: number, plan?: string) => Promise<void>;
  endFasting: (reason?: string) => Promise<void>;
  fetchHistory: () => Promise<void>;
  setTargetHours: (hours: number) => void;
  setPlanType: (plan: string) => void;
  clearNewBadge: () => void;
}

export const useFastingStore = create<FastingState>((set, get) => ({
  // 初始状态
  showFastingComplete: false,
  showEarlyEndConfirm: false,
  isFasting: false,
  fastingStartTime: null,
  targetHours: 16,
  planType: '16:8',
  isLoading: false,
  error: null,
  fastingHistory: [],
  lastCompletedFasting: null,
  newBadge: null,
  
  // Actions
  setShowFastingComplete: (show) => set({ showFastingComplete: show }),
  setShowEarlyEndConfirm: (show) => set({ showEarlyEndConfirm: show }),
  
  init: async () => {
    await get().fetchCurrentStatus();
  },

  fetchCurrentStatus: async () => {
    set({ isLoading: true, error: null });
    try {
      const session = await apiGet<FastingSession | null>('/fasting/current');
      if (session) {
        set({
          isFasting: true,
          fastingStartTime: session.start_at,
          targetHours: session.target_duration_hours,
        });
      } else {
        set({
          isFasting: false,
          fastingStartTime: null,
        });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '未知错误' });
    } finally {
      set({ isLoading: false });
    }
  },

  startFasting: async (targetHours, startTime, plan) => {
    const current = get();
    const resolvedTarget = targetHours ?? current.targetHours;
    const resolvedStart = startTime ?? Date.now();
    const resolvedPlan = plan ?? current.planType;

    set({ isLoading: true, error: null });
    try {
      const session = await apiPost<FastingSession, { targetHours: number; startTime: number; plan: string }>(
        '/fasting/start',
        {
          targetHours: resolvedTarget,
          startTime: resolvedStart,
          plan: resolvedPlan,
        }
      );

      set({
        isFasting: true,
        fastingStartTime: session.start_at,
        targetHours: session.target_duration_hours,
        planType: resolvedPlan,
        lastCompletedFasting: null,
        newBadge: null,
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '未知错误' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  endFasting: async (reason) => {
    set({ isLoading: true, error: null });
    try {
      const session = await apiPost<FastingSession>('/fasting/end');
      const totalMinutes = session.duration_minutes || 0;
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const targetMinutes = session.target_duration_hours * 60;
      const completionRate = targetMinutes > 0 ? Math.min(100, Math.round((totalMinutes / targetMinutes) * 100)) : 0;

      let newBadge = null;
      if (completionRate >= 100) {
        newBadge = { id: 'week_streak', name: '坚持一周', icon: '🏆' };
      }
      
      set({
        isFasting: false,
        fastingStartTime: null,
        lastCompletedFasting: {
          hours,
          minutes,
          completionRate,
          endReason: reason,
        },
        newBadge,
        showFastingComplete: false,
        showEarlyEndConfirm: false,
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '未知错误' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      const history = await apiGet<FastingSession[]>('/fasting/history');
      set({ fastingHistory: history });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '未知错误' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  setTargetHours: (hours) => set({ targetHours: hours }),
  setPlanType: (plan) => set({ planType: plan }),
  clearNewBadge: () => set({ newBadge: null }),
}));
