import React from 'react';
import { Check, X } from 'lucide-react';
import type { MCQOption } from '../../types/api';

export type OptionEvaluationState =
  | 'idle'
  | 'correct'
  | 'incorrect'
  | 'revealed-correct'
  | 'dimmed';

export interface OptionCardProps {
  option: MCQOption;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  evaluationState?: OptionEvaluationState;
  className?: string;
}

export const OptionCard: React.FC<OptionCardProps> = ({
  option,
  index,
  isSelected,
  onSelect,
  disabled = false,
  evaluationState = 'idle',
  className = '',
}) => {
  const letter = String.fromCharCode(65 + index); // A, B, C, D...

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect();
    }
  };

  const containerStyle =
    evaluationState === 'correct'
      ? 'bg-[#E6F5F1] border-[#0E6F65] shadow-sm animate-correct-pop cursor-default'
      : evaluationState === 'incorrect'
        ? 'bg-[#FDECEC] border-[#C6383E] shadow-sm animate-clinical-shake cursor-default'
        : evaluationState === 'revealed-correct'
          ? 'bg-[#F0FAF7] border-[#0E6F65]/75 cursor-default transition-all duration-300'
          : evaluationState === 'dimmed'
            ? 'opacity-55 cursor-default border-[#E7EEEC] bg-[#F7FAF9]'
            : disabled
              ? 'opacity-65 cursor-not-allowed border-[#E7EEEC] bg-[#F2F7F6]/60'
              : isSelected
                ? 'bg-[#ECF6F4] border-[#0E6F65] shadow-xs'
                : 'bg-white border-[#DCE5E3] hover:border-[#9EC6BF] hover:bg-[#F7FAF9] cursor-pointer';

  const badgeStyle =
    evaluationState === 'correct'
      ? 'bg-[#0E6F65] border-[#0E6F65] text-white'
      : evaluationState === 'incorrect'
        ? 'bg-[#C6383E] border-[#C6383E] text-white'
        : evaluationState === 'revealed-correct'
          ? 'bg-[#ECF6F4] border-[#0E6F65] text-[#0E6F65]'
          : isSelected
            ? 'bg-[#0E6F65] border-[#0E6F65] text-white'
            : 'bg-[#F2F7F6] border-[#DCE5E3] text-[#354B54] group-hover:border-[#0E6F65] group-hover:text-[#0E6F65] group-hover:bg-white';

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={isSelected}
      aria-disabled={disabled}
      onClick={() => {
        if (!disabled) onSelect();
      }}
      onKeyDown={handleKeyDown}
      className={`group relative flex items-start gap-3.5 sm:gap-4 p-4 sm:p-5 rounded-2xl border text-left transition-all duration-200 select-none focus:outline-none focus:ring-2 focus:ring-[#0E6F65]/30 ${containerStyle} ${className}`}
    >
      {/* Letter / Outcome Medallion */}
      <div className="relative shrink-0">
        {(evaluationState === 'correct' || evaluationState === 'incorrect') && (
          <span
            aria-hidden="true"
            className={`absolute inset-0 rounded-full animate-ring-expand pointer-events-none ${
              evaluationState === 'correct' ? 'bg-[#0E6F65]/35' : 'bg-[#C6383E]/35'
            }`}
          />
        )}
        <div
          className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-sans text-xs sm:text-sm font-semibold border transition-colors ${badgeStyle}`}
        >
          {evaluationState === 'correct' ? (
            <svg
              className="w-4 h-4 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 13l4 4L19 7" className="animate-check-draw" />
            </svg>
          ) : evaluationState === 'incorrect' ? (
            <X className="w-4 h-4 stroke-[2.75] text-white" />
          ) : evaluationState === 'revealed-correct' ? (
            <Check className="w-4 h-4 stroke-[2.75] text-[#0E6F65]" />
          ) : isSelected ? (
            <Check className="w-4 h-4 stroke-[2.75] text-white" />
          ) : (
            <span>{letter}</span>
          )}
        </div>
      </div>

      {/* Option Text & Outcome Label */}
      <div className="flex-1 min-w-0 pt-0.5 space-y-1.5">
        <p
          className={`text-xs sm:text-sm leading-relaxed font-sans transition-colors ${
            evaluationState === 'correct' || evaluationState === 'incorrect' || isSelected
              ? 'text-[#0B252E] font-medium'
              : 'text-[#344850] group-hover:text-[#0B252E]'
          }`}
        >
          {option.text}
        </p>

        {evaluationState === 'correct' && (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#0E6F65]">
            <span>Decision clinica acertada</span>
          </span>
        )}
        {evaluationState === 'incorrect' && (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#B6222A]">
            <span>Alternativa elegida · Brecha detectada</span>
          </span>
        )}
        {evaluationState === 'revealed-correct' && (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#0E6F65]">
            <span>Conducta clinica recomendada</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default OptionCard;
