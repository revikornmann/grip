"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
} from "react";
import { storage } from "@/lib/storage";
import {
  type Region,
  regionOptions,
  defaultRegion,
  REGION_STORAGE_KEY,
} from "@/lib/regions";

// Custom event fired when the region changes, so useSyncExternalStore re-reads.
const REGION_EVENT = "grip:region-change";

function subscribe(callback: () => void): () => void {
  window.addEventListener(REGION_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(REGION_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function isRegion(value: unknown): value is Region {
  return regionOptions.includes(value as Region);
}

function getRegionSnapshot(): Region {
  const stored = storage.get<Region>(REGION_STORAGE_KEY);
  return isRegion(stored) ? stored : defaultRegion;
}

// During SSR and the initial hydration render, always use the default so server
// HTML and the first client render agree; the stored value is adopted after
// hydration with no mismatch.
function getServerRegionSnapshot(): Region {
  return defaultRegion;
}

interface RegionContextValue {
  region: Region;
  setRegion: (region: Region) => void;
}

const RegionContext = createContext<RegionContextValue | undefined>(undefined);

export function useRegion() {
  const ctx = useContext(RegionContext);
  if (!ctx) throw new Error("useRegion must be used within RegionProvider");
  return ctx;
}

export function RegionProvider({ children }: { children: React.ReactNode }) {
  const region = useSyncExternalStore(
    subscribe,
    getRegionSnapshot,
    getServerRegionSnapshot,
  );

  const setRegion = useCallback((newRegion: Region) => {
    storage.set(REGION_STORAGE_KEY, newRegion);
    window.dispatchEvent(new Event(REGION_EVENT));
  }, []);

  return (
    <RegionContext.Provider value={{ region, setRegion }}>
      {children}
    </RegionContext.Provider>
  );
}
