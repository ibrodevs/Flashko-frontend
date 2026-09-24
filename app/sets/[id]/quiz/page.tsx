'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { quiz as quizApi } from '@/lib/quiz';
import {
  QuizQuestion,
  QuizAnswerResponse
} from '@/types';
import {
  Button,
  QuizOption,
  ProgressBar,
  QuizResult,
  Loading,
  ErrorMessage
} from '@/components';
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const setId = resolvedParams.id;

  const searchParams = useSearchParams();
  const mistakesOnlyParam = searchParams.get('mistakes') === 'true';
  const fromSessionIdParam = searchParams.get('from_session');
  const sessionIdParam = searchParams.get('session_id');

  const { user, initialized } = useAuth();
  const router = useRouter();

  // Quiz state
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [setTitle, setSetTitle] = useState('');
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [cachedNextQuestion, setCachedNextQuestion] = useState<QuizQuestion | null>(null);

  // Scores
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);

  // Answer interaction state
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [answerResult, setAnswerResult] = useState<QuizAnswerResponse | null>(null);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Start quiz session
  const initQuiz = useCallback(async (isMistakesReview = false, prevSessionId?: number) => {
    setError('');
    setIsFinished(false);
    setSelectedOptionId(null);
    setAnswerResult(null);
    setCachedNextQuestion(null);
    setCorrectCount(0);
    setIncorrectCount(0);

    try {
      const res = await quizApi.start(setId, {
        mistakes_only: isMistakesReview,
        from_session_id: prevSessionId,
      });

      setSessionId(res.session_id);
      setSetTitle(res.set_title);
      setTotalQuestions(res.total_questions);
      setCurrentQuestion(res.question);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Не удалось начать тест.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [setId]);

  useEffect(() => {
    if (initialized && !user) {
      router.replace('/login');
    }
  }, [initialized, user, router]);

  useEffect(() => {
    let ignore = false;
    if (user && setId) {
      (async () => {
        try {
          // If resuming an existing session
          if (sessionIdParam) {
            const existing = await quizApi.getById(Number(sessionIdParam));
            if (!ignore) {
              if (existing.is_completed) {
                setSessionId(existing.id);
                setSetTitle(existing.set_title || '');
                setTotalQuestions(existing.total_questions);
                setCorrectCount(existing.correct_answers);
                setIncorrectCount(existing.incorrect_answers);
                setIsFinished(true);
                setLoading(false);
                return;
              } else if (existing.question) {
                setSessionId(existing.id);
                setSetTitle(existing.set_title || '');
                setTotalQuestions(existing.total_questions);
                setCurrentQuestion(existing.question);
                setCorrectCount(existing.correct_answers);
                setIncorrectCount(existing.incorrect_answers);
                setLoading(false);
                return;
              }
            }
          }

          // Otherwise start fresh or mistakes review
          const prevSession = fromSessionIdParam ? Number(fromSessionIdParam) : undefined;
          const res = await quizApi.start(setId, {
            mistakes_only: mistakesOnlyParam,
            from_session_id: prevSession,
          });
          if (!ignore) {
            setSessionId(res.session_id);
            setSetTitle(res.set_title);
            setTotalQuestions(res.total_questions);
            setCurrentQuestion(res.question);
            setLoading(false);
          }
        } catch (err: unknown) {
          if (!ignore) {
            const msg = err instanceof Error ? err.message : 'Не удалось начать тест.';
            setError(msg);
            setLoading(false);
          }
        }
      })();
    }
    return () => {
      ignore = true;
    };
  }, [user, setId, mistakesOnlyParam, fromSessionIdParam, sessionIdParam]);

  // Handle option select
  const handleSelectOption = useCallback(async (optionId: string) => {
    if (!sessionId || !currentQuestion || selectedOptionId || submittingAnswer || isFinished) {
      return;
    }

    setSelectedOptionId(optionId);
    setSubmittingAnswer(true);

    try {
      const result = await quizApi.answer(sessionId, currentQuestion.question_id, optionId);
      setAnswerResult(result);
      setCorrectCount(result.correct_count);
      setIncorrectCount(result.incorrect_count);
      setCachedNextQuestion(result.next_question);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Не удалось отправить ответ.';
      setError(msg);
      setSelectedOptionId(null);
    } finally {
      setSubmittingAnswer(false);
    }
  }, [sessionId, currentQuestion, selectedOptionId, submittingAnswer, isFinished]);

  // Next question
  const handleNext = useCallback(() => {
    if (!answerResult) return;

    if (answerResult.is_completed || !cachedNextQuestion) {
      setIsFinished(true);
    } else {
      setCurrentQuestion(cachedNextQuestion);
      setCachedNextQuestion(null);
      setSelectedOptionId(null);
      setAnswerResult(null);
    }
  }, [answerResult, cachedNextQuestion]);

  // Keyboard shortcut listener (1, 2, 3, 4, and Enter for Next)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (!currentQuestion) return;

      // Enter or Space to proceed to next question once answered
      if (answerResult && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        handleNext();
        return;
      }

      // If already answered, keys are locked
      if (selectedOptionId || submittingAnswer || isFinished) {
        return;
      }

      const key = e.key;
      const keyMap: { [key: string]: number } = {
        '1': 0,
        '2': 1,
        '3': 2,
        '4': 3,
        'a': 0,
        'b': 1,
        'c': 2,
        'd': 3,
        'A': 0,
        'B': 1,
        'C': 2,
        'D': 3,
      };

      if (key in keyMap) {
        const optionIndex = keyMap[key];
        const opt = currentQuestion.options[optionIndex];
        if (opt) {
          e.preventDefault();
          handleSelectOption(opt.id);
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentQuestion, answerResult, selectedOptionId, submittingAnswer, isFinished, handleNext, handleSelectOption]);

  if (!initialized || loading) {
    return <Loading fullPage text="Подготовка тестирования..." />;
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-14 w-full text-center">
        <ErrorMessage message={error} className="mb-6" />
        <div className="flex items-center justify-center gap-3">
          <Link href={`/sets/${setId}`}>
            <Button variant="secondary" size="md" icon={<ArrowLeft className="w-4 h-4" />}>
              Назад к набору
            </Button>
          </Link>
          <Button variant="primary" size="md" onClick={() => initQuiz(false)}>
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  // Quiz Finished Screen
  if (isFinished) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full flex-1 flex flex-col justify-center">
        <QuizResult
          totalQuestions={totalQuestions}
          correctAnswers={correctCount}
          incorrectAnswers={incorrectCount}
          setId={setId}
          onStudyAgain={() => initQuiz(false)}
          onReviewMistakes={
            incorrectCount > 0 && sessionId
              ? () => initQuiz(true, sessionId)
              : undefined
          }
        />
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className={`max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10 w-full flex-1 flex flex-col justify-between ${answerResult ? 'pb-28 sm:pb-10' : ''}`}>
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between gap-4 mb-4 sm:mb-6">
          <Link
            href={`/sets/${setId}`}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Выйти из теста
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-[11px] sm:text-xs text-[var(--muted)] bg-[var(--surface-2)] px-2.5 py-1 rounded-full border border-[var(--line)] hidden xs:inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)]" />
              Черновик сохранён
            </span>
            <span className="text-xs sm:text-sm font-bold text-[var(--ink)] line-clamp-1 max-w-[140px] sm:max-w-[200px] text-right">
              {setTitle}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 sm:mb-8">
          <ProgressBar
            current={currentQuestion.question_number}
            total={totalQuestions}
            correctCount={correctCount}
            incorrectCount={incorrectCount}
          />
        </div>

        {/* Question Area */}
        <div className="card card-pad mb-4 sm:mb-6 bg-[var(--surface)] text-left">
          <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider block mb-1.5">
            Вопрос {currentQuestion.question_number} из {totalQuestions}
          </span>
          <h2 className="text-[20px] sm:text-[26px] font-bold text-[var(--ink)] tracking-tight leading-snug">
            {currentQuestion.question}
          </h2>
        </div>

        {/* Options Grid */}
        <div className="space-y-2.5 sm:space-y-3">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedOptionId === option.id;
            const isAnswered = answerResult !== null;
            const isCorrect = isAnswered ? answerResult.correct : undefined;
            const isRevealedCorrect =
              isAnswered && !answerResult.correct && answerResult.correct_option === option.id;

            return (
              <QuizOption
                key={option.id}
                id={option.id}
                shortcutKey={String(idx + 1)}
                text={option.text}
                isSelected={isSelected}
                isCorrect={isSelected ? isCorrect : undefined}
                isRevealedCorrect={isRevealedCorrect}
                disabled={isAnswered || submittingAnswer}
                onClick={() => handleSelectOption(option.id)}
              />
            );
          })}
        </div>

        {/* Feedback & Next Button - Floating on mobile, inline on desktop */}
        {answerResult && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--line)] shadow-[0_-6px_20px_rgba(0,0,0,0.08)] z-40 sm:relative sm:mt-6 sm:border sm:rounded-[16px] sm:shadow-[var(--shadow-card)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              {answerResult.correct ? (
                <>
                  <div className="w-8 h-8 rounded-full bg-[var(--green-bg)] text-[var(--green)] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[15px] font-bold text-[var(--green)]">
                      Правильно!
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-full bg-[var(--red-bg)] text-[var(--red-strong)] flex items-center justify-center shrink-0">
                    <XCircle className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-[14px] sm:text-[15px] font-bold text-[var(--red-strong)]">
                      Неправильно
                    </div>
                    <div className="text-xs text-[var(--muted)] line-clamp-1">
                      Правильный ответ: <span className="font-semibold text-[var(--ink)]">{answerResult.correct_text}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={handleNext}
              icon={<ArrowRight className="w-4 h-4" />}
              className="w-full sm:w-auto sm:self-center py-3 sm:py-2"
            >
              {currentQuestion.question_number >= totalQuestions ? 'Посмотреть результаты' : 'Следующий вопрос'}
            </Button>
          </div>
        )}
      </div>


      {/* Keyboard Shortcut Hint for Desktop */}
      <div className="mt-8 text-center text-xs text-[var(--muted)]/70 hidden sm:block">
        {!answerResult ? (
          <span>Подсказка: нажимайте клавиши <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--line)] text-[var(--ink)] font-mono">1</kbd>–<kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--line)] text-[var(--ink)] font-mono">4</kbd> на клавиатуре для выбора ответа</span>
        ) : (
          <span>Подсказка: нажмите <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--line)] text-[var(--ink)] font-mono">Enter</kbd> или <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--line)] text-[var(--ink)] font-mono">Пробел</kbd> для следующего вопроса</span>
        )}
      </div>
    </div>
  );
}
