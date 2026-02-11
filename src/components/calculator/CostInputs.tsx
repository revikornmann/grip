"use client";

import { Input, Select, Card, Button, Divider } from "muka-ui";
import type { CostInputs as CostInputsType, Province } from "@/lib/calculator";
import {
  PROVINCES,
  TAX_CONSTANTS,
  DEFAULT_FUEL_PRICES,
  DEFAULT_CONSUMPTION,
  FUEL_PRICES_UPDATED,
  normalizeFuelType,
} from "@/lib/calculator";
import type { GarageVehicle } from "@/types/garage";

interface CostInputsProps {
  inputs: Omit<CostInputsType, "vehicle">;
  vehicle: GarageVehicle;
  onChange: (updates: Partial<Omit<CostInputsType, "vehicle">>) => void;
  onReset: () => void;
}

const PROVINCE_OPTIONS = PROVINCES.map((p) => ({ value: p, label: p }));

const TAX_BRACKET_OPTIONS = [
  { value: String(TAX_CONSTANTS.taxBrackets.low), label: "36,93% (tot €73.031)" },
  { value: String(TAX_CONSTANTS.taxBrackets.high), label: "49,50% (boven €73.031)" },
];

export function CostInputs({ inputs, vehicle, onChange, onReset }: CostInputsProps) {
  const fuelType = normalizeFuelType(vehicle.rdw.brandstof_omschrijving);
  const isEV = fuelType === "elektrisch";
  const isBusinessOwnership = vehicle.user.ownershipType === "business";

  const consumptionUnit = isEV ? "kWh/100km" : "L/100km";
  const priceUnit = isEV ? "€/kWh" : "€/L";
  const defaultConsumption = DEFAULT_CONSUMPTION[fuelType] ?? 7;
  const defaultPrice = DEFAULT_FUEL_PRICES[fuelType] ?? 2.0;

  return (
    <Card>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-5)" }}>
        {/* Running costs section */}
        <div>
          <h3 style={{ margin: "0 0 var(--spacing-3) 0", fontSize: "var(--text-heading-sm-semibold-fontSize)" }}>
            Variabele kosten
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-3)" }}>
            <Input
              label="Jaarkilometers"
              type="number"
              value={String(inputs.annualKilometers)}
              onChange={(e) => onChange({ annualKilometers: Number(e.target.value) })}
              helperText="km/jaar"
            />
            <Input
              label={`Verbruik (${consumptionUnit})`}
              type="number"
              value={String(inputs.fuelConsumption)}
              onChange={(e) => onChange({ fuelConsumption: Number(e.target.value) })}
              helperText={`Gemiddeld: ${defaultConsumption}`}
            />
            <Input
              label={`${isEV ? "Stroomprijs" : "Brandstofprijs"} (${priceUnit})`}
              type="number"
              value={String(inputs.fuelPrice)}
              onChange={(e) => onChange({ fuelPrice: Number(e.target.value) })}
              helperText={`Standaard: €${defaultPrice.toFixed(2)}`}
            />
            <Input
              label="Verzekering (€/jaar)"
              type="number"
              value={String(inputs.insurancePremium)}
              onChange={(e) => onChange({ insurancePremium: Number(e.target.value) })}
              helperText="WA+ of Allrisk premie"
            />
          </div>
        </div>

        <Divider />

        {/* Fixed costs section */}
        <div>
          <h3 style={{ margin: "0 0 var(--spacing-3) 0", fontSize: "var(--text-heading-sm-semibold-fontSize)" }}>
            Vaste kosten
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-3)" }}>
            <Input
              label="Onderhoud (€/jaar)"
              type="number"
              value={String(inputs.maintenanceCost)}
              onChange={(e) => onChange({ maintenanceCost: Number(e.target.value) })}
              helperText={isEV ? "EV: ~2% van waarde" : "~4% van waarde"}
            />
            <div>
              <Select
                label="Provincie"
                options={PROVINCE_OPTIONS}
                value={inputs.province}
                onChange={(e) => onChange({ province: e.target.value as Province })}
              />
              <p style={{ margin: "var(--spacing-1) 0 0 0", fontSize: "var(--text-label-sm-regular-fontSize)", color: "var(--color-text-subtle-default)" }}>
                Voor wegenbelasting
              </p>
            </div>
          </div>
        </div>

        <Divider />

        {/* Ownership costs section */}
        <div>
          <h3 style={{ margin: "0 0 var(--spacing-3) 0", fontSize: "var(--text-heading-sm-semibold-fontSize)" }}>
            Eigendomskosten
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-3)" }}>
            <Input
              label="Bezitduur (jaren)"
              type="number"
              value={String(inputs.ownershipYears)}
              onChange={(e) => onChange({ ownershipYears: Number(e.target.value) })}
              helperText="1-20 jaar"
            />
            <Input
              label="Restwaarde (€)"
              type="number"
              value={String(inputs.residualValue)}
              onChange={(e) => onChange({ residualValue: Number(e.target.value) })}
              helperText="Na bezitperiode"
            />
          </div>
        </div>

        {/* Tax section (business only) */}
        {isBusinessOwnership && (
          <>
            <Divider />
            <div>
              <h3 style={{ margin: "0 0 var(--spacing-3) 0", fontSize: "var(--text-heading-sm-semibold-fontSize)" }}>
                Belastingen (zakelijk)
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-3)" }}>
                <div>
                  <Select
                    label="Belastingschijf"
                    options={TAX_BRACKET_OPTIONS}
                    value={String(inputs.taxBracket)}
                    onChange={(e) => onChange({ taxBracket: Number(e.target.value) })}
                  />
                  <p style={{ margin: "var(--spacing-1) 0 0 0", fontSize: "var(--text-label-sm-regular-fontSize)", color: "var(--color-text-subtle-default)" }}>
                    Voor bijtelling berekening
                  </p>
                </div>
                <Input
                  label="Zakelijk gebruik (%)"
                  type="number"
                  value={String(Math.round(inputs.businessUsePercent * 100))}
                  onChange={(e) => onChange({ businessUsePercent: Number(e.target.value) / 100 })}
                  helperText="0-100%, voor BTW aftrek"
                />
              </div>
            </div>
          </>
        )}

        {/* Reset button */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "var(--spacing-2)" }}>
          <Button variant="ghost" size="sm" onClick={onReset}>
            Reset naar standaard
          </Button>
        </div>

        {/* Price update notice */}
        <p style={{ margin: 0, fontSize: "var(--text-label-sm-regular-fontSize)", color: "var(--color-text-subtle-default)", textAlign: "center" }}>
          Prijzen bijgewerkt op: {FUEL_PRICES_UPDATED}
        </p>
      </div>
    </Card>
  );
}
