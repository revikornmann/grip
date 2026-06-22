"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  AppShell as MukaAppShell,
  View,
  BottomBar,
  ControlBar,
  Button,
  Icon,
  SearchInput,
} from "@revikornmann/muka-ui";
import { useTranslations } from "next-intl";
import { MainContent } from "./MainContent";
import { AppHeader } from "./AppHeader";
import { NavTabs, SidebarNav } from "./navTabs";
import { SearchProvider, useSearch } from "@/components/search/SearchContext";
import { isSubLevelRoute, transitionDirection } from "@/lib/routes";

interface Props {
  children: ReactNode;
}

/**
 * Route configuration for the top-level View (title + optional back button).
 * Sub-level routes (/garage/[id], /model/[id], …) render their own
 * `<View level="sub">` and are handled by the sub-level branch below.
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

/**
 * TopLevelView — the Muka `<View level="top">` shell for top-level routes.
 *
 * Renders the per-route TopBar (title + leading/trailing + search control bar)
 * and the navigation footer. The footer BottomBar is the mobile bottom nav; it
 * is auto-hidden at the large tier where the AppShell sidebar rail takes over.
 *
 * Lives inside `<SearchProvider>` so the Search screen's control bar can call
 * `openSearch` to launch the full-screen search overlay.
 */
function TopLevelView({ children }: { children: ReactNode }) {
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

  // Garage gets a top-right "add" shortcut that drops the user onto the search
  // screen to find a motorcycle to add.
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
    <View
      level={config.level}
      title={title}
      leading={leading}
      trailing={trailing}
      controlBar={controlBar}
      footer={
        <BottomBar variant="navigation" floating>
          <NavTabs />
        </BottomBar>
      }
    >
      <MainContent>{children}</MainContent>
    </View>
  );
}

/**
 * AppShell — the responsive Muka application shell.
 *
 * Wraps every route in Muka's `<AppShell>`, which adds a persistent left
 * navigation rail (`sidebar`) and a full-width application header (`appBar`) at
 * the large tier (≥1024px) and hides them below it — there navigation falls back
 * to the per-view TopBar + floating bottom nav. The sidebar/header live outside
 * the keyed transition wrapper, so they stay fixed while the inner View slides.
 */
export function AppShell({ children }: Props) {
  const pathname = usePathname();
  const subLevel = isSubLevelRoute(pathname);

  // Slide direction is derived from the route depth of the previous vs current
  // pathname (see transitionDirection). Keying the wrapper on the pathname
  // remounts it each navigation so the CSS enter-animation replays.
  const prevPathname = useRef<string | null>(null);
  const direction = transitionDirection(prevPathname.current, pathname);
  useEffect(() => {
    prevPathname.current = pathname;
  }, [pathname]);

  const transitionClass = `app-transition app-transition--${direction}`;

  return (
    <MukaAppShell appBar={<AppHeader />} sidebar={<SidebarNav />}>
      {subLevel ? (
        // Sub-level routes render their own <View level="sub"> with a back
        // button / breadcrumb and (optionally) an action footer.
        <div className={transitionClass} key={pathname}>
          {children}
        </div>
      ) : (
        // SearchProvider hosts the search overlay and powers the top-level
        // control bar; it sits outside the keyed wrapper so it survives
        // top-level tab switches.
        <SearchProvider>
          <div className={transitionClass} key={pathname}>
            <TopLevelView>{children}</TopLevelView>
          </div>
        </SearchProvider>
      )}
    </MukaAppShell>
  );
}
