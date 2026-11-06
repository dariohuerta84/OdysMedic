import React, { useState, useEffect } from 'react';
import {
  Activity,
  Hospital,
  Compass,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  Sparkles,
  ClipboardCheck,
  ShieldCheck,
  Brain,
  ArrowRight,
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

// Fallback mock data when backend is unreachable
const DEFAULT_RADAR_SCORES: Record<CognitiveGapTag, number> = {
  GAP_TRIAGE_SEVERITY: 88,
  GAP_DIAGNOSTIC_REASONING: 74,
  GAP_LAB_INTERPRETATION: 82,
  GAP_INITIAL_MANAGEMENT: 65,
};

const DEFAULT_SPECIALTIES: Specialty[] = [
  {
    id: 'nefrologia',
    name: 'Nefrologia Clinica',
    description:
      'Manejo integral de injuria renal aguda (KDIGO), glomerulonefritis rapidamente progresiva y desordenes acidobasicos complejos.',
    icon: 'droplets',
    is_unlocked: true,
    case_count: 8,
  },
  {
    id: 'endocrinologia',
    name: 'Endocrinologia y Metabolismo',
    description:
      'Emergencias hiperglicemicas (CAD y EHH), tormenta tiroidea, crisis suprarrenal y desordenes hipofisiarios agudos.',
    icon: 'activity',
    is_unlocked: true,
    case_count: 10,
  },
  {
    id: 'neurologia',
    name: 'Neurologia y Neurocriticos',
    description:
      'Accidente cerebrovascular isquemico y hemorragico (tiempo-dependiente), estatus epileptico y sindrome de hipertension endocraneana.',
    icon: 'brain',
    is_unlocked: true,
    case_count: 7,
  },
  {
    id: 'reumatologia',
    name: 'Reumatologia e Inmunologia',
    description:
      'Lupus eritematoso sistemico con compromiso organico mayor, vasculitis asociadas a ANCA y artritis por microcristales.',
    icon: 'shield-alert',
    is_unlocked: true,
    case_count: 6,
  },
  {
    id: 'ginecologia',
    name: 'Ginecologia y Obstetricia Critica',
    description:
      'Trastornos hipertensivos del embarazo (preeclampsia severa), hemorragia postparto y sepsis puerperal.',
    icon: 'baby',
    is_unlocked: true,
    case_count: 8,
  },
];

const DEFAULT_MASTERIES: SpecialtyMastery[] = [
  {
    specialty_id: 'nefrologia',
    specialty_name: 'Nefrologia',
    mastery_score: 82,
    level: 'Nivel 2',
    cases_completed: 4,
    total_cases: 8,
  },
  {
    specialty_id: 'endocrinologia',
    specialty_name: 'Endocrinologia',
    mastery_score: 75,
    level: 'Nivel 2',
    cases_completed: 3,
    total_cases: 10,
  },
  {
    specialty_id: 'neurologia',
    specialty_name: 'Neurologia',
    mastery_score: 64,
    level: 'Nivel 1',
    cases_completed: 2,
    total_cases: 7,
  },
  {
    specialty_id: 'reumatologia',
    specialty_name: 'Reumatologia',
    mastery_score: 90,
    level: 'Nivel 3',
    cases_completed: 6,
    total_cases: 6,
  },
  {
    specialty_id: 'ginecologia',
    specialty_name: 'Ginecologia',
    mastery_score: 70,
    level: 'Nivel 2',
    cases_completed: 2,
    total_cases: 8,
  },
];

const DEFAULT_SPACED_REPETITIONS: SpacedRepetitionItem[] = [
  {
    case_id: 's13256-019-2334-y',
    case_title: 'Injuria Renal Aguda KDIGO 3 por AINEs en ERC',
    specialty_name: 'Nefrologia',
    cycle: 'D7',
    scheduled_date: new Date().toISOString(),
    is_overdue: false,
    gap_type: 'GAP_LAB_INTERPRETATION',
  },
  {
    case_id: 's13256-022-03392-w',
    case_title: 'Cetoacidosis Diabetica Severa con Hipokalemia',
    specialty_name: 'Endocrinologia',
    cycle: 'D21',
    scheduled_date: new Date(Date.now() - 86400000).toISOString(),
    is_overdue: true,
    gap_type: 'GAP_INITIAL_MANAGEMENT',
  },
];

const GAP_LABELS: Record<CognitiveGapTag, string> = {
  GAP_TRIAGE_SEVERITY: 'Triaje y Gravedad',
  GAP_DIAGNOSTIC_REASONING: 'Razonamiento Diagnostico',
  GAP_LAB_INTERPRETATION: 'Interpretacion de Labs',
  GAP_INITIAL_MANAGEMENT: 'Manejo Terapeutico',
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [dashData, specsData] = await Promise.allSettled([
        levelingApi.getDashboard(),
        specialtiesApi.getCatalog(),
      ]);

      if (dashData.status === 'fulfilled' && dashData.value) {
        setDashboard(dashData.value);
        setIsUsingFallback(false);
      } else {
        setIsUsingFallback(true);
      }

      if (specsData.status === 'fulfilled' && specsData.value?.length) {
        setSpecialties(specsData.value);
      } else {
        setSpecialties(DEFAULT_SPECIALTIES);
      }
    } catch {
      setIsUsingFallback(true);
      setSpecialties(DEFAULT_SPECIALTIES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
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
      ? 'Apto para el Examen / Internado'
      : aptitudeStatus === 'en_nivelacion'
        ? 'En Nivelacion (Apto Condicional)'
        : aptitudeStatus === 'no_apto'
          ? 'No Apto (Refuerzo Prioritario)'
          : 'Pendiente de Autoevaluacion');

  const radarScores: Record<CognitiveGapTag, number> =
    dashboard?.cognitive_gap_radar || DEFAULT_RADAR_SCORES;

  const userLevel: CompetencyLevel =
    dashboard?.current_level || user?.current_level || 'Nivel 1';

  const userXP: number =
    dashboard?.total_xp ?? user?.experience_points ?? user?.xp ?? 0;

  const streakDays: number =
    dashboard?.streak_days ?? user?.streak_days ?? 1;

  const spacedItems: SpacedRepetitionItem[] =
    dashboard?.pending_spaced_repetitions &&
    dashboard.pending_spaced_repetitions.length > 0
      ? dashboard.pending_spaced_repetitions
      : isUsingFallback
        ? DEFAULT_SPACED_REPETITIONS
        : [];

  const masteriesList: SpecialtyMastery[] =
    dashboard?.specialty_masteries && dashboard.specialty_masteries.length > 0
      ? dashboard.specialty_masteries
      : DEFAULT_MASTERIES;

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

  const studentName = user?.full_name || 'Dr. Medico UPCH';
  const universityHospital =
    user?.university || 'Universidad Peruana Cayetano Heredia - Hospital Cayetano Heredia';

  return (
    <div className={`space-y-8 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 ${className}`}>
      {/* Top Banner: Welcome doctor & shift status */}
      <section className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 md:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-sky-50 border border-sky-200 font-mono text-xs font-semibold text-sky-800 flex items-center gap-1.5 shadow-xs">
                <Hospital className="w-3.5 h-3.5 text-sky-600" />
                <span>Guardia de Medicina Interna / UPCH</span>
              </span>

              {isDiagnosticCompleted ? (
                <span className={`px-2.5 py-1 rounded-md border font-mono text-xs font-semibold flex items-center gap-1.5 shadow-xs ${
                  aptitudeStatus === 'apto'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : aptitudeStatus === 'en_nivelacion'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-rose-50 text-rose-800 border-rose-300'
                }`}>
                  {aptitudeStatus === 'apto' ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  ) : aptitudeStatus === 'en_nivelacion' ? (
                    <Brain className="w-3.5 h-3.5 text-amber-600" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  )}
                  <span>Diagnostico: {aptitudeLabel} ({diagnosticScore}%)</span>
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-md bg-amber-50 border border-amber-300 font-mono text-xs font-semibold text-amber-800 flex items-center gap-1.5 animate-pulse shadow-xs">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Autoevaluacion Inicial Pendiente</span>
                </span>
              )}

              {isUsingFallback && (
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 border border-slate-200 text-slate-600">
                  Modo Demostracion Local
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Bienvenido, {studentName}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              {universityHospital}. Tu desempeno diagnostico esta calibrado en
              tiempo real por el motor OCRI para optimizar tu preparacion para el ENAM
              y el Residentado Medico.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={fetchDashboardData}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-mono flex items-center gap-2 transition-all shadow-xs"
              title="Actualizar telemetria"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-sky-600' : 'text-slate-500'}`}
              />
              <span>Sincronizar</span>
            </button>

            {isDiagnosticCompleted ? (
              <button
                type="button"
                onClick={() => onSelectSpecialty('nefrologia')}
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs active:scale-95"
              >
                <Activity className="w-4 h-4" />
                <span>Entrar a Guardia de Turno</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onStartDiagnostic}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs active:scale-95 animate-bounce"
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>Rendir Autoevaluacion Diagnostica</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Mandatory Diagnostic Prompt Card if pending */}
      {!isDiagnosticCompleted && (
        <section className="p-6 rounded-2xl bg-amber-50/90 border border-amber-300 text-slate-900 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white border border-amber-300 flex items-center justify-center shrink-0 text-amber-600 shadow-xs">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-bold text-amber-950">
                Paso Requerido: Autoevaluacion Diagnostica Inicial
              </h3>
              <p className="text-xs text-amber-900 leading-relaxed max-w-2xl">
                Para que tu porcentaje de rendimiento y aptitud clinica no reflejen puntuaciones arbitrarias,
                debes rendir primero la autoevaluacion de 5 preguntas clinicas basales. Esto calibrara tu radar OCRI
                y determinara si tu estado inicial es Apto o requiere nivelacion prioritaria.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onStartDiagnostic}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs shrink-0 transition-all hover:scale-105"
          >
            <span>Iniciar Autoevaluacion (5 Casos)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      )}

      {/* Bento Grid: High-Yield Student Metrics */}
      <section aria-label="Metricas Clave del Estudiante">
        <BentoStats
          level={userLevel}
          xp={userXP}
          streakDays={streakDays}
          pendingReviewsCount={spacedItems.length}
          stageName={user?.stage || 'Internado Medico Hospitalario'}
        />
      </section>

      {/* Two-Column Section: Competency Radar (Left) + Spaced Repetition (Right) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: 4-Gap Competency Radar */}
        <div className="rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-sky-700 font-semibold">
                  Motor Analitico OCRI
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-sky-200 bg-sky-50 text-sky-800 font-semibold">
                  4 Brechas Cognitivas
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1">
                Radar de Competencia Clinica
              </h2>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-500 block uppercase font-medium">
                {isDiagnosticCompleted ? 'Rendimiento Basal' : 'Diagnostico'}
              </span>
              <span className="text-base font-mono font-bold text-sky-700">
                {isDiagnosticCompleted ? `${diagnosticScore ?? Math.round(dashboard?.ocri_score ?? 0)}%` : 'Pendiente'}
              </span>
            </div>
          </div>

          {/* SVG Radar */}
          <div className="py-2">
            <CompetencyRadar scores={radarScores} size={360} />
          </div>

          {/* Summary of weakest vs strongest clinical gap */}
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Strongest */}
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-md bg-white border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="text-[10px] uppercase font-mono font-bold text-emerald-800 tracking-wider">
                  Fortaleza Clinica
                </div>
                <div className="font-semibold text-slate-900 truncate">
                  {GAP_LABELS[strongestGap[0]]}
                </div>
                <div className="text-slate-600 font-mono text-[11px]">
                  Precision: {strongestGap[1]}%
                </div>
              </div>
            </div>

            {/* Weakest */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-md bg-white border border-amber-200 text-amber-600 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="text-[10px] uppercase font-mono font-bold text-amber-800 tracking-wider">
                  Foco de Refuerzo
                </div>
                <div className="font-semibold text-slate-900 truncate">
                  {GAP_LABELS[weakestGap[0]]}
                </div>
                <div className="text-slate-600 font-mono text-[11px]">
                  Precision: {weakestGap[1]}% (Prioridad)
                </div>
              </div>
            </div>
          </div>

          {/* Actionable recommendation */}
          <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-sky-600 shrink-0" />
            <span>
              El algoritmo inyectara mas estaciones de{' '}
              <strong className="text-slate-900 font-semibold">
                {GAP_LABELS[weakestGap[0]]}
              </strong>{' '}
              para acelerar tu ascenso de nivel.
            </span>
          </div>
        </div>

        {/* Right Column: Spaced Repetition Queue */}
        <div className="h-full">
          <SpacedRepetitionQueue
            items={spacedItems}
            onReview={onSelectCase}
            className="h-full shadow-xs"
          />
        </div>
      </section>

      {/* Bottom Section: Clinical Worlds (Specialties) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 shadow-xs">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Mundos Clinicos (Especialidades Medicas)
              </h2>
              <p className="text-xs text-slate-500">
                Exploracion modular de casos estructurados bajo simulacion de guardia hospitalaria
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>{specialties.length} especialidades disponibles</span>
          </div>
        </div>

        {/* Specialties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {specialties.map((spec) => {
            const mastery = masteriesMap.get(spec.id.toLowerCase());
            return (
              <SpecialtyCard
                key={spec.id}
                specialty={spec}
                mastery={mastery}
                onSelect={onSelectSpecialty}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
