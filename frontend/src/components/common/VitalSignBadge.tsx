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
    normal: 'bg-[#F2F7F6] border-[#DCE5E3] text-[#0B252E]',
    warning: 'bg-[#FDF7E7] border-[#EFE0B9] text-[#7A5413]',
    critical: 'bg-[#FBF1F1] border-[#EED7D7] text-[#8E3B3E]',
  };

  const labelClasses: Record<'normal' | 'warning' | 'critical', string> = {
    normal: 'text-[#4A5D64]',
    warning: 'text-[#8A6116]',
    critical: 'text-[#9E3F42]',
  };

  return (
    <div
      className={`inline-flex items-baseline gap-1.5 px-3 py-1.5 rounded-full border font-sans text-xs transition-colors ${containerClasses[severity]} ${className}`}
      title={`${label}: ${value}${unit ? ` ${unit}` : ''}`}
    >
      <span className={`text-[11px] font-medium ${labelClasses[severity]}`}>
        {label}:
      </span>
      <span className="font-semibold text-xs tracking-tight">
        {value}
      </span>
      {unit && (
        <span className="text-[11px] opacity-75 font-normal">
          {unit}
        </span>
      )}
    </div>
  );
};

export default VitalSignBadge;
