import { ParseResult, ParsedCard } from '@/types';

/**
 * Parses raw flashcard import text according to project requirements:
 * 1. Supports separators: comma (','), tab ('\t'), semicolon (';'). Comma is prioritized.
 * 2. Splitting only by the FIRST separator occurrence so definition can contain commas/semicolons.
 * 3. Empty or whitespace-only lines are ignored.
 * 4. Invalid lines without a delimiter result in error: "Line X could not be parsed."
 */
export function parseFlashcardsText(rawText: string): ParseResult {
  const lines = rawText.split(/\r?\n/);
  const cards: ParsedCard[] = [];
  const errors: string[] = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return; // Ignore empty lines
    }

    const lineNumber = index + 1;
    let separatorIndex = -1;
    const separatorLength = 1;

    // Detect delimiter: priority comma ',', tab '\t', semicolon ';'
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
      errors.push(`Line ${lineNumber} could not be parsed.`);
      return;
    }

    const term = trimmed.slice(0, separatorIndex).trim();
    const definition = trimmed.slice(separatorIndex + separatorLength).trim();

    if (!term || !definition) {
      errors.push(`Line ${lineNumber} could not be parsed. Term or definition is empty.`);
      return;
    }

    cards.push({ term, definition });
  });

  return { cards, errors };
}
