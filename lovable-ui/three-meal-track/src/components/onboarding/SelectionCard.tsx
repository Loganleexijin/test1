import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface SelectionCardProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  selected?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'compact';
}

export const SelectionCard = ({
  icon,
  title,
  description,
  selected = false,
  onClick,
  variant = 'default',
}: SelectionCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-2xl border-2 transition-all duration-150',
        variant === 'default' && 'p-4',
        variant === 'compact' && 'px-4 py-3',
        selected 
          ? 'border-onboarding-cta bg-onboarding-cta/5 scale-[1.02]' 
          : 'border-onboarding-divider bg-onboarding-card hover:border-onboarding-primary/30'
      )}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0',
            selected ? 'bg-onboarding-cta/10' : 'bg-onboarding-divider'
          )}>
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className={cn(
            'font-medium',
            variant === 'default' && 'text-base',
            variant === 'compact' && 'text-sm',
            selected ? 'text-onboarding-text' : 'text-onboarding-text'
          )}>
            {title}
          </p>
          {description && (
            <p className="text-sm text-onboarding-secondary mt-0.5">{description}</p>
          )}
        </div>
        {selected && (
          <div className="w-6 h-6 rounded-full bg-onboarding-cta flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
    </button>
  );
};
