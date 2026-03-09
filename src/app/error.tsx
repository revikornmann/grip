"use client";

import { Card, Button, Alert } from "muka-ui";
import { useEffect } from "react";
import { useTranslations } from "next-intl";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

  useEffect(() => {
    console.error("[Grip Error]", error);
  }, [error]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--spacing-6)",
        padding: "var(--spacing-8) 0",
      }}
    >
      <div style={{ maxWidth: "500px", width: "100%" }}>
        <Card padding="lg">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--spacing-4)",
            }}
          >
            <Alert variant="error" title={t("title")}>
              {t("description")}
            </Alert>
            <div style={{ display: "flex", gap: "var(--spacing-3)" }}>
              <Button variant="primary" onClick={reset}>
                {t("retry")}
              </Button>
              <Button
                variant="secondary"
                onClick={() => (window.location.href = "/")}
              >
                {t("goHome")}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
