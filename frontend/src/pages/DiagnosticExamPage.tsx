import React, { useState, useEffect } from 'react';
import {
  Activity,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Award,
  Brain,
  ShieldCheck,
  Loader2,
  Check,
  Layers,
  Stethoscope,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { levelingApi } from '../services/api';
import type {
  DiagnosticQuestion,
  DiagnosticResult,
  DiagnosticExamMode,
  DiagnosticSpecialtyOption,
} from '../types/api';
import { VitalSignBadge } from '../components/common/VitalSignBadge';
import { CognitiveGapBadge } from '../components/common/CognitiveGapBadge';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';

export interface DiagnosticExamPageProps {
  onComplete: () => void;
}

const FALLBACK_SPECIALTIES: DiagnosticSpecialtyOption[] = [
  {
    id: 'medicina_interna',
    label: 'Medicina Interna',
    description: 'Cardiologia aguda, neumologia, infectologia y estabilizacion hemodinamica.',
  },
  {
    id: 'pediatria',
    label: 'Pediatria',
    description: 'Reanimacion hidrica, urgencias respiratorias, infectologia e inmunologia pediatrica.',
  },
  {
    id: 'ginecologia_obstetricia',
    label: 'Gineco-Obstetricia',
    description: 'Claves obstetricas, trastornos hipertensivos del embarazo y hemorragias.',
  },
  {
    id: 'cirugia_general',
    label: 'Cirugia General',
    description: 'Abdomen agudo quirurgico, patologia biliar, obstruccion intestinal y trauma.',
  },
  {
    id: 'medicina_familiar',
    label: 'Medicina Familiar',
    description: 'Control cronico integral, prevencion primaria, endocrinologia ambulatoria y salud mental.',
  },
  {
    id: 'nefrologia',
    label: 'Nefrologia y Medio Interno',
    description: 'Trastornos acido-base, electrolitos criticos, injuria renal aguda y glomerulopatias.',
  },
];

export const DiagnosticExamPage: React.FC<DiagnosticExamPageProps> = ({ onComplete }) => {
  const { user, refreshUser } = useAuth();

  // Phase: 'select_mode' -> 'active_exam' -> 'results'
  const [hasStartedExam, setHasStartedExam] = useState<boolean>(false);
  const [examMode, setExamMode] = useState<DiagnosticExamMode>('general');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(
    user?.initial_world || 'medicina_interna'
  );
  const [specialtyOptions, setSpecialtyOptions] =
    useState<DiagnosticSpecialtyOption[]>(FALLBACK_SPECIALTIES);

  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);

  const animatedFinalScore = Math.round(
    useAnimatedNumber(diagnosticResult?.diagnostic_score ?? 0, 950, 0)
  );

  useEffect(() => {
    if (user?.initial_world) {
      setSelectedSpecialty(user.initial_world);
    }
  }, [user?.initial_world]);

  useEffect(() => {
    let mounted = true;
    levelingApi
      .getDiagnosticSpecialties()
      .then((list) => {
        if (mounted && Array.isArray(list) && list.length > 0) {
          setSpecialtyOptions(list);
        }
      })
      .catch(() => {
        // Keep fallback list seamlessly
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleBeginExam = async () => {
    setIsLoading(true);
    setError(null);
    setSelectedAnswers({});
    setCurrentIndex(0);
    try {
      const data = await levelingApi.getDiagnosticQuestions(
        examMode,
        examMode === 'specialty' ? selectedSpecialty : null
      );
      setQuestions(data);
      setHasStartedExam(true);
    } catch (err: any) {
      console.error('[DiagnosticExamPage] Error al cargar preguntas basales:', err);
      setError('No fue posible cargar las preguntas de evaluacion. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

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
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
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
      const result = await levelingApi.submitDiagnosticExam(
        answersPayload,
        examMode,
        examMode === 'specialty' ? selectedSpecialty : null
      );
      setDiagnosticResult(result);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      await refreshUser();
    } catch (err: any) {
      console.error('[DiagnosticExamPage] Error al evaluar examen diagnostico:', err);
      setError(err?.response?.data?.detail || 'Error al enviar tus respuestas.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // 1. INITIAL MODE SELECTION SCREEN (General vs Single Specialty)
  // =========================================================================
  if (!hasStartedExam && !diagnosticResult) {
    const activeSpecObj = specialtyOptions.find((s) => s.id === selectedSpecialty);

    return (
      <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
        <div className="bg-white border border-[#DCE5E3] rounded-3xl p-6 sm:p-10 shadow-xs space-y-8 animate-fade-in-up">
          <div className="space-y-2 border-b border-[#EDF2F0] pb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0E6F65]">
              Calibracion clinica inicial
            </p>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#0B252E]">
              Elige como deseas rendir tu evaluacion inicial
            </h1>
            <p className="text-sm sm:text-base text-[#4A606A] leading-relaxed max-w-2xl">
              Antes de activar tus indicadores de rendimiento en Mundo Clinico, selecciona entre
              una evaluacion transversal de todas las especialidades o un examen enfocado en una
              sola especialidad.
            </p>
          </div>

          {/* 2 Mode Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Option 1: Examen General */}
            <button
              type="button"
              onClick={() => setExamMode('general')}
              className={`relative p-6 rounded-2xl border text-left editorial-card-lift flex flex-col justify-between space-y-4 ${
                examMode === 'general'
                  ? 'bg-[#EAF4F2] border-[#0E6F65] shadow-xs'
                  : 'bg-[#FDFCFA] border-[#DCE5E3] hover:border-[#9EC6BF]'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-white border border-[#D4E4E0] flex items-center justify-center text-[#0E6F65]">
                    <Layers className="w-5 h-5" />
                  </div>
                  {examMode === 'general' && (
                    <span className="w-6 h-6 rounded-full bg-[#0E6F65] text-white flex items-center justify-center animate-scale-in">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0E6F65] block">
                    Opcion 1 · Transversal
                  </span>
                  <h2 className="font-serif text-xl font-bold text-[#0B252E] mt-0.5">
                    Examen General
                  </h2>
                </div>

                <p className="text-xs sm:text-sm text-[#4A606A] leading-relaxed">
                  Incluye casos integrados de las principales especialidades (Medicina Interna,
                  Nefrologia, Pediatria y Cirugia General) para medir tu perfil global.
                </p>
              </div>

              <div className="pt-3 border-t border-[#D5E5E1] text-xs font-medium text-[#0E6F65]">
                5 estaciones clinicas · Todas las especialidades troncales
              </div>
            </button>

            {/* Option 2: Examen de una sola especialidad */}
            <button
              type="button"
              onClick={() => setExamMode('specialty')}
              className={`relative p-6 rounded-2xl border text-left editorial-card-lift flex flex-col justify-between space-y-4 ${
                examMode === 'specialty'
                  ? 'bg-[#EAF4F2] border-[#0E6F65] shadow-xs'
                  : 'bg-[#FDFCFA] border-[#DCE5E3] hover:border-[#9EC6BF]'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-white border border-[#D4E4E0] flex items-center justify-center text-[#0E6F65]">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  {examMode === 'specialty' && (
                    <span className="w-6 h-6 rounded-full bg-[#0E6F65] text-white flex items-center justify-center animate-scale-in">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0E6F65] block">
                    Opcion 2 · Focalizado
                  </span>
                  <h2 className="font-serif text-xl font-bold text-[#0B252E] mt-0.5">
                    Examen de una sola especialidad
                  </h2>
                </div>

                <p className="text-xs sm:text-sm text-[#4A606A] leading-relaxed">
                  Evalua tu razonamiento clinico unicamente en la especialidad o rotacion que
                  estes cursando en este momento.
                </p>
              </div>

              <div className="pt-3 border-t border-[#D5E5E1] text-xs font-medium text-[#0E6F65]">
                5 estaciones clinicas · Especialidad a eleccion
              </div>
            </button>
          </div>

          {/* Specialty Selector Panel when examMode === 'specialty' */}
          {examMode === 'specialty' && (
            <div className="p-5 sm:p-6 rounded-2xl bg-[#F2F7F6] border border-[#D7E5E2] space-y-4 animate-fade-in-up">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#0B252E]">
                  Selecciona la especialidad a evaluar
                </h3>
                <p className="text-xs text-[#5C737C]">
                  {activeSpecObj?.description ||
                    'Se presentaran 5 escenarios clinicos representativos de esta especialidad.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {specialtyOptions.map((sp) => {
                  const isCurrent = selectedSpecialty === sp.id;
                  return (
                    <button
                      key={sp.id}
                      type="button"
                      onClick={() => setSelectedSpecialty(sp.id)}
                      className={`px-4 py-3 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-2 ${
                        isCurrent
                          ? 'bg-white border-[#0E6F65] text-[#0E6F65] font-semibold shadow-2xs'
                          : 'bg-white/70 border-[#DCE5E3] text-[#354B54] hover:bg-white'
                      }`}
                    >
                      <span>{sp.label}</span>
                      {isCurrent && <Check className="w-4 h-4 text-[#0E6F65] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-[#FBF1F1] border border-[#EED7D7] text-[#8E3538] text-xs sm:text-sm flex items-center gap-2 animate-clinical-shake">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-4 border-t border-[#EDF2F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-xs text-[#6E828A]">
              Duracion estimada: 4 a 6 minutos · Sin penalizacion por tiempo
            </span>
            <button
              type="button"
              disabled={isLoading}
              onClick={handleBeginExam}
              className="group w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#0E6F65] hover:bg-[#0A564E] text-white text-sm font-medium inline-flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Preparando estaciones...</span>
                </>
              ) : (
                <>
                  <span>
                    {examMode === 'general'
                      ? 'Comenzar Examen General'
                      : `Evaluar ${activeSpecObj?.label || 'Especialidad'}`}
                  </span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. DIAGNOSTIC RESULTS SCREEN (Animated Red/Amber/Teal Score Gauge + Cards)
  // =========================================================================
  if (diagnosticResult) {
    const isApto = diagnosticResult.aptitude_status === 'apto';
    const isNivelacion = diagnosticResult.aptitude_status === 'en_nivelacion';

    const statusBanner = isApto
      ? {
          bg: 'bg-[#ECF6F4] border-[#BFE0D9] text-[#0B252E]',
          accent: 'text-[#0E6F65]',
          strokeHex: '#0E6F65',
          title: 'Apto para tu etapa clinica',
          desc: 'Demostraste solidez en las estaciones evaluadas. Tu ruta personalizada priorizara casos integradores de complejidad progresiva.',
          icon: ShieldCheck,
        }
      : isNivelacion
        ? {
            bg: 'bg-[#FDF7E7] border-[#E9D7AC] text-[#0B252E]',
            accent: 'text-[#9A6B1F]',
            strokeHex: '#B67F1E',
            title: 'En nivelacion guiada (Apto condicional)',
            desc: 'Cuentas con una base adecuada y detectamos brechas puntuales que reforzaremos paso a paso en Mundo Clinico.',
            icon: Brain,
          }
        : {
            bg: 'bg-[#FDECEC] border-[#E8C5C6] text-[#0B252E]',
            accent: 'text-[#B6222A]',
            strokeHex: '#C6383E',
            title: 'Nivelacion prioritaria requerida',
            desc: 'Tus puntajes iniciales reflejan brechas importantes. Hemos calibrado tu Mundo Clinico con porcentajes reales y repasos inmediatos.',
            icon: AlertTriangle,
          };

    const StatusIcon = statusBanner.icon;
    const gaugeRadius = 34;
    const gaugeCircumference = 2 * Math.PI * gaugeRadius;
    const gaugeOffset =
      gaugeCircumference -
      (Math.min(100, Math.max(4, animatedFinalScore)) / 100) * gaugeCircumference;

    return (
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
        <div className="bg-white border border-[#DCE5E3] rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 animate-fade-in-up">
          <div className="text-center space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0E6F65]">
              Evaluacion inicial completada
            </p>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#0B252E]">
              Sintesis de tu desempeno basal
            </h1>
            <p className="text-xs sm:text-sm text-[#5C737C] max-w-xl mx-auto">
              Modalidad:{' '}
              {examMode === 'specialty'
                ? `Especialidad unica (${
                    specialtyOptions.find((s) => s.id === selectedSpecialty)?.label ||
                    selectedSpecialty
                  })`
                : 'Examen General Transversal'}
            </p>
          </div>

          {/* Animated Aptitude Summary Card */}
          <div
            className={`p-6 rounded-2xl border ${statusBanner.bg} ${
              isApto ? 'animate-correct-pop' : !isNivelacion ? 'animate-clinical-shake' : ''
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <span
                    aria-hidden="true"
                    className={`absolute inset-0 rounded-2xl animate-ring-expand pointer-events-none ${
                      isApto
                        ? 'bg-[#0E6F65]/25'
                        : isNivelacion
                          ? 'bg-[#B67F1E]/25'
                          : 'bg-[#C6383E]/30'
                    }`}
                  />
                  <div className="relative w-12 h-12 rounded-2xl bg-white border border-[#DCE5E3] flex items-center justify-center">
                    <StatusIcon className={`w-6 h-6 ${statusBanner.accent}`} />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className={`text-xs font-semibold uppercase tracking-wider ${statusBanner.accent}`}>
                    Diagnostico de partida
                  </span>
                  <h2 className="font-serif text-xl font-bold text-[#0B252E]">
                    {statusBanner.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#4A606A] leading-relaxed max-w-lg">
                    {statusBanner.desc}
                  </p>
                </div>
              </div>

              {/* Animated SVG Circular Score Gauge */}
              <div className="flex items-center gap-4 sm:border-l sm:border-black/10 sm:pl-6 shrink-0">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 84 84">
                    <circle
                      cx="42"
                      cy="42"
                      r={gaugeRadius}
                      fill="#FFFFFF"
                      stroke="#E7ECEA"
                      strokeWidth="6"
                    />
                    <circle
                      cx="42"
                      cy="42"
                      r={gaugeRadius}
                      fill="none"
                      stroke={statusBanner.strokeHex}
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={gaugeCircumference}
                      strokeDashoffset={gaugeOffset}
                      className="transition-all duration-300 ease-out"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className={`font-serif text-xl font-bold block leading-none ${statusBanner.accent}`}>
                      {animatedFinalScore}%
                    </span>
                    <span className="text-[10px] text-[#5C737C]">
                      {diagnosticResult.correct_count}/{diagnosticResult.total_questions}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detected Cognitive Gaps */}
          {diagnosticResult.detected_gaps.length > 0 && (
            <div className="space-y-3 animate-fade-in-up stagger-1">
              <h3 className="font-serif text-lg font-bold text-[#0B252E]">
                Brechas detectadas para tu ruta de refuerzo
              </h3>
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

          {/* Staggered Per-Station Animated Feedback */}
          <div className="space-y-3">
            <h3 className="font-serif text-lg font-bold text-[#0B252E]">
              Revision clinica por estacion
            </h3>
            <div className="space-y-2.5">
              {diagnosticResult.details.map((detail, idx) => (
                <div
                  key={idx}
                  style={{ animationDelay: `${idx * 70}ms` }}
                  className={`p-4 rounded-xl border text-xs sm:text-sm animate-fade-in-up ${
                    detail.is_correct
                      ? 'bg-[#ECF6F4]/80 border-[#CFE7E2]'
                      : 'bg-[#FDECEC]/75 border-[#E8C5C6]'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold mb-1.5 text-[#0B252E]">
                    <span className="flex items-center gap-2.5">
                      {detail.is_correct ? (
                        <span className="w-5 h-5 rounded-full bg-[#0E6F65] text-white flex items-center justify-center shrink-0">
                          <svg
                            className="w-3.5 h-3.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M5 13l4 4L19 7" className="animate-check-draw" />
                          </svg>
                        </span>
                      ) : (
                        <span className="w-5 h-5 rounded-full bg-[#C6383E] text-white flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-3 h-3" />
                        </span>
                      )}
                      <span className="capitalize">
                        Estacion {idx + 1} · {detail.specialty.replace(/_/g, ' ')}
                      </span>
                    </span>
                    <span
                      className={
                        detail.is_correct ? 'text-[#0E6F65]' : 'text-[#B6222A]'
                      }
                    >
                      {detail.is_correct ? 'Criterio acertado' : 'Brecha detectada'}
                    </span>
                  </div>
                  <p className="text-xs text-[#4A606A] pl-7 leading-relaxed">
                    {detail.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#EDF2F0] flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-[#6E828A]">
              Tu rombo de competencias y tu cola de repasos espaciados ya reflejan este resultado
            </span>
            <button
              type="button"
              onClick={onComplete}
              className="group w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#0E6F65] hover:bg-[#0A564E] text-white font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200"
            >
              <span>Ingresar a mi Mundo Clinico</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. ACTIVE STEP-BY-STEP EXAM SCREEN
  // =========================================================================
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      <div className="bg-white border border-[#DCE5E3] rounded-3xl p-5 sm:p-8 shadow-xs space-y-6">
        {/* Header & Progress */}
        <div className="border-b border-[#EDF2F0] pb-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <button
                type="button"
                onClick={() => setHasStartedExam(false)}
                className="text-xs text-[#0E6F65] hover:underline inline-flex items-center gap-1 mb-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Cambiar modalidad de examen</span>
              </button>
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#0B252E]">
                {examMode === 'general'
                  ? 'Examen General de Especialidades'
                  : `Evaluacion de ${
                      specialtyOptions.find((s) => s.id === selectedSpecialty)?.label ||
                      'Especialidad'
                    }`}
              </h1>
            </div>

            <div className="text-xs font-medium text-[#5C737C]">
              <span className="font-semibold text-[#0E6F65]">
                Estacion {currentIndex + 1}
              </span>{' '}
              de {totalQuestions}
            </div>
          </div>

          <div className="w-full bg-[#EEF3F2] h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0E6F65] transition-all duration-500 ease-out"
              style={{ width: `${((currentIndex + 1) / Math.max(totalQuestions, 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Content with Smooth Station Transition */}
        {currentQ && (
          <div key={currentQ.id} className="space-y-5 animate-fade-in-up">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#4A606A]">
              <span className="font-semibold text-[#0E6F65]">
                {currentQ.specialty_label}
              </span>
              <span>·</span>
              <span>{currentQ.station_type}</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#F7FAF9] border border-[#E1ECE9] space-y-3.5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#0E6F65]">
                <Activity className="w-4 h-4" />
                <span>Escenario clinico</span>
              </div>
              <p className="text-sm text-[#0B252E] leading-relaxed">
                {currentQ.vignette}
              </p>

              {currentQ.vital_signs && (
                <div className="pt-3 border-t border-[#E1ECE9] flex flex-wrap gap-2">
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

            <div className="pt-1">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#0B252E] leading-snug">
                {currentQ.question}
              </h2>
            </div>

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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelectOption(opt.id);
                      }
                    }}
                    className={`flex items-start gap-3.5 p-4 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'bg-[#EAF4F2] border-[#0E6F65] shadow-2xs scale-[1.005]'
                        : 'bg-white border-[#DCE5E3] hover:border-[#9EC6BF] hover:bg-[#F7FAF9]'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border transition-all duration-200 ${
                        isSelected
                          ? 'bg-[#0E6F65] text-white border-[#0E6F65]'
                          : 'bg-[#F2F7F6] text-[#354B54] border-[#DCE5E3]'
                      }`}
                    >
                      {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : letter}
                    </div>
                    <div className="pt-1 flex-1 text-xs sm:text-sm text-[#0B252E] leading-relaxed">
                      {opt.text}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-[#FBF1F1] border border-[#EED7D7] text-[#8E3538] text-xs flex items-center gap-2 animate-clinical-shake">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Navigation Footer */}
        <div className="pt-4 border-t border-[#EDF2F0] flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={currentIndex === 0 || isSubmitting}
            onClick={handlePrev}
            className="px-4 py-2.5 rounded-xl border border-[#DCE5E3] text-[#354B54] text-xs sm:text-sm font-medium hover:bg-[#F2F7F6] disabled:opacity-40 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          {currentIndex < totalQuestions - 1 ? (
            <button
              type="button"
              disabled={!currentSelection || isSubmitting}
              onClick={handleNext}
              className="group px-6 py-2.5 rounded-xl bg-[#0E6F65] hover:bg-[#0A564E] text-white text-xs sm:text-sm font-medium disabled:opacity-50 flex items-center gap-1.5 transition-all duration-200"
            >
              <span>Siguiente estacion</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={!allAnswered || isSubmitting}
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl bg-[#0E6F65] hover:bg-[#0A564E] text-white text-xs sm:text-sm font-medium disabled:opacity-50 flex items-center gap-2 transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Calculando tu ruta...</span>
                </>
              ) : (
                <>
                  <span>Finalizar evaluacion</span>
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
