"use client";

import { Button, Card, Input, Badge } from "muka-ui";
import { useState } from "react";

export default function Home() {
  const [clickCount, setClickCount] = useState(0);

  return (
    <main style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "1rem" }}>
        Tax Calculator{" "}
        <Badge variant="info" size="sm">
          Beta
        </Badge>
      </h1>
      <p style={{ marginBottom: "2rem", color: "var(--color-text-subtle-default)" }}>
        Vehicle tax optimization for Dutch ZZP professionals
      </p>

      <Card>
        <h2 style={{ marginBottom: "1rem" }}>Muka UI Integration Test</h2>
        <p style={{ marginBottom: "1.5rem" }}>
          This page verifies that muka-ui components work correctly via npm link.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Input
            label="Vehicle Value (€)"
            type="number"
            placeholder="Enter vehicle value"
            name="vehicle-value"
          />

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <Button variant="primary" size="sm" onClick={() => setClickCount((c) => c + 1)}>
              Calculate Tax
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setClickCount(0)}>
              Reset
            </Button>
            <Button variant="ghost" size="sm">Learn More</Button>
          </div>

          {clickCount > 0 && (
            <p style={{ marginTop: "1rem" }}>
              Button clicked {clickCount} time{clickCount !== 1 ? "s" : ""} - interactivity works!
            </p>
          )}
        </div>
      </Card>
    </main>
  );
}
