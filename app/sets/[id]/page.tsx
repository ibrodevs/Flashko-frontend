'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { sets as setsApi } from '@/lib/sets';
import { FlashcardSetDetail } from '@/types';
import {
  Button,
  Modal,
  Flashcard,
  Loading,
  ErrorMessage
} from '@/components';
import {
  ArrowLeft,
  Play,
  Edit2,
  Trash2,
  BookOpen,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { ApiError } from '@/lib/api';

export default function SetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const setId = resolvedParams.id;

  const { user, initialized } = useAuth();
  const router = useRouter();

  const [setDetail, setSetDetail] = useState<FlashcardSetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (initialized && !user) {
      router.replace('/login');
    }
  }, [initialized, user, router]);

  useEffect(() => {
    async function loadSet() {
      if (!user) return;
      setError('');
      try {
        const data = await setsApi.getById(setId);
        setSetDetail(data);
      } catch (err: unknown) {
        if (err instanceof ApiError && err.status === 404) {
          setError('Set not found.');
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to load set.');
        }
      } finally {
        setLoading(false);
      }
    }

    if (user && setId) {
      loadSet();
    }
  }, [user, setId]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await setsApi.delete(setId);
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete set.';
      setError(msg);
      setDeleteModalOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  if (!initialized || (loading && !setDetail)) {
    return <Loading fullPage text="Loading set details..." />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full text-center">
        <ErrorMessage message={error} className="max-w-md mx-auto mb-6" />
        <Link href="/dashboard">
          <Button variant="secondary" size="md" icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  if (!setDetail) return null;

  const formattedDate = new Date(setDetail.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const canStartQuiz = setDetail.cards.length >= 4;

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

      {/* Set Header Card */}
      <div className="card card-pad mb-8 space-y-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
          <div className="flex-1 min-w-0">
            <h1 className="text-[26px] sm:text-[34px] font-bold text-[var(--ink)] tracking-tight break-words">
              {setDetail.title}
            </h1>
            {setDetail.description && (
              <p className="text-[15px] sm:text-[16px] text-[var(--muted)] mt-2 leading-relaxed whitespace-pre-wrap">
                {setDetail.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 mt-4 text-[13.5px] text-[var(--muted)] font-medium">
              <span className="flex items-center gap-1.5 text-[var(--ink)] font-semibold">
                <BookOpen className="w-4 h-4 text-[var(--blue)]" />
                {setDetail.cards.length} {setDetail.cards.length === 1 ? 'card' : 'cards'}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Created {formattedDate}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link href={`/sets/${setId}/quiz`}>
              <Button
                variant="primary"
                size="md"
                disabled={!canStartQuiz}
                icon={<Play className="w-4 h-4 fill-current" />}
              >
                Start Quiz
              </Button>
            </Link>

            <Link href={`/sets/${setId}/edit`}>
              <Button variant="secondary" size="md" icon={<Edit2 className="w-3.5 h-3.5" />}>
                Edit
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="md"
              onClick={() => setDeleteModalOpen(true)}
              icon={<Trash2 className="w-4 h-4" />}
              className="text-[var(--red-strong)] hover:bg-[var(--red-bg)]"
            >
              Delete
            </Button>
          </div>
        </div>

        {!canStartQuiz && (
          <div className="p-3.5 rounded-[12px] bg-[var(--amber-bg)] text-[var(--amber)] text-xs font-semibold flex items-center gap-2 border border-[var(--amber)]/20">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>You need at least 4 flashcards to start a quiz. Add {4 - setDetail.cards.length} more cards to enable the quiz.</span>
          </div>
        )}
      </div>

      {/* Cards List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
          <h2 className="text-[20px] font-bold text-[var(--ink)]">
            Flashcards ({setDetail.cards.length})
          </h2>
        </div>

        <div className="space-y-3">
          {setDetail.cards.map((card, idx) => (
            <Flashcard
              key={card.id}
              index={idx + 1}
              term={card.term}
              definition={card.definition}
            />
          ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete this set?"
        description="All flashcards in this set will also be permanently deleted. This action cannot be undone."
      >
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button
            variant="ghost"
            size="md"
            onClick={() => setDeleteModalOpen(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="md"
            onClick={handleDelete}
            loading={deleting}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
