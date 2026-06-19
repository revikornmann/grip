// Ordered to match the language picker in the design (English first, Dutch last).
export const locales = [
  'en',
  'hi',
  'zh',
  'id',
  'pt',
  'es',
  'vi',
  'ja',
  'de',
  'fr',
  'nl',
] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'nl';

// Native-name labels shown in the language picker.
export const localeLabels: Record<Locale, string> = {
  en: 'English',
  hi: 'हिन्दी',
  zh: '简体中文',
  id: 'Bahasa Indonesia',
  pt: 'Português',
  es: 'Español',
  vi: 'Tiếng Việt',
  ja: '日本語',
  de: 'Deutsch',
  fr: 'Français',
  nl: 'Nederlands',
};

export const LOCALE_STORAGE_KEY = 'locale';
