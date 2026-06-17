"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { SearchOverlay } from "./SearchOverlay";

interface SearchContextValue {
  /** Open the full-screen search overlay. */
  openSearch: () => void;
}

const SearchContext = createContext<SearchContextValue | null>(null);

/**
 * Hosts the search overlay and exposes `openSearch()` so the Search top bar's
 * field can trigger it from anywhere inside the top-level app shell.
 */
export function SearchProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openSearch = useCallback(() => setOpen(true), []);
  const closeSearch = useCallback(() => setOpen(false), []);

  return (
    <SearchContext.Provider value={{ openSearch }}>
      {children}
      {open && <SearchOverlay onClose={closeSearch} />}
    </SearchContext.Provider>
  );
}

export function useSearch(): SearchContextValue {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used within a SearchProvider");
  return ctx;
}
