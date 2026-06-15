"use client";

import { useEffect } from "react";

/**
 * Global error boundary. Unlike `error.tsx`, this replaces the root layout when
 * it renders, so it sits OUTSIDE every provider (i18n, theme, …) and must be
 * fully self-contained — no `next-intl`, no muka-ui, no design tokens, since
 * none of that context is guaranteed to be available here. Next.js also
 * prerenders this route at build time, so it has to render without any of them.
 */
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
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          color: "#202020",
        }}
      >
        <div style={{ maxWidth: "420px", textAlign: "center" }}>
          <h1 style={{ fontSize: "20px", margin: "0 0 8px" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#838383", margin: "0 0 16px" }}>
            An unexpected error occurred. Please try again.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: "8px 16px",
              fontSize: "16px",
              cursor: "pointer",
              borderRadius: "8px",
              border: "1px solid #202020",
              background: "#202020",
              color: "#ffffff",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
