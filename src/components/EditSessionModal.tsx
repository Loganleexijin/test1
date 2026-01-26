import { useEffect, useState } from 'react';
import { X, Save, AlertTriangle } from 'lucide-react';
import { useFastingStore } from '@/store/fastingStore';
import type { FastingSession } from '@/types';

interface EditSessionModalProps {
  isOpen: boolean;
  session: FastingSession | null;
  onClose: () => void;
}

const toLocalInputValue = (timestamp: number) => {
  const date = new Date(timestamp);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const getDayLabel = (value: string) => {
  if (!value) return '--';
  const time = new Date(value).getTime();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(time);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '明天';
  if (diffDays === -1) return '昨天';
  if (diffDays > 1) return `${diffDays}天后`;
  return `${Math.abs(diffDays)}天前`;
};

export default function EditSessionModal({ isOpen, session, onClose }: EditSessionModalProps) {
  const { updateHistorySessionTimes } = useFastingStore();
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session || !isOpen) return;
    setStartTime(toLocalInputValue(session.start_at));
    setEndTime(session.end_at ? toLocalInputValue(session.end_at) : '');
    setError('');
  }, [session, isOpen]);

  if (!isOpen || !session) return null;

  const startLabel = getDayLabel(startTime);
  const endLabel = getDayLabel(endTime);
  const rangeLabel = startLabel !== '--' && endLabel !== '--' ? `${startLabel} → ${endLabel}` : '';

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

    updateHistorySessionTimes(session.id, start, end);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">修改断食时间</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">开始时间</label>
              <span className="text-xs text-gray-400">{startLabel}</span>
            </div>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">结束时间</label>
              <span className="text-xs text-gray-400">{endLabel}</span>
            </div>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => {
                setEndTime(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {rangeLabel && (
            <div className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-700/40 rounded-lg px-3 py-2">
              日期跨度：{rangeLabel}
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
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
