import { type MealStatus } from "./MealCard";
import { SwipeableMealCard } from "./SwipeableMealCard";
import { TimelineConnector } from "./TimelineConnector";

interface MealData {
  status: MealStatus;
  time?: string;
  foodName?: string;
  calories?: number;
  tags?: string[];
  imageUrl?: string;
  isLoading?: boolean;
}

interface MealTimelineProps {
  breakfast: MealData;
  lunch: MealData;
  dinner: MealData;
  onDeleteMeal?: (type: "breakfast" | "lunch" | "dinner") => void;
}

export function MealTimeline({ breakfast, lunch, dinner, onDeleteMeal }: MealTimelineProps) {
  // 第一张已记录的卡片显示引导弹动
  const firstRecorded =
    breakfast.status === "recorded" ? "breakfast" :
    lunch.status === "recorded" ? "lunch" :
    dinner.status === "recorded" ? "dinner" : null;

  return (
    <div className="space-y-0">
      <SwipeableMealCard
        type="breakfast"
        status={breakfast.status}
        time={breakfast.time}
        foodName={breakfast.foodName}
        calories={breakfast.calories}
        imageUrl={breakfast.imageUrl}
        tags={breakfast.tags}
        isLoading={breakfast.isLoading}
        showHint={firstRecorded === "breakfast"}
        onDelete={() => onDeleteMeal?.("breakfast")}
      />

      <TimelineConnector
        fromType="breakfast"
        toType="lunch"
        fromStatus={breakfast.status}
        toStatus={lunch.status}
      />

      <SwipeableMealCard
        type="lunch"
        status={lunch.status}
        time={lunch.time}
        foodName={lunch.foodName}
        calories={lunch.calories}
        imageUrl={lunch.imageUrl}
        tags={lunch.tags}
        isLoading={lunch.isLoading}
        showHint={firstRecorded === "lunch"}
        onDelete={() => onDeleteMeal?.("lunch")}
      />

      <TimelineConnector
        fromType="lunch"
        toType="dinner"
        fromStatus={lunch.status}
        toStatus={dinner.status}
      />

      <SwipeableMealCard
        type="dinner"
        status={dinner.status}
        time={dinner.time}
        foodName={dinner.foodName}
        calories={dinner.calories}
        imageUrl={dinner.imageUrl}
        tags={dinner.tags}
        isLoading={dinner.isLoading}
        showHint={firstRecorded === "dinner"}
        onDelete={() => onDeleteMeal?.("dinner")}
      />
    </div>
  );
}
