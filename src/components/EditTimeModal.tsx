import { useState, useEffect } from 'react';
import { X, Save, AlertTriangle } from 'lucide-react';
import { useFastingStore } from '@/store/fastingStore';

interface EditTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditTimeModal({ isOpen, onClose }: EditTimeModalProps) {
  const { currentSession, adjustStartTime } = useFastingStore();
  const [newStartTime, setNewStartTime] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentSession && isOpen) {
      const date = new Date(currentSession.start_at);
      const localISOTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
      setNewStartTime(localISOTime);
    }
  }, [currentSession, isOpen]);

  if (!isOpen || !currentSession) return null;

  const handleSave = () => {
    if (!newStartTime) {
      setError('请选择开始时间');
      return;
    }

    const selectedTime = new Date(newStartTime).getTime();

    if (selectedTime > Date.now()) {
      setError('开始时间不能晚于当前时间');
      return;
    }

    const originalTime = currentSession.start_at;
    const diffMinutes = Math.abs((selectedTime - originalTime) / 60000);

    if (diffMinutes > 60) {
      setError('调整时间不能超过1小时');
      return;
    }

    adjustStartTime(selectedTime);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            修改开始时间
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                  微调时间范围
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  仅可在开始后30分钟内调整，调整范围前后1小时内
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              新的开始时间
            </label>
            <input
              type="datetime-local"
              value={newStartTime}
              max={new Date().toISOString().slice(0, 16)}
              onChange={(e) => {
                setNewStartTime(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
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
