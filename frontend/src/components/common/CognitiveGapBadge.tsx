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
      'Identificacion oportuna de signos de alarma, estabilidad hemodinamica y criterios de ingreso critico.',
    icon: AlertTriangle,
    containerClass: 'bg-[#FBF1F1] border-[#EED7D7] text-[#8E3B3E]',
    iconClass: 'text-[#9E3F42]',
  },
  GAP_TRIAGE_PRIORITIZATION: {
    title: 'Triaje y Reconocimiento de Gravedad',
    description:
      'Identificacion oportuna de signos de alarma, estabilidad hemodinamica y criterios de ingreso critico.',
    icon: AlertTriangle,
    containerClass: 'bg-[#FBF1F1] border-[#EED7D7] text-[#8E3B3E]',
    iconClass: 'text-[#9E3F42]',
  },
  GAP_DIAGNOSTIC_REASONING: {
    title: 'Razonamiento Diagnostico Clinico',
    description:
      'Sintesis sindromica, correlacion clinico-patologica y jerarquizacion de diagnosticos diferenciales.',
    icon: Brain,
    containerClass: 'bg-[#FDF7E7] border-[#EFE0B9] text-[#7A5413]',
    iconClass: 'text-[#8A6116]',
  },
  GAP_LAB_INTERPRETATION: {
    title: 'Interpretacion de Examenes y Laboratorio',
    description:
      'Analisis critico de laboratorio, equilibrio acido-base, biomarcadores e imagenes diagnosticas.',
    icon: Microscope,
    containerClass: 'bg-[#ECF6F4] border-[#CFE7E2] text-[#0E6F65]',
    iconClass: 'text-[#0E6F65]',
  },
  GAP_INITIAL_MANAGEMENT: {
    title: 'Manejo Terapeutico Inicial',
    description:
      'Protocolos de estabilizacion, farmacoterapia guiada por evidencia y seguimiento clinico.',
    icon: ShieldPlus,
    containerClass: 'bg-[#F2F7F6] border-[#DCE5E3] text-[#0B252E]',
    iconClass: 'text-[#0E6F65]',
  },
  GAP_THERAPEUTIC_MANAGEMENT: {
    title: 'Manejo Terapeutico y Farmacologico',
    description:
      'Protocolos de estabilizacion, farmacoterapia guiada por evidencia y seguimiento clinico.',
    icon: ShieldPlus,
    containerClass: 'bg-[#F2F7F6] border-[#DCE5E3] text-[#0B252E]',
    iconClass: 'text-[#0E6F65]',
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
    description: 'Area de razonamiento clinico evaluada en la ruta formativa.',
    icon: AlertTriangle,
    containerClass: 'bg-[#F2F7F6] border-[#DCE5E3] text-[#4A5D64]',
    iconClass: 'text-[#0E6F65]',
  };

  const Icon = config.icon;

  const sizeClasses = {
    sm: {
      badge: 'px-2.5 py-1 text-[11px] gap-1.5',
      icon: 'w-3 h-3',
    },
    md: {
      badge: 'px-3 py-1 text-xs gap-2',
      icon: 'w-3.5 h-3.5',
    },
    lg: {
      badge: 'px-3.5 py-1.5 text-sm gap-2.5',
      icon: 'w-4 h-4',
    },
  };

  if (showDescription) {
    return (
      <div
        className={`rounded-2xl border p-4 transition-all ${config.containerClass} ${className}`}
      >
        <div className="flex items-center gap-2 mb-1.5 font-semibold text-xs">
          <Icon className={`${sizeClasses[size].icon} shrink-0 ${config.iconClass}`} />
          <span>{config.title}</span>
        </div>
        <p className="text-xs text-[#4A5D64] leading-relaxed pl-5">
          {config.description}
        </p>
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border font-sans font-medium transition-colors ${config.containerClass} ${sizeClasses[size].badge} ${className}`}
      title={`${config.title}: ${config.description}`}
    >
      <Icon className={`${sizeClasses[size].icon} shrink-0 ${config.iconClass}`} />
      <span className="truncate">{config.title}</span>
    </span>
  );
};

export default CognitiveGapBadge;
