'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components';
import { BookOpen, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const { user, initialized } = useAuth();
  const router = useRouter();
  const [selectedDemoOption, setSelectedDemoOption] = useState<string | null>(null);

  useEffect(() => {
    if (initialized && user) {
      router.replace('/dashboard');
    }
  }, [initialized, user, router]);

  const demoOptions = [
    { id: 'a', text: 'Показывает содержимое директории' },
    { id: 'b', text: 'Показывает текущую рабочую директорию' },
    { id: 'c', text: 'Создаёт новую пустую директорию' },
    { id: 'd', text: 'Изменяет права доступа к файлам' },
  ];

  return (
    <div className="flex-1 flex flex-col justify-between">
      {/* Главный блок Hero */}
      <section className="relative px-4 sm:px-6 pt-16 pb-20 max-w-5xl mx-auto w-full text-center">
        {/* Бейдж */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--blue-soft)] text-[var(--blue-soft-text)] text-[13px] font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Простые и быстрые flash-карточки и тесты</span>
        </div>

        {/* Заголовок */}
        <h1 className="text-[36px] sm:text-[52px] font-extrabold text-[var(--ink)] tracking-tight leading-[1.15] max-w-3xl mx-auto">
          Изучайте что угодно с помощью <span className="text-[var(--blue)]">простых карточек</span>.
        </h1>

        {/* Описание */}
        <p className="mt-5 text-[17px] sm:text-[19px] text-[var(--muted)] max-w-2xl mx-auto leading-relaxed">
          Создавайте свои наборы карточек за считанные секунды, тренируйтесь в режиме тестов с выбором ответа и закрепляйте знания легко.
        </p>

        {/* Кнопки действия */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link href="/register">
            <Button variant="primary" size="lg" icon={<ArrowRight className="w-4 h-4" />}>
              Начать бесплатно
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" size="lg">
              Войти
            </Button>
          </Link>
        </div>

        {/* Интерактивный пример */}
        <div className="mt-16 max-w-xl mx-auto text-left">
          <div className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-2.5 text-center">
            Интерактивный пример
          </div>

          <div className="card card-pad bg-[var(--surface)] border border-[var(--line)] shadow-[var(--shadow-pop)] relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)] text-xs font-semibold text-[var(--muted)]">
              <span className="flex items-center gap-1.5 text-[var(--ink)]">
                <BookOpen className="w-3.5 h-3.5 text-[var(--blue)]" />
                Команды Bash
              </span>
              <span>Вопрос 1 из 12</span>
            </div>

            <div className="mt-4">
              <h2 className="text-[19px] font-bold text-[var(--ink)] tracking-tight">
                Что означает &laquo;pwd&raquo;?
              </h2>
            </div>

            <div className="mt-4 space-y-2.5">
              {demoOptions.map((opt) => {
                const isSelected = selectedDemoOption === opt.id;
                const isCorrect = opt.id === 'b';
                let btnStyle = 'border-[var(--field-line)] hover:border-[var(--blue)] bg-[var(--surface)]';
                let badgeStyle = 'bg-[var(--surface-2)] text-[var(--muted)]';

                if (isSelected) {
                  if (isCorrect) {
                    btnStyle = 'border-[var(--green)] bg-[var(--green-bg)] text-[var(--green)]';
                    badgeStyle = 'bg-[var(--green)] text-white';
                  } else {
                    btnStyle = 'border-[var(--red-strong)] bg-[var(--red-bg)] text-[var(--red-strong)]';
                    badgeStyle = 'bg-[var(--red-strong)] text-white';
                  }
                } else if (selectedDemoOption && isCorrect) {
                  btnStyle = 'border-[var(--green)] bg-[var(--green-bg-2)] text-[var(--green)]';
                  badgeStyle = 'bg-[var(--green)] text-white';
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedDemoOption(opt.id)}
                    className={`w-full p-3.5 rounded-[12px] border text-left flex items-center gap-3 transition-colors ${btnStyle}`}
                  >
                    <span className={`w-6 h-6 rounded-[6px] font-bold text-xs flex items-center justify-center uppercase shrink-0 ${badgeStyle}`}>
                      {opt.id}
                    </span>
                    <span className="text-[14.5px] font-medium leading-snug">
                      {opt.text}
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedDemoOption && (
              <div className="mt-4 pt-3 border-t border-[var(--line)] flex items-center justify-between text-xs font-semibold">
                <span className={selectedDemoOption === 'b' ? 'text-[var(--green)] flex items-center gap-1' : 'text-[var(--red-strong)] flex items-center gap-1'}>
                  {selectedDemoOption === 'b' ? '✓ Правильно! Отличная работа.' : '✕ Неправильно. Правильный ответ: B.'}
                </span>
                <span className="text-[var(--blue)] flex items-center gap-1">
                  Хотите создать свои? <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Подвал */}
      <footer className="w-full py-6 border-t border-[var(--line)] text-center text-xs text-[var(--muted)]">
        Flashko &copy; {new Date().getFullYear()}. Простое и быстрое обучение.
      </footer>
    </div>
  );
}
