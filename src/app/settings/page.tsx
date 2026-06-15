"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, ListItem, Button, Icon } from "muka-ui";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/auth/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";
import { useLocale } from "@/components/LocaleProvider";
import { useUnits } from "@/components/UnitsProvider";
import { localeLabels } from "@/i18n/config";
import { unitsLabelKeys } from "@/lib/units";
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

/** Grip app-icon tile shown in the About section. */
function AppIcon() {
  return (
    <div
      style={{
        width: "64px",
        height: "64px",
        borderRadius: "var(--radius-xl)",
        background: "var(--color-surface-inverse)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
      aria-hidden
    >
      <span
        style={{
          fontWeight: "var(--font-weight-bold, 700)",
          fontSize: "var(--font-size-2xl)",
          color: "var(--color-text-default-inverse)",
          lineHeight: 1,
        }}
      >
        G
      </span>
    </div>
  );
}

export default function SettingsPage() {
  const t = useTranslations("settings");
  const router = useRouter();
  const { user, upgradeToGoogle, signOut } = useAuth();
  const { theme } = useTheme();
  const { locale } = useLocale();
  const { units } = useUnits();

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
          onClick={() => router.push("/settings/language")}
        />
        <ListItem
          label={t("units")}
          caption={t(unitsLabelKeys[units])}
          leadingIcon={<Icon name="ruler" size="md" />}
          showChevron
          onClick={() => router.push("/settings/units")}
        />
        <ListItem
          label={t("themeMode")}
          caption={t(THEME_MODE_LABELS[theme])}
          leadingIcon={<Icon name="contrast" size="md" />}
          showChevron
          showDivider={false}
          onClick={() => router.push("/settings/theme")}
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--spacing-4)",
          padding: "var(--spacing-2) var(--spacing-1)",
        }}
      >
        <AppIcon />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-1)",
          }}
        >
          <p
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-subtle-default)",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {t.rich("aboutMadeBy", {
              b: (chunks) => (
                <strong style={{ color: "var(--color-text-default-default)" }}>
                  {chunks}
                </strong>
              ),
            })}
          </p>
          <a
            href="https://www.kornmann.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--color-text-action-default)",
              textDecoration: "none",
            }}
          >
            {t("aboutLink")}
          </a>
        </div>
      </div>
    </div>
  );
}
