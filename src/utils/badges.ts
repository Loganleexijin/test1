import type { FastingSession, MealRecord, FoodAnalysisResult } from '@/types';

export interface BadgeStats {
  totalHours: number;
  deepAutophagyHours: number;
  longest: number;
  completedCount: number;
  fastingDays: number;
  moneySaved: number;
  weightLoss: number;
  actualAge: number | null;
  metabolicAge: number | null;
  streak: number;
  aiUseCount: number;
  mealCost: number;
}

export interface BadgeStateInput {
  historySessions: FastingSession[];
  currentSession: FastingSession | null;
  userStats: {
    mealCostSetting: number;
    initialWeight: number | null;
    currentWeight: number | null;
    actualAge: number | null;
    badgesUnlocked: string[];
  };
  mealRecords: MealRecord[];
  aiResults: Map<string, FoodAnalysisResult>;
}

const getDayKey = (timestamp: number) => {
  const d = new Date(timestamp);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const computeBadgeStats = (input: BadgeStateInput): BadgeStats => {
  const historyHours = input.historySessions.map((s) => (s.duration_minutes || 0) / 60);
  const currentHours = input.currentSession && input.currentSession.fasting_status === 'fasting'
    ? Math.max(0, (Date.now() - input.currentSession.start_at) / 3600000)
    : 0;

  const totalHistoryHours = historyHours.reduce((a, b) => a + b, 0);
  const totalHours = totalHistoryHours + currentHours;
  const deepAutophagyHours = historyHours.reduce((sum, h) => sum + Math.max(0, h - 16), 0) + Math.max(0, currentHours - 16);
  const longest = Math.max(0, ...historyHours, currentHours);
  const completedCount = input.historySessions.filter((s) => s.completed).length;
  const fastingDays = new Set(
    input.historySessions.filter((s) => s.end_at).map((s) => getDayKey(s.end_at as number))
  ).size;

  const mealCost = input.userStats.mealCostSetting || 30;
  const moneySaved = completedCount * mealCost;

  const initialWeight = input.userStats.initialWeight;
  const currentWeight = input.userStats.currentWeight;
  const weightLoss = initialWeight != null && currentWeight != null ? initialWeight - currentWeight : 0;

  const actualAge = input.userStats.actualAge ?? null;
  const metabolicAge = actualAge == null
    ? null
    : Math.max(actualAge - fastingDays * 0.05 - weightLoss * 0.5, actualAge - 5);

  const completedDayKeys = Array.from(
    new Set(input.historySessions.filter((s) => s.completed && s.end_at).map((s) => getDayKey(s.end_at as number)))
  ).sort().reverse();
  let streak = 0;
  let cursor = completedDayKeys[0] ?? null;
  while (cursor) {
    if (streak === 0) {
      streak = 1;
    } else {
      const prev = new Date(completedDayKeys[streak - 1]);
      const prevMinus1 = new Date(prev.getTime() - 24 * 60 * 60 * 1000);
      const prevKey = getDayKey(prevMinus1.getTime());
      if (completedDayKeys[streak] === prevKey) {
        streak += 1;
      } else {
        break;
      }
    }
    if (streak >= completedDayKeys.length) break;
    cursor = completedDayKeys[streak] ?? null;
  }

  const aiUseCount = input.mealRecords.filter((m) => Boolean(m.aiAnalysis)).length + input.aiResults.size;

  return {
    totalHours,
    deepAutophagyHours,
    longest,
    completedCount,
    fastingDays,
    moneySaved,
    weightLoss,
    actualAge,
    metabolicAge,
    streak,
    aiUseCount,
    mealCost,
  };
};

export interface BadgeDefinition {
  id: string;
  name: string;
  congrats: string;
  unlocked: boolean;
  remainingText: string;
}

const BADGE_RULES = [
  {
    id: 'badge_first_fast',
    name: '初次觉醒',
    congrats: '欢迎来到灵动断食的世界！你已迈出改变的第一步。',
    isUnlocked: (stats: BadgeStats) => stats.completedCount >= 1,
    remainingText: (stats: BadgeStats) => (stats.completedCount >= 1 ? '' : '还需完成 1 次'),
  },
  {
    id: 'badge_fat_burning',
    name: '燃脂大师',
    congrats: '您已触达深度燃脂区，脂肪正在燃烧！',
    isUnlocked: (stats: BadgeStats) => stats.longest >= 18,
    remainingText: (stats: BadgeStats) => (stats.longest >= 18 ? '' : `还差 ${(18 - stats.longest).toFixed(1)} 小时`),
  },
  {
    id: 'badge_autophagy',
    name: '自噬专家',
    congrats: '您的细胞正在焕发新生，这是真正的抗衰老。',
    isUnlocked: (stats: BadgeStats) => stats.deepAutophagyHours >= 50,
    remainingText: (stats: BadgeStats) => (stats.deepAutophagyHours >= 50 ? '' : `还差 ${Math.ceil(50 - stats.deepAutophagyHours)} 小时`),
  },
  {
    id: 'badge_7day_streak',
    name: '七日连胜',
    congrats: '坚持就是胜利，习惯已经养成！',
    isUnlocked: (stats: BadgeStats) => stats.streak >= 7,
    remainingText: (stats: BadgeStats) => (stats.streak >= 7 ? '' : `还需坚持 ${7 - stats.streak} 天`),
  },
  {
    id: 'badge_money_saved',
    name: '省钱小能手',
    congrats: '健康与财富双丰收，给自己买个礼物吧！',
    isUnlocked: (stats: BadgeStats) => stats.moneySaved >= 500,
    remainingText: (stats: BadgeStats) => (stats.moneySaved >= 500 ? '' : `还差 ¥${Math.ceil(500 - stats.moneySaved)}`),
  },
  {
    id: 'badge_ai_explorer',
    name: 'AI 探索者',
    congrats: '您已掌握了科技断食的奥秘。',
    isUnlocked: (stats: BadgeStats) => stats.aiUseCount >= 10,
    remainingText: (stats: BadgeStats) => (stats.aiUseCount >= 10 ? '' : `还差 ${10 - stats.aiUseCount} 次`),
  },
];

export const buildBadges = (stats: BadgeStats): BadgeDefinition[] => {
  return BADGE_RULES.map((rule) => ({
    id: rule.id,
    name: rule.name,
    congrats: rule.congrats,
    unlocked: rule.isUnlocked(stats),
    remainingText: rule.remainingText(stats),
  }));
};

export const getUnlockedBadgeIds = (stats: BadgeStats): string[] => {
  return buildBadges(stats).filter((b) => b.unlocked).map((b) => b.id);
};
