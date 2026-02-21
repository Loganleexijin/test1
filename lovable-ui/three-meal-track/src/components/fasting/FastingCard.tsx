import { CircularProgress } from "./CircularProgress";
import { Calendar, Pencil, Play, Square } from "lucide-react";
import { useFastingStore } from "@/stores/fastingStore";
import { toast } from "@/hooks/use-toast";

interface FastingCardProps {
  fastingHours: number;
  fastingMinutes: number;
  fastingSeconds?: number;
  targetHours: number;
  isInFastingWindow: boolean;
  startTime?: string;
  endTime?: string;
  onStartFasting?: () => void;
  onAddRecord?: () => void;
  onOpenHistory?: () => void;
}

export function FastingCard({
  fastingHours,
  fastingMinutes,
  fastingSeconds = 0,
  targetHours,
  isInFastingWindow,
  startTime = "今天 19:30",
  endTime = "明天 11:30",
  onStartFasting,
  onAddRecord,
  onOpenHistory,
}: FastingCardProps) {
  const { setShowFastingComplete, setShowEarlyEndConfirm } = useFastingStore();

  const handleEndFasting = () => {
    const totalMinutes = fastingHours * 60 + fastingMinutes;
    const targetMinutes = targetHours * 60;

    if (totalMinutes >= targetMinutes) {
      // 达成目标 → 显示全屏庆祝卡
      setShowFastingComplete(true);
    } else if (totalMinutes > 30) {
      // 超过30分钟但未达标 → 显示确认抽屉
      setShowEarlyEndConfirm(true);
    } else {
      // 少于30分钟 → Toast 提示
      toast({
        title: "断食时间过短",
        description: "断食需超过30分钟才会被记录",
      });
    }
  };
  return (
    <div className="bg-card rounded-2xl shadow-card animate-slide-up overflow-hidden">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
        <h2 className="text-lg font-semibold text-foreground">Flux</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (onAddRecord) {
                onAddRecord();
              }
            }}
            className="px-3 py-1.5 rounded-lg bg-muted text-sm text-muted-foreground hover:bg-muted/80 transition-colors"
          >
            补录断食
          </button>
          <button
            onClick={() => {
              if (onOpenHistory) {
                onOpenHistory();
              }
            }}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Calendar className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* 圆环进度 */}
      <div className="px-5 py-6">
        <CircularProgress
          currentHours={fastingHours}
          currentMinutes={fastingMinutes}
          currentSeconds={fastingSeconds}
          targetHours={targetHours}
          isInFastingWindow={isInFastingWindow}
        />
      </div>

      {/* 当前阶段信息 */}
      <div className="mx-5 p-4 bg-muted/50 rounded-xl mb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-semibold text-foreground">能量储存中</h3>
            <p className="text-xs text-muted-foreground">Anabolic Phase</p>
          </div>
          <span className="text-sm text-muted-foreground">
            {String(fastingHours).padStart(2, "0")}:{String(fastingMinutes).padStart(2, "0")}:
            {String(fastingSeconds).padStart(2, "0")} / {targetHours}:00:00
          </span>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground mt-3 pt-3 border-t border-border/50">
          <span>下一阶段: 血糖平稳期</span>
          <span>4.0 小时后</span>
        </div>

        {/* AI 提示 */}
        <div className="mt-4 p-3 bg-warning/5 rounded-lg border border-warning/20">
          <p className="text-sm text-foreground/80 leading-relaxed">
            <span className="text-warning mr-1">○</span>
            你刚刚享用完一顿美餐，身体正在消化食物并吸收营养。此时胰岛素水平升高，身体处于"合成模式"。
          </p>
        </div>
      </div>

      {/* 开始/结束时间 */}
      <div className="mx-5 mb-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">开始时间</p>
          <div className="flex items-center justify-between bg-muted/30 rounded-xl px-4 py-3">
            <span className="text-foreground font-medium">{startTime}</span>
            <button className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors">
              <Pencil className="w-4 h-4 text-primary" />
            </button>
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">结束时间</p>
          <div className="flex items-center justify-between bg-muted/30 rounded-xl px-4 py-3">
            <span className="text-foreground font-medium">{endTime}</span>
            <button className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors">
              <Pencil className="w-4 h-4 text-primary" />
            </button>
          </div>
        </div>
      </div>

      {/* 结束断食按钮 */}
      <div className="px-5 pb-5">
        <button
          onClick={() => {
            if (isInFastingWindow) {
              handleEndFasting();
              return;
            }
            if (!onStartFasting) {
              toast({ title: "暂不可用", description: "开始断食入口尚未配置" });
              return;
            }
            onStartFasting();
          }}
          className="w-full py-4 bg-foreground text-background rounded-2xl font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          {isInFastingWindow ? (
            <>
              <Square className="w-4 h-4" />
              结束断食
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              开始断食
            </>
          )}
        </button>
      </div>
    </div>
  );
}
