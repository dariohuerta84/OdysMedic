import React from 'react';

export interface ProgressBarProps {
  progress: number; // 0 to 100
  color?: 'teal' | 'emerald' | 'cyan' | 'amber' | 'rose' | 'violet';
  height?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = 'teal',
  height = 'md',
  showLabel = false,
  label,
  className = '',
}) => {
  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));

  const colorClasses: Record<'teal' | 'emerald' | 'cyan' | 'amber' | 'rose' | 'violet', string> = {
    teal: 'bg-sky-500',
    emerald: 'bg-emerald-500',
    cyan: 'bg-sky-400',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    violet: 'bg-indigo-500',
  };

  const heightClasses: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between text-xs font-mono text-slate-600 mb-1.5">
          <span className="font-sans font-medium text-slate-600 truncate">
            {label || 'Progreso Clinico'}
          </span>
          <span className="font-semibold text-slate-900 ml-2">
            {clampedProgress}%
          </span>
        </div>
      )}
      <div
        className={`w-full bg-slate-100 border border-slate-200 rounded-full overflow-hidden ${heightClasses[height]}`}
        role="progressbar"
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorClasses[color]}`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
