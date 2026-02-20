import { useState, useCallback, useEffect, useMemo } from 'react';
import { FastingCard } from "@/components/fasting/FastingCard";
import { MealTimeline } from "@/components/fasting/MealTimeline";
import { AISummaryCard } from "@/components/fasting/AISummaryCard";
import { NutrientEnergyBar } from "@/components/fasting/NutrientEnergyBar";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { PaywallModal } from "@/components/modals/PaywallModal";
import { PhotoMealModal } from "@/components/modals/PhotoMealModal";
import { FastingCompleteSheet } from "@/components/fasting/FastingCompleteSheet";
import { EarlyEndDrawer } from "@/components/fasting/EarlyEndDrawer";
import { StartFastingDrawer } from "@/components/fasting/StartFastingDrawer";
import { useFastingStore } from "@/stores/fastingStore";
import { toast } from "@/hooks/use-toast";
import { del as apiDel, get as apiGet, post as apiPost } from "@/lib/api";
import { useLocation, useNavigate } from "react-router-dom";

type MealType = "breakfast" | "lunch" | "dinner";
type MealRecordType = MealType | "snack";

type MealRecord = {
  id: string;
  timestamp: number;
  type: MealRecordType;
  imageUrl: string | null;
  foodName: string | null;
  calories: number | null;
  aiAnalysis: any | null;
};

type AiMealResult = {
  foodName: string;
  calories: number;
  macros?: { protein?: string; fat?: string; carbs?: string };
  tags?: string[];
  advice?: string;
  nextStep?: string;
};

const Index = () => {
  const {
    showFastingComplete,
    setShowFastingComplete,
    showEarlyEndConfirm,
    setShowEarlyEndConfirm,
    planType,
    targetHours,
    isFasting,
    fastingStartTime,
    endFasting,
    startFasting,
    fetchCurrentStatus,
    newBadge,
    isLoading,
    error
  } = useFastingStore();

  useEffect(() => {
    if (error) {
      toast({ title: "操作失败", description: error, variant: "destructive" });
    }
  }, [error]);

  // 抽屉/弹框状态
  const [showStartFasting, setShowStartFasting] = useState(false);
  const [showPhotoMeal, setShowPhotoMeal] = useState(false);

  // 餐食加载状态
  const [loadingMeal, setLoadingMeal] = useState<MealType | null>(null);
  const [todayMeals, setTodayMeals] = useState<MealRecord[]>([]);
  const [aiSummaryText, setAiSummaryText] = useState<string>("记录餐食后可生成 AI 综合分析。");
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);

  // 实时计算断食时长
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isFasting || !fastingStartTime) {
      setElapsed(0);
      return;
    }

    const updateElapsed = () => {
      const now = Date.now();
      setElapsed(now - fastingStartTime);
    };

    updateElapsed();
    const timer = setInterval(updateElapsed, 1000);
    return () => clearInterval(timer);
  }, [isFasting, fastingStartTime]);

  const fastingHours = Math.floor(elapsed / (1000 * 60 * 60));
  const fastingMinutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
  const fastingSeconds = Math.floor((elapsed % (1000 * 60)) / 1000);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  const fastingData = {
    fastingHours,
    fastingMinutes,
    fastingSeconds,
    targetHours,
    isInFastingWindow: isFasting,
    startTime: fastingStartTime ? formatTime(fastingStartTime) : "--:--",
    endTime: fastingStartTime ? formatTime(fastingStartTime + targetHours * 60 * 60 * 1000) : "--:--",
  };

  const latestByType = useMemo(() => {
    const result: Record<MealType, MealRecord | null> = {
      breakfast: null,
      lunch: null,
      dinner: null,
    };

    for (const type of ["breakfast", "lunch", "dinner"] as const) {
      const record = todayMeals
        .filter((m) => m.type === type)
        .sort((a, b) => b.timestamp - a.timestamp)[0];
      result[type] = record ?? null;
    }

    return result;
  }, [todayMeals]);

  const mealsData = useMemo(() => {
    const build = (type: MealType) => {
      const record = latestByType[type];
      const tags = Array.isArray(record?.aiAnalysis?.tags) ? record.aiAnalysis.tags : undefined;
      return record
        ? {
            status: "recorded" as const,
            time: formatTime(record.timestamp),
            foodName: record.foodName ?? undefined,
            calories: record.calories ?? undefined,
            tags,
            imageUrl: record.imageUrl ?? undefined,
            isLoading: loadingMeal === type,
          }
        : {
            status: "pending" as const,
            isLoading: loadingMeal === type,
          };
    };

    return {
      breakfast: build("breakfast"),
      lunch: build("lunch"),
      dinner: build("dinner"),
    };
  }, [formatTime, latestByType, loadingMeal]);

  const totalCalories = useMemo(
    () => todayMeals.reduce((sum, m) => sum + (typeof m.calories === "number" ? m.calories : 0), 0),
    [todayMeals]
  );

  const mealsRecorded = useMemo(
    () => todayMeals.filter((m) => m.type === "breakfast" || m.type === "lunch" || m.type === "dinner").length,
    [todayMeals]
  );

  const aiSummary = useMemo(
    () => ({
      totalCalories,
      mealsRecorded,
      analysis: aiSummaryText,
    }),
    [aiSummaryText, mealsRecorded, totalCalories]
  );

  const refreshMeals = useCallback(async () => {
    try {
      const records = await apiGet<MealRecord[]>("/meals/today");
      setTodayMeals(records);
    } catch (e) {
      toast({
        title: "加载餐食失败",
        description: e instanceof Error ? e.message : "未知错误",
        variant: "destructive",
      });
    }
  }, []);

  useEffect(() => {
    refreshMeals();
  }, [refreshMeals]);

  useEffect(() => {
    if (todayMeals.length === 0) {
      setAiSummaryText("记录餐食后可生成 AI 综合分析。");
      return;
    }

    const run = async () => {
      setAiSummaryLoading(true);
      try {
        const result = await apiPost<any, { meals: Array<{ type?: string; foodName?: string; calories?: number }> }>(
          "/ai/analyze-day",
          {
            meals: todayMeals.map((m) => ({
              type: m.type,
              foodName: m.foodName ?? undefined,
              calories: typeof m.calories === "number" ? m.calories : undefined,
            })),
          }
        );

        const summary = typeof result?.nutritionalEvaluation?.summary === "string" ? result.nutritionalEvaluation.summary : null;
        const advice = typeof result?.advice === "string" ? result.advice : null;
        setAiSummaryText([summary, advice].filter(Boolean).join(" "));
      } catch {
        setAiSummaryText("已汇总今日热量与记录数；AI 综合分析暂不可用。");
      } finally {
        setAiSummaryLoading(false);
      }
    };

    run();
  }, [todayMeals]);

  const handlePhotoTaken = useCallback(async (mealType: MealType, dataUrl: string, source: "camera" | "album") => {
    setLoadingMeal(mealType);
    toast({
      title: "照片已上传",
      description: `正在使用 AI 识别${source === "camera" ? "拍摄" : "上传"}的食物...`,
    });
    try {
      const upload = await apiPost<{ url: string; path: string }, { dataUrl: string }>("/files/upload", { dataUrl });
      const currentState = isFasting ? "断食中" : "准备开食";
      const ai = await apiPost<AiMealResult, { image: string; currentState: string }>("/ai/analyze", {
        image: upload.url,
        currentState,
      });

      await apiPost<MealRecord, { timestamp: number; type: MealType; imageUrl: string; foodName: string; calories: number; aiAnalysis: unknown }>(
        "/meals",
        {
          timestamp: Date.now(),
          type: mealType,
          imageUrl: upload.path,
          foodName: ai.foodName,
          calories: ai.calories,
          aiAnalysis: ai,
        }
      );

      await refreshMeals();
      toast({ title: "识别完成", description: "已保存餐食记录" });
    } catch (e) {
      toast({
        title: "识别失败",
        description: e instanceof Error ? e.message : "未知错误",
        variant: "destructive",
      });
    } finally {
      setLoadingMeal(null);
    }
  }, [isFasting, refreshMeals]);

  useEffect(() => {
    fetchCurrentStatus();
  }, [fetchCurrentStatus]);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("photo") === "1") {
      setShowPhotoMeal(true);
      params.delete("photo");
      navigate({ pathname: "/", search: params.toString() ? `?${params.toString()}` : "" }, { replace: true });
    }
  }, [location.search, navigate]);

  const resolveTargetHours = (plan: string) => {
    const parsed = Number(plan.split(':')[0]);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : targetHours;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="h-12" />

      <div className="px-4 max-w-md mx-auto space-y-5">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">今日饮食</h1>
            <p className="text-sm text-muted-foreground mt-0.5">周六 · 1月25日</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold text-sm">
            李
          </div>
        </div>

        {/* 断食状态卡片 */}
        <FastingCard {...fastingData} onStartFasting={() => setShowStartFasting(true)} />

        {/* 三餐时间轴 */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <span>三餐记录</span>
            <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">时间轴</span>
          </h2>
          <MealTimeline
            {...mealsData}
            onDeleteMeal={async (type) => {
              const record = latestByType[type];
              if (!record) return;
              try {
                await apiDel<null>(`/meals/${record.id}`);
                await refreshMeals();
                toast({ title: "已删除", description: "餐食记录已删除" });
              } catch (e) {
                toast({
                  title: "删除失败",
                  description: e instanceof Error ? e.message : "未知错误",
                  variant: "destructive",
                });
              }
            }}
          />
        </div>

        <AISummaryCard
          {...aiSummary}
          analysis={aiSummaryLoading ? "AI 分析生成中..." : aiSummary.analysis}
        />

        {/* 动态能量条 */}
        <NutrientEnergyBar
          fat={{ value: 24, max: 65 }}
          carbs={{ value: 180, max: 300 }}
          protein={{ value: 52, max: 80 }}
          micros={{ value: 68, max: 100 }}
        />
      </div>

      <BottomNavigation />

      {/* 弹层组件 */}
      <PaywallModal />
      <PhotoMealModal
        open={showPhotoMeal}
        onOpenChange={setShowPhotoMeal}
        onPhotoTaken={handlePhotoTaken}
      />

      <FastingCompleteSheet
        open={showFastingComplete}
        onOpenChange={setShowFastingComplete}
        fastingDuration={{ hours: fastingData.fastingHours, minutes: fastingData.fastingMinutes }}
        targetHours={targetHours}
        planType={planType}
        newBadge={newBadge}
        onStartEating={async (weight) => {
          if (weight) toast({ title: "体重已记录", description: `${weight} kg` });
          await endFasting();
          setShowFastingComplete(false);
        }}
        onViewDetails={async () => {
          await endFasting();
          setShowFastingComplete(false);
        }}
      />

      <EarlyEndDrawer
        open={showEarlyEndConfirm}
        onOpenChange={setShowEarlyEndConfirm}
        currentDuration={{ hours: fastingData.fastingHours, minutes: fastingData.fastingMinutes }}
        targetHours={targetHours}
        onContinue={() => setShowEarlyEndConfirm(false)}
        onConfirmEnd={async (reason) => {
          await endFasting(reason);
          toast({ title: "已记录本次断食", description: `${fastingData.fastingHours}小时${fastingData.fastingMinutes}分钟` });
        }}
      />

      <StartFastingDrawer
        open={showStartFasting}
        onOpenChange={setShowStartFasting}
        onStart={async (plan, startTime, endTime) => {
          await startFasting(resolveTargetHours(plan), startTime.getTime(), plan);
          toast({ title: "断食已开始", description: `${plan} 计划，预计 ${endTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} 结束` });
        }}
      />
    </div>
  );
};

export default Index;
