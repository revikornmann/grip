"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { TopBar, Button, Icon } from "muka-ui";
import { useTranslations } from "next-intl";
import { SettingsDialog } from "./SettingsDialog";

/**
 * Route configuration for TopBar rendering.
 *
 * Top-level views: shown on bottom-nav destinations (no back button).
 * Sub-level views: deeper pages with a back button.
 */
const ROUTE_CONFIG: Record<
  string,
  { titleKey: string; level: "top" | "sub"; backTo?: string }
> = {
  "/": { titleKey: "home", level: "top" },
  "/garage": { titleKey: "garage", level: "top" },
  "/auth": { titleKey: "auth", level: "sub", backTo: "/" },
};

function getRouteConfig(pathname: string) {
  // Exact match first
  if (ROUTE_CONFIG[pathname]) return ROUTE_CONFIG[pathname];

  // Prefix match for nested routes
  const prefix = Object.keys(ROUTE_CONFIG)
    .filter((key) => key !== "/" && pathname.startsWith(key))
    .sort((a, b) => b.length - a.length)[0];

  if (prefix) return ROUTE_CONFIG[prefix];

  // Fallback: treat unknown routes as sub-level
  return { titleKey: "", level: "sub" as const, backTo: "/" };
}

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("nav");
  const tSettings = useTranslations("settings");
  const config = getRouteConfig(pathname);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const leading =
    config.level === "sub" ? (
      <Button
        variant="ghost"
        size="sm"
        iconOnly
        aria-label={t("back")}
        onClick={() => router.push(config.backTo ?? "/")}
      >
        <Icon name="arrow-left" size="md" />
      </Button>
    ) : undefined;

  const trailing =
    pathname !== "/auth" ? (
      <Button
        variant="ghost"
        size="sm"
        iconOnly
        aria-label={tSettings("settingsLabel")}
        onClick={() => setSettingsOpen(true)}
      >
        <Icon name="settings" size="md" />
      </Button>
    ) : undefined;

  const title = config.titleKey ? t(config.titleKey) : "";

  return (
    <>
      <TopBar title={title} leading={leading} trailing={trailing} />
      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}
