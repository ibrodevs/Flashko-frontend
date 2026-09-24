export interface Flashcard {
  id: number;
  set: number;
  term: string;
  definition: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface ActiveSession {
  session_id: number;
  current_question_index: number;
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  mistakes_only: boolean;
  created_at: string;
}

export interface FlashcardSet {
  id: number;
  title: string;
  description: string;
  cards_count: number;
  share_id?: string;
  is_public?: boolean;
  author_username?: string;
  has_active_session?: boolean;
  active_session?: ActiveSession | null;
  mistakes_count?: number;
  mistake_card_ids?: number[];
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
