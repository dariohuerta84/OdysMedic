import React from 'react';
import { ArrowRight, Lock } from 'lucide-react';
import type { Specialty, SpecialtyMastery } from '../../types/api';

export interface SpecialtyCardProps {
  specialty: Specialty;
  mastery?: SpecialtyMastery;
  isDiagnosticCompleted?: boolean;
  onSelect: (specialtyId: string) => void;
  className?: string;
}

export const SpecialtyCard: React.FC<SpecialtyCardProps> = ({
  specialty,
  mastery,
  isDiagnosticCompleted = true,
  onSelect,
  className = '',
}) => {
  const score = mastery?.mastery_score ?? 0;

  return (
    <button
      type="button"
      onClick={() => onSelect(specialty.id)}
      className={`w-full text-left p-5 bg-[#FAF9F6] border border-[#DEDBD2] hover:border-[#0E6F65] transition-colors flex flex-col justify-between gap-4 ${className}`}
    >
      <div className="space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-serif text-lg font-bold text-[#0D1F26]">{specialty.name}</h3>
          <span className="telemetry-mono text-xs font-semibold text-[#0E6F65]">
            {isDiagnosticCompleted ? `${Math.round(score)}%` : '--'}
          </span>
        </div>
        <p className="text-xs text-[#3D525A] leading-relaxed">{specialty.description}</p>
      </div>

      <div className="pt-3 border-t border-[#DEDBD2] flex items-center justify-between text-xs">
        <span className="telemetry-mono text-[#64767E]">{specialty.case_count} casos</span>
        <span className="inline-flex items-center gap-1 font-medium text-[#0E6F65]">
          {!isDiagnosticCompleted && <Lock className="w-3 h-3" />}
          <span>Ingresar</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </button>
  );
};

export default SpecialtyCard;
