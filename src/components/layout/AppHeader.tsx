"use client";

import type { CSSProperties } from "react";
import { Avatar } from "@revikornmann/muka-ui";
import { useAuth } from "@/components/auth/AuthProvider";

const wordmarkStyle: CSSProperties = {
  fontFamily: "var(--alias-font-brand-family)",
  fontWeight: 600,
  fontSize: "var(--font-size-lg)",
  lineHeight: 1,
  textTransform: "uppercase",
  color: "var(--color-text-default-default)",
};

const accountStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--spacing-3)",
};

const nameStyle: CSSProperties = {
  fontSize: "var(--font-size-md)",
  color: "var(--color-text-default-default)",
};

/**
 * AppHeader — content for the AppShell `appBar` slot.
 *
 * Shown only at the large tier (≥1024px); the AppShell hides the app bar below
 * it, where the per-view TopBar handles titles instead. Grip wordmark on the
 * left, signed-in account on the right.
 */
export function AppHeader() {
  const { user } = useAuth();
  const isSignedIn = !!user && !user.isAnonymous;

  return (
    <>
      <strong style={wordmarkStyle}>Grip</strong>
      {isSignedIn && (
        <span style={accountStyle}>
          <Avatar
            src={user.avatarUrl}
            name={user.displayName}
            size="sm"
            alt={user.displayName}
          />
          <span style={nameStyle}>{user.displayName}</span>
        </span>
      )}
    </>
  );
}
