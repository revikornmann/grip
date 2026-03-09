"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { Card, Button, Alert, Icon } from "muka-ui";
import { useAuth } from "@/components/auth/AuthProvider";
import { createClient } from "@/lib/supabase";

function AuthContent() {
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations("auth");
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const returnTo = searchParams.get("returnTo") ?? "/garage";

  // If already logged in, redirect away
  useEffect(() => {
    if (!loading && user) {
      router.replace(returnTo);
    }
  }, [user, loading, router, returnTo]);

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?returnTo=${encodeURIComponent(returnTo)}`,
        },
      });

      if (authError) {
        setError(t("loginFailed"));
        setAuthLoading(false);
      }
    } catch {
      setError(t("loginFailed"));
      setAuthLoading(false);
    }
  };

  // Don't render auth UI if already logged in or still checking
  if (loading || user) {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--spacing-6)",
        paddingTop: "var(--spacing-8)",
      }}
    >
      <Card padding="lg">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "var(--spacing-5)",
            textAlign: "center",
            maxWidth: "360px",
          }}
        >
          <Icon name="user" size="lg" />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--spacing-2)",
            }}
          >
            <h1
              style={{
                fontSize: "var(--font-size-xl)",
                fontWeight: "var(--font-weight-semibold)",
                margin: 0,
              }}
            >
              {t("title")}
            </h1>
            <p
              style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--color-text-subtle-default)",
                margin: 0,
              }}
            >
              {t("subtitle")}
            </p>
          </div>

          {error && <Alert variant="error">{error}</Alert>}

          <Button
            variant="primary"
            onClick={handleGoogleSignIn}
            disabled={authLoading}
            fullWidth
          >
            {authLoading ? t("loggingIn") : t("loginWithGoogle")}
          </Button>

          <p
            style={{
              fontSize: "var(--font-size-xs)",
              color: "var(--color-text-muted-default)",
              margin: 0,
            }}
          >
            {t("localStorageNote")}
          </p>
        </div>
      </Card>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthContent />
    </Suspense>
  );
}
