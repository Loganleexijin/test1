import { useNavigate } from 'react-router-dom';
import { Calendar, Plus } from 'lucide-react';
import BottomNavigation from '@/components/BottomNavigation';
import FastingClock from '@/components/FastingClock';
import DailyTimeline from '@/components/DailyTimeline';
import DailyComprehensiveAnalysis from '@/components/DailyComprehensiveAnalysis';
import BackfillModal from '@/components/BackfillModal';
import { useState } from 'react';

export default function Home() {
  const navigate = useNavigate();
  const [showBackfillModal, setShowBackfillModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F9FC] pb-32 font-sans selection:bg-orange-100 selection:text-orange-900">
      {/* Header - Glassmorphism */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-md mx-auto px-5 py-3 flex justify-between items-center h-16">
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Flux</h1>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fasting Tracker</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowBackfillModal(true)}
              className="group flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm hover:border-orange-200 hover:text-orange-600 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-500 transition-colors" />
              <span className="text-xs font-bold text-slate-600 group-hover:text-orange-600">补录</span>
            </button>
            <button
              onClick={() => navigate('/history')}
              className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-full shadow-sm hover:border-orange-200 hover:text-orange-600 transition-all active:scale-95"
            >
              <Calendar className="w-4.5 h-4.5 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-md mx-auto px-5 pt-6 space-y-8">
        {/* Fasting Clock Section */}
        <section className="relative">
          <FastingClock />
        </section>

        {/* Analysis Section */}
        <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <DailyComprehensiveAnalysis />
        </section>

        {/* Timeline Section */}
        <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <DailyTimeline />
        </section>
      </main>
      
      <BottomNavigation />

      <BackfillModal
        isOpen={showBackfillModal}
        onClose={() => setShowBackfillModal(false)}
      />
    </div>
  );
}
