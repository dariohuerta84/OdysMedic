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
      className={`group relative flex items-start gap-3.5 sm:gap-4 p-4 sm:p-5 rounded-2xl border text-left cursor-pointer transition-all duration-200 select-none focus:outline-none focus:ring-2 focus:ring-[#0E6F65]/30 ${
        disabled
          ? 'opacity-65 cursor-not-allowed border-[#E7EEEC] bg-[#F2F7F6]/60'
          : isSelected
            ? 'bg-[#ECF6F4] border-[#0E6F65] shadow-xs'
            : 'bg-white border-[#DCE5E3] hover:border-[#9EC6BF] hover:bg-[#F7FAF9]'
      } ${className}`}
    >
      {/* Letter Identifier in Circle */}
      <div
        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full shrink-0 flex items-center justify-center font-sans text-xs sm:text-sm font-semibold border transition-colors ${
          isSelected
            ? 'bg-[#0E6F65] border-[#0E6F65] text-white'
            : 'bg-[#F2F7F6] border-[#DCE5E3] text-[#354B54] group-hover:border-[#0E6F65] group-hover:text-[#0E6F65] group-hover:bg-white'
        }`}
      >
        {isSelected ? (
          <Check className="w-4 h-4 stroke-[2.75] text-white" />
        ) : (
          <span>{letter}</span>
        )}
      </div>

      {/* Option Text Content */}
      <div className="flex-1 min-w-0 pt-1">
        <p
          className={`text-xs sm:text-sm leading-relaxed font-sans transition-colors ${
            isSelected
              ? 'text-[#0B252E] font-medium'
              : 'text-[#344850] group-hover:text-[#0B252E]'
          }`}
        >
          {option.text}
        </p>
      </div>
    </div>
  );
};

export default OptionCard;
