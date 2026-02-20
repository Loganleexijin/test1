import { cn } from '@/lib/utils';

interface ChipOption<T> {
  value: T;
  label: string;
}

interface ChipSelectorProps<T> {
  options: ChipOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  label?: string;
}

export function ChipSelector<T extends string>({
  options,
  value,
  onChange,
  label,
}: ChipSelectorProps<T>) {
  return (
    <div>
      {label && (
        <p className="text-sm font-medium text-onboarding-text mb-2">{label}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all duration-150',
              value === option.value
                ? 'bg-onboarding-cta text-white'
                : 'bg-onboarding-card border border-onboarding-divider text-onboarding-text hover:border-onboarding-primary/30'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
