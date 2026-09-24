'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input, ErrorMessage } from '@/components';
import { ApiError } from '@/lib/api';

export default function LoginPage() {
  const { user, login, initialized } = useAuth();
  const router = useRouter();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [generalError, setGeneralError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialized && user) {
      router.replace('/dashboard');
    }
  }, [initialized, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError('');

    const errors: { [key: string]: string } = {};
    if (!identifier.trim()) {
      errors.username_or_email = 'Email or username is required.';
    }
    if (!password) {
      errors.password = 'Password is required.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      await login({
        username_or_email: identifier.trim(),
        password,
      });
      router.push('/dashboard');
    } catch (err: unknown) {
      if (err instanceof ApiError && typeof err.data === 'object' && err.data !== null) {
        const backendErrors: { [key: string]: string } = {};
        for (const [key, val] of Object.entries(err.data as Record<string, unknown>)) {
          backendErrors[key] = Array.isArray(val) ? String(val[0]) : String(val);
        }
        setFieldErrors(backendErrors);
        if (backendErrors.non_field_errors || backendErrors.detail) {
          setGeneralError(backendErrors.non_field_errors || backendErrors.detail);
        }
      } else if (err instanceof Error) {
        setGeneralError(err.message || 'Login failed. Please check your credentials.');
      } else {
        setGeneralError('Login failed. Please check your credentials.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
      <div className="card card-pad w-full max-w-[440px] shadow-[var(--shadow-pop)]">
        <div className="text-center mb-6">
          <h1 className="text-[26px] sm:text-[28px] font-bold text-[var(--ink)] tracking-tight">
            Welcome back
          </h1>
          <p className="text-[14px] text-[var(--muted)] mt-1">
            Log in to your Flashcards account
          </p>
        </div>

        {generalError && <ErrorMessage message={generalError} className="mb-4" />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email or username"
            placeholder="Enter email or username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            error={fieldErrors.username_or_email}
            disabled={submitting}
            autoComplete="username"
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            disabled={submitting}
            autoComplete="current-password"
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={submitting}
            >
              Log in
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-5 border-t border-[var(--line)] text-center text-[14px] text-[var(--muted)]">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-[var(--blue)] font-semibold hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
