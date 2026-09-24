import { ParseResult, ParsedCard } from '@/types';

/**
 * Парсер строк flash-карточек:
 * 1. Поддерживает разделители: запятая (','), табуляция ('\t'), точка с запятой (';').
 * 2. Разделение строго по ПЕРВОМУ вхождению разделителя, чтобы определение могло содержать знаки препинания.
 * 3. Пустые строки игнорируются.
 * 4. Невалидные строки без разделителя формируют ошибку: "Строка X не может быть распознана."
 */
export function parseFlashcardsText(rawText: string): ParseResult {
  const lines = rawText.split(/\r?\n/);
  const cards: ParsedCard[] = [];
  const errors: string[] = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return; // Игнорируем пустые строки
    }

    const lineNumber = index + 1;
    let separatorIndex = -1;
    const separatorLength = 1;

    // Приоритет разделителей: запятая ',', таб '\t', точка с запятой ';'
    const commaIndex = trimmed.indexOf(',');
    const tabIndex = trimmed.indexOf('\t');
    const semiIndex = trimmed.indexOf(';');

    if (commaIndex !== -1) {
      separatorIndex = commaIndex;
    } else if (tabIndex !== -1) {
      separatorIndex = tabIndex;
    } else if (semiIndex !== -1) {
      separatorIndex = semiIndex;
    }

    if (separatorIndex === -1) {
      errors.push(`Строка ${lineNumber} не может быть распознана.`);
      return;
    }

    const term = trimmed.slice(0, separatorIndex).trim();
    const definition = trimmed.slice(separatorIndex + separatorLength).trim();

    if (!term || !definition) {
      errors.push(`Строка ${lineNumber}: термин или определение не могут быть пустыми.`);
      return;
    }

    cards.push({ term, definition });
  });

  return { cards, errors };
}
