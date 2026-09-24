'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'sm',
}: ModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-[480px]',
    md: 'max-w-[620px]',
    lg: 'max-w-[800px]',
  }[maxWidth];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(20,27,42,0.48)] backdrop-blur-[3px] transition-opacity"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidthClass} max-h-[min(90vh,calc(100dvh-32px))] overflow-y-auto bg-[var(--surface)] border border-[var(--line)] rounded-[20px] sm:rounded-[22px] shadow-[var(--shadow-modal)] p-5 sm:p-7 relative transition-transform duration-200 transform scale-100`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-[8px] flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--hover)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {title && (
          <h2 className="text-[22px] sm:text-[24px] font-bold text-[var(--ink)] tracking-tight pr-8">
            {title}
          </h2>
        )}
        {description && (
          <p className="text-[14px] text-[var(--muted)] mt-1.5 leading-relaxed">
            {description}
          </p>
        )}

        <div className={title || description ? 'mt-6' : ''}>{children}</div>
      </div>
    </div>
  );
}
