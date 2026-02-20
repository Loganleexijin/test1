import { useOnboardingStore, MealRegularity, LateSnackFreq, BreakfastTime, LunchTime, DinnerTime, SleepTime } from '@/stores/onboardingStore';
import { OnboardingLayout } from '../OnboardingLayout';
import { OnboardingButton } from '../OnboardingButton';
import { ChipSelector } from '../ChipSelector';

export const Step4Schedule = () => {
  const { data, updateData, nextStep, prevStep } = useOnboardingStore();

  const handleContinue = () => {
    nextStep();
  };

  const regularityOptions = [
    { value: 'regular' as MealRegularity, label: '很规律' },
    { value: 'semi_regular' as MealRegularity, label: '一般' },
    { value: 'irregular' as MealRegularity, label: '不规律' },
  ];

  const snackOptions = [
    { value: 'rare' as LateSnackFreq, label: '几乎没有' },
    { value: '1_2_week' as LateSnackFreq, label: '每周1-2次' },
    { value: '3plus_week' as LateSnackFreq, label: '每周≥3次' },
  ];

  const breakfastOptions = [
    { value: '7_9' as BreakfastTime, label: '7–9点' },
    { value: '9_11' as BreakfastTime, label: '9–11点' },
    { value: 'skip' as BreakfastTime, label: '不吃' },
    { value: 'unstable' as BreakfastTime, label: '不固定' },
  ];

  const lunchOptions = [
    { value: '11_13' as LunchTime, label: '11–13点' },
    { value: '13_15' as LunchTime, label: '13–15点' },
    { value: 'unstable' as LunchTime, label: '不固定' },
  ];

  const dinnerOptions = [
    { value: '17_19' as DinnerTime, label: '17–19点' },
    { value: '19_21' as DinnerTime, label: '19–21点' },
    { value: 'after_21' as DinnerTime, label: '21点后' },
    { value: 'unstable' as DinnerTime, label: '不固定' },
  ];

  const sleepOptions = [
    { value: 'before_23' as SleepTime, label: '23点前' },
    { value: '23_1' as SleepTime, label: '23–1点' },
    { value: 'after_1' as SleepTime, label: '1点后' },
  ];

  const hasUnstable = 
    data.breakfast_time === 'unstable' ||
    data.lunch_time === 'unstable' ||
    data.dinner_time === 'unstable';

  const canContinue = 
    data.meal_regularity &&
    data.late_snack_freq &&
    data.breakfast_time &&
    data.lunch_time &&
    data.dinner_time &&
    data.sleep_time;

  return (
    <OnboardingLayout
      currentStep={4}
      totalSteps={6}
      onBack={prevStep}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-xl font-bold text-onboarding-text">
            你的三餐大概在什么时间？
          </h1>
          <p className="mt-2 text-sm text-onboarding-secondary">
            不用很精确，选最接近的即可。
          </p>
        </div>

        <div className="space-y-5 flex-1 overflow-y-auto pb-2">
          {/* Meal Regularity */}
          <ChipSelector
            label="三餐规律度"
            options={regularityOptions}
            value={data.meal_regularity}
            onChange={(v) => updateData({ meal_regularity: v })}
          />

          {/* Late Snack Frequency */}
          <ChipSelector
            label="夜宵频率"
            options={snackOptions}
            value={data.late_snack_freq}
            onChange={(v) => updateData({ late_snack_freq: v })}
          />

          {/* Breakfast Time */}
          <ChipSelector
            label="早餐通常在"
            options={breakfastOptions}
            value={data.breakfast_time}
            onChange={(v) => updateData({ breakfast_time: v })}
          />

          {/* Lunch Time */}
          <ChipSelector
            label="午餐通常在"
            options={lunchOptions}
            value={data.lunch_time}
            onChange={(v) => updateData({ lunch_time: v })}
          />

          {/* Dinner Time */}
          <ChipSelector
            label="晚餐通常在"
            options={dinnerOptions}
            value={data.dinner_time}
            onChange={(v) => updateData({ dinner_time: v })}
          />

          {/* Sleep Time */}
          <ChipSelector
            label="通常入睡"
            options={sleepOptions}
            value={data.sleep_time}
            onChange={(v) => updateData({ sleep_time: v })}
          />

          {/* Unstable hint */}
          {hasUnstable && (
            <div className="bg-onboarding-primary/10 rounded-xl p-3">
              <p className="text-sm text-onboarding-primary">
                没关系，我们会先给一个更宽松、更好坚持的方案。
              </p>
            </div>
          )}
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
