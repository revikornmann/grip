"use client";

import { Card, Button, Alert } from "muka-ui";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Tax Calculator Error]", error);
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
            <Alert variant="error" title="Er is iets misgegaan">
              De pagina kon niet worden geladen. Probeer het opnieuw of ga terug
              naar de homepagina.
            </Alert>
            <div style={{ display: "flex", gap: "var(--spacing-3)" }}>
              <Button variant="primary" onClick={reset}>
                Probeer opnieuw
              </Button>
              <Button
                variant="secondary"
                onClick={() => (window.location.href = "/")}
              >
                Naar home
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
