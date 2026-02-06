"use client";

import { Card } from "muka-ui";

export default function GaragePage() {
  return (
    <div>
      <h1
        style={{
          fontSize: "var(--font-size-2xl)",
          marginBottom: "var(--spacing-4)",
        }}
      >
        Mijn garage
      </h1>
      <Card>
        <p style={{ color: "var(--color-text-subtle-default)" }}>
          Deze functie wordt binnenkort beschikbaar.
        </p>
      </Card>
    </div>
  );
}
