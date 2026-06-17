"use client";

import { EmptyState, Icon } from "@revikornmann/muka-ui";
import { useTranslations } from "next-intl";

interface Props {
  /** Switch to the "Search" tab (first bottom-nav item) to find a motorcycle. */
  onSearch: () => void;
}

export function EmptyGarage({ onSearch }: Props) {
  const t = useTranslations("garage");

  return (
    <div style={{ paddingTop: "var(--spacing-8)" }}>
      <EmptyState
        size="sm"
        title={t("emptyTitle")}
        description={t("emptyDescription")}
        icon={<Icon name="motorbike" size="lg" />}
        primaryAction={{
          label: t("searchButton"),
          icon: <Icon name="search" />,
          onClick: onSearch,
        }}
      />
    </div>
  );
}
