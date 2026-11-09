import React from 'react';
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertTriangle,
  RotateCw,
} from 'lucide-react';
import type { SpacedRepetitionItem, CognitiveGapTag } from '../../types/api';
import { CognitiveGapBadge } from '../common/CognitiveGapBadge';

export interface SpacedRepetitionQueueProps {
  items: SpacedRepetitionItem[];
  onReview: (caseId: string) => void;
  className?: string;
}

const VALID_GAPS: CognitiveGapTag[] = [
  'GAP_TRIAGE_SEVERITY',
  'GAP_DIAGNOSTIC_REASONING',
  'GAP_LAB_INTERPRETATION',
  'GAP_INITIAL_MANAGEMENT',
];

export const SpacedRepetitionQueue: React.FC<SpacedRepetitionQueueProps> = ({
  items,
  onReview,
  className = '',
}) => {
  return (
    <div
      className={`rounded-3xl bg-white border border-[#DCE5E3] p-6 flex flex-col justify-between ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#EDF2F0] mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#ECF6F4] flex items-center justify-center text-[#0E6F65]">
            <RotateCw className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold text-[#0B252E]">
              Repasos espaciados de tu ruta
            </h3>
            <p className="text-xs text-[#6B7D83]">
              Consolidacion intervalar (ciclos de 7 y 21 dias)
            </p>
          </div>
        </div>

        <span className="text-xs font-medium text-[#4A5D64]">
          {items.length} {items.length === 1 ? 'pendiente' : 'pendientes'}
        </span>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {items.length === 0 ? (
          <div className="py-12 px-4 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#ECF6F4] border border-[#CFE7E2] flex items-center justify-center text-[#0E6F65]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="max-w-sm space-y-1">
              <p className="font-serif text-base font-semibold text-[#0B252E]">
                Ruta de repaso al dia
              </p>
              <p className="text-xs text-[#4A5D64] leading-relaxed">
                No tienes estaciones vencidas por repasar en este momento. Conforme avances en tus
                mundos clinicos, programaremos recordatorios oportunos.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {items.map((item) => {
              const gapTag: CognitiveGapTag = VALID_GAPS.includes(
                item.gap_type as CognitiveGapTag
              )
                ? (item.gap_type as CognitiveGapTag)
                : 'GAP_DIAGNOSTIC_REASONING';

              const cycleLabel =
                item.cycle === 'D21' || item.repetition_cycle === 'D21'
                  ? 'Ciclo 21 dias'
                  : 'Ciclo 7 dias';

              return (
                <div
                  key={`${item.case_id}-${item.id || item.cycle}`}
                  className="p-4 rounded-2xl bg-[#FDFCFA] border border-[#E2ECE9] hover:border-[#A9CEC7] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#6B7D83]">
                      <span className="uppercase tracking-[0.13em] font-semibold text-[#0E6F65]">
                        {item.specialty_name}
                      </span>
                      <span>·</span>
                      <span>{cycleLabel}</span>
                      <span>·</span>
                      {item.is_overdue ? (
                        <span className="text-[#9E3F42] font-medium inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Prioritario</span>
                        </span>
                      ) : (
                        <span className="text-[#4A5D64] inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#0E6F65]" />
                          <span>Programado hoy</span>
                        </span>
                      )}
                    </div>

                    <h4 className="font-serif text-sm sm:text-base font-semibold text-[#0B252E] truncate">
                      {item.case_title}
                    </h4>

                    <div className="pt-0.5">
                      <CognitiveGapBadge gapTag={gapTag} size="sm" />
                    </div>
                  </div>

                  <div className="shrink-0 pt-2 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => onReview(item.case_id)}
                      className="w-full sm:w-auto px-4 py-2 rounded-full bg-[#0E6F65] hover:bg-[#0A564E] text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>Practicar</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer note */}
      <div className="mt-4 pt-3 border-t border-[#EDF2F0] flex items-center justify-between text-xs text-[#6B7D83]">
        <span>Consolidacion espaciada</span>
        <span className="text-[#0E6F65] font-medium">Aprendizaje sostenible</span>
      </div>
    </div>
  );
};

export default SpacedRepetitionQueue;
