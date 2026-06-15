"use client";

import { useTranslations } from "next-intl";
import { SettingsOptionView } from "@/components/settings/SettingsOptionView";
import { useTheme } from "@/components/ThemeProvider";
import type { Theme } from "@/lib/theme";

const THEME_MODES: Theme[] = ["system", "light", "dark"];
const THEME_MODE_LABELS: Record<Theme, string> = {
  system: "themeModeAuto",
  light: "themeModeLight",
  dark: "themeModeDark",
};

export default function ThemeSettingsPage() {
  const t = useTranslations("settings");
  const { theme, setTheme } = useTheme();

  return (
    <SettingsOptionView
      title={t("themeMode")}
      name="theme"
      options={THEME_MODES.map((m) => ({ value: m, label: t(THEME_MODE_LABELS[m]) }))}
      selected={theme}
      onSelect={setTheme}
    />
  );
}
