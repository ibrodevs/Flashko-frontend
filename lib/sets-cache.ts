import type { FlashcardSet } from '@/types';

const CACHE_KEY = 'flashko_sets_cache_v1';
const CACHE_TTL_MS = 2 * 60 * 1000;

type SetsCachePayload = {
  savedAt: number;
  data: FlashcardSet[];
};

export function readSetsCache(): FlashcardSet[] | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as SetsCachePayload;
    if (!Array.isArray(parsed.data) || typeof parsed.savedAt !== 'number') {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }

    if (Date.now() - parsed.savedAt > CACHE_TTL_MS) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
}

export function writeSetsCache(data: FlashcardSet[]): void {
  if (typeof window === 'undefined') return;

  try {
    const payload: SetsCachePayload = {
      savedAt: Date.now(),
      data,
    };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Storage can be unavailable in privacy modes; the app still works without cache.
  }
}

export function clearSetsCache(): void {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch {
    // Ignore storage errors.
  }
}
