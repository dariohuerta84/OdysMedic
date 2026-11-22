import React, { useState } from 'react';
import {
  Calendar,
  FastForward,
  TrendingDown,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertTriangle,
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
  { day: 0, label: 'Dia 0', sublabel: 'Calibracion' },
  { day: 1, label: 'Dia +1', sublabel: 'Seguimiento' },
  { day: 7, label: 'Dia +7', sublabel: 'Ciclo D7' },
  { day: 21, label: 'Dia +21', sublabel: 'Ciclo D21' },
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
  const animatedDays = Math.round(useAnimatedNumber(simulatedDays, 600));

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
      className={`border border-[#DEDBD2] bg-[#F3F1EC]/55 p-5 sm:p-6 space-y-5 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-[#DEDBD2]">
        <div className="space-y-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#0E6F65]">
            Simulador Longitudinal · Curva HLR y Ebbinghaus
          </p>
          <h3 className="font-serif text-lg sm:text-xl font-bold text-[#0D1F26]">
            Proyeccion de dias transcurridos
          </h3>
        </div>

        <div className="flex items-center gap-2.5 border border-[#DEDBD2] bg-[#FAF9F6] px-3 py-2 shrink-0">
          <Calendar className="w-4 h-4 text-[#0E6F65]" />
          <div className="telemetry-mono">
            <span className="text-sm font-semibold text-[#0D1F26] block leading-none">
              Dia +{animatedDays}
            </span>
            <span className="text-[10px] text-[#64767E]">
              {formatSimulatedDate(simulatedDateIso, simulatedDays)}
            </span>
          </div>
        </div>
      </div>

      {/* Milestone Strip */}
      <div className="grid grid-cols-4 border border-[#DEDBD2] divide-x divide-[#DEDBD2] bg-[#FAF9F6] text-center">
        {TIMELINE_MILESTONES.map((m) => {
          const reached = simulatedDays >= m.day && isDiagnosticCompleted;
          const isCurrent =
            isDiagnosticCompleted &&
            ((m.day === 0 && simulatedDays === 0) ||
              (m.day === 1 && simulatedDays >= 1 && simulatedDays < 7) ||
              (m.day === 7 && simulatedDays >= 7 && simulatedDays < 21) ||
              (m.day === 21 && simulatedDays >= 21));

          return (
            <div
              key={m.day}
              className={`py-2.5 px-1.5 transition-colors ${
                isCurrent ? 'bg-[#EAF4F2]' : reached ? 'bg-[#F3F1EC]/60' : ''
              }`}
            >
              <span
                className={`telemetry-mono text-xs font-semibold block ${
                  isCurrent ? 'text-[#0E6F65]' : reached ? 'text-[#0D1F26]' : 'text-[#64767E]'
                }`}
              >
                {m.label}
              </span>
              <span className="text-[10px] text-[#64767E] block truncate">{m.sublabel}</span>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={isApplying || !isDiagnosticCompleted}
          onClick={() => handleTrigger(1, 'active_streak')}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 border border-[#DEDBD2] bg-[#FAF9F6] hover:border-[#0E6F65] text-xs font-medium text-[#0D1F26] disabled:opacity-50 transition-colors"
        >
          <Clock className="w-3.5 h-3.5 text-[#0E6F65]" />
          <span>+1 dia (Constancia)</span>
        </button>

        <button
          type="button"
          disabled={isApplying || !isDiagnosticCompleted}
          onClick={() => handleTrigger(7, 'active_streak')}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 border border-[#0E6F65] bg-[#0E6F65] hover:bg-[#0A564E] text-xs font-medium text-[#FAF9F6] disabled:opacity-50 transition-colors"
        >
          <FastForward className="w-3.5 h-3.5" />
          <span>+7 dias (Ciclo D7)</span>
        </button>

        <button
          type="button"
          disabled={isApplying || !isDiagnosticCompleted}
          onClick={() => handleTrigger(21, 'active_streak')}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 border border-[#0D1F26] bg-[#0D1F26] hover:bg-[#19333D] text-xs font-medium text-[#FAF9F6] disabled:opacity-50 transition-colors"
        >
          <FastForward className="w-3.5 h-3.5" />
          <span>+21 dias (Ciclo D21)</span>
        </button>

        <button
          type="button"
          disabled={isApplying || !isDiagnosticCompleted}
          onClick={() => handleTrigger(14, 'inactivity_decay')}
          className="flex items-center justify-center gap-1.5 px-3 py-2.5 border border-[#A6262E]/50 bg-[#FBF0F0] hover:bg-[#F6E2E2] text-xs font-medium text-[#A6262E] disabled:opacity-50 transition-colors"
        >
          <TrendingDown className="w-3.5 h-3.5" />
          <span>14d sin practicar</span>
        </button>
      </div>

      {simulatedDays > 0 && (
        <button
          type="button"
          disabled={isApplying}
          onClick={() => handleTrigger(0, 'reset')}
          className="w-full flex items-center justify-center gap-1.5 py-2 border border-[#DEDBD2] bg-[#FAF9F6] hover:border-[#0D1F26] text-xs font-mono text-[#3D525A] transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restablecer al Dia 0</span>
        </button>
      )}

      {/* Feedback Narrative */}
      {lastEvent && (
        <div
          className={`p-3.5 border text-xs leading-relaxed flex items-start gap-2.5 animate-fade-in ${
            lastEvent.mode === 'inactivity_decay'
              ? 'bg-[#FBF0F0] border-[#A6262E]/40 text-[#7D2227]'
              : 'bg-[#FAF9F6] border-[#0E6F65]/35 text-[#0D1F26]'
          }`}
        >
          {lastEvent.mode === 'inactivity_decay' ? (
            <AlertTriangle className="w-4 h-4 text-[#A6262E] shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-[#0E6F65] shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <p>{lastEvent.narrative}</p>
            <p className="telemetry-mono text-[11px] text-[#64767E]">
              OCRI {lastEvent.previous_ocri_score}% &rarr; {lastEvent.current_ocri_score}% (
              {lastEvent.ocri_delta >= 0 ? `+${lastEvent.ocri_delta}` : lastEvent.ocri_delta}%) ·{' '}
              {lastEvent.total_overdue_reviews} vencidos
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default TimePassageSimulator;
