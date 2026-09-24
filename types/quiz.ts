import { Flashcard } from './flashcard';

export interface QuizOption {
  id: string; // 'a', 'b', 'c', 'd'
  text: string;
}

export interface QuizQuestion {
  question_id: number;
  question: string;
  term: string;
  options: QuizOption[];
  question_number: number;
  total_questions: number;
}

export interface QuizStartResponse {
  session_id: number;
  set_id: number;
  set_title: string;
  total_questions: number;
  current_question_index: number;
  mistakes_only: boolean;
  question: QuizQuestion;
}

export interface QuizAnswerResponse {
  correct: boolean;
  correct_option: string;
  correct_text: string;
  selected_option: string;
  correct_count: number;
  incorrect_count: number;
  total_questions: number;
  current_question_index: number;
  is_completed: boolean;
  next_question: QuizQuestion | null;
}

export interface StudyAnswer {
  id: number;
  flashcard: Flashcard;
  selected_answer: string;
  selected_option: string;
  correct: boolean;
  created_at: string;
}

export interface QuizSessionDetail {
  id: number;
  set: number;
  set_title: string;
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  percentage: number;
  is_completed: boolean;
  mistakes_only: boolean;
  current_question_index: number;
  created_at: string;
  completed_at: string | null;
  mistake_card_ids: number[];
  answers: StudyAnswer[];
  current_question?: QuizQuestion;
}
