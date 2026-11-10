import React, { useState, useEffect } from 'react';
import {
  Compass,
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  ShieldCheck,
  Brain,
  ArrowRight,
  BookOpen,
  Target,
  Stethoscope,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { levelingApi, specialtiesApi } from '../services/api';
import type {
  LevelingDashboard,
  Specialty,
  SpecialtyMastery,
  CognitiveGapTag,
  SpacedRepetitionItem,
  CompetencyLevel,
  SimulateDaysMode,
  SimulateDaysResponse,
} from '../types/api';
import { CompetencyRadar } from '../components/dashboard/CompetencyRadar';
import { BentoStats } from '../components/dashboard/BentoStats';
import { SpecialtyCard } from '../components/dashboard/SpecialtyCard';
import { SpacedRepetitionQueue } from '../components/dashboard/SpacedRepetitionQueue';
import { TimePassageSimulator } from '../components/dashboard/TimePassageSimulator';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';

export interface DashboardPageProps {
  onSelectSpecialty: (specialtyId: string) => void;
  onSelectCase: (caseId: string) => void;
  onStartDiagnostic?: () => void;
  className?: string;
}

const DEFAULT_RADAR_SCORES: Record<CognitiveGapTag, number> = {
  GAP_TRIAGE_SEVERITY: 50,
  GAP_DIAGNOSTIC_REASONING: 50,
  GAP_LAB_INTERPRETATION: 50,
  GAP_INITIAL_MANAGEMENT: 50,
};

const DEFAULT_SPECIALTIES: Specialty[] = [
  {
    id: 'nefrologia',
    name: 'Nefrologia y Medio Interno',
    description:
      'Abordaje estructurado de injuria renal aguda (KDIGO), microangiopatias tromboticas y trastornos hidroelectroliticos.',
    icon: 'droplets',
    is_unlocked: true,
    case_count: 8,
  },
  {
    id: 'endocrinologia',
    name: 'Endocrinologia y Metabolismo',
    description:
      'Crisis hiperglucemicas agudas (CAD y EHH), tormenta tiroidea, insuficiencia suprarrenal y regulacion metabolica.',
    icon: 'activity',
    is_unlocked: true,
    case_count: 10,
  },
  {
    id: 'neurologia',
    name: 'Neurologia Clinica',
    description:
      'Accidente cerebrovascular isquemico y hemorragico en ventana terapeutica, estado epileptico y deficit focal agudo.',
    icon: 'brain',
    is_unlocked: true,
    case_count: 7,
  },
  {
    id: 'reumatologia',
    name: 'Reumatologia e Inmunologia',
    description:
      'Lupus eritematoso sistemico con compromiso de organo mayor, vasculitis asociadas a ANCA y monoartritis aguda.',
    icon: 'shield-alert',
    is_unlocked: true,
    case_count: 6,
  },
  {
    id: 'ginecologia_obstetricia',
    name: 'Ginecologia y Obstetricia',
    description:
      'Trastornos hipertensivos del embarazo, hemorragia obstetrica mayor, enfermedad trofoblastica y sepsis materna.',
    icon: 'baby',
    is_unlocked: true,
    case_count: 8,
  },
];

const GAP_LABELS: Record<CognitiveGapTag, string> = {
  GAP_TRIAGE_SEVERITY: 'Triaje y reconocimiento de gravedad',
  GAP_DIAGNOSTIC_REASONING: 'Integracion clinico-diagnostica',
  GAP_LAB_INTERPRETATION: 'Interpretacion de examenes auxiliares',
  GAP_INITIAL_MANAGEMENT: 'Manejo terapeutico inicial',
};

const WORLD_LABELS: Record<string, string> = {
  medicina_interna: 'Medicina Interna',
  pediatria: 'Pediatria',
  ginecologia_obstetricia: 'Gineco-Obstetricia',
  ginecologia: 'Gineco-Obstetricia',
  cirugia_general: 'Cirugia General',
  medicina_familiar: 'Medicina Familiar',
  nefrologia: 'Nefrologia',
  endocrinologia: 'Endocrinologia',
  neurologia: 'Neurologia',
  reumatologia: 'Reumatologia',
  oftalmologia: 'Oftalmologia',
};

function getRouteScoreColor(score: number): {
  strokeHex: string;
  textClass: string;
  bgTintClass: string;
  borderTintClass: string;
} {
  if (score < 50) {
    return {
      strokeHex: '#C6383E',
      textClass: 'text-[#B6222A]',
      bgTintClass: 'bg-[#FFF9F9]',
      borderTintClass: 'border-[#EBCACA]',
    };
  }
  if (score < 75) {
    return {
      strokeHex: '#B67F1E',
      textClass: 'text-[#9A6B1F]',
      bgTintClass: 'bg-[#FDFBF5]',
      borderTintClass: 'border-[#EAD8B1]',
    };
  }
  return {
    strokeHex: '#0E6F65',
    textClass: 'text-[#0E6F65]',
    bgTintClass: 'bg-[#F7FAF9]',
    borderTintClass: 'border-[#DCEAE6]',
  };
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onSelectSpecialty,
  onSelectCase,
  onStartDiagnostic,
  className = '',
}) => {
  const { user, refreshUser } = useAuth();
  const [dashboard, setDashboard] = useState<LevelingDashboard | null>(null);
  const [specialties, setSpecialties] = useState<Specialty[]>(DEFAULT_SPECIALTIES);

  useEffect(() => {
    let mounted = true;
    const fetchDashboardData = async () => {
      try {
        const [dashData, specsData] = await Promise.allSettled([
          levelingApi.getDashboard(),
          specialtiesApi.getCatalog(),
        ]);

        if (!mounted) return;

        if (dashData.status === 'fulfilled' && dashData.value) {
          setDashboard(dashData.value);
        }

        if (specsData.status === 'fulfilled' && specsData.value?.length) {
          setSpecialties(specsData.value);
        } else {
          setSpecialties(DEFAULT_SPECIALTIES);
        }
      } catch {
        if (mounted) {
          setSpecialties(DEFAULT_SPECIALTIES);
        }
      }
    };

    fetchDashboardData();
    return () => {
      mounted = false;
    };
  }, []);

  const isDiagnosticCompleted = Boolean(
    dashboard?.diagnostic_completed ?? user?.diagnostic_completed
  );

  const diagnosticScore =
    dashboard?.diagnostic_score ?? user?.diagnostic_score ?? null;

  const aptitudeStatus =
    dashboard?.aptitude_status ?? user?.aptitude_status ?? null;

  const radarScores: Record<CognitiveGapTag, number> =
    dashboard?.cognitive_gap_radar || DEFAULT_RADAR_SCORES;

  const userLevel: CompetencyLevel =
    dashboard?.current_level || user?.current_level || 'Nivel 1';

  const userXP: number =
    dashboard?.total_xp ?? user?.experience_points ?? user?.xp ?? 0;

  const streakDays: number =
    dashboard?.streak_days ?? user?.streak_days ?? 0;

  const spacedItems: SpacedRepetitionItem[] =
    dashboard?.pending_spaced_repetitions &&
    dashboard.pending_spaced_repetitions.length > 0
      ? dashboard.pending_spaced_repetitions
      : [];

  const masteriesList: SpecialtyMastery[] =
    isDiagnosticCompleted &&
    dashboard?.specialty_masteries &&
    dashboard.specialty_masteries.length > 0
      ? dashboard.specialty_masteries
      : [];

  const masteriesMap = new Map<string, SpecialtyMastery>();
  let totalCompletedCases = 0;
  masteriesList.forEach((m) => {
    const normKey = m.specialty_id.toLowerCase();
    masteriesMap.set(normKey, m);
    if (normKey === 'ginecologia_obstetricia') {
      masteriesMap.set('ginecologia', m);
    }
    totalCompletedCases += m.cases_completed || 0;
  });

  const simulatedDaysElapsed = dashboard?.simulated_days_elapsed ?? 0;

  // Dynamic route percentage: reflects diagnostic baseline initially and adapts as stations or simulated days progress
  const rawRouteScore = !isDiagnosticCompleted
    ? 0
    : simulatedDaysElapsed > 0 && typeof dashboard?.ocri_score === 'number'
      ? Math.round(dashboard.ocri_score)
      : totalCompletedCases > 0 && typeof dashboard?.ocri_score === 'number'
        ? Math.round(
            0.45 * (diagnosticScore ?? dashboard.ocri_score) +
              0.55 * dashboard.ocri_score
          )
        : Math.round(diagnosticScore ?? dashboard?.ocri_score ?? 0);

  const animatedRouteScore = Math.round(useAnimatedNumber(rawRouteScore, 900));
  const routeTone = getRouteScoreColor(rawRouteScore);

  const effectiveAptitudeLabel =
    rawRouteScore >= 75
      ? 'Apto para tu etapa clinica'
      : rawRouteScore >= 50
        ? 'En nivelacion guiada (Apto condicional)'
        : 'No Apto · Nivelacion prioritaria requerida';

  // Sort gaps from weakest to strongest so low scores honestly display multiple gaps
  const sortedGapEntries = (
    Object.entries(radarScores) as [CognitiveGapTag, number][]
  ).sort((a, b) => a[1] - b[1]);

  const weakestGap = sortedGapEntries[0];
  const secondWeakestGap = sortedGapEntries[1] || sortedGapEntries[0];
  const strongestGap = sortedGapEntries[sortedGapEntries.length - 1];
  const hasConsolidatedPillar = strongestGap[1] >= 65;

  const firstName = (user?.full_name || 'Estudiante')
    .replace(/^Dr\.?\s+/i, '')
    .split(' ')[0];
  const activeWorldKey =
    dashboard?.diagnostic_specialty ||
    user?.diagnostic_specialty ||
    dashboard?.initial_world ||
    user?.initial_world ||
    'medicina_interna';
  const activeWorldLabel =
    WORLD_LABELS[activeWorldKey] || 'Medicina Interna';
  const academicSubtitle = [
    user?.career || 'Medicina Humana',
    user?.academic_year,
    user?.university,
  ]
    .filter(Boolean)
    .join(' · ');

  const handleEnterSpecialty = (specialtyId: string) => {
    if (!isDiagnosticCompleted && onStartDiagnostic) {
      onStartDiagnostic();
      return;
    }
    onSelectSpecialty(specialtyId);
  };

  const handlePrimaryRouteAction = () => {
    if (!isDiagnosticCompleted) {
      onStartDiagnostic?.();
      return;
    }
    if (spacedItems.length > 0) {
      onSelectCase(spacedItems[0].case_id);
      return;
    }
    onSelectSpecialty(activeWorldKey);
  };

  const handleSimulateDays = async (
    days: number,
    mode: SimulateDaysMode
  ): Promise<SimulateDaysResponse | null> => {
    try {
      const result = await levelingApi.simulateDays(days, mode);
      if (result?.dashboard) {
        setDashboard(result.dashboard);
      }
      await refreshUser();
      return result;
    } catch {
      return null;
    }
  };

  const circleRadius = 26;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const circleOffset =
    circleCircumference -
    (Math.min(100, Math.max(4, animatedRouteScore)) / 100) * circleCircumference;

  return (
    <div className={`space-y-8 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      {/* 1. Classic Editorial Welcome & Tu Ruta Clinica Summary */}
      <section className="rounded-3xl bg-white border border-[#DCE5E3] p-6 sm:p-8 lg:p-10 space-y-7 animate-fade-in-up">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#EDF2F0]">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0E6F65]">
              Mundo Clinico · {activeWorldLabel}
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0B252E]">
              Hola, {firstName}
            </h1>
            <p className="text-sm text-[#4A5D64] max-w-2xl leading-relaxed">
              Tu esfuerzo de hoy construye el criterio medico que aplicaras manana.
              {academicSubtitle ? ` ${academicSubtitle}.` : ''}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {isDiagnosticCompleted ? (
              <button
                type="button"
                onClick={handlePrimaryRouteAction}
                className={`group px-6 py-3 rounded-full text-white text-xs sm:text-sm font-medium flex items-center gap-2 transition-all duration-200 shadow-xs ${
                  rawRouteScore < 50
                    ? 'bg-[#B6222A] hover:bg-[#931B22]'
                    : 'bg-[#0E6F65] hover:bg-[#0A564E]'
                }`}
              >
                <span>
                  {spacedItems.length > 0 && rawRouteScore < 50
                    ? 'Reforzar estacion prioritaria'
                    : 'Comenzar siguiente estacion'}
                </span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onStartDiagnostic}
                className="group px-6 py-3 rounded-full bg-[#0E6F65] hover:bg-[#0A564E] text-white text-xs sm:text-sm font-medium flex items-center gap-2 transition-all duration-200 shadow-xs"
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>Rendir evaluacion diagnostica inicial</span>
              </button>
            )}
          </div>
        </div>

        {/* Tu Ruta Clinica Strip: Strictly gated on diagnostic completion */}
        {!isDiagnosticCompleted ? (
          <div className="p-6 sm:p-7 rounded-2xl bg-[#FDF7E7]/85 border border-[#EFE0B9] flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-white border border-[#EFE0B9] flex items-center justify-center shrink-0 text-[#8A6116]">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <span className="text-[11px] uppercase tracking-[0.14em] font-semibold text-[#8A6116] block">
                  Paso previo obligatorio
                </span>
                <h2 className="font-serif text-xl font-semibold text-[#0B252E]">
                  Calibra tu punto de partida antes de ver porcentajes de rendimiento
                </h2>
                <p className="text-xs sm:text-sm text-[#4A5D64] leading-relaxed max-w-2xl">
                  Para ofrecerte indicadores autenticos de aptitud y detectar tus brechas reales,
                  primero rinde tu evaluacion inicial. Podras elegir entre el Examen General de
                  todas las especialidades o el examen de una sola especialidad.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onStartDiagnostic}
              className="group px-6 py-3 rounded-full bg-[#0E6F65] hover:bg-[#0A564E] text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shrink-0 transition-all duration-200"
            >
              <span>Elegir modalidad de evaluacion</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top summary row: Animated SVG Score Ring (Red / Amber / Teal) + Active world + Modality */}
            <div
              className={`grid grid-cols-1 md:grid-cols-3 gap-4 p-4 sm:p-5 rounded-2xl border transition-colors duration-300 ${routeTone.bgTintClass} ${routeTone.borderTintClass}`}
            >
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                    <circle
                      cx="32"
                      cy="32"
                      r={circleRadius}
                      fill="#FFFFFF"
                      stroke="#EAECEB"
                      strokeWidth="5"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r={circleRadius}
                      fill="none"
                      stroke={routeTone.strokeHex}
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray={circleCircumference}
                      strokeDashoffset={circleOffset}
                      className="transition-all duration-500 ease-out"
                    />
                  </svg>
                  <span
                    className={`absolute font-serif text-base font-bold ${routeTone.textClass}`}
                  >
                    {animatedRouteScore}%
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#6B7D83] block">
                    Rendimiento de tu ruta
                  </span>
                  <span className={`font-serif text-base font-semibold ${routeTone.textClass}`}>
                    {effectiveAptitudeLabel}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 md:border-l md:border-[#DCE5E3] md:pl-5">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#DCE5E3] flex items-center justify-center text-[#0E6F65] shrink-0">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-[#6B7D83] block">Mundo clinico activo</span>
                  <span className="font-serif text-base font-semibold text-[#0B252E]">
                    {activeWorldLabel}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 md:border-l md:border-[#DCE5E3] md:pl-5">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#DCE5E3] flex items-center justify-center shrink-0">
                  {rawRouteScore >= 75 ? (
                    <ShieldCheck className="w-5 h-5 text-[#0E6F65]" />
                  ) : rawRouteScore >= 50 ? (
                    <Brain className="w-5 h-5 text-[#9A6B1F]" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-[#B6222A]" />
                  )}
                </div>
                <div>
                  <span className="text-xs text-[#6B7D83] block">Modalidad diagnostica</span>
                  <span className="font-serif text-base font-semibold text-[#0B252E]">
                    {(dashboard?.diagnostic_mode || user?.diagnostic_mode) === 'specialty'
                      ? 'Especialidad focalizada'
                      : 'Examen General'}
                  </span>
                </div>
              </div>
            </div>

            {/* 3 Honest Adaptive Diagnostic Route Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Brecha prioritaria */}
              <div className="p-5 rounded-2xl bg-[#FBF1F1] border border-[#EED7D7] editorial-card-lift space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs font-semibold text-[#B6222A]">
                  <span className="inline-flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Brecha prioritaria</span>
                  </span>
                  <span className="font-serif text-sm font-bold">{weakestGap[1]}%</span>
                </div>
                <h3 className="font-serif text-lg font-semibold text-[#0B252E]">
                  {GAP_LABELS[weakestGap[0]]}
                </h3>
                <p className="text-xs text-[#4A5D64] leading-relaxed">
                  {weakestGap[1] < 50
                    ? 'Requiere refuerzo inmediato en tu ruta para asegurar decisiones seguras desde el ingreso.'
                    : 'Oportunidad puntual para afinar la toma de decisiones clinicas estructuradas.'}
                </p>
              </div>

              {/* Card 2: Honest Second Gap (if low score) OR Consolidated Pillar (if >= 65%) */}
              {hasConsolidatedPillar ? (
                <div className="p-5 rounded-2xl bg-[#ECF6F4] border border-[#CFE7E2] editorial-card-lift space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs font-semibold text-[#0E6F65]">
                    <span className="inline-flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Pilar consolidado</span>
                    </span>
                    <span className="font-serif text-sm font-bold">{strongestGap[1]}%</span>
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-[#0B252E]">
                    {GAP_LABELS[strongestGap[0]]}
                  </h3>
                  <p className="text-xs text-[#4A5D64] leading-relaxed">
                    Demuestras criterio consistente al integrar hallazgos semiologicos con la conducta clinica.
                  </p>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-[#FDF7E7] border border-[#EFE0B9] editorial-card-lift space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs font-semibold text-[#9A6B1F]">
                    <span className="inline-flex items-center gap-2">
                      <Brain className="w-4 h-4 shrink-0" />
                      <span>Segunda area por nivelar</span>
                    </span>
                    <span className="font-serif text-sm font-bold">{secondWeakestGap[1]}%</span>
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-[#0B252E]">
                    {GAP_LABELS[secondWeakestGap[0]]}
                  </h3>
                  <p className="text-xs text-[#4A5D64] leading-relaxed">
                    Tu desempeno inicial muestra margen amplio de crecimiento. Hemos ajustado la dificultad a Nivel 1 fundacional.
                  </p>
                </div>
              )}

              {/* Card 3: Adaptive Next Step */}
              <div
                onClick={handlePrimaryRouteAction}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handlePrimaryRouteAction();
                  }
                }}
                className="p-5 rounded-2xl bg-[#F2F7F6] border border-[#D5E5E1] hover:border-[#0E6F65] cursor-pointer editorial-card-lift space-y-2"
              >
                <div className="flex items-center justify-between gap-2 text-xs font-semibold text-[#0E6F65]">
                  <span className="inline-flex items-center gap-2">
                    <Target className="w-4 h-4 shrink-0" />
                    <span>Siguiente paso sugerido</span>
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-[#0B252E]">
                  {spacedItems.length > 0
                    ? `Resolver repaso prioritario (${spacedItems.length})`
                    : 'Microaprendizaje + estacion'}
                </h3>
                <p className="text-xs text-[#4A5D64] leading-relaxed">
                  {spacedItems.length > 0
                    ? `Practica "${spacedItems[0].case_title}" para elevar tus indicadores en tiempo real.`
                    : 'Revisa la ficha semiologica clave y practica una nueva estacion adaptativa en tu ruta.'}
                </p>
              </div>
            </div>

            {/* 6-Step Pedagogical Route Footer */}
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
              {[
                { label: 'Evaluacion', icon: ClipboardCheck, active: true },
                { label: 'Brecha', icon: AlertTriangle, active: true },
                { label: 'Feedback', icon: CheckCircle2, active: true },
                { label: 'Aprendizaje', icon: BookOpen, active: spacedItems.length > 0 || totalCompletedCases > 0 },
                { label: 'Practica', icon: Stethoscope, active: totalCompletedCases > 0 },
                { label: 'Reevaluacion', icon: BarChart3, active: totalCompletedCases >= 3 },
              ].map((step) => {
                const StepIcon = step.icon;
                return (
                  <div
                    key={step.label}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl border transition-colors ${
                      step.active
                        ? 'bg-[#F7FAF9] border-[#CFE7E2]'
                        : 'bg-[#FDFCFA] border-[#EDF2F0]'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        step.active
                          ? 'bg-[#0E6F65] text-white'
                          : 'bg-[#F2F7F6] text-[#4A5D64]'
                      }`}
                    >
                      <StepIcon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium text-[#0B252E]">
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* 2. Student Metrics Row */}
      <section aria-label="Indicadores de avance">
        <BentoStats
          level={userLevel}
          xp={userXP}
          streakDays={streakDays}
          pendingReviewsCount={spacedItems.length}
          stageName={user?.academic_year || user?.stage}
          isDiagnosticCompleted={isDiagnosticCompleted}
          overallScore={rawRouteScore}
        />
      </section>

      {/* 2B. Longitudinal Time-Passage Simulator for Single-Session Exposition */}
      <TimePassageSimulator
        simulatedDays={simulatedDaysElapsed}
        simulatedDateIso={dashboard?.simulated_date_iso}
        isDiagnosticCompleted={isDiagnosticCompleted}
        onSimulateDays={handleSimulateDays}
      />

      {/* 3. Two-Column Section: Animated Red-to-Teal Competency Radar + Adaptive Spaced Repetition */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="rounded-3xl bg-white border border-[#DCE5E3] p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-[#EDF2F0] mb-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-[#0E6F65] font-semibold">
                Perfil de competencias
              </p>
              <h2 className="font-serif text-lg sm:text-xl font-semibold text-[#0B252E] mt-0.5">
                Equilibrio de razonamiento clinico
              </h2>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-[#6B7D83] block">
                Estado actual
              </span>
              <span
                className={`font-serif text-base font-semibold ${
                  !isDiagnosticCompleted ? 'text-[#6B7D83]' : routeTone.textClass
                }`}
              >
                {isDiagnosticCompleted ? `${animatedRouteScore}% global` : 'Sin evaluar'}
              </span>
            </div>
          </div>

          {isDiagnosticCompleted ? (
            <div className="py-1">
              <CompetencyRadar scores={radarScores} size={350} />
            </div>
          ) : (
            <div className="py-12 px-5 text-center space-y-4 my-auto">
              <div className="w-12 h-12 rounded-full bg-[#F2F7F6] border border-[#DCE5E3] flex items-center justify-center text-[#0E6F65] mx-auto">
                <Brain className="w-5 h-5" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="font-serif text-lg font-semibold text-[#0B252E]">
                  Mapa de competencias pendiente de calibracion
                </h3>
                <p className="text-xs sm:text-sm text-[#4A5D64] leading-relaxed">
                  Tus porcentajes por eje cognitivo apareceran aqui inmediatamente despues de
                  completar tu evaluacion diagnostica inicial.
                </p>
              </div>
              <button
                type="button"
                onClick={onStartDiagnostic}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#ECF6F4] hover:bg-[#DFEFEA] text-[#0E6F65] text-xs font-semibold transition-colors"
              >
                <span>Iniciar evaluacion inicial</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <SpacedRepetitionQueue
          items={spacedItems}
          onReview={onSelectCase}
          overallScore={rawRouteScore}
          aptitudeStatus={aptitudeStatus}
          isDiagnosticCompleted={isDiagnosticCompleted}
          onStartDiagnostic={onStartDiagnostic}
          className="h-full"
        />
      </section>

      {/* 4. Clinical Worlds Grid */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-3 border-b border-[#E2ECE9]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#ECF6F4] flex items-center justify-center text-[#0E6F65]">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#0B252E]">
                Mundos clinicos por especialidad
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7D83]">
                Selecciona una especialidad para practicar casos clinicos estructurados en tres estaciones
              </p>
            </div>
          </div>

          <span className="text-xs text-[#6B7D83]">
            {specialties.length} especialidades disponibles
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {specialties.map((spec) => {
            const mastery = masteriesMap.get(spec.id.toLowerCase());
            return (
              <SpecialtyCard
                key={spec.id}
                specialty={spec}
                mastery={mastery}
                isDiagnosticCompleted={isDiagnosticCompleted}
                onSelect={handleEnterSpecialty}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
