import React from 'react';
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertTriangle,
  RotateCw,
  ClipboardCheck,
  ShieldAlert,
} from 'lucide-react';
import type { SpacedRepetitionItem, CognitiveGapTag } from '../../types/api';
import { CognitiveGapBadge } from '../common/CognitiveGapBadge';

export interface SpacedRepetitionQueueProps {
  items: SpacedRepetitionItem[];
  onReview: (caseId: string) => void;
  overallScore?: number | null;
  aptitudeStatus?: string | null;
  isDiagnosticCompleted?: boolean;
  onStartDiagnostic?: () => void;
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
  overallScore = null,
  aptitudeStatus = null,
  isDiagnosticCompleted = true,
  onStartDiagnostic,
  className = '',
}) => {
  const isCriticalLow =
    isDiagnosticCompleted &&
    ((typeof overallScore === 'number' && overallScore < 50) ||
      aptitudeStatus === 'no_apto');

  const isLeveling =
    isDiagnosticCompleted &&
    !isCriticalLow &&
    ((typeof overallScore === 'number' && overallScore < 75) ||
      aptitudeStatus === 'en_nivelacion');

  // Sort items dynamically: urgent / overdue first, then D7 before D21
  const sortedItems = [...items].sort((a, b) => {
    const aUrgent = a.priority === 'urgent' || a.is_overdue ? 1 : 0;
    const bUrgent = b.priority === 'urgent' || b.is_overdue ? 1 : 0;
    if (aUrgent !== bUrgent) return bUrgent - aUrgent;
    return 0;
  });

  const urgentCount = sortedItems.filter(
    (i) => i.priority === 'urgent' || i.is_overdue
  ).length;

  return (
    <div
      className={`rounded-3xl bg-white border p-6 flex flex-col justify-between transition-colors duration-300 ${
        isCriticalLow
          ? 'border-[#E8C5C6]'
          : isLeveling
            ? 'border-[#EAD8B1]'
            : 'border-[#DCE5E3]'
      } ${className}`}
    >
      {/* Header */}
      <div className="space-y-3 pb-4 border-b border-[#EDF2F0] mb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                isCriticalLow
                  ? 'bg-[#FDECEC] text-[#B6222A]'
                  : isLeveling
                    ? 'bg-[#FDF7E7] text-[#9A6B1F]'
                    : 'bg-[#ECF6F4] text-[#0E6F65]'
              }`}
            >
              {isCriticalLow ? (
                <ShieldAlert className="w-4 h-4" />
              ) : (
                <RotateCw className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#0B252E]">
                Repasos espaciados de tu ruta
              </h3>
              <p className="text-xs text-[#6B7D83]">
                {isCriticalLow
                  ? 'Frecuencia intensiva adaptada a tus brechas iniciales'
                  : isLeveling
                    ? 'Consolidacion focalizada sobre estaciones por reforzar'
                    : 'Consolidacion intervalar adaptativa (ciclos D7 y D21)'}
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${
              isCriticalLow && sortedItems.length > 0
                ? 'bg-[#FDECEC] text-[#B6222A] border border-[#E8BDBD]'
                : sortedItems.length > 0
                  ? 'bg-[#FDF7E7] text-[#8A6116] border border-[#EFE0B9]'
                  : 'bg-[#F2F7F6] text-[#4A5D64]'
            }`}
          >
            {sortedItems.length}{' '}
            {sortedItems.length === 1 ? 'pendiente' : 'pendientes'}
          </span>
        </div>

        {/* Adaptive Context Banner Driven by Student Performance */}
        {isDiagnosticCompleted && isCriticalLow && (
          <div className="p-3.5 rounded-2xl bg-[#FBF1F1] border border-[#EED7D7] flex items-start gap-2.5 text-xs text-[#7D282C] animate-fade-in">
            <AlertTriangle className="w-4 h-4 text-[#B6222A] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="font-semibold">Plan de rescate activado:</strong>{' '}
              Al registrar un rendimiento de{' '}
              <span className="font-semibold">{Math.round(overallScore ?? 0)}%</span>,
              tu cola prioriza hoy las {urgentCount || sortedItems.length} estaciones
              criticas donde detectamos brechas. Al acertarlas en el simulador se
              acreditaran automaticamente.
            </p>
          </div>
        )}

        {isDiagnosticCompleted && isLeveling && sortedItems.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-[#FDF7E7] border border-[#EFE0B9] flex items-start gap-2.5 text-xs text-[#6E4D12] animate-fade-in">
            <Clock className="w-4 h-4 text-[#9A6B1F] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="font-semibold">Nivelacion focalizada:</strong>{' '}
              Adaptamos tus repasos hacia las especialidades con menor puntaje para
              elevar tu equilibrio clinico por encima del 75%.
            </p>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {!isDiagnosticCompleted ? (
          <div className="py-10 px-4 text-center flex flex-col items-center justify-center space-y-3.5">
            <div className="w-12 h-12 rounded-full bg-[#FDF7E7] border border-[#EFE0B9] flex items-center justify-center text-[#8A6116]">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div className="max-w-sm space-y-1.5">
              <p className="font-serif text-base font-semibold text-[#0B252E]">
                Cola adaptativa lista para calibrarse
              </p>
              <p className="text-xs text-[#4A5D64] leading-relaxed">
                En cuanto rindas tu evaluacion diagnostica inicial, programaremos
                automaticamente estaciones de refuerzo segun los criterios acertados o
                fallados.
              </p>
            </div>
            {onStartDiagnostic && (
              <button
                type="button"
                onClick={onStartDiagnostic}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#ECF6F4] hover:bg-[#DFEFEA] text-[#0E6F65] text-xs font-semibold transition-colors"
              >
                <span>Calibrar mi ruta ahora</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : sortedItems.length === 0 ? (
          <div className="py-12 px-4 text-center flex flex-col items-center justify-center space-y-3 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-[#ECF6F4] border border-[#CFE7E2] flex items-center justify-center text-[#0E6F65]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="max-w-sm space-y-1">
              <p className="font-serif text-base font-semibold text-[#0B252E]">
                Ruta de repaso al dia
              </p>
              <p className="text-xs text-[#4A5D64] leading-relaxed">
                Has consolidado las estaciones pendientes de tu ruta. Si tropiezas en
                un nuevo escenario del simulador, se agendara aqui automaticamente en
                ciclo D7 o D21.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {sortedItems.map((item, idx) => {
              const gapTag: CognitiveGapTag = VALID_GAPS.includes(
                item.gap_type as CognitiveGapTag
              )
                ? (item.gap_type as CognitiveGapTag)
                : 'GAP_DIAGNOSTIC_REASONING';

              const isUrgentItem =
                item.priority === 'urgent' || item.is_overdue || isCriticalLow;

              const cycleLabel =
                item.cycle === 'D21' || item.repetition_cycle === 'D21'
                  ? 'Ciclo 21 dias'
                  : isUrgentItem
                    ? 'Refuerzo inmediato'
                    : 'Ciclo 7 dias';

              return (
                <div
                  key={`${item.case_id}-${item.id || idx}`}
                  style={{ animationDelay: `${Math.min(idx * 55, 250)}ms` }}
                  className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group animate-fade-in-up ${
                    isUrgentItem
                      ? 'bg-[#FFF9F9] border-[#EBCACA] hover:border-[#C6383E]/60'
                      : 'bg-[#FDFCFA] border-[#E2ECE9] hover:border-[#A9CEC7]'
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#6B7D83]">
                      <span
                        className={`uppercase tracking-[0.13em] font-semibold ${
                          isUrgentItem ? 'text-[#B6222A]' : 'text-[#0E6F65]'
                        }`}
                      >
                        {item.specialty_name}
                      </span>
                      <span>·</span>
                      <span>{cycleLabel}</span>
                      <span>·</span>
                      {isUrgentItem ? (
                        <span className="text-[#B6222A] font-semibold inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Prioritario hoy</span>
                        </span>
                      ) : (
                        <span className="text-[#4A5D64] inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#0E6F65]" />
                          <span>
                            {item.days_until_due && item.days_until_due > 0
                              ? `Programado en ${item.days_until_due} ${item.days_until_due === 1 ? 'dia' : 'dias'}`
                              : 'Programado en ruta'}
                          </span>
                        </span>
                      )}
                    </div>

                    <h4 className="font-serif text-sm sm:text-base font-semibold text-[#0B252E] leading-snug line-clamp-1">
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
                      className={`w-full sm:w-auto px-4 py-2.5 rounded-full text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-all duration-200 ${
                        isUrgentItem
                          ? 'bg-[#B6222A] hover:bg-[#931B22]'
                          : 'bg-[#0E6F65] hover:bg-[#0A564E]'
                      }`}
                    >
                      <span>{isUrgentItem ? 'Reforzar ahora' : 'Practicar'}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
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
        <span>Adaptacion continua por desempeno</span>
        <span
          className={`font-medium ${
            isCriticalLow
              ? 'text-[#B6222A]'
              : isLeveling
                ? 'text-[#9A6B1F]'
                : 'text-[#0E6F65]'
          }`}
        >
          {isCriticalLow
            ? 'Prioridad: cerrar brechas criticas'
            : isLeveling
              ? 'En progreso de nivelacion'
              : 'Memoria clinica sostenible'}
        </span>
      </div>
    </div>
  );
};

export default SpacedRepetitionQueue;
