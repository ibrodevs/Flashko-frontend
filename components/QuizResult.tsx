'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from './Button';
import { CheckCircle2, XCircle, RotateCcw, AlertCircle, ArrowLeft } from 'lucide-react';

export interface QuizResultProps {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  setId: number | string;
  onStudyAgain: () => void;
  onReviewMistakes?: () => void;
}

export function QuizResult({
  totalQuestions,
  correctAnswers,
  incorrectAnswers,
  setId,
  onStudyAgain,
  onReviewMistakes,
}: QuizResultProps) {
  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const isPerfect = percentage === 100 && totalQuestions > 0;

  return (
    <div className="card max-w-lg mx-auto text-center p-5 sm:p-10 shadow-[var(--shadow-pop)]">
      {isPerfect ? (
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[var(--green-bg)] text-[var(--green)] flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <CheckCircle2 className="w-8 h-8 sm:w-9 sm:h-9" />
        </div>
      ) : (
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[var(--blue-soft)] text-[var(--blue)] flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <CheckCircle2 className="w-8 h-8 sm:w-9 sm:h-9" />
        </div>
      )}

      <h2 className="text-[24px] sm:text-[30px] font-bold text-[var(--ink)] tracking-tight">
        {isPerfect ? 'Отлично!' : 'Тест завершён!'}
      </h2>
      <p className="text-[14px] sm:text-[15px] text-[var(--muted)] mt-1 sm:mt-1.5">
        {isPerfect
          ? 'Вы ответили правильно на все вопросы.'
          : 'Хорошая тренировка! Посмотрите ваши результаты ниже.'}
      </p>

      {/* Score Big Display */}
      <div className="my-5 sm:my-8 p-4 sm:p-6 rounded-[16px] bg-[var(--surface-2)] border border-[var(--line)]">
        <div className="text-[42px] sm:text-[48px] font-extrabold text-[var(--ink)] tracking-tight leading-none">
          {correctAnswers} <span className="text-[24px] text-[var(--muted)] font-normal">/ {totalQuestions}</span>
        </div>
        <div className="text-[20px] font-bold text-[var(--blue)] mt-2">
          {percentage}%
        </div>

        <div className="flex items-center justify-center gap-6 mt-5 pt-4 border-t border-[var(--line)] text-sm font-semibold">
          <span className="flex items-center gap-1.5 text-[var(--green)]">
            <CheckCircle2 className="w-4 h-4" />
            {correctAnswers} верно
          </span>
          <span className="flex items-center gap-1.5 text-[var(--red-strong)]">
            <XCircle className="w-4 h-4" />
            {incorrectAnswers} с ошибкой
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        {incorrectAnswers > 0 && onReviewMistakes && (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={onReviewMistakes}
            icon={<AlertCircle className="w-4 h-4" />}
          >
            Повторить ошибки ({incorrectAnswers})
          </Button>
        )}

        <Button
          variant={incorrectAnswers > 0 ? 'secondary' : 'primary'}
          size="lg"
          fullWidth
          onClick={onStudyAgain}
          icon={<RotateCcw className="w-4 h-4" />}
        >
          Пройти снова
        </Button>

        <Link href={`/sets/${setId}`} className="w-full">
          <Button variant="ghost" size="md" fullWidth icon={<ArrowLeft className="w-4 h-4" />}>
            Вернуться к набору
          </Button>
        </Link>
      </div>
    </div>
  );
}
