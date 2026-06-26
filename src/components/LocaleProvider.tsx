"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
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

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;
  const stored = storage.get<Locale>(LOCALE_STORAGE_KEY);
  return stored === "nl" || stored === "en" ? stored : defaultLocale;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    storage.set(LOCALE_STORAGE_KEY, newLocale);
    document.documentElement.lang = newLocale;
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider
        locale={locale}
        timeZone="Europe/Amsterdam"
        messages={messagesMap[locale]}
      >
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}
