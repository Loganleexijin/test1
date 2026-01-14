import React, { useState } from 'react';
import { Check, X, Zap, Flame, Battery, Shield, Hourglass } from 'lucide-react';
import { FastingPlan } from '@/types';
import { useFastingStore } from '@/store/fastingStore';

interface PlanConfig {
  id: FastingPlan;
  label: string;
  hours: number;
  eatingHours: number;
  slogan: string;
  desc: string;
  icon: React.ReactNode;
  level: number; // 1-5 难度
  color: string;
  bgColor: string;
}

const PLAN_CONFIGS: PlanConfig[] = [
  {
    id: '12:12',
    label: '生物钟韵律',
    hours: 12,
    eatingHours: 12,
    slogan: '睡一觉就完成了',
    desc: '让消化系统在夜间彻底休息，改善晨起水肿',
    icon: <Battery className="w-5 h-5" />,
    level: 1,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    id: '16:8',
    label: '黄金标准',
    hours: 16,
    eatingHours: 8,
    slogan: '跳过一顿早餐，换来全天的高效燃脂',
    desc: '触达轻度燃脂期，有效控制体重，保持精力充沛',
    icon: <Zap className="w-5 h-5" />,
    level: 2,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50'
  },
  {
    id: '18:6',
    label: '战士模式',
    hours: 18,
    eatingHours: 6,
    slogan: '将进食压缩在午后，给身体更深层的净化',
    desc: '稳定进入自噬初期，加速顽固脂肪分解',
    icon: <Flame className="w-5 h-5" />,
    level: 3,
    color: 'text-red-500',
    bgColor: 'bg-red-50'
  },
  {
    id: '20:4',
    label: '深度燃脂',
    hours: 20,
    eatingHours: 4,
    slogan: '挑战身体潜能，激活深层代谢',
    desc: '强化细胞自噬，深度清理体内垃圾',
    icon: <Shield className="w-5 h-5" />,
    level: 4,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  {
    id: '23:1',
    label: '僧侣修行',
    hours: 23,
    eatingHours: 1,
    slogan: '每日一次的盛宴，其余时间留给大脑和灵感',
    desc: '深度细胞自噬，极致的胰岛素敏感性修复',
    icon: <Hourglass className="w-5 h-5" />,
    level: 5,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50'
  }
];

interface PlanSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PlanSelector({ isOpen, onClose }: PlanSelectorProps) {
  const { fastingPlan, setFastingPlan, currentSession, updateCurrentSessionTarget } = useFastingStore();
  const [selectedPlanId, setSelectedPlanId] = useState<FastingPlan>(fastingPlan);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedPlanId(fastingPlan);
    }
  }, [isOpen, fastingPlan]);

  const handlePlanSelect = (plan: FastingPlan) => {
    setSelectedPlanId(plan);
  };

  const handleConfirm = () => {
    const selectedConfig = PLAN_CONFIGS.find(p => p.id === selectedPlanId);
    if (!selectedConfig) return;

    setFastingPlan(selectedPlanId);

    if (currentSession && currentSession.fasting_status === 'fasting') {
      updateCurrentSessionTarget(selectedConfig.hours);
    }

    onClose();
  };

  const getEndTimePreview = (hours: number) => {
    if (!currentSession || currentSession.fasting_status !== 'fasting') {
        const now = new Date();
        const end = new Date(now.getTime() + hours * 60 * 60 * 1000);
        return `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;
    }
    
    const start = new Date(currentSession.start_at);
    const end = new Date(start.getTime() + hours * 60 * 60 * 1000);
    return `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;
  };

  const selectedConfig = PLAN_CONFIGS.find(p => p.id === selectedPlanId);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[100] transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-[110] max-h-[85dvh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between p-6 pb-2">
          <h2 className="text-xl font-bold text-gray-900">选择你的节奏</h2>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-3">
          {PLAN_CONFIGS.map((plan) => (
            <button
              key={plan.id}
              onClick={() => handlePlanSelect(plan.id)}
              className={`w-full text-left relative p-4 rounded-2xl border-2 transition-all duration-200 ${
                selectedPlanId === plan.id 
                  ? 'border-orange-500 bg-orange-50/30 shadow-sm scale-[1.01]' 
                  : 'border-transparent bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Visual Icon */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${plan.bgColor} ${plan.color}`}>
                  {plan.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-gray-900 text-lg">
                      {plan.label} <span className="text-sm font-normal text-gray-500 ml-1">({plan.id})</span>
                    </h3>
                    {selectedPlanId === plan.id && (
                      <div className="bg-orange-500 rounded-full p-1">
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs font-medium text-gray-500 mb-2 line-clamp-1">{plan.slogan}</p>
                  
                  {/* Difficulty Dots */}
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div 
                        key={i} 
                        className={`w-1.5 h-1.5 rounded-full ${i <= plan.level ? plan.color.replace('text-', 'bg-') : 'bg-gray-200'}`} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="px-6 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] border-t border-gray-100 bg-white">
          {selectedConfig && (
            <div className="mb-4 flex items-center justify-between text-sm bg-gray-50 px-4 py-3 rounded-xl text-gray-600">
               <span>预计结束时间</span>
               <span className="font-mono font-bold text-gray-900">
                 今天 {getEndTimePreview(selectedConfig.hours)}
               </span>
            </div>
          )}
          
          <button
            onClick={handleConfirm}
            className="w-full py-4 bg-gray-900 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl active:scale-95 transition-all"
          >
            确认切换
          </button>
        </div>
      </div>
    </>
  );
}
