"use client";

import { Button } from "muka-ui";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function Home() {
  const router = useRouter();
  const t = useTranslations("home");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--spacing-6)",
        textAlign: "center",
        paddingTop: "var(--spacing-8)",
      }}
    >
      <p
        style={{
          fontSize: "var(--font-size-lg)",
          color: "var(--color-text-subtle-default)",
          maxWidth: "480px",
        }}
      >
        {t("subtitle")}
      </p>
      <Button variant="primary" size="lg" onClick={() => router.push("/garage")}>
        {t("garageButton")}
      </Button>
    </div>
  );
}
