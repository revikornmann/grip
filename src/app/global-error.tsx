"use client";

import "@revikornmann/muka-ui/styles";
import { Card, Button, Alert } from "@revikornmann/muka-ui";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Grip Global Error]", error);
  }, [error]);

  return (
    <html lang="nl">
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "var(--spacing-6)",
            padding: "var(--spacing-8)",
            minHeight: "100vh",
            justifyContent: "center",
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
                  Er trad een onverwachte fout op. Probeer het opnieuw of ga
                  terug naar de startpagina.
                </Alert>
                <div style={{ display: "flex", gap: "var(--spacing-3)" }}>
                  <Button variant="primary" onClick={reset}>
                    Opnieuw proberen
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => (window.location.href = "/")}
                  >
                    Naar start
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </body>
    </html>
  );
}
