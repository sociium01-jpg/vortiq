import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = 'md',
  className,
}) => {
  const getInitials = (n: string) => {
    const parts = n.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return n.slice(0, 2).toUpperCase();
  };

  const sizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  return src ? (
    <img
      src={src}
      alt={name}
      className={twMerge(
        clsx('rounded-full object-cover border border-dark-border', sizes[size], className)
      )}
    />
  ) : (
    <div
      className={twMerge(
        clsx(
          'rounded-full bg-brand-500/20 text-brand-400 font-semibold border border-brand-500/30 flex items-center justify-center shrink-0 uppercase',
          sizes[size],
          className
        )
      )}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
};
