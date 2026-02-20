import { useRef, useState } from "react";
import { Camera, Image, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type MealType = "breakfast" | "lunch" | "dinner";

interface PhotoMealModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPhotoTaken: (mealType: MealType, dataUrl: string, source: "camera" | "album") => void;
}

const mealOptions: { type: MealType; label: string; icon: string }[] = [
  { type: "breakfast", label: "早餐", icon: "🌅" },
  { type: "lunch", label: "午餐", icon: "☀️" },
  { type: "dinner", label: "晚餐", icon: "🌙" },
];

export function PhotoMealModal({ open, onOpenChange, onPhotoTaken }: PhotoMealModalProps) {
  const [selectedMeal, setSelectedMeal] = useState<MealType | null>(null);
  const albumInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setSelectedMeal(null);
    }, 300);
  };

  const handleMealSelect = (type: MealType) => {
    setSelectedMeal(type);
  };

  const handleCapture = (source: "camera" | "album") => {
    if (!selectedMeal) return;
    if (source === "camera") cameraInputRef.current?.click();
    if (source === "album") albumInputRef.current?.click();
  };

  const handleFile = (file: File | null, source: "camera" | "album") => {
    if (!file || !selectedMeal) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      if (!result) return;
      onPhotoTaken(selectedMeal, result, source);
      handleClose();
    };
    reader.readAsDataURL(file);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <input
        ref={albumInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0] ?? null, "album");
          e.currentTarget.value = "";
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0] ?? null, "camera");
          e.currentTarget.value = "";
        }}
      />
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
      />

      {/* 内容 */}
      <div className="relative w-full max-w-md bg-card rounded-t-3xl shadow-xl animate-slide-up z-10">
        {/* 拖拽指示器 */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
        </div>

        {/* 关闭按钮 */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="px-6 pb-8">
          <h3 className="text-lg font-semibold text-foreground mb-1">AI 食物识别</h3>
          <p className="text-sm text-muted-foreground mb-5">选择用餐时段，拍照或上传食物图片</p>

          {/* 三餐选择 */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {mealOptions.map((meal) => (
              <button
                key={meal.type}
                onClick={() => handleMealSelect(meal.type)}
                className={cn(
                  "relative flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all",
                  selectedMeal === meal.type
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border bg-card hover:border-primary/30"
                )}
              >
                <span className="text-2xl">{meal.icon}</span>
                <span className={cn(
                  "text-sm font-medium",
                  selectedMeal === meal.type ? "text-primary" : "text-foreground"
                )}>
                  {meal.label}
                </span>
                {selectedMeal === meal.type && (
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* 操作按钮 - 选择餐次后直接展示 */}
          <div
            className={cn(
              "flex items-center justify-center gap-4 transition-all duration-300",
              selectedMeal
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-3 pointer-events-none"
            )}
          >
            <button
              onClick={() => handleCapture("camera")}
              className="flex-1 flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-foreground text-background font-medium transition-all hover:opacity-90 active:scale-[0.98]"
            >
              <Camera className="w-5 h-5" />
              <span>拍照识别</span>
            </button>
            <button
              onClick={() => handleCapture("album")}
              className="flex-1 flex items-center justify-center gap-2.5 py-4 rounded-2xl border-2 border-border bg-card font-medium text-foreground transition-all hover:bg-muted active:scale-[0.98]"
            >
              <Image className="w-5 h-5" />
              <span>从相册选择</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
