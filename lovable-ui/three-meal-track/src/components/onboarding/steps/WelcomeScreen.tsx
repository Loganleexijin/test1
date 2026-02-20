import { useOnboardingStore } from '@/stores/onboardingStore';
import { OnboardingButton } from '../OnboardingButton';
import { Sparkles, Shield, Clock } from 'lucide-react';

export const WelcomeScreen = () => {
  const { nextStep } = useOnboardingStore();

  const features = [
    { icon: <Clock className="w-5 h-5" />, text: '个性化断食计划' },
    { icon: <Sparkles className="w-5 h-5" />, text: '智能饮食记录' },
    { icon: <Shield className="w-5 h-5" />, text: '健康安全提醒' },
  ];

  return (
    <div className="min-h-screen bg-onboarding-background flex flex-col px-4">
      {/* Header spacer */}
      <div className="h-20" />
      
      {/* Logo */}
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-onboarding-primary to-onboarding-accent flex items-center justify-center shadow-xl shadow-onboarding-primary/20">
          <span className="text-white font-bold text-3xl">F</span>
        </div>
      </div>
      
      {/* Title */}
      <div className="mt-8 text-center">
        <h1 className="text-2xl font-bold text-onboarding-text">
          Flux 让断食更容易坚持
        </h1>
        <p className="mt-3 text-onboarding-secondary text-base leading-relaxed">
          我们会根据你的身体与作息，<br />
          推荐更适合你的起步计划。
        </p>
      </div>
      
      {/* Features */}
      <div className="mt-10 space-y-3">
        {features.map((feature, index) => (
          <div 
            key={index}
            className="flex items-center gap-4 bg-onboarding-card rounded-2xl p-4 border border-onboarding-divider"
          >
            <div className="w-10 h-10 rounded-xl bg-onboarding-primary/10 flex items-center justify-center text-onboarding-primary">
              {feature.icon}
            </div>
            <span className="text-onboarding-text font-medium">{feature.text}</span>
          </div>
        ))}
      </div>
      
      {/* Spacer */}
      <div className="flex-1 min-h-[60px]" />
      
      {/* Bottom section */}
      <div className="pb-8">
        {/* Privacy notice */}
        <p className="text-center text-xs text-onboarding-secondary mb-6 leading-relaxed">
          你的数据用于本机个性化与安全提醒，可随时修改。
        </p>
        
        {/* CTA */}
        <OnboardingButton onClick={nextStep}>
          开始设置
        </OnboardingButton>
      </div>
    </div>
  );
};
