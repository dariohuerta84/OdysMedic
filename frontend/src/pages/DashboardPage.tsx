import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ClipboardCheck,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { levelingApi } from '../services/api';
import type {
  LevelingDashboard,
  CognitiveGapTag,
  SpacedRepetitionItem,
  CompetencyLevel,
  SimulateDaysMode,
  SimulateDaysResponse,
  ProgressiveLearningPath,
} from '../types/api';
import {
  CompetencyRadar,
  BentoStats,
  SpacedRepetitionQueue,
  TimePassageSimulator,
  ClinicalLearningPath,
} from '../components/dashboard';

export interface DashboardPageProps {
  onSelectSpecialty: (specialtyId: string) => void;
  onSelectCase: (caseId: string, stationNumber?: number) => void;
  onStartDiagnostic?: () => void;
  className?: string;
}

const DEFAULT_RADAR_SCORES: Record<CognitiveGapTag, number> = {
  GAP_TRIAGE_SEVERITY: 50,
  GAP_DIAGNOSTIC_REASONING: 50,
  GAP_LAB_INTERPRETATION: 50,
  GAP_INITIAL_MANAGEMENT: 50,
};

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
  nefrologia: 'Nefrologia y Medio Interno',
  endocrinologia: 'Endocrinologia y Metabolismo',
  neurologia: 'Neurologia Clinica',
  reumatologia: 'Reumatologia e Inmunologia',
  oftalmologia: 'Oftalmologia Clinica',
};

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onSelectSpecialty,
  onSelectCase,
  onStartDiagnostic,
  className = '',
}) => {
  const { user, refreshUser } = useAuth();
  const [dashboard, setDashboard] = useState<LevelingDashboard | null>(null);
  const [fallbackPath, setFallbackPath] = useState<ProgressiveLearningPath | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchDashboardData = async () => {
      try {
        const dashData = await levelingApi.getDashboard();
        if (!mounted) return;
        setDashboard(dashData);
        if (!dashData.learning_path) {
          const lp = await levelingApi.getLearningPath();
          if (mounted) setFallbackPath(lp);
        }
      } catch (err) {
        console.error('[OdyssMedic Dashboard] Failed to load dashboard:', err);
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
  const diagnosticScore = dashboard?.diagnostic_score ?? user?.diagnostic_score ?? null;
  const aptitudeStatus = dashboard?.aptitude_status ?? user?.aptitude_status ?? null;
  const radarScores: Record<CognitiveGapTag, number> =
    dashboard?.cognitive_gap_radar || DEFAULT_RADAR_SCORES;
  const userLevel: CompetencyLevel =
    dashboard?.current_level || user?.current_level || 'Nivel 1';
  const userXP: number = dashboard?.total_xp ?? user?.experience_points ?? user?.xp ?? 0;
  const streakDays: number = dashboard?.streak_days ?? user?.streak_days ?? 0;
  const spacedItems: SpacedRepetitionItem[] =
    dashboard?.pending_spaced_repetitions || [];
  const simulatedDaysElapsed = dashboard?.simulated_days_elapsed ?? 0;
  const learningPath = dashboard?.learning_path || fallbackPath || null;
  const hlrSummary = dashboard?.hlr_summary || learningPath?.hlr_summary || null;

  const totalCompletedCases = (dashboard?.specialty_masteries || []).reduce(
    (acc, m) => acc + (m.cases_completed || 0),
    0
  );

  const rawRouteScore = !isDiagnosticCompleted
    ? 0
    : simulatedDaysElapsed > 0 && typeof dashboard?.ocri_score === 'number'
      ? Math.round(dashboard.ocri_score)
      : totalCompletedCases > 0 && typeof dashboard?.ocri_score === 'number'
        ? Math.round(
            0.45 * (diagnosticScore ?? dashboard.ocri_score) + 0.55 * dashboard.ocri_score
          )
        : Math.round(diagnosticScore ?? dashboard?.ocri_score ?? 0);

  const sortedGapEntries = (
    Object.entries(radarScores) as [CognitiveGapTag, number][]
  ).sort((a, b) => a[1] - b[1]);
  const weakestGap = sortedGapEntries[0];

  const firstName = (user?.full_name || 'Estudiante')
    .replace(/^Dr\.?\s+/i, '')
    .split(' ')[0];
  const activeWorldKey =
    dashboard?.diagnostic_specialty ||
    user?.diagnostic_specialty ||
    dashboard?.initial_world ||
    user?.initial_world ||
    'medicina_interna';
  const activeWorldLabel = WORLD_LABELS[activeWorldKey] || 'Medicina Interna';
  const academicSubtitle = [
    user?.career || 'Medicina Humana',
    user?.academic_year || user?.stage,
    user?.university,
  ]
    .filter(Boolean)
    .join(' · ');

  const handlePrimaryAction = () => {
    if (!isDiagnosticCompleted) {
      onStartDiagnostic?.();
      return;
    }
    if (learningPath?.active_node) {
      onSelectCase(learningPath.active_node.case_id, learningPath.active_node.station_id);
      return;
    }
    if (spacedItems.length > 0) {
      onSelectCase(spacedItems[0].case_id, 1);
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

  return (
    <div className={`min-h-screen bg-[#FAF9F6] text-[#0D1F26] ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
        {/* =================================================================== */}
        {/* 1. EDITORIAL HEADER + PRIMARY NEXT-NODE ACTION                      */}
        {/* =================================================================== */}
        <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#0E6F65]">
              Expediente de Progreso · {activeWorldLabel}
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0D1F26] tracking-tight">
              Ruta clinica de {firstName}
            </h1>
            <p className="text-sm text-[#3D525A]">{academicSubtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handlePrimaryAction}
              className="group inline-flex items-center gap-2.5 px-6 py-3 bg-[#0E6F65] hover:bg-[#0A564E] text-[#FAF9F6] text-sm font-medium transition-colors"
            >
              {!isDiagnosticCompleted ? (
                <>
                  <ClipboardCheck className="w-4 h-4" />
                  <span>Rendir evaluacion inicial</span>
                </>
              ) : (
                <>
                  <span>
                    {learningPath?.active_node?.status === 'needs_review'
                      ? 'Rescatar estacion prioritaria'
                      : 'Continuar siguiente estacion'}
                  </span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>
        </header>

        {/* =================================================================== */}
        {/* 2. EDITORIAL TELEMETRY STRIP (OCRI, HLR p, h, Goldilocks, XP)       */}
        {/* =================================================================== */}
        <BentoStats
          level={userLevel}
          xp={userXP}
          streakDays={streakDays}
          pendingReviewsCount={spacedItems.length}
          isDiagnosticCompleted={isDiagnosticCompleted}
          overallScore={rawRouteScore}
          hlrSummary={hlrSummary}
        />

        {/* =================================================================== */}
        {/* 3. ASYMMETRIC EDITORIAL WORKSPACE: PATH (LEFT) + TELEMETRY (RIGHT)  */}
        {/* =================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Primary Column: Duolingo-inspired Progressive Clinical Path */}
          <div className="lg:col-span-7">
            <ClinicalLearningPath
              learningPath={learningPath}
              isDiagnosticCompleted={isDiagnosticCompleted}
              onSelectNode={(cid, stId) => onSelectCase(cid, stId)}
              onStartDiagnostic={onStartDiagnostic}
            />
          </div>

          {/* Right Editorial Rail: Radar + Time Simulator + Spaced Queue */}
          <aside className="lg:col-span-5 space-y-8">
            {/* Clinical Reasoning Radar Panel */}
            <section className="border border-[#DEDBD2] bg-white p-5 sm:p-6 space-y-4">
              <div className="flex items-baseline justify-between gap-2 pb-3 border-b border-[#DEDBD2]">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#0E6F65]">
                    Taxonomia OCRI · 4 Dimensiones
                  </p>
                  <h2 className="font-serif text-lg font-bold text-[#0D1F26] mt-0.5">
                    Equilibrio de razonamiento clinico
                  </h2>
                </div>
                {isDiagnosticCompleted && (
                  <span
                    className={`telemetry-mono text-xs font-semibold ${
                      rawRouteScore < 55
                        ? 'text-[#A6262E]'
                        : rawRouteScore < 75
                          ? 'text-[#9A6B1F]'
                          : 'text-[#0E6F65]'
                    }`}
                  >
                    {rawRouteScore}%
                  </span>
                )}
              </div>

              <CompetencyRadar scores={radarScores} size={270} className="mx-auto" />

              {isDiagnosticCompleted && weakestGap && (
                <div className="pt-3 border-t border-[#DEDBD2] flex items-start gap-2.5 text-xs text-[#3D525A]">
                  <AlertTriangle
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      weakestGap[1] < 55 ? 'text-[#A6262E]' : 'text-[#9A6B1F]'
                    }`}
                  />
                  <div>
                    <span className="font-semibold text-[#0D1F26]">Brecha prioritaria: </span>
                    <span>{GAP_LABELS[weakestGap[0]]}</span>{' '}
                    <span className="telemetry-mono text-[#64767E]">({weakestGap[1]}%)</span>
                  </div>
                </div>
              )}
            </section>

            {/* Longitudinal Time Passage Simulator (synced live with HLR & Path) */}
            <TimePassageSimulator
              simulatedDays={simulatedDaysElapsed}
              simulatedDateIso={dashboard?.simulated_date_iso}
              isDiagnosticCompleted={isDiagnosticCompleted}
              onSimulateDays={handleSimulateDays}
            />

            {/* Spaced Repetition Queue */}
            <SpacedRepetitionQueue
              items={spacedItems}
              onReview={(caseId) => onSelectCase(caseId, 1)}
              overallScore={rawRouteScore}
              aptitudeStatus={aptitudeStatus}
              isDiagnosticCompleted={isDiagnosticCompleted}
              onStartDiagnostic={onStartDiagnostic}
            />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
