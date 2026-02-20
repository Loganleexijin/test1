import { useOnboardingStore } from '@/stores/onboardingStore';
import { OnboardingButton } from '../OnboardingButton';
import { Check, Calendar, Sparkles } from 'lucide-react';

export const FinishScreen = () => {
  const { data, completeOnboarding } = useOnboardingStore();
  const isFemale = data.sex === 'female';

  const handleComplete = () => {
    completeOnboarding();
  };

  const handleCycleSync = () => {
    // TODO: Open cycle sync settings
    completeOnboarding();
  };

  return (
    <div className="min-h-screen bg-onboarding-background flex flex-col px-4">
      {/* Header spacer */}
      <div className="h-24" />
      
      {/* Success Icon */}
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-success to-primary flex items-center justify-center shadow-xl shadow-success/30">
          <Check className="w-10 h-10 text-primary-foreground stroke-[3]" />
        </div>
      </div>
      
      {/* Title */}
      <div className="mt-8 text-center">
        <h1 className="text-2xl font-bold text-onboarding-text">
          设置完成！
        </h1>
        <p className="mt-3 text-onboarding-secondary text-sm leading-relaxed">
          你随时可以在「我的-设置」修改<br />
          身高体重、目标与提醒。
        </p>
      </div>
      
      {/* Plan Summary */}
      <div className="mt-8 bg-onboarding-card rounded-2xl p-5 border border-onboarding-divider">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-onboarding-cta/10 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-onboarding-cta" />
          </div>
          <div>
            <p className="text-lg font-bold text-onboarding-text">
              {data.fasting_window_hours}:{24 - data.fasting_window_hours} 轻断食
            </p>
            <p className="text-sm text-onboarding-secondary">
              进食窗口：{data.eating_window_hint}
            </p>
            <p className="text-xs text-onboarding-secondary mt-1">
              {data.start_day === 'today' ? '今天' : '明天'}开始
            </p>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1 min-h-[40px]" />

      {/* Female Cycle Sync Option */}
      {isFemale && (
        <div className="mb-4 bg-gradient-to-r from-dinner-light to-accent/10 rounded-2xl p-4 border border-dinner/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-dinner/10 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-dinner" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-onboarding-text">
                开启周期同步
              </p>
              <p className="text-xs text-onboarding-secondary mt-0.5">
                可让建议更贴合你的身体状态
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleCycleSync}
              className="flex-1 py-2.5 rounded-xl bg-dinner text-dinner-foreground text-sm font-medium"
            >
              现在开启
            </button>
            <button
              onClick={handleComplete}
              className="flex-1 py-2.5 rounded-xl border border-dinner/30 text-dinner text-sm font-medium"
            >
              稍后再说
            </button>
          </div>
        </div>
      )}

      {/* Bottom section */}
      <div className="pb-8">
        {!isFemale && (
          <OnboardingButton onClick={handleComplete}>
            进入 Flux
          </OnboardingButton>
        )}
      </div>
    </div>
  );
};
