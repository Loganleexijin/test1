import { useFastingStore } from '@/store/fastingStore';
import FastingClock from '@/components/FastingClock';
import SecondaryActions from '@/components/SecondaryActions';
import BottomNavigation from '@/components/BottomNavigation';
import DailyMealsCard from '@/components/DailyMealsCard';
import { Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { startFast, endFast, fastingPlan } = useFastingStore();
  const navigate = useNavigate();

  const getTargetHours = () => {
    switch (fastingPlan) {
      case '12:12': return 12;
      case '16:8': return 16;
      case '18:6': return 18;
      case '20:4': return 20;
      case '23:1': return 23;
      default: return 16;
    }
  };

  const handleStartFast = () => {
    startFast(getTargetHours());
  };

  const handleEndFast = () => {
    endFast();
  };

  return (
    <div className="min-h-screen bg-white pb-28">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md">
        <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">
            Flux
          </h1>
          <button 
            onClick={() => navigate('/history')}
            className="p-2 hover:bg-gray-50 rounded-full transition-colors"
          >
            <Calendar className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-md mx-auto py-4">
        <FastingClock
          onStartFast={handleStartFast}
          onEndFast={handleEndFast}
        />
        
        <DailyMealsCard />
        
        <SecondaryActions />
      </main>
      
      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
