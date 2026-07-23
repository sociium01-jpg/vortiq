import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  bordered?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverable = false,
  bordered = true,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-dark-card rounded-xl p-5 shadow-lg shadow-black/20 text-slate-100 transition-all duration-200',
          bordered && 'border border-dark-border/80',
          hoverable && 'hover:border-slate-500/80 hover:translate-y-[-2px] hover:shadow-xl',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
