import { useState } from 'react';
import { useOnboardingStore, Sex } from '@/stores/onboardingStore';
import { OnboardingLayout } from '../OnboardingLayout';
import { OnboardingButton } from '../OnboardingButton';
import { cn } from '@/lib/utils';

const sexOptions: { value: Sex; label: string }[] = [
  { value: 'female', label: '女' },
  { value: 'male', label: '男' },
  { value: 'other', label: '其他' },
  { value: 'prefer_not_to_say', label: '不想说' },
];

export const Step2BodyBasics = () => {
  const { data, updateData, nextStep, prevStep } = useOnboardingStore();
  const [height, setHeight] = useState(data.height_cm?.toString() || '');
  const [weight, setWeight] = useState(data.weight_kg?.toString() || '');
  const [age, setAge] = useState(data.age?.toString() || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    const h = parseFloat(height);
    if (!height || isNaN(h)) {
      newErrors.height = '请输入身高';
    } else if (h < 120 || h > 220) {
      newErrors.height = '这个数值看起来不太常见，可以再确认一下';
    }
    
    const w = parseFloat(weight);
    if (!weight || isNaN(w)) {
      newErrors.weight = '请输入体重';
    } else if (w < 30 || w > 200) {
      newErrors.weight = '这个数值看起来不太常见，可以再确认一下';
    }
    
    if (age) {
      const a = parseInt(age);
      if (isNaN(a) || a < 13 || a > 80) {
        newErrors.age = '年龄应在13-80岁之间';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;
    
    updateData({
      height_cm: parseFloat(height),
      weight_kg: parseFloat(weight),
      age: age ? parseInt(age) : null,
    });
    nextStep();
  };

  const handleSexSelect = (sex: Sex) => {
    updateData({ sex });
  };

  return (
    <OnboardingLayout
      currentStep={2}
      totalSteps={6}
      onBack={prevStep}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-onboarding-text">
            告诉我一些基础信息
          </h1>
          <p className="mt-2 text-sm text-onboarding-secondary">
            用于个性化与安全提醒，你随时可以修改。
          </p>
        </div>

        {/* Form */}
        <div className="space-y-5 flex-1">
          {/* Height */}
          <div>
            <label className="text-sm font-medium text-onboarding-text">身高</label>
            <div className="mt-1.5 relative">
              <input
                type="number"
                value={height}
                onChange={(e) => {
                  setHeight(e.target.value);
                  setErrors({...errors, height: ''});
                }}
                placeholder="例如 165"
                className={cn(
                  'w-full px-4 py-3 rounded-xl border bg-onboarding-card text-onboarding-text placeholder:text-onboarding-secondary/60 focus:outline-none focus:border-onboarding-cta',
                  errors.height ? 'border-onboarding-primary' : 'border-onboarding-divider'
                )}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-onboarding-secondary">cm</span>
            </div>
            {errors.height && <p className="text-xs text-onboarding-primary mt-1">{errors.height}</p>}
          </div>

          {/* Weight */}
          <div>
            <label className="text-sm font-medium text-onboarding-text">体重</label>
            <div className="mt-1.5 relative">
              <input
                type="number"
                value={weight}
                onChange={(e) => {
                  setWeight(e.target.value);
                  setErrors({...errors, weight: ''});
                }}
                placeholder="例如 55"
                className={cn(
                  'w-full px-4 py-3 rounded-xl border bg-onboarding-card text-onboarding-text placeholder:text-onboarding-secondary/60 focus:outline-none focus:border-onboarding-cta',
                  errors.weight ? 'border-onboarding-primary' : 'border-onboarding-divider'
                )}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-onboarding-secondary">kg</span>
            </div>
            {errors.weight && <p className="text-xs text-onboarding-primary mt-1">{errors.weight}</p>}
          </div>

          {/* Age */}
          <div>
            <label className="text-sm font-medium text-onboarding-text">年龄（可选）</label>
            <div className="mt-1.5">
              <input
                type="number"
                value={age}
                onChange={(e) => {
                  setAge(e.target.value);
                  setErrors({...errors, age: ''});
                }}
                placeholder="例如 28"
                className={cn(
                  'w-full px-4 py-3 rounded-xl border bg-onboarding-card text-onboarding-text placeholder:text-onboarding-secondary/60 focus:outline-none focus:border-onboarding-cta',
                  errors.age ? 'border-onboarding-primary' : 'border-onboarding-divider'
                )}
              />
            </div>
            {errors.age && <p className="text-xs text-onboarding-primary mt-1">{errors.age}</p>}
          </div>

          {/* Sex */}
          <div>
            <label className="text-sm font-medium text-onboarding-text">性别</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {sexOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSexSelect(option.value)}
                  className={cn(
                    'px-5 py-2.5 rounded-full text-sm font-medium transition-all',
                    data.sex === option.value
                      ? 'bg-onboarding-cta text-white'
                      : 'bg-onboarding-card border border-onboarding-divider text-onboarding-text hover:border-onboarding-primary/30'
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
            disabled={!height || !weight}
          >
            继续
          </OnboardingButton>
        </div>
      </div>
    </OnboardingLayout>
  );
};
