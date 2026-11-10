import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle,
  Lightbulb,
  BookOpen,
  ExternalLink,
  FileCheck2,
  FileText,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Brain,
  X,
} from 'lucide-react';
import type { CognitiveGapTag, MCQEvaluationResult } from '../../types/api';
import { CognitiveGapBadge } from '../common/CognitiveGapBadge';
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber';

export interface ClinicalPearlModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: MCQEvaluationResult;
  stationNumber: number;
  totalStations: number;
  onNextStation: () => void;
  onFinishCase: () => void;
}

const GAP_FALLBACK_EXPLANATIONS: Record<string, string> = {
  GAP_TRIAGE_SEVERITY:
    'Se subestimo la severidad clinica inmediata del paciente o los signos tempranos de inestabilidad hemodinamica, retardando la intervencion hospitalaria prioritaria.',
  GAP_DIAGNOSTIC_REASONING:
    'Oportunidad de mejora en la jerarquizacion de diagnosticos diferenciales y su correlacion sindromica con los hallazgos semiologicos iniciales.',
  GAP_LAB_INTERPRETATION:
    'Interpretacion parcial de parametros criticos de laboratorio, equilibrio hidroelectrolitico o biomarcadores de disfuncion organica.',
  GAP_INITIAL_MANAGEMENT:
    'La pauta terapeutica o de estabilizacion inicial difiere de las recomendaciones de primera linea de las guias clinicas vigentes.',
};

function resolveCitationUrl(refId?: string, title?: string): string {
  if (!refId && !title) return 'https://pubmed.ncbi.nlm.nih.gov/';
  if (!refId) {
    return `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(title || '')}`;
  }
  const clean = refId.trim();
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }
  if (clean.toLowerCase().startsWith('doi:') || clean.startsWith('10.')) {
    const doi = clean.replace(/^doi:\s*/i, '');
    return `https://doi.org/${doi}`;
  }
  const pmidMatch = clean.match(/PMID:?\s*(\d+)/i) || clean.match(/^(\d+)$/);
  if (pmidMatch) {
    return `https://pubmed.ncbi.nlm.nih.gov/${pmidMatch[1]}/`;
  }
  return `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(clean)}`;
}

export const ClinicalPearlModal: React.FC<ClinicalPearlModalProps> = ({
  isOpen,
  onClose,
  result,
  stationNumber,
  totalStations,
  onNextStation,
  onFinishCase,
}) => {
  const isCorrect = result.is_correct;
  const xpEarned =
    result.xp_earned ??
    result.points_earned ??
    (isCorrect ? 25 : 5);
  const animatedXp = Math.round(useAnimatedNumber(isOpen ? xpEarned : 0, 700, 0));

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') {
    return null;
  }

  const identifiedGap = (result.gap_tag || result.associated_gap || null) as CognitiveGapTag | null;

  const gapExplanation =
    result.gap_explanation ||
    result.clinical_feedback ||
    (identifiedGap ? GAP_FALLBACK_EXPLANATIONS[identifiedGap] : null) ||
    'Analisis formativo del patron de razonamiento clinico.';

  const clinicalPearl =
    result.clinical_pearl ||
    'La valoracion sistematica de las constantes fisiologicas y los criterios de gravedad reduce de manera determinante el tiempo hasta la intervencion terapeutica definitiva.';

  const medRef = result.medical_reference || {
    title: result.citation_evidence || 'Guia de Practica Clinica Basada en Evidencia',
    year: 2024,
    guideline_source: 'Consenso Clinico Internacional',
    pmid_doi: '',
    key_takeaway: 'Correlacion clinico-terapeutica respaldada por guias internacionales.',
  };

  const citationUrl = resolveCitationUrl(medRef.pmid_doi, medRef.title);

  const prescription = result.leveling_prescription || {
    new_level: 'Nivel 1',
    mastery_delta: isCorrect ? 5 : -2,
    spaced_repetition_scheduled: !isCorrect,
    next_review_interval: !isCorrect ? 'D7' : null,
  };

  const isFinalStation = stationNumber >= totalStations;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pearl-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-[#0B252E]/55 backdrop-blur-[2px] animate-fade-in"
    >
      <div
        className={`relative w-full max-w-2xl max-h-[86dvh] flex flex-col overflow-hidden rounded-3xl bg-[#FDFCFA] border shadow-2xl text-left ${
          isCorrect
            ? 'border-[#BFE0D9] animate-correct-pop'
            : 'border-[#E8C5C6] animate-clinical-shake'
        }`}
      >
        {/* 1. Pinned Status Header with Distinct Acierto / Error Animations */}
        <header
          className={`relative overflow-hidden shrink-0 px-5 py-4 sm:px-6 sm:py-5 border-b ${
            isCorrect
              ? 'bg-gradient-to-r from-[#E6F5F1] via-[#ECF6F4] to-[#F4FAF8] border-[#CFE7E2]'
              : 'bg-gradient-to-r from-[#FDECEC] via-[#FBF1F1] to-[#FDF6F6] border-[#EED7D7]'
          }`}
        >
          {/* Subtle Classic Celebratory Rising Particles on Correct Outcome */}
          {isCorrect && (
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
              <span
                className="absolute left-12 top-8 w-2 h-2 rounded-full bg-[#0E6F65]/40 animate-float-spark"
                style={{ animationDelay: '60ms' }}
              />
              <span
                className="absolute left-24 top-10 w-1.5 h-1.5 rounded-full bg-[#C9A96E]/65 animate-float-spark"
                style={{ animationDelay: '180ms' }}
              />
              <span
                className="absolute right-28 top-9 w-2 h-2 rounded-full bg-[#0E6F65]/35 animate-float-spark"
                style={{ animationDelay: '120ms' }}
              />
              <span
                className="absolute right-16 top-11 w-1.5 h-1.5 rounded-full bg-[#C9A96E]/60 animate-float-spark"
                style={{ animationDelay: '260ms' }}
              />
            </div>
          )}

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5 min-w-0">
              {/* Animated Outcome Medallion */}
              <div className="relative shrink-0 mt-0.5">
                <span
                  aria-hidden="true"
                  className={`absolute inset-0 rounded-full animate-ring-expand pointer-events-none ${
                    isCorrect ? 'bg-[#0E6F65]/35' : 'bg-[#C6383E]/35'
                  }`}
                />
                <div
                  className={`relative w-11 h-11 rounded-full flex items-center justify-center ${
                    isCorrect
                      ? 'bg-white text-[#0E6F65] border-2 border-[#0E6F65]/40 shadow-2xs'
                      : 'bg-white text-[#B6222A] border-2 border-[#C6383E]/40 shadow-2xs'
                  }`}
                >
                  {isCorrect ? (
                    <svg
                      className="w-5 h-5 text-[#0E6F65]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 13l4 4L19 7" className="animate-check-draw" />
                    </svg>
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                </div>
              </div>

              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[11px] font-sans font-semibold uppercase tracking-[0.14em] ${
                      isCorrect ? 'text-[#0E6F65]' : 'text-[#B6222A]'
                    }`}
                  >
                    Estacion {stationNumber} de {totalStations}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                      isCorrect
                        ? 'bg-white/90 border-[#BFE0D9] text-[#0E6F65]'
                        : 'bg-white/90 border-[#EBCACA] text-[#B6222A]'
                    }`}
                  >
                    +{animatedXp} XP
                  </span>
                </div>

                <h2
                  id="pearl-modal-title"
                  className="font-serif text-lg sm:text-xl font-semibold text-[#0B252E] leading-snug"
                >
                  {isCorrect
                    ? 'Decision clinica acertada'
                    : 'Brecha detectada · Oportunidad de refuerzo'}
                </h2>

                <p className="text-xs sm:text-sm text-[#4A5D64] leading-relaxed font-sans">
                  {isCorrect
                    ? 'Conducta alineada con las recomendaciones de practica clinica y la correlacion fisiopatologica.'
                    : 'Revisemos con calma el razonamiento fisiopatologico para consolidar esta estacion en tu ruta.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar retroalimentacion"
              className="shrink-0 p-2 rounded-full bg-white/85 hover:bg-white text-[#4A5D64] hover:text-[#0B252E] border border-[#DCE5E3] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {!isCorrect && identifiedGap && (
            <div className="mt-3 pt-3 border-t border-[#EED7D7]/80 flex flex-wrap items-center gap-2 animate-fade-in-up stagger-1">
              <span className="text-[11px] font-sans font-semibold text-[#8E3B3E]">
                Area detectada para nivelacion:
              </span>
              <CognitiveGapBadge
                gapTag={identifiedGap}
                size="sm"
                showDescription={false}
              />
            </div>
          )}
        </header>

        {/* 2. Scrollable Middle Body with Staggered Editorial Reveal */}
        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5 space-y-4">
          {/* Cognitive Reasoning Analysis */}
          <section
            aria-label="Analisis del razonamiento clinico"
            className="p-4 rounded-2xl bg-white border border-[#E7EEEC] space-y-1.5 animate-fade-in-up stagger-1"
          >
            <div
              className={`flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] font-semibold ${
                isCorrect ? 'text-[#0E6F65]' : 'text-[#B6222A]'
              }`}
            >
              <Brain className="w-4 h-4 shrink-0" />
              <span>
                {isCorrect
                  ? 'Fundamento de la conducta elegida'
                  : 'Analisis de la brecha clinica'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#344850] leading-relaxed">
              {gapExplanation}
            </p>
          </section>

          {/* Actionable Clinical Pearl */}
          <section
            aria-label="Perla clinica"
            className="p-4 rounded-2xl bg-[#F2F7F6] border border-[#DCE5E3] space-y-1.5 animate-fade-in-up stagger-2"
          >
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] font-semibold text-[#0E6F65]">
              <Lightbulb className="w-4 h-4 shrink-0" />
              <span>Perla clinica clave</span>
            </div>
            <p className="text-xs sm:text-sm text-[#0B252E] leading-relaxed">
              {clinicalPearl}
            </p>
          </section>

          {/* Evidence Citation */}
          <section
            aria-label="Referencia bibliografica"
            className="p-4 rounded-2xl bg-white border border-[#E7EEEC] space-y-2 animate-fade-in-up stagger-3"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] font-semibold text-[#4A5D64]">
                <BookOpen className="w-4 h-4 text-[#0E6F65] shrink-0" />
                <span>Fuente bibliografica de respaldo</span>
              </div>

              {medRef.guideline_source && (
                <span className="text-xs font-medium text-[#0E6F65]">
                  {medRef.guideline_source}
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <p className="font-serif font-medium text-sm text-[#0B252E]">
                {medRef.title} ({medRef.year})
              </p>
              {citationUrl && (
                <a
                  href={citationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#0E6F65] hover:underline shrink-0"
                >
                  <span>{medRef.pmid_doi || 'Consultar en PubMed'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {medRef.key_takeaway && (
              <p className="text-xs text-[#4A5D64] italic border-l-2 border-[#CFE7E2] pl-3 leading-relaxed">
                &ldquo;{medRef.key_takeaway}&rdquo;
              </p>
            )}
          </section>

          {/* Adaptive Route Update */}
          <section
            aria-label="Actualizacion de ruta clinica"
            className={`px-4 py-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-fade-in-up stagger-4 ${
              isCorrect
                ? 'bg-[#ECF6F4]/75 border-[#CFE7E2]'
                : 'bg-[#FDF7E7]/80 border-[#EFE0B9]'
            }`}
          >
            <div className="flex items-center gap-2.5 text-[#0B252E]">
              <FileCheck2
                className={`w-4 h-4 shrink-0 ${
                  isCorrect ? 'text-[#0E6F65]' : 'text-[#8A6116]'
                }`}
              />
              <div>
                <span className="text-[#6B7D83] block text-[11px]">
                  Adaptacion automatica de tu ruta
                </span>
                <span className="font-medium">
                  {prescription.spaced_repetition_scheduled
                    ? `Estacion agendada en Repasos Espaciados (${prescription.next_review_interval || 'D7'})`
                    : 'Dominio acreditado · Repaso pendiente marcado como superado'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-5 sm:justify-end">
              <div>
                <span className="text-[#6B7D83] block text-[11px]">Nivel</span>
                <span className="font-semibold text-[#0B252E]">
                  {prescription.new_level || 'Nivel 1'}
                </span>
              </div>

              <div>
                <span className="text-[#6B7D83] block text-[11px]">Impacto</span>
                <span
                  className={`font-semibold inline-flex items-center gap-1 ${
                    prescription.mastery_delta >= 0
                      ? 'text-[#0E6F65]'
                      : 'text-[#B6222A]'
                  }`}
                >
                  {prescription.mastery_delta >= 0 ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  {prescription.mastery_delta >= 0
                    ? `+${prescription.mastery_delta}`
                    : prescription.mastery_delta}{' '}
                  pts
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* 3. Pinned Sticky Footer (Never clipped or hidden off-screen) */}
        <footer className="shrink-0 px-5 py-3.5 sm:px-6 sm:py-4 border-t border-[#E7EEEC] bg-white flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-white border border-[#DCE5E3] hover:bg-[#F2F7F6] text-[#4A5D64] hover:text-[#0B252E] text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>Revisar alternativas en caso</span>
          </button>

          <button
            type="button"
            onClick={isFinalStation ? onFinishCase : onNextStation}
            className="group w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#0E6F65] hover:bg-[#0A564E] text-white text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 shadow-sm"
          >
            <span>
              {isFinalStation
                ? 'Finalizar caso y actualizar mi ruta'
                : 'Siguiente estacion clinica'}
            </span>
            <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </footer>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ClinicalPearlModal;
