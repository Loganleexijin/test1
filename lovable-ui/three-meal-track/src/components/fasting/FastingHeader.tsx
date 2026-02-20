import { Timer, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FastingHeaderProps {
  fastingHours: number;
  fastingMinutes: number;
  targetHours: number;
  isInFastingWindow: boolean;
}

export function FastingHeader({
  fastingHours,
  fastingMinutes,
  targetHours,
  isInFastingWindow,
}: FastingHeaderProps) {
  const progress = Math.min((fastingHours / targetHours) * 100, 100);

  return (
    <div className="bg-card rounded-2xl p-5 shadow-card animate-slide-up">
      {/* 顶部信息 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "p-2 rounded-xl",
              isInFastingWindow ? "bg-primary/10" : "bg-warning/10"
            )}
          >
            <Timer
              className={cn(
                "w-5 h-5",
                isInFastingWindow ? "text-primary" : "text-warning"
              )}
            />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">
              {isInFastingWindow ? "断食进行中" : "进食窗口"}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground/70">
              <span>16:8 模式</span>
              <ChevronDown className="w-3 h-3" />
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-foreground">
              {String(fastingHours).padStart(2, "0")}
            </span>
            <span className="text-muted-foreground">:</span>
            <span className="text-3xl font-bold text-foreground">
              {String(fastingMinutes).padStart(2, "0")}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            目标 {targetHours} 小时
          </div>
        </div>
      </div>

      {/* 进度条 */}
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-all duration-1000",
            isInFastingWindow
              ? "bg-gradient-to-r from-primary to-accent"
              : "bg-gradient-to-r from-warning to-breakfast"
          )}
          style={{ width: `${progress}%` }}
        />
        {/* 光晕效果 */}
        <div
          className={cn(
            "absolute inset-y-0 w-8 rounded-full blur-sm transition-all duration-1000",
            isInFastingWindow ? "bg-primary/50" : "bg-warning/50"
          )}
          style={{ left: `calc(${progress}% - 1rem)` }}
        />
      </div>

      {/* 时间标记 */}
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <span>开始 20:00</span>
        <span>结束 12:00</span>
      </div>
    </div>
  );
}
