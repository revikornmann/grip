"use client";

import { Select, Card, Badge, Icon } from "@revikornmann/muka-ui";
import { useTranslations } from "next-intl";
import type { GarageVehicle } from "@/types/garage";
import { isElectric, isYoungtimer } from "@/lib/calculator";
import { formatCurrency } from "@/lib/formatting";

interface VehicleSelectorProps {
  vehicles: GarageVehicle[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading?: boolean;
}

export function VehicleSelector({
  vehicles,
  selectedId,
  onSelect,
  loading = false,
}: VehicleSelectorProps) {
  const t = useTranslations("calculator");
  const tGarage = useTranslations("garage");
  const tCommon = useTranslations("common");
  const selected = vehicles.find((v) => v.id === selectedId);

  const options = vehicles.map((v) => ({
    value: v.id,
    label: v.user.nickname || `${v.rdw.merk} ${v.rdw.handelsbenaming}`,
  }));

  if (vehicles.length === 0) {
    return (
      <Card>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "var(--spacing-3)",
            padding: "var(--spacing-6)",
            textAlign: "center",
          }}
        >
          <Icon name="car" size="lg" />
          <p style={{ color: "var(--color-text-subtle-default)" }}>
            {t("noVehiclesInGarage")}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
      <Select
        label={t("selectVehicle")}
        options={options}
        value={selectedId ?? ""}
        onChange={(e) => onSelect(e.target.value)}
        disabled={loading}
      />

      {selected && (
        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "var(--text-heading-sm-semibold-fontSize)" }}>
                  {selected.user.nickname || `${selected.rdw.merk} ${selected.rdw.handelsbenaming}`}
                </h3>
                {selected.user.nickname && (
                  <p style={{ margin: 0, color: "var(--color-text-subtle-default)" }}>
                    {selected.rdw.merk} {selected.rdw.handelsbenaming}
                  </p>
                )}
              </div>
              <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
                {isElectric(selected) && <Badge variant="info">{t("ev")}</Badge>}
                {isYoungtimer(selected) && <Badge variant="warning">Youngtimer</Badge>}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "var(--spacing-3)",
              }}
            >
              <div>
                <p style={{ margin: 0, fontSize: "var(--text-label-sm-regular-fontSize)", color: "var(--color-text-subtle-default)" }}>
                  {t("plate")}
                </p>
                <p style={{ margin: 0, fontWeight: 600 }}>{selected.rdw.kenteken}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "var(--text-label-sm-regular-fontSize)", color: "var(--color-text-subtle-default)" }}>
                  {t("ownership")}
                </p>
                <p style={{ margin: 0, fontWeight: 600 }}>
                  {selected.user.ownershipType === "business" ? tGarage("business") : tGarage("private")}
                </p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "var(--text-label-sm-regular-fontSize)", color: "var(--color-text-subtle-default)" }}>
                  {t("catalogValue")}
                </p>
                <p style={{ margin: 0, fontWeight: 600 }}>
                  {selected.rdw.catalogusprijs
                    ? formatCurrency(selected.rdw.catalogusprijs, 0)
                    : tCommon("unknown")}
                </p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "var(--text-label-sm-regular-fontSize)", color: "var(--color-text-subtle-default)" }}>
                  {tGarage("purchasePrice")}
                </p>
                <p style={{ margin: 0, fontWeight: 600 }}>
                  {formatCurrency(selected.user.purchasePrice, 0)}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
