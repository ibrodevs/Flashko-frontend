'use client';

import React from 'react';

export interface ProgressBarProps {
  current: number;
  total: number;
  correctCount?: number;
  incorrectCount?: number;
}

export function ProgressBar({
  current,
  total,
  correctCount = 0,
  incorrectCount = 0,
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-[var(--ink)]">
          Question {current} of {total}
        </span>
        <div className="flex items-center gap-3 font-semibold text-xs">
          <span className="text-[var(--green)] flex items-center gap-1">
            <span>✓</span> {correctCount}
          </span>
          <span className="text-[var(--red-strong)] flex items-center gap-1">
            <span>✕</span> {incorrectCount}
          </span>
        </div>
      </div>

      <div className="w-full h-2.5 rounded-full bg-[var(--surface-2)] border border-[var(--line)] overflow-hidden">
        <div
          className="h-full bg-[var(--blue)] transition-all duration-300 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
