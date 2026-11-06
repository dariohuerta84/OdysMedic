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
    containerClass: 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300',
    dotClass: 'bg-cyan-400',
  },
  'Nivel 2': {
    label: 'Nivel 2',
    subtext: 'Intermedio',
    containerClass: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300',
    dotClass: 'bg-emerald-400',
  },
  'Nivel 3': {
    label: 'Nivel 3',
    subtext: 'Avanzado',
    containerClass: 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300',
    dotClass: 'bg-indigo-400',
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
      className={`inline-flex items-center rounded-lg border font-mono font-medium transition-colors ${config.containerClass} ${sizeClasses[size]} ${className}`}
      title={`${config.label}: Competencia ${config.subtext}`}
    >
      <span className={`rounded-full shrink-0 ${dotSizes[size]} ${config.dotClass}`} />
      <span className="font-semibold">{config.label}</span>
      {showSubtext && (
        <span className="opacity-75 font-sans text-[11px]">
          ({config.subtext})
        </span>
      )}
    </span>
  );
};

export default LevelBadge;
