"use client";

import { useTranslations } from "next-intl";
import { SettingsOptionView } from "@/components/settings/SettingsOptionView";
import { useLocale } from "@/components/LocaleProvider";
import { localeLabels, locales } from "@/i18n/config";

export default function LanguageSettingsPage() {
  const t = useTranslations("settings");
  const { locale, setLocale } = useLocale();

  return (
    <SettingsOptionView
      title={t("language")}
      name="language"
      options={locales.map((l) => ({ value: l, label: localeLabels[l] }))}
      selected={locale}
      onSelect={setLocale}
    />
  );
}
