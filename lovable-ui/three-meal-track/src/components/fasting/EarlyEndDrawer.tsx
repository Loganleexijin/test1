import { useState, useEffect } from 'react';

interface EarlyEndDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDuration: { hours: number; minutes: number };
  targetHours: number;
  onContinue: () => void;
  onConfirmEnd: (reason?: string) => void;
}

const END_REASONS = [
  { id: 'discomfort', label: '感到不适' },
  { id: 'social', label: '有聚餐安排' },
  { id: 'other', label: '其他原因' },
];

export function EarlyEndDrawer({
  open,
  onOpenChange,
  currentDuration,
  targetHours,
  onContinue,
  onConfirmEnd,
}: EarlyEndDrawerProps) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      // 延迟一帧以触发动画
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      setIsVisible(false);
      setSelectedReason(null);
    }
  }, [open]);

  if (!open) return null;

  const currentMinutes = currentDuration.hours * 60 + currentDuration.minutes;
  const targetMinutes = targetHours * 60;
  const remainingMinutes = targetMinutes - currentMinutes;
  const remainingHours = Math.floor(remainingMinutes / 60);
  const remainingMins = remainingMinutes % 60;

  const formatDuration = (hours: number, minutes: number) => {
    return `${hours}小时${minutes.toString().padStart(2, '0')}分钟`;
  };

  const handleConfirmEnd = () => {
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
          <h2 className="text-xl font-semibold text-foreground text-center mb-4">
            提前结束断食？
          </h2>

          {/* 说明文字 */}
          <p className="text-center text-muted-foreground mb-6 leading-relaxed">
            你已坚持 <span className="text-foreground font-medium">{formatDuration(currentDuration.hours, currentDuration.minutes)}</span>，
            <br />
            距离目标还有 <span className="text-foreground font-medium">{formatDuration(remainingHours, remainingMins)}</span>。
            <br />
            确定要结束吗？
          </p>

          {/* 原因选择 */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-3">原因选择（可选）：</p>
            <div className="space-y-2">
              {END_REASONS.map((reason) => (
                <button
                  key={reason.id}
                  onClick={() => setSelectedReason(selectedReason === reason.id ? null : reason.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                    selectedReason === reason.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:bg-muted/50'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selectedReason === reason.id
                        ? 'border-primary'
                        : 'border-muted-foreground/40'
                    }`}
                  >
                    {selectedReason === reason.id && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <span className="text-foreground">{reason.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 按钮区域 */}
          <div className="space-y-3">
            <button
              onClick={onContinue}
              className="w-full py-4 bg-foreground text-background rounded-2xl font-medium hover:opacity-90 transition-opacity"
            >
              继续坚持
            </button>
            <button
              onClick={handleConfirmEnd}
              className="w-full py-3 text-destructive hover:text-destructive/80 transition-colors font-medium"
            >
              确认结束
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
