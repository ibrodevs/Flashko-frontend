import { api } from './api';
import {
  FlashcardSet,
  FlashcardSetDetail,
  CreateSetPayload,
  UpdateSetPayload,
  Flashcard
} from '@/types';

export const sets = {
  async getAll(): Promise<FlashcardSet[]> {
    return api.get<FlashcardSet[]>('/api/sets/');
  },

  async getById(id: number | string): Promise<FlashcardSetDetail> {
    return api.get<FlashcardSetDetail>(`/api/sets/${id}/`);
  },

  async create(payload: CreateSetPayload): Promise<FlashcardSetDetail> {
    return api.post<FlashcardSetDetail>('/api/sets/', payload);
  },

  async update(id: number | string, payload: UpdateSetPayload): Promise<FlashcardSetDetail> {
    return api.patch<FlashcardSetDetail>(`/api/sets/${id}/`, payload);
  },

  async delete(id: number | string): Promise<void> {
    return api.delete(`/api/sets/${id}/`);
  },

  async getCards(setId: number | string): Promise<Flashcard[]> {
    return api.get<Flashcard[]>(`/api/sets/${setId}/cards/`);
  },

  async addCard(setId: number | string, card: { term: string; definition: string }): Promise<Flashcard> {
    return api.post<Flashcard>(`/api/sets/${setId}/cards/`, card);
  },

  async updateCard(cardId: number | string, card: { term?: string; definition?: string }): Promise<Flashcard> {
    return api.patch<Flashcard>(`/api/cards/${cardId}/`, card);
  },

  async deleteCard(cardId: number | string): Promise<void> {
    return api.delete(`/api/cards/${cardId}/`);
  },
};
