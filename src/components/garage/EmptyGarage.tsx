"use client";

import { useRouter } from "next/navigation";
import { Card, Button } from "muka-ui";

export function EmptyGarage() {
  const router = useRouter();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "var(--spacing-8) 0",
      }}
    >
      <div style={{ maxWidth: "480px", width: "100%" }}>
        <Card padding="lg">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "var(--spacing-4)",
              textAlign: "center",
            }}
          >
            <h2 style={{ fontSize: "var(--font-size-xl)", margin: 0 }}>
              Je garage is nog leeg
            </h2>
            <p
              style={{
                color: "var(--color-text-subtle-default)",
                margin: 0,
              }}
            >
              Zoek een voertuig op via het kenteken en voeg het toe aan je
              garage. Zo kun je meerdere voertuigen vergelijken op kosten en
              belastingvoordeel.
            </p>
            <Button
              variant="primary"
              onClick={() => router.push("/lookup")}
            >
              Voertuig opzoeken
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
