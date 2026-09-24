'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { sets as setsApi } from '@/lib/sets';
import { FlashcardSetDetail } from '@/types';
import { pluralize, formatDateRu } from '@/lib/format';
import {
  Button,
  Flashcard,
  Loading,
  ErrorMessage
} from '@/components';
import {
  ArrowLeft,
  Check,
  Share2,
  BookOpen,
  Calendar,
  User as UserIcon,
  Download,
  Sparkles
} from 'lucide-react';
import { ApiError } from '@/lib/api';

export default function SharedSetPage({ params }: { params: Promise<{ shareId: string }> }) {
  const resolvedParams = use(params);
  const shareId = resolvedParams.shareId;

  const { user, initialized } = useAuth();
  const router = useRouter();

  const [setDetail, setSetDetail] = useState<FlashcardSetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copying, setCopying] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function loadSharedSet() {
      setError('');
      try {
        const data = await setsApi.getShared(shareId);
        setSetDetail(data);
      } catch (err: unknown) {
        if (err instanceof ApiError && err.status === 404) {
          setError('Общий набор не найден или ссылка устарела.');
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Не удалось загрузить общий набор.');
        }
      } finally {
        setLoading(false);
      }
    }

    if (shareId) {
      loadSharedSet();
    }
  }, [shareId]);

  const handleCopySet = async () => {
    if (!user) {
      // Redirect to login or register with return query
      router.push(`/register?redirect=/sets/share/${shareId}`);
      return;
    }

    setCopying(true);
    try {
      const newSet = await setsApi.copyShared(shareId);
      router.push(`/sets/${newSet.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Не удалось скопировать набор.';
      setError(msg);
      setCopying(false);
    }
  };

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share && setDetail) {
      try {
        await navigator.share({
          title: `Flashko: ${setDetail.title}`,
          text: `Изучайте набор карточек «${setDetail.title}» в Flashko!`,
          url,
        });
        return;
      } catch {
        // user dismissed
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // ignore
    }
  };

  if (!initialized || loading) {
    return <Loading fullPage text="Загрузка набора..." />;
  }

  if (error || !setDetail) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-16 w-full text-center">
        <ErrorMessage message={error || 'Набор не найден.'} className="mb-6 max-w-md mx-auto" />
        <Link href="/">
          <Button variant="secondary" size="md" icon={<ArrowLeft className="w-4 h-4" />}>
            На главную Flashko
          </Button>
        </Link>
      </div>
    );
  }

  const formattedDate = formatDateRu(setDetail.created_at);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 w-full flex-1 pb-24 sm:pb-10">
      {/* Top Navigation */}
      <div className="mb-4 sm:mb-6 flex items-center justify-between">
        <Link
          href={user ? '/dashboard' : '/'}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {user ? 'Мои наборы' : 'На главную'}
        </Link>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--blue-soft)] text-[var(--blue)]">
          <Sparkles className="w-3.5 h-3.5" />
          Общий доступ
        </span>
      </div>

      {/* Main Set Card */}
      <div className="card card-pad mb-6 sm:mb-8 space-y-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
          <div className="flex-1 min-w-0">
            <h1 className="text-[24px] sm:text-[32px] font-bold text-[var(--ink)] tracking-tight break-words">
              {setDetail.title}
            </h1>
            {setDetail.description && (
              <p className="text-[14.5px] sm:text-[16px] text-[var(--muted)] mt-2 leading-relaxed whitespace-pre-wrap">
                {setDetail.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 mt-4 text-[13px] sm:text-[13.5px] text-[var(--muted)] font-medium">
              {setDetail.author_username && (
                <span className="flex items-center gap-1.5 text-[var(--ink)] font-semibold">
                  <UserIcon className="w-3.5 h-3.5 text-[var(--blue)]" />
                  Автор: {setDetail.author_username}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                {setDetail.cards.length} {pluralize(setDetail.cards.length, 'карточка', 'карточки', 'карточек')}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formattedDate}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <Button
              variant="primary"
              size="md"
              onClick={handleCopySet}
              loading={copying}
              icon={<Download className="w-4 h-4" />}
            >
              {user ? 'Скопировать себе' : 'Войти и скопировать'}
            </Button>

            <Button
              variant="secondary"
              size="md"
              onClick={handleShare}
              icon={copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            >
              {copiedLink ? 'Ссылка скопирована!' : 'Поделиться'}
            </Button>
          </div>
        </div>
      </div>

      {/* Cards List Section */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
          <h2 className="text-[19px] sm:text-[20px] font-bold text-[var(--ink)]">
            Карточки в этом наборе ({setDetail.cards.length})
          </h2>
        </div>

        <div className="space-y-2.5 sm:space-y-3">
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

      {/* Floating Bottom Bar for Mobile */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-3.5 bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--line)] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] z-30 flex items-center gap-2">
        <Button
          variant="primary"
          size="md"
          fullWidth
          onClick={handleCopySet}
          loading={copying}
          icon={<Download className="w-4 h-4" />}
        >
          {user ? 'Скопировать себе' : 'Войти и скопировать'}
        </Button>
        <Button
          variant="secondary"
          size="md"
          onClick={handleShare}
          icon={copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
          className="shrink-0"
        />
      </div>
    </div>
  );
}
