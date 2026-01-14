import { useNavigate } from 'react-router-dom';
import { ChevronRight, Utensils } from 'lucide-react';
import { useFastingStore } from '@/store/fastingStore';

export default function DailyMealsCard() {
  const navigate = useNavigate();
  const { mealRecords } = useFastingStore();
  
  // Filter for today's meals
  const today = new Date().setHours(0, 0, 0, 0);
  const todaysMeals = mealRecords.filter(m => new Date(m.timestamp).setHours(0, 0, 0, 0) === today);

  // Group by meal type
  const breakfast = todaysMeals.find(m => m.type === 'breakfast');
  const lunch = todaysMeals.find(m => m.type === 'lunch');
  const dinner = todaysMeals.find(m => m.type === 'dinner');

  const totalCalories = todaysMeals.reduce((sum, m) => sum + (m.calories || 0), 0);

  return (
    <div className="w-full max-w-md mx-auto mt-6 px-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          今日饮食
          <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {totalCalories} kcal
          </span>
        </h2>
        <button 
          onClick={() => navigate('/meals')}
          className="text-xs text-gray-400 flex items-center hover:text-gray-600"
        >
          全部记录 <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Breakfast */}
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[100px] relative overflow-hidden group">
          {breakfast ? (
            <>
              <img src={breakfast.imageUrl} alt="Breakfast" className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <p className="text-xs text-white font-medium truncate">{breakfast.foodName}</p>
                <p className="text-[10px] text-white/80">{breakfast.calories} kcal</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center mb-2">
                <Utensils className="w-4 h-4 text-orange-400" />
              </div>
              <span className="text-xs text-gray-400">早餐</span>
            </>
          )}
        </div>

        {/* Lunch */}
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[100px] relative overflow-hidden group">
          {lunch ? (
            <>
              <img src={lunch.imageUrl} alt="Lunch" className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <p className="text-xs text-white font-medium truncate">{lunch.foodName}</p>
                <p className="text-[10px] text-white/80">{lunch.calories} kcal</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center mb-2">
                <Utensils className="w-4 h-4 text-orange-400" />
              </div>
              <span className="text-xs text-gray-400">午餐</span>
            </>
          )}
        </div>

        {/* Dinner */}
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[100px] relative overflow-hidden group">
          {dinner ? (
            <>
              <img src={dinner.imageUrl} alt="Dinner" className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <p className="text-xs text-white font-medium truncate">{dinner.foodName}</p>
                <p className="text-[10px] text-white/80">{dinner.calories} kcal</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center mb-2">
                <Utensils className="w-4 h-4 text-orange-400" />
              </div>
              <span className="text-xs text-gray-400">晚餐</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
