import { useState, useEffect } from 'react';
import { X, Clock, Flame, FileText, Pencil, Trash2 } from 'lucide-react';

interface MealDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meal: {
    id: string;
    name: string;
    time: string;
    calories?: number;
    note?: string;
    imageUrl?: string;
    type: 'breakfast' | 'lunch' | 'dinner';
  };
  onEdit: () => void;
  onDelete: () => void;
}

const MEAL_TYPE_LABELS = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
};

const MEAL_TYPE_COLORS = {
  breakfast: 'breakfast',
  lunch: 'lunch',
  dinner: 'dinner',
};

export function MealDetailDrawer({
  open,
  onOpenChange,
  meal,
  onEdit,
  onDelete,
}: MealDetailDrawerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [open]);

  if (!open) return null;

  const mealColor = MEAL_TYPE_COLORS[meal.type];

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

        <div className="px-6 pb-8 pt-2">
          {/* 标题栏 */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">餐食详情</h2>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* 图片（如果有） */}
          {meal.imageUrl && (
            <div className="mb-4 rounded-2xl overflow-hidden">
              <img
                src={meal.imageUrl}
                alt={meal.name}
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          {/* 餐食信息 */}
          <div className="space-y-4 mb-6">
            {/* 名称和类型 */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${mealColor}-light text-${mealColor}-foreground`}>
                  {MEAL_TYPE_LABELS[meal.type]}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-foreground">{meal.name}</h3>
            </div>

            {/* 时间 */}
            <div className="flex items-center gap-3 text-muted-foreground">
              <Clock className="w-5 h-5" />
              <span>{meal.time}</span>
            </div>

            {/* 热量（如果有） */}
            {meal.calories !== undefined && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Flame className="w-5 h-5" />
                <span>{meal.calories} 千卡</span>
              </div>
            )}

            {/* 备注（如果有） */}
            {meal.note && (
              <div className="flex items-start gap-3 text-muted-foreground">
                <FileText className="w-5 h-5 mt-0.5" />
                <span className="flex-1">{meal.note}</span>
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="space-y-3">
            <button
              onClick={() => {
                onEdit();
                onOpenChange(false);
              }}
              className="w-full py-4 bg-foreground text-background rounded-2xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Pencil className="w-4 h-4" />
              编辑
            </button>
            <button
              onClick={onDelete}
              className="w-full py-3 text-destructive hover:text-destructive/80 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              删除
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
