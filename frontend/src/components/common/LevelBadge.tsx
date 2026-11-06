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
    containerClass: 'bg-sky-50 border-sky-200 text-sky-800',
    dotClass: 'bg-sky-500',
  },
  'Nivel 2': {
    label: 'Nivel 2',
    subtext: 'Intermedio',
    containerClass: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    dotClass: 'bg-emerald-500',
  },
  'Nivel 3': {
    label: 'Nivel 3',
    subtext: 'Avanzado',
    containerClass: 'bg-indigo-50 border-indigo-200 text-indigo-800',
    dotClass: 'bg-indigo-500',
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
    sm: 'px-2 py-0.5 text-[11px] gap-1.5',
    md: 'px-2.5 py-1 text-xs gap-2',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
  };

  return (
    <span
      className={`inline-flex items-center rounded-lg border font-mono font-medium transition-colors shadow-xs ${config.containerClass} ${sizeClasses[size]} ${className}`}
      title={`${config.label} (${config.subtext})`}
    >
      <span className={`rounded-full shrink-0 ${config.dotClass} ${dotSizes[size]}`} />
      <span>{config.label}</span>
      {showSubtext && (
        <span className="opacity-75 text-[10px] uppercase font-sans">
          {config.subtext}
        </span>
      )}
    </span>
  );
};

export default LevelBadge;
