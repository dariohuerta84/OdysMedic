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
} from '../types/api';
import { CompetencyRadar } from '../components/dashboard/CompetencyRadar';
import { BentoStats } from '../components/dashboard/BentoStats';
import { SpecialtyCard } from '../components/dashboard/SpecialtyCard';
import { SpacedRepetitionQueue } from '../components/dashboard/SpacedRepetitionQueue';

export interface DashboardPageProps {
  onSelectSpecialty: (specialtyId: string) => void;
  onSelectCase: (caseId: string) => void;
  onStartDiagnostic?: () => void;
  className?: string;
}

const DEFAULT_RADAR_SCORES: Record<CognitiveGapTag, number> = {
  GAP_TRIAGE_SEVERITY: 75,
  GAP_DIAGNOSTIC_REASONING: 70,
  GAP_LAB_INTERPRETATION: 75,
  GAP_INITIAL_MANAGEMENT: 68,
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
    id: 'ginecologia',
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
  cirugia_general: 'Cirugia General',
  medicina_familiar: 'Medicina Familiar',
  nefrologia: 'Nefrologia',
  endocrinologia: 'Endocrinologia',
  neurologia: 'Neurologia',
  reumatologia: 'Reumatologia',
};

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onSelectSpecialty,
  onSelectCase,
  onStartDiagnostic,
  className = '',
}) => {
  const { user } = useAuth();
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

  const aptitudeLabel =
    dashboard?.aptitude_label ??
    (aptitudeStatus === 'apto'
      ? 'Apto para su etapa clinica'
      : aptitudeStatus === 'en_nivelacion'
        ? 'En nivelacion guiada (Apto condicional)'
        : aptitudeStatus === 'no_apto'
          ? 'Refuerzo prioritario recomendado'
          : 'Pendiente de evaluacion inicial');

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
  masteriesList.forEach((m) => {
    masteriesMap.set(m.specialty_id.toLowerCase(), m);
  });

  const gapEntries = Object.entries(radarScores) as [CognitiveGapTag, number][];
  const strongestGap = gapEntries.reduce(
    (prev, curr) => (curr[1] > prev[1] ? curr : prev),
    gapEntries[0]
  );
  const weakestGap = gapEntries.reduce(
    (prev, curr) => (curr[1] < prev[1] ? curr : prev),
    gapEntries[0]
  );

  const firstName = (user?.full_name || 'Estudiante')
    .replace(/^Dr\.?\s+/i, '')
    .split(' ')[0];
  const activeWorldKey =
    user?.diagnostic_specialty || user?.initial_world || 'medicina_interna';
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

  return (
    <div className={`space-y-8 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      {/* 1. Classic Editorial Welcome & Tu Ruta Clinica Summary (No Sincronizar button) */}
      <section className="rounded-3xl bg-white border border-[#DCE5E3] p-6 sm:p-8 lg:p-10 space-y-7">
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
                onClick={() => onSelectSpecialty('nefrologia')}
                className="px-6 py-3 rounded-full bg-[#0E6F65] hover:bg-[#0A564E] text-white text-xs sm:text-sm font-medium flex items-center gap-2 transition-colors shadow-xs"
              >
                <span>Comenzar siguiente estacion</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onStartDiagnostic}
                className="px-6 py-3 rounded-full bg-[#0E6F65] hover:bg-[#0A564E] text-white text-xs sm:text-sm font-medium flex items-center gap-2 transition-colors shadow-xs"
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
              className="px-6 py-3 rounded-full bg-[#0E6F65] hover:bg-[#0A564E] text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shrink-0 transition-colors"
            >
              <span>Elegir modalidad de evaluacion</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top summary row: Global performance + Active world + Aptitude status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 sm:p-5 rounded-2xl bg-[#F7FAF9] border border-[#E2ECE9]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full border-4 border-[#0E6F65] bg-white flex items-center justify-center shrink-0">
                  <span className="font-serif text-base font-bold text-[#0B252E]">
                    {diagnosticScore ?? 0}%
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#6B7D83] block">Rendimiento evaluado</span>
                  <span className="font-serif text-base font-semibold text-[#0B252E]">
                    {aptitudeLabel}
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
                <div className="w-10 h-10 rounded-xl bg-white border border-[#DCE5E3] flex items-center justify-center text-[#0E6F65] shrink-0">
                  {aptitudeStatus === 'apto' ? (
                    <ShieldCheck className="w-5 h-5 text-[#0E6F65]" />
                  ) : (
                    <Brain className="w-5 h-5 text-[#8A6116]" />
                  )}
                </div>
                <div>
                  <span className="text-xs text-[#6B7D83] block">Modalidad diagnostica</span>
                  <span className="font-serif text-base font-semibold text-[#0B252E]">
                    {user?.diagnostic_mode === 'specialty'
                      ? 'Especialidad focalizada'
                      : 'Examen General'}
                  </span>
                </div>
              </div>
            </div>

            {/* 3 Classic Pastel Diagnostic Route Cards (Matching Reference Aesthetic) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Pastel Rose: Brecha detectada */}
              <div className="p-5 rounded-2xl bg-[#FBF1F1] border border-[#EED7D7] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#9E3F42]">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Brecha prioritaria</span>
                </div>
                <h3 className="font-serif text-lg font-semibold text-[#0B252E]">
                  {GAP_LABELS[weakestGap[0]]}
                </h3>
                <p className="text-xs text-[#4A5D64] leading-relaxed">
                  Oportunidad detectada para reforzar la toma de decisiones estructurada sin presion
                  de tiempo.
                </p>
              </div>

              {/* Pastel Cream: Fortaleza / Enfoque */}
              <div className="p-5 rounded-2xl bg-[#FDF7E7] border border-[#EFE0B9] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#8A6116]">
                  <Brain className="w-4 h-4 shrink-0" />
                  <span>Pilar consolidado</span>
                </div>
                <h3 className="font-serif text-lg font-semibold text-[#0B252E]">
                  {GAP_LABELS[strongestGap[0]]}
                </h3>
                <p className="text-xs text-[#4A5D64] leading-relaxed">
                  Demuestras criterio consistente al integrar hallazgos semiologicos con la conducta
                  clinica.
                </p>
              </div>

              {/* Pastel Sage: Siguiente paso */}
              <div className="p-5 rounded-2xl bg-[#ECF6F4] border border-[#CFE7E2] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#0E6F65]">
                  <Target className="w-4 h-4 shrink-0" />
                  <span>Siguiente paso sugerido</span>
                </div>
                <h3 className="font-serif text-lg font-semibold text-[#0B252E]">
                  Microaprendizaje + estacion
                </h3>
                <p className="text-xs text-[#4A5D64] leading-relaxed">
                  Revisa la ficha semiologica clave y practica una nueva estacion adaptativa en tu
                  ruta.
                </p>
              </div>
            </div>

            {/* 6-Step Pedagogical Route Footer */}
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
              {[
                { label: 'Evaluacion', icon: ClipboardCheck, active: true },
                { label: 'Brecha', icon: AlertTriangle, active: true },
                { label: 'Feedback', icon: CheckCircle2, active: true },
                { label: 'Aprendizaje', icon: BookOpen, active: false },
                { label: 'Practica', icon: Stethoscope, active: false },
                { label: 'Reevaluacion', icon: BarChart3, active: false },
              ].map((step) => {
                const StepIcon = step.icon;
                return (
                  <div
                    key={step.label}
                    className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-[#FDFCFA] border border-[#EDF2F0]"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
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
        />
      </section>

      {/* 3. Two-Column Section: Competency Radar (Only shown when calibrated) + Spaced Repetition */}
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
                Estado
              </span>
              <span className="font-serif text-base font-semibold text-[#0E6F65]">
                {isDiagnosticCompleted ? `${diagnosticScore ?? 0}% basal` : 'Sin evaluar'}
              </span>
            </div>
          </div>

          {isDiagnosticCompleted ? (
            <div className="py-2">
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
