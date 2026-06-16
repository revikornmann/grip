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
import type { AuthUser } from "@/types/auth";
import type { User, SupabaseClient } from "@supabase/supabase-js";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: () => Promise<void>;
  upgradeToGoogle: (returnTo?: string) => Promise<void>;
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
    isAnonymous: supabaseUser.is_anonymous ?? false,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo<SupabaseClient | null>(() => {
    if (!isSupabaseConfigured()) return null;
    return createClient();
  }, []);

  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(!!supabase);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(mapUser(session.user));
        setLoading(false);
      } else {
        // No session — establish an anonymous one so the user can use the app
        // (browse, add motorcycles) without Google login. Anonymous users get an
        // `authenticated` JWT, so RLS and all motorcycle CRUD keep working.
        supabase.auth
          .signInAnonymously()
          .then(({ data, error }) => {
            if (error) {
              // Anonymous sign-ins may be disabled on the project. That's not
              // fatal — the user can still browse once signed in with Google —
              // so degrade quietly instead of throwing a console error.
              console.warn(
                "Guest (anonymous) session unavailable:",
                error.message,
              );
            }
            setUser(data?.user ? mapUser(data.user) : null);
          })
          .finally(() => setLoading(false));
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        // After a Google sign-out, drop back to an anonymous session so the app
        // stays usable without a redirect to login.
        supabase.auth.signInAnonymously().then(({ data }) => {
          setUser(data?.user ? mapUser(data.user) : null);
        });
        return;
      }
      setUser(session?.user ? mapUser(session.user) : null);
      setLoading(false);
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

  const upgradeToGoogle = useCallback(
    async (returnTo = "/settings") => {
      if (!supabase) return;
      const redirectTo = `${window.location.origin}/auth/callback?returnTo=${encodeURIComponent(returnTo)}`;

      // Sign in straight with Google. We deliberately do NOT linkIdentity the
      // anonymous guest onto the Google account: the garage requires a real
      // account, so there is no guest data worth carrying over, and linking
      // fails anyway when the Google identity already belongs to an existing
      // user ("422: Identity is already linked to another user") or when the
      // project has manual linking disabled. A plain OAuth sign-in always
      // establishes the Google session and replaces the anonymous one.
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (error) console.error("Google sign-in failed:", error.message);
    },
    [supabase],
  );

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
      value={{ user, loading, signIn, upgradeToGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}
