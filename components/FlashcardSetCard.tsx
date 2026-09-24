'use client';

import React from 'react';
import Link from 'next/link';
import { FlashcardSet } from '@/types';
import { Button } from './Button';
import { BookOpen, Calendar } from 'lucide-react';
import { pluralize, formatDateRu } from '@/lib/format';

export interface FlashcardSetCardProps {
  set: FlashcardSet;
}

export function FlashcardSetCard({ set }: FlashcardSetCardProps) {
  const formattedDate = formatDateRu(set.created_at);
  const cardsText = pluralize(set.cards_count, 'карточка', 'карточки', 'карточек');

  return (
    <div className="card card-pad flex flex-col justify-between h-full transition-all hover:border-[var(--line-strong)] hover:shadow-[var(--shadow-pop)] group">
      <div>
        <Link href={`/sets/${set.id}`} className="block focus:outline-none">
          <h3 className="text-[19px] sm:text-[20px] font-bold text-[var(--ink)] group-hover:text-[var(--blue)] transition-colors line-clamp-1">
            {set.title}
          </h3>
        </Link>

        {/* Badges for draft and mistakes */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {set.has_active_session && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--blue-soft)] text-[var(--blue)] border border-[var(--blue)]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--blue)] animate-pulse" />
              Есть черновик
            </span>
          )}
          {set.mistakes_count !== undefined && set.mistakes_count > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--amber-bg)] text-[var(--amber)] border border-[var(--amber)]/20">
              Ошибок: {set.mistakes_count}
            </span>
          )}
        </div>

        {set.description ? (
          <p className="text-[14px] text-[var(--muted)] mt-2 line-clamp-2 leading-relaxed">
            {set.description}
          </p>
        ) : (
          <p className="text-[14px] text-[var(--muted)]/60 italic mt-2">
            Без описания
          </p>
        )}
      </div>


      <div className="mt-6 pt-4 border-t border-[var(--line)] flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1 text-[13px] text-[var(--muted)]">
          <span className="font-semibold text-[var(--ink)] flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[var(--blue)]" />
            {cardsText}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
            <Calendar className="w-3 h-3" />
            Создан {formattedDate}
          </span>
        </div>

        <Link href={`/sets/${set.id}`}>
          <Button variant="secondary" size="sm">
            Учить
          </Button>
        </Link>
      </div>
    </div>
  );
}
