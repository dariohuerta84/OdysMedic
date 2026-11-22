import React from 'react';
import type { CompetencyLevel, HLRSummary } from '../../types/api';
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber';

export interface BentoStatsProps {
  level: CompetencyLevel;
  xp: number;
  streakDays: number;
  pendingReviewsCount: number;
  stageName?: string;
  isDiagnosticCompleted?: boolean;
  overallScore?: number | null;
  hlrSummary?: HLRSummary | null;
  className?: string;
}

export const BentoStats: React.FC<BentoStatsProps> = ({
  level,
  xp,
  streakDays,
  pendingReviewsCount,
  isDiagnosticCompleted = false,
  overallScore = null,
  hlrSummary = null,
  className = '',
}) => {
  const animatedXp = Math.round(useAnimatedNumber(xp, 800));
  const animatedStreak = Math.round(useAnimatedNumber(streakDays, 600));
  const animatedPending = Math.round(useAnimatedNumber(pendingReviewsCount, 600));
  const animatedScore = Math.round(useAnimatedNumber(overallScore ?? 0, 850));

  const avgRecallPct = hlrSummary
    ? Math.round(hlrSummary.average_recall_probability * 100)
    : 100;
  const avgHalfLife = hlrSummary ? hlrSummary.average_half_life_days.toFixed(1) : '4.0';

  const scoreColor = !isDiagnosticCompleted
    ? 'text-[#64767E]'
    : animatedScore < 50
      ? 'text-[#A6262E]'
      : animatedScore < 75
        ? 'text-[#9A6B1F]'
        : 'text-[#0E6F65]';

  const recallColor =
    avgRecallPct < 55
      ? 'text-[#A6262E]'
      : avgRecallPct < 75
        ? 'text-[#9A6B1F]'
        : 'text-[#0E6F65]';

  return (
    <div
      className={`grid grid-cols-2 lg:grid-cols-5 border-t border-b border-[#DEDBD2] divide-y lg:divide-y-0 lg:divide-x divide-[#DEDBD2] bg-[#FAF9F6] ${className}`}
    >
      {/* 1. Indice OCRI */}
      <div className="py-5 pr-4 lg:px-5 first:lg:pl-0 space-y-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64767E] block">
          Indice OCRI
        </span>
        <div className={`font-serif text-3xl font-bold telemetry-mono ${scoreColor}`}>
          {isDiagnosticCompleted ? `${animatedScore}%` : '--'}
        </div>
        <span className="text-xs text-[#3D525A] block">
          {isDiagnosticCompleted ? level : 'Sin calibrar'}
        </span>
      </div>

      {/* 2. Retencion Media HLR */}
      <div className="py-5 pl-4 lg:px-5 space-y-1 border-l border-[#DEDBD2] lg:border-l">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64767E] block">
          Retencion HLR (p)
        </span>
        <div className={`font-serif text-3xl font-bold telemetry-mono ${recallColor}`}>
          {isDiagnosticCompleted ? `${avgRecallPct}%` : '--'}
        </div>
        <span className="font-mono text-[11px] text-[#64767E] block">
          Vida media h = {avgHalfLife}d
        </span>
      </div>

      {/* 3. Dificultad Optima Goldilocks */}
      <div className="py-5 pr-4 lg:px-5 space-y-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64767E] block">
          Zona Goldilocks
        </span>
        <div className="font-serif text-lg font-bold text-[#0D1F26] leading-tight pt-1">
          {hlrSummary?.goldilocks_target_tier || level}
        </div>
        <span className="text-xs text-[#64767E] block">Objetivo IRT ~78% exito</span>
      </div>

      {/* 4. Racha y Repasos */}
      <div className="py-5 pl-4 lg:px-5 space-y-1 border-l border-[#DEDBD2] lg:border-l">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64767E] block">
          Constancia / Cola
        </span>
        <div className="font-serif text-3xl font-bold telemetry-mono text-[#0D1F26]">
          {animatedStreak}d
        </div>
        <span
          className={`font-mono text-[11px] block ${
            animatedPending > 0 ? 'text-[#9A6B1F]' : 'text-[#0E6F65]'
          }`}
        >
          {animatedPending} {animatedPending === 1 ? 'repaso pendiente' : 'repasos pendientes'}
        </span>
      </div>

      {/* 5. Experiencia Clinica */}
      <div className="col-span-2 lg:col-span-1 py-5 lg:pl-5 space-y-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#64767E] block">
          Experiencia Clinica
        </span>
        <div className="font-serif text-3xl font-bold telemetry-mono text-[#0E6F65]">
          {animatedXp.toLocaleString()}
        </div>
        <span className="font-mono text-[11px] text-[#64767E] block">Puntos XP acumulados</span>
      </div>
    </div>
  );
};

export default BentoStats;
