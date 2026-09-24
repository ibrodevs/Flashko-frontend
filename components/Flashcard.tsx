'use client';

import React from 'react';
import { Trash2, Edit2 } from 'lucide-react';

export interface FlashcardProps {
  index?: number;
  term: string;
  definition: string;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function Flashcard({
  index,
  term,
  definition,
  onEdit,
  onDelete,
  className = '',
}: FlashcardProps) {
  return (
    <div
      className={`card card-pad relative flex flex-col md:flex-row md:items-start justify-between gap-4 transition-all hover:border-[var(--line-strong)] ${className}`}
    >
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        {index !== undefined && (
          <span className="shrink-0 w-7 h-7 rounded-full bg-[var(--surface-2)] text-[var(--muted)] text-xs font-semibold flex items-center justify-center border border-[var(--line)]">
            {index}
          </span>
        )}
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <div className="text-[17px] font-bold text-[var(--ink)] break-words">
            {term}
          </div>
          <div className="text-[14.5px] text-[var(--body)] whitespace-pre-wrap break-words leading-relaxed">
            {definition}
          </div>
        </div>
      </div>

      {(onEdit || onDelete) && (
        <div className="flex items-center gap-1.5 self-end md:self-start shrink-0">
          {onEdit && (
            <button
              onClick={onEdit}
              aria-label="Редактировать карточку"
              className="w-8 h-8 rounded-[9px] flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--hover)] transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              aria-label="Удалить карточку"
              className="w-8 h-8 rounded-[9px] flex items-center justify-center text-[var(--muted)] hover:text-[var(--red-strong)] hover:bg-[var(--red-bg)] transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
