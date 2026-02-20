import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface EndFastingConfirmDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDuration: { hours: number; minutes: number };
  targetHours: number;
  onConfirmEnd: (reason?: string) => void;
  onContinue: () => void;
}

const END_REASONS = [
  { id: 'hungry', label: '饿了' },
  { id: 'social', label: '社交' },
  { id: 'discomfort', label: '不适' },
  { id: 'other', label: '其他' },
];

export function EndFastingConfirmDrawer({
  open,
  onOpenChange,
  currentDuration,
  targetHours,
  onConfirmEnd,
  onContinue,
}: EndFastingConfirmDrawerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSelectedReason(null);
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [open]);

  if (!open) return null;

  const totalMinutes = currentDuration.hours * 60 + currentDuration.minutes;
  const targetMinutes = targetHours * 60;
  const isCompleted = totalMinutes >= targetMinutes;
  const completionRate = Math.min(100, Math.round((totalMinutes / targetMinutes) * 100));

  const formatDuration = (hours: number, minutes: number) => {
    return `${hours}小时${minutes.toString().padStart(2, '0')}分钟`;
  };

  const handleConfirm = () => {
    const reason = selectedReason ? END_REASONS.find(r => r.id === selectedReason)?.label : undefined;
    onConfirmEnd(reason);
  };

  return (
    <>
      {/* 背景遮罩 */}
      <div
        className={`fixed inset-0 z-40 bg-foreground/50 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={() => onOpenChange(false)}
      />

      {/* 底部抽屉 */}
      <div
        className={`fixed bottom-0 inset-x-0 z-50 bg-background rounded-t-3xl transition-transform duration-300 ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* 拖动指示器 */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        <div className="px-6 pb-8 pt-2">
          {/* 标题 */}
          <h2 className="text-xl font-semibold text-foreground text-center mb-6">
            结束断食
          </h2>

          {/* 关键数据卡 */}
          <div className="bg-card rounded-2xl p-5 mb-5 border border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-muted-foreground">本次时长</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                isCompleted 
                  ? 'bg-success/10 text-success' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {isCompleted ? (
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3" /> 已达标
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <X className="w-3 h-3" /> 未达标
                  </span>
                )}
              </span>
            </div>
            <p className="text-3xl font-bold text-foreground mb-2">
              {formatDuration(currentDuration.hours, currentDuration.minutes)}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    isCompleted ? 'bg-success' : 'bg-primary'
                  }`}
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <span className="text-sm text-muted-foreground">{completionRate}%</span>
            </div>
          </div>

          {/* 提前结束原因 - 仅未达标时显示 */}
          {!isCompleted && (
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-3">提前结束原因（可选）</p>
              <div className="flex flex-wrap gap-2">
                {END_REASONS.map((reason) => (
                  <button
                    key={reason.id}
                    onClick={() => setSelectedReason(
                      selectedReason === reason.id ? null : reason.id
                    )}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      selectedReason === reason.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {reason.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 按钮区域 */}
          <div className="space-y-3">
            <button
              onClick={handleConfirm}
              className="w-full py-4 bg-foreground text-background rounded-2xl font-medium hover:opacity-90 transition-opacity"
            >
              确认结束
            </button>
            <button
              onClick={onContinue}
              className="w-full py-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              继续断食
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
