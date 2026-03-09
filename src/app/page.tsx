"use client";

import { Button, Card, Chip } from "muka-ui";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function Home() {
  const router = useRouter();
  const t = useTranslations("home");

  return (
    <>
      <p
        style={{
          fontSize: "var(--font-size-lg)",
          color: "var(--color-text-subtle-default)",
          textAlign: "center",
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
        {t("subtitle")}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "var(--spacing-4)",
        }}
      >
        <Card>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--spacing-3)",
            }}
          >
            <Chip variant="info" size="sm">
              {t("rdwData")}
            </Chip>
            <h3 style={{ fontSize: "var(--font-size-lg)" }}>
              {t("lookupTitle")}
            </h3>
            <p style={{ color: "var(--color-text-subtle-default)" }}>
              {t("lookupDescription")}
            </p>
          </div>
        </Card>
        <Card>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--spacing-3)",
            }}
          >
            <Chip variant="success" size="sm">
              {t("calculationsChip")}
            </Chip>
            <h3 style={{ fontSize: "var(--font-size-lg)" }}>
              {t("calculatorTitle")}
            </h3>
            <p style={{ color: "var(--color-text-subtle-default)" }}>
              {t("calculatorDescription")}
            </p>
          </div>
        </Card>
        <Card>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--spacing-3)",
            }}
          >
            <Chip variant="warning" size="sm">
              {t("comparisonChip")}
            </Chip>
            <h3 style={{ fontSize: "var(--font-size-lg)" }}>
              {t("comparisonTitle")}
            </h3>
            <p style={{ color: "var(--color-text-subtle-default)" }}>
              {t("comparisonDescription")}
            </p>
          </div>
        </Card>
      </div>

      <div
        style={{
          display: "flex",
          gap: "var(--spacing-4)",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <Button
          variant="primary"
          size="lg"
          onClick={() => router.push("/lookup")}
        >
          {t("lookupButton")}
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={() => router.push("/garage")}
        >
          {t("garageButton")}
        </Button>
      </div>
    </>
  );
}
