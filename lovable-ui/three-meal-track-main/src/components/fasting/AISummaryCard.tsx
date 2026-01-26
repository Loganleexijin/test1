import { Sparkles, Info, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AISummaryCardProps {
  totalCalories?: number;
  mealsRecorded?: number;
  analysis?: string;
  status?: "ready" | "empty" | "loading" | "error";
  errorText?: string;
  className?: string;
}

export function AISummaryCard({
  totalCalories = 0,
  mealsRecorded = 0,
  analysis = "",
  status = "ready",
  errorText = "请检查网络或重新上传图片",
  className,
}: AISummaryCardProps) {
  if (status === "empty") {
    return (
      <div className="w-full bg-card rounded-3xl border border-border/60 shadow-card p-6 text-center">
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3 text-primary">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-foreground font-bold mb-1">AI 综合餐饮分析</h3>
        <p className="text-muted-foreground text-sm">记录第一餐后生成每日总结</p>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="w-full bg-gradient-to-br from-[hsl(var(--ai-gradient-start))] via-[hsl(var(--ai-gradient-end))] to-primary text-white rounded-3xl p-6 shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">AI 分析中...</h3>
            <p className="text-white/70 text-xs">正在解析饮食记录</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="w-full bg-card rounded-3xl border border-destructive/20 shadow-card p-6 text-center">
        <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-3 text-destructive">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-foreground font-bold mb-1">分析失败</h3>
        <p className="text-muted-foreground text-sm">{errorText}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative rounded-3xl overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--ai-gradient-start))] via-[hsl(var(--ai-gradient-end))] to-primary" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 p-5 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="text-sm font-semibold">AI 综合餐饮分析</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl px-4 py-3 bg-white/15">
            <div className="text-[11px] text-white/70 font-medium">今日摄入</div>
            <div className="mt-1 flex items-baseline gap-1">
              <div className="text-3xl font-bold tracking-tight">{totalCalories}</div>
              <div className="text-[12px] text-white/70">kcal</div>
            </div>
          </div>
          <div className="rounded-2xl px-4 py-3 bg-white/15">
            <div className="text-[11px] text-white/70 font-medium">餐食记录</div>
            <div className="mt-1 flex items-baseline gap-1">
              <div className="text-3xl font-bold tracking-tight">{mealsRecorded}</div>
              <div className="text-[12px] text-white/70">项</div>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-white/15 px-3 py-3 text-xs leading-relaxed text-white/90 flex gap-2">
          <Info className="w-4 h-4 text-white/80 shrink-0 mt-0.5" />
          <span>{analysis}</span>
        </div>
      </div>
    </div>
  );
}
