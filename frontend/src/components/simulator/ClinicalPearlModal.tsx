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

  const identifiedGap = (result.gap_tag || result.associated_gap || null) as CognitiveGapTag | null;

  const gapExplanation =
    result.gap_explanation ||
    result.clinical_feedback ||
    (identifiedGap ? GAP_FALLBACK_EXPLANATIONS[identifiedGap] : null) ||
    'Analisis del patron de razonamiento clinico.';

  const clinicalPearl =
    result.clinical_pearl ||
    'La valoracion sistematica de las constantes fisiologicas y los criterios de gravedad reduce de manera determinante el tiempo hasta la intervencion terapeutica definitiva.';

  const medRef = result.medical_reference || {
    title: result.citation_evidence || 'Guia Clinica Basada en Evidencia UPCH',
    year: 2026,
    guideline_source: 'MINSA / UPCH',
    pmid_doi: '',
    key_takeaway: 'Correlacion obligatoria entre guias internacionales y protocolo institucional.',
  };

  const citationUrl = resolveCitationUrl(medRef.pmid_doi, medRef.title);

  const prescription = result.leveling_prescription || {
    new_level: 'Nivel 1',
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white border border-slate-200 shadow-2xl p-5 sm:p-6 space-y-5 text-left my-auto animate-scale-in">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar modal de retroalimentacion"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 1. Header: Correct (Emerald) / Incorrect (Coral) Banner */}
        <header
          className={`p-4 sm:p-5 rounded-2xl border transition-all animate-fade-in-up ${
            isCorrect
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-rose-50 border-rose-200 text-rose-950'
          }`}
        >
          <div className="flex items-start gap-3.5">
            {isCorrect ? (
              <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-6 h-6 sm:w-7 sm:h-7 text-rose-600 shrink-0 mt-0.5" />
            )}

            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h2
                  id="pearl-modal-title"
                  className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight"
                >
                  {isCorrect
                    ? 'Decision Clinica Correcta'
                    : 'Brecha de Razonamiento Detectada'}
                </h2>

                <span
                  className={`px-2.5 py-0.5 rounded-full font-mono text-xs font-bold flex items-center gap-1 shrink-0 ${
                    isCorrect
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-sky-600" />
                  +{xpEarned} XP
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                {isCorrect
                  ? 'Conducta acertada, alineada con las recomendaciones de practica clinica y la correlacion fisiopatologica.'
                  : 'La conducta indicada retrasa la resolucion o incrementa el riesgo de complicaciones en esta estacion clinica.'}
              </p>

              {/* Identified Cognitive Gap Badge for incorrect responses */}
              {!isCorrect && identifiedGap && (
                <div className="pt-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-rose-700 block mb-1 font-semibold">
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
          className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 shadow-xs animate-fade-in-up stagger-1"
        >
          <div className="flex items-center gap-2 font-mono text-xs uppercase font-bold text-sky-800 tracking-wider">
            <Brain className="w-4 h-4 text-sky-600 shrink-0" />
            <span>
              {isCorrect
                ? 'Analisis de Acierto y Correlacion Clinica'
                : 'Diagnostico de la Brecha Cognitiva (Motor OCRI)'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-6">
            {gapExplanation}
          </p>
        </section>

        {/* 3. 60-Second Actionable Clinical Pearl */}
        <section
          aria-label="Perla clinica"
          className="border border-sky-200 bg-sky-50/70 p-4 sm:p-5 rounded-xl space-y-2.5 shadow-xs animate-pearl-reveal"
        >
          <div className="flex items-center gap-2 font-mono text-xs uppercase font-bold text-sky-800 tracking-wider">
            <Lightbulb className="w-4 h-4 text-sky-600 shrink-0" />
            <span>Perla Clinica de Guardia (Ultra-Resumen 60 Segundos)</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans pl-6">
            {clinicalPearl}
          </p>
        </section>

        {/* 4. Medical Guideline & Evidence Citation */}
        <section
          aria-label="Referencia y guia clinica"
          className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-fade-in-up stagger-2"
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 font-mono text-xs uppercase font-bold text-sky-800 tracking-wider">
              <BookOpen className="w-4 h-4 text-sky-600 shrink-0" />
              <span>Evidencia Cientifica y Guia de Respaldo</span>
            </div>

            {medRef.guideline_source && (
              <span className="px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold bg-sky-100 text-sky-800 border border-sky-200">
                {medRef.guideline_source}
              </span>
            )}
          </div>

          <div className="space-y-1.5 pl-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <p className="font-semibold text-xs sm:text-sm text-slate-900">
                {medRef.title} ({medRef.year})
              </p>
              {medRef.pmid_doi ? (
                <a
                  href={citationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-sky-700 hover:underline shrink-0"
                >
                  <span>{medRef.pmid_doi}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : citationUrl ? (
                <a
                  href={citationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-sky-700 hover:underline shrink-0"
                >
                  <span>Buscar en PubMed</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : null}
            </div>

            {medRef.key_takeaway && (
              <p className="text-xs text-slate-600 font-sans italic bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                &quot;{medRef.key_takeaway}&quot;
              </p>
            )}
          </div>
        </section>

        {/* 5. Adaptive Leveling Prescription */}
        <section
          aria-label="Prescripcion adaptativa y repeticion espaciada"
          className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
        >
          <div className="flex items-center gap-2.5 text-slate-700">
            <FileCheck2 className="w-4 h-4 text-sky-600 shrink-0" />
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                Prescripcion Adaptativa:
              </span>
              <span className="font-medium text-slate-900">
                {prescription.spaced_repetition_scheduled
                  ? `Repeticion Espaciada ${prescription.next_review_interval || 'D7'} Programada`
                  : 'Dominio de Estacion Acreditado'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:justify-end">
            <div className="text-right">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                Nivel Actual:
              </span>
              <span className="font-semibold text-sky-700">
                {prescription.new_level || 'Nivel 1'}
              </span>
            </div>

            <div className="text-right">
              <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                Delta Dominio:
              </span>
              <span
                className={`font-bold flex items-center justify-end gap-1 ${
                  prescription.mastery_delta >= 0
                    ? 'text-emerald-700'
                    : 'text-rose-700'
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
        <footer className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Revisar Vineta Clinica</span>
          </button>

          <button
            type="button"
            onClick={isFinalStation ? onFinishCase : onNextStation}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-xs active:scale-95"
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
