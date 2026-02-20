import { Sparkles, TrendingUp, Utensils, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface AISummaryCardProps {
  totalCalories: number;
  mealsRecorded: number;
  analysis: string;
  className?: string;
}

export function AISummaryCard({
  totalCalories,
  mealsRecorded,
  analysis,
  className,
}: AISummaryCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-2xl overflow-hidden animate-scale-in",
        className
      )}
    >
      {/* 渐变背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--ai-gradient-start))] via-[hsl(var(--ai-gradient-end))] to-primary opacity-90" />
      
      {/* 装饰光晕 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      
      {/* 内容 */}
      <div className="relative z-10 p-5 text-white">
        {/* 标题 */}
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-semibold">AI 综合餐饮分析</span>
        </div>

        {/* 统计数据 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 opacity-80" />
              <span className="text-xs opacity-80">今日摄入</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">{totalCalories}</span>
              <span className="text-sm opacity-80">kcal</span>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Utensils className="w-4 h-4 opacity-80" />
              <span className="text-xs opacity-80">餐食记录</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold">{mealsRecorded}</span>
              <span className="text-sm opacity-80">顿</span>
            </div>
          </div>
        </div>

        {/* AI 分析内容 */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 opacity-80 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-xs opacity-80 mb-1">今日饮食结构分析：</div>
              <p className="text-sm leading-relaxed opacity-95">{analysis}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
