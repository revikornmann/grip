"use client";

import { EmptyState, Icon } from "@revikornmann/muka-ui";
import { useTranslations } from "next-intl";

export default function AssistantPage() {
  const t = useTranslations("assistant");

  return (
    <div className="assistant-coming-soon" style={{ paddingTop: "var(--spacing-8)" }}>
      <EmptyState
        size="sm"
        title={t("comingSoonTitle")}
        description={t("comingSoonBody")}
        icon={<Icon name="chat1" size="lg" />}
      />
    </div>
  );
}
