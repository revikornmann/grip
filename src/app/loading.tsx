"use client";

import { useTranslations } from "next-intl";

export default function Loading() {
  const t = useTranslations("loading");

  return (
    <div
      style={{ padding: "var(--spacing-8)", textAlign: "center" }}
      role="status"
      aria-busy="true"
      aria-live="polite"
    >
      <p style={{ color: "var(--color-text-subtle-default)" }}>{t("text")}</p>
    </div>
  );
}
