import { cn } from '@/lib/utils';
import type { HTMLAttributes, ReactNode } from 'react';

type BaseProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn('bg-white rounded-3xl border border-white/80 shadow-[0_12px_30px_-22px_rgba(23,30,64,0.6)]', className)}
    >
      {children}
    </div>
  );
}

export function Pill({ children, className, icon }: BaseProps & { icon?: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold', className)}>
      {icon}
      {children}
    </span>
  );
}

export function Tag({ children, className, icon }: BaseProps & { icon?: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium', className)}>
      {icon}
      {children}
    </span>
  );
}

export function StatTile({ label, value, unit, className }: { label: string; value: string | number; unit?: string; className?: string }) {
  return (
    <div className={cn('rounded-2xl px-4 py-3 text-white', className)}>
      <div className="text-[11px] text-white/70 font-medium">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        {unit && <div className="text-[11px] text-white/70">{unit}</div>}
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, description, className }: { icon: ReactNode; title: string; description: string; className?: string }) {
  return (
    <div className={cn('w-full rounded-3xl p-6 text-center', className)}>
      <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">{icon}</div>
      <h3 className="text-gray-900 font-bold mb-1">{title}</h3>
      <p className="text-gray-500 text-sm">{description}</p>
    </div>
  );
}

export function LoadingState({ icon, title, description, className }: { icon: ReactNode; title: string; description: string; className?: string }) {
  return (
    <div className={cn('w-full rounded-3xl p-6', className)}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center">{icon}</div>
        <div>
          <h3 className="font-bold text-lg">{title}</h3>
          <p className="text-xs">{description}</p>
        </div>
      </div>
    </div>
  );
}
