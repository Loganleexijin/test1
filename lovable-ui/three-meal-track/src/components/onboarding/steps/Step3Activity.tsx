import { useState } from 'react';
import { useOnboardingStore, ActivityLevel, FastingExperience, TrainingType } from '@/stores/onboardingStore';
import { OnboardingLayout } from '../OnboardingLayout';
import { OnboardingButton } from '../OnboardingButton';
import { SelectionCard } from '../SelectionCard';
import { ChevronDown, ChevronUp } from 'lucide-react';

const activityOptions: { value: ActivityLevel; title: string; description: string }[] = [
  { value: 'sedentary', title: '久坐', description: '大部分时间坐着' },
  { value: 'light', title: '轻度', description: '通勤走动 + 偶尔运动' },
  { value: 'moderate', title: '中等', description: '每周 3–5 次运动' },
  { value: 'high', title: '高强度', description: '高强度训练或体力工作' },
];

const experienceOptions: { value: FastingExperience; title: string; description: string }[] = [
  { value: 'beginner', title: '新手', description: '第一次系统尝试' },
  { value: 'some', title: '做过几次', description: '偶尔做，但不稳定' },
  { value: 'regular', title: '稳定实践者', description: '能稳定执行 16:8 等' },
];

const trainingOptions: { value: TrainingType; label: string }[] = [
  { value: 'strength', label: '力量训练' },
  { value: 'cardio', label: '有氧运动' },
  { value: 'mixed', label: '混合训练' },
  { value: 'none', label: '无固定训练' },
];

export const Step3Activity = () => {
  const { data, updateData, nextStep, prevStep } = useOnboardingStore();
  const [showTraining, setShowTraining] = useState(data.training_type.length > 0);

  const handleActivitySelect = (value: ActivityLevel) => {
    updateData({ activity_level: value });
  };

  const handleExperienceSelect = (value: FastingExperience) => {
    updateData({ fasting_experience: value });
  };

  const handleTrainingToggle = (value: TrainingType) => {
    const current = data.training_type;
    if (current.includes(value)) {
      updateData({ training_type: current.filter(t => t !== value) });
    } else {
      updateData({ training_type: [...current, value] });
    }
  };

  const handleContinue = () => {
    nextStep();
  };

  const canContinue = data.activity_level && data.fasting_experience;

  return (
    <OnboardingLayout
      currentStep={3}
      totalSteps={6}
      onBack={prevStep}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-onboarding-text">
            你的日常活动大概是？
          </h1>
        </div>

        <div className="space-y-6 flex-1 overflow-y-auto">
          {/* Activity Level */}
          <div className="space-y-2">
            {activityOptions.map((option) => (
              <SelectionCard
                key={option.value}
                title={option.title}
                description={option.description}
                selected={data.activity_level === option.value}
                onClick={() => handleActivitySelect(option.value)}
                variant="compact"
              />
            ))}
          </div>

          {/* Fasting Experience */}
          <div>
            <h2 className="text-base font-semibold text-onboarding-text mb-3">
              你做过断食吗？
            </h2>
            <div className="space-y-2">
              {experienceOptions.map((option) => (
                <SelectionCard
                  key={option.value}
                  title={option.title}
                  description={option.description}
                  selected={data.fasting_experience === option.value}
                  onClick={() => handleExperienceSelect(option.value)}
                  variant="compact"
                />
              ))}
            </div>
          </div>

          {/* Training Type (Collapsible) */}
          <div>
            <button
              onClick={() => setShowTraining(!showTraining)}
              className="flex items-center gap-2 text-sm text-onboarding-secondary hover:text-onboarding-text"
            >
              <span>我有训练习惯</span>
              {showTraining ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {showTraining && (
              <div className="mt-3 flex flex-wrap gap-2">
                {trainingOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleTrainingToggle(option.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      data.training_type.includes(option.value)
                        ? 'bg-onboarding-cta text-white'
                        : 'bg-onboarding-card border border-onboarding-divider text-onboarding-text'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Button */}
        <div className="pt-4 pb-4">
          <OnboardingButton 
            onClick={handleContinue}
            disabled={!canContinue}
          >
            继续
          </OnboardingButton>
        </div>
      </div>
    </OnboardingLayout>
  );
};
