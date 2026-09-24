'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { sets as setsApi } from '@/lib/sets';
import { parseFlashcardsText } from '@/lib/parser';
import { Button, Input, Textarea, ErrorMessage } from '@/components';
import { ArrowLeft, Check, Sparkles, AlertCircle } from 'lucide-react';

export default function CreateSetPage() {
  const { user, initialized } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rawText, setRawText] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (initialized && !user) {
      router.replace('/login');
    }
  }, [initialized, user, router]);

  // Derived state: real-time parsing of the textarea input via useMemo
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
      setFormError('Set title is required.');
      return;
    }

    if (parsedCards.length === 0) {
      setFormError('Please paste at least one valid flashcard line (Term, Definition).');
      return;
    }

    if (parseErrors.length > 0) {
      setFormError('Please resolve all parsing errors before creating the set.');
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
      const errorMsg = err instanceof Error ? err.message : 'Failed to create flashcard set.';
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
    setTitle('Bash Commands');
    setDescription('Basic Bash and Ubuntu commands');
    setRawText(example);
  };

  if (!initialized || !user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 w-full flex-1">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[26px] sm:text-[32px] font-bold text-[var(--ink)] tracking-tight">
            Create Set
          </h1>
          <p className="text-[14px] text-[var(--muted)] mt-1">
            Add a title and paste your cards in &ldquo;Term, Definition&rdquo; format
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={insertExample}
          icon={<Sparkles className="w-3.5 h-3.5 text-[var(--blue)]" />}
        >
          Insert Example
        </Button>
      </div>

      {formError && <ErrorMessage message={formError} className="mb-6" />}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title & Description Card */}
        <div className="card card-pad space-y-4">
          <Input
            label="Title"
            placeholder="e.g. Bash Commands"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={submitting}
            required
          />

          <Input
            label="Description (optional)"
            placeholder="e.g. Basic Bash and Ubuntu commands"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={submitting}
          />
        </div>

        {/* Import Textarea Card */}
        <div className="card card-pad space-y-4">
          <div className="flex items-center justify-between">
            <label className="label">
              Flashcards Import
            </label>
            <span className="text-xs text-[var(--muted)]">
              Format: <code className="bg-[var(--surface-2)] px-1.5 py-0.5 rounded text-[var(--ink)]">Term, Definition</code>
            </span>
          </div>

          <Textarea
            rows={8}
            placeholder={`Paste your flashcards here...\n\nExample:\nsudo, Выполняет команду с правами администратора\npwd, Показывает текущую рабочую директорию\nls, Показывает содержимое директории`}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            disabled={submitting}
            className="font-mono text-sm leading-relaxed"
          />

          {/* Parsing Errors Display */}
          {parseErrors.length > 0 && (
            <div className="p-3.5 rounded-[12px] bg-[var(--red-bg)] text-[var(--red-strong)] text-sm space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                Parsing issues detected:
              </div>
              <ul className="list-disc list-inside text-xs pl-1 space-y-0.5">
                {parseErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Cards Count Badge & Minimum Notice */}
          {parsedCards.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 text-sm">
              <span className="font-bold text-[var(--ink)] flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[var(--green)]" />
                {parsedCards.length} {parsedCards.length === 1 ? 'card' : 'cards'} detected
              </span>

              {parsedCards.length < 4 && (
                <span className="text-xs text-[var(--amber)] font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  You need at least 4 flashcards to start a quiz.
                </span>
              )}
            </div>
          )}
        </div>

        {/* Preview Section */}
        {parsedCards.length > 0 && (
          <div className="card card-pad space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <h2 className="text-[18px] font-bold text-[var(--ink)]">
                Preview
              </h2>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--blue-soft)] text-[var(--blue-soft-text)]">
                {parsedCards.length} cards
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[var(--line)] text-[var(--muted)] text-xs uppercase font-semibold">
                    <th className="py-2.5 px-3 w-12">#</th>
                    <th className="py-2.5 px-3 w-1/3">Term</th>
                    <th className="py-2.5 px-3">Definition</th>
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

        {/* Submit action */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="md">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={submitting}
            disabled={parsedCards.length === 0 || parseErrors.length > 0}
          >
            Create Set
          </Button>
        </div>
      </form>
    </div>
  );
}
