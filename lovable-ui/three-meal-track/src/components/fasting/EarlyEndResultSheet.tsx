import { useEffect, useState } from 'react';
import { X, Lightbulb } from 'lucide-react';

interface EarlyEndResultSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fastingDuration: { hours: number; minutes: number };
  targetHours: number;
  onStartEating: () => void;
  onAdjustPlan: () => void;
}

export function EarlyEndResultSheet({
  open,
  onOpenChange,
  fastingDuration,
  targetHours,
  onStartEating,
  onAdjustPlan,
}: EarlyEndResultSheetProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [open]);

  if (!open) return null;

  const totalMinutes = fastingDuration.hours * 60 + fastingDuration.minutes;
  const targetMinutes = targetHours * 60;
  const remainingMinutes = targetMinutes - totalMinutes;
  const remainingHours = Math.floor(remainingMinutes / 60);
  const remainingMins = remainingMinutes % 60;

  const formatDuration = (hours: number, minutes: number) => {
    if (hours === 0) return `${minutes}分钟`;
    if (minutes === 0) return `${hours}小时`;
    return `${hours}小时${minutes}分钟`;
  };

  // 推荐更容易的计划
  const getSuggestedPlan = () => {
    if (fastingDuration.hours >= 14) return null; // 已经接近目标
    if (fastingDuration.hours >= 12) return '14:10';
    if (fastingDuration.hours >= 10) return '12:12';
    return '14:10';
  };

  const suggestedPlan = getSuggestedPlan();

  return (
    <div
      className={`fixed inset-0 z-50 bg-background transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      {/* 顶部关闭按钮 */}
      <div className="flex justify-end p-4">
        <button
          onClick={() => onOpenChange(false)}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <X className="w-6 h-6 text-muted-foreground" />
        </button>
      </div>

      {/* 主内容 */}
      <div className="flex flex-col h-[calc(100%-60px)] px-6 pb-8">
        {/* 标题区域 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">已结束断食</h1>
          <p className="text-muted-foreground">
            本次未达目标，但每一次尝试都是进步
          </p>
        </div>

        {/* 时长展示 */}
        <div className="text-center mb-6">
          <p className="text-5xl font-bold text-foreground mb-2">
            {formatDuration(fastingDuration.hours, fastingDuration.minutes)}
          </p>
          <p className="text-muted-foreground">
            未达目标，还差 {formatDuration(remainingHours, remainingMins)}
          </p>
        </div>

        {/* 建议卡片 */}
        {suggestedPlan && (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Lightbulb className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">调整建议</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  下次可以尝试 <span className="text-primary font-medium">{suggestedPlan}</span> 计划，
                  循序渐进更容易坚持。每个人的节奏不同，找到适合自己的才是最好的。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 鼓励文案 */}
        <div className="flex-1 flex items-center justify-center">
          <p className="text-center text-muted-foreground leading-relaxed px-4">
            断食是一个渐进的过程，
            <br />
            不必苛求完美，重要的是持续前进。
          </p>
        </div>

        {/* 底部按钮区域 */}
        <div className="mt-auto space-y-3">
          <button
            onClick={onStartEating}
            className="w-full py-4 bg-foreground text-background rounded-2xl font-medium hover:opacity-90 transition-opacity"
          >
            进入进食窗口
          </button>
          {suggestedPlan && (
            <button
              onClick={onAdjustPlan}
              className="w-full py-3 text-primary hover:text-primary/80 transition-colors font-medium"
            >
              调整计划
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
