"use client";

import React from "react";
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

function resolveLocale(): Locale {
  if (typeof window === "undefined") return defaultLocale;
  const stored = storage.get<Locale>(LOCALE_STORAGE_KEY);
  return stored === "nl" || stored === "en" ? stored : defaultLocale;
}

/**
 * Self-contained next-intl context for root boundary components
 * (loading / error / not-found). These can render outside the app's
 * LocaleProvider — e.g. inside Next's `/_global-error` prerender — so they
 * need their own provider with statically imported messages.
 */
export function BoundaryIntlProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = resolveLocale();
  return (
    <NextIntlClientProvider
      locale={locale}
      timeZone="Europe/Amsterdam"
      messages={messagesMap[locale]}
    >
      {children}
    </NextIntlClientProvider>
  );
}
