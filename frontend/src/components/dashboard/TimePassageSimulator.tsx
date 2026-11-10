import React, { useState } from 'react';
import {
  Calendar,
  FastForward,
  TrendingDown,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import type { SimulateDaysMode, SimulateDaysResponse } from '../../types/api';
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber';

export interface TimePassageSimulatorProps {
  simulatedDays: number;
  simulatedDateIso?: string;
  isDiagnosticCompleted: boolean;
  onSimulateDays: (
    days: number,
    mode: SimulateDaysMode
  ) => Promise<SimulateDaysResponse | null>;
  className?: string;
}

const TIMELINE_MILESTONES = [
  { day: 0, label: 'Dia 0', sublabel: 'Calibracion basal' },
  { day: 1, label: 'Dia +1', sublabel: 'Seguimiento' },
  { day: 7, label: 'Dia +7', sublabel: '1er Ciclo (D7)' },
  { day: 21, label: 'Dia +21', sublabel: 'Consolidacion (D21)' },
];

function formatSimulatedDate(iso?: string, offsetDays: number = 0): string {
  try {
    const base = iso ? new Date(iso) : new Date(Date.now() + offsetDays * 86400000);
    return base.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'Calendario activo';
  }
}

export const TimePassageSimulator: React.FC<TimePassageSimulatorProps> = ({
  simulatedDays,
  simulatedDateIso,
  isDiagnosticCompleted,
  onSimulateDays,
  className = '',
}) => {
  const [isApplying, setIsApplying] = useState(false);
  const [lastEvent, setLastEvent] = useState<SimulateDaysResponse | null>(null);

  const animatedDays = Math.round(useAnimatedNumber(simulatedDays, 650));

  const handleTrigger = async (days: number, mode: SimulateDaysMode) => {
    if (isApplying || !isDiagnosticCompleted) return;
    setIsApplying(true);
    try {
      const result = await onSimulateDays(days, mode);
      if (result) {
        setLastEvent(result);
      }
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <section
      aria-label="Simulador longitudinal de paso de dias"
      className={`rounded-3xl bg-white border border-[#DCE5E3] p-6 sm:p-7 space-y-5 animate-fade-in-up ${className}`}
    >
      {/* Top Header & Live Simulated Clock */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#EDF2F0]">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] uppercase tracking-[0.16em] font-semibold text-[#0E6F65]">
              Simulador longitudinal · Modo exposicion
            </span>
            <span className="text-xs text-[#6B7D83]">·</span>
            <span className="text-xs text-[#4A5D64]">
              Demostracion en tiempo real sin esperar dias calendario
            </span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#0B252E]">
            Proyeccion de dias transcurridos, ciclos D7/D21 y curva de retencion
          </h2>
        </div>

        <div className="flex items-center gap-3 self-start lg:self-auto px-4 py-2.5 rounded-2xl bg-[#F7FAF9] border border-[#D5E5E1] shrink-0">
          <div className="w-9 h-9 rounded-xl bg-white border border-[#DCE5E3] flex items-center justify-center text-[#0E6F65]">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-[0.12em] text-[#6B7D83] block">
              Calendario simulado
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-lg font-bold text-[#0B252E]">
                Dia +{animatedDays}
              </span>
              <span className="text-xs text-[#4A5D64]">
                ({formatSimulatedDate(simulatedDateIso, simulatedDays)})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Progression Bar (Day 0 -> Day +1 -> Day +7 -> Day +21) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {TIMELINE_MILESTONES.map((m) => {
          const reached = simulatedDays >= m.day && isDiagnosticCompleted;
          const isCurrentStage =
            isDiagnosticCompleted &&
            ((m.day === 0 && simulatedDays === 0) ||
              (m.day === 1 && simulatedDays >= 1 && simulatedDays < 7) ||
              (m.day === 7 && simulatedDays >= 7 && simulatedDays < 21) ||
              (m.day === 21 && simulatedDays >= 21));

          return (
            <div
              key={m.day}
              className={`p-3.5 rounded-2xl border transition-all duration-300 flex items-center gap-3 ${
                isCurrentStage
                  ? 'bg-[#ECF6F4] border-[#0E6F65]/50 shadow-2xs'
                  : reached
                    ? 'bg-[#F7FAF9] border-[#CFE7E2]'
                    : 'bg-[#FDFCFA] border-[#EDF2F0]'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${
                  isCurrentStage
                    ? 'bg-[#0E6F65] text-white'
                    : reached
                      ? 'bg-[#D5EBE6] text-[#0E6F65]'
                      : 'bg-[#F2F7F6] text-[#6B7D83]'
                }`}
              >
                {reached ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
              </div>
              <div className="min-w-0">
                <span className="font-serif text-sm font-semibold text-[#0B252E] block leading-tight">
                  {m.label}
                </span>
                <span className="text-[11px] text-[#6B7D83] block truncate">
                  {m.sublabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Time-Jump Controls */}
      {!isDiagnosticCompleted ? (
        <div className="p-4 rounded-2xl bg-[#FDF7E7]/70 border border-[#EFE0B9] text-xs text-[#6E4D12]">
          Completa primero la evaluacion diagnostica inicial para habilitar la simulacion de dias
          transcurridos sobre tu ruta y tus ciclos de repaso espaciado.
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={isApplying}
              onClick={() => handleTrigger(1, 'active_streak')}
              className="px-4 py-2.5 rounded-full bg-[#F2F7F6] hover:bg-[#E3F0ED] border border-[#CFE2DE] text-[#0B252E] text-xs font-medium inline-flex items-center gap-1.5 transition-all duration-200 disabled:opacity-60"
            >
              <Flame className="w-3.5 h-3.5 text-[#0E6F65]" />
              <span>+1 dia (Constancia)</span>
            </button>

            <button
              type="button"
              disabled={isApplying}
              onClick={() => handleTrigger(7, 'active_streak')}
              className="px-4 py-2.5 rounded-full bg-[#ECF6F4] hover:bg-[#DCEEE9] border border-[#B9DDD5] text-[#0E6F65] text-xs font-semibold inline-flex items-center gap-1.5 transition-all duration-200 disabled:opacity-60"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>+7 dias (Activar Ciclo D7)</span>
            </button>

            <button
              type="button"
              disabled={isApplying}
              onClick={() => handleTrigger(21, 'active_streak')}
              className="px-4 py-2.5 rounded-full bg-[#0E6F65] hover:bg-[#0A564E] text-white text-xs font-medium inline-flex items-center gap-1.5 transition-all duration-200 shadow-2xs disabled:opacity-60"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>+21 dias (Activar Ciclo D21)</span>
            </button>

            <button
              type="button"
              disabled={isApplying}
              onClick={() => handleTrigger(14, 'inactivity_decay')}
              className="px-4 py-2.5 rounded-full bg-[#FFF9F9] hover:bg-[#FDECEC] border border-[#E8C5C6] text-[#B6222A] text-xs font-semibold inline-flex items-center gap-1.5 transition-all duration-200 disabled:opacity-60"
              title="Simula 14 dias sin repasar para evidenciar la curva del olvido de Ebbinghaus y el cambio a rojo del rombo"
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>14 dias sin practicar (Curva de olvido)</span>
            </button>
          </div>

          {simulatedDays > 0 && (
            <button
              type="button"
              disabled={isApplying}
              onClick={() => handleTrigger(0, 'reset')}
              className="px-4 py-2 rounded-full bg-white hover:bg-[#F2F7F6] border border-[#DCE5E3] text-[#4A5D64] hover:text-[#0B252E] text-xs font-medium inline-flex items-center gap-1.5 transition-colors disabled:opacity-60"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer al Dia 0</span>
            </button>
          )}
        </div>
      )}

      {/* Animated Outcome Log Banner */}
      {lastEvent && isDiagnosticCompleted && (
        <div
          key={`${lastEvent.simulated_days_elapsed}-${lastEvent.mode}-${lastEvent.current_ocri_score}`}
          className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-fade-in-up ${
            lastEvent.mode === 'inactivity_decay'
              ? 'bg-[#FBF1F1] border-[#EED7D7] text-[#7D282C]'
              : lastEvent.mode === 'reset'
                ? 'bg-[#F7FAF9] border-[#DCE5E3] text-[#344850]'
                : 'bg-[#ECF6F4]/85 border-[#CFE7E2] text-[#0D4A44]'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {lastEvent.mode === 'inactivity_decay' ? (
              <AlertTriangle className="w-4 h-4 text-[#B6222A] shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#0E6F65] shrink-0 mt-0.5" />
            )}
            <p className="leading-relaxed">{lastEvent.narrative}</p>
          </div>

          <div className="flex items-center gap-3 shrink-0 font-semibold">
            <span>
              Racha: {lastEvent.current_streak_days}d
            </span>
            <span>·</span>
            <span
              className={
                lastEvent.ocri_delta < 0
                  ? 'text-[#B6222A]'
                  : lastEvent.ocri_delta > 0
                    ? 'text-[#0E6F65]'
                    : 'text-[#4A5D64]'
              }
            >
              Indice global: {Math.round(lastEvent.current_ocri_score)}% (
              {lastEvent.ocri_delta >= 0 ? `+${lastEvent.ocri_delta}` : lastEvent.ocri_delta}%)
            </span>
          </div>
        </div>
      )}
    </section>
  );
};

export default TimePassageSimulator;
