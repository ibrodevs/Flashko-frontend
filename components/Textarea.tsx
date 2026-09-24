'use client';

import React, { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="field">
        {label && (
          <label htmlFor={textareaId} className="label">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`textarea ${error ? 'input-error' : ''} ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-[var(--red-strong)] font-medium mt-0.5">{error}</span>}
        {!error && helperText && (
          <span className="text-xs text-[var(--muted)] mt-0.5">{helperText}</span>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
