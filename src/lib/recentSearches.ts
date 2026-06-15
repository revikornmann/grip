import { storage } from "@/lib/storage";

/**
 * A motorcycle model the user has previewed from the Search screen. Persisted in
 * localStorage so it can be surfaced as "Recent searches" on the next visit.
 */
export interface RecentSearch {
  /** motorcycle_models.id — used to reopen the catalog preview at /model/[id]. */
  id: string;
  make: string;
  model: string;
  year: number;
}

const KEY = "recent-searches";
const MAX = 8;

export function getRecentSearches(): RecentSearch[] {
  return storage.get<RecentSearch[]>(KEY) ?? [];
}

/**
 * Record a previewed model. Most-recent-first, deduped by id, capped at MAX.
 */
export function addRecentSearch(item: RecentSearch): RecentSearch[] {
  const existing = getRecentSearches().filter((r) => r.id !== item.id);
  const next = [item, ...existing].slice(0, MAX);
  storage.set(KEY, next);
  return next;
}

/**
 * Prime the list when the user has none yet (e.g. from the catalog), so the
 * Search screen has something to show. No-op once any search has been recorded.
 */
export function seedRecentSearches(items: RecentSearch[]): RecentSearch[] {
  const existing = getRecentSearches();
  if (existing.length > 0) return existing;
  const seeded = items.slice(0, MAX);
  storage.set(KEY, seeded);
  return seeded;
}
