"use client";

import { EmptyState, Icon } from "muka-ui";
import { useTranslations } from "next-intl";

export default function AssistantPage() {
  const t = useTranslations("assistant");

  return (
    <div style={{ paddingTop: "var(--spacing-8)" }}>
      <EmptyState
        title={t("comingSoonTitle")}
        description={t("comingSoonBody")}
        icon={<Icon name="chat-1" size="lg" />}
      />
    </div>
  );
}
