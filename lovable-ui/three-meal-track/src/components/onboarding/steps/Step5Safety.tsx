import { useOnboardingStore, SafetyFlag, PregnancyStatus, checkSafetyMode } from '@/stores/onboardingStore';
import { OnboardingLayout } from '../OnboardingLayout';
import { OnboardingButton } from '../OnboardingButton';
import { cn } from '@/lib/utils';
import { Check, AlertCircle, X } from 'lucide-react';

const safetyOptions: { value: SafetyFlag; label: string }[] = [
  { value: 'diabetes_med', label: '我正在使用降糖药/胰岛素' },
  { value: 'eating_disorder_history', label: '我有进食障碍相关经历' },
  { value: 'ulcer_gastritis', label: '我有严重胃病（如胃溃疡）' },
  { value: 'chronic_disease', label: '我有慢性病，需要医生建议' },
];

const pregnancyOptions: { value: PregnancyStatus; label: string }[] = [
  { value: 'pregnant', label: '怀孕' },
  { value: 'breastfeeding', label: '哺乳期' },
  { value: 'trying', label: '备孕/试孕' },
  { value: 'unsure', label: '不确定' },
  { value: 'no', label: '都不是' },
];

export const Step5Safety = () => {
  const { data, updateData, nextStep, prevStep, setInSafeMode, showSafetyModal, setShowSafetyModal } = useOnboardingStore();

  const handleFlagToggle = (flag: SafetyFlag) => {
    const current = data.safety_flags;
    if (current.includes(flag)) {
      updateData({ safety_flags: current.filter(f => f !== flag) });
    } else {
      updateData({ safety_flags: [...current, flag] });
    }
  };

  const handlePregnancySelect = (status: PregnancyStatus) => {
    updateData({ pregnancy_status: status });
  };

  const handleContinue = () => {
    const needsSafeMode = checkSafetyMode(data);
    if (needsSafeMode) {
      setInSafeMode(true);
      setShowSafetyModal(true);
    } else {
      setInSafeMode(false);
      nextStep();
    }
  };

  const handleSafetyAcknowledge = () => {
    setShowSafetyModal(false);
    nextStep();
  };

  const isFemale = data.sex === 'female';

  return (
    <>
      <OnboardingLayout
        currentStep={5}
        totalSteps={6}
        onBack={prevStep}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="mb-5">
            <h1 className="text-xl font-bold text-onboarding-text">
              为了安全，我们需要确认几件事
            </h1>
            <p className="mt-2 text-sm text-onboarding-secondary">
              如果不适合断食，我们会自动切换到更温和的模式。
            </p>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto">
            {/* Safety Flags */}
            <div className="space-y-2">
              {safetyOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFlagToggle(option.value)}
                  className={cn(
                    'w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left',
                    data.safety_flags.includes(option.value)
                      ? 'border-onboarding-cta bg-onboarding-cta/5'
                      : 'border-onboarding-divider bg-onboarding-card'
                  )}
                >
                  <div className={cn(
                    'w-5 h-5 rounded flex items-center justify-center shrink-0',
                    data.safety_flags.includes(option.value)
                      ? 'bg-onboarding-cta'
                      : 'border-2 border-onboarding-divider'
                  )}>
                    {data.safety_flags.includes(option.value) && (
                      <Check className="w-3.5 h-3.5 text-white" />
                    )}
                  </div>
                  <span className="text-sm text-onboarding-text">{option.label}</span>
                </button>
              ))}
            </div>

            {/* Pregnancy (female only) */}
            {isFemale && (
              <div className="pt-2">
                <p className="text-sm font-medium text-onboarding-text mb-3">
                  你目前处于以下状态吗？
                </p>
                <div className="flex flex-wrap gap-2">
                  {pregnancyOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handlePregnancySelect(option.value)}
                      className={cn(
                        'px-4 py-2 rounded-full text-sm font-medium transition-all',
                        data.pregnancy_status === option.value
                          ? 'bg-onboarding-cta text-white'
                          : 'bg-onboarding-card border border-onboarding-divider text-onboarding-text'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Info tip */}
            <div className="flex items-start gap-3 bg-onboarding-divider/50 rounded-xl p-3">
              <AlertCircle className="w-5 h-5 text-onboarding-secondary shrink-0 mt-0.5" />
              <p className="text-xs text-onboarding-secondary leading-relaxed">
                即使没有勾选任何选项，也可以点击继续。这些信息仅用于安全建议，不会影响基础功能。
              </p>
            </div>
          </div>

          {/* Button */}
          <div className="pt-4 pb-4">
            <OnboardingButton onClick={handleContinue}>
              继续
            </OnboardingButton>
          </div>
        </div>
      </OnboardingLayout>

      {/* Safety Modal */}
      {showSafetyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-onboarding-card w-full max-w-md rounded-t-3xl p-6 animate-slide-up">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-full bg-onboarding-primary/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-onboarding-primary" />
              </div>
              <button onClick={() => setShowSafetyModal(false)}>
                <X className="w-6 h-6 text-onboarding-secondary" />
              </button>
            </div>
            
            <h2 className="text-lg font-bold text-onboarding-text mb-2">
              我们会为你切换到更安全的模式
            </h2>
            <p className="text-sm text-onboarding-secondary mb-6 leading-relaxed">
              基于你提供的信息，强断食可能不适合你。你仍可使用饮食记录、温和窗口与提醒。
            </p>
            
            <div className="space-y-3">
              <OnboardingButton onClick={handleSafetyAcknowledge}>
                我明白了，继续
              </OnboardingButton>
              <OnboardingButton 
                variant="ghost"
                onClick={() => setShowSafetyModal(false)}
              >
                查看原因
              </OnboardingButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
