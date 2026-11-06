import React from 'react';
import { Check } from 'lucide-react';
import type { MCQOption } from '../../types/api';

export interface OptionCardProps {
  option: MCQOption;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  className?: string;
}

export const OptionCard: React.FC<OptionCardProps> = ({
  option,
  index,
  isSelected,
  onSelect,
  disabled = false,
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

  const staggerClass = index === 0 ? 'stagger-1' : index === 1 ? 'stagger-2' : index === 2 ? 'stagger-3' : 'stagger-4';

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
      className={`group relative flex items-start gap-3.5 sm:gap-4 p-4 sm:p-5 rounded-2xl border text-left cursor-pointer transition-all duration-200 select-none focus:outline-none focus:ring-2 focus:ring-sky-500 animate-fade-in-up ${staggerClass} ${
        disabled
          ? 'opacity-60 cursor-not-allowed border-slate-200 bg-slate-50'
          : isSelected
            ? 'bg-sky-50 border-sky-500 shadow-sm ring-1 ring-sky-500/30 scale-[1.008]'
            : 'bg-white border-slate-200 hover:border-sky-300 hover:bg-sky-50/40 hover:scale-[1.004] hover:shadow-xs active:scale-[0.99]'
      } ${className}`}
    >
      {/* Letter Identifier in Circle */}
      <div
        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full shrink-0 flex items-center justify-center font-mono text-xs sm:text-sm font-bold border transition-all ${
          isSelected
            ? 'bg-sky-600 border-sky-600 text-white shadow-xs'
            : 'bg-slate-100 border-slate-200 text-slate-700 group-hover:border-sky-300 group-hover:text-sky-700 group-hover:bg-white'
        }`}
      >
        {isSelected ? (
          <Check className="w-4 h-4 stroke-[3] text-white" />
        ) : (
          <span>{letter}</span>
        )}
      </div>

      {/* Option Text Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <p
          className={`text-xs sm:text-sm leading-relaxed transition-colors ${
            isSelected
              ? 'text-slate-900 font-semibold'
              : 'text-slate-700 group-hover:text-slate-900'
          }`}
        >
          {option.text}
        </p>
      </div>

      {/* Subtle selection status marker */}
      {isSelected && (
        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-sky-100 text-sky-800 border border-sky-200 shrink-0 font-semibold">
          Seleccionada
        </span>
      )}
    </div>
  );
};

export default OptionCard;
