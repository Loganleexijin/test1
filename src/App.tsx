import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useMemo } from 'react';
import { useTheme } from './hooks/useTheme';
import { useSupabaseAuth } from './hooks/useSupabaseAuth';
import Home from './pages/Home';
import Settings from './pages/Settings';
import History from './pages/History';
import MealHistory from './pages/MealHistory';
import { useFastingStore } from './store/fastingStore';

function GlobalAiLoader() {
  const { mealRecords } = useFastingStore();
  const isAnalyzing = useMemo(() => mealRecords.some((m) => m.status === 'analyzing'), [mealRecords]);

  return (
    <div
      className={`fixed top-4 right-4 z-[120] transition-all duration-300 ${isAnalyzing ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
    >
      <div className="flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 border border-gray-100 dark:border-gray-700 rounded-full px-3 py-1.5 shadow-sm">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
        </span>
        <span className="text-[11px] text-gray-600 dark:text-gray-300">AI 分析中</span>
      </div>
    </div>
  );
}

function App() {
  useTheme();
  useSupabaseAuth();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/history" element={<History />} />
          <Route path="/meals" element={<MealHistory />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <GlobalAiLoader />
      </div>
    </Router>
  );
}

export default App;
