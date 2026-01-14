import { ArrowLeft, Utensils } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFastingStore } from '@/store/fastingStore';
import { useState } from 'react';
import BottomNavigation from '@/components/BottomNavigation';

type MealFilter = 'all' | 'breakfast' | 'lunch' | 'dinner' | 'snack';

export default function MealHistory() {
  const navigate = useNavigate();
  const { mealRecords } = useFastingStore();
  const [filter, setFilter] = useState<MealFilter>('all');

  const filteredMeals = filter === 'all' 
    ? mealRecords 
    : mealRecords.filter(m => m.type === filter);

  // Group by date
  const groupedMeals = filteredMeals.sort((a, b) => b.timestamp - a.timestamp).reduce((acc, meal) => {
    const date = new Date(meal.timestamp).toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(meal);
    return acc;
  }, {} as Record<string, typeof mealRecords>);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMealTypeLabel = (type: string) => {
    switch (type) {
      case 'breakfast': return '早餐';
      case 'lunch': return '午餐';
      case 'dinner': return '晚餐';
      case 'snack': return '加餐';
      default: return '未知';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                饮食记录
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value as MealFilter)}
                className="bg-gray-100 dark:bg-gray-700 text-sm border-none rounded-lg py-1.5 pl-3 pr-8 focus:ring-0"
              >
                <option value="all">全部</option>
                <option value="breakfast">早餐</option>
                <option value="lunch">午餐</option>
                <option value="dinner">晚餐</option>
                <option value="snack">加餐</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {Object.entries(groupedMeals).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Utensils className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">暂无饮食记录</p>
            <p className="text-sm text-gray-400 mt-1">点击底部相机图标开始记录</p>
          </div>
        ) : (
          Object.entries(groupedMeals).map(([date, meals]) => (
            <div key={date} className="mb-8">
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-4 ml-2 sticky top-20 bg-gray-50/95 dark:bg-gray-900/95 py-2 z-0 w-full">
                {date}
              </h3>
              <div className="space-y-4">
                {meals.map((meal) => (
                  <div key={meal.id} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm flex gap-4">
                    {/* Image */}
                    <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                      {meal.imageUrl ? (
                        <img src={meal.imageUrl} alt={meal.foodName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Utensils className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex items-start justify-between">
                          <h4 className="font-bold text-gray-900 dark:text-white text-lg truncate pr-2">
                            {meal.foodName}
                          </h4>
                          <span className="text-xs font-medium text-gray-400 whitespace-nowrap">
                            {formatDate(meal.timestamp)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            meal.type === 'breakfast' ? 'bg-orange-100 text-orange-700' :
                            meal.type === 'lunch' ? 'bg-green-100 text-green-700' :
                            meal.type === 'dinner' ? 'bg-blue-100 text-blue-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {getMealTypeLabel(meal.type)}
                          </span>
                          <span className="text-sm font-bold text-orange-500">
                            {meal.calories} kcal
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {meal.tags?.slice(0, 3).map((tag, i) => (
                          <span key={i} className="text-[10px] px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-md">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
