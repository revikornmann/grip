"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { TopBar, Button, Icon, Card, Divider, Toggle } from "muka-ui";
import { useAuth } from "@/components/auth/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";

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
  "/auth": { title: "Inloggen", level: "sub", backTo: "/" },
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

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function SettingsMenu() {
  const { resolvedTheme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <Button
        variant="ghost"
        size="sm"
        iconOnly
        aria-label="Instellingen"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <Icon name="settings" size="md" />
      </Button>

      {menuOpen && (
        <>
          <div
            onClick={() => setMenuOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 30,
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + var(--spacing-2))",
              zIndex: 31,
              minWidth: "200px",
            }}
          >
            <Card padding="sm">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "var(--spacing-2)",
                }}
              >
                <Toggle
                  label="Donker thema"
                  checked={resolvedTheme === "dark"}
                  onChange={() =>
                    setTheme(resolvedTheme === "dark" ? "light" : "dark")
                  }
                  name="theme-toggle"
                />
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function UserMenu() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  if (loading) return null;

  if (!user) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/auth")}
      >
        Inloggen
      </Button>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Account menu"
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          overflow: "hidden",
          padding: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "var(--font-size-xs)",
          fontWeight: "var(--font-weight-semibold)",
          color: "var(--color-text-inverse-default)",
          background: "var(--color-surface-brand-default)",
        }}
      >
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt={user.displayName}
            referrerPolicy="no-referrer"
            width={32}
            height={32}
            style={{ objectFit: "cover" }}
            unoptimized
          />
        ) : (
          getInitials(user.displayName)
        )}
      </button>

      {menuOpen && (
        <>
          <div
            onClick={() => setMenuOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 30,
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + var(--spacing-2))",
              zIndex: 31,
              minWidth: "200px",
            }}
          >
            <Card padding="sm">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--spacing-2)",
                }}
              >
                <div style={{ padding: "var(--spacing-2)" }}>
                  <p
                    style={{
                      fontSize: "var(--font-size-sm)",
                      fontWeight: "var(--font-weight-semibold)",
                      margin: 0,
                    }}
                  >
                    {user.displayName}
                  </p>
                  <p
                    style={{
                      fontSize: "var(--font-size-xs)",
                      color: "var(--color-text-muted-default)",
                      margin: 0,
                    }}
                  >
                    {user.email}
                  </p>
                </div>
                <Divider />
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    console.log("Logout clicked");
                    setMenuOpen(false);
                    signOut().then(() => {
                      console.log("SignOut complete");
                      router.push("/");
                    });
                  }}
                >
                  <Icon name="log-out" size="sm" />
                  Uitloggen
                </Button>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
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

  const trailing =
    pathname !== "/auth" ? (
      <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
        <UserMenu />
        <SettingsMenu />
      </div>
    ) : undefined;

  return <TopBar title={config.title} leading={leading} trailing={trailing} />;
}
