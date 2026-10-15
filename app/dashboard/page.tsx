'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getAccessToken } from '@/lib/api';
import { sets as setsApi } from '@/lib/sets';
import { FlashcardSet } from '@/types';
import {
  Button,
  FlashcardSetCard,
  EmptyState,
  Loading,
  ErrorMessage
} from '@/components';
import { Plus, Layers } from 'lucide-react';

export default function DashboardPage() {
  const { user, initialized } = useAuth();
  const router = useRouter();

  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const requestInFlight = useRef(false);
  const loadedFromNetwork = useRef(false);

  const loadSets = useCallback(async (background = false) => {
    if (requestInFlight.current || loadedFromNetwork.current) return;

    requestInFlight.current = true;
    if (!background) setLoading(true);
    setError('');

    try {
      const data = await setsApi.getAll();
      setSets(data);
      loadedFromNetwork.current = true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Не удалось загрузить наборы карточек.';
      setError(msg);
    } finally {
      requestInFlight.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialized && !user) {
      router.replace('/login');
    }
  }, [initialized, user, router]);

  useEffect(() => {
    const cachedSets = setsApi.getCached();
    if (cachedSets) {
      setSets(cachedSets);
      setLoading(false);
    }

    // On a normal reload the access token is already in sessionStorage.
    // Start loading sets immediately, in parallel with /auth/me, instead of
    // waiting for authentication initialization to finish first.
    if (getAccessToken()) {
      void loadSets(Boolean(cachedSets));
    }
  }, [loadSets]);

  useEffect(() => {
    // Handles restored sessions where only the refresh cookie was available.
    // loadedFromNetwork prevents a second request if the parallel request above
    // has already completed by the time authentication finishes.
    if (user) {
      void loadSets(Boolean(setsApi.getCached()));
    }
  }, [user, loadSets]);

  if (!initialized || (loading && sets.length === 0)) {
    return <Loading fullPage text="Загрузка ваших наборов..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 w-full flex-1 flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--line)]">
        <div>
          <h1 className="text-[26px] sm:text-[32px] font-bold text-[var(--ink)] tracking-tight">
            Мои карточки
          </h1>
          <p className="text-[14px] text-[var(--muted)] mt-1">
            Управляйте наборами flash-карточек и проходите тесты
          </p>
        </div>

        <Link href="/sets/create">
          <Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />}>
            Создать набор
          </Button>
        </Link>
      </div>

      {error && <ErrorMessage message={error} className="mt-6" />}

      <div className="mt-8 flex-1">
        {sets.length === 0 ? (
          <EmptyState
            icon={<Layers className="w-6 h-6 text-[var(--blue)]" />}
            title="У вас пока нет наборов карточек."
            description="Создайте свой первый набор, вставив термины и определения, чтобы сразу начать обучение."
            actionText="Создать набор"
            actionHref="/sets/create"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sets.map((set) => (
              <FlashcardSetCard key={set.id} set={set} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
