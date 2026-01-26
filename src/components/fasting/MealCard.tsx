import { ChevronRight, Plus, Flame, Sun, UtensilsCrossed, Moon, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export type MealType = "breakfast" | "lunch" | "dinner";
export type MealStatus = "recorded" | "pending" | "active" | "error";

interface MealCardProps {
  type: MealType;
  status: MealStatus;
  foodName?: string;
  calories?: number;
  imageUrl?: string;
  tags?: string[];
  time?: string;
  onClick?: () => void;
}

const mealConfig = {
  breakfast: {
    label: "早餐",
    icon: Sun,
    timeRange: "07:00 - 09:00",
  },
  lunch: {
    label: "午餐",
    icon: UtensilsCrossed,
    timeRange: "12:00 - 13:30",
  },
  dinner: {
    label: "晚餐",
    icon: Moon,
    timeRange: "17:00 - 19:00",
  },
};

export function MealCard({
  type,
  status,
  foodName,
  calories,
  imageUrl,
  tags,
  time,
  onClick,
}: MealCardProps) {
  const config = mealConfig[type];
  const isRecorded = status === "recorded";
  const isError = status === "error";
  const Icon = config.icon;

  const styles = (() => {
    switch (type) {
      case "breakfast":
        return {
          dot: "bg-breakfast ring-breakfast/20",
          line: "bg-breakfast/20",
          pill: "bg-breakfast-light text-breakfast-foreground",
          icon: "text-breakfast bg-breakfast-light",
        };
      case "lunch":
        return {
          dot: "bg-lunch ring-lunch/20",
          line: "bg-lunch/20",
          pill: "bg-lunch-light text-lunch-foreground",
          icon: "text-lunch bg-lunch-light",
        };
      case "dinner":
        return {
          dot: "bg-dinner ring-dinner/20",
          line: "bg-dinner/20",
          pill: "bg-dinner-light text-dinner-foreground",
          icon: "text-dinner bg-dinner-light",
        };
      default:
        return {
          dot: "bg-pending/60 ring-muted",
          line: "bg-muted",
          pill: "bg-muted text-muted-foreground",
          icon: "text-muted-foreground bg-muted",
        };
    }
  })();

  return (
    <div className="w-full">
      {isRecorded ? (
        <div
          onClick={onClick}
          className={cn(
            "w-full bg-card rounded-2xl border border-border/60 shadow-card transition-all active:scale-[0.98] px-4 py-4",
            isError && "border-destructive/20"
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={cn("w-7 h-7 rounded-full flex items-center justify-center", styles.icon)}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-sm font-semibold text-foreground">{config.label}</span>
            </div>
            {time && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {time}
              </span>
            )}
          </div>
          <div className="flex gap-4 items-center">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-muted/40 shrink-0 relative flex items-center justify-center">
              {imageUrl ? (
                <img src={imageUrl} alt={foodName} className="w-full h-full object-cover" />
              ) : (
                <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center", styles.icon)}>
                  <Icon className="w-5 h-5" />
                </div>
              )}
              {isError && (
                <div className="absolute inset-0 bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className={cn("font-semibold truncate text-[15px]", isError ? "text-destructive" : "text-foreground")}>
                  {isError ? "分析失败" : foodName}
                </h4>
                <ChevronRight className="w-4 h-4 text-muted-foreground/60" />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {typeof calories === "number" && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-warning/15 text-warning inline-flex items-center gap-1">
                    <Flame className="w-3 h-3 fill-current" />
                    {calories} kcal
                  </span>
                )}
                {tags?.slice(0, 3).map((tag) => (
                  <span key={tag} className={cn("text-xs px-2 py-0.5 rounded-full", styles.pill)}>
                    {tag}
                  </span>
                ))}
              </div>
              {isError && <div className="mt-2 text-[11px] text-destructive/80">请尝试重新上传或手动记录</div>}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full bg-card rounded-2xl border border-border/60 shadow-card px-4 py-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
            <div className={cn("w-7 h-7 rounded-full flex items-center justify-center", styles.icon)}>
              <Icon className="w-4 h-4" />
            </div>
            <span>{config.label}</span>
          </div>
          <button
            onClick={onClick}
            className="w-full border border-dashed border-border/80 rounded-2xl py-4 text-muted-foreground flex items-center justify-center gap-2 hover:bg-muted/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">{`建议时间 ${config.timeRange}`}</span>
          </button>
        </div>
      )}
    </div>
  );
}
