'use client';

import React from 'react';
import { Button } from './Button';
import { BookOpen } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  actionHref?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionText,
  onAction,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="card card-pad text-center flex flex-col items-center justify-center py-14 px-6 border-dashed border-2">
      <div className="w-12 h-12 rounded-[14px] bg-[var(--surface-2)] border border-[var(--line)] flex items-center justify-center text-[var(--muted)] mb-3.5">
        {icon || <BookOpen className="w-6 h-6" />}
      </div>
      <h3 className="text-[18px] font-bold text-[var(--ink)] tracking-tight">
        {title}
      </h3>
      <p className="text-[14px] text-[var(--muted)] mt-1 max-w-sm leading-relaxed">
        {description}
      </p>
      {actionText && (
        <div className="mt-5">
          {actionHref ? (
            <a href={actionHref}>
              <Button variant="primary" size="md">
                {actionText}
              </Button>
            </a>
          ) : (
            <Button variant="primary" size="md" onClick={onAction}>
              {actionText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
