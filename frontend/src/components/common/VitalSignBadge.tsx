import React from 'react';

export interface VitalSignBadgeProps {
  label: string; // e.g. "PA", "FC", "FR", "SatO2", "T", "Glasgow"
  value: string | number;
  unit?: string;
  severity?: 'normal' | 'warning' | 'critical';
  className?: string;
}

export const VitalSignBadge: React.FC<VitalSignBadgeProps> = ({
  label,
  value,
  unit,
  severity = 'normal',
  className = '',
}) => {
  const containerClasses: Record<'normal' | 'warning' | 'critical', string> = {
    normal: 'bg-slate-50 border-slate-200 text-slate-800',
    warning: 'bg-amber-50/80 border-amber-200 text-amber-900',
    critical: 'bg-rose-50 border-rose-200 text-rose-900 shadow-xs animate-pulse-subtle',
  };

  const labelPillClasses: Record<'normal' | 'warning' | 'critical', string> = {
    normal: 'bg-white text-slate-600 border-slate-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    critical: 'bg-rose-100 text-rose-800 border-rose-200',
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border font-mono text-xs shadow-xs transition-colors ${containerClasses[severity]} ${className}`}
      title={`${label}: ${value}${unit ? ` ${unit}` : ''} (${severity})`}
    >
      <span
        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase border ${labelPillClasses[severity]}`}
      >
        {label}
      </span>
      <span className="font-bold text-xs tracking-tight">
        {value}
      </span>
      {unit && (
        <span className="text-[10px] text-slate-500 font-normal ml-0.5">
          {unit}
        </span>
      )}
    </div>
  );
};

export default VitalSignBadge;
