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
      className={`rounded-xl bg-white border border-slate-200 p-5 shadow-xs flex flex-col justify-between ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shadow-xs">
            <RotateCw className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm md:text-base font-bold text-slate-900 tracking-tight">
              Repasos Espaciados Pendientes
            </h3>
            <p className="text-[11px] text-slate-500">
              Curva de retencion neural (D7 / D21)
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 font-mono text-xs text-slate-700">
          {items.length} {items.length === 1 ? 'caso' : 'casos'}
        </span>
      </div>

      {/* Main Content: List or Empty State */}
      <div className="flex-1">
        {items.length === 0 ? (
          <div className="py-10 px-4 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="max-w-sm space-y-1">
              <p className="text-sm font-semibold text-slate-800">
                Memoria Clinica Consolidada
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Sin casos pendientes de repaso activo. El algoritmo adaptativo
                programara nuevos refuerzos segun tu desempeno clinico.
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
                  ? 'Ciclo D21'
                  : 'Ciclo D7';

              return (
                <div
                  key={`${item.case_id}-${item.id || item.cycle}`}
                  className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-sky-300 hover:bg-sky-50/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    {/* Top line badges: Cycle, Speciality, and Overdue indicator */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-semibold bg-white text-slate-700 border border-slate-200">
                        {cycleLabel}
                      </span>

                      <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-sky-50 text-sky-800 border border-sky-200">
                        {item.specialty_name}
                      </span>

                      {item.is_overdue ? (
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] font-medium border border-rose-200 bg-rose-50 text-rose-800 flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
                          <span>Vencido</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] font-medium border border-sky-200 bg-sky-50 text-sky-800 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 text-sky-600" />
                          <span>Programado Hoy</span>
                        </span>
                      )}
                    </div>

                    {/* Case Title */}
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-sky-700 transition-colors truncate">
                      {item.case_title}
                    </h4>

                    {/* Target Cognitive Gap Badge */}
                    <div className="pt-0.5">
                      <CognitiveGapBadge gapTag={gapTag} size="sm" />
                    </div>
                  </div>

                  {/* CTA Action */}
                  <div className="shrink-0 pt-2 sm:pt-0">
                    <button
                      type="button"
                      onClick={() => onReview(item.case_id)}
                      className="w-full sm:w-auto px-3.5 py-1.5 rounded-md bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <span>Repasar Caso</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span>METODO EBBINGHAUS 2026</span>
        <span className="text-sky-700 font-semibold">REPETICION INTERVALAR</span>
      </div>
    </div>
  );
};

export default SpacedRepetitionQueue;
