'use client';

import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="field">
        {label && (
          <label htmlFor={inputId} className="label">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`input ${error ? 'input-error' : ''} ${className}`}
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

Input.displayName = 'Input';
