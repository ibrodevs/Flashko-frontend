'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from './Button';
import {
  BookOpen,
  LogOut,
  User as UserIcon,
  Moon,
  Sun,
  Layers,
  Plus,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

export function Header() {
  const { user, logout, initialized } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  // Close mobile menu on Escape or click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    }

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

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
    setMobileMenuOpen(false);
    await logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-[var(--surface)]/95 backdrop-blur-md border-b border-[var(--line)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-3">
        {/* Логотип */}
        <Link
          href={user ? '/dashboard' : '/'}
          className="flex items-center gap-2.5 font-bold text-[18px] sm:text-[21px] text-[var(--ink)] tracking-tight hover:opacity-90 transition-opacity shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-[var(--blue)] text-white flex items-center justify-center shadow-sm shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <span>Flashko</span>
        </Link>

        {/* Десктоп-навигация (от sm и выше) */}
        <div className="hidden sm:flex items-center gap-2 md:gap-3">
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
              <Link
                href="/dashboard"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-[14px] font-medium transition-colors ${
                  pathname === '/dashboard'
                    ? 'text-[var(--blue)] bg-[var(--blue-soft)] font-semibold'
                    : 'text-[var(--body)] hover:bg-[var(--hover)]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Мои наборы</span>
              </Link>

              <Link
                href="/sets/create"
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-[14px] font-medium transition-colors ${
                  pathname === '/sets/create'
                    ? 'text-[var(--blue)] bg-[var(--blue-soft)] font-semibold'
                    : 'text-[var(--body)] hover:bg-[var(--hover)]'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Создать</span>
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
                <span>{user.username}</span>
              </Link>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                icon={<LogOut className="w-3.5 h-3.5" />}
                className="text-[var(--muted)] hover:text-[var(--red-strong)] px-2.5"
                title="Выйти"
              >
                <span>Выйти</span>
              </Button>
            </>
          ) : (
            <>
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

        {/* Мобильные контролы (до sm): переключатель темы и кнопка меню */}
        <div className="flex sm:hidden items-center gap-1.5" ref={menuRef}>
          <button
            onClick={toggleTheme}
            aria-label="Переключить тему"
            className="w-9 h-9 rounded-[10px] border border-[var(--field-line)] bg-[var(--surface)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] active:bg-[var(--hover)] transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            className="w-9 h-9 rounded-[10px] border border-[var(--field-line)] bg-[var(--surface)] flex items-center justify-center text-[var(--ink)] active:bg-[var(--hover)] transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Выпадающее мобильное меню */}
          {mobileMenuOpen && (
            <div className="absolute top-16 left-0 right-0 bg-[var(--surface)] border-b border-[var(--line)] shadow-[0_12px_32px_rgba(0,0,0,0.14)] p-4 animate-in slide-in-from-top-2 duration-150 flex flex-col gap-2">
              {!initialized ? (
                <div className="p-4 text-center text-sm text-[var(--muted)]">Загрузка...</div>
              ) : user ? (
                <>
                  {/* Профиль пользователя */}
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-[12px] bg-[var(--surface-2)] border border-[var(--line)] mb-1"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[var(--blue-soft)] text-[var(--blue)] font-bold text-xs flex items-center justify-center shrink-0 uppercase">
                        {user.username.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-[var(--ink)] truncate">{user.username}</div>
                        <div className="text-xs text-[var(--muted)] truncate">{user.email}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--muted)] shrink-0" />
                  </Link>

                  {/* Ссылки навигации */}
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-colors ${
                      pathname === '/dashboard'
                        ? 'bg-[var(--blue-soft)] text-[var(--blue)] font-semibold'
                        : 'text-[var(--body)] hover:bg-[var(--hover)]'
                    }`}
                  >
                    <Layers className="w-4 h-4 text-[var(--blue)]" />
                    <span>Мои наборы</span>
                  </Link>

                  <Link
                    href="/sets/create"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-colors ${
                      pathname === '/sets/create'
                        ? 'bg-[var(--blue-soft)] text-[var(--blue)] font-semibold'
                        : 'text-[var(--body)] hover:bg-[var(--hover)]'
                    }`}
                  >
                    <Plus className="w-4 h-4 text-[var(--green)]" />
                    <span>Создать набор</span>
                  </Link>

                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-colors ${
                      pathname === '/profile'
                        ? 'bg-[var(--blue-soft)] text-[var(--blue)] font-semibold'
                        : 'text-[var(--body)] hover:bg-[var(--hover)]'
                    }`}
                  >
                    <UserIcon className="w-4 h-4 text-[var(--muted)]" />
                    <span>Профиль и статистика</span>
                  </Link>

                  <div className="pt-2 mt-1 border-t border-[var(--line)]">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-sm font-medium text-[var(--red-strong)] hover:bg-[var(--red-bg)] active:bg-[var(--red-bg)] transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Выйти из аккаунта</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-1">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="secondary" size="md" fullWidth>
                      Войти
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" size="md" fullWidth>
                      Регистрация
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
