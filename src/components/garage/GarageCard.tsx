"use client";

import { Card, Chip, Button, Divider, Label } from "@revikornmann/muka-ui";
import { useTranslations } from "next-intl";
import type { GarageVehicle } from "@/types/garage";
import { formatPlateDisplay } from "@/lib/validation";
import { formatCurrency, formatNumber } from "@/lib/formatting";

interface GarageCardProps {
  vehicle: GarageVehicle;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        padding: "var(--spacing-1) 0",
      }}
    >
      <Label size="sm">{label}</Label>
      <span style={{ fontSize: "var(--font-size-sm)" }}>{value}</span>
    </div>
  );
}

export function GarageCard({
  vehicle,
  onEdit,
  onDuplicate,
  onDelete,
  onRefresh,
  isRefreshing,
}: GarageCardProps) {
  const t = useTranslations("garage");
  const displayName =
    vehicle.user?.nickname ||
    `${vehicle.rdw?.merk ?? ""} ${vehicle.rdw?.handelsbenaming ?? ""}`.trim() ||
    "Onbekend voertuig";
  const plate = vehicle.rdw?.kenteken
    ? formatPlateDisplay(vehicle.rdw.kenteken)
    : "—";

  const ownershipType = vehicle.user?.ownershipType ?? "private";

  return (
    <Card padding="lg" as="article" aria-label={displayName}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-3)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "var(--spacing-2)",
          }}
        >
          <div>
            <h3 style={{ fontSize: "var(--font-size-lg)", margin: 0 }}>
              {displayName}
            </h3>
            <p
              style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--color-text-subtle-default)",
                margin: 0,
                marginTop: "var(--spacing-1)",
              }}
            >
              {plate}
            </p>
          </div>
          <Chip
            variant={ownershipType === "business" ? "info" : "default"}
          >
            {ownershipType === "business" ? t("business") : t("private")}
          </Chip>
        </div>

        <Divider />

        {/* Key stats */}
        <div>
          <DetailRow
            label={t("purchasePrice")}
            value={formatCurrency(vehicle.user?.purchasePrice ?? 0, 0)}
          />
          <DetailRow
            label={t("annualKm")}
            value={`${formatNumber(vehicle.user?.annualKilometers ?? 0)} km`}
          />
          {(vehicle.user?.businessKilometers ?? 0) > 0 && (
            <DetailRow
              label={t("businessKm")}
              value={`${formatNumber(vehicle.user?.businessKilometers ?? 0)} km`}
            />
          )}
        </div>

        <Divider />

        {/* Actions */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "var(--spacing-2)",
          }}
        >
          <Button variant="secondary" size="sm" onClick={onEdit}>
            {t("edit")}
          </Button>
          <Button variant="secondary" size="sm" onClick={onDuplicate}>
            {t("duplicate")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? t("refreshing") : t("refresh")}
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            {t("delete")}
          </Button>
        </div>
      </div>
    </Card>
  );
}
