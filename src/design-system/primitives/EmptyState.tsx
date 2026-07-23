import React from 'react';
import { FolderOpen } from 'lucide-react';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'There are no items to display at this moment.',
  action,
  icon = <FolderOpen className="w-10 h-10 text-slate-500" />,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-dark-border/80 rounded-xl bg-dark-card/40 max-w-md mx-auto">
      <div className="p-3 bg-dark-surface rounded-full mb-3 shadow-inner">
        {icon}
      </div>
      <h4 className="text-sm font-semibold text-slate-200 font-display">{title}</h4>
      <p className="text-xs text-slate-400 mt-1 mb-4 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
