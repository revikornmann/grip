"use client";

import { usePathname, useRouter } from "next/navigation";
import { TopBar, Button, Icon } from "muka-ui";

function ArrowLeftIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

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
        <Icon size="md">
          <ArrowLeftIcon />
        </Icon>
      </Button>
    ) : undefined;

  return <TopBar title={config.title} leading={leading} />;
}
