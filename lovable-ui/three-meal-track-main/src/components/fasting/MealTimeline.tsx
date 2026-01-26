import { MealCard, type MealStatus } from "./MealCard";
import breakfastImg from "@/assets/breakfast.jpg";
import lunchImg from "@/assets/lunch.jpg";
import dinnerImg from "@/assets/dinner.jpg";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface MealData {
  status: MealStatus;
  time?: string;
  foodName?: string;
  calories?: number;
  tags?: string[];
}

interface MealTimelineProps {
  breakfast: MealData;
  lunch: MealData;
  dinner: MealData;
}

export function MealTimeline({ breakfast, lunch, dinner }: MealTimelineProps) {
  const items = [
    {
      type: "breakfast" as const,
      time: breakfast.time ?? "07:21",
      data: breakfast,
      image: breakfastImg,
      defaultTime: "07:30",
    },
    {
      type: "lunch" as const,
      time: lunch.time ?? "12:35",
      data: lunch,
      image: lunchImg,
      defaultTime: "12:30",
    },
    {
      type: "dinner" as const,
      time: dinner.time ?? "18:30",
      data: dinner,
      image: dinnerImg,
      defaultTime: "18:30",
    },
  ];

  const parseTime = (value: string) => {
    const match = value.match(/(\d{1,2}):(\d{2})/);
    if (!match) return null;
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    return hours * 60 + minutes;
  };

  const getStyles = (type: "breakfast" | "lunch" | "dinner") => {
    switch (type) {
      case "breakfast":
        return { dot: "bg-breakfast ring-breakfast/20", line: "bg-breakfast/20" };
      case "lunch":
        return { dot: "bg-lunch ring-lunch/20", line: "bg-lunch/20" };
      default:
        return { dot: "bg-dinner ring-dinner/20", line: "bg-dinner/20" };
    }
  };

  const sortedItems = [...items].sort((a, b) => {
    const aTime = parseTime(a.time) ?? parseTime(a.defaultTime) ?? 0;
    const bTime = parseTime(b.time) ?? parseTime(b.defaultTime) ?? 0;
    return aTime - bTime;
  });

  return (
    <div className="w-full max-w-md mx-auto mt-8 px-4">
      <div className="flex items-center gap-2 mb-5 px-1">
        <h3 className="text-lg font-bold text-foreground">三餐记录</h3>
        <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-xs font-medium">
          时间轴
        </span>
      </div>
      <div className="relative">
        <div className="absolute left-1/2 top-2 bottom-2 w-px bg-muted -translate-x-1/2" />
        {sortedItems.map((item, index) => {
          const styles = getStyles(item.type);
          return (
            <div key={item.type} className="grid grid-cols-[1fr_auto_1fr] gap-4 py-4 items-start">
              <div className="flex justify-end pr-2 text-xs text-muted-foreground/80 min-h-[20px]">
                {item.data.time ? (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.data.time}
                  </span>
                ) : (
                  <span className="opacity-0">00:00</span>
                )}
              </div>
              <div className="relative flex flex-col items-center">
                <div className={cn("w-2.5 h-2.5 rounded-full ring-4", styles.dot)} />
                {index < sortedItems.length - 1 && (
                  <div className={cn("w-px flex-1 mt-2", styles.line)} style={{ minHeight: "40px" }} />
                )}
              </div>
              <div className="flex">
                <MealCard
                  type={item.type}
                  status={item.data.status}
                  foodName={item.data.foodName}
                  calories={item.data.calories}
                  imageUrl={item.data.status === "recorded" ? item.image : undefined}
                  tags={item.data.tags}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
