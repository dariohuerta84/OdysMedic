import React from 'react';
import type { CompetencyLevel } from '../../types/api';

export interface LevelBadgeProps {
  level: CompetencyLevel | string;
  size?: 'sm' | 'md';
  showSubtext?: boolean;
  className?: string;
}

interface LevelConfig {
  label: string;
  subtext: string;
  containerClass: string;
  dotClass: string;
}

const LEVEL_MAP: Record<string, LevelConfig> = {
  'Nivel 1': {
    label: 'Nivel 1',
    subtext: 'Fundacional',
    containerClass: 'bg-[#F2F7F6] border-[#DCE5E3] text-[#0B252E]',
    dotClass: 'bg-[#0E6F65]',
  },
  'Nivel 2': {
    label: 'Nivel 2',
    subtext: 'Intermedio',
    containerClass: 'bg-[#ECF6F4] border-[#CFE7E2] text-[#0E6F65]',
    dotClass: 'bg-[#0E6F65]',
  },
  'Nivel 3': {
    label: 'Nivel 3',
    subtext: 'Avanzado',
    containerClass: 'bg-[#FDF7E7] border-[#EFE0B9] text-[#7A5413]',
    dotClass: 'bg-[#8A6116]',
  },
};

export const LevelBadge: React.FC<LevelBadgeProps> = ({
  level,
  size = 'md',
  showSubtext = false,
  className = '',
}) => {
  const normalizedKey = level in LEVEL_MAP ? level : 'Nivel 1';
  const config = LEVEL_MAP[normalizedKey];

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-[11px] gap-1.5',
    md: 'px-3 py-1 text-xs gap-2',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-sans font-medium transition-colors ${config.containerClass} ${sizeClasses[size]} ${className}`}
      title={`${config.label} (${config.subtext})`}
    >
      <span className={`rounded-full shrink-0 ${config.dotClass} ${dotSizes[size]}`} />
      <span>{config.label}</span>
      {showSubtext && (
        <span className="opacity-80 text-[11px] font-normal">
          · {config.subtext}
        </span>
      )}
    </span>
  );
};

export default LevelBadge;
