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
  locales,
  defaultLocale,
  LOCALE_STORAGE_KEY,
} from "@/i18n/config";
import nlMessages from "@/messages/nl.json";
import enMessages from "@/messages/en.json";
import deMessages from "@/messages/de.json";
import frMessages from "@/messages/fr.json";
import esMessages from "@/messages/es.json";
import ptMessages from "@/messages/pt.json";
import idMessages from "@/messages/id.json";
import viMessages from "@/messages/vi.json";
import jaMessages from "@/messages/ja.json";
import zhMessages from "@/messages/zh.json";
import hiMessages from "@/messages/hi.json";

// Each locale in the picker has a translation file. The AI-generated sets
// (everything but nl/en) are first-pass and pending review; any locale without
// an entry here would fall back to English. To add or replace one, drop a
// `messages/<locale>.json` in and map it below.
const translated: Partial<Record<Locale, typeof nlMessages>> = {
  nl: nlMessages,
  en: enMessages,
  de: deMessages,
  fr: frMessages,
  es: esMessages,
  pt: ptMessages,
  id: idMessages,
  vi: viMessages,
  ja: jaMessages,
  zh: zhMessages,
  hi: hiMessages,
};

const messagesMap = Object.fromEntries(
  locales.map((l) => [l, translated[l] ?? enMessages]),
) as Record<Locale, typeof nlMessages>;

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
  return stored && locales.includes(stored) ? stored : defaultLocale;
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
