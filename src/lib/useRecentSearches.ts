"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { listRecentModels } from "@/lib/catalog";
import {
  getRecentSearches,
  seedRecentSearches,
  type RecentSearch,
} from "@/lib/recentSearches";

/**
 * Recent searches for the Search screen and overlay.
 *
 * Reads any stored searches immediately (no auth needed for localStorage), then
 * — once an authenticated session exists and nothing is stored yet — seeds from
 * the most recent catalog models so the section isn't empty on first visit.
 *
 * Re-reads on every mount, so a freshly mounted overlay reflects searches
 * recorded since the user last opened it.
 *
 * @param limit Max entries to return (home screen shows 5, the search overlay 10).
 */
export function useRecentSearches(limit = 10): RecentSearch[] {
  const { user } = useAuth();
  const [recent, setRecent] = useState<RecentSearch[]>([]);

  useEffect(() => {
    const stored = getRecentSearches();
    if (stored.length > 0) setRecent(stored);
  }, []);

  useEffect(() => {
    if (!user) return;
    if (getRecentSearches().length > 0) return;
    // Seed the full cap so both consumers (home/overlay) share one stored list.
    listRecentModels(10)
      .then((models) => setRecent(seedRecentSearches(models)))
      .catch(() => {
        /* leave the section empty if the catalog can't be read */
      });
  }, [user]);

  return recent.slice(0, limit);
}
