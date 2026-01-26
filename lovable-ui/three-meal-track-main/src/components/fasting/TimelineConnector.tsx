import { cn } from "@/lib/utils";
import type { MealType, MealStatus } from "./MealCard";

interface TimelineConnectorProps {
  fromType: MealType;
  toType: MealType;
  fromStatus: MealStatus;
  toStatus: MealStatus;
}

export function TimelineConnector({
  fromType,
  fromStatus,
}: TimelineConnectorProps) {
  const isActive = fromStatus === "active" || fromStatus === "recorded";

  return (
    <div className="flex items-center justify-center py-1">
      <div className="relative flex flex-col items-center">
        {/* 渐变连接线 */}
        <div
          className={cn(
            "w-0.5 h-6 rounded-full transition-all duration-500",
            isActive
              ? [
                  fromType === "breakfast" && "bg-gradient-to-b from-breakfast/60 to-lunch/30",
                  fromType === "lunch" && "bg-gradient-to-b from-lunch/60 to-dinner/30",
                  fromType === "dinner" && "bg-gradient-to-b from-dinner/60 to-breakfast/30",
                ]
              : "bg-gradient-to-b from-muted-foreground/20 to-muted-foreground/10"
          )}
        />
        {/* 中间点 */}
        <div
          className={cn(
            "w-2 h-2 rounded-full my-1 transition-all duration-500",
            isActive
              ? [
                  fromType === "breakfast" && "bg-breakfast/40",
                  fromType === "lunch" && "bg-lunch/40",
                  fromType === "dinner" && "bg-dinner/40",
                ]
              : "bg-muted-foreground/20"
          )}
        />
        <div
          className={cn(
            "w-0.5 h-6 rounded-full transition-all duration-500",
            isActive
              ? [
                  fromType === "breakfast" && "bg-gradient-to-b from-lunch/30 to-lunch/60",
                  fromType === "lunch" && "bg-gradient-to-b from-dinner/30 to-dinner/60",
                  fromType === "dinner" && "bg-gradient-to-b from-breakfast/30 to-breakfast/60",
                ]
              : "bg-gradient-to-b from-muted-foreground/10 to-muted-foreground/20"
          )}
        />
      </div>
    </div>
  );
}
