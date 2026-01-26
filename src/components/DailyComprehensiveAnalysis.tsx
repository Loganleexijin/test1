import { useFastingStore } from '@/store/fastingStore';
import { Sparkles, AlertCircle, Loader2, Info } from 'lucide-react';
import { useMemo } from 'react';
import { Card, EmptyState, LoadingState, Pill, StatTile } from '@/components/ui/UiPrimitives';

export default function DailyComprehensiveAnalysis() {
  const { mealRecords } = useFastingStore();

  const todayStats = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    const todaysMeals = mealRecords.filter(m => new Date(m.timestamp).setHours(0, 0, 0, 0) === today);
    
    const analyzing = todaysMeals.filter(m => m.status === 'analyzing').length;
    const errors = todaysMeals.filter(m => m.status === 'error').length;
    const completed = todaysMeals.filter(m => m.status === 'done');
    
    const totalCalories = completed.reduce((sum, m) => sum + (m.calories || 0), 0);
    
    return {
      count: todaysMeals.length,
      analyzing,
      errors,
      totalCalories
    };
  }, [mealRecords]);

  if (todayStats.count === 0) {
    return (
      <EmptyState
        className="bg-white rounded-3xl border border-slate-100 shadow-[0_12px_30px_-22px_rgba(23,30,64,0.5)]"
        icon={<Sparkles className="w-6 h-6 text-blue-500" />}
        title="AI 综合餐饮分析"
        description="记录第一餐后生成每日总结"
      />
    );
  }

  if (todayStats.analyzing > 0) {
    return (
      <LoadingState
        className="bg-gradient-to-br from-indigo-500 to-blue-400 text-white shadow-[0_18px_40px_-26px_rgba(37,99,235,0.7)]"
        icon={<Loader2 className="w-5 h-5 animate-spin text-white" />}
        title="AI 分析中..."
        description={`正在解析 ${todayStats.analyzing} 条饮食记录`}
      />
    );
  }

  if (todayStats.errors > 0 && todayStats.totalCalories === 0) {
    return (
      <EmptyState
        className="bg-white rounded-3xl border border-red-100 shadow-[0_12px_30px_-22px_rgba(248,113,113,0.4)]"
        icon={<AlertCircle className="w-6 h-6 text-red-500" />}
        title="分析失败"
        description="请检查网络或重新上传图片"
      />
    );
  }

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-[#6B7BFF] via-[#5BC6FF] to-[#5BD0A1] text-white p-5 shadow-[0_20px_40px_-12px_rgba(91,198,255,0.4)] rounded-[2rem]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="text-sm font-semibold">AI 综合餐饮分析</div>
        </div>
        {todayStats.errors > 0 && (
          <Pill className="bg-white/20 text-white">
            <AlertCircle className="w-3 h-3" />
            {todayStats.errors} 条异常
          </Pill>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <StatTile label="今日摄入" value={todayStats.totalCalories} unit="kcal" className="bg-white/15" />
        <StatTile label="餐食记录" value={todayStats.count - todayStats.analyzing} unit="项" className="bg-white/15" />
      </div>
      <div className="mt-4 rounded-2xl bg-white/15 px-3 py-3 text-xs leading-relaxed text-white/90 flex gap-2">
        <Info className="w-4 h-4 text-white/80 shrink-0 mt-0.5" />
        <span>
          {todayStats.totalCalories > 2000 ? '今日热量摄入偏高，建议适当增加运动量。' : '今日热量控制良好，请继续保持。'}
          建议晚餐保持清淡，避免过晚进食。
        </span>
      </div>
    </Card>
  );
}
