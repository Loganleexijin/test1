import { ArrowLeft, Clock, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFastingStore } from '@/store/fastingStore';
import BottomNavigation from '@/components/BottomNavigation';

export default function History() {
  const navigate = useNavigate();
  const { historySessions, subscriptionType } = useFastingStore();

  const displaySessions = subscriptionType === 'free' 
    ? historySessions.slice(0, 7)
    : historySessions;

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}小时${mins}分钟`;
  };

  const stats = {
    total: historySessions.length,
    completed: historySessions.filter(s => s.completed).length,
    avgDuration: historySessions.length > 0
      ? Math.round(historySessions.reduce((sum, s) => sum + s.duration_minutes, 0) / historySessions.length)
      : 0,
    completionRate: historySessions.length > 0
      ? Math.round((historySessions.filter(s => s.completed).length / historySessions.length) * 100)
      : 0,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              历史记录
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {subscriptionType === 'free' && historySessions.length > 7 && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              免费用户仅显示最近 7 条记录，升级 Pro 查看完整历史和趋势图表
            </p>
          </div>
        )}

        {subscriptionType !== 'free' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                统计概览
              </h2>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div className="text-center">
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.total}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                  总记录
                </p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {stats.completed}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                  已完成
                </p>
              </div>
              <div className="text-center flex flex-col items-center justify-start">
                 <div className="flex items-baseline justify-center flex-wrap">
                    <span className="text-xl font-bold text-purple-600 dark:text-purple-400 leading-none">
                      {Math.floor(stats.avgDuration / 60)}
                    </span>
                    <span className="text-xs text-purple-600 dark:text-purple-400 ml-0.5">h</span>
                    <span className="text-xl font-bold text-purple-600 dark:text-purple-400 ml-1 leading-none">
                      {stats.avgDuration % 60}
                    </span>
                    <span className="text-xs text-purple-600 dark:text-purple-400 ml-0.5">m</span>
                 </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                  平均时长
                </p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                  {stats.completionRate}%
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                  完成率
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                断食记录
              </h2>
            </div>
          </div>

          {displaySessions.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                暂无记录
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                开始第一次断食吧！
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {displaySessions.map((session) => (
                <div
                  key={session.id}
                  className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        session.completed
                          ? 'bg-green-100 dark:bg-green-900/30'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        {session.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatDate(session.start_at)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDuration(session.duration_minutes)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        目标 {session.target_duration_hours}小时
                      </p>
                      <div className="flex items-center gap-1 justify-end mt-1">
                        {session.source === 'backfill' && (
                          <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                            补录
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
