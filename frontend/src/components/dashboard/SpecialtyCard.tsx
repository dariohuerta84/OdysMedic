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
  LucideIcon,
  Sparkles,
} from 'lucide-react';
import type { Specialty, SpecialtyMastery } from '../../types/api';
import { LevelBadge } from '../common/LevelBadge';
import { ProgressBar } from '../common/ProgressBar';

export interface SpecialtyCardProps {
  specialty: Specialty;
  mastery?: SpecialtyMastery;
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
      accentColor: 'text-sky-600',
      bgAccent: 'bg-sky-50',
      borderAccent: 'border-sky-200',
    };
  }
  if (norm.includes('endo')) {
    return {
      icon: Activity,
      accentColor: 'text-amber-600',
      bgAccent: 'bg-amber-50',
      borderAccent: 'border-amber-200',
    };
  }
  if (norm.includes('neuro')) {
    return {
      icon: Brain,
      accentColor: 'text-indigo-600',
      bgAccent: 'bg-indigo-50',
      borderAccent: 'border-indigo-200',
    };
  }
  if (norm.includes('reuma')) {
    return {
      icon: ShieldAlert,
      accentColor: 'text-rose-600',
      bgAccent: 'bg-rose-50',
      borderAccent: 'border-rose-200',
    };
  }
  if (norm.includes('gineco') || norm.includes('obste')) {
    return {
      icon: Baby,
      accentColor: 'text-sky-600',
      bgAccent: 'bg-sky-50',
      borderAccent: 'border-sky-200',
    };
  }
  if (norm.includes('cardio')) {
    return {
      icon: Heart,
      accentColor: 'text-rose-600',
      bgAccent: 'bg-rose-50',
      borderAccent: 'border-rose-200',
    };
  }
  if (norm.includes('neumo') || norm.includes('pulm')) {
    return {
      icon: Wind,
      accentColor: 'text-sky-600',
      bgAccent: 'bg-sky-50',
      borderAccent: 'border-sky-200',
    };
  }

  return {
    icon: Stethoscope,
    accentColor: 'text-emerald-600',
    bgAccent: 'bg-emerald-50',
    borderAccent: 'border-emerald-200',
  };
};

const HIGH_YIELD_TOPICS: Record<string, string> = {
  nefrologia: 'IRA / Trastornos de Potasio',
  endocrinologia: 'CAD / Estado Hiperosmolar',
  neurologia: 'ACV Isquemico / Sindrome Meningeo',
  reumatologia: 'Lupus Sistemico / Artritis',
  ginecologia: 'Preeclampsia / Hemorragia',
};

export const SpecialtyCard: React.FC<SpecialtyCardProps> = ({
  specialty,
  mastery,
  onSelect,
  className = '',
}) => {
  const iconConfig = getSpecialtyIcon(specialty.id, specialty.icon);
  const Icon = iconConfig.icon;

  const isUnlocked = specialty.is_unlocked ?? true;
  const casesCompleted = mastery?.cases_completed ?? 0;
  const totalCases =
    mastery?.total_cases || specialty.cases_count || specialty.case_count || 10;
  const masteryScore = Math.round(mastery?.mastery_score ?? 0);
  const currentLevel = mastery?.level ?? 'Nivel 1';

  const highYieldTopic =
    HIGH_YIELD_TOPICS[specialty.id.toLowerCase()] || 'Temario ENAM / CONAREME';

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
      className={`group relative rounded-xl bg-white border border-slate-200 p-5 shadow-xs flex flex-col justify-between transition-all duration-200 ${
        isUnlocked
          ? 'cursor-pointer hover:border-sky-300 hover:shadow-md hover:-translate-y-0.5'
          : 'opacity-60 cursor-not-allowed border-dashed bg-slate-50'
      } ${className}`}
    >
      <div>
        {/* Top bar: Icon, badges and lock indicator */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div
            className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-xs ${iconConfig.bgAccent} ${iconConfig.borderAccent} ${iconConfig.accentColor}`}
          >
            <Icon className="w-5 h-5" />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 justify-end">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border border-sky-200 bg-sky-50 text-sky-800">
              <Sparkles className="w-2.5 h-2.5" />
              <span>{highYieldTopic}</span>
            </span>

            {isUnlocked ? (
              <LevelBadge level={currentLevel} size="sm" />
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border border-slate-300 bg-slate-100 text-slate-500">
                <Lock className="w-2.5 h-2.5" />
                <span>Bloqueado</span>
              </span>
            )}
          </div>
        </div>

        {/* Title and description */}
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
            {specialty.name}
          </h3>
          <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
            {specialty.description}
          </p>
        </div>
      </div>

      {/* Mastery, Cases count, and CTA Button */}
      <div className="pt-3 border-t border-slate-100 space-y-3">
        {/* Progress & metrics */}
        <div>
          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
            <span className="text-slate-500 text-[11px]">
              {casesCompleted} / {totalCases} casos resueltos
            </span>
            <span className="text-slate-900 font-semibold text-[11px]">
              {masteryScore}% maestria
            </span>
          </div>
          <ProgressBar
            progress={masteryScore}
            color={
              masteryScore >= 80
                ? 'emerald'
                : masteryScore >= 50
                  ? 'cyan'
                  : 'amber'
            }
            height="sm"
          />
        </div>

        {/* CTA Button */}
        <button
          type="button"
          disabled={!isUnlocked}
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          className={`w-full py-2.5 px-3.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            !isUnlocked
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : isCompleted
                ? 'bg-white border border-sky-300 text-sky-700 hover:bg-sky-50'
                : hasStarted
                  ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-xs'
                  : 'bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800'
          }`}
        >
          <span>
            {!isUnlocked
              ? 'Guardia Bloqueada'
              : isCompleted
                ? 'Repasar Casos Clinicos'
                : hasStarted
                  ? 'Continuar Caso'
                  : 'Iniciar Guardia Clinica'}
          </span>
          {isUnlocked ? (
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          ) : (
            <Lock className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default SpecialtyCard;
