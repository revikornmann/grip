"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
} from "react";
import { storage } from "@/lib/storage";
import { type Units, defaultUnits, UNITS_STORAGE_KEY } from "@/lib/units";

// Custom event fired when units change, so useSyncExternalStore re-reads.
const UNITS_EVENT = "grip:units-change";

function subscribe(callback: () => void): () => void {
  window.addEventListener(UNITS_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(UNITS_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getUnitsSnapshot(): Units {
  const stored = storage.get<Units>(UNITS_STORAGE_KEY);
  return stored === "metric" || stored === "imperial" ? stored : defaultUnits;
}

// During SSR and the initial hydration render, always use the default so
// server HTML and the first client render agree; the stored value is adopted
// after hydration with no mismatch.
function getServerUnitsSnapshot(): Units {
  return defaultUnits;
}

interface UnitsContextValue {
  units: Units;
  setUnits: (units: Units) => void;
}

const UnitsContext = createContext<UnitsContextValue | undefined>(undefined);

export function useUnits() {
  const ctx = useContext(UnitsContext);
  if (!ctx) throw new Error("useUnits must be used within UnitsProvider");
  return ctx;
}

export function UnitsProvider({ children }: { children: React.ReactNode }) {
  const units = useSyncExternalStore(
    subscribe,
    getUnitsSnapshot,
    getServerUnitsSnapshot,
  );

  const setUnits = useCallback((newUnits: Units) => {
    storage.set(UNITS_STORAGE_KEY, newUnits);
    window.dispatchEvent(new Event(UNITS_EVENT));
  }, []);

  return (
    <UnitsContext.Provider value={{ units, setUnits }}>
      {children}
    </UnitsContext.Provider>
  );
}
