import React from 'react';
import {
  AlertTriangle,
  Brain,
  Microscope,
  ShieldPlus,
  LucideIcon,
} from 'lucide-react';
import type { CognitiveGapTag } from '../../types/api';

export interface CognitiveGapBadgeProps {
  gapTag: CognitiveGapTag;
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
  className?: string;
}

interface GapConfig {
  title: string;
  description: string;
  icon: LucideIcon;
  containerClass: string;
  iconClass: string;
}

const GAP_DEFINITIONS: Record<CognitiveGapTag, GapConfig> = {
  GAP_TRIAGE_SEVERITY: {
    title: 'Triaje y Reconocimiento de Gravedad',
    description:
      'Identificacion oportuna de signos de alarma, estabilidad hemodinamica y criterios de ingreso UCI/emergencia.',
    icon: AlertTriangle,
    containerClass: 'bg-rose-500/10 border-rose-500/40 text-rose-300',
    iconClass: 'text-rose-400',
  },
  GAP_DIAGNOSTIC_REASONING: {
    title: 'Razonamiento Diagnostico Clinico',
    description:
      'Sintesis sindromica, correlacion clinico-patologica y jerarquizacion de diagnosticos diferenciales.',
    icon: Brain,
    containerClass: 'bg-amber-500/10 border-amber-500/40 text-amber-300',
    iconClass: 'text-amber-400',
  },
  GAP_LAB_INTERPRETATION: {
    title: 'Interpretacion de Examenes y Labs',
    description:
      'Analisis critico de laboratorio, gases arteriales, biomarcadores e imagenes diagnosticas.',
    icon: Microscope,
    containerClass: 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300',
    iconClass: 'text-cyan-400',
  },
  GAP_INITIAL_MANAGEMENT: {
    title: 'Manejo Terapeutico Inicial',
    description:
      'Protocolos de reanimacion, farmacoterapia guiada por evidencia y estabilizacion clinica.',
    icon: ShieldPlus,
    containerClass: 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300',
    iconClass: 'text-indigo-400',
  },
};

export const CognitiveGapBadge: React.FC<CognitiveGapBadgeProps> = ({
  gapTag,
  size = 'md',
  showDescription = false,
  className = '',
}) => {
  const config = GAP_DEFINITIONS[gapTag] || {
    title: gapTag,
    description: 'Brecha de razonamiento clinico detectada por el motor OCRI.',
    icon: AlertTriangle,
    containerClass: 'bg-slate-800/80 border-slate-700 text-slate-300',
    iconClass: 'text-slate-400',
  };

  const Icon = config.icon;

  const sizeClasses = {
    sm: {
      badge: 'px-2 py-0.5 text-[11px] gap-1.5',
      icon: 'w-3 h-3',
    },
    md: {
      badge: 'px-2.5 py-1 text-xs gap-2',
      icon: 'w-3.5 h-3.5',
    },
    lg: {
      badge: 'px-3 py-1.5 text-sm gap-2.5',
      icon: 'w-4 h-4',
    },
  };

  if (showDescription) {
    return (
      <div
        className={`rounded-xl border p-3.5 transition-all ${config.containerClass} ${className}`}
      >
        <div className="flex items-center gap-2 mb-1.5 font-semibold text-xs tracking-wide">
          <Icon className={`${sizeClasses[size].icon} shrink-0 ${config.iconClass}`} />
          <span>{config.title}</span>
          <span className="ml-auto font-mono text-[10px] uppercase opacity-70">
            {gapTag}
          </span>
        </div>
        <p className="text-xs text-gray-300/90 leading-relaxed pl-5">
          {config.description}
        </p>
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-lg border font-medium transition-colors ${config.containerClass} ${sizeClasses[size].badge} ${className}`}
      title={`${config.title}: ${config.description}`}
    >
      <Icon className={`${sizeClasses[size].icon} shrink-0 ${config.iconClass}`} />
      <span className="truncate">{config.title}</span>
    </span>
  );
};

export default CognitiveGapBadge;
