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
    description: 'Triaje y reconocimiento de gravedad',
    defaultGap: 'GAP_TRIAGE_SEVERITY',
  },
  {
    number: 2,
    levelTitle: 'Intermedio',
    description: 'Razonamiento diagnostico diferencial',
    defaultGap: 'GAP_DIAGNOSTIC_REASONING',
  },
  {
    number: 3,
    levelTitle: 'Avanzado',
    description: 'Manejo terapeutico y procedimientos',
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
  const stationsList: StationInfo[] = Array.from(
    { length: Math.max(totalStations, 3) },
    (_, idx) => {
      const stationNum = idx + 1;
      const meta = DEFAULT_STATIONS_META[idx];
      return (
        meta || {
          number: stationNum,
          levelTitle: `Estacion ${stationNum}`,
          description: 'Evaluacion de competencia clinica',
          defaultGap: 'GAP_DIAGNOSTIC_REASONING',
        }
      );
    }
  );

  const currentMeta =
    stationsList.find((s) => s.number === currentStation) || stationsList[0];

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
      className={`rounded-2xl bg-white border border-[#DCE5E3] p-4 sm:p-5 ${className}`}
      aria-label="Progreso de estaciones clinicas"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Stepper Nodes & Connector Line */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1">
          {stationsList.map((station, index) => {
            const isCompleted = completedStations.includes(station.number);
            const isCurrent = currentStation === station.number;

            return (
              <React.Fragment key={station.number}>
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-sans text-xs font-semibold border transition-all ${
                      isCompleted
                        ? 'bg-[#ECF6F4] border-[#0E6F65] text-[#0E6F65]'
                        : isCurrent
                          ? 'bg-[#0E6F65] border-[#0E6F65] text-white shadow-2xs'
                          : 'bg-[#F2F7F6] border-[#DCE5E3] text-[#6B7D83]'
                    }`}
                    title={`Estacion ${station.number}: ${station.levelTitle}`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    ) : (
                      <span>{station.number}</span>
                    )}
                  </div>

                  <div className="hidden sm:block text-left">
                    <span
                      className={`text-[10px] uppercase tracking-[0.14em] block font-sans ${
                        isCurrent
                          ? 'text-[#0E6F65] font-semibold'
                          : isCompleted
                            ? 'text-[#0E6F65]'
                            : 'text-[#6B7D83]'
                      }`}
                    >
                      Estacion {station.number}
                    </span>
                    <span
                      className={`text-xs font-serif font-semibold truncate max-w-[140px] block ${
                        isCurrent
                          ? 'text-[#0B252E]'
                          : isCompleted
                            ? 'text-[#344850]'
                            : 'text-[#6B7D83]'
                      }`}
                    >
                      {station.levelTitle}
                    </span>
                  </div>
                </div>

                {index < stationsList.length - 1 && (
                  <div className="flex-1 h-[1.5px] bg-[#E2ECE9] relative">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isCompleted
                          ? 'bg-[#0E6F65] w-full'
                          : isCurrent
                            ? 'bg-[#0E6F65]/50 w-1/2'
                            : 'w-0'
                      }`}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Current Station Focus */}
        <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-[#EDF2F0]">
          <div className="flex items-center gap-1.5 text-xs text-[#6B7D83]">
            <Target className="w-3.5 h-3.5 text-[#0E6F65] shrink-0" />
            <span className="hidden lg:inline">Competencia evaluada:</span>
          </div>

          <CognitiveGapBadge gapTag={activeGapTag} size="sm" />
        </div>
      </div>

      {/* Subtitle description for mobile view */}
      <div className="mt-3 sm:hidden pt-2 border-t border-[#EDF2F0] flex items-center justify-between text-xs">
        <span className="text-[#6B7D83]">
          Estacion {currentStation} de {totalStations}
        </span>
        <span className="font-serif font-semibold text-[#0B252E]">
          {currentMeta.levelTitle} · {currentMeta.description}
        </span>
      </div>
    </div>
  );
};

export default StationStepper;
