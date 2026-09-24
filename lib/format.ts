/**
 * Склонение существительных в зависимости от числительного.
 * Пример: pluralize(5, 'карточка', 'карточки', 'карточек') -> "5 карточек"
 */
export function pluralize(count: number, one: string, few: string, many: string, includeNumber = true): string {
  const abs = Math.abs(count) % 100;
  const num = abs % 10;
  let word = many;

  if (abs > 10 && abs < 20) {
    word = many;
  } else if (num > 1 && num < 5) {
    word = few;
  } else if (num === 1) {
    word = one;
  }

  return includeNumber ? `${count} ${word}` : word;
}

/**
 * Форматирование даты на русском языке.
 * Пример: "24 сен. 2026 г." или "24 сентября 2026"
 */
export function formatDateRu(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatMonthYearRu(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric',
  });
}
