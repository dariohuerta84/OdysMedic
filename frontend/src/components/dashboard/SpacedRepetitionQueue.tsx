import React from 'react';
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertTriangle,
  ClipboardCheck,
} from 'lucide-react';
import type { SpacedRepetitionItem } from '../../types/api';

export interface SpacedRepetitionQueueProps {
  items: SpacedRepetitionItem[];
  onReview: (caseId: string) => void;
  overallScore?: number | null;
  aptitudeStatus?: string | null;
  isDiagnosticCompleted?: boolean;
  onStartDiagnostic?: () => void;
  className?: string;
}

const GAP_SHORT_LABEL: Record<string, string> = {
  GAP_TRIAGE_SEVERITY: 'Triaje y gravedad',
  GAP_DIAGNOSTIC_REASONING: 'Razonamiento diagnostico',
  GAP_LAB_INTERPRETATION: 'Examenes auxiliares',
  GAP_INITIAL_MANAGEMENT: 'Manejo terapeutico',
};

export const SpacedRepetitionQueue: React.FC<SpacedRepetitionQueueProps> = ({
  items,
  onReview,
  overallScore = null,
  aptitudeStatus = null,
  isDiagnosticCompleted = true,
  onStartDiagnostic,
  className = '',
}) => {
  const isCriticalLow =
    isDiagnosticCompleted &&
    ((typeof overallScore === 'number' && overallScore < 50) || aptitudeStatus === 'no_apto');

  const sortedItems = [...items].sort((a, b) => {
    const aUrgent = a.priority === 'urgent' || a.is_overdue ? 1 : 0;
    const bUrgent = b.priority === 'urgent' || b.is_overdue ? 1 : 0;
    return bUrgent - aUrgent;
  });

  return (
    <section
      aria-label="Cola de repeticion espaciada"
      className={`border border-[#DEDBD2] bg-[#FAF9F6] p-5 sm:p-6 space-y-4 ${className}`}
    >
      <div className="flex items-baseline justify-between gap-3 pb-3 border-b border-[#DEDBD2]">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#0E6F65]">
            Ciclos D7 / D21 · Cola HLR
          </p>
          <h3 className="font-serif text-lg font-bold text-[#0D1F26] mt-0.5">
            Repasos espaciados
          </h3>
        </div>
        <span
          className={`telemetry-mono text-xs font-semibold ${
            isCriticalLow && sortedItems.length > 0
              ? 'text-[#A6262E]'
              : sortedItems.length > 0
                ? 'text-[#9A6B1F]'
                : 'text-[#0E6F65]'
          }`}
        >
          {sortedItems.length} {sortedItems.length === 1 ? 'pendiente' : 'pendientes'}
        </span>
      </div>

      {!isDiagnosticCompleted ? (
        <div className="py-4 space-y-3">
          <p className="text-xs text-[#3D525A] leading-relaxed">
            Tu cola adaptativa se generara automaticamente al completar la calibracion diagnostica.
          </p>
          {onStartDiagnostic && (
            <button
              type="button"
              onClick={onStartDiagnostic}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0E6F65] hover:bg-[#0A564E] text-[#FAF9F6] text-xs font-medium"
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Rendir calibracion</span>
            </button>
          )}
        </div>
      ) : sortedItems.length === 0 ? (
        <div className="py-4 flex items-start gap-2.5 text-xs text-[#3D525A]">
          <CheckCircle2 className="w-4 h-4 text-[#0E6F65] shrink-0 mt-0.5" />
          <span>
            Sin estaciones vencidas. Usa el Simulador de Dias para proyectar la activacion de los
            ciclos D7 y D21 o sigue avanzando en tu ruta progresiva.
          </span>
        </div>
      ) : (
        <div className="divide-y divide-[#DEDBD2]">
          {sortedItems.slice(0, 5).map((item, idx) => {
            const urgent = item.is_overdue || item.priority === 'urgent';
            return (
              <div
                key={`${item.case_id}-${item.id ?? idx}`}
                className="py-3.5 first:pt-1 last:pb-0 flex items-start justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 telemetry-mono text-[10px] uppercase tracking-wider">
                    <span className={urgent ? 'text-[#A6262E] font-semibold' : 'text-[#9A6B1F]'}>
                      {urgent ? 'Vencido · Urgente' : `En ${item.days_until_due ?? 7}d`}
                    </span>
                    <span className="text-[#DEDBD2]">|</span>
                    <span className="text-[#64767E]">{item.cycle}</span>
                  </div>
                  <p className="text-sm font-semibold text-[#0D1F26] leading-snug">
                    {item.case_title}
                  </p>
                  <p className="text-xs text-[#64767E]">
                    {item.specialty_name}
                    {item.gap_type && GAP_SHORT_LABEL[item.gap_type]
                      ? ` · ${GAP_SHORT_LABEL[item.gap_type]}`
                      : ''}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onReview(item.case_id)}
                  className={`shrink-0 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium transition-colors ${
                    urgent
                      ? 'bg-[#A6262E] hover:bg-[#8A1E25] text-[#FAF9F6]'
                      : 'border border-[#DEDBD2] hover:border-[#0E6F65] text-[#0D1F26]'
                  }`}
                >
                  {urgent ? (
                    <AlertTriangle className="w-3 h-3" />
                  ) : (
                    <Clock className="w-3 h-3 text-[#0E6F65]" />
                  )}
                  <span>Repasar</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default SpacedRepetitionQueue;
