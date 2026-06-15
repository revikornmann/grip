"use client";

import { useAuth } from "@/components/auth/AuthProvider";

/**
 * Hook that exposes the current auth state.
 *
 * With anonymous auth enabled, the AuthProvider always establishes a session
 * (anonymous or Google), so there is no redirect to /auth — the hook simply
 * surfaces { user, loading } and the consuming page waits for `loading`.
 *
 * Usage:
 *   const { user, loading } = useRequireAuth();
 *   if (loading || !user) return null;
 */
export function useRequireAuth() {
  const { user, loading } = useAuth();
  return { user, loading };
}
