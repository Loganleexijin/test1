import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface OnboardingButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

export const OnboardingButton = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className,
  type = 'button',
}: OnboardingButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full py-4 px-6 rounded-2xl font-medium text-base transition-all duration-150 active:scale-[0.98]',
        variant === 'primary' && 'bg-onboarding-cta text-white shadow-lg shadow-onboarding-cta/20',
        variant === 'primary' && disabled && 'opacity-50 cursor-not-allowed',
        variant === 'primary' && !disabled && 'hover:opacity-90',
        variant === 'secondary' && 'bg-onboarding-card border border-onboarding-divider text-onboarding-text',
        variant === 'secondary' && !disabled && 'hover:bg-onboarding-divider',
        variant === 'ghost' && 'bg-transparent text-onboarding-secondary',
        variant === 'ghost' && !disabled && 'hover:text-onboarding-text',
        className
      )}
    >
      {children}
    </button>
  );
};
