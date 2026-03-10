"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Dialog,
  Button,
  Icon,
  Card,
  Section,
  Container,
  ListItem,
  RadioTile,
  Divider,
  NavigationTransition,
} from "muka-ui";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/auth/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";
import { useLocale } from "@/components/LocaleProvider";
import { localeLabels, type Locale } from "@/i18n/config";
import type { Theme } from "@/lib/theme";

type SettingsView = "main" | "language" | "theme-mode" | "about";

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

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
        padding: "var(--spacing-4) var(--spacing-4) var(--spacing-1)",
        margin: 0,
      }}
    >
      {children}
    </p>
  );
}

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const t = useTranslations("settings");
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { locale, setLocale } = useLocale();
  const router = useRouter();

  const [activeView, setActiveView] = useState<SettingsView>("main");
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  // Reset view when dialog closes
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        setActiveView("main");
        setDirection("forward");
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const navigateTo = useCallback((view: SettingsView) => {
    setDirection("forward");
    setActiveView(view);
  }, []);

  const navigateBack = useCallback(() => {
    setDirection("back");
    setActiveView("main");
  }, []);

  const handleLogout = useCallback(() => {
    onClose();
    signOut().then(() => {
      router.push("/");
    });
  }, [onClose, signOut, router]);

  const handleFeedback = useCallback(() => {
    window.location.href = "mailto:revi@uxdelta.com";
  }, []);

  const handleLanguageChange = useCallback(
    (newLocale: Locale) => {
      setLocale(newLocale);
    },
    [setLocale],
  );

  const handleThemeChange = useCallback(
    (newTheme: Theme) => {
      setTheme(newTheme);
    },
    [setTheme],
  );

  // Dynamic title based on active view
  const titles: Record<SettingsView, string> = {
    main: t("title"),
    language: t("language"),
    "theme-mode": t("themeMode"),
    about: t("aboutTitle"),
  };

  // Leading slot: back button on sub-levels
  const leading =
    activeView !== "main" ? (
      <Button
        variant="ghost"
        size="sm"
        iconOnly
        aria-label={t("close")}
        onClick={navigateBack}
      >
        <Icon name="arrow-left" size="md" />
      </Button>
    ) : undefined;

  // Trailing slot: always close button
  const trailing = (
    <Button
      variant="ghost"
      size="sm"
      iconOnly
      aria-label={t("close")}
      onClick={onClose}
    >
      <Icon name="close-large" size="md" />
    </Button>
  );

  // Render the active view content
  const renderView = () => {
    switch (activeView) {
      case "main":
        return <MainView />;
      case "language":
        return <LanguageView />;
      case "theme-mode":
        return <ThemeModeView />;
      case "about":
        return <AboutView />;
    }
  };

  function MainView() {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-2)",
        }}
      >
        {/* WEERGAVE section */}
        <SectionHeader>{t("display")}</SectionHeader>
        <Card padding="none">
          <ListItem
            label={t("language")}
            caption={localeLabels[locale]}
            leadingIcon={<Icon name="translate" size="md" />}
            showChevron
            onClick={() => navigateTo("language")}
          />
          <ListItem
            label={t("themeMode")}
            caption={t(THEME_MODE_LABELS[theme])}
            leadingIcon={<Icon name="contrast" size="md" />}
            showChevron
            showDivider={false}
            onClick={() => navigateTo("theme-mode")}
          />
        </Card>

        {/* OVER GRIP APP section */}
        <SectionHeader>{t("aboutApp")}</SectionHeader>
        <Card padding="none">
          <ListItem
            label={t("howItWorks")}
            caption={t("howItWorksCaption")}
            leadingIcon={<Icon name="question" size="md" />}
            showChevron
            onClick={() => navigateTo("about")}
          />
          <ListItem
            label={t("feedback")}
            caption={t("feedbackCaption")}
            leadingIcon={<Icon name="message" size="md" />}
            showChevron
            showDivider={false}
            onClick={handleFeedback}
          />
        </Card>

        {/* ACCOUNT section */}
        <SectionHeader>{t("account")}</SectionHeader>
        <Card padding="none">
          {user ? (
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
                  {user.avatarUrl ? (
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
                    {user.email}
                  </p>
                </div>
              </div>
              <Button variant="secondary" fullWidth onClick={handleLogout}>
                {t("logout")}
              </Button>
            </div>
          ) : (
            <div style={{ padding: "var(--spacing-4)" }}>
              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  onClose();
                  router.push("/auth");
                }}
              >
                {t("login")}
              </Button>
            </div>
          )}
        </Card>

        {/* Footer */}
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
          <Image
            src="/Logo_of_the_RDW.svg"
            alt="Grip"
            width={40}
            height={40}
            unoptimized
          />
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
      </div>
    );
  }

  function LanguageView() {
    return (
      <Section padding="compact">
        <Container gap="compact">
          <RadioTile
            label={localeLabels.nl}
            name="language"
            value="nl"
            checked={locale === "nl"}
            onChange={() => handleLanguageChange("nl")}
          />
          <RadioTile
            label={localeLabels.en}
            name="language"
            value="en"
            checked={locale === "en"}
            onChange={() => handleLanguageChange("en")}
          />
        </Container>
      </Section>
    );
  }

  function ThemeModeView() {
    return (
      <Section padding="compact">
        <Container gap="compact">
          <RadioTile
            label={t("themeModeAuto")}
            name="theme-mode"
            value="system"
            checked={theme === "system"}
            onChange={() => handleThemeChange("system")}
          />
          <RadioTile
            label={t("themeModeLight")}
            name="theme-mode"
            value="light"
            checked={theme === "light"}
            onChange={() => handleThemeChange("light")}
          />
          <RadioTile
            label={t("themeModeDark")}
            name="theme-mode"
            value="dark"
            checked={theme === "dark"}
            onChange={() => handleThemeChange("dark")}
          />
        </Container>
      </Section>
    );
  }

  function AboutView() {
    return (
      <Section padding="compact">
        <Container gap="compact">
          <p
            style={{
              color: "var(--color-text-subtle-default)",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {t("aboutText")}
          </p>
        </Container>
      </Section>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={titles[activeView]}
      size="lg"
      modal={false}
      surfaceLevel={2}
      leading={leading}
      trailing={trailing}
    >
      <NavigationTransition
        activeView={renderView()}
        activeKey={activeView}
        direction={direction}
        className="settings-nav-transition"
      />
    </Dialog>
  );
}
