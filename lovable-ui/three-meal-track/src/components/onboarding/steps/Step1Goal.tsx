import { useState } from 'react';
import { useOnboardingStore, GoalPrimary } from '@/stores/onboardingStore';
import { OnboardingLayout } from '../OnboardingLayout';
import { OnboardingButton } from '../OnboardingButton';
import { SelectionCard } from '../SelectionCard';

const goalOptions: { value: GoalPrimary; icon: string; title: string; description: string }[] = [
  { value: 'weight_loss', icon: '⚖️', title: '减脂/体重管理', description: '更轻的体感与体型变化' },
  { value: 'metabolic_health', icon: '📊', title: '控糖/代谢健康', description: '更稳定的能量与食欲' },
  { value: 'energy_focus', icon: '⚡', title: '精力与专注', description: '更清醒的白天状态' },
  { value: 'eating_habit', icon: '🌙', title: '改善饮食规律', description: '从"晚饭后截止"开始' },
  { value: 'gut_comfort', icon: '🌿', title: '肠胃舒适', description: '减少无意识进食' },
  { value: 'other', icon: '✨', title: '其他', description: '告诉我们你的目标' },
];

export const Step1Goal = () => {
  const { data, updateData, nextStep, prevStep } = useOnboardingStore();
  const [customText, setCustomText] = useState(data.goal_custom_text);
  const [error, setError] = useState('');

  const handleSelect = (value: GoalPrimary) => {
    updateData({ goal_primary: value });
    setError('');
  };

  const handleContinue = () => {
    if (!data.goal_primary) {
      setError('请选择一个目标');
      return;
    }
    if (data.goal_primary === 'other' && customText.length < 2) {
      setError('请输入至少2个字');
      return;
    }
    updateData({ goal_custom_text: customText });
    nextStep();
  };

  const handleSkip = () => {
    updateData({ goal_primary: 'eating_habit', goal_custom_text: '' });
    nextStep();
  };

  return (
    <OnboardingLayout
      currentStep={1}
      totalSteps={6}
      onBack={prevStep}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-onboarding-text">
              你为什么想开始断食？
            </h1>
            <button 
              onClick={handleSkip}
              className="text-sm text-onboarding-secondary hover:text-onboarding-text"
            >
              跳过
            </button>
          </div>
          <p className="mt-2 text-sm text-onboarding-secondary">
            我们会据此推荐更容易坚持的起步计划。
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3 flex-1">
          {goalOptions.map((option) => (
            <SelectionCard
              key={option.value}
              icon={option.icon}
              title={option.title}
              description={option.description}
              selected={data.goal_primary === option.value}
              onClick={() => handleSelect(option.value)}
            />
          ))}

          {/* Custom input for "other" */}
          {data.goal_primary === 'other' && (
            <div className="mt-4">
              <input
                type="text"
                value={customText}
                onChange={(e) => {
                  setCustomText(e.target.value);
                  setError('');
                }}
                placeholder="例如：想改善睡眠、减少零食…"
                className="w-full px-4 py-3 rounded-xl border border-onboarding-divider bg-onboarding-card text-onboarding-text placeholder:text-onboarding-secondary/60 focus:outline-none focus:border-onboarding-cta"
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-sm text-onboarding-primary mt-2">{error}</p>
          )}
        </div>

        {/* Button */}
        <div className="pt-4 pb-4">
          <OnboardingButton 
            onClick={handleContinue}
            disabled={!data.goal_primary}
          >
            继续
          </OnboardingButton>
        </div>
      </div>
    </OnboardingLayout>
  );
};
