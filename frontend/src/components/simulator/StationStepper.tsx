import React from 'react';
import { Check, Target } from 'lucide-react';
import type { CognitiveGapTag } from '../../types/api';
import { CognitiveGapBadge } from '../common/CognitiveGapBadge';

export interface StationStepperProps {
  currentStation: number;
  totalStations: number;
  completedStations: number[];
  competencyFocus?: string;
  className?: string;
}

interface StationInfo {
  number: number;
  levelTitle: string;
  description: string;
  defaultGap: CognitiveGapTag;
}

const DEFAULT_STATIONS_META: StationInfo[] = [
  {
    number: 1,
    levelTitle: 'Fundacional',
    description: 'Triaje y Reconocimiento de Gravedad',
    defaultGap: 'GAP_TRIAGE_SEVERITY',
  },
  {
    number: 2,
    levelTitle: 'Intermedio',
    description: 'Razonamiento Diagnostico Diferencial',
    defaultGap: 'GAP_DIAGNOSTIC_REASONING',
  },
  {
    number: 3,
    levelTitle: 'Avanzado',
    description: 'Manejo Farmacologico y Procedimientos de Emergencia',
    defaultGap: 'GAP_INITIAL_MANAGEMENT',
  },
];

export const StationStepper: React.FC<StationStepperProps> = ({
  currentStation,
  totalStations = 3,
  completedStations = [],
  competencyFocus,
  className = '',
}) => {
  // Normalize station numbers 1 to totalStations
  const stationsList: StationInfo[] = Array.from(
    { length: Math.max(totalStations, 3) },
    (_, idx) => {
      const stationNum = idx + 1;
      const meta = DEFAULT_STATIONS_META[idx];
      return (
        meta || {
          number: stationNum,
          levelTitle: `Estacion ${stationNum}`,
          description: 'Evaluacion de Competencia Clinica',
          defaultGap: 'GAP_DIAGNOSTIC_REASONING',
        }
      );
    }
  );

  const currentMeta =
    stationsList.find((s) => s.number === currentStation) || stationsList[0];

  // Check if competencyFocus matches a CognitiveGapTag
  const isRecognizedGap =
    competencyFocus === 'GAP_TRIAGE_SEVERITY' ||
    competencyFocus === 'GAP_DIAGNOSTIC_REASONING' ||
    competencyFocus === 'GAP_LAB_INTERPRETATION' ||
    competencyFocus === 'GAP_INITIAL_MANAGEMENT';

  const activeGapTag: CognitiveGapTag = isRecognizedGap
    ? (competencyFocus as CognitiveGapTag)
    : currentMeta.defaultGap;

  return (
    <div
      className={`rounded-2xl bg-clinical-surface/90 border border-clinical-border p-4 sm:p-5 backdrop-blur-md shadow-lg ${className}`}
      aria-label="Progreso de Estaciones Clinicas"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Stepper Dots & Connector Line */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1">
          {stationsList.map((station, index) => {
            const isCompleted = completedStations.includes(station.number);
            const isCurrent = currentStation === station.number;

            return (
              <React.Fragment key={station.number}>
                {/* Station Node */}
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-mono text-xs font-bold border-2 transition-all ${
                      isCompleted
                        ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                        : isCurrent
                          ? 'bg-clinical-cyan/15 border-clinical-cyan text-clinical-cyan animate-pulse-subtle shadow-[0_0_18px_rgba(6,182,212,0.45)] ring-2 ring-clinical-cyan/30'
                          : 'bg-slate-900/80 border-slate-800 text-slate-500'
                    }`}
                    title={`Estacion ${station.number}: ${station.levelTitle}`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5 stroke-[2.5]" />
                    ) : (
                      <span>{station.number}</span>
                    )}
                  </div>

                  <div className="hidden sm:block text-left">
                    <span
                      className={`text-[10px] font-mono uppercase tracking-wider block ${
                        isCurrent
                          ? 'text-clinical-cyan font-bold'
                          : isCompleted
                            ? 'text-emerald-400'
                            : 'text-gray-500'
                      }`}
                    >
                      Estacion {station.number}
                    </span>
                    <span
                      className={`text-xs font-semibold truncate max-w-[130px] block ${
                        isCurrent
                          ? 'text-white'
                          : isCompleted
                            ? 'text-gray-300'
                            : 'text-gray-500'
                      }`}
                    >
                      {station.levelTitle}
                    </span>
                  </div>
                </div>

                {/* Connector Line */}
                {index < stationsList.length - 1 && (
                  <div className="flex-1 h-0.5 bg-slate-800 relative">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isCompleted
                          ? 'bg-emerald-500/80 w-full'
                          : isCurrent
                            ? 'bg-clinical-cyan/60 w-1/2'
                            : 'w-0'
                      }`}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Current Station Focus & Competency Badge */}
        <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
            <Target className="w-3.5 h-3.5 text-clinical-cyan shrink-0" />
            <span className="hidden lg:inline">Foco Evaluado:</span>
          </div>

          <CognitiveGapBadge
            gapTag={activeGapTag}
            size="sm"
            className="shadow-sm"
          />

          {competencyFocus && !isRecognizedGap && (
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-white/5 border border-white/10 text-gray-300 max-w-xs truncate">
              {competencyFocus}
            </span>
          )}
        </div>
      </div>

      {/* Subtitle description for mobile view */}
      <div className="mt-3 sm:hidden pt-2 border-t border-white/5 flex items-center justify-between text-xs">
        <span className="text-gray-400 font-mono">
          Estacion {currentStation} de {totalStations}:
        </span>
        <span className="font-semibold text-white">
          {currentMeta.levelTitle} - {currentMeta.description}
        </span>
      </div>
    </div>
  );
};

export default StationStepper;