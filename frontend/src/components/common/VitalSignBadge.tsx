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
    normal: 'bg-slate-900/60 border-slate-700/50 text-slate-200',
    warning: 'bg-amber-950/30 border-amber-500/40 text-amber-300',
    critical: 'bg-rose-950/40 border-rose-500/50 text-rose-300 animate-pulse-subtle shadow-[0_0_12px_rgba(244,63,94,0.25)]',
  };

  const labelPillClasses: Record<'normal' | 'warning' | 'critical', string> = {
    normal: 'bg-slate-800/90 text-slate-400 border-slate-700/60',
    warning: 'bg-amber-900/50 text-amber-400 border-amber-500/40',
    critical: 'bg-rose-900/60 text-rose-300 border-rose-500/50',
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border font-mono text-xs shadow-sm transition-colors ${containerClasses[severity]} ${className}`}
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
        <span className="text-[10px] opacity-75 font-normal ml-0.5">
          {unit}
        </span>
      )}
    </div>
  );
};

export default VitalSignBadge;
