"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useSyncExternalStore,
} from "react";
import { NextIntlClientProvider } from "next-intl";
import { storage } from "@/lib/storage";
import {
  type Locale,
  defaultLocale,
  LOCALE_STORAGE_KEY,
} from "@/i18n/config";
import nlMessages from "@/messages/nl.json";
import enMessages from "@/messages/en.json";

const messagesMap: Record<Locale, typeof nlMessages> = {
  nl: nlMessages,
  en: enMessages,
};

// Custom event fired when the locale changes, so useSyncExternalStore re-reads.
const LOCALE_EVENT = "grip:locale-change";

function subscribe(callback: () => void): () => void {
  window.addEventListener(LOCALE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(LOCALE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getLocaleSnapshot(): Locale {
  const stored = storage.get<Locale>(LOCALE_STORAGE_KEY);
  return stored === "nl" || stored === "en" ? stored : defaultLocale;
}

// During SSR and the initial hydration render, React uses the server snapshot —
// always the default — so server HTML and first client render agree. After
// hydration it switches to the stored value, with no hydration mismatch.
function getServerLocaleSnapshot(): Locale {
  return defaultLocale;
}

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(
    subscribe,
    getLocaleSnapshot,
    getServerLocaleSnapshot,
  );

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    storage.set(LOCALE_STORAGE_KEY, newLocale);
    document.documentElement.lang = newLocale;
    window.dispatchEvent(new Event(LOCALE_EVENT));
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider
        locale={locale}
        messages={messagesMap[locale]}
        timeZone="Europe/Amsterdam"
      >
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}
