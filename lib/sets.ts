import { api } from './api';
import { clearSetsCache, readSetsCache, writeSetsCache } from './sets-cache';
import {
  FlashcardSet,
  FlashcardSetDetail,
  CreateSetPayload,
  UpdateSetPayload,
  Flashcard
} from '@/types';

export const sets = {
  getCached(): FlashcardSet[] | null {
    return readSetsCache();
  },

  clearCache(): void {
    clearSetsCache();
  },

  async getAll(): Promise<FlashcardSet[]> {
    const data = await api.get<FlashcardSet[]>('/api/sets/');
    writeSetsCache(data);
    return data;
  },

  async getById(id: number | string): Promise<FlashcardSetDetail> {
    return api.get<FlashcardSetDetail>(`/api/sets/${id}/`);
  },

  async create(payload: CreateSetPayload): Promise<FlashcardSetDetail> {
    const result = await api.post<FlashcardSetDetail>('/api/sets/', payload);
    clearSetsCache();
    return result;
  },

  async update(id: number | string, payload: UpdateSetPayload): Promise<FlashcardSetDetail> {
    const result = await api.patch<FlashcardSetDetail>(`/api/sets/${id}/`, payload);
    clearSetsCache();
    return result;
  },

  async delete(id: number | string): Promise<void> {
    await api.delete(`/api/sets/${id}/`);
    clearSetsCache();
  },

  async getCards(setId: number | string): Promise<Flashcard[]> {
    return api.get<Flashcard[]>(`/api/sets/${setId}/cards/`);
  },

  async addCard(setId: number | string, card: { term: string; definition: string }): Promise<Flashcard> {
    const result = await api.post<Flashcard>(`/api/sets/${setId}/cards/`, card);
    clearSetsCache();
    return result;
  },

  async updateCard(cardId: number | string, card: { term?: string; definition?: string }): Promise<Flashcard> {
    const result = await api.patch<Flashcard>(`/api/cards/${cardId}/`, card);
    clearSetsCache();
    return result;
  },

  async deleteCard(cardId: number | string): Promise<void> {
    await api.delete(`/api/cards/${cardId}/`);
    clearSetsCache();
  },

  async getShared(shareId: string): Promise<FlashcardSetDetail> {
    return api.get<FlashcardSetDetail>(`/api/sets/share/${shareId}/`, { skipAuth: true });
  },

  async copyShared(shareId: string): Promise<FlashcardSetDetail> {
    const result = await api.post<FlashcardSetDetail>(`/api/sets/share/${shareId}/copy/`);
    clearSetsCache();
    return result;
  },
};
