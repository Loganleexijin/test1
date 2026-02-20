import { useOnboardingStore } from '@/stores/onboardingStore';
import { SplashScreen } from './steps/SplashScreen';
import { WelcomeScreen } from './steps/WelcomeScreen';
import { Step1Goal } from './steps/Step1Goal';
import { Step2BodyBasics } from './steps/Step2BodyBasics';
import { Step3Activity } from './steps/Step3Activity';
import { Step4Schedule } from './steps/Step4Schedule';
import { Step5Safety } from './steps/Step5Safety';
import { Step6Plan } from './steps/Step6Plan';
import { FinishScreen } from './steps/FinishScreen';

export const OnboardingFlow = () => {
  const { currentStep } = useOnboardingStore();

  const renderStep = () => {
    switch (currentStep) {
      case 'splash':
        return <SplashScreen />;
      case 'welcome':
        return <WelcomeScreen />;
      case 'step1':
        return <Step1Goal />;
      case 'step2':
        return <Step2BodyBasics />;
      case 'step3':
        return <Step3Activity />;
      case 'step4':
        return <Step4Schedule />;
      case 'step5':
        return <Step5Safety />;
      case 'step6':
        return <Step6Plan />;
      case 'finish':
        return <FinishScreen />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-onboarding-background">
      {renderStep()}
    </div>
  );
};
