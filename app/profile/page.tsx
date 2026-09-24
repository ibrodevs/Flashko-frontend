'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/auth';
import { ApiError } from '@/lib/api';
import { Button, Input, Loading, ErrorMessage } from '@/components';
import { formatMonthYearRu } from '@/lib/format';
import {
  ArrowLeft,
  Mail,
  Calendar,
  Layers,
  BookOpen,
  Award,
  LogOut,
  KeyRound,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, logout, initialized, refreshUser } = useAuth();
  const router = useRouter();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialized && !user) {
      router.replace('/login');
    }
  }, [initialized, user, router]);

  useEffect(() => {
    if (user) {
      refreshUser();
    }
  }, [user, refreshUser]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    setFieldErrors({});

    const errors: { [key: string]: string } = {};
    if (!oldPassword) {
      errors.old_password = 'Введи текущий пароль.';
    }
    if (!newPassword) {
      errors.new_password = 'Введи новый пароль.';
    } else if (newPassword.length < 6) {
      errors.new_password = 'Новый пароль должен содержать минимум 6 символов.';
    }
    if (!confirmPassword) {
      errors.confirm_password = 'Повтори новый пароль.';
    } else if (newPassword && newPassword !== confirmPassword) {
      errors.confirm_password = 'Новые пароли не совпадают.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setChangingPassword(true);
    try {
      const res = await auth.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setPasswordSuccess(res.detail || 'Пароль успешно обновлён!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      if (err instanceof ApiError && typeof err.data === 'object' && err.data !== null) {
        const bErrors: { [key: string]: string } = {};
        for (const [key, val] of Object.entries(err.data as Record<string, unknown>)) {
          bErrors[key] = Array.isArray(val) ? String(val[0]) : String(val);
        }
        setFieldErrors(bErrors);
        if (!bErrors.old_password && !bErrors.new_password && !bErrors.confirm_password) {
          setPasswordError(bErrors.detail || bErrors.non_field_errors || 'Не удалось изменить пароль.');
        }
      } else {
        const msg = err instanceof Error ? err.message : 'Не удалось изменить пароль.';
        setPasswordError(msg);
      }
    } finally {
      setChangingPassword(false);
    }
  };

  if (!initialized || !user) {
    return <Loading fullPage text="Загрузка профиля..." />;
  }

  const memberSince = formatMonthYearRu(user.created_at);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10 w-full flex-1">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к наборам
        </Link>
      </div>

      <div className="card card-pad shadow-[var(--shadow-card)] space-y-6">
        {/* User Avatar & Basic Info */}
        <div className="flex items-center gap-4 pb-6 border-b border-[var(--line)]">
          <div className="w-16 h-16 rounded-[16px] bg-[var(--blue-soft)] text-[var(--blue)] font-extrabold text-2xl flex items-center justify-center shrink-0 uppercase border border-[var(--blue-soft-2)]">
            {user.username.slice(0, 2)}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-[22px] sm:text-[24px] font-bold text-[var(--ink)] tracking-tight truncate">
              {user.username}
            </h1>
            <div className="flex items-center gap-1.5 text-sm text-[var(--muted)] mt-0.5 truncate">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[var(--muted)] mt-1">
              <Calendar className="w-3 h-3 shrink-0" />
              <span>В сервисе с {memberSince}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div>
          <h2 className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-3">
            Активность и статистика
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-[14px] bg-[var(--surface-2)] border border-[var(--line)]">
              <div className="flex items-center justify-between text-[var(--muted)] text-xs font-semibold mb-1">
                <span>Создано наборов</span>
                <Layers className="w-4 h-4 text-[var(--blue)]" />
              </div>
              <div className="text-[24px] font-bold text-[var(--ink)]">
                {user.sets_count ?? 0}
              </div>
            </div>

            <div className="p-4 rounded-[14px] bg-[var(--surface-2)] border border-[var(--line)]">
              <div className="flex items-center justify-between text-[var(--muted)] text-xs font-semibold mb-1">
                <span>Всего карточек</span>
                <BookOpen className="w-4 h-4 text-[var(--green)]" />
              </div>
              <div className="text-[24px] font-bold text-[var(--ink)]">
                {user.cards_count ?? 0}
              </div>
            </div>

            <div className="p-4 rounded-[14px] bg-[var(--surface-2)] border border-[var(--line)]">
              <div className="flex items-center justify-between text-[var(--muted)] text-xs font-semibold mb-1">
                <span>Пройдено тестов</span>
                <Award className="w-4 h-4 text-[var(--amber)]" />
              </div>
              <div className="text-[24px] font-bold text-[var(--ink)]">
                {user.quiz_sessions_count ?? 0}
              </div>
            </div>
          </div>
        </div>

        {/* Logout Section */}
        <div className="pt-4 border-t border-[var(--line)] flex items-center justify-between">
          <span className="text-xs text-[var(--muted)]">Сессия активна 7 дней</span>
          <Button
            variant="ghost"
            size="md"
            onClick={handleLogout}
            icon={<LogOut className="w-4 h-4" />}
            className="text-[var(--red-strong)] hover:bg-[var(--red-bg)]"
          >
            Выйти
          </Button>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="card card-pad shadow-[var(--shadow-card)] space-y-5 mt-6">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--line)]">
          <div className="w-8 h-8 rounded-lg bg-[var(--blue-soft)] text-[var(--blue)] flex items-center justify-center shrink-0">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-[17px] sm:text-[18px] font-bold text-[var(--ink)]">
              Смена пароля
            </h2>
            <p className="text-xs text-[var(--muted)]">
              Введите текущий пароль и задайте новый
            </p>
          </div>
        </div>

        {passwordSuccess && (
          <div className="p-3.5 rounded-[12px] bg-[var(--green-bg)] text-[var(--green)] text-sm font-semibold flex items-center gap-2 border border-[var(--green)]/20 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <ErrorMessage message={passwordError} />
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input
            label="Текущий пароль"
            type="password"
            placeholder="Введите ваш текущий пароль"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            error={fieldErrors.old_password}
            disabled={changingPassword}
            required
            autoComplete="current-password"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Новый пароль"
              type="password"
              placeholder="Минимум 6 символов"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={fieldErrors.new_password}
              disabled={changingPassword}
              required
              autoComplete="new-password"
            />

            <Input
              label="Повторите новый пароль"
              type="password"
              placeholder="Повторите новый пароль"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={fieldErrors.confirm_password}
              disabled={changingPassword}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={changingPassword}
              icon={<ShieldCheck className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Обновить пароль
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
