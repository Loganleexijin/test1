import { FastingCard } from "@/components/fasting/FastingCard";
import { MealTimeline } from "@/components/fasting/MealTimeline";
import { AISummaryCard } from "@/components/fasting/AISummaryCard";
import { Calendar } from "lucide-react";

const Index = () => {
  // 示例数据
  const fastingData = {
    fastingHours: 0,
    fastingMinutes: 0,
    fastingSeconds: 3,
    targetHours: 16,
    isInFastingWindow: true,
    startTime: "今天 19:30",
    endTime: "明天 11:30",
  };

  const mealsData = {
    breakfast: {
      status: "recorded" as const,
      time: "07:21",
      foodName: "牛油果鸡蛋吐司",
      calories: 275,
      tags: ["低卡饱腹", "高膳食纤维", "轻食餐品"],
    },
    lunch: {
      status: "recorded" as const,
      time: "12:35",
      foodName: "鸡胸肉藜麦沙拉",
      calories: 510,
      tags: ["高蛋白", "低GI", "复食适用"],
    },
    dinner: {
      status: "pending" as const,
    },
  };

  const aiSummary = {
    totalCalories: 785,
    mealsRecorded: 2,
    analysis:
      "今日热量控制良好，请继续保持。建议晚餐保持清淡，避免过晚进食，有助于夜间代谢与睡眠质量。",
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md">
        <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-foreground">Flux</h1>
          <div className="flex items-center gap-2">
            <button className="text-xs font-semibold text-muted-foreground bg-card border border-border/60 px-3 py-1.5 rounded-full shadow-card">
              补录断食
            </button>
            <button className="p-2 bg-card border border-border/60 rounded-full shadow-card text-muted-foreground">
              <Calendar className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto pt-4 pb-6 space-y-6">
        <FastingCard {...fastingData} />
        <MealTimeline {...mealsData} />
        <AISummaryCard {...aiSummary} />
      </div>
    </div>
  );
};

export default Index;
