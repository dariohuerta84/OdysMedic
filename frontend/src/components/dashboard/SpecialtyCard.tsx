import React from 'react';
import {
  Droplets,
  Activity,
  Brain,
  ShieldAlert,
  Baby,
  Stethoscope,
  Heart,
  Wind,
  Lock,
  ArrowRight,
  AlertTriangle,
  LucideIcon,
} from 'lucide-react';
import type { Specialty, SpecialtyMastery } from '../../types/api';
import { LevelBadge } from '../common/LevelBadge';
import { ProgressBar } from '../common/ProgressBar';
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber';

export interface SpecialtyCardProps {
  specialty: Specialty;
  mastery?: SpecialtyMastery;
  isDiagnosticCompleted?: boolean;
  onSelect: (specialtyId: string) => void;
  className?: string;
}

const getSpecialtyIcon = (
  specialtyId: string,
  iconName?: string
): { icon: LucideIcon; accentColor: string; bgAccent: string; borderAccent: string } => {
  const norm = (specialtyId + ' ' + (iconName || '')).toLowerCase();

  if (norm.includes('nefro')) {
    return {
      icon: Droplets,
      accentColor: 'text-[#0E6F65]',
      bgAccent: 'bg-[#ECF6F4]',
      borderAccent: 'border-[#CFE7E2]',
    };
  }
  if (norm.includes('endo')) {
    return {
      icon: Activity,
      accentColor: 'text-[#8A6116]',
      bgAccent: 'bg-[#FDF7E7]',
      borderAccent: 'border-[#EFE0B9]',
    };
  }
  if (norm.includes('neuro')) {
    return {
      icon: Brain,
      accentColor: 'text-[#0E6F65]',
      bgAccent: 'bg-[#F2F7F6]',
      borderAccent: 'border-[#DCE5E3]',
    };
  }
  if (norm.includes('reuma')) {
    return {
      icon: ShieldAlert,
      accentColor: 'text-[#9E3F42]',
      bgAccent: 'bg-[#FBF1F1]',
      borderAccent: 'border-[#EED7D7]',
    };
  }
  if (norm.includes('gineco') || norm.includes('obste')) {
    return {
      icon: Baby,
      accentColor: 'text-[#0E6F65]',
      bgAccent: 'bg-[#ECF6F4]',
      borderAccent: 'border-[#CFE7E2]',
    };
  }
  if (norm.includes('cardio')) {
    return {
      icon: Heart,
      accentColor: 'text-[#9E3F42]',
      bgAccent: 'bg-[#FBF1F1]',
      borderAccent: 'border-[#EED7D7]',
    };
  }
  if (norm.includes('neumo') || norm.includes('pulm')) {
    return {
      icon: Wind,
      accentColor: 'text-[#0E6F65]',
      bgAccent: 'bg-[#ECF6F4]',
      borderAccent: 'border-[#CFE7E2]',
    };
  }

  return {
    icon: Stethoscope,
    accentColor: 'text-[#0E6F65]',
    bgAccent: 'bg-[#ECF6F4]',
    borderAccent: 'border-[#CFE7E2]',
  };
};

const HIGH_YIELD_TOPICS: Record<string, string> = {
  nefrologia: 'Injuria renal y medio interno',
  endocrinologia: 'Crisis hiperglucemicas y tiroides',
  neurologia: 'Enfermedad cerebrovascular aguda',
  reumatologia: 'Autoinmunidad sistemica',
  ginecologia: 'Claves obstetricas',
  ginecologia_obstetricia: 'Claves obstetricas',
  medicina_interna: 'Integracion clinico-diagnostica',
  pediatria: 'Urgencias pediatricas',
  cirugia_general: 'Abdomen agudo quirurgico',
  oftalmologia: 'Urgencias neuro-oftalmologicas',
};

export const SpecialtyCard: React.FC<SpecialtyCardProps> = ({
  specialty,
  mastery,
  isDiagnosticCompleted = true,
  onSelect,
  className = '',
}) => {
  const iconConfig = getSpecialtyIcon(specialty.id, specialty.icon);
  const Icon = iconConfig.icon;

  const isUnlocked = specialty.is_unlocked ?? true;
  const casesCompleted = isDiagnosticCompleted ? (mastery?.cases_completed ?? 0) : 0;
  const totalCases =
    mastery?.total_cases || specialty.cases_count || specialty.case_count || 8;
  const masteryScore = isDiagnosticCompleted ? Math.round(mastery?.mastery_score ?? 0) : 0;
  const animatedMastery = Math.round(useAnimatedNumber(masteryScore, 800));
  const currentLevel = mastery?.level ?? 'Nivel 1';

  const isLowScore = isDiagnosticCompleted && masteryScore < 50;
  const isMidScore = isDiagnosticCompleted && masteryScore >= 50 && masteryScore < 75;

  const highYieldTopic =
    HIGH_YIELD_TOPICS[specialty.id.toLowerCase()] || 'Casos clinicos integrados';

  const hasStarted = casesCompleted > 0;
  const isCompleted = casesCompleted >= totalCases && totalCases > 0;

  const handleClick = () => {
    if (isUnlocked) {
      onSelect(specialty.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative rounded-3xl bg-white border p-6 flex flex-col justify-between editorial-card-lift ${
        !isUnlocked
          ? 'opacity-65 cursor-not-allowed bg-[#F2F7F6]/60 border-[#DCE5E3]'
          : isLowScore
            ? 'cursor-pointer border-[#E8C8C9] hover:border-[#C6383E]/60'
            : 'cursor-pointer border-[#DCE5E3] hover:border-[#0E6F65]/50'
      } ${className}`}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div
            className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${iconConfig.bgAccent} ${iconConfig.borderAccent} ${iconConfig.accentColor}`}
          >
            <Icon className="w-5 h-5" />
          </div>

          <div className="text-right">
            {isUnlocked ? (
              isDiagnosticCompleted ? (
                isLowScore ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FDECEC] text-[#B6222A] border border-[#E8BDBD]">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Refuerzo urgente</span>
                  </span>
                ) : (
                  <LevelBadge level={currentLevel} size="sm" />
                )
              ) : (
                <span className="text-[11px] text-[#6B7D83]">
                  Pendiente de calibracion
                </span>
              )
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-[#6B7D83]">
                <Lock className="w-3 h-3" />
                <span>Bloqueado</span>
              </span>
            )}
          </div>
        </div>

        <div className="mb-5 space-y-1.5">
          <span
            className={`text-[11px] uppercase tracking-[0.14em] font-semibold block ${
              isLowScore ? 'text-[#B6222A]' : 'text-[#0E6F65]'
            }`}
          >
            {highYieldTopic}
          </span>
          <h3 className="font-serif text-lg font-semibold text-[#0B252E] group-hover:text-[#0E6F65] transition-colors">
            {specialty.name}
          </h3>
          <p className="text-xs sm:text-sm text-[#4A5D64] line-clamp-2 leading-relaxed">
            {specialty.description}
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-[#EDF2F0] space-y-3.5">
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[#6B7D83]">
              {casesCompleted} de {totalCases} estaciones
            </span>
            <span
              className={`font-semibold ${
                !isDiagnosticCompleted
                  ? 'text-[#6B7D83]'
                  : isLowScore
                    ? 'text-[#B6222A]'
                    : isMidScore
                      ? 'text-[#9A6B1F]'
                      : 'text-[#0E6F65]'
              }`}
            >
              {isDiagnosticCompleted ? `${animatedMastery}% dominio` : 'Sin evaluar'}
            </span>
          </div>
          <ProgressBar
            progress={isDiagnosticCompleted ? Math.max(4, masteryScore) : 0}
            color={
              !isDiagnosticCompleted
                ? 'teal'
                : isLowScore
                  ? 'rose'
                  : isMidScore
                    ? 'amber'
                    : masteryScore >= 85
                      ? 'emerald'
                      : 'teal'
            }
            height="sm"
          />
        </div>

        <button
          type="button"
          disabled={!isUnlocked}
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          className={`w-full py-2.5 px-4 rounded-full text-xs font-medium flex items-center justify-center gap-2 transition-all duration-200 ${
            !isUnlocked
              ? 'bg-[#F2F7F6] text-[#8FA1A6] cursor-not-allowed'
              : isLowScore
                ? 'bg-[#FDECEC] hover:bg-[#FADADA] text-[#B6222A]'
                : hasStarted && !isCompleted
                  ? 'bg-[#0E6F65] hover:bg-[#0A564E] text-white'
                  : 'bg-[#ECF6F4] hover:bg-[#DFEFEA] text-[#0E6F65]'
          }`}
        >
          <span>
            {!isUnlocked
              ? 'Mundo bloqueado'
              : !isDiagnosticCompleted
                ? 'Realizar evaluacion inicial primero'
                : isLowScore
                  ? 'Nivelar especialidad'
                  : isCompleted
                    ? 'Repasar estaciones'
                    : hasStarted
                      ? 'Continuar mundo clinico'
                      : 'Explorar estaciones'}
          </span>
          {isUnlocked ? (
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          ) : (
            <Lock className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default SpecialtyCard;
