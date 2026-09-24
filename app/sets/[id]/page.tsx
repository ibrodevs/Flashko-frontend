'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { sets as setsApi } from '@/lib/sets';
import { quiz as quizApi } from '@/lib/quiz';
import { FlashcardSetDetail } from '@/types';
import { pluralize, formatDateRu } from '@/lib/format';
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
  AlertCircle,
  Share2,
  Copy,
  Check,
  RotateCcw
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

  // Share state
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Active draft session discard state
  const [discardingDraft, setDiscardingDraft] = useState(false);

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
          setError('Набор не найден.');
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Не удалось загрузить набор.');
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
      const msg = err instanceof Error ? err.message : 'Не удалось удалить набор.';
      setError(msg);
      setDeleteModalOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleDiscardDraft = async () => {
    if (!setDetail?.active_session) return;
    setDiscardingDraft(true);
    try {
      await quizApi.discard(setDetail.active_session.session_id);
      setSetDetail({ ...setDetail, active_session: null, has_active_session: false });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Не удалось сбросить черновик теста.';
      setError(msg);
    } finally {
      setDiscardingDraft(false);
    }
  };

  const shareUrl = typeof window !== 'undefined' && setDetail?.share_id
    ? `${window.location.origin}/sets/share/${setDetail.share_id}`
    : '';

  const handleCopyShareLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (!setDetail || !shareUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Flashko: ${setDetail.title}`,
          text: `Изучайте набор карточек «${setDetail.title}» в Flashko!`,
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopyShareLink();
    }
  };

  if (!initialized || (loading && !setDetail)) {
    return <Loading fullPage text="Загрузка набора..." />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full text-center">
        <ErrorMessage message={error} className="max-w-md mx-auto mb-6" />
        <Link href="/dashboard">
          <Button variant="secondary" size="md" icon={<ArrowLeft className="w-4 h-4" />}>
            Назад к наборам
          </Button>
        </Link>
      </div>
    );
  }

  if (!setDetail) return null;

  const formattedDate = formatDateRu(setDetail.created_at);
  const canStartQuiz = setDetail.cards.length >= 4;
  const remainingCards = 4 - setDetail.cards.length;
  const mistakeCount = setDetail.mistakes_count ?? 0;
  const mistakeIds = new Set(setDetail.mistake_card_ids ?? []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 w-full flex-1">
      {/* Back button */}
      <div className="mb-4 sm:mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к наборам
        </Link>
      </div>

      {/* Active Draft Banner */}
      {setDetail.active_session && (
        <div className="mb-6 p-4 sm:p-5 rounded-[18px] bg-[var(--blue-soft)] border border-[var(--blue)]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-in fade-in">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-full bg-[var(--blue)] text-white flex items-center justify-center shrink-0 mt-0.5">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-[15px] sm:text-[16px] text-[var(--ink)]">
                У вас есть незавершённый тест
              </div>
              <p className="text-xs sm:text-[13.5px] text-[var(--muted)] mt-0.5 leading-relaxed">
                Остановились на вопросе {setDetail.active_session.current_question_index + 1} из {setDetail.active_session.total_questions} • Верно: {setDetail.active_session.correct_answers} • С ошибкой: {setDetail.active_session.incorrect_answers}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0 w-full sm:w-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDiscardDraft}
              loading={discardingDraft}
              className="text-[var(--muted)] hover:text-[var(--red-strong)] hover:bg-[var(--red-bg)] flex-1 sm:flex-initial"
            >
              Сбросить
            </Button>
            <Link
              href={`/sets/${setId}/quiz?session_id=${setDetail.active_session.session_id}`}
              className="flex-1 sm:flex-initial"
            >
              <Button
                variant="primary"
                size="sm"
                fullWidth
                icon={<Play className="w-3.5 h-3.5 fill-current" />}
              >
                Продолжить тест
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Set Header Card */}
      <div className="card card-pad mb-6 sm:mb-8 space-y-5">
        <div>
          <h1 className="text-[26px] sm:text-[32px] font-bold text-[var(--ink)] tracking-tight break-words">
            {setDetail.title}
          </h1>
          {setDetail.description && (
            <p className="text-[14.5px] sm:text-[16px] text-[var(--muted)] mt-2 leading-relaxed whitespace-pre-wrap">
              {setDetail.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 mt-4 text-[13px] sm:text-[13.5px] text-[var(--muted)] font-medium">
            <span className="flex items-center gap-1.5 text-[var(--ink)] font-semibold">
              <BookOpen className="w-4 h-4 text-[var(--blue)]" />
              {pluralize(setDetail.cards.length, 'карточка', 'карточки', 'карточек')}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Создан {formattedDate}
            </span>
            {mistakeCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--amber-bg)] text-[var(--amber)] border border-[var(--amber)]/20">
                <AlertCircle className="w-3.5 h-3.5" />
                {pluralize(mistakeCount, 'ошибка', 'ошибки', 'ошибок')}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="pt-4 border-t border-[var(--line)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Primary Learning Actions */}
          <div className="flex flex-col xs:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            <Link href={`/sets/${setId}/quiz`} className="flex-1">
              <Button
                variant="primary"
                size="md"
                fullWidth
                disabled={!canStartQuiz}
                icon={<Play className="w-4 h-4 fill-current" />}
              >
                Начать тест
              </Button>
            </Link>

            {mistakeCount > 0 && (
              <Link href={`/sets/${setId}/quiz?mistakes=true`} className="flex-1">
                <Button
                  variant="secondary"
                  size="md"
                  fullWidth
                  icon={<AlertCircle className="w-4 h-4 text-[var(--amber)]" />}
                  className="border-[var(--amber)]/40 text-[var(--amber)] hover:bg-[var(--amber-bg)] font-semibold"
                >
                  Ошибки ({mistakeCount})
                </Button>
              </Link>
            )}
          </div>

          {/* Utility Actions */}
          <div className="grid grid-cols-3 sm:flex sm:items-center gap-2 w-full sm:w-auto">
            <Button
              variant="secondary"
              size="md"
              fullWidth
              onClick={() => setShareModalOpen(true)}
              icon={<Share2 className="w-4 h-4" />}
            >
              <span className="text-xs sm:text-sm truncate">Поделиться</span>
            </Button>

            <Link href={`/sets/${setId}/edit`} className="w-full sm:w-auto">
              <Button variant="secondary" size="md" fullWidth icon={<Edit2 className="w-3.5 h-3.5" />}>
                <span className="text-xs sm:text-sm truncate">Изменить</span>
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="md"
              fullWidth
              onClick={() => setDeleteModalOpen(true)}
              icon={<Trash2 className="w-4 h-4" />}
              className="text-[var(--red-strong)] hover:bg-[var(--red-bg)]"
            >
              <span className="text-xs sm:text-sm truncate">Удалить</span>
            </Button>
          </div>
        </div>

        {!canStartQuiz && (
          <div className="p-3.5 rounded-[12px] bg-[var(--amber-bg)] text-[var(--amber)] text-xs font-semibold flex items-center gap-2 border border-[var(--amber)]/20">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              Для запуска теста требуется минимум 4 карточки. Добавьте ещё {pluralize(remainingCards, 'карточку', 'карточки', 'карточек')}, чтобы начать тест.
            </span>
          </div>
        )}
      </div>

      {/* Cards List Section */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
          <h2 className="text-[19px] sm:text-[20px] font-bold text-[var(--ink)]">
            Карточки ({setDetail.cards.length})
          </h2>
          {mistakeCount > 0 && (
            <Link
              href={`/sets/${setId}/quiz?mistakes=true`}
              className="text-xs font-semibold text-[var(--amber)] hover:underline flex items-center gap-1"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              Пройти тест по ошибкам ({mistakeCount})
            </Link>
          )}
        </div>

        <div className="space-y-2.5 sm:space-y-3">
          {setDetail.cards.map((card, idx) => (
            <Flashcard
              key={card.id}
              index={idx + 1}
              term={card.term}
              definition={card.definition}
              hasMistake={mistakeIds.has(card.id)}
            />
          ))}
        </div>
      </div>

      {/* Share Modal */}
      <Modal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title="Поделиться набором"
        description="Отправьте эту ссылку друзьям или ученикам. Любой человек сможет просматривать и копировать карточки себе."
      >
        <div className="space-y-4 mt-5">
          <div className="flex items-center gap-2 p-2.5 rounded-[12px] bg-[var(--surface-2)] border border-[var(--line)]">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-transparent text-xs sm:text-sm text-[var(--ink)] font-mono outline-none px-2 select-all overflow-hidden text-ellipsis"
            />
            <Button
              variant={copiedLink ? 'primary' : 'secondary'}
              size="sm"
              onClick={handleCopyShareLink}
              icon={copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copiedLink ? 'Скопировано!' : 'Копировать'}
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={handleNativeShare}
                icon={<Share2 className="w-4 h-4" />}
              >
                Поделиться в приложении
              </Button>
            )}
            <Button
              variant="ghost"
              size="md"
              fullWidth
              onClick={() => setShareModalOpen(false)}
            >
              Закрыть
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Удалить этот набор?"
        description="Все карточки в этом наборе будут удалены безвозвратно. Это действие нельзя отменить."
      >
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button
            variant="ghost"
            size="md"
            onClick={() => setDeleteModalOpen(false)}
            disabled={deleting}
          >
            Отмена
          </Button>
          <Button
            variant="danger"
            size="md"
            onClick={handleDelete}
            loading={deleting}
          >
            Удалить
          </Button>
        </div>
      </Modal>
    </div>
  );
}

