import { api } from './api';
import {
  QuizStartResponse,
  QuizAnswerResponse,
  QuizSessionDetail
} from '@/types';

export const quiz = {
  async start(setId: number | string, options: { mistakes_only?: boolean; from_session_id?: number } = {}): Promise<QuizStartResponse> {
    return api.post<QuizStartResponse>('/api/quiz/start/', {
      set_id: Number(setId),
      mistakes_only: options.mistakes_only || false,
      from_session_id: options.from_session_id || null,
    });
  },

  async answer(sessionId: number | string, questionId: number, selectedOption: string): Promise<QuizAnswerResponse> {
    return api.post<QuizAnswerResponse>(`/api/quiz/${sessionId}/answer/`, {
      question_id: questionId,
      selected_option: selectedOption,
    });
  },

  async finish(sessionId: number | string): Promise<QuizSessionDetail> {
    return api.post<QuizSessionDetail>(`/api/quiz/${sessionId}/finish/`);
  },

  async getById(sessionId: number | string): Promise<QuizStartResponse & QuizSessionDetail> {
    return api.get<QuizStartResponse & QuizSessionDetail>(`/api/quiz/${sessionId}/`);
  },

  async discard(sessionId: number | string): Promise<{ detail: string }> {
    return api.post<{ detail: string }>(`/api/quiz/${sessionId}/discard/`);
  },
};

