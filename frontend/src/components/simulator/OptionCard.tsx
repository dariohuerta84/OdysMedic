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
      className={`group relative flex items-start gap-3.5 sm:gap-4 p-4 sm:p-5 rounded-2xl border text-left cursor-pointer transition-all duration-200 select-none focus:outline-none focus:ring-2 focus:ring-clinical-cyan/60 animate-fade-in-up ${staggerClass} ${
        disabled
          ? 'opacity-60 cursor-not-allowed border-clinical-border bg-slate-900/40'
          : isSelected
            ? 'bg-clinical-teal/20 border-clinical-teal shadow-[0_0_20px_rgba(13,102,93,0.35)] ring-1 ring-clinical-teal/60 scale-[1.008]'
            : 'bg-clinical-surface/80 border-clinical-border hover:border-clinical-cyan/60 hover:bg-slate-900/90 hover:scale-[1.004] hover:shadow-lg active:scale-[0.99]'
      } ${className}`}
    >
      {/* Letter Identifier in Circle */}
      <div
        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full shrink-0 flex items-center justify-center font-mono text-xs sm:text-sm font-bold border transition-all ${
          isSelected
            ? 'bg-clinical-teal border-clinical-teal text-white shadow-md'
            : 'bg-slate-900/90 border-slate-700 text-gray-300 group-hover:border-clinical-cyan/80 group-hover:text-clinical-cyan'
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
              ? 'text-white font-medium'
              : 'text-gray-200 group-hover:text-white'
          }`}
        >
          {option.text}
        </p>
      </div>

      {/* Subtle selection status marker */}
      {isSelected && (
        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-clinical-teal/40 text-teal-200 border border-clinical-teal/50 shrink-0">
          Seleccionada
        </span>
      )}
    </div>
  );
};

export default OptionCard;