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
    cases_completed: 3,
    total_cases: 8,
  },
];

const DEFAULT_SPACED_REPETITIONS: SpacedRepetitionItem[] = [
  {
    case_id: 'case-nefro-001',
    case_title: 'Sindrome Uremico y Trastorno del Potasio en Emergencia',
    specialty_name: 'Nefrologia',
    cycle: 'D7',
    scheduled_date: new Date().toISOString(),
    is_overdue: true,
    gap_type: 'GAP_INITIAL_MANAGEMENT',
  },
  {
    case_id: 'case-endo-002',
    case_title: 'Cetoacidosis Diabetica Severa con Hipokalemia Inicial',
    specialty_name: 'Endocrinologia',
    cycle: 'D21',
    scheduled_date: new Date().toISOString(),
    is_overdue: false,
    gap_type: 'GAP_DIAGNOSTIC_REASONING',
  },
  {
    case_id: 'case-neuro-003',
    case_title: 'Deficit Focal Agudo y Ventana Terapeutica Trombolitica',
    specialty_name: 'Neurologia',
    cycle: 'D7',
    scheduled_date: new Date().toISOString(),
    is_overdue: false,
    gap_type: 'GAP_TRIAGE_SEVERITY',
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
  className = '',
}) => {
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false);
  const [dashboard, setDashboard] = useState<LevelingDashboard | null>(null);
  const [specialties, setSpecialties] = useState<Specialty[]>(DEFAULT_SPECIALTIES);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Parallel fetch from backend APIs
      const [dashRes, specsRes] = await Promise.allSettled([
        levelingApi.getDashboard(),
        specialtiesApi.getAll(),
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value) {
        setDashboard(dashRes.value);
      } else {
        setIsUsingFallback(true);
      }

      if (specsRes.status === 'fulfilled' && specsRes.value && specsRes.value.length > 0) {
        setSpecialties(specsRes.value);
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

  // Compute values from API or fallback
  const radarScores: Record<CognitiveGapTag, number> =
    dashboard?.cognitive_gap_radar || DEFAULT_RADAR_SCORES;

  const userLevel: CompetencyLevel =
    dashboard?.current_level || user?.current_level || 'Nivel 2';

  const userXP: number =
    dashboard?.total_xp ?? user?.experience_points ?? user?.xp ?? 1450;

  const streakDays: number =
    dashboard?.streak_days ?? user?.streak_days ?? 5;

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

  // Calculate weakest and strongest gap
  const gapEntries = Object.entries(radarScores) as [CognitiveGapTag, number][];
  const strongestGap = gapEntries.reduce(
    (prev, curr) => (curr[1] > prev[1] ? curr : prev),
    gapEntries[0]
  );
  const weakestGap = gapEntries.reduce(
    (prev, curr) => (curr[1] < prev[1] ? curr : prev),
    gapEntries[0]
  );

  const studentName = user?.full_name || 'Dr. Matias Rivera';
  const universityHospital =
    user?.university || 'Universidad Peruana Cayetano Heredia - Hospital Cayetano Heredia';

  return (
    <div className={`space-y-8 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 ${className}`}>
      {/* Top Banner: Welcome doctor & shift status */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-clinical-surface via-clinical-surface/95 to-slate-900 border border-clinical-border p-6 md:p-8 backdrop-blur-md shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-clinical-teal/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-clinical-cyan/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-clinical-teal/20 border border-clinical-teal/40 font-mono text-xs font-semibold text-clinical-teal-light flex items-center gap-1.5">
                <Hospital className="w-3.5 h-3.5" />
                <span>Guardia de Medicina Interna / UPCH</span>
              </span>

              <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 font-mono text-xs text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Simulador Activo</span>
              </span>

              {isUsingFallback && (
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  Modo Demostracion Local
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Bienvenido, {studentName}
            </h1>

            <p className="text-xs sm:text-sm text-gray-400 max-w-2xl leading-relaxed">
              {universityHospital}. Tu desempeno diagnostico esta siendo
              calibrado en tiempo real por el motor OCRI para optimizar tu curva
              de preparacion ENAM y Residentado Medico.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={fetchDashboardData}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-lg bg-clinical-surface border border-clinical-border hover:border-clinical-cyan/50 text-gray-300 hover:text-white text-xs font-mono flex items-center gap-2 transition-all"
              title="Actualizar telemetria"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-clinical-cyan' : ''}`}
              />
              <span>Sincronizar</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectSpecialty('nefrologia')}
              className="px-4 py-2 rounded-lg bg-clinical-teal hover:bg-clinical-teal-hover text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-[0_0_16px_rgba(13,102,93,0.5)]"
            >
              <Activity className="w-4 h-4" />
              <span>Entrar a Guardia de Turno</span>
            </button>
          </div>
        </div>
      </section>

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
        <div className="rounded-xl bg-clinical-surface/90 border border-clinical-border p-5 backdrop-blur-md flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-clinical-border mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-clinical-cyan">
                  Motor Analitico OCRI
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-clinical-cyan/30 bg-clinical-cyan/10 text-clinical-cyan">
                  4 Brechas Cognitivas
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-1">
                Radar de Competencia Clinica
              </h2>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono text-gray-400 block">
                MEDIA GLOBAL
              </span>
              <span className="text-base font-mono font-bold text-clinical-teal-light">
                {Math.round(
                  ((radarScores.GAP_TRIAGE_SEVERITY ?? 0) +
                    (radarScores.GAP_DIAGNOSTIC_REASONING ?? 0) +
                    (radarScores.GAP_LAB_INTERPRETATION ?? 0) +
                    (radarScores.GAP_INITIAL_MANAGEMENT ?? 0)) /
                    4
                )}
                %
              </span>
            </div>
          </div>

          {/* SVG Radar */}
          <div className="py-2">
            <CompetencyRadar scores={radarScores} size={360} />
          </div>

          {/* Summary of weakest vs strongest clinical gap */}
          <div className="mt-4 pt-4 border-t border-clinical-border grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Strongest */}
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="text-[10px] uppercase font-mono font-semibold text-emerald-400 tracking-wider">
                  Fortaleza Clinica
                </div>
                <div className="font-semibold text-white truncate">
                  {GAP_LABELS[strongestGap[0]]}
                </div>
                <div className="text-gray-300 font-mono text-[11px]">
                  Precision: {strongestGap[1]}%
                </div>
              </div>
            </div>

            {/* Weakest */}
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="text-[10px] uppercase font-mono font-semibold text-amber-400 tracking-wider">
                  Foco de Refuerzo
                </div>
                <div className="font-semibold text-white truncate">
                  {GAP_LABELS[weakestGap[0]]}
                </div>
                <div className="text-gray-300 font-mono text-[11px]">
                  Precision: {weakestGap[1]}% (Prioridad)
                </div>
              </div>
            </div>
          </div>

          {/* Actionable recommendation */}
          <div className="mt-3 p-2.5 rounded-lg bg-black/30 border border-white/5 text-[11px] text-gray-400 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-clinical-cyan shrink-0" />
            <span>
              El algoritmo inyectara mas estaciones de{' '}
              <strong className="text-white font-medium">
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
            className="h-full shadow-lg"
          />
        </div>
      </section>

      {/* Bottom Section: Clinical Worlds (Specialties) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-clinical-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-clinical-cyan/10 border border-clinical-cyan/30 flex items-center justify-center text-clinical-cyan">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Mundos Clinicos (Especialidades Medicas)
              </h2>
              <p className="text-xs text-gray-400">
                Exploracion modular de casos estructurados bajo simulacion de guardia hospitalaria
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
            <Sparkles className="w-3.5 h-3.5 text-clinical-cyan" />
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
