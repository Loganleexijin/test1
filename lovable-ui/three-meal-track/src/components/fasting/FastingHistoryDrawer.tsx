import { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronRight, Trophy, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FastingSession {
  id: string;
  fasting_status: string;
  start_at: number;
  end_at: number | null;
  target_duration_hours: number;
  duration_minutes: number;
  completed: boolean;
}

interface FastingHistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessions: FastingSession[];
  onDelete?: (id: string) => void;
}

export function FastingHistoryDrawer({
  open,
  onOpenChange,
  sessions,
  onDelete,
}: FastingHistoryDrawerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [open]);

  if (!open) return null;

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}小时${mins}分钟`;
    }
    return `${mins}分钟`;
  };

  const getCompletionRate = (session: FastingSession) => {
    const targetMinutes = session.target_duration_hours * 60;
    if (targetMinutes === 0) return 0;
    return Math.min(100, Math.round((session.duration_minutes / targetMinutes) * 100));
  };

  const getStatusIcon = (session: FastingSession) => {
    const rate = getCompletionRate(session);
    if (rate >= 100) {
      return <Trophy className="w-5 h-5 text-warning" />;
    }
    if (rate >= 50) {
      return <Flame className="w-5 h-5 text-orange-500" />;
    }
    return <Clock className="w-5 h-5 text-muted-foreground" />;
  };

  const groupedSessions = sessions.reduce((groups, session) => {
    const date = new Date(session.start_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(session);
    return groups;
  }, {} as Record<string, FastingSession[]>);

  return (
    <>
      {/* 背景遮罩 */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-foreground/50 transition-opacity duration-300',
          isVisible ? 'opacity-100' : 'opacity-0'
        )}
        onClick={() => onOpenChange(false)}
      />

      {/* 底部抽屉 */}
      <div
        className={cn(
          'fixed bottom-0 inset-x-0 z-50 bg-background rounded-t-3xl transition-transform duration-300 max-h-[85vh]',
          isVisible ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        {/* 拖动指示器 */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        <div className="px-6 pb-8 pt-2 overflow-y-auto">
          {/* 标题 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">断食历史</h2>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              关闭
            </button>
          </div>

          {/* 统计摘要 */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-muted/50 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{sessions.length}</div>
              <div className="text-xs text-muted-foreground mt-1">总次数</div>
            </div>
            <div className="bg-muted/50 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {sessions.filter((s) => getCompletionRate(s) >= 100).length}
              </div>
              <div className="text-xs text-muted-foreground mt-1">达标</div>
            </div>
            <div className="bg-muted/50 rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold text-warning">
                {formatDuration(
                  sessions.reduce((sum, s) => sum + s.duration_minutes, 0)
                ).replace(/小时.*$/, 'h')}
              </div>
              <div className="text-xs text-muted-foreground mt-1">总时长</div>
            </div>
          </div>

          {/* 历史记录列表 */}
          {Object.entries(groupedSessions).length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">暂无断食记录</p>
              <p className="text-xs text-muted-foreground/60 mt-1">开始你的第一次断食吧！</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedSessions)
                .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                .map(([date, daySessions]) => (
                  <div key={date}>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 sticky top-0 bg-background py-2">
                      {formatDate(daySessions[0].start_at)}
                    </h3>
                    <div className="space-y-3">
                      {daySessions
                        .sort((a, b) => b.start_at - a.start_at)
                        .map((session) => {
                          const completionRate = getCompletionRate(session);
                          return (
                            <div
                              key={session.id}
                              className="bg-card rounded-2xl p-4 border border-border/50"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                    {getStatusIcon(session)}
                                  </div>
                                  <div>
                                    <div className="font-medium text-foreground">
                                      {formatTime(session.start_at)} -{' '}
                                      {session.end_at
                                        ? formatTime(session.end_at)
                                        : '进行中'}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {formatDuration(session.duration_minutes)} · 目标{' '}
                                      {session.target_duration_hours}小时
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div
                                    className={cn(
                                      'text-sm font-semibold',
                                      completionRate >= 100
                                        ? 'text-warning'
                                        : completionRate >= 50
                                        ? 'text-orange-500'
                                        : 'text-muted-foreground'
                                    )}
                                  >
                                    {completionRate}%
                                  </div>
                                  {onDelete && (
                                    <button
                                      onClick={() => onDelete(session.id)}
                                      className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                    >
                                      <ChevronRight className="w-4 h-4 rotate-90" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* 进度条 */}
                              <div className="mt-3">
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className={cn(
                                      'h-full rounded-full transition-all duration-500',
                                      completionRate >= 100
                                        ? 'bg-warning'
                                        : completionRate >= 50
                                        ? 'bg-orange-500'
                                        : 'bg-muted-foreground/50'
                                    )}
                                    style={{ width: `${Math.min(completionRate, 100)}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
