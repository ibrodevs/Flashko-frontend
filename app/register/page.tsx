'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input, ErrorMessage } from '@/components';
import { ApiError } from '@/lib/api';

export default function RegisterPage() {
  const { user, register, initialized } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

    // Frontend validation
    const errors: { [key: string]: string } = {};
    if (!username.trim()) {
      errors.username = 'Username is required.';
    }
    if (!email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }
    if (password !== confirmPassword) {
      errors.confirm_password = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      await register({
        username: username.trim(),
        email: email.trim(),
        password,
        confirm_password: confirmPassword,
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
        setGeneralError(err.message || 'Registration failed. Please try again.');
      } else {
        setGeneralError('Registration failed. Please try again.');
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
            Create an account
          </h1>
          <p className="text-[14px] text-[var(--muted)] mt-1">
            Start creating flashcards and taking quizzes
          </p>
        </div>

        {generalError && <ErrorMessage message={generalError} className="mb-4" />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Username"
            placeholder="e.g. alex24"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={fieldErrors.username}
            disabled={submitting}
            autoComplete="username"
          />

          <Input
            label="Email"
            type="email"
            placeholder="alex@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
            disabled={submitting}
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            disabled={submitting}
            autoComplete="new-password"
          />

          <Input
            label="Confirm password"
            type="password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={fieldErrors.confirm_password}
            disabled={submitting}
            autoComplete="new-password"
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={submitting}
            >
              Create account
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-5 border-t border-[var(--line)] text-center text-[14px] text-[var(--muted)]">
          Already have an account?{' '}
          <Link href="/login" className="text-[var(--blue)] font-semibold hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
