"use client";

import { useTranslations } from "next-intl";
import { BoundaryIntlProvider } from "@/components/BoundaryIntlProvider";

function LoadingContent() {
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

export default function Loading() {
  return (
    <BoundaryIntlProvider>
      <LoadingContent />
    </BoundaryIntlProvider>
  );
}
