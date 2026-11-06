import React from 'react';
import {
  Flame,
  Award,
  Zap,
  RotateCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import type { CompetencyLevel } from '../../types/api';
import { LevelBadge } from '../common/LevelBadge';
import { ProgressBar } from '../common/ProgressBar';

export interface BentoStatsProps {
  level: CompetencyLevel;
  xp: number;
  streakDays: number;
  pendingReviewsCount: number;
  stageName?: string;
  className?: string;
}

export const BentoStats: React.FC<BentoStatsProps> = ({
  level,
  xp,
  streakDays,
  pendingReviewsCount,
  stageName,
  className = '',
}) => {
  // Determine XP targets and next milestone
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
      ? 'Internado / Postulante Residentado'
      : level === 'Nivel 2'
        ? 'Externado Medico / Clinica'
        : 'Estudiante / Pre-Clinico';

  const resolvedStage = stageName || defaultStage;

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full ${className}`}
    >
      {/* Card 1: Nivel Clinico Global */}
      <div className="relative overflow-hidden p-5 rounded-xl bg-clinical-surface/80 border border-clinical-border backdrop-blur-md shadow-lg flex flex-col justify-between hover:border-white/20 hover:-translate-y-0.5 transition-all duration-300 animate-fade-in-up stagger-1 group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400">
            Nivel Clinico Global
          </span>
          <div className="w-7 h-7 rounded-lg bg-clinical-cyan/10 border border-clinical-cyan/30 flex items-center justify-center text-clinical-cyan">
            <Award className="w-4 h-4" />
          </div>
        </div>

        <div className="my-1">
          <div className="flex items-center gap-2 mb-2">
            <LevelBadge level={level} size="md" showSubtext />
          </div>
          <p className="text-xs text-gray-300 font-medium">
            {resolvedStage}
          </p>
        </div>

        <div className="mt-3 pt-3 border-t border-clinical-border flex items-center justify-between text-[11px] text-gray-400 font-mono">
          <span>MOTOR ADAPTATIVO</span>
          <span className="text-clinical-cyan">CALIBRADO OCRI</span>
        </div>
      </div>

      {/* Card 2: Puntos de Experiencia (XP) */}
      <div className="relative overflow-hidden p-5 rounded-xl bg-clinical-surface/80 border border-clinical-border backdrop-blur-md shadow-lg flex flex-col justify-between hover:border-white/20 hover:-translate-y-0.5 transition-all duration-300 animate-fade-in-up stagger-2 group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400">
            Puntos de Experiencia
          </span>
          <div className="w-7 h-7 rounded-lg bg-clinical-teal/10 border border-clinical-teal/30 flex items-center justify-center text-clinical-teal-light">
            <Zap className="w-4 h-4" />
          </div>
        </div>

        <div className="my-1">
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {xp.toLocaleString()}{' '}
            <span className="text-xs font-semibold text-clinical-teal-light font-sans">
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

        <div className="mt-3 pt-3 border-t border-clinical-border flex items-center justify-between text-[11px] text-gray-400 font-mono">
          <span>{currentTier.nextLevel}</span>
          <span className="text-gray-300">
            {xpRemaining > 0 ? `${xpRemaining} XP restantes` : 'Maximo nivel alcanzado'}
          </span>
        </div>
      </div>

      {/* Card 3: Racha de Guardia */}
      <div className="relative overflow-hidden p-5 rounded-xl bg-clinical-surface/80 border border-clinical-border backdrop-blur-md shadow-lg flex flex-col justify-between hover:border-white/20 hover:-translate-y-0.5 transition-all duration-300 animate-fade-in-up stagger-3 group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400">
            Racha de Guardia
          </span>
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Flame className="w-4 h-4" />
          </div>
        </div>

        <div className="my-1">
          <div className="text-2xl font-bold font-mono text-white tracking-tight flex items-baseline gap-2">
            <span>{streakDays}</span>
            <span className="text-xs font-medium text-gray-300 font-sans">
              {streakDays === 1 ? 'dia consecutivo' : 'dias consecutivos'}
            </span>
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-[11px] font-mono text-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>
              {streakDays > 0 ? 'Turno Activo / Sin Fallas' : 'Inicia tu guardia hoy'}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-clinical-border flex items-center justify-between text-[11px] text-gray-400 font-mono">
          <span>DISCIPLINA CLINICA</span>
          <span className="text-amber-400">
            {streakDays >= 7 ? 'HABITO HOSPITALARIO' : 'FASE DE CONSOLIDACION'}
          </span>
        </div>
      </div>

      {/* Card 4: Repasos Espaciados Pendientes */}
      <div className="relative overflow-hidden p-5 rounded-xl bg-clinical-surface/80 border border-clinical-border backdrop-blur-md shadow-lg flex flex-col justify-between hover:border-white/20 hover:-translate-y-0.5 transition-all duration-300 animate-fade-in-up stagger-4 group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400">
            Repasos Pendientes
          </span>
          <div
            className={`w-7 h-7 rounded-lg border flex items-center justify-center ${
              pendingReviewsCount > 0
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}
          >
            <RotateCw className="w-4 h-4" />
          </div>
        </div>

        <div className="my-1">
          <div className="text-2xl font-bold font-mono text-white tracking-tight flex items-baseline gap-2">
            <span>{pendingReviewsCount}</span>
            <span className="text-xs font-medium text-gray-300 font-sans">
              {pendingReviewsCount === 1 ? 'caso activo' : 'casos activos'}
            </span>
          </div>

          <div className="mt-2">
            {pendingReviewsCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-rose-500/40 bg-rose-500/10 text-[11px] font-mono text-rose-300">
                <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />
                <span>Ciclos D7 / D21 programados</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-emerald-500/40 bg-emerald-500/10 text-[11px] font-mono text-emerald-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>Al dia con el algoritmo</span>
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-clinical-border flex items-center justify-between text-[11px] text-gray-400 font-mono">
          <span>CURVA DE EBBINGHAUS</span>
          <span
            className={
              pendingReviewsCount > 0 ? 'text-rose-400' : 'text-emerald-400'
            }
          >
            {pendingReviewsCount > 0 ? 'REPASO REQUERIDO' : 'RETENCION OPTIMA'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BentoStats;
