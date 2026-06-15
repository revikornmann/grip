"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Card,
  ListItem,
  Button,
  Icon,
  Divider,
  ActionSheet,
} from "@revikornmann/muka-ui";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/auth/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";
import { useLocale } from "@/components/LocaleProvider";
import { localeLabels, type Locale } from "@/i18n/config";
import type { Theme } from "@/lib/theme";

const THEME_MODE_LABELS: Record<Theme, string> = {
  system: "themeModeAuto",
  light: "themeModeLight",
  dark: "themeModeDark",
};

function SectionHeader({ children }: { children: string }) {
  return (
    <p
      style={{
        fontSize: "var(--font-size-xs)",
        fontWeight: "var(--font-weight-semibold)",
        color: "var(--color-text-subtle-default)",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        padding: "var(--spacing-4) var(--spacing-1) var(--spacing-1)",
        margin: 0,
      }}
    >
      {children}
    </p>
  );
}

export default function SettingsPage() {
  const t = useTranslations("settings");
  const { user, upgradeToGoogle, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { locale, setLocale } = useLocale();

  const [languageOpen, setLanguageOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  const isSignedIn = !!user && !user.isAnonymous;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--spacing-2)",
      }}
    >
      {/* DISPLAY */}
      <SectionHeader>{t("display")}</SectionHeader>
      <Card padding="none">
        <ListItem
          label={t("language")}
          caption={localeLabels[locale]}
          leadingIcon={<Icon name="translate" size="md" />}
          showChevron
          onClick={() => setLanguageOpen(true)}
        />
        <ListItem
          label={t("themeMode")}
          caption={t(THEME_MODE_LABELS[theme])}
          leadingIcon={<Icon name="contrast" size="md" />}
          showChevron
          showDivider={false}
          onClick={() => setThemeOpen(true)}
        />
      </Card>

      {/* ACCOUNT */}
      <SectionHeader>{t("account")}</SectionHeader>
      <Card padding="none">
        {isSignedIn ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--spacing-3)",
              padding: "var(--spacing-4)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--spacing-3)",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--color-surface-brand-default)",
                }}
              >
                {user?.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    width={32}
                    height={32}
                    style={{ objectFit: "cover" }}
                    unoptimized
                  />
                ) : (
                  <Icon name="google" size="sm" />
                )}
              </div>
              <div>
                <p
                  style={{
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "var(--font-weight-semibold)",
                    margin: 0,
                  }}
                >
                  {t("loggedInAs")}
                </p>
                <p
                  style={{
                    fontSize: "var(--font-size-xs)",
                    color: "var(--color-text-subtle-default)",
                    margin: 0,
                  }}
                >
                  {user?.email}
                </p>
              </div>
            </div>
            <Button variant="secondary" fullWidth onClick={() => signOut()}>
              {t("logout")}
            </Button>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--spacing-3)",
              padding: "var(--spacing-4)",
            }}
          >
            <p
              style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--color-text-subtle-default)",
                margin: 0,
              }}
            >
              {t("guestNote")}
            </p>
            <Button
              variant="primary"
              fullWidth
              onClick={() => upgradeToGoogle("/settings")}
            >
              {t("signInGoogle")}
            </Button>
          </div>
        )}
      </Card>

      {/* ABOUT */}
      <SectionHeader>{t("aboutApp")}</SectionHeader>
      <Divider />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "var(--spacing-3)",
          padding: "var(--spacing-4)",
        }}
      >
        <p
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--color-text-muted-default)",
            textAlign: "center",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {t("footer")}
        </p>
      </div>

      <ActionSheet
        open={languageOpen}
        onOpenChange={setLanguageOpen}
        title={t("language")}
        actions={(Object.keys(localeLabels) as Locale[]).map((l) => ({
          label: localeLabels[l],
          icon: locale === l ? <Icon name="check" /> : undefined,
          onClick: () => setLocale(l),
        }))}
      />

      <ActionSheet
        open={themeOpen}
        onOpenChange={setThemeOpen}
        title={t("themeMode")}
        actions={(["system", "light", "dark"] as Theme[]).map((mode) => ({
          label: t(THEME_MODE_LABELS[mode]),
          icon: theme === mode ? <Icon name="check" /> : undefined,
          onClick: () => setTheme(mode),
        }))}
      />
    </div>
  );
}
