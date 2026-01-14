import React, { useMemo } from 'react';

export type FluxTheme = 'digest' | 'stable' | 'burning' | 'autophagy';

interface FluxRingProps {
  radius?: number;
  stroke?: number;
  progress: number; // 0.0 to 1.0
  theme?: FluxTheme;
  className?: string;
  children?: React.ReactNode;
}

const FluxRing: React.FC<FluxRingProps> = ({
  radius = 120,
  stroke = 12,
  progress = 0,
  theme = 'burning',
  className = '',
  children,
}) => {
  const normalizedRadius = radius - stroke / 2;
  
  // 1. 安全处理进度值：处理 NaN/Infinity，并归一化
  const safeProgress = Number.isFinite(progress) ? progress : 0;
  const clampedProgress = Math.min(1, Math.max(0, safeProgress));
  
  // 2. 降低零态阈值：从 0.0001 降至 0.000001 (1e-6)
  // 确保即使是长时间断食（如72小时），在第1秒时也能显示进度。
  // 72小时断食第1秒进度约为 3.8e-6 > 1e-6，可见。
  // 仅在真正的 0 时隐藏，以消除 SVG strokeLinecap="round" 导致的 0% 幽灵圆点。
  const isZeroState = clampedProgress <= 0.000001;
  
  const circumference = Math.ceil(normalizedRadius * 2 * Math.PI) + 1;
  const strokeDashoffset = circumference * (1 - clampedProgress);
  const rotationAngle = clampedProgress * 360;

  // 主题定义
  const THEMES = useMemo(() => ({
    digest: {
      id: 'grad-digest',
      stops: [{ offset: '0%', color: '#FB923C' }, { offset: '100%', color: '#F59E0B' }],
      mainColor: '#FB923C',
      shadowColor: 'rgba(251, 146, 60, 0.5)'
    },
    stable: {
      id: 'grad-stable',
      stops: [{ offset: '0%', color: '#10B981' }, { offset: '100%', color: '#0D9488' }],
      mainColor: '#10B981',
      shadowColor: 'rgba(16, 185, 129, 0.5)'
    },
    burning: {
      id: 'grad-burning',
      stops: [{ offset: '0%', color: '#4F46E5' }, { offset: '100%', color: '#7E22CE' }],
      mainColor: '#4F46E5',
      shadowColor: 'rgba(79, 70, 229, 0.6)'
    },
    autophagy: {
      id: 'grad-autophagy',
      stops: [{ offset: '0%', color: '#312E81' }, { offset: '100%', color: '#FEF3C7' }],
      mainColor: '#312E81',
      shadowColor: 'rgba(49, 46, 129, 0.5)'
    }
  }), []);

  const currentTheme = THEMES[theme] || THEMES.digest;

  // 呼吸动画配置
  const breathingConfig = useMemo(() => ({
    digest: { duration: '6s', opacity: [0.1, 0.2] },
    stable: { duration: '5s', opacity: [0.2, 0.4] },
    burning: { duration: '3s', opacity: [0.4, 0.7] },
    autophagy: { duration: '6s', opacity: [0.3, 0.6] }
  }), []);

  const currentBreathing = breathingConfig[theme] || breathingConfig.digest;

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <style>{`
        @keyframes breathe-custom-${theme} {
          0%, 100% { opacity: ${currentBreathing.opacity[0]}; }
          50% { opacity: ${currentBreathing.opacity[1]}; }
        }
      `}</style>
      <div
        className="absolute inset-0 rounded-full blur-2xl transform scale-90"
        style={{
          backgroundColor: currentTheme.mainColor,
          animation: `breathe-custom-${theme} ${currentBreathing.duration} infinite ease-in-out`
        }}
      />
      
      <svg
        height={radius * 2}
        width={radius * 2}
        style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id={currentTheme.id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={currentTheme.mainColor} stopOpacity="1" />
            <stop offset="100%" stopColor={currentTheme.stops[1].color} stopOpacity="1" />
          </linearGradient>
        </defs>

        <circle
          stroke="#F3F4F6"
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />

        <circle
          stroke={`url(#${currentTheme.id})`}
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{
            strokeDashoffset,
            opacity: isZeroState ? 0 : 1,
            transition: 'stroke-dashoffset 1000ms linear, opacity 250ms ease-in-out',
            willChange: 'stroke-dashoffset'
          }}
          strokeLinecap="round"
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          filter={`drop-shadow(0 0 6px ${currentTheme.shadowColor})`}
        />
      </svg>

      <div
        className="absolute pointer-events-none"
        style={{
          width: radius * 2,
          height: radius * 2,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: isZeroState ? 0 : 1,
          transition: 'opacity 250ms ease-in-out'
        }}
      >
        <div
            className="absolute inset-0"
            style={{
            transform: `rotate(${rotationAngle}deg)`,
            transition: 'transform 1s cubic-bezier(0.2, 0.8, 0.2, 1)'
            }}
        >
            <div
            className="absolute bg-white rounded-full"
            style={{
                width: stroke,
                height: stroke,
                left: '50%',
                top: stroke / 2,
                transform: 'translate(-50%, -50%)', 
                boxShadow: `0 0 10px ${currentTheme.mainColor}`
            }}
            >
            <div className="absolute inset-0 m-auto w-[40%] h-[40%] bg-white rounded-full blur-[0.5px]"></div>
            </div>
        </div>
      </div>

      {children && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          {children}
        </div>
      )}
    </div>
  );
};

export default FluxRing;
