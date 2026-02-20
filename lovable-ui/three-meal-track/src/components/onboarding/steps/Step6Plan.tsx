import { useEffect, useState } from 'react';
import { useOnboardingStore, ReminderMode, StartDay, generateRecommendedPlan } from '@/stores/onboardingStore';
import { OnboardingLayout } from '../OnboardingLayout';
import { OnboardingButton } from '../OnboardingButton';
import { cn } from '@/lib/utils';
import { Clock, Bell, BellOff, Volume2, Sparkles, Edit2 } from 'lucide-react';

const reminderOptions: { value: ReminderMode; icon: typeof Bell; title: string; description: string }[] = [
  { value: 'notify_only', icon: Bell, title: '温柔提醒', description: '不打扰' },
  { value: 'notify_alarm', icon: Volume2, title: '更强提醒', description: '适合容易忘' },
  { value: 'silent', icon: BellOff, title: '静默模式', description: '自己掌控节奏' },
];

const planReasons: Record<string, string> = {
  plan_12_12_beginner: '因为你是新手，我们先从更温和、容易坚持的窗口开始。',
  plan_12_12_safe: '基于你的健康情况，我们推荐一个更温和的方案。',
  plan_13_11_some: '因为你有一定经验，可以尝试稍长一点的断食窗口。',
  plan_14_10_regular: '因为你是稳定实践者，可以挑战更长的断食时间。',
  plan_16_8_weight_loss: '结合你的减脂目标和断食经验，16:8 会更有效。',
};

export const Step6Plan = () => {
  const { data, updateData, nextStep, prevStep, isInSafeMode } = useOnboardingStore();
  const [showAdjust, setShowAdjust] = useState(false);
  const [selectedHours, setSelectedHours] = useState(data.fasting_window_hours);

  useEffect(() => {
    const plan = generateRecommendedPlan(data, isInSafeMode);
    updateData(plan);
    setSelectedHours(plan.fasting_window_hours);
  }, []);

  const handleReminderSelect = (mode: ReminderMode) => {
    updateData({ reminder_mode: mode });
  };

  const handleStartDaySelect = (day: StartDay) => {
    updateData({ start_day: day });
  };

  const handlePlanAdjust = (hours: number) => {
    setSelectedHours(hours);
    const eatingHours = 24 - hours;
    updateData({
      fasting_window_hours: hours,
      eating_window_hint: `12:00–${(12 + eatingHours).toString().padStart(2, '0')}:00`,
    });
  };

  const handleContinue = () => {
    nextStep();
  };

  const canContinue = data.reminder_mode && data.start_day;

  const planOptions = isInSafeMode ? [12] : [12, 13, 14, 16];

  return (
    <OnboardingLayout
      currentStep={6}
      totalSteps={6}
      onBack={prevStep}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-xl font-bold text-onboarding-text">
            这是为你推荐的起步计划
          </h1>
        </div>

        <div className="space-y-5 flex-1 overflow-y-auto pb-2">
          {/* Plan Card */}
          <div className="bg-gradient-to-br from-onboarding-cta/10 to-onboarding-primary/5 rounded-2xl p-5 border border-onboarding-cta/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-onboarding-cta/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-onboarding-cta" />
              </div>
              <div>
                <p className="text-2xl font-bold text-onboarding-text">
                  {data.fasting_window_hours}:{24 - data.fasting_window_hours}
                </p>
                <p className="text-sm text-onboarding-secondary">建议从这个比例开始（7天）</p>
              </div>
            </div>

            {/* Reason */}
            <div className="flex items-start gap-2 bg-onboarding-card/50 rounded-xl p-3 mb-4">
              <Sparkles className="w-4 h-4 text-onboarding-primary shrink-0 mt-0.5" />
              <p className="text-sm text-onboarding-secondary">
                {planReasons[data.recommended_plan_id || ''] || '为你量身定制的起步方案。'}
              </p>
            </div>

            {/* Eating Window */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-onboarding-secondary">建议进食时间</p>
                <p className="text-lg font-semibold text-onboarding-text">{data.eating_window_hint}</p>
              </div>
              <button 
                onClick={() => setShowAdjust(!showAdjust)}
                className="p-2 rounded-lg hover:bg-onboarding-divider"
              >
                <Edit2 className="w-5 h-5 text-onboarding-secondary" />
              </button>
            </div>

            {/* Adjust Plan */}
            {showAdjust && !isInSafeMode && (
              <div className="mt-4 pt-4 border-t border-onboarding-divider">
                <p className="text-sm text-onboarding-secondary mb-2">调整断食时长</p>
                <div className="flex gap-2">
                  {planOptions.map((hours) => (
                    <button
                      key={hours}
                      onClick={() => handlePlanAdjust(hours)}
                      className={cn(
                        'flex-1 py-2 rounded-xl text-sm font-medium transition-all',
                        selectedHours === hours
                          ? 'bg-onboarding-cta text-white'
                          : 'bg-onboarding-card border border-onboarding-divider text-onboarding-text'
                      )}
                    >
                      {hours}:{24 - hours}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reminder Mode */}
          <div>
            <p className="text-sm font-medium text-onboarding-text mb-3">
              你希望我们怎么提醒你？
            </p>
            <div className="space-y-2">
              {reminderOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleReminderSelect(option.value)}
                  className={cn(
                    'w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
                    data.reminder_mode === option.value
                      ? 'border-onboarding-cta bg-onboarding-cta/5'
                      : 'border-onboarding-divider bg-onboarding-card'
                  )}
                >
                  <option.icon className={cn(
                    'w-5 h-5',
                    data.reminder_mode === option.value 
                      ? 'text-onboarding-cta' 
                      : 'text-onboarding-secondary'
                  )} />
                  <div className="text-left">
                    <p className="text-sm font-medium text-onboarding-text">{option.title}</p>
                    <p className="text-xs text-onboarding-secondary">{option.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Start Day */}
          <div>
            <p className="text-sm font-medium text-onboarding-text mb-3">
              从什么时候开始？
            </p>
            <div className="flex gap-3">
              {[
                { value: 'today' as StartDay, label: '今天' },
                { value: 'tomorrow' as StartDay, label: '明天' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStartDaySelect(option.value)}
                  className={cn(
                    'flex-1 py-3 rounded-xl text-sm font-medium transition-all',
                    data.start_day === option.value
                      ? 'bg-onboarding-cta text-white'
                      : 'bg-onboarding-card border border-onboarding-divider text-onboarding-text'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Button */}
        <div className="pt-4 pb-4">
          <OnboardingButton 
            onClick={handleContinue}
            disabled={!canContinue}
          >
            确认并进入 Flux
          </OnboardingButton>
        </div>
      </div>
    </OnboardingLayout>
  );
};
