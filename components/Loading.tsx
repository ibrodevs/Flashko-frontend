'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingProps {
  text?: string;
  fullPage?: boolean;
}

export function Loading({ text = 'Загрузка...', fullPage = false }: LoadingProps) {
  if (fullPage) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[var(--blue)] animate-spin" />
        <p className="text-[14px] text-[var(--muted)] font-medium">{text}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2.5 p-6">
      <Loader2 className="w-5 h-5 text-[var(--blue)] animate-spin" />
      <span className="text-[14px] text-[var(--muted)] font-medium">{text}</span>
    </div>
  );
}
