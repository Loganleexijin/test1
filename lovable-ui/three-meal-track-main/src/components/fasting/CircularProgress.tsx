interface CircularProgressProps {
  currentHours: number;
  currentMinutes: number;
  currentSeconds?: number;
  targetHours: number;
  isInFastingWindow: boolean;
}

export function CircularProgress({
  currentHours,
  currentMinutes,
  currentSeconds = 0,
  targetHours,
  isInFastingWindow,
}: CircularProgressProps) {
  const progress = Math.min(((currentHours + currentMinutes / 60) / targetHours) * 100, 100);
  const size = 288;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const center = size / 2;

  const getPhaseLabel = (hours: number) => {
    if (hours >= 12) return "细胞自噬期";
    if (hours >= 8) return "高效燃脂期";
    if (hours >= 4) return "血糖平稳期";
    return "血糖下降期";
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        style={{ filter: "drop-shadow(0 6px 18px hsl(var(--primary) / 0.18))" }}
      >
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--ring-start))" />
            <stop offset="50%" stopColor="hsl(var(--ring-mid))" />
            <stop offset="100%" stopColor="hsl(var(--ring-end))" />
          </linearGradient>
        </defs>

        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-sm font-semibold text-muted-foreground font-mono mb-1">{Math.round(progress)}%</div>
        <div className="text-[11px] font-semibold text-muted-foreground tracking-wider mb-1">
          {isInFastingWindow ? "剩余时间" : "进食窗口"}
        </div>
        <div className="flex items-baseline justify-center font-bold tracking-tight">
          <span className="text-5xl text-foreground">
            {String(currentHours).padStart(2, "0")}
          </span>
          <span className="text-3xl text-muted-foreground mx-1">:</span>
          <span className="text-5xl text-foreground">
            {String(currentMinutes).padStart(2, "0")}
          </span>
          <span className="text-3xl text-muted-foreground mx-1">:</span>
          <span className="text-5xl text-foreground">
            {String(currentSeconds).padStart(2, "0")}
          </span>
        </div>
        <div className="mt-3 text-center">
          <div className="text-sm font-bold text-warning">{getPhaseLabel(currentHours)}</div>
          <div className="text-xs text-muted-foreground mt-0.5">身体正在适应中</div>
        </div>
      </div>
    </div>
  );
}
