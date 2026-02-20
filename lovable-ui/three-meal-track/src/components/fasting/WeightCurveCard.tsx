import { useState } from "react";
import { Plus, TrendingDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeightEntry {
  date: string;
  weight: number;
}

interface WeightCurveCardProps {
  entries?: WeightEntry[];
  onAddWeight?: (weight: number) => void;
  className?: string;
}

export function WeightCurveCard({
  entries = [],
  onAddWeight,
  className,
}: WeightCurveCardProps) {
  const [showInput, setShowInput] = useState(false);
  const [weightValue, setWeightValue] = useState("");

  const handleSave = () => {
    const val = parseFloat(weightValue);
    if (val && val > 0) {
      onAddWeight?.(val);
      setWeightValue("");
      setShowInput(false);
    }
  };

  // 生成 SVG 路径
  const chartWidth = 280;
  const chartHeight = 60;
  const padding = 4;

  const displayEntries = entries.length > 0 ? entries : [
    { date: "1/19", weight: 72.5 },
    { date: "1/20", weight: 72.2 },
    { date: "1/21", weight: 71.8 },
    { date: "1/22", weight: 72.0 },
    { date: "1/23", weight: 71.5 },
    { date: "1/24", weight: 71.3 },
    { date: "1/25", weight: 71.0 },
  ];

  const weights = displayEntries.map((e) => e.weight);
  const minW = Math.min(...weights) - 0.5;
  const maxW = Math.max(...weights) + 0.5;
  const range = maxW - minW || 1;

  const points = displayEntries.map((e, i) => {
    const x = padding + (i / (displayEntries.length - 1)) * (chartWidth - padding * 2);
    const y = padding + (1 - (e.weight - minW) / range) * (chartHeight - padding * 2);
    return { x, y };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`;

  const latestWeight = displayEntries[displayEntries.length - 1]?.weight;
  const firstWeight = displayEntries[0]?.weight;
  const diff = latestWeight && firstWeight ? latestWeight - firstWeight : 0;

  return (
    <div className={cn("bg-card rounded-2xl p-4 shadow-card", className)}>
      {/* 标题行 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">体重变化曲线</span>
        </div>
        <button
          onClick={() => setShowInput(!showInput)}
          className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
        >
          {showInput ? (
            <X className="w-4 h-4 text-primary" />
          ) : (
            <Plus className="w-4 h-4 text-primary" />
          )}
        </button>
      </div>

      {/* 添加体重输入 */}
      {showInput && (
        <div className="flex items-center gap-2 mb-3 animate-fade-in">
          <input
            type="number"
            value={weightValue}
            onChange={(e) => setWeightValue(e.target.value)}
            placeholder="输入体重"
            className="flex-1 py-2 px-3 bg-muted/50 rounded-xl text-foreground text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30"
            step="0.1"
            min="20"
            max="300"
          />
          <span className="text-xs text-muted-foreground">kg</span>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          >
            保存
          </button>
        </div>
      )}

      {/* 关键数据 */}
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-2xl font-bold text-foreground">{latestWeight}</span>
        <span className="text-xs text-muted-foreground">kg</span>
        {diff !== 0 && (
          <span className={cn(
            "text-xs font-medium px-1.5 py-0.5 rounded-full",
            diff < 0 ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
          )}>
            {diff > 0 ? "+" : ""}{diff.toFixed(1)} kg
          </span>
        )}
      </div>

      {/* 迷你曲线图 */}
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-14"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#weightGradient)" />
        <path
          d={pathD}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 最后一个点 */}
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r="3"
          fill="hsl(var(--primary))"
        />
      </svg>

      {/* 日期标签 */}
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-muted-foreground/50">{displayEntries[0]?.date}</span>
        <span className="text-[10px] text-muted-foreground/50">{displayEntries[displayEntries.length - 1]?.date}</span>
      </div>
    </div>
  );
}
