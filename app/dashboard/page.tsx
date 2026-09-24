'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
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

  useEffect(() => {
    if (initialized && !user) {
      router.replace('/login');
    }
  }, [initialized, user, router]);

  useEffect(() => {
    async function loadSets() {
      if (!user) return;
      setError('');
      try {
        const data = await setsApi.getAll();
        setSets(data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load flashcard sets.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadSets();
    }
  }, [user]);

  if (!initialized || (loading && sets.length === 0)) {
    return <Loading fullPage text="Loading your flashcards..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 w-full flex-1 flex flex-col">
      {/* Dashboard Topbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--line)]">
        <div>
          <h1 className="text-[26px] sm:text-[32px] font-bold text-[var(--ink)] tracking-tight">
            My Flashcards
          </h1>
          <p className="text-[14px] text-[var(--muted)] mt-1">
            Manage your flashcard sets and study quizzes
          </p>
        </div>

        <Link href="/sets/create">
          <Button variant="primary" size="md" icon={<Plus className="w-4 h-4" />}>
            Create Set
          </Button>
        </Link>
      </div>

      {error && <ErrorMessage message={error} className="mt-6" />}

      {/* Sets Grid or Empty State */}
      <div className="mt-8 flex-1">
        {sets.length === 0 ? (
          <EmptyState
            icon={<Layers className="w-6 h-6 text-[var(--blue)]" />}
            title="You don't have any flashcard sets yet."
            description="Create your first set by pasting terms and definitions to start studying."
            actionText="Create Set"
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
