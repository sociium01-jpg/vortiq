import React from 'react';

export interface LoadingSkeletonProps {
  count?: number;
  height?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  count = 3,
  height = 'h-8',
}) => {
  return (
    <div className="space-y-2.5 w-full animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`w-full bg-dark-surface/60 rounded-md border border-dark-border/40 ${height}`}
        />
      ))}
    </div>
  );
};
