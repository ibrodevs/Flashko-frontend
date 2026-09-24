'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button, Loading } from '@/components';
import { formatMonthYearRu } from '@/lib/format';
import {
  ArrowLeft,
  Mail,
  Calendar,
  Layers,
  BookOpen,
  Award,
  LogOut
} from 'lucide-react';

export default function ProfilePage() {
  const { user, logout, initialized, refreshUser } = useAuth();
  const router = useRouter();

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
    </div>
  );
}
