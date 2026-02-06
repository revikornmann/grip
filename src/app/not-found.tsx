"use client";

import { Button } from "muka-ui";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--spacing-6)",
        padding: "var(--spacing-8) 0",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "var(--font-size-4xl)" }}>404</h1>
      <p
        style={{
          color: "var(--color-text-subtle-default)",
          fontSize: "var(--font-size-lg)",
        }}
      >
        Deze pagina bestaat niet.
      </p>
      <Button variant="primary" onClick={() => router.push("/")}>
        Naar home
      </Button>
    </div>
  );
}
