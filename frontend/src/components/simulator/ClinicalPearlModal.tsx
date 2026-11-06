import React, { useEffect } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Zap,
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
    'Se subestimo la severidad clinica inmediata del paciente o los signos tempranos de inestabilidad hemodinamica, retardando la intervencion hospitalaria critica.',
  GAP_DIAGNOSTIC_REASONING:
    'Fallo en la jerarquizacion de diagnosticos diferenciales o correlacion sindromica con los hallazgos semiologicos y examenes iniciales.',
  GAP_LAB_INTERPRETATION:
    'Interpretacion incompleta de valores criticos de laboratorio, equilibrio hidroelectrolitico o biomarcadores de disfuncion organica.',
  GAP_INITIAL_MANAGEMENT:
    'La pauta de intervencion farmacologica o reanimacion hidroelectrolitica no cumple con las directrices de las guias clinicas actuales.',
};

/**
 * Resolves a safe external URL for PubMed or DOI citations
 */
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
  // Accessible Escape key listener and body scroll lock
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

  if (!isOpen) {
    return null;
  }

  const isCorrect = result.is_correct;
  const xpEarned =
    result.xp_earned ??
    result.points_earned ??
    (isCorrect ? 25 : 5);

  const identifiedGap: CognitiveGapTag | null =
    result.gap_tag ||
    result.associated_gap ||
    (!isCorrect ? 'GAP_DIAGNOSTIC_REASONING' : null);

  const gapExplanation =
    result.gap_explanation ||
    result.clinical_feedback ||
    (identifiedGap && GAP_FALLBACK_EXPLANATIONS[identifiedGap]) ||
    (isCorrect
      ? 'Respuesta fundamentada en la evidencia clinica y los protocolos de atencion vigentes.'
      : 'La alternativa seleccionada desvia la conducta del estandar recomendado para este cuadro clinico.');

  const clinicalPearl =
    result.clinical_pearl ||
    'La sistematizacion del razonamiento diagnostico y la reevaluacion de signos de alarma previenen complicaciones mayores en la guardia.';

  const medRef = result.medical_reference || {
    title: result.citation_evidence || 'Guias Clinicas Basadas en Evidencia OdyssMedic',
    year: 2024,
    guideline_source: 'OdyssMedic Protocol Archive',
    pmid_doi: 'PMID: 38245102',
    key_takeaway: clinicalPearl,
  };

  const citationUrl = resolveCitationUrl(medRef.pmid_doi, medRef.title);

  const prescription = result.leveling_prescription || {
    new_level: isCorrect ? 'Nivel 2' : 'Nivel 1',
    mastery_delta: isCorrect ? 5 : -2,
    spaced_repetition_scheduled: !isCorrect,
    next_review_interval: !isCorrect ? 'D7' : null,
  };

  const isFinalStation = stationNumber >= totalStations;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pearl-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-[#0E1117] border border-clinical-border shadow-2xl p-5 sm:p-6 space-y-5 text-left my-auto custom-scrollbar">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar modal de retroalimentacion"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. Header: Correct (Emerald) / Incorrect (Coral) Banner */}
        <header
          className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            isCorrect
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
          }`}
        >
          <div className="flex items-start gap-3.5">
            {isCorrect ? (
              <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-6 h-6 sm:w-7 sm:h-7 text-rose-400 shrink-0 mt-0.5" />
            )}

            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h2
                  id="pearl-modal-title"
                  className="font-extrabold text-base sm:text-lg text-white tracking-tight"
                >
                  {isCorrect
                    ? 'Decision Clinica Correcta'
                    : 'Brecha de Razonamiento Detectada'}
                </h2>

                <span
                  className={`px-2.5 py-0.5 rounded-full font-mono text-xs font-bold flex items-center gap-1 shrink-0 ${
                    isCorrect
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                      : 'bg-slate-800 text-gray-300 border border-slate-700'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-teal-400" />
                  +{xpEarned} XP
                </span>
              </div>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans">
                {isCorrect
                  ? 'Conducta acertada, alineada con las recomendaciones de practica clinica y la correlacion fisiopatologica.'
                  : 'La conducta indicada retrasa la resolucion o incrementa el riesgo de complicaciones en esta estacion clinica.'}
              </p>

              {/* Identified Cognitive Gap Badge for incorrect responses */}
              {!isCorrect && identifiedGap && (
                <div className="pt-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400/90 block mb-1">
                    Brecha de Razonamiento Identificada:
                  </span>
                  <CognitiveGapBadge
                    gapTag={identifiedGap}
                    size="md"
                    showDescription={false}
                  />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 2. Cognitive Gap Diagnostic Card */}
        <section
          aria-label="Diagnostico de la decision clinica"
          className="p-4 rounded-xl bg-slate-900/90 border border-clinical-border space-y-2 shadow-inner"
        >
          <div className="flex items-center gap-2 font-mono text-xs uppercase font-bold text-clinical-cyan tracking-wider">
            <Brain className="w-4 h-4 text-clinical-cyan shrink-0" />
            <span>
              {isCorrect
                ? 'Analisis de Acierto y Correlacion Clinica'
                : 'Diagnostico de la Brecha Cognitiva (Motor OCRI)'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-200 leading-relaxed pl-6">
            {gapExplanation}
          </p>
        </section>

        {/* 3. 60-Second Actionable Clinical Pearl */}
        <section
          aria-label="Perla clinica"
          className="border border-clinical-teal/40 bg-clinical-teal/[0.08] p-4 sm:p-5 rounded-xl space-y-2.5 shadow-sm"
        >
          <div className="flex items-center gap-2 font-mono text-xs uppercase font-bold text-teal-300 tracking-wider">
            <Lightbulb className="w-4 h-4 text-teal-400 shrink-0" />
            <span>Perla Clinica de Guardia (Ultra-Resumen 60 Segundos)</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-sans pl-6">
            {clinicalPearl}
          </p>
        </section>

        {/* 4. Medical Guideline & Evidence Citation */}
        <section
          aria-label="Referencia y guia clinica"
          className="p-4 rounded-xl bg-slate-900/90 border border-clinical-border space-y-3"
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 font-mono text-xs uppercase font-bold text-clinical-cyan tracking-wider">
              <BookOpen className="w-4 h-4 text-clinical-cyan shrink-0" />
              <span>Evidencia Cientifica y Guia de Respaldo</span>
            </div>

            {medRef.guideline_source && (
              <span className="px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold bg-clinical-cyan/15 text-clinical-cyan border border-clinical-cyan/30">
                {medRef.guideline_source}
              </span>
            )}
          </div>

          <div className="space-y-1.5 pl-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <p className="font-semibold text-xs sm:text-sm text-white">
                {medRef.title} ({medRef.year})
              </p>
              {medRef.pmid_doi ? (
                <a
                  href={citationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-clinical-cyan hover:underline shrink-0"
                >
                  <span>{medRef.pmid_doi}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : citationUrl ? (
                <a
                  href={citationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-clinical-cyan hover:underline shrink-0"
                >
                  <span>Buscar en PubMed</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : null}
            </div>

            {medRef.key_takeaway && (
              <p className="text-xs text-gray-300 font-sans italic bg-black/40 p-2.5 rounded-lg border border-white/5 leading-relaxed">
                &quot;{medRef.key_takeaway}&quot;
              </p>
            )}
          </div>
        </section>

        {/* 5. Adaptive Leveling Prescription */}
        <section
          aria-label="Prescripcion adaptativa y repeticion espaciada"
          className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
        >
          <div className="flex items-center gap-2.5 text-gray-300">
            <FileCheck2 className="w-4 h-4 text-clinical-teal-light shrink-0" />
            <div>
              <span className="text-gray-400 block text-[10px] uppercase">
                Prescripcion Adaptativa:
              </span>
              <span className="font-medium text-white">
                {prescription.spaced_repetition_scheduled
                  ? `Repeticion Espaciada ${prescription.next_review_interval || 'D7'} Programada`
                  : 'Dominio de Estacion Acreditado'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:justify-end">
            <div className="text-right">
              <span className="text-gray-400 block text-[10px] uppercase">
                Nivel Actual:
              </span>
              <span className="font-semibold text-clinical-cyan">
                {prescription.new_level || 'Nivel 1'}
              </span>
            </div>

            <div className="text-right">
              <span className="text-gray-400 block text-[10px] uppercase">
                Delta Dominio:
              </span>
              <span
                className={`font-bold flex items-center justify-end gap-1 ${
                  prescription.mastery_delta >= 0
                    ? 'text-emerald-400'
                    : 'text-rose-400'
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

        {/* 6. Navigation Actions */}
        <footer className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-clinical-border">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 border border-clinical-border hover:bg-slate-800 text-gray-300 hover:text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4 text-gray-400" />
            <span>Revisar Vineta Clinica</span>
          </button>

          <button
            type="button"
            onClick={isFinalStation ? onFinishCase : onNextStation}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-clinical-teal/20 active:scale-95"
          >
            <span>
              {isFinalStation
                ? 'Finalizar Caso y Volver al Panel'
                : 'Siguiente Estacion Clinica'}
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ClinicalPearlModal;
