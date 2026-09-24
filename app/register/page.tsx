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

    // Frontend валидация
    const errors: { [key: string]: string } = {};
    if (!username.trim()) {
      errors.username = 'Имя пользователя обязательно.';
    }
    if (!email.trim()) {
      errors.email = 'Email обязателен.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Введите корректный email адрес.';
    }
    if (!password) {
      errors.password = 'Пароль обязателен.';
    } else if (password.length < 6) {
      errors.password = 'Пароль должен содержать не менее 6 символов.';
    }
    if (password !== confirmPassword) {
      errors.confirm_password = 'Пароли не совпадают.';
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
        setGeneralError(err.message || 'Ошибка регистрации. Попробуйте снова.');
      } else {
        setGeneralError('Ошибка регистрации. Попробуйте снова.');
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
            Создать аккаунт
          </h1>
          <p className="text-[14px] text-[var(--muted)] mt-1">
            Начните создавать карточки и проходить тесты
          </p>
        </div>

        {generalError && <ErrorMessage message={generalError} className="mb-4" />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Имя пользователя"
            placeholder="например, alex24"
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
            label="Пароль"
            type="password"
            placeholder="Не менее 6 символов"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            disabled={submitting}
            autoComplete="new-password"
          />

          <Input
            label="Подтверждение пароля"
            type="password"
            placeholder="Повторите пароль"
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
              Создать аккаунт
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-5 border-t border-[var(--line)] text-center text-[14px] text-[var(--muted)]">
          Уже есть аккаунт?{' '}
          <Link href="/login" className="text-[var(--blue)] font-semibold hover:underline">
            Войти
          </Link>
        </div>
      </div>
    </div>
  );
}
