"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

/**
 * Hook that redirects to /auth if the user is not logged in.
 * Returns { user, loading } so the consuming component can show a loading state.
 *
 * Usage:
 *   const { user, loading } = useRequireAuth();
 *   if (loading || !user) return null;
 */
export function useRequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/auth?returnTo=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, router, pathname]);

  return { user, loading };
}
