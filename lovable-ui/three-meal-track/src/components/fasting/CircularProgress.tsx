import { cn } from "@/lib/utils";
import { Droplet, Flame, Zap, Sparkles } from "lucide-react";

interface FastingPhase {
  id: string;
  name: string;
  icon: React.ElementType;
  position: number; // 0-100 表示在圆环上的位置百分比
  targetHour: number; // 达到该阶段需要的小时数
  description: string;
}

const FASTING_PHASES: FastingPhase[] = [
  {
    id: "blood-sugar",
    name: "血糖下降",
    icon: Droplet,
    position: 0,
    targetHour: 0,
    description: "血糖开始下降",
  },
  {
    id: "fat-burning",
    name: "脂肪燃烧",
    icon: Flame,
    position: 25,
    targetHour: 4,
    description: "开始消耗脂肪",
  },
  {
    id: "ketosis",
    name: "进入酮症",
    icon: Zap,
    position: 50,
    targetHour: 8,
    description: "酮体生成增加",
  },
  {
    id: "autophagy",
    name: "细胞自噬",
    icon: Sparkles,
    position: 75,
    targetHour: 12,
    description: "细胞自我修复",
  },
];

interface CircularProgressProps {
  currentHours: number;
  currentMinutes: number;
  currentSeconds?: number;
  targetHours: number;
  isInFastingWindow: boolean;
}

type PhaseStatus = "completed" | "active" | "pending";

function getPhaseStatus(
  phase: FastingPhase,
  currentHours: number,
  phases: FastingPhase[]
): PhaseStatus {
  const currentIndex = phases.findIndex((p) => p.id === phase.id);
  const nextPhase = phases[currentIndex + 1];

  if (nextPhase && currentHours >= nextPhase.targetHour) {
    return "completed";
  }
  if (currentHours >= phase.targetHour) {
    if (!nextPhase || currentHours < nextPhase.targetHour) {
      return "active";
    }
    return "completed";
  }
  return "pending";
}

function getCurrentPhaseName(currentHours: number): string {
  if (currentHours >= 12) return "细胞自噬期";
  if (currentHours >= 8) return "酮症期";
  if (currentHours >= 4) return "脂肪燃烧期";
  return "血糖下降期";
}

export function CircularProgress({
  currentHours,
  currentMinutes,
  currentSeconds = 0,
  targetHours,
  isInFastingWindow,
}: CircularProgressProps) {
  const progress = Math.min(
    ((currentHours + currentMinutes / 60) / targetHours) * 100,
    100
  );

  // SVG 参数
  const size = 280;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // 圆心
  const center = size / 2;

  // 计算节点在圆环上的位置
  const getNodePosition = (positionPercent: number) => {
    // 从顶部开始（-90度），顺时针方向
    const angle = ((positionPercent / 100) * 360 - 90) * (Math.PI / 180);
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  return (
    <div className="flex flex-col items-center">
      {/* 状态标签 */}
      <div className="flex items-center gap-2 mb-6">
        <span
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium",
            isInFastingWindow
              ? "bg-primary/10 text-primary"
              : "bg-warning/10 text-warning"
          )}
        >
          {isInFastingWindow ? "断食中" : "进食窗口"}
        </span>
        <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-muted text-muted-foreground flex items-center gap-1">
          <Zap className="w-3.5 h-3.5" />
          16:8 计划
        </span>
      </div>

      {/* 圆环进度条 */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
          style={{ filter: "drop-shadow(0 4px 20px hsl(var(--primary) / 0.15))" }}
        >
          {/* 定义渐变 */}
          <defs>
            <linearGradient
              id="progressGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="hsl(var(--breakfast))" />
              <stop offset="50%" stopColor="hsl(var(--warning))" />
              <stop offset="100%" stopColor="hsl(var(--primary))" />
            </linearGradient>
            <linearGradient
              id="trackGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="hsl(var(--muted))" />
              <stop offset="100%" stopColor="hsl(var(--border))" />
            </linearGradient>
            {/* 发光效果 */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 背景轨道 */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="url(#trackGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            opacity="0.3"
          />

          {/* 进度条 */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-300 ease-out"
            filter="url(#glow)"
          />
        </svg>

        {/* 阶段节点 */}
        {FASTING_PHASES.map((phase) => {
          const pos = getNodePosition(phase.position);
          const status = getPhaseStatus(phase, currentHours, FASTING_PHASES);
          const Icon = phase.icon;

          return (
            <div
              key={phase.id}
              className={cn(
                "absolute w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 transform -translate-x-1/2 -translate-y-1/2",
                status === "completed" &&
                  "bg-primary text-primary-foreground shadow-lg scale-100",
                status === "active" &&
                  "bg-warning text-white shadow-lg animate-pulse-soft scale-110 ring-4 ring-warning/30",
                status === "pending" &&
                  "bg-card text-muted-foreground border-2 border-border scale-90 opacity-60"
              )}
              style={{
                left: pos.x,
                top: pos.y,
              }}
            >
              <Icon className="w-5 h-5" />
            </div>
          );
        })}

        {/* 中心内容 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* 进度百分比 */}
          <div className="text-sm text-muted-foreground mb-1">
            {Math.round(progress)}%
          </div>
          <div className="text-xs text-muted-foreground/70 mb-2">剩余时间</div>

          {/* 时间显示 */}
          <div className="flex items-baseline justify-center font-bold tracking-tight">
            <span className="text-5xl text-foreground">
              {String(currentHours).padStart(2, "0")}
            </span>
            <span className="text-3xl text-muted-foreground mx-1">:</span>
            <span className="text-5xl text-foreground">
              {String(currentMinutes).padStart(2, "0")}
            </span>
            <span className="text-3xl text-muted-foreground mx-1">:</span>
            <span className="text-5xl text-foreground">
              {String(currentSeconds).padStart(2, "0")}
            </span>
          </div>

          {/* 当前阶段 */}
          <div className="mt-3 text-center">
            <div className="text-sm font-medium text-warning">
              {getCurrentPhaseName(currentHours)}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              身体正在适应中
            </div>
          </div>
        </div>
      </div>

      {/* 阶段图例 */}
      <div className="mt-6 grid grid-cols-4 gap-2 w-full max-w-xs">
        {FASTING_PHASES.map((phase) => {
          const status = getPhaseStatus(phase, currentHours, FASTING_PHASES);
          const Icon = phase.icon;

          return (
            <div
              key={phase.id}
              className={cn(
                "flex flex-col items-center text-center p-2 rounded-lg transition-all",
                status === "active" && "bg-warning/10"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 mb-1",
                  status === "completed" && "text-primary",
                  status === "active" && "text-warning",
                  status === "pending" && "text-muted-foreground/50"
                )}
              />
              <span
                className={cn(
                  "text-[10px] leading-tight",
                  status === "completed" && "text-primary font-medium",
                  status === "active" && "text-warning font-medium",
                  status === "pending" && "text-muted-foreground/60"
                )}
              >
                {phase.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
