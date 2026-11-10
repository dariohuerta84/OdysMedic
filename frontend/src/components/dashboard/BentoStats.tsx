import React from 'react';
import {
  Flame,
  Award,
  Compass,
  RotateCw,
} from 'lucide-react';
import type { CompetencyLevel } from '../../types/api';
import { LevelBadge } from '../common/LevelBadge';
import { ProgressBar } from '../common/ProgressBar';
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber';

export interface BentoStatsProps {
  level: CompetencyLevel;
  xp: number;
  streakDays: number;
  pendingReviewsCount: number;
  stageName?: string;
  isDiagnosticCompleted?: boolean;
  overallScore?: number | null;
  className?: string;
}

export const BentoStats: React.FC<BentoStatsProps> = ({
  level,
  xp,
  streakDays,
  pendingReviewsCount,
  stageName,
  isDiagnosticCompleted = false,
  overallScore = null,
  className = '',
}) => {
  const animatedXp = Math.round(useAnimatedNumber(xp, 850));
  const animatedStreak = Math.round(useAnimatedNumber(streakDays, 650));
  const animatedPending = Math.round(useAnimatedNumber(pendingReviewsCount, 650));

  const xpThresholds = {
    'Nivel 1': { min: 0, next: 1000, nextLevel: 'Nivel 2' },
    'Nivel 2': { min: 1000, next: 3000, nextLevel: 'Nivel 3' },
    'Nivel 3': { min: 3000, next: 5000, nextLevel: 'Especialista' },
  };

  const currentTier = xpThresholds[level] || xpThresholds['Nivel 1'];
  const progressToNext = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        ((xp - currentTier.min) / (currentTier.next - currentTier.min)) * 100
      )
    )
  );

  const xpRemaining = Math.max(0, currentTier.next - xp);

  const defaultStage =
    level === 'Nivel 3'
      ? 'Internado / Preparacion avanzada'
      : level === 'Nivel 2'
        ? 'Ciencias clinicas y rotaciones'
        : 'Ruta formativa inicial';

  const resolvedStage = stageName || defaultStage;
  const isCriticalRoute =
    isDiagnosticCompleted && typeof overallScore === 'number' && overallScore < 50;

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full ${className}`}
    >
      {/* Card 1: Nivel Clinico */}
      <div className="p-5 rounded-3xl bg-white border border-[#DCE5E3] editorial-card-lift flex flex-col justify-between animate-fade-in-up stagger-1">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] uppercase tracking-[0.14em] text-[#6B7D83] font-semibold">
            Nivel formativo
          </span>
          <div className="w-8 h-8 rounded-full bg-[#ECF6F4] flex items-center justify-center text-[#0E6F65]">
            <Award className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-2">
          {isDiagnosticCompleted ? (
            <LevelBadge level={level} size="md" showSubtext />
          ) : (
            <span className="font-serif text-lg font-semibold text-[#4A5D64] block">
              Por calibrar
            </span>
          )}
          <p className="text-xs text-[#4A5D64]">
            {resolvedStage}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-[#EDF2F0] flex items-center justify-between text-[11px] text-[#6B7D83]">
          <span>Estado de ruta</span>
          <span
            className={`font-semibold ${
              !isDiagnosticCompleted
                ? 'text-[#6B7D83]'
                : isCriticalRoute
                  ? 'text-[#B6222A]'
                  : 'text-[#0E6F65]'
            }`}
          >
            {!isDiagnosticCompleted
              ? 'Pendiente de evaluacion'
              : isCriticalRoute
                ? 'Nivelacion prioritaria'
                : 'Calibrada'}
          </span>
        </div>
      </div>

      {/* Card 2: Progreso acumulado */}
      <div className="p-5 rounded-3xl bg-white border border-[#DCE5E3] editorial-card-lift flex flex-col justify-between animate-fade-in-up stagger-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] uppercase tracking-[0.14em] text-[#6B7D83] font-semibold">
            Experiencia clinica
          </span>
          <div className="w-8 h-8 rounded-full bg-[#ECF6F4] flex items-center justify-center text-[#0E6F65]">
            <Compass className="w-4 h-4" />
          </div>
        </div>

        <div className="my-1">
          <div className="font-serif text-2xl font-semibold text-[#0B252E]">
            {animatedXp.toLocaleString()}{' '}
            <span className="text-xs font-sans font-medium text-[#0E6F65]">
              XP
            </span>
          </div>
          <div className="mt-2.5">
            <ProgressBar
              progress={progressToNext}
              color="teal"
              height="sm"
            />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#EDF2F0] flex items-center justify-between text-[11px] text-[#6B7D83]">
          <span>Siguiente etapa: {currentTier.nextLevel}</span>
          <span>
            {xpRemaining > 0 ? `${xpRemaining} XP` : 'Completado'}
          </span>
        </div>
      </div>

      {/* Card 3: Constancia de estudio */}
      <div className="p-5 rounded-3xl bg-white border border-[#DCE5E3] editorial-card-lift flex flex-col justify-between animate-fade-in-up stagger-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] uppercase tracking-[0.14em] text-[#6B7D83] font-semibold">
            Constancia de practica
          </span>
          <div className="w-8 h-8 rounded-full bg-[#FDF7E7] flex items-center justify-center text-[#8A6116]">
            <Flame className="w-4 h-4" />
          </div>
        </div>

        <div className="my-1 space-y-1">
          <div className="font-serif text-2xl font-semibold text-[#0B252E] flex items-baseline gap-2">
            <span>{animatedStreak}</span>
            <span className="text-xs font-sans font-normal text-[#4A5D64]">
              {streakDays === 1 ? 'dia activo' : 'dias consecutivos'}
            </span>
          </div>
          <p className="text-xs text-[#6B7D83]">
            {streakDays > 0
              ? 'Ritmo sostenido sin sobrecarga'
              : 'Comienza hoy una estacion breve'}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-[#EDF2F0] flex items-center justify-between text-[11px] text-[#6B7D83]">
          <span>Habito clinico</span>
          <span className="text-[#8A6116] font-medium">
            {streakDays >= 7 ? 'Consolidado' : 'En construccion'}
          </span>
        </div>
      </div>

      {/* Card 4: Repasos Espaciados */}
      <div className="p-5 rounded-3xl bg-white border border-[#DCE5E3] editorial-card-lift flex flex-col justify-between animate-fade-in-up stagger-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] uppercase tracking-[0.14em] text-[#6B7D83] font-semibold">
            Repasos programados
          </span>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              pendingReviewsCount > 0
                ? 'bg-[#FBF1F1] text-[#B6222A]'
                : 'bg-[#ECF6F4] text-[#0E6F65]'
            }`}
          >
            <RotateCw className="w-4 h-4" />
          </div>
        </div>

        <div className="my-1 space-y-1">
          <div className="font-serif text-2xl font-semibold text-[#0B252E] flex items-baseline gap-2">
            <span className={pendingReviewsCount > 0 ? 'text-[#B6222A]' : ''}>
              {animatedPending}
            </span>
            <span className="text-xs font-sans font-normal text-[#4A5D64]">
              {pendingReviewsCount === 1 ? 'estacion pendiente' : 'estaciones pendientes'}
            </span>
          </div>
          <p className="text-xs text-[#6B7D83]">
            {pendingReviewsCount > 0
              ? isCriticalRoute
                ? 'Refuerzo inmediato activado por brechas'
                : 'Refuerzo intervalar D7 / D21 sugerido'
              : 'Sin repasos atrasados en tu ruta'}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-[#EDF2F0] flex items-center justify-between text-[11px] text-[#6B7D83]">
          <span>Memoria a largo plazo</span>
          <span
            className={
              pendingReviewsCount > 0
                ? 'text-[#B6222A] font-semibold'
                : 'text-[#0E6F65] font-medium'
            }
          >
            {pendingReviewsCount > 0 ? 'Prioritario hoy' : 'Al dia'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BentoStats;
