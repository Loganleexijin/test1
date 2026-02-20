import { useState, useEffect } from 'react';
import { Clock, ChevronDown } from 'lucide-react';

interface StartFastingDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: (plan: string, startTime: Date, endTime: Date) => void;
}

const FASTING_PLANS = [
  { id: '14:10', label: '14:10', fastingHours: 14 },
  { id: '16:8', label: '16:8', fastingHours: 16 },
  { id: '18:6', label: '18:6', fastingHours: 18 },
];

export function StartFastingDrawer({
  open,
  onOpenChange,
  onStart,
}: StartFastingDrawerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('16:8');
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [isEditingEndTime, setIsEditingEndTime] = useState(false);
  const [customEndTime, setCustomEndTime] = useState<Date | null>(null);

  useEffect(() => {
    if (open) {
      setStartTime(new Date());
      setCustomEndTime(null);
      setIsEditingEndTime(false);
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [open]);

  if (!open) return null;

  const selectedPlanData = FASTING_PLANS.find(p => p.id === selectedPlan);
  const fastingHours = selectedPlanData?.fastingHours || 16;

  const calculatedEndTime = customEndTime || new Date(startTime.getTime() + fastingHours * 60 * 60 * 1000);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return '今天';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return '明天';
    }
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const handleStart = () => {
    onStart(selectedPlan, startTime, calculatedEndTime);
    onOpenChange(false);
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
        className={`fixed bottom-0 inset-x-0 z-50 bg-background rounded-t-3xl transition-transform duration-300 max-h-[60vh] ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* 拖动指示器 */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        <div className="px-6 pb-8 pt-2 overflow-y-auto">
          {/* 标题 */}
          <h2 className="text-xl font-semibold text-foreground text-center mb-6">
            开始断食
          </h2>

          {/* 计划选择 - 胶囊 Tabs */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-3">选择断食计划</p>
            <div className="flex gap-2 p-1 bg-muted rounded-xl">
              {FASTING_PLANS.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                    selectedPlan === plan.id
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {plan.label}
                </button>
              ))}
            </div>
          </div>

          {/* 开始时间 */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">开始时间</p>
            <div className="flex items-center justify-between bg-card rounded-xl px-4 py-3 border border-border">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-foreground font-medium">
                  {formatDate(startTime)} {formatTime(startTime)}
                </span>
              </div>
              <input
                type="time"
                value={formatTime(startTime)}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(':');
                  const newTime = new Date(startTime);
                  newTime.setHours(parseInt(hours), parseInt(minutes));
                  setStartTime(newTime);
                }}
                className="opacity-0 absolute w-0 h-0"
              />
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>

          {/* 预计结束时间 */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">预计结束</p>
              {!isEditingEndTime && (
                <button
                  onClick={() => setIsEditingEndTime(true)}
                  className="text-xs text-primary"
                >
                  编辑
                </button>
              )}
            </div>
            <div className="flex items-center justify-between bg-muted/50 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <span className="text-foreground font-medium">
                  {formatDate(calculatedEndTime)} {formatTime(calculatedEndTime)}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {fastingHours} 小时后
              </span>
            </div>
          </div>

          {/* 按钮区域 */}
          <div className="space-y-3">
            <button
              onClick={handleStart}
              className="w-full py-4 bg-foreground text-background rounded-2xl font-medium hover:opacity-90 transition-opacity"
            >
              开始
            </button>
            <button
              onClick={() => onOpenChange(false)}
              className="w-full py-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
