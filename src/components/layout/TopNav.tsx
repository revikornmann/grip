"use client";

import { usePathname, useRouter } from "next/navigation";
import { TopBar, Button, Icon } from "@revikornmann/muka-ui";
import { useTranslations } from "next-intl";

/**
 * Route configuration for the top-level TopBar (title + optional back button).
 * Sub-level routes (/garage/[id], /model/[id]) render their own View TopBar and
 * are not handled here.
 */
const ROUTE_CONFIG: Record<
  string,
  { titleKey: string; level: "top" | "sub"; backTo?: string }
> = {
  "/": { titleKey: "search", level: "top" },
  "/garage": { titleKey: "garage", level: "top" },
  "/assistant": { titleKey: "assistant", level: "top" },
  "/settings": { titleKey: "settings", level: "top" },
  "/auth": { titleKey: "auth", level: "sub", backTo: "/" },
};

function getRouteConfig(pathname: string) {
  if (ROUTE_CONFIG[pathname]) return ROUTE_CONFIG[pathname];

  const prefix = Object.keys(ROUTE_CONFIG)
    .filter((key) => key !== "/" && pathname.startsWith(key))
    .sort((a, b) => b.length - a.length)[0];

  if (prefix) return ROUTE_CONFIG[prefix];

  return { titleKey: "", level: "sub" as const, backTo: "/" };
}

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("nav");
  const config = getRouteConfig(pathname);

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

  // Garage gets a top-right "add" shortcut (replacing the old FAB) that drops
  // the user onto the search screen to find a motorcycle to add.
  const trailing =
    pathname === "/garage" ? (
      <Button
        variant="ghost"
        size="sm"
        iconOnly
        aria-label={t("addMotorcycle")}
        onClick={() => router.push("/")}
      >
        <Icon name="add" size="md" />
      </Button>
    ) : undefined;

  const title = config.titleKey ? t(config.titleKey) : "";

  return <TopBar title={title} leading={leading} trailing={trailing} />;
}
