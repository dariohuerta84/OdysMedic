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
    teal: 'bg-[#0E6F65]',
    emerald: 'bg-[#1D7A68]',
    cyan: 'bg-[#2C8C7E]',
    amber: 'bg-[#C48B28]',
    rose: 'bg-[#B95256]',
    violet: 'bg-[#0A564E]',
  };

  const heightClasses: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between text-xs font-sans text-[#4A5D64] mb-1.5">
          <span className="font-medium truncate">
            {label || 'Progreso clinico'}
          </span>
          <span className="font-semibold text-[#0B252E] ml-2">
            {clampedProgress}%
          </span>
        </div>
      )}
      <div
        className={`w-full bg-[#EAECEB] rounded-full overflow-hidden ${heightClasses[height]}`}
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
