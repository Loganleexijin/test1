import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Play, Square, X, Zap, Pencil, Flame, Leaf, Dna, Activity, Sparkles, Droplet } from 'lucide-react';
import { useFastingStore } from '@/store/fastingStore';
import { getCurrentStage, getNextStage, shouldTriggerFatBurningCue } from '@/utils/fastingStages';
import FluxRing, { FluxTheme } from './FluxRing';
import PlanSelector from './PlanSelector';
import EditTimeModal from './EditTimeModal';
import { Card, Pill } from '@/components/ui/UiPrimitives';

const PHASE_COPY: Record<string, Array<{ label: string; sub: string }>> = {
  phase1: [
    { label: '血糖下降期', sub: '身体正在适应中' },
    { label: '能量储存期', sub: '身体正在消化食物' },
  ],
  phase2: [
    { label: '血糖平稳期', sub: '胰岛素正在下降' },
  ],
  phase3: [
    { label: '高效燃脂期', sub: '脂肪开始燃烧' },
  ],
  phase4: [
    { label: '细胞自噬期', sub: '深层细胞净化' },
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
  const {
    currentSession,
    loadSession,
    cancelFast,
    fastingPlan,
    stageCopyIndex,
    setStageCopyIndex,
  } = useFastingStore();
  const [elapsedSeconds, setElapsedSeconds] = useState(() => {
    if (!currentSession || currentSession.fasting_status === 'idle') return 0;
    return Math.floor((Date.now() - currentSession.start_at) / 1000);
  });
  
  const [remainingSeconds, setRemainingSeconds] = useState(() => {
    if (!currentSession || currentSession.fasting_status === 'idle') return 0;
    const elapsed = Math.floor((Date.now() - currentSession.start_at) / 1000);
    const target = currentSession.target_duration_hours * 3600;
    return Math.max(0, target - elapsed);
  });
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [isStageDetailOpen, setIsStageDetailOpen] = useState(false);
  const [showFatBurningCue, setShowFatBurningCue] = useState(false);
  const [isPlanSelectorOpen, setIsPlanSelectorOpen] = useState(false);
  const [showEditStart, setShowEditStart] = useState(false);
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
  }, [currentSession]);

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

  const copyIndex = currentStage ? stageCopyIndex[currentStage.id] : undefined;

  useEffect(() => {
    if (!currentStage) return;
    if (typeof copyIndex === 'number') return;
    const copies = PHASE_COPY[currentStage.id] || PHASE_COPY.phase1;
    const randomIndex = Math.floor(Math.random() * copies.length);
    setStageCopyIndex(currentStage.id, randomIndex);
  }, [currentStage, copyIndex, setStageCopyIndex]);

  const randomCopy = useMemo(() => {
    if (!currentStage) return null;
    const copies = PHASE_COPY[currentStage.id] || PHASE_COPY.phase1;
    const index = typeof copyIndex === 'number' ? copyIndex : 0;
    return copies[index % copies.length];
  }, [currentStage, copyIndex]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatClockTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDayLabel = (timestamp: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(timestamp);
    target.setHours(0, 0, 0, 0);
    const diffDays = Math.round((target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '明天';
    if (diffDays === -1) return '昨天';
    if (diffDays > 1) return `${diffDays}天后`;
    return `${Math.abs(diffDays)}天前`;
  };

  const formatDayTime = (timestamp: number) => {
    return `${getDayLabel(timestamp)} ${formatClockTime(timestamp)}`;
  };

  const getSessionEndEstimate = () => {
    if (!currentSession) return null;
    if (currentSession.end_at) return currentSession.end_at;
    return currentSession.start_at + currentSession.target_duration_hours * 3600 * 1000;
  };

  const canEditStartTime = () => {
    if (!currentSession) return false;
    const elapsedMinutes = Math.floor((Date.now() - currentSession.start_at) / 60000);
    return elapsedMinutes <= 30;
  };

  const getDisplayTime = () => {
    if (status === 'idle') {
      return `${currentSession?.target_duration_hours || 16}:00:00`;
    }
    return remainingSeconds > 0 ? formatTime(remainingSeconds) : formatTime(elapsedSeconds);
  };

  const getTimeLabel = () => {
    switch (status) {
      case 'fasting': return '剩余时间';
      case 'eating': return '进食窗口';
      case 'completed': return '断食时长';
      case 'paused': return '已暂停';
      default: return '计划时长';
    }
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
      case 'fasting': return 'text-green-600 bg-green-50';
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
  };

  const getPhaseColor = () => {
    if (!currentStage) return 'text-orange-500';
    switch (currentStage.id) {
      case 'phase1': return 'text-orange-500';
      case 'phase2': return 'text-teal-500';
      case 'phase3': return 'text-indigo-500';
      default: return 'text-purple-500';
    }
  };

  const activeStageId = currentStage?.id === 'phase5' ? 'phase4' : currentStage?.id;
  const stageTabs = [
    { id: 'phase1', label: '血糖下降', icon: Flame, active: 'bg-orange-50 text-orange-500', idle: 'text-gray-300' },
    { id: 'phase2', label: '脂肪燃烧', icon: Activity, active: 'bg-emerald-50 text-emerald-500', idle: 'text-gray-300' },
    { id: 'phase3', label: '进入酮症', icon: Dna, active: 'bg-indigo-50 text-indigo-500', idle: 'text-gray-300' },
    { id: 'phase4', label: '细胞自噬', icon: Leaf, active: 'bg-purple-50 text-purple-500', idle: 'text-gray-300' }
  ];

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto relative">
      {/* Main Clock Card */}
      <div className="w-full bg-white rounded-[2.5rem] p-6 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden mb-6">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-slate-50/80 to-transparent pointer-events-none" />
        
        {/* Header: Status & Plan */}
        <div className="relative flex items-center justify-between mb-8 z-10">
          <Pill className={`px-4 py-1.5 text-xs font-bold tracking-wide uppercase ${getStatusColor()}`}>
            {getStatusText()}
          </Pill>
          <button
            onClick={() => setIsPlanSelectorOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 text-slate-500 text-xs font-bold border border-slate-100 hover:bg-slate-100 transition-colors"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>{fastingPlan}</span>
          </button>
        </div>

        <PlanSelector isOpen={isPlanSelectorOpen} onClose={() => setIsPlanSelectorOpen(false)} />

        {/* Ring */}
        <div className="relative w-64 h-64 mx-auto mb-2">
          <FluxRing
            radius={128}
            stroke={16}
            progress={progress / 100}
            theme={phaseToTheme}
            className="w-full h-full drop-shadow-2xl"
          >
            <div className="flex flex-col items-center justify-center text-center z-20">
              <div className="text-xs font-bold text-slate-400 font-mono mb-1 tracking-widest">{getTimeLabel()}</div>
              <div className="text-[3.5rem] leading-none font-black text-slate-900 tracking-tighter font-sans tabular-nums mb-2">
                {getDisplayTime()}
              </div>
              <div className="text-sm font-bold text-slate-400 font-mono mb-4">{Math.round(progress)}%</div>
              
              {status === 'fasting' && (randomCopy || currentStage) ? (
                <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-700 bg-slate-50/80 backdrop-blur-sm px-4 py-2 rounded-2xl border border-slate-100/50">
                  <div className={`text-xs font-bold tracking-wider mb-0.5 ${getPhaseColor()}`}>
                    {randomCopy?.label || currentStage?.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">{randomCopy?.sub || currentStage?.nameEn}</div>
                </div>
              ) : (
                <div className="text-xs font-bold text-slate-300 tracking-[0.2em] uppercase">
                  {status === 'idle' ? 'READY' : status.toUpperCase()}
                </div>
              )}
            </div>
          </FluxRing>

          {/* Floating Icons */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2">
            <div className="w-8 h-8 rounded-full bg-orange-400 text-white flex items-center justify-center shadow-[0_8px_16px_-6px_rgba(251,146,60,0.6)] ring-4 ring-white">
              <Droplet className="w-4 h-4" />
            </div>
          </div>
        </div>
        
        {/* Time Editor Row */}
        {currentSession && status !== 'idle' && (
          <div className="flex items-center justify-between gap-3 mt-6 pt-6 border-t border-slate-50">
            <button
              onClick={() => setShowEditStart(true)}
              disabled={!canEditStartTime()}
              className="flex-1 flex flex-col items-start gap-1 p-3 hover:bg-slate-50 rounded-2xl transition-colors group text-left"
            >
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Start</span>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-slate-700 group-hover:text-slate-900">{formatDayTime(currentSession.start_at).split(' ').pop()}</span>
                {canEditStartTime() && <Pencil className="w-3 h-3 text-slate-300" />}
              </div>
            </button>
            <div className="w-px h-8 bg-slate-100"></div>
            <button
              onClick={() => setIsPlanSelectorOpen(true)}
              className="flex-1 flex flex-col items-end gap-1 p-3 hover:bg-slate-50 rounded-2xl transition-colors group text-right"
            >
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">End</span>
              <div className="flex items-center gap-2">
                 <span className="text-base font-bold text-slate-700 group-hover:text-slate-900">
                  {getSessionEndEstimate() ? formatDayTime(getSessionEndEstimate() as number).split(' ').pop() : '--:--'}
                </span>
                <Pencil className="w-3 h-3 text-slate-300" />
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Stages Grid */}
      <div className="grid grid-cols-4 gap-3 w-full mb-6">
        {stageTabs.map((tab) => {
          const isActive = activeStageId === tab.id;
          const Icon = tab.icon;
          return (
            <div
              key={tab.id}
              className={`flex flex-col items-center justify-center gap-2 rounded-2xl py-3 px-1 transition-all duration-300 ${
                isActive 
                  ? `${tab.active} shadow-sm scale-105 font-bold` 
                  : 'bg-white text-slate-300 border border-slate-100 hover:border-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'fill-current' : 'stroke-[2.5px]'}`} />
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </div>
          );
        })}
      </div>

      {status === 'fasting' && currentStage && (
        <Card className="w-full bg-white border-slate-100 p-5 mb-6 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.05)] rounded-[1.5rem]">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStage.id === 'phase1' ? 'bg-orange-100 text-orange-600' : 'bg-indigo-100 text-indigo-600'}`}>
                {currentStage.id === 'phase1' ? <Flame className="w-5 h-5 fill-current" /> : <Activity className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">{currentStage.name}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{currentStage.nameEn}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-slate-900 font-mono">
                {formatTime(elapsedSeconds)}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                / {currentStage.rangeEnd ? `${currentStage.rangeEnd}h` : '16h'}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-2">
            <p className="text-xs text-slate-600 leading-relaxed font-medium">{currentStage.detail || currentStage.description}</p>
          </div>
          
          {nextStage && (
             <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium px-1">
               <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
               <span>Next: {nextStage.name}</span>
               <span className="text-slate-300">·</span>
               <span>{(nextStage.rangeStart - elapsedSeconds / 3600).toFixed(1)}h later</span>
             </div>
          )}
        </Card>
      )}
      
      {/* Removed old time editor, moved inside card */}

      <div className="w-full">
        {status === 'idle' || status === 'eating' ? (
          <button
            onClick={onStartFast}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-orange-500 text-white rounded-2xl shadow-[0_18px_28px_-20px_rgba(249,115,22,0.8)] active:scale-95 transition-all font-bold text-base"
          >
            <Play className="w-5 h-5 fill-current" />
            开始断食
          </button>
        ) : (
          <button
            onClick={handleEndClick}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-900 text-white rounded-2xl shadow-[0_18px_28px_-20px_rgba(15,23,42,0.9)] active:scale-95 transition-all font-bold text-base"
          >
            <Square className="w-4 h-4 fill-current" />
            结束断食
          </button>
        )}
      </div>

      <EditTimeModal isOpen={showEditStart} onClose={() => setShowEditStart(false)} />

      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
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
         <div className="fixed top-1/4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-sm font-medium z-50 animate-in fade-in slide-in-from-top-4">
           🔥 进入燃脂模式
         </div>
      )}
    </div>
  );
}
