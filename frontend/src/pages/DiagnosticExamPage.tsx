import React, { useState, useEffect } from 'react';
import {
  Activity,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Award,
  Brain,
  ShieldCheck,
  Loader2,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { levelingApi } from '../services/api';
import type { DiagnosticQuestion, DiagnosticResult } from '../types/api';
import { VitalSignBadge } from '../components/common/VitalSignBadge';
import { CognitiveGapBadge } from '../components/common/CognitiveGapBadge';

export interface DiagnosticExamPageProps {
  onComplete: () => void;
}

export const DiagnosticExamPage: React.FC<DiagnosticExamPageProps> = ({ onComplete }) => {
  const { refreshUser } = useAuth();
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await levelingApi.getDiagnosticQuestions();
        setQuestions(data);
      } catch (err: any) {
        console.error('[DiagnosticExamPage] Error al cargar preguntas basales:', err);
        setError('No fue posible cargar las preguntas del examen diagnostico. Intente recargar.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;
  const currentSelection = currentQ ? selectedAnswers[currentQ.id] : undefined;
  const answeredCount = Object.keys(selectedAnswers).length;
  const allAnswered = questions.length > 0 && answeredCount === questions.length;

  const handleSelectOption = (optionId: string) => {
    if (!currentQ || isSubmitting) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionId,
    }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!allAnswered || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    const answersPayload = questions.map((q) => ({
      question_id: q.id,
      selected_option_id: selectedAnswers[q.id] || '',
    }));

    try {
      const result = await levelingApi.submitDiagnosticExam(answersPayload);
      setDiagnosticResult(result);
      await refreshUser();
    } catch (err: any) {
      console.error('[DiagnosticExamPage] Error al evaluar examen diagnostico:', err);
      setError(err?.response?.data?.detail || 'Error al enviar las respuestas de la evaluacion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-sky-600 animate-spin" />
        <p className="text-sm font-mono text-slate-600">
          Cargando examen de autoevaluacion diagnostica...
        </p>
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center max-w-md mx-auto p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Error de Conexion</h2>
        <p className="text-xs text-slate-600">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-lg bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Diagnostic Results Screen
  if (diagnosticResult) {
    const isApto = diagnosticResult.aptitude_status === 'apto';
    const isNivelacion = diagnosticResult.aptitude_status === 'en_nivelacion';

    const statusBanner = isApto
      ? {
          bg: 'bg-emerald-50 border-emerald-300 text-emerald-950',
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          title: 'APTO PARA EL EXAMEN / INTERNADO',
          desc: 'Rendimiento clinico sobresaliente en las 5 estaciones basales. Tienes las competencias fundamentales requeridas para afrontar el internado y tu preparacion de alto rendimiento.',
          icon: ShieldCheck,
          iconColor: 'text-emerald-600',
        }
      : isNivelacion
        ? {
            bg: 'bg-amber-50 border-amber-300 text-amber-950',
            badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
            title: 'EN NIVELACIÓN (APTO CONDICIONAL)',
            desc: 'Has alcanzado el umbral basal aprobatorio. Sin embargo, se identificaron brechas cognitivas puntuales que seran reforzadas de manera guiada en tu panel.',
            icon: Brain,
            iconColor: 'text-amber-600',
          }
        : {
            bg: 'bg-rose-50 border-rose-300 text-rose-950',
            badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
            title: 'NO APTO - NIVELACIÓN PRIORITARIA REQUERIDA',
            desc: 'Se identificaron brechas criticas en triaje vital o conducta terapeutica urgente. Tu ruta de entrenamiento adaptativa comenzara con casos clinicos de nivelacion prioritaria.',
            icon: AlertTriangle,
            iconColor: 'text-rose-600',
          };

    const StatusIcon = statusBanner.icon;

    return (
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14 animate-fade-in">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-lg space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider bg-sky-50 text-sky-800 border border-sky-200">
              Evaluacion Basal Concluida
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Resultado de Autoevaluacion Diagnostica
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Tu desempeno ha sido registrado en el motor adaptativo OCRI. A continuacion se detallan tus metricas reales y estado de aptitud.
            </p>
          </div>

          {/* Aptitude Status Card */}
          <div className={`p-6 rounded-2xl border-2 transition-all ${statusBanner.bg} shadow-xs`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center shrink-0">
                  <StatusIcon className={`w-7 h-7 ${statusBanner.iconColor}`} />
                </div>
                <div className="space-y-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${statusBanner.badgeBg}`}>
                    Estado Basal
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold tracking-tight">
                    {statusBanner.title}
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed opacity-90 max-w-lg">
                    {statusBanner.desc}
                  </p>
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-slate-300 sm:pl-6 shrink-0">
                <span className="text-[11px] font-mono uppercase block opacity-75 font-semibold">
                  Calificacion
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight">
                  {diagnosticResult.diagnostic_score}%
                </div>
                <span className="text-xs font-mono opacity-80 block">
                  {diagnosticResult.correct_count} de {diagnosticResult.total_questions} aciertos
                </span>
              </div>
            </div>
          </div>

          {/* Detected Cognitive Gaps */}
          {diagnosticResult.detected_gaps.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-sky-600" />
                <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-700">
                  Brechas Cognitivas Detectadas para Nivelacion
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {diagnosticResult.detected_gaps.map((gap, idx) => (
                  <CognitiveGapBadge
                    key={idx}
                    gapTag={gap}
                    showDescription
                    size="sm"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Explanations summary per question */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-700">
              Desglose de Estaciones Basales
            </h4>
            <div className="space-y-2.5">
              {diagnosticResult.details.map((detail, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border text-xs ${
                    detail.is_correct
                      ? 'bg-emerald-50/60 border-emerald-200 text-slate-800'
                      : 'bg-rose-50/60 border-rose-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono font-bold mb-1">
                    <span className="flex items-center gap-1.5">
                      {detail.is_correct ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                      )}
                      Estacion {detail.question_id}: {detail.specialty.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={detail.is_correct ? 'text-emerald-700' : 'text-rose-700'}>
                      {detail.is_correct ? 'Acierto (+20%)' : 'Desviacion (0%)'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 pl-5 leading-relaxed">
                    {detail.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA to Enter Interactive Dashboard */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 font-mono">
              +100 XP acreditados por completar la evaluacion inicial
            </div>
            <button
              type="button"
              onClick={onComplete}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.01]"
            >
              <span>Ingresar al Dashboard y Comenzar Nivelacion</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Questions Step-by-Step Screen
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6">
        {/* Header with Title and Progress Indicator */}
        <div className="border-b border-slate-100 pb-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-sky-50 text-sky-800 border border-sky-200">
                Paso Obligatorio de Admision
              </span>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mt-1">
                Autoevaluacion Diagnostica Inicial
              </h1>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs text-slate-600">
              <span className="font-bold text-sky-700">Pregunta {currentIndex + 1}</span>
              <span>de {totalQuestions}</span>
            </div>
          </div>

          {/* Step Progress Bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
            <div
              className="h-full bg-sky-600 transition-all duration-300 ease-out"
              style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Question Vignette */}
        {currentQ && (
          <div className="space-y-5">
            {/* Metadata Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-medium bg-sky-50 text-sky-800 border border-sky-200">
                {currentQ.specialty_label}
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
                {currentQ.station_type}
              </span>
            </div>

            {/* Clinical Vignette Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-sky-800 font-bold">
                <Activity className="w-4 h-4 text-sky-600" />
                <span>Vineta Clinica Inicial</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                {currentQ.vignette}
              </p>

              {/* Vital Signs Row */}
              {currentQ.vital_signs && (
                <div className="pt-2 border-t border-slate-200/80 flex flex-wrap gap-2">
                  {Object.entries(currentQ.vital_signs).map(([key, val]) => (
                    <VitalSignBadge
                      key={key}
                      label={key.toUpperCase()}
                      value={val}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Question Prompt */}
            <div className="pt-1">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                {currentQ.question}
              </h3>
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = currentSelection === opt.id;
                const letter = String.fromCharCode(65 + optIdx);

                return (
                  <div
                    key={opt.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`flex items-start gap-3.5 p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-sky-50 border-sky-500 shadow-xs ring-1 ring-sky-500/30'
                        : 'bg-white border-slate-200 hover:border-sky-300 hover:bg-sky-50/30'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 border transition-colors ${
                        isSelected
                          ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : letter}
                    </div>
                    <div className="pt-1 flex-1 text-xs sm:text-sm text-slate-800 leading-relaxed">
                      {opt.text}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Error notification if submission failed */}
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={currentIndex === 0 || isSubmitting}
            onClick={handlePrev}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          {currentIndex < totalQuestions - 1 ? (
            <button
              type="button"
              disabled={!currentSelection || isSubmitting}
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span>Siguiente</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={!allAnswered || isSubmitting}
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Calibrando Diagnostico...</span>
                </>
              ) : (
                <>
                  <span>Finalizar y Obtener Diagnostico</span>
                  <Award className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiagnosticExamPage;
