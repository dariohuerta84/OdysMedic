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
    teal: 'bg-teal-500 shadow-[0_0_12px_rgba(20,143,130,0.5)]',
    emerald: 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]',
    cyan: 'bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.5)]',
    amber: 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]',
    rose: 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]',
    violet: 'bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]',
  };

  const heightClasses: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between text-xs font-mono text-gray-300 mb-1.5">
          <span className="font-sans font-medium text-gray-400 truncate">
            {label || 'Progreso Clinico'}
          </span>
          <span className="font-semibold text-white ml-2">
            {clampedProgress}%
          </span>
        </div>
      )}
      <div
        className={`w-full bg-slate-900/80 border border-white/10 rounded-full overflow-hidden ${heightClasses[height]}`}
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
