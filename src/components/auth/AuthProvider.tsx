"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase";
import { migrateLocalToSupabase } from "@/lib/migration";
import type { AuthUser } from "@/types/auth";
import type { User, SupabaseClient } from "@supabase/supabase-js";

interface MigrationResult {
  migrated: number;
  failed: number;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  migrationResult: MigrationResult | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

function mapUser(supabaseUser: User): AuthUser {
  const meta = supabaseUser.user_metadata;
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? "",
    displayName:
      meta?.full_name ?? meta?.name ?? supabaseUser.email ?? "Gebruiker",
    avatarUrl: meta?.avatar_url ?? meta?.picture,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo<SupabaseClient | null>(() => {
    if (!isSupabaseConfigured()) return null;
    return createClient();
  }, []);

  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(!!supabase);
  const [migrationResult, setMigrationResult] =
    useState<MigrationResult | null>(null);

  // Check existing session on mount
  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? mapUser(session.user) : null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const mappedUser = session?.user ? mapUser(session.user) : null;
      setUser(mappedUser);
      setLoading(false);

      // Run migration on sign-in
      if (event === "SIGNED_IN" && session?.user) {
        try {
          const result = await migrateLocalToSupabase(session.user.id);
          if (result.migrated > 0 || result.failed > 0) {
            setMigrationResult(result);
          }
        } catch {
          // Migration failure is non-critical
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signIn = useCallback(async () => {
    if (!supabase) return;
    const returnTo =
      typeof window !== "undefined" ? window.location.pathname : "/garage";
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?returnTo=${encodeURIComponent(returnTo)}`,
      },
    });
  }, [supabase]);

  const signOut = useCallback(async () => {
    console.log("signOut called");
    setUser(null);
    console.log("User cleared");
    if (supabase) {
      supabase.auth.signOut({ scope: "local" }).catch(console.error);
    }
  }, [supabase]);

  return (
    <AuthContext.Provider
      value={{ user, loading, migrationResult, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}
