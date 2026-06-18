"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  TopBar,
  ControlBar,
  Button,
  Icon,
  SearchInput,
} from "@revikornmann/muka-ui";
import { useTranslations } from "next-intl";
import { useSearch } from "@/components/search/SearchContext";

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
  const tSearch = useTranslations("search");
  const { openSearch } = useSearch();
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

  // The Search screen carries a search field in the control bar. It acts as a
  // button: tapping it opens the full-screen search overlay (focus / typing
  // states) rather than editing in place.
  const controlBar =
    pathname === "/" ? (
      <ControlBar>
        <div
          className="search-trigger"
          role="button"
          tabIndex={0}
          aria-label={tSearch("searchPlaceholder")}
          onClick={openSearch}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openSearch();
            }
          }}
        >
          <SearchInput
            value=""
            onChange={() => {}}
            placeholder={tSearch("searchPlaceholder")}
          />
        </div>
      </ControlBar>
    ) : undefined;

  return (
    <TopBar
      title={title}
      leading={leading}
      trailing={trailing}
      controlBar={controlBar}
    />
  );
}
