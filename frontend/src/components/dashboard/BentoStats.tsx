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
      <div className="relative overflow-hidden p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-sky-300 hover:shadow-md transition-all duration-300 animate-fade-in-up stagger-1 group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
            Nivel Clinico Global
          </span>
          <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shadow-xs">
            <Award className="w-4 h-4" />
          </div>
        </div>

        <div className="my-1">
          <div className="flex items-center gap-2 mb-2">
            <LevelBadge level={level} size="md" showSubtext />
          </div>
          <p className="text-xs text-slate-700 font-medium">
            {resolvedStage}
          </p>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>MOTOR ADAPTATIVO</span>
          <span className="text-sky-700 font-semibold">CALIBRADO OCRI</span>
        </div>
      </div>

      {/* Card 2: Puntos de Experiencia (XP) */}
      <div className="relative overflow-hidden p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-sky-300 hover:shadow-md transition-all duration-300 animate-fade-in-up stagger-2 group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
            Puntos de Experiencia
          </span>
          <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shadow-xs">
            <Zap className="w-4 h-4" />
          </div>
        </div>

        <div className="my-1">
          <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
            {xp.toLocaleString()}{' '}
            <span className="text-xs font-semibold text-sky-600 font-sans">
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

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>{currentTier.nextLevel}</span>
          <span className="text-slate-600 font-medium">
            {xpRemaining > 0 ? `${xpRemaining} XP restantes` : 'Maximo nivel alcanzado'}
          </span>
        </div>
      </div>

      {/* Card 3: Racha de Guardia */}
      <div className="relative overflow-hidden p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-sky-300 hover:shadow-md transition-all duration-300 animate-fade-in-up stagger-3 group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
            Racha de Guardia
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs">
            <Flame className="w-4 h-4" />
          </div>
        </div>

        <div className="my-1">
          <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight flex items-baseline gap-2">
            <span>{streakDays}</span>
            <span className="text-xs font-medium text-slate-600 font-sans">
              {streakDays === 1 ? 'dia consecutivo' : 'dias consecutivos'}
            </span>
          </div>
          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-amber-200 bg-amber-50 text-[11px] font-mono text-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>
              {streakDays > 0 ? 'Turno Activo / Sin Fallas' : 'Inicia tu guardia hoy'}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>DISCIPLINA CLINICA</span>
          <span className="text-amber-700 font-semibold">
            {streakDays >= 7 ? 'HABITO HOSPITALARIO' : 'FASE DE CONSOLIDACION'}
          </span>
        </div>
      </div>

      {/* Card 4: Repasos Espaciados Pendientes */}
      <div className="relative overflow-hidden p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-sky-300 hover:shadow-md transition-all duration-300 animate-fade-in-up stagger-4 group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
            Repasos Pendientes
          </span>
          <div
            className={`w-8 h-8 rounded-lg border flex items-center justify-center shadow-xs ${
              pendingReviewsCount > 0
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-emerald-50 border-emerald-200 text-emerald-600'
            }`}
          >
            <RotateCw className="w-4 h-4" />
          </div>
        </div>

        <div className="my-1">
          <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight flex items-baseline gap-2">
            <span>{pendingReviewsCount}</span>
            <span className="text-xs font-medium text-slate-600 font-sans">
              {pendingReviewsCount === 1 ? 'caso activo' : 'casos activos'}
            </span>
          </div>

          <div className="mt-2">
            {pendingReviewsCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-rose-200 bg-rose-50 text-[11px] font-mono text-rose-800">
                <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
                <span>Ciclos D7 / D21 programados</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-emerald-200 bg-emerald-50 text-[11px] font-mono text-emerald-800">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>Al dia con el algoritmo</span>
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>CURVA DE EBBINGHAUS</span>
          <span
            className={
              pendingReviewsCount > 0 ? 'text-rose-700 font-semibold' : 'text-emerald-700 font-semibold'
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
