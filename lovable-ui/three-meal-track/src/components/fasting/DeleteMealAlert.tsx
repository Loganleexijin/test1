import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';

interface DeleteMealAlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealName?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteMealAlert({
  open,
  onOpenChange,
  mealName,
  onConfirm,
  onCancel,
}: DeleteMealAlertProps) {
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
              <div className="p-3 bg-destructive/10 rounded-full">
                <Trash2 className="w-8 h-8 text-destructive" />
              </div>
            </div>

            {/* 标题 */}
            <h3 className="text-lg font-semibold text-foreground text-center mb-2">
              删除这条记录？
            </h3>

            {/* 正文 */}
            <p className="text-muted-foreground text-center mb-6">
              {mealName ? (
                <>删除「{mealName}」后无法恢复</>
              ) : (
                '删除后无法恢复'
              )}
            </p>

            {/* 按钮区域 */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  onConfirm();
                  onOpenChange(false);
                }}
                className="w-full py-3 bg-destructive text-destructive-foreground rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                确认删除
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
