import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Play, Square, X, Info, Zap } from 'lucide-react';
import { useFastingStore } from '@/store/fastingStore';
import { getCurrentStage, getNextStage, shouldTriggerFatBurningCue } from '@/utils/fastingStages';
import FluxRing, { FluxTheme } from './FluxRing';
import PlanSelector from './PlanSelector';

const PHASE_COPY: Record<string, Array<{ label: string; sub: string }>> = {
  phase1: [
    { label: '能量储存期', sub: '身体正在消化食物' },
    { label: '身体余晖', sub: '享受饱腹的满足感' },
    { label: '血糖上升期', sub: '胰岛素正在工作' }
  ],
  phase2: [
    { label: '血糖平稳期', sub: '胰岛素正在下降' },
    { label: '宁静时刻', sub: '身体回归平静' },
    { label: '糖原消耗中', sub: '脂肪的大门即将打开' }
  ],
  phase3: [
    { label: '高效燃脂期', sub: '脂肪开始燃烧' },
    { label: '深度潜水', sub: '探索身体的潜能' },
    { label: '酮体生成中', sub: '代谢灵活性建立' }
  ],
  phase4: [
    { label: '细胞自噬期', sub: '深层细胞净化' },
    { label: '星光焕新', sub: '逆转时光的魔法' },
    { label: '生长激素激增', sub: '免疫系统重建' }
  ],
  phase5: [
    { label: '深度修复', sub: '生长激素激增' }
  ]
};

interface FastingClockProps {
  onStartFast?: () => void;
  onEndFast?: () => void;
}

export default function FastingClock({ onStartFast, onEndFast }: FastingClockProps) {
  const { currentSession, loadSession, cancelFast, fastingPlan } = useFastingStore();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showEndSuccess, setShowEndSuccess] = useState(false);
  const [isStageDetailOpen, setIsStageDetailOpen] = useState(false);
  const [showFatBurningCue, setShowFatBurningCue] = useState(false);
  const [showTargetReachedCue, setShowTargetReachedCue] = useState(false);
  const [isPlanSelectorOpen, setIsPlanSelectorOpen] = useState(false);
  const requestRef = useRef<number>();
  const lastElapsedRef = useRef(0);
  const targetReachedRef = useRef(false);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const updateTimer = useCallback(() => {
    if (!currentSession || currentSession.fasting_status === 'idle') {
      setElapsedSeconds(0);
      setRemainingSeconds(0);
      return;
    }

    const now = Date.now();
    const elapsedSec = Math.floor((now - currentSession.start_at) / 1000);
    const targetSec = currentSession.target_duration_hours * 3600;
    const remainingSec = Math.max(0, targetSec - elapsedSec);

    setElapsedSeconds(elapsedSec);
    setRemainingSeconds(remainingSec);
    
    requestRef.current = requestAnimationFrame(updateTimer);
  }, [currentSession]);

  const status = currentSession?.fasting_status || 'idle';

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateTimer);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [updateTimer]);

  useEffect(() => {
    if (status !== 'fasting') {
      lastElapsedRef.current = elapsedSeconds;
      targetReachedRef.current = false;
      return;
    }

    const prev = lastElapsedRef.current;

    if (shouldTriggerFatBurningCue(prev, elapsedSeconds)) {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        (navigator as Navigator & { vibrate?: (pattern: number | number[]) => boolean }).vibrate?.(50);
      }

      setShowFatBurningCue(true);
      setTimeout(() => setShowFatBurningCue(false), 2000);
    }

    const targetSeconds = (currentSession?.target_duration_hours || 16) * 3600;
    if (!targetReachedRef.current && prev < targetSeconds && elapsedSeconds >= targetSeconds) {
      targetReachedRef.current = true;
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        (navigator as Navigator & { vibrate?: (pattern: number | number[]) => boolean }).vibrate?.([60, 40, 60]);
      }
      setShowTargetReachedCue(true);
      setTimeout(() => setShowTargetReachedCue(false), 2200);
    }

    lastElapsedRef.current = elapsedSeconds;
  }, [elapsedSeconds, status, currentSession?.target_duration_hours]);

  const currentStage = currentSession && status === 'fasting' 
    ? getCurrentStage(elapsedSeconds / 3600)
    : null;
    
  const nextStage = currentStage ? getNextStage(currentStage.id) : null;

  const progress = currentSession 
    ? Math.min(100, (elapsedSeconds / ((currentSession.target_duration_hours || 16) * 3600)) * 100)
    : 0;

  const phaseToTheme = useMemo((): FluxTheme => {
    if (!currentStage) return 'burning';
    const phaseMap: Record<string, FluxTheme> = {
      phase1: 'digest',
      phase2: 'stable',
      phase3: 'burning',
      phase4: 'autophagy',
      phase5: 'autophagy'
    };
    return phaseMap[currentStage.id] || 'burning';
  }, [currentStage]);

  const randomCopy = useMemo(() => {
    if (!currentStage) return null;
    const copies = PHASE_COPY[currentStage.id] || PHASE_COPY.phase1;
    const randomIndex = Math.floor(Math.random() * copies.length);
    return copies[randomIndex];
  }, [currentStage]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatDurationText = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}小时${m}分钟`;
    return `${m}分钟`;
  };

  const getDisplayTime = () => {
    if (status === 'idle') {
      return `${currentSession?.target_duration_hours || 16}:00:00`;
    }
    return remainingSeconds > 0 ? formatTime(remainingSeconds) : formatTime(elapsedSeconds);
  };

  const getStatusText = () => {
    switch (status) {
      case 'idle': return '准备断食';
      case 'fasting': return '断食中';
      case 'eating': return '进食窗口';
      case 'paused': return '已暂停';
      case 'completed': return '已完成';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'fasting': return 'text-blue-600 bg-blue-50';
      case 'eating': return 'text-orange-600 bg-orange-50';
      case 'completed': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleEndClick = () => {
    const minDurationSeconds = 30 * 60;
    if (elapsedSeconds < minDurationSeconds) {
      setShowEndConfirm(true);
    } else {
      handleConfirmEnd();
    }
  };

  const handleConfirmEnd = () => {
    onEndFast?.();
    setShowEndConfirm(false);
    
    const durationStr = formatDurationText(elapsedSeconds);
    const minDurationSeconds = 30 * 60;
    
    if (elapsedSeconds >= minDurationSeconds) {
        setSuccessMessage(`恭喜完成 ${durationStr} 的断食！`);
        setShowEndSuccess(true);
        setTimeout(() => setShowEndSuccess(false), 3000);
    }
  };

  const [successMessage, setSuccessMessage] = useState('');

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto relative">
      <div className="flex items-center gap-3 mb-8">
        <div className={`px-4 py-1.5 rounded-full text-sm font-semibold ${getStatusColor()}`}>
          {getStatusText()}
        </div>

        <button
          onClick={() => setIsPlanSelectorOpen(true)}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
        >
          <Zap className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
          <span>{fastingPlan} 计划</span>
        </button>
      </div>

      <PlanSelector isOpen={isPlanSelectorOpen} onClose={() => setIsPlanSelectorOpen(false)} />

      <div className="relative w-72 h-72 sm:w-80 sm:h-80 mb-8">
        <FluxRing 
          radius={144}
          stroke={12}
          progress={progress / 100}
          theme={phaseToTheme}
          className="w-full h-full"
        >
          <div className="flex flex-col items-center justify-center text-center z-20">
            <div className="text-sm font-medium text-gray-400 font-mono mb-1">
              {Math.round(progress)}%
            </div>
            
            <div className="text-5xl font-bold text-gray-900 tracking-tighter font-mono tabular-nums mb-3">
              {getDisplayTime()}
            </div>
            
            {status === 'fasting' && randomCopy ? (
              <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-700">
                <div className="text-xs font-bold text-orange-500 tracking-wider uppercase mb-0.5">
                  {randomCopy.label}
                </div>
                <div className="text-[10px] text-gray-400">
                  {randomCopy.sub}
                </div>
              </div>
            ) : (
               <div className="text-xs font-bold text-gray-400 tracking-wider uppercase">
                 {status === 'idle' ? 'READY TO FAST' : status.toUpperCase()}
               </div>
            )}
          </div>
        </FluxRing>
      </div>

      {status === 'fasting' && currentStage && (
        <div className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 mx-4">
          <div className="w-full flex justify-between items-center mb-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                {currentStage.name}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsStageDetailOpen(true);
                  }}
                  className="inline-flex items-center justify-center cursor-pointer"
                >
                  <Info className="w-4 h-4 text-gray-400" />
                </span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5 text-left">{currentStage.nameEn}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">
                {formatTime(elapsedSeconds)} / {currentStage.rangeEnd ? `${currentStage.rangeEnd}:00:00` : '∞'}
              </span>
            </div>
          </div>
          
          <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
            <div 
              className="absolute top-0 left-0 h-full transition-all duration-1000"
              style={{ 
                width: `${Math.min(100, (elapsedSeconds / 3600 - currentStage.rangeStart) / ((currentStage.rangeEnd || currentStage.rangeStart + 4) - currentStage.rangeStart) * 100)}%`,
                backgroundColor: currentStage.color 
              }} 
            />
          </div>

          {nextStage && (
             <div className="mt-2 text-xs text-gray-400 flex items-center justify-between">
                <span>下一阶段: {nextStage.name}</span>
                <span>{(nextStage.rangeStart - elapsedSeconds / 3600).toFixed(1)} 小时后</span>
             </div>
          )}
        </div>
      )}

      <div className="w-full px-4">
        {status === 'idle' || status === 'eating' ? (
          <button
            onClick={onStartFast}
            className="w-full flex items-center justify-center gap-2 py-4 bg-orange-500 text-white rounded-full shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 active:scale-95 transition-all font-bold text-lg"
          >
            <Play className="w-6 h-6 fill-current" />
            开始断食
          </button>
        ) : (
          <button
            onClick={handleEndClick}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gray-900 text-white rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all font-bold text-lg"
          >
            <Square className="w-5 h-5 fill-current" />
            结束断食
          </button>
        )}
      </div>

      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-in fade-in zoom-in duration-200 relative">
             <button
              onClick={() => setShowEndConfirm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-lg font-bold text-gray-900 mb-2">本次断食时间较短</h3>
            <p className="text-gray-600 mb-6">本次断食时间较短（ {Math.floor(elapsedSeconds / 60)} 分钟），建议不记录</p>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  cancelFast();
                  setShowEndConfirm(false);
                }}
                className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-600 bg-gray-50 hover:bg-gray-100"
              >
                不记录
              </button>
              <button 
                onClick={() => handleConfirmEnd()}
                className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800"
              >
                确认记录
              </button>
            </div>
          </div>
        </div>
      )}

      {isStageDetailOpen && currentStage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-in fade-in zoom-in duration-200 relative">
            <button
              onClick={() => setIsStageDetailOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-2">{currentStage.name}</h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
              {currentStage.detail || currentStage.description}
            </p>
            {currentStage.tip && (
              <div className="mt-4 bg-orange-50 rounded-xl p-4">
                <p className="text-sm text-orange-900/80 leading-relaxed">{currentStage.tip}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showFatBurningCue && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full shadow-lg z-50 animate-in fade-in zoom-in duration-200">
          燃脂模式已启动！
        </div>
      )}

      {showTargetReachedCue && (
        <div className="fixed inset-0 bg-black/35 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl px-6 py-5 shadow-2xl animate-in fade-in zoom-in duration-200 text-center">
            <p className="text-lg font-bold text-gray-900">目标达成</p>
            <p className="text-sm text-gray-600 mt-1">做得很棒，继续保持</p>
          </div>
        </div>
      )}

      {showEndSuccess && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 animate-in fade-in zoom-in duration-300">
           <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
             <Play className="w-4 h-4 fill-white rotate-[-90deg]" />
           </div>
           <div>
             <p className="font-bold text-lg">断食完成</p>
             <p className="text-sm text-gray-300">{successMessage}</p>
           </div>
        </div>
      )}
    </div>
  );
}
