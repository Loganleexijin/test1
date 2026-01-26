import { useFastingStore } from '@/store/fastingStore';
import { UtensilsCrossed, Moon, Cookie, Plus, Flame, Clock, AlertCircle, ChevronRight, Sun, Sunrise } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, Pill, Tag } from '@/components/ui/UiPrimitives';

export default function DailyTimeline() {
  const { mealRecords } = useFastingStore();
  const navigate = useNavigate();
  
  const today = new Date().setHours(0, 0, 0, 0);
  const todaysMeals = mealRecords
    .filter(m => new Date(m.timestamp).setHours(0, 0, 0, 0) === today)
    .sort((a, b) => a.timestamp - b.timestamp);

  const getMealIcon = (type: string) => {
    switch (type) {
      case 'breakfast': return Sunrise;
      case 'lunch': return Sun;
      case 'dinner': return Moon;
      default: return Cookie;
    }
  };

  const getMealLabel = (type: string) => {
    switch (type) {
      case 'breakfast': return '早餐';
      case 'lunch': return '午餐';
      case 'dinner': return '晚餐';
      default: return '加餐';
    }
  };

  const getSuggestedTime = (type: string) => {
    switch (type) {
      case 'breakfast': return '07:00 - 09:00';
      case 'lunch': return '12:00 - 13:30';
      case 'dinner': return '17:00 - 19:00';
      default: return '任意时间';
    }
  };

  const formatTime = (timestamp: number) =>
    new Date(timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

  const mealsByType = {
    breakfast: todaysMeals.filter(m => m.type === 'breakfast'),
    lunch: todaysMeals.filter(m => m.type === 'lunch'),
    dinner: todaysMeals.filter(m => m.type === 'dinner'),
    snack: todaysMeals.filter(m => m.type === 'snack')
  };

  const getMealStyles = (type: string) => {
    switch (type) {
      case 'breakfast':
        return {
          dot: 'bg-amber-400 ring-amber-100',
          text: 'text-amber-600',
          bg: 'bg-amber-50',
          border: 'border-amber-100'
        };
      case 'lunch':
        return {
          dot: 'bg-emerald-400 ring-emerald-100',
          text: 'text-emerald-600',
          bg: 'bg-emerald-50',
          border: 'border-emerald-100'
        };
      case 'dinner':
        return {
          dot: 'bg-indigo-400 ring-indigo-100',
          text: 'text-indigo-600',
          bg: 'bg-indigo-50',
          border: 'border-indigo-100'
        };
      default:
        return {
          dot: 'bg-slate-300 ring-slate-100',
          text: 'text-slate-500',
          bg: 'bg-slate-50',
          border: 'border-slate-100'
        };
    }
  };

  const renderConnector = (type: string) => {
    const styles = getMealStyles(type);
    return (
      <div className="relative flex flex-col items-center justify-center h-8">
        <div className="w-[2px] h-full bg-slate-100 rounded-full"></div>
        <div className={`w-2 h-2 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${styles.dot} ring-4 ring-white`}></div>
      </div>
    );
  };

  const renderMealCard = (meal: typeof todaysMeals[0], index: number) => {
    const Icon = getMealIcon(meal.type);
    const styles = getMealStyles(meal.type);

    return (
      <Card key={meal.id} className="w-full p-4 border border-slate-100 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.05)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${styles.bg} ${styles.text}`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900">{getMealLabel(meal.type)}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400 text-xs font-medium">
            <Clock className="w-3 h-3" />
            {formatTime(meal.timestamp)}
          </div>
        </div>

        {/* Content */}
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-50 shrink-0 relative flex items-center justify-center">
            {meal.imageUrl ? (
              <img src={meal.imageUrl} alt={meal.foodName} className="w-full h-full object-cover" />
            ) : (
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${styles.bg} ${styles.text}`}>
                <Icon className="w-6 h-6" />
              </div>
            )}
            {meal.status === 'analyzing' && (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin"></div>
              </div>
            )}
            {meal.status === 'error' && (
              <div className="absolute inset-0 bg-red-50/80 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <h4 className={`font-bold truncate text-[15px] ${meal.status === 'error' ? 'text-red-500' : 'text-slate-900'}`}>
                {meal.status === 'analyzing' ? '正在分析...' : meal.status === 'error' ? '分析失败' : meal.foodName}
              </h4>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {meal.status === 'done' && (
                <Tag className="bg-orange-50 text-orange-600 h-6 px-2 text-xs" icon={<Flame className="w-3 h-3" />}>
                  {meal.calories} kcal
                </Tag>
              )}
              {meal.tags?.slice(0, 2).map((tag) => (
                <Tag key={tag} className="bg-slate-50 text-slate-500 h-6 px-2 text-xs">{tag}</Tag>
              ))}
            </div>

            {meal.status === 'error' && (
              <div className="mt-1 text-[10px] text-red-400">请尝试重新上传</div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  const renderEmptySlot = (type: 'breakfast' | 'lunch' | 'dinner') => {
    const Icon = getMealIcon(type);
    const styles = getMealStyles(type);
    
    return (
      <div key={`empty-${type}`}>
        <div className="flex items-center gap-2 mb-3 px-1">
          <Icon className={`w-4 h-4 ${styles.text}`} />
          <span className={`font-bold ${styles.text}`}>{getMealLabel(type)}</span>
        </div>
        <button
          onClick={() => navigate('/camera')}
          className="w-full h-16 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-between px-5 hover:border-amber-200 hover:bg-amber-50/40 transition-colors group bg-white/50 backdrop-blur-sm"
        >
          <span className="text-xs text-slate-400 group-hover:text-slate-500 flex items-center gap-2">
            <Plus className="w-3.5 h-3.5" />
            建议时间 {getSuggestedTime(type)}
          </span>
          <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm">
            <Plus className="w-4 h-4" />
          </div>
        </button>
      </div>
    );
  };

  const renderSection = (type: 'breakfast' | 'lunch' | 'dinner', meals: typeof todaysMeals, isFirst: boolean) => {
    const hasMeals = meals.length > 0;
    
    return (
      <div className="relative">
        {!isFirst && renderConnector(type)}
        <div className="relative z-10">
          {hasMeals ? meals.map((meal, idx) => renderMealCard(meal, idx)) : renderEmptySlot(type)}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-md mx-auto mt-6 px-4">
      <div className="flex items-center gap-2 mb-6 px-1">
        <h3 className="text-lg font-bold text-slate-900">三餐记录</h3>
        <Pill className="bg-slate-100 text-slate-500 text-xs h-6">时间轴</Pill>
      </div>
      
      <div className="flex flex-col">
        {renderSection('breakfast', mealsByType.breakfast, true)}
        {renderSection('lunch', mealsByType.lunch, false)}
        {renderSection('dinner', mealsByType.dinner, false)}
        
        {/* Snacks Section - simpler rendering without connector for now, or append */}
        {mealsByType.snack.length > 0 && (
          <div className="relative mt-4 pt-4 border-t border-slate-100">
             <div className="flex items-center gap-2 mb-3 px-1">
                <Cookie className="w-4 h-4 text-slate-400" />
                <span className="font-bold text-slate-500">加餐</span>
             </div>
             <div className="space-y-3">
                {mealsByType.snack.map((meal, idx) => renderMealCard(meal, idx))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
