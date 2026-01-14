import { useState } from 'react';
import { X, Save, Calendar, Clock } from 'lucide-react';
import { useFastingStore } from '@/store/fastingStore';
import type { SessionSource } from '@/types';

interface BackfillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BackfillModal({ isOpen, onClose }: BackfillModalProps) {
  const { backfillSession, fastingPlan } = useFastingStore();
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [durationHours, setDurationHours] = useState(16);
  const [error, setError] = useState('');

  const getPlanHours = (plan: string): number => {
    switch (plan) {
      case '16:8': return 16;
      case '18:6': return 18;
      case '20:4': return 20;
      default: return 16;
    }
  };

  if (!isOpen) return null;

  const handleSave = () => {
    if (!startTime || !endTime) {
      setError('请填写开始和结束时间');
      return;
    }

    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const now = Date.now();

    if (start >= end) {
      setError('结束时间必须晚于开始时间');
      return;
    }

    if (end > now) {
      setError('结束时间不能晚于当前时间');
      return;
    }

    backfillSession({
      fasting_status: 'completed',
      start_at: start,
      end_at: end,
      target_duration_hours: durationHours,
      source: 'backfill' as SessionSource,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            补录断食记录
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              开始时间
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              结束时间
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              目标时长（小时）
            </label>
            <input
              type="number"
              value={durationHours}
              onChange={(e) => setDurationHours(Number(e.target.value))}
              min={1}
              max={24}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              当前计划：<span className="font-semibold">{fastingPlan}</span> 
              （目标 {getPlanHours(fastingPlan)} 小时）
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:shadow-lg transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
