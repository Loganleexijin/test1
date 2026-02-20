import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface NutrientData {
  label: string;
  labelCN: string;
  unit: string;
  value: number;
  max: number;
  color: string;
  glowColor: string;
}

interface NutrientEnergyBarProps {
  fat: { value: number; max: number };
  carbs: { value: number; max: number };
  protein: { value: number; max: number };
  micros: { value: number; max: number };
  className?: string;
}

function useCountUp(target: number, duration: number, start: boolean, delay: number) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!start) return;
    const timer = setTimeout(() => {
      const startTime = performance.now();
      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // ease-out quad
        const eased = 1 - (1 - progress) * (1 - progress);
        setCurrent(Math.round(eased * target));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, delay);
    return () => clearTimeout(timer);
  }, [target, duration, start, delay]);

  return current;
}

export function NutrientEnergyBar({
  fat,
  carbs,
  protein,
  micros,
  className,
}: NutrientEnergyBarProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const nutrients: NutrientData[] = [
    { label: "脂肪", labelCN: "脂肪", unit: "g", value: fat.value, max: fat.max, color: "bg-[hsl(25,80%,75%)]", glowColor: "hsl(25,80%,75%)" },
    { label: "碳水", labelCN: "碳水", unit: "g", value: carbs.value, max: carbs.max, color: "bg-[hsl(45,70%,65%)]", glowColor: "hsl(45,70%,65%)" },
    { label: "蛋白质", labelCN: "蛋白质", unit: "g", value: protein.value, max: protein.max, color: "bg-[hsl(200,60%,60%)]", glowColor: "hsl(200,60%,60%)" },
    { label: "微量元素", labelCN: "微量元素", unit: "%", value: micros.value, max: micros.max, color: "bg-[hsl(270,50%,70%)]", glowColor: "hsl(270,50%,70%)" },
  ];

  return (
    <div ref={ref} className={cn("px-4", className)}>
      {/* 毛玻璃容器 */}
      <div
        className={cn(
          "relative rounded-3xl p-6 transition-all duration-700",
          "bg-card/80 backdrop-blur-md",
          "shadow-[0_8px_20px_-5px_rgba(0,0,0,0.04)]",
          "border border-border/50",
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
      >
        <div className="grid grid-cols-4 gap-0">
          {nutrients.map((n, i) => {
            const percent = Math.min((n.value / n.max) * 100, 100);
            const count = useCountUp(n.value, 600, visible, 100 + i * 80);
            const staggerDelay = 100 + i * 80;

            return (
              <div
                key={n.label}
                className={cn(
                  "flex flex-col items-center transition-all duration-500",
                  visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                )}
                style={{ transitionDelay: visible ? `${staggerDelay}ms` : "0ms" }}
              >
                {/* 中文标签 */}
                <span className="text-[10px] tracking-widest text-muted-foreground/60 uppercase font-medium mb-1.5">
                  {n.labelCN}
                </span>
                {/* 数值 - 动态计数 */}
                <span className="text-2xl font-semibold text-foreground leading-none tabular-nums">
                  {count}
                </span>
                {/* 单位 */}
                <span className="text-[10px] text-muted-foreground/50 mt-0.5 mb-3">
                  {n.unit}
                </span>
                {/* 能量条 + 光点 */}
                <div className="w-10 h-[2px] bg-muted/60 rounded-full overflow-hidden relative">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all ease-out relative",
                      n.color
                    )}
                    style={{
                      width: visible ? `${percent}%` : "0%",
                      transitionDuration: "1000ms",
                      transitionDelay: `${staggerDelay + 300}ms`,
                    }}
                  >
                    {/* 末端光点 */}
                    <div
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full opacity-0"
                      style={{
                        backgroundColor: n.glowColor,
                        boxShadow: `0 0 6px 2px ${n.glowColor}`,
                        animation: visible ? `glow-pulse 1.2s ease-out ${staggerDelay + 400}ms forwards` : "none",
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 光点动画 */}
      <style>{`
        @keyframes glow-pulse {
          0% { opacity: 0; }
          30% { opacity: 0.9; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
