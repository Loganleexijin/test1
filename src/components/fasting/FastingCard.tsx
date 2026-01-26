import { CircularProgress } from "./CircularProgress";
import { Pencil, Square, Zap, Droplet, Sparkles, Leaf, Play, Flame } from "lucide-react";

interface FastingCardProps {
  fastingHours: number;
  fastingMinutes: number;
  fastingSeconds?: number;
  targetHours: number;
  isInFastingWindow: boolean;
  startTime?: string;
  endTime?: string;
  onStart?: () => void;
  onEnd?: () => void;
}

export function FastingCard({
  fastingHours,
  fastingMinutes,
  fastingSeconds = 0,
  targetHours,
  isInFastingWindow,
  startTime = "今天 19:30",
  endTime = "明天 11:30",
  onStart,
  onEnd,
}: FastingCardProps) {
  const planLabel = () => {
    switch (targetHours) {
      case 12:
        return "12:12 计划";
      case 16:
        return "16:8 计划";
      case 18:
        return "18:6 计划";
      case 20:
        return "20:4 计划";
      case 23:
        return "23:1 计划";
      default:
        return "16:8 计划";
    }
  };

  const elapsedHours = fastingHours + fastingMinutes / 60 + fastingSeconds / 3600;
  const stages = [
    {
      id: "phase1",
      name: "能量储存中",
      nameEn: "Anabolic Phase",
      start: 0,
      end: 4,
      detail: "你刚刚享用完一顿美餐，身体正在消化食物并吸收营养。此时胰岛素水平升高，身体处于合成模式。",
    },
    {
      id: "phase2",
      name: "血糖平稳期",
      nameEn: "Stable Phase",
      start: 4,
      end: 8,
      detail: "胰岛素逐步下降，身体开始动用糖原储备。",
    },
    {
      id: "phase3",
      name: "高效燃脂期",
      nameEn: "Fat Burning",
      start: 8,
      end: 12,
      detail: "脂肪分解与燃烧加速，能量供应更加稳定。",
    },
    {
      id: "phase4",
      name: "细胞自噬期",
      nameEn: "Autophagy",
      start: 12,
      end: targetHours,
      detail: "细胞进入深层修复状态，代谢效率提升。",
    },
  ];
  const currentStageIndex = stages.reduce((acc, stage, index) => (elapsedHours >= stage.start ? index : acc), 0);
  const currentStage = stages[currentStageIndex];
  const nextStage = stages[currentStageIndex + 1];

  const getActiveStageId = () => {
    if (elapsedHours >= 12) return "phase4";
    if (elapsedHours >= 8) return "phase3";
    if (elapsedHours >= 4) return "phase2";
    return "phase1";
  };

  const stageTabs = [
    { id: "phase1", label: "血糖下降", icon: Droplet, active: "bg-warning/15 text-warning" },
    { id: "phase2", label: "脂肪燃烧", icon: Flame, active: "bg-success/15 text-success" },
    { id: "phase3", label: "进入酮症", icon: Zap, active: "bg-primary/15 text-primary" },
    { id: "phase4", label: "细胞自噬", icon: Leaf, active: "bg-accent/15 text-accent" },
  ];

  return (
    <div className="bg-card rounded-3xl border border-border/60 shadow-card px-5 py-6">
      <div className="flex items-center gap-2 mb-6">
        <span
          className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
            isInFastingWindow ? "text-success bg-success/10" : "text-warning bg-warning/10"
          }`}
        >
          {isInFastingWindow ? "断食中" : "进食窗口"}
        </span>
        <span className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-muted/60 text-muted-foreground text-xs font-semibold border border-border/60">
          <Zap className="w-3.5 h-3.5 text-warning" />
          {planLabel()}
        </span>
      </div>

      <div className="relative w-72 h-72 mb-6 mx-auto">
        <CircularProgress
          currentHours={fastingHours}
          currentMinutes={fastingMinutes}
          currentSeconds={fastingSeconds}
          targetHours={targetHours}
          isInFastingWindow={isInFastingWindow}
        />
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <div className="w-10 h-10 rounded-full bg-warning text-warning-foreground flex items-center justify-center shadow-card">
            <Droplet className="w-5 h-5" />
          </div>
        </div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4">
          <div className="w-9 h-9 rounded-full bg-card border border-border/60 shadow-card flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4">
          <div className="w-9 h-9 rounded-full bg-card border border-border/60 shadow-card flex items-center justify-center">
            <Leaf className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
        <div className="absolute left-1/2 bottom-0 translate-y-4 -translate-x-1/2">
          <div className="w-9 h-9 rounded-full bg-card border border-border/60 shadow-card flex items-center justify-center">
            <Zap className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 w-full mb-5">
        {stageTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = getActiveStageId() === tab.id;
          return (
            <div
              key={tab.id}
              className={`flex items-center justify-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${
                isActive ? tab.active : "bg-muted/40 text-muted-foreground border border-border/60"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </div>
          );
        })}
      </div>

      <div className="w-full bg-muted/40 border border-border/60 rounded-2xl p-4 mb-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-base font-bold text-foreground">{currentStage.name}</h3>
            <p className="text-xs text-muted-foreground font-mono">{currentStage.nameEn}</p>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {String(fastingHours).padStart(2, "0")}:{String(fastingMinutes).padStart(2, "0")}:{String(fastingSeconds).padStart(2, "0")} / {targetHours}:00:00
          </span>
        </div>
        {nextStage && (
          <div className="text-xs text-muted-foreground mb-3 flex items-center justify-between">
            <span>下一阶段: {nextStage.name}</span>
            <span>{(nextStage.start - elapsedHours).toFixed(1)} 小时后</span>
          </div>
        )}
        <div className="bg-warning/10 border border-warning/20 rounded-2xl p-3">
          <div className="flex gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 shrink-0"></div>
            <p className="text-xs text-muted-foreground leading-relaxed">{currentStage.detail}</p>
          </div>
        </div>
      </div>

      <div className="w-full mb-6">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-2 px-1">
          <span>开始时间</span>
          <span>结束时间</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center justify-between bg-card rounded-full py-3 px-4 border border-border/60 shadow-card">
            <span className="text-sm font-semibold text-foreground">{startTime}</span>
            <Pencil className="w-3.5 h-3.5 text-success" />
          </div>
          <div className="flex-1 flex items-center justify-between bg-card rounded-full py-3 px-4 border border-border/60 shadow-card">
            <span className="text-sm font-semibold text-foreground">{endTime}</span>
            <Pencil className="w-3.5 h-3.5 text-success" />
          </div>
        </div>
      </div>

      <div className="w-full">
        {isInFastingWindow ? (
          <button
            type="button"
            onClick={onEnd}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-foreground text-background rounded-2xl shadow-card active:scale-95 transition-all font-semibold text-base"
          >
            <Square className="w-4 h-4 fill-current" />
            结束断食
          </button>
        ) : (
          <button
            type="button"
            onClick={onStart}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-warning text-warning-foreground rounded-2xl shadow-card active:scale-95 transition-all font-semibold text-base"
          >
            <Play className="w-5 h-5 fill-current" />
            开始断食
          </button>
        )}
      </div>
    </div>
  );
}
