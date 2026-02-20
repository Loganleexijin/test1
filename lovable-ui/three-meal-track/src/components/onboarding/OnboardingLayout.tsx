import { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep?: number;
  totalSteps?: number;
  onBack?: () => void;
  showBack?: boolean;
  showProgress?: boolean;
}

export const OnboardingLayout = ({
  children,
  currentStep = 1,
  totalSteps = 6,
  onBack,
  showBack = true,
  showProgress = true,
}: OnboardingLayoutProps) => {
  return (
    <div className="min-h-screen bg-onboarding-background flex flex-col">
      {/* Header */}
      <div className="px-4 pt-12 pb-4">
        <div className="flex items-center justify-between h-10">
          {showBack && onBack ? (
            <button
              onClick={onBack}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-onboarding-divider transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-onboarding-text" />
            </button>
          ) : (
            <div className="w-10" />
          )}
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-onboarding-primary to-onboarding-accent flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="text-lg font-semibold text-onboarding-text">Flux</span>
          </div>
          
          <div className="w-10" />
        </div>
        
        {/* Progress bar */}
        {showProgress && (
          <div className="mt-4">
            <div className="h-1 bg-onboarding-divider rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-onboarding-primary to-onboarding-accent transition-all duration-300 ease-out"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
            <p className="text-xs text-onboarding-secondary mt-2 text-center">
              {currentStep} / {totalSteps}
            </p>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 px-4 pb-4 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};
