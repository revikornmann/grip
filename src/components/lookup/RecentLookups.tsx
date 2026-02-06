"use client";

import { ListItem, Button } from "muka-ui";
import type { RecentLookup } from "@/types/vehicle";
import { formatPlateDisplay } from "@/lib/validation";

interface RecentLookupsProps {
  lookups: RecentLookup[];
  onSelect: (plate: string) => void;
  onClear: () => void;
}

export function RecentLookups({
  lookups,
  onSelect,
  onClear,
}: RecentLookupsProps) {
  if (lookups.length === 0) return null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--spacing-2)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3
          style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--color-text-subtle-default)",
            margin: 0,
          }}
        >
          Recente zoekopdrachten
        </h3>
        <Button variant="ghost" size="sm" onClick={onClear}>
          Wis geschiedenis
        </Button>
      </div>
      <div>
        {lookups.map((lookup) => (
          <ListItem
            key={lookup.plate}
            label={formatPlateDisplay(lookup.plate)}
            caption={`${lookup.make} ${lookup.model}`}
            showChevron
            showDivider
            onClick={() => onSelect(lookup.plate)}
          />
        ))}
      </div>
    </div>
  );
}
