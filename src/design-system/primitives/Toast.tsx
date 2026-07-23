import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastProps {
  id: string;
  type?: ToastType;
  title: string;
  message?: string;
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type = 'info',
  title,
  message,
  onDismiss,
}) => {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/40',
    warning: 'border-amber-500/40',
    error: 'border-rose-500/40',
    info: 'border-blue-500/40',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'flex items-start gap-3 p-4 bg-dark-card border rounded-xl shadow-xl max-w-sm w-full animate-in slide-in-from-bottom-5 duration-200 z-50',
          borders[type]
        )
      )}
    >
      {icons[type]}
      <div className="flex-1">
        <h5 className="text-xs font-semibold text-slate-100 font-display">{title}</h5>
        {message && <p className="text-2xs text-slate-400 mt-0.5">{message}</p>}
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-dark-surface"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
