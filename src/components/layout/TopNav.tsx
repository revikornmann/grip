"use client";

import { usePathname, useRouter } from "next/navigation";
import { TopBar, Button, Icon } from "muka-ui";

/**
 * Route configuration for TopBar rendering.
 *
 * Top-level views: shown on bottom-nav destinations (no back button).
 * Sub-level views: deeper pages with a back button.
 */
const ROUTE_CONFIG: Record<
  string,
  { title: string; level: "top" | "sub"; backTo?: string }
> = {
  "/": { title: "Tax Calculator", level: "top" },
  "/garage": { title: "Mijn garage", level: "top" },
  "/calculator": { title: "Kosten berekenen", level: "top" },
  "/compare": { title: "Vergelijken", level: "top" },
  "/lookup": { title: "Kenteken opzoeken", level: "sub", backTo: "/" },
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
  return { title: "", level: "sub" as const, backTo: "/" };
}

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const config = getRouteConfig(pathname);

  const leading =
    config.level === "sub" ? (
      <Button
        variant="ghost"
        size="sm"
        iconOnly
        aria-label="Terug"
        onClick={() => router.push(config.backTo ?? "/")}
      >
        <Icon name="arrow-left" size="md" />
      </Button>
    ) : undefined;

  return <TopBar title={config.title} leading={leading} />;
}
