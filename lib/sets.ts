import { api } from './api';
import { clearSetsCache, readSetsCache, writeSetsCache } from './sets-cache';
import {
  FlashcardSet,
  FlashcardSetDetail,
  CreateSetPayload,
  UpdateSetPayload,
  Flashcard
} from '@/types';

const DETAIL_CACHE_TTL_MS = 30_000;
const detailCache = new Map<string, { expiresAt: number; promise: Promise<FlashcardSetDetail> }>();

function detailKey(id: number | string): string {
  return String(id);
}

function clearDetailCache(id?: number | string): void {
  if (id === undefined) {
    detailCache.clear();
    return;
  }
  detailCache.delete(detailKey(id));
}

export const sets = {
  getCached(): FlashcardSet[] | null {
    return readSetsCache();
  },

  clearCache(): void {
    clearSetsCache();
    clearDetailCache();
  },

  async getAll(): Promise<FlashcardSet[]> {
    const data = await api.get<FlashcardSet[]>('/api/sets/');
    writeSetsCache(data);
    return data;
  },

  async getById(id: number | string): Promise<FlashcardSetDetail> {
    const key = detailKey(id);
    const cached = detailCache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.promise;
    }

    const promise = api.get<FlashcardSetDetail>(`/api/sets/${id}/`);
    detailCache.set(key, {
      expiresAt: Date.now() + DETAIL_CACHE_TTL_MS,
      promise,
    });

    try {
      return await promise;
    } catch (error) {
      detailCache.delete(key);
      throw error;
    }
  },

  prefetchById(id: number | string): void {
    void this.getById(id).catch(() => {
      // Navigation will surface the real error if the user opens the set.
    });
  },

  async create(payload: CreateSetPayload): Promise<FlashcardSetDetail> {
    const result = await api.post<FlashcardSetDetail>('/api/sets/', payload);
    clearSetsCache();
    clearDetailCache();
    return result;
  },

  async update(id: number | string, payload: UpdateSetPayload): Promise<FlashcardSetDetail> {
    const result = await api.patch<FlashcardSetDetail>(`/api/sets/${id}/`, payload);
    clearSetsCache();
    clearDetailCache(id);
    return result;
  },

  async delete(id: number | string): Promise<void> {
    await api.delete(`/api/sets/${id}/`);
    clearSetsCache();
    clearDetailCache(id);
  },

  async getCards(setId: number | string): Promise<Flashcard[]> {
    return api.get<Flashcard[]>(`/api/sets/${setId}/cards/`);
  },

  async addCard(setId: number | string, card: { term: string; definition: string }): Promise<Flashcard> {
    const result = await api.post<Flashcard>(`/api/sets/${setId}/cards/`, card);
    clearSetsCache();
    clearDetailCache(setId);
    return result;
  },

  async updateCard(cardId: number | string, card: { term?: string; definition?: string }): Promise<Flashcard> {
    const result = await api.patch<Flashcard>(`/api/cards/${cardId}/`, card);
    clearSetsCache();
    clearDetailCache();
    return result;
  },

  async deleteCard(cardId: number | string): Promise<void> {
    await api.delete(`/api/cards/${cardId}/`);
    clearSetsCache();
    clearDetailCache();
  },

  async getShared(shareId: string): Promise<FlashcardSetDetail> {
    return api.get<FlashcardSetDetail>(`/api/sets/share/${shareId}/`, { skipAuth: true });
  },

  async copyShared(shareId: string): Promise<FlashcardSetDetail> {
    const result = await api.post<FlashcardSetDetail>(`/api/sets/share/${shareId}/copy/`);
    clearSetsCache();
    clearDetailCache();
    return result;
  },
};
