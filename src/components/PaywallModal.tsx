import { X, Crown, Sparkles, Check } from 'lucide-react';
import { useFastingStore } from '@/store/fastingStore';
import type { SubscriptionType } from '@/types';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
  const { setSubscriptionType } = useFastingStore();

  if (!isOpen) return null;

  const handleSubscribe = (type: SubscriptionType) => {
    setSubscriptionType(type);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              升级到 Pro
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              AI 餐盘分析 - 智能识别食物热量与营养
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700 dark:text-gray-300">
              深度数据回顾 - 查看周/月趋势图表
            </p>
          </div>

        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleSubscribe('monthly')}
            className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  月卡
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  $4.99 / 月
                </p>
              </div>
              <Sparkles className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </div>
          </button>

          <button
            onClick={() => handleSubscribe('yearly')}
            className="w-full px-6 py-4 rounded-xl border-2 border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 hover:shadow-lg transition-all relative"
          >
            <div className="absolute -top-3 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              立省 50%
            </div>
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  年卡
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  $29.99 / 年
                </p>
              </div>
              <Crown className="w-5 h-5 text-yellow-500" />
            </div>
          </button>

          <button
            onClick={() => handleSubscribe('lifetime')}
            className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-500 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  终身买断
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  $69.99 一次性
                </p>
              </div>
              <Sparkles className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors" />
            </div>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
        >
          以后再说
        </button>
      </div>
    </div>
  );
}
