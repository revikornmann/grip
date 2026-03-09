"use client";

import { useRouter } from "next/navigation";
import { Card, Button } from "muka-ui";
import { useTranslations } from "next-intl";

export function EmptyGarage() {
  const router = useRouter();
  const t = useTranslations("garage");

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
              {t("emptyTitle")}
            </h2>
            <p
              style={{
                color: "var(--color-text-subtle-default)",
                margin: 0,
              }}
            >
              {t("emptyDescription")}
            </p>
            <Button
              variant="primary"
              onClick={() => router.push("/lookup")}
            >
              {t("lookupButton")}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
