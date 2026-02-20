import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface TimeConflictAlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflictTimeRange: string; // 如 "08:00-16:00"
  onModify: () => void;
  onCancel: () => void;
  onOverwrite?: () => void; // 可选的覆盖保存
}

export function TimeConflictAlert({
  open,
  onOpenChange,
  conflictTimeRange,
  onModify,
  onCancel,
  onOverwrite,
}: TimeConflictAlertProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* 背景遮罩 - 不允许点击关闭 */}
      <div
        className={`fixed inset-0 z-50 bg-foreground/50 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* 居中弹框 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div
          className={`w-full max-w-sm bg-background rounded-2xl shadow-xl transition-all duration-300 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <div className="p-6">
            {/* 图标 */}
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-warning/10 rounded-full">
                <AlertTriangle className="w-8 h-8 text-warning" />
              </div>
            </div>

            {/* 标题 */}
            <h3 className="text-lg font-semibold text-foreground text-center mb-2">
              时间冲突
            </h3>

            {/* 正文 */}
            <p className="text-muted-foreground text-center mb-6">
              与你的 <span className="text-foreground font-medium">"{conflictTimeRange}"</span> 记录重叠
            </p>

            {/* 按钮区域 */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  onModify();
                  onOpenChange(false);
                }}
                className="w-full py-3 bg-foreground text-background rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                去修改
              </button>
              <button
                onClick={() => {
                  onCancel();
                  onOpenChange(false);
                }}
                className="w-full py-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                取消
              </button>
              {onOverwrite && (
                <button
                  onClick={() => {
                    onOverwrite();
                    onOpenChange(false);
                  }}
                  className="w-full py-2 text-sm text-destructive/70 hover:text-destructive transition-colors"
                >
                  覆盖保存
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
