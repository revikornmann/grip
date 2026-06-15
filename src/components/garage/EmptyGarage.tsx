"use client";

import { Card, Button } from "@revikornmann/muka-ui";
import { useTranslations } from "next-intl";

interface Props {
  onAdd: () => void;
}

export function EmptyGarage({ onAdd }: Props) {
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
            <Button variant="primary" onClick={onAdd}>
              {t("addButton")}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
