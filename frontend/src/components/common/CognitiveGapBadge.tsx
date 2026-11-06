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
  gapTag: CognitiveGapTag | string;
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

const GAP_DEFINITIONS: Record<string, GapConfig> = {
  GAP_TRIAGE_SEVERITY: {
    title: 'Triaje y Reconocimiento de Gravedad',
    description:
      'Identificacion oportuna de signos de alarma, estabilidad hemodinamica y criterios de ingreso UCI/emergencia.',
    icon: AlertTriangle,
    containerClass: 'bg-rose-50 border-rose-200 text-rose-800',
    iconClass: 'text-rose-600',
  },
  GAP_TRIAGE_PRIORITIZATION: {
    title: 'Triaje y Reconocimiento de Gravedad',
    description:
      'Identificacion oportuna de signos de alarma, estabilidad hemodinamica y criterios de ingreso UCI/emergencia.',
    icon: AlertTriangle,
    containerClass: 'bg-rose-50 border-rose-200 text-rose-800',
    iconClass: 'text-rose-600',
  },
  GAP_DIAGNOSTIC_REASONING: {
    title: 'Razonamiento Diagnostico Clinico',
    description:
      'Sintesis sindromica, correlacion clinico-patologica y jerarquizacion de diagnosticos diferenciales.',
    icon: Brain,
    containerClass: 'bg-amber-50 border-amber-200 text-amber-800',
    iconClass: 'text-amber-600',
  },
  GAP_LAB_INTERPRETATION: {
    title: 'Interpretacion de Examenes y Labs',
    description:
      'Analisis critico de laboratorio, gases arteriales, biomarcadores e imagenes diagnosticas.',
    icon: Microscope,
    containerClass: 'bg-sky-50 border-sky-200 text-sky-800',
    iconClass: 'text-sky-600',
  },
  GAP_INITIAL_MANAGEMENT: {
    title: 'Manejo Terapeutico Inicial',
    description:
      'Protocolos de reanimacion, farmacoterapia guiada por evidencia y estabilizacion clinica.',
    icon: ShieldPlus,
    containerClass: 'bg-indigo-50 border-indigo-200 text-indigo-800',
    iconClass: 'text-indigo-600',
  },
  GAP_THERAPEUTIC_MANAGEMENT: {
    title: 'Manejo Terapeutico y Farmacologico',
    description:
      'Protocolos de reanimacion, farmacoterapia guiada por evidencia y estabilizacion clinica.',
    icon: ShieldPlus,
    containerClass: 'bg-indigo-50 border-indigo-200 text-indigo-800',
    iconClass: 'text-indigo-600',
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
    containerClass: 'bg-slate-50 border-slate-200 text-slate-800',
    iconClass: 'text-slate-500',
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
        className={`rounded-xl border p-3.5 transition-all shadow-xs ${config.containerClass} ${className}`}
      >
        <div className="flex items-center gap-2 mb-1.5 font-semibold text-xs tracking-wide">
          <Icon className={`${sizeClasses[size].icon} shrink-0 ${config.iconClass}`} />
          <span>{config.title}</span>
          <span className="ml-auto font-mono text-[10px] uppercase opacity-75">
            {gapTag}
          </span>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed pl-5">
          {config.description}
        </p>
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-lg border font-medium transition-colors shadow-xs ${config.containerClass} ${sizeClasses[size].badge} ${className}`}
      title={`${config.title}: ${config.description}`}
    >
      <Icon className={`${sizeClasses[size].icon} shrink-0 ${config.iconClass}`} />
      <span className="truncate">{config.title}</span>
    </span>
  );
};

export default CognitiveGapBadge;
