import { MealCard, type MealStatus } from "./MealCard";
import breakfastImg from "@/assets/breakfast.jpg";
import lunchImg from "@/assets/lunch.jpg";
import dinnerImg from "@/assets/dinner.jpg";
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
      dot: "bg-breakfast ring-breakfast/20",
    },
    {
      type: "lunch" as const,
      time: lunch.time ?? "12:35",
      data: lunch,
      image: lunchImg,
      defaultTime: "12:30",
      dot: "bg-lunch ring-lunch/20",
    },
    {
      type: "dinner" as const,
      time: dinner.time ?? "18:30",
      data: dinner,
      image: dinnerImg,
      defaultTime: "18:30",
      dot: "bg-dinner ring-dinner/20",
    },
  ];

  return (
    <div className="w-full max-w-md mx-auto mt-2">
      <div className="flex items-center gap-2 mb-5">
        <h3 className="text-lg font-bold text-foreground">三餐记录</h3>
        <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-xs font-medium">
          时间轴
        </span>
      </div>
      <div className="relative">
        <div className="absolute left-1/2 top-4 bottom-4 w-px bg-muted -translate-x-1/2" />
        <div className="space-y-6">
          {items.map((item) => (
            <div key={item.type} className="relative flex justify-center pt-4">
              <div className={cn("absolute left-1/2 top-1 -translate-x-1/2 w-2.5 h-2.5 rounded-full ring-4", item.dot)} />
              <div className="w-full">
                <MealCard
                  type={item.type}
                  status={item.data.status}
                  foodName={item.data.foodName}
                  calories={item.data.calories}
                  imageUrl={item.data.status === "recorded" ? item.image : undefined}
                  tags={item.data.tags}
                  time={item.data.time}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
