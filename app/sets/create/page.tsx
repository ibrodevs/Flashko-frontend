'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { sets as setsApi } from '@/lib/sets';
import { parseFlashcardsText } from '@/lib/parser';
import { Button, Input, Textarea, ErrorMessage } from '@/components';
import { ArrowLeft, Check, Sparkles, AlertCircle } from 'lucide-react';
import { pluralize } from '@/lib/format';

export default function CreateSetPage() {
  const { user, initialized } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rawText, setRawText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const insertSymbol = (symbol: string) => {
    const el = textareaRef.current;
    if (!el) {
      setRawText((prev) => prev + symbol);
      return;
    }
    const start = el.selectionStart ?? rawText.length;
    const end = el.selectionEnd ?? rawText.length;
    const nextText = rawText.substring(0, start) + symbol + rawText.substring(end);
    setRawText(nextText);
    setTimeout(() => {
      el.focus();
      const pos = start + symbol.length;
      el.setSelectionRange(pos, pos);
    }, 0);
  };

  useEffect(() => {
    if (initialized && !user) {
      router.replace('/login');
    }
  }, [initialized, user, router]);

  // Вычисляемое состояние парсинга текста
  const { cards: parsedCards, errors: parseErrors } = useMemo(() => {
    if (!rawText.trim()) {
      return { cards: [], errors: [] };
    }
    return parseFlashcardsText(rawText);
  }, [rawText]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim()) {
      setFormError('Укажите название набора.');
      return;
    }

    if (parsedCards.length === 0) {
      setFormError('Вставьте хотя бы одну строку с карточкой (Термин, Определение).');
      return;
    }

    if (parseErrors.length > 0) {
      setFormError('Пожалуйста, исправьте ошибки парсинга перед созданием набора.');
      return;
    }

    setSubmitting(true);
    try {
      const newSet = await setsApi.create({
        title: title.trim(),
        description: description.trim(),
        cards: parsedCards,
      });
      router.push(`/sets/${newSet.id}`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Не удалось создать набор.';
      setFormError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const insertExample = () => {
    const example = `sudo, Выполняет команду с правами администратора
pwd, Показывает текущую рабочую директорию
ls, Показывает содержимое директории
cd, Переходит в указанную директорию
mkdir, Создаёт новую директорию
touch, Создаёт пустой файл`;
    setTitle('Команды Bash');
    setDescription('Базовые команды терминала Bash и Ubuntu');
    setRawText(example);
  };

  if (!initialized || !user) {
    return null;
  }

  const cardsCountText = pluralize(parsedCards.length, 'карточка', 'карточки', 'карточек');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 w-full flex-1">
      {/* Кнопка возврата */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к моим наборам
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[26px] sm:text-[32px] font-bold text-[var(--ink)] tracking-tight">
            Создать набор
          </h1>
          <p className="text-[14px] text-[var(--muted)] mt-1">
            Укажите название и вставьте карточки в формате &laquo;Термин, Определение&raquo;
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={insertExample}
          icon={<Sparkles className="w-3.5 h-3.5 text-[var(--blue)]" />}
        >
          Вставить пример
        </Button>
      </div>

      {formError && <ErrorMessage message={formError} className="mb-6" />}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Карточка с названием и описанием */}
        <div className="card card-pad space-y-4">
          <Input
            label="Название набора"
            placeholder="например, Команды Bash"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={submitting}
            required
          />

          <Input
            label="Описание (необязательно)"
            placeholder="например, Базовые команды терминала Bash и Ubuntu"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={submitting}
          />
        </div>

        {/* Поле импорта текста карточек */}
        <div className="card card-pad space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="label">
              Импорт карточек
            </label>
            <span className="text-xs text-[var(--muted)]">
              Формат: <code className="bg-[var(--surface-2)] px-1.5 py-0.5 rounded text-[var(--ink)]">Термин, Определение</code>
            </span>
          </div>

          {/* Панель быстрых символов (особенно полезна на телефонах) */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--muted)]">
            <span className="hidden xs:inline mr-1 text-xs">Быстрый ввод:</span>
            <button
              type="button"
              onClick={() => insertSymbol(', ')}
              className="px-2.5 py-1 rounded-[8px] bg-[var(--surface-2)] hover:bg-[var(--hover)] text-[var(--ink)] font-semibold border border-[var(--field-line)] active:scale-95 transition-all text-xs"
              title="Вставить запятую"
            >
              , Запятая
            </button>
            <button
              type="button"
              onClick={() => insertSymbol('; ')}
              className="px-2.5 py-1 rounded-[8px] bg-[var(--surface-2)] hover:bg-[var(--hover)] text-[var(--ink)] font-semibold border border-[var(--field-line)] active:scale-95 transition-all text-xs"
              title="Вставить точку с запятой"
            >
              ; Точка с запятой
            </button>
            <button
              type="button"
              onClick={() => insertSymbol(' - ')}
              className="px-2.5 py-1 rounded-[8px] bg-[var(--surface-2)] hover:bg-[var(--hover)] text-[var(--ink)] font-semibold border border-[var(--field-line)] active:scale-95 transition-all text-xs"
              title="Вставить тире"
            >
              &mdash; Тире
            </button>
            <button
              type="button"
              onClick={() => insertSymbol('\n')}
              className="px-2.5 py-1 rounded-[8px] bg-[var(--surface-2)] hover:bg-[var(--hover)] text-[var(--ink)] font-semibold border border-[var(--field-line)] active:scale-95 transition-all text-xs"
              title="Перенос строки"
            >
              &crarr; Перенос
            </button>
            {rawText && (
              <button
                type="button"
                onClick={() => setRawText('')}
                className="ml-auto px-2 py-1 rounded-[8px] text-[var(--muted)] hover:text-[var(--red-strong)] text-xs transition-colors"
              >
                Очистить
              </button>
            )}
          </div>

          <Textarea
            ref={textareaRef}
            rows={8}
            placeholder={`Вставьте ваши карточки сюда...\n\nПример:\nsudo, Выполняет команду с правами администратора\npwd, Показывает текущую рабочую директорию\nls, Показывает содержимое директории`}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            disabled={submitting}
            className="font-mono text-sm leading-relaxed"
          />

          {/* Ошибки парсинга */}
          {parseErrors.length > 0 && (
            <div className="p-3.5 rounded-[12px] bg-[var(--red-bg)] text-[var(--red-strong)] text-sm space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                Обнаружены ошибки в строках:
              </div>
              <ul className="list-disc list-inside text-xs pl-1 space-y-0.5">
                {parseErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Индикатор количества карточек */}
          {parsedCards.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 text-sm">
              <span className="font-bold text-[var(--ink)] flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[var(--green)]" />
                {cardsCountText} обнаружено
              </span>

              {parsedCards.length < 4 && (
                <span className="text-xs text-[var(--amber)] font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Для запуска теста нужно минимум 4 карточки.
                </span>
              )}
            </div>
          )}
        </div>

        {/* Таблица предпросмотра */}
        {parsedCards.length > 0 && (
          <div className="card card-pad space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <h2 className="text-[18px] font-bold text-[var(--ink)]">
                Предпросмотр
              </h2>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--blue-soft)] text-[var(--blue-soft-text)]">
                {cardsCountText}
              </span>
            </div>

            {/* Карточный вид для мобильных */}
            <div className="sm:hidden space-y-2.5">
              {parsedCards.map((card, idx) => (
                <div key={idx} className="p-3 rounded-[12px] bg-[var(--surface-2)]/60 border border-[var(--line)] text-sm">
                  <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-1">
                    <span>Карточка #{idx + 1}</span>
                  </div>
                  <div className="font-bold text-[var(--ink)] mb-1 break-words">{card.term}</div>
                  <div className="text-[var(--body)] text-xs leading-relaxed break-words">{card.definition}</div>
                </div>
              ))}
            </div>

            {/* Табличный вид для планшетов и десктопов */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[var(--line)] text-[var(--muted)] text-xs uppercase font-semibold">
                    <th className="py-2.5 px-3 w-12">#</th>
                    <th className="py-2.5 px-3 w-1/3">Термин</th>
                    <th className="py-2.5 px-3">Определение</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {parsedCards.map((card, idx) => (
                    <tr key={idx} className="hover:bg-[var(--hover)]/50 transition-colors">
                      <td className="py-2.5 px-3 text-xs text-[var(--muted)]">{idx + 1}</td>
                      <td className="py-2.5 px-3 font-semibold text-[var(--ink)] break-words">{card.term}</td>
                      <td className="py-2.5 px-3 text-[var(--body)] break-words">{card.definition}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Действия формы */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="md">
              Отмена
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={submitting}
            disabled={parsedCards.length === 0 || parseErrors.length > 0}
          >
            Создать набор
          </Button>
        </div>
      </form>
    </div>
  );
}
