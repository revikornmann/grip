"use client";

import { Card, Badge, Button, Divider, Label } from "muka-ui";
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
  const displayName =
    vehicle.user.nickname ||
    `${vehicle.rdw.merk} ${vehicle.rdw.handelsbenaming}`;
  const plate = formatPlateDisplay(vehicle.rdw.kenteken);

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
          <Badge
            variant={
              vehicle.user.ownershipType === "business" ? "info" : "default"
            }
          >
            {vehicle.user.ownershipType === "business" ? "Zakelijk" : "Privé"}
          </Badge>
        </div>

        <Divider />

        {/* Key stats */}
        <div>
          <DetailRow
            label="Aankoopprijs"
            value={formatCurrency(vehicle.user.purchasePrice, 0)}
          />
          <DetailRow
            label="Jaarkilometers"
            value={`${formatNumber(vehicle.user.annualKilometers)} km`}
          />
          {vehicle.user.businessKilometers > 0 && (
            <DetailRow
              label="Zakelijke km"
              value={`${formatNumber(vehicle.user.businessKilometers)} km`}
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
            Bewerken
          </Button>
          <Button variant="secondary" size="sm" onClick={onDuplicate}>
            Dupliceren
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? "Vernieuwen..." : "Vernieuwen"}
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            Verwijderen
          </Button>
        </div>
      </div>
    </Card>
  );
}
