export interface Flashcard {
  id: number;
  set: number;
  term: string;
  definition: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface FlashcardSet {
  id: number;
  title: string;
  description: string;
  cards_count: number;
  created_at: string;
  updated_at: string;
}

export interface FlashcardSetDetail extends FlashcardSet {
  cards: Flashcard[];
}

export interface ParsedCard {
  term: string;
  definition: string;
}

export interface ParseResult {
  cards: ParsedCard[];
  errors: string[];
}

export interface CreateSetPayload {
  title: string;
  description?: string;
  cards?: ParsedCard[];
}

export interface UpdateSetPayload {
  title?: string;
  description?: string;
  cards?: Array<{
    id?: number;
    term: string;
    definition: string;
  }>;
}
