import { useEffect, useState } from 'react';
import { useOnboardingStore } from '@/stores/onboardingStore';

export const SplashScreen = () => {
  const { nextStep } = useOnboardingStore();
  const [showTimeout, setShowTimeout] = useState(false);
  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    // Show "正在准备" after 2.5s
    const timeoutTimer = setTimeout(() => setShowTimeout(true), 2500);
    
    // Show retry button after 6s
    const retryTimer = setTimeout(() => setShowRetry(true), 6000);
    
    // Auto proceed after 2s (simulating load complete)
    const proceedTimer = setTimeout(() => nextStep(), 2000);
    
    return () => {
      clearTimeout(timeoutTimer);
      clearTimeout(retryTimer);
      clearTimeout(proceedTimer);
    };
  }, [nextStep]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-onboarding-background to-onboarding-card flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="animate-pulse-soft">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-onboarding-primary to-onboarding-accent flex items-center justify-center shadow-2xl shadow-onboarding-primary/30">
          <span className="text-white font-bold text-4xl">F</span>
        </div>
      </div>
      
      <h1 className="mt-6 text-3xl font-bold text-onboarding-text">Flux</h1>
      <p className="mt-2 text-onboarding-secondary text-sm">让断食更容易坚持</p>
      
      {/* Loading indicator */}
      <div className="mt-12">
        <div className="w-8 h-8 border-2 border-onboarding-primary/30 border-t-onboarding-primary rounded-full animate-spin" />
      </div>
      
      {/* Timeout message */}
      {showTimeout && !showRetry && (
        <p className="mt-4 text-sm text-onboarding-secondary animate-fade-in">
          正在准备你的计划…
        </p>
      )}
      
      {/* Retry buttons */}
      {showRetry && (
        <div className="mt-6 flex gap-3 animate-fade-in">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 rounded-full bg-onboarding-cta text-white text-sm font-medium"
          >
            重试
          </button>
          <button
            onClick={() => nextStep()}
            className="px-6 py-2 rounded-full border border-onboarding-divider text-onboarding-text text-sm font-medium"
          >
            离线继续
          </button>
        </div>
      )}
    </div>
  );
};
