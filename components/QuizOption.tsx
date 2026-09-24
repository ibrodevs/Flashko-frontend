'use client';

import React from 'react';
import { Check, X } from 'lucide-react';

export interface QuizOptionProps {
  id: string; // 'a', 'b', 'c', 'd'
  shortcutKey: string; // '1', '2', '3', '4'
  text: string;
  isSelected: boolean;
  isCorrect?: boolean; // defined after answer
  isRevealedCorrect?: boolean; // true if this is the correct option revealed when user chose wrong
  disabled: boolean;
  onClick: () => void;
}

export function QuizOption({
  id,
  shortcutKey,
  text,
  isSelected,
  isCorrect,
  isRevealedCorrect,
  disabled,
  onClick,
}: QuizOptionProps) {
  // Determine styling based on answer state
  let stateClasses = 'bg-[var(--surface)] border-[var(--field-line)] hover:border-[var(--blue)] hover:bg-[var(--hover)] text-[var(--ink)]';
  let badgeClasses = 'bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--line)]';

  if (isSelected) {
    if (isCorrect === true) {
      stateClasses = 'bg-[var(--green-bg)] border-[var(--green)] text-[var(--green)] ring-2 ring-[var(--green)]/20';
      badgeClasses = 'bg-[var(--green)] text-white border-transparent';
    } else if (isCorrect === false) {
      stateClasses = 'bg-[var(--red-bg)] border-[var(--red-strong)] text-[var(--red-strong)] ring-2 ring-[var(--red-strong)]/20';
      badgeClasses = 'bg-[var(--red-strong)] text-white border-transparent';
    } else {
      // Selected but pending
      stateClasses = 'bg-[var(--blue-soft)] border-[var(--blue)] text-[var(--blue)]';
      badgeClasses = 'bg-[var(--blue)] text-white border-transparent';
    }
  } else if (isRevealedCorrect) {
    // Other option revealed as correct
    stateClasses = 'bg-[var(--green-bg-2)] border-[var(--green)] text-[var(--green)] ring-2 ring-[var(--green)]/20';
    badgeClasses = 'bg-[var(--green)] text-white border-transparent';
  } else if (disabled) {
    stateClasses = 'bg-[var(--surface)] border-[var(--line)] opacity-60 text-[var(--muted)]';
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left p-4 sm:p-5 rounded-[14px] border transition-all duration-150 flex items-start gap-3.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue)] cursor-pointer disabled:cursor-not-allowed ${stateClasses}`}
    >
      <div
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-[8px] flex items-center justify-center font-bold text-xs shrink-0 transition-colors uppercase ${badgeClasses}`}
      >
        {isSelected && isCorrect === true && <Check className="w-4 h-4" />}
        {isSelected && isCorrect === false && <X className="w-4 h-4" />}
        {isRevealedCorrect && <Check className="w-4 h-4" />}
        {!isSelected && !isRevealedCorrect && (
          <span>{shortcutKey || id}</span>
        )}
      </div>

      <div className="flex-1 text-[15px] sm:text-[16px] leading-relaxed pt-0.5 font-medium break-words">
        {text}
      </div>
    </button>
  );
}
