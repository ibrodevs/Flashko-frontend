'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from './Button';
import { BookOpen, LogOut, User as UserIcon, Moon, Sun } from 'lucide-react';

export function Header() {
  const { user, logout, initialized } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = localStorage.getItem('fc_theme');
    const isDark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark');
      const timer = setTimeout(() => setTheme('dark'), 0);
      return () => clearTimeout(timer);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('fc_theme', next);
    if (next === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-[var(--surface)]/90 backdrop-blur-md border-b border-[var(--line)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4">
        {/* Логотип */}
        <Link
          href={user ? '/dashboard' : '/'}
          className="flex items-center gap-2.5 font-bold text-[19px] sm:text-[21px] text-[var(--ink)] tracking-tight hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-[var(--blue)] text-white flex items-center justify-center shadow-sm">
            <BookOpen className="w-4 h-4" />
          </div>
          <span>Flashko</span>
        </Link>

        {/* Навигация и контролы */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Переключатель темы */}
          <button
            onClick={toggleTheme}
            aria-label="Переключить тему"
            className="w-9 h-9 rounded-[10px] border border-[var(--field-line)] bg-[var(--surface)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--hover)] transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {!initialized ? (
            <div className="w-24 h-9 rounded-[10px] bg-[var(--hover)] animate-pulse" />
          ) : user ? (
            <>
              {/* Меню авторизованного пользователя */}
              <Link
                href="/dashboard"
                className={`hidden sm:inline-flex px-3 py-1.5 rounded-[10px] text-[14px] font-medium transition-colors ${
                  pathname === '/dashboard'
                    ? 'text-[var(--blue)] bg-[var(--blue-soft)] font-semibold'
                    : 'text-[var(--body)] hover:bg-[var(--hover)]'
                }`}
              >
                Мои наборы
              </Link>
              
              <Link
                href="/profile"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-[14px] font-medium transition-colors ${
                  pathname === '/profile'
                    ? 'text-[var(--blue)] bg-[var(--blue-soft)] font-semibold'
                    : 'text-[var(--body)] hover:bg-[var(--hover)]'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{user.username}</span>
                <span className="sm:hidden">Профиль</span>
              </Link>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                icon={<LogOut className="w-3.5 h-3.5" />}
                className="text-[var(--muted)] hover:text-[var(--red-strong)]"
              >
                <span className="hidden sm:inline">Выйти</span>
              </Button>
            </>
          ) : (
            <>
              {/* Гостевые ссылки */}
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Войти
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  Регистрация
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
