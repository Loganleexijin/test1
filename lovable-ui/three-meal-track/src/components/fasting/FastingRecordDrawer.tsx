import { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';

interface FastingRecordDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit';
  initialData?: {
    startTime: Date;
    endTime: Date;
    note?: string;
  };
  onSave: (data: { startTime: Date; endTime: Date; note?: string }) => void;
  onConflict?: (conflictInfo: string) => void;
}

export function FastingRecordDrawer({
  open,
  onOpenChange,
  mode,
  initialData,
  onSave,
  onConflict,
}: FastingRecordDrawerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setStartDate(formatDateForInput(initialData.startTime));
        setStartTime(formatTimeForInput(initialData.startTime));
        setEndDate(formatDateForInput(initialData.endTime));
        setEndTime(formatTimeForInput(initialData.endTime));
        setNote(initialData.note || '');
      } else {
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(20, 0, 0, 0);
        
        setStartDate(formatDateForInput(yesterday));
        setStartTime('20:00');
        setEndDate(formatDateForInput(now));
        setEndTime(formatTimeForInput(now));
        setNote('');
      }
      setError(null);
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [open, initialData]);

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const formatTimeForInput = (date: Date) => {
    return date.toTimeString().slice(0, 5);
  };

  const parseDateTime = (dateStr: string, timeStr: string) => {
    return new Date(`${dateStr}T${timeStr}`);
  };

  const validateAndSave = () => {
    setError(null);

    const start = parseDateTime(startDate, startTime);
    const end = parseDateTime(endDate, endTime);

    // 校验：结束必须 > 开始
    if (end <= start) {
      setError('结束时间必须晚于开始时间');
      return;
    }

    // 校验：时长合理性（如最长 72 小时）
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    if (durationHours > 72) {
      setError('断食时长不能超过 72 小时');
      return;
    }

    // TODO: 检查与已有记录冲突
    // if (hasConflict) {
    //   onConflict?.('08:00-16:00');
    //   return;
    // }

    onSave({
      startTime: start,
      endTime: end,
      note: note.trim() || undefined,
    });
    onOpenChange(false);
  };

  if (!open) return null;

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
        className={`fixed bottom-0 inset-x-0 z-50 bg-background rounded-t-3xl transition-transform duration-300 max-h-[80vh] ${
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
            {mode === 'add' ? '补录断食' : '编辑断食'}
          </h2>

          {/* 开始时间 */}
          <div className="mb-4">
            <label className="text-sm text-muted-foreground mb-2 block">
              开始时间 <span className="text-destructive">*</span>
            </label>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="w-28 relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          {/* 结束时间 */}
          <div className="mb-4">
            <label className="text-sm text-muted-foreground mb-2 block">
              结束时间 <span className="text-destructive">*</span>
            </label>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="w-28 relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          {/* 备注 */}
          <div className="mb-6">
            <label className="text-sm text-muted-foreground mb-2 block">
              备注（可选）
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="添加备注..."
              rows={3}
              className="w-full px-4 py-3 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* 按钮区域 */}
          <div className="space-y-3">
            <button
              onClick={validateAndSave}
              className="w-full py-4 bg-foreground text-background rounded-2xl font-medium hover:opacity-90 transition-opacity"
            >
              保存
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
