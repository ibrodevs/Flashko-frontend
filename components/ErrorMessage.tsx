'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface ErrorMessageProps {
  message: string;
  className?: string;
}

export function ErrorMessage({ message, className = '' }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div
      className={`p-3.5 rounded-[12px] bg-[var(--red-bg)] text-[var(--red-strong)] text-[14px] flex items-start gap-2.5 font-medium border border-[var(--red-strong)]/20 ${className}`}
    >
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[var(--red-strong)]" />
      <span>{message}</span>
    </div>
  );
}
