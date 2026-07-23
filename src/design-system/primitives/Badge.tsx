import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'emerald' | 'amber' | 'rose' | 'blue' | 'slate' | 'violet';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'emerald',
  size = 'md',
  dot = false,
  className,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-md border';

  const variants = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    slate: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
  };

  const sizes = {
    sm: 'text-2xs px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-0.5 gap-1.5',
  };

  const dotColors = {
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
    rose: 'bg-rose-400',
    blue: 'bg-blue-400',
    slate: 'bg-slate-400',
    violet: 'bg-violet-400',
  };

  return (
    <span
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      {...props}
    >
      {dot && (
        <span className={clsx('h-1.5 w-1.5 rounded-full shrink-0 animate-pulse', dotColors[variant])} />
      )}
      <span>{children}</span>
    </span>
  );
};
