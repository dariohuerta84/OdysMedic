import React from 'react';
import {
  Check,
  Lock,
  ArrowRight,
  AlertTriangle,
  Activity,
  Award,
  ClipboardCheck,
} from 'lucide-react';
import type {
  ProgressiveLearningPath,
  LearningPathNode,
  LearningPathUnit,
} from '../../types/api';

export interface ClinicalLearningPathProps {
  learningPath?: ProgressiveLearningPath | null;
  isDiagnosticCompleted: boolean;
  onSelectNode: (caseId: string, stationId: number) => void;
  onStartDiagnostic?: () => void;
  className?: string;
}

const NodeProgressRing: React.FC<{
  status: LearningPathNode['status'];
  recallProbability: number;
  isCheckpoint: boolean;
}> = ({ status, recallProbability, isCheckpoint }) => {
  const radius = 15;
  const circumference = 2 * Math.PI * radius;
  const progressRatio =
    status === 'completed'
      ? 1
      : status === 'locked'
        ? 0
        : Math.max(0.18, Math.min(1, recallProbability));
  const strokeDashoffset = circumference * (1 - progressRatio);

  const ringColor =
    status === 'completed'
      ? '#0E6F65'
      : status === 'needs_review'
        ? recallProbability < 0.5
          ? '#A6262E'
          : '#9A6B1F'
        : status === 'active'
          ? '#0E6F65'
          : '#DEDBD2';

  return (
    <div className="relative w-9 h-9 flex items-center justify-center shrink-0 bg-[#FAF9F6]">
      <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke="#E6E3DA"
          strokeWidth="1.75"
        />
        {status !== 'locked' && (
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth="2.25"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />
        )}
      </svg>

      <span className="absolute inset-0 flex items-center justify-center">
        {status === 'completed' ? (
          <span className="w-6 h-6 bg-[#0E6F65] text-[#FAF9F6] flex items-center justify-center">
            {isCheckpoint ? <Award className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
          </span>
        ) : status === 'needs_review' ? (
          <AlertTriangle
            className={`w-3.5 h-3.5 ${
              recallProbability < 0.5 ? 'text-[#A6262E]' : 'text-[#9A6B1F]'
            }`}
          />
        ) : status === 'active' ? (
          <Activity className="w-3.5 h-3.5 text-[#0E6F65]" />
        ) : (
          <Lock className="w-3 h-3 text-[#64767E]" />
        )}
      </span>
    </div>
  );
};

export const ClinicalLearningPath: React.FC<ClinicalLearningPathProps> = ({
  learningPath,
  isDiagnosticCompleted,
  onSelectNode,
  onStartDiagnostic,
  className = '',
}) => {
  const units: LearningPathUnit[] = learningPath?.units || [];
  const totalNodes = learningPath?.total_nodes ?? 20;
  const completedNodes = learningPath?.completed_nodes ?? 0;

  return (
    <section
      aria-label="Ruta Clinica Progresiva OCRI-HLR"
      className={`space-y-8 ${className}`}
    >
      {/* Editorial Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#0D1F26] pb-4">
        <div className="space-y-1">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#0E6F65]">
            Ruta Clinica Progresiva · HLR + Goldilocks IRT
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0D1F26]">
            Unidades secuenciales por especialidad
          </h2>
        </div>

        <div className="flex items-baseline gap-4 telemetry-mono text-xs text-[#3D525A]">
          <div>
            <span className="text-[#64767E] uppercase tracking-wider mr-1.5">Avance</span>
            <span className="text-sm font-semibold text-[#0D1F26]">
              {completedNodes}/{totalNodes} nodos
            </span>
          </div>
          {learningPath?.hlr_summary && (
            <div className="border-l border-[#DEDBD2] pl-4">
              <span className="text-[#64767E] uppercase tracking-wider mr-1.5">Retencion media</span>
              <span
                className={`text-sm font-semibold ${
                  learningPath.hlr_summary.average_recall_probability < 0.72
                    ? 'text-[#A6262E]'
                    : 'text-[#0E6F65]'
                }`}
              >
                {Math.round(learningPath.hlr_summary.average_recall_probability * 100)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Pre-Diagnostic Gate Notice */}
      {!isDiagnosticCompleted && (
        <div className="p-6 bg-[#FBF5E8] border border-[#9A6B1F]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#9A6B1F]">
              Calibracion basal requerida
            </p>
            <h3 className="font-serif text-lg font-bold text-[#0D1F26]">
              Completa el examen diagnostico para desbloquear tu ruta adaptativa
            </h3>
            <p className="text-xs sm:text-sm text-[#3D525A]">
              Tu puntaje inicial fija la vida media de memoria (h₀) y reordena las 5 unidades
              colocando tus brechas criticas al frente.
            </p>
          </div>
          {onStartDiagnostic && (
            <button
              type="button"
              onClick={onStartDiagnostic}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#0E6F65] hover:bg-[#0A564E] text-[#FAF9F6] text-xs sm:text-sm font-medium shrink-0 transition-colors"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Rendir calibracion</span>
            </button>
          )}
        </div>
      )}

      {/* Units Ledger */}
      <div className="divide-y divide-[#DEDBD2] border-b border-[#DEDBD2]">
        {units.map((unit) => {
          const recallPct = Math.round(unit.recall_probability * 100);
          const isLowRecall = isDiagnosticCompleted && unit.recall_probability < 0.72;
          const recallTone =
            !isDiagnosticCompleted
              ? '#64767E'
              : recallPct < 55
                ? '#A6262E'
                : recallPct < 75
                  ? '#9A6B1F'
                  : '#0E6F65';

          return (
            <article
              key={unit.specialty}
              className="py-7 first:pt-2 space-y-5 scroll-editorial-reveal"
            >
              {/* Unit Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 telemetry-mono text-[11px] uppercase tracking-[0.14em]">
                    <span className="text-[#0E6F65] font-semibold">
                      Unidad {String(unit.unit_index).padStart(2, '0')}
                    </span>
                    {unit.is_priority && isDiagnosticCompleted && (
                      <>
                        <span className="text-[#DEDBD2]">|</span>
                        <span className="text-[#9A6B1F] font-semibold">Prioridad activa</span>
                      </>
                    )}
                    <span className="text-[#DEDBD2]">|</span>
                    <span className="text-[#64767E]">{unit.goldilocks_tier}</span>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0D1F26]">
                    {unit.specialty_name}
                  </h3>
                </div>

                {/* HLR Memory Telemetry */}
                <div className="w-full md:w-64 space-y-1.5">
                  <div className="flex items-center justify-between telemetry-mono text-[11px]">
                    <span className="text-[#64767E]">
                      h = {unit.half_life_days.toFixed(1)}d · rev {unit.hlr_next_review_days}d
                    </span>
                    <span style={{ color: recallTone }} className="font-semibold">
                      p = {recallPct}%
                    </span>
                  </div>
                  <div className="w-full h-1 bg-[#E6E3DA] overflow-hidden">
                    <div
                      className="h-full transition-all duration-700 ease-out"
                      style={{
                        width: `${isDiagnosticCompleted ? recallPct : 0}%`,
                        backgroundColor: recallTone,
                      }}
                    />
                  </div>
                  {isLowRecall && (
                    <p className="font-mono text-[10px] uppercase tracking-wider text-[#A6262E]">
                      Decaimiento HLR detectado · rescate recomendado
                    </p>
                  )}
                </div>
              </div>

              {/* 4 Sequential Nodes along 1px Clinical Spine */}
              <div className="relative pl-12 space-y-1">
                <div
                  className="absolute left-[17px] top-4 bottom-4 w-px bg-[#DEDBD2]"
                  aria-hidden="true"
                />

                {unit.nodes.map((node) => {
                  const isLocked = node.status === 'locked';
                  const isCheckpoint = node.node_type === 'checkpoint';
                  const isNeedsReview = node.status === 'needs_review';
                  const isActive = node.status === 'active';

                  const handleClick = () => {
                    if (!isDiagnosticCompleted) {
                      onStartDiagnostic?.();
                      return;
                    }
                    if (isLocked) return;
                    onSelectNode(node.case_id, node.station_id);
                  };

                  return (
                    <div
                      key={node.node_id}
                      className={`relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 px-4 border transition-colors ${
                        isNeedsReview
                          ? 'bg-[#FBF0F0]/70 border-[#A6262E]/35 hover:border-[#A6262E]'
                          : isActive
                            ? 'bg-white border-[#0E6F65]/60 hover:border-[#0E6F65]'
                            : node.status === 'completed'
                              ? 'bg-[#F3F1EC]/50 border-[#DEDBD2] hover:border-[#0E6F65]/50'
                              : 'bg-transparent border-transparent opacity-65'
                      }`}
                    >
                      {/* Ring on Vertical Spine */}
                      <div className="absolute -left-12 top-1/2 -translate-y-1/2">
                        <NodeProgressRing
                          status={node.status}
                          recallProbability={node.recall_probability}
                          isCheckpoint={isCheckpoint}
                        />
                      </div>

                      <div className="space-y-0.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span className="telemetry-mono text-[11px] text-[#64767E]">
                            {String(unit.unit_index).padStart(2, '0')}.{node.order}
                          </span>
                          <span className="text-sm font-semibold text-[#0D1F26]">
                            {node.title}
                          </span>
                        </div>
                        <p className="telemetry-mono text-[11px] text-[#64767E]">
                          {node.difficulty_label} · +{node.xp_reward} XP
                          {isCheckpoint && isLocked
                            ? ' · Requiere aprobar estaciones 1–3'
                            : ''}
                        </p>
                      </div>

                      <div className="shrink-0">
                        {isLocked ? (
                          <span className="telemetry-mono text-[11px] uppercase tracking-wider text-[#64767E]">
                            Bloqueado
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleClick}
                            className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium transition-colors ${
                              isNeedsReview
                                ? 'bg-[#A6262E] hover:bg-[#8A1E25] text-[#FAF9F6]'
                                : isActive
                                  ? 'bg-[#0E6F65] hover:bg-[#0A564E] text-[#FAF9F6]'
                                  : 'border border-[#DEDBD2] bg-white hover:border-[#0E6F65] text-[#0D1F26]'
                            }`}
                          >
                            <span>
                              {isNeedsReview
                                ? 'Rescatar retencion'
                                : isActive
                                  ? 'Iniciar estacion'
                                  : 'Repasar'}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default ClinicalLearningPath;
