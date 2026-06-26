"use client";

import { Input, Select, Card, Button, Divider } from "@revikornmann/muka-ui";
import { useTranslations } from "next-intl";
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

export function CostInputs({ inputs, vehicle, onChange, onReset }: CostInputsProps) {
  const t = useTranslations("calculator");
  const fuelType = normalizeFuelType(vehicle.rdw.brandstof_omschrijving);
  const isEV = fuelType === "elektrisch";
  const isBusinessOwnership = vehicle.user.ownershipType === "business";

  const consumptionUnit = isEV ? "kWh/100km" : "L/100km";
  const priceUnit = isEV ? "€/kWh" : "€/L";
  const defaultConsumption = DEFAULT_CONSUMPTION[fuelType] ?? 7;
  const defaultPrice = DEFAULT_FUEL_PRICES[fuelType] ?? 2.0;

  const TAX_BRACKET_OPTIONS = [
    { value: String(TAX_CONSTANTS.taxBrackets.low), label: t("taxBracketLow") },
    { value: String(TAX_CONSTANTS.taxBrackets.high), label: t("taxBracketHigh") },
  ];

  return (
    <Card>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-5)" }}>
        {/* Running costs section */}
        <div>
          <h3 style={{ margin: "0 0 var(--spacing-3) 0", fontSize: "var(--text-heading-sm-semibold-fontSize)" }}>
            {t("variableCosts")}
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-3)" }}>
            <Input
              label={t("annualKm")}
              type="number"
              value={String(inputs.annualKilometers)}
              onChange={(e) => onChange({ annualKilometers: Number(e.target.value) })}
              helperText={t("kmPerYear")}
            />
            <Input
              label={t("consumption", { unit: consumptionUnit })}
              type="number"
              value={String(inputs.fuelConsumption)}
              onChange={(e) => onChange({ fuelConsumption: Number(e.target.value) })}
              helperText={t("consumptionAverage", { value: defaultConsumption })}
            />
            <Input
              label={`${isEV ? t("electricityPrice") : t("fuelPrice")} ${t("priceUnit", { unit: priceUnit })}`}
              type="number"
              value={String(inputs.fuelPrice)}
              onChange={(e) => onChange({ fuelPrice: Number(e.target.value) })}
              helperText={t("defaultPrice", { price: defaultPrice.toFixed(2) })}
            />
            <Input
              label={t("insurance")}
              type="number"
              value={String(inputs.insurancePremium)}
              onChange={(e) => onChange({ insurancePremium: Number(e.target.value) })}
              helperText={t("insuranceHelper")}
            />
          </div>
        </div>

        <Divider />

        {/* Fixed costs section */}
        <div>
          <h3 style={{ margin: "0 0 var(--spacing-3) 0", fontSize: "var(--text-heading-sm-semibold-fontSize)" }}>
            {t("fixedCosts")}
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-3)" }}>
            <Input
              label={t("maintenance")}
              type="number"
              value={String(inputs.maintenanceCost)}
              onChange={(e) => onChange({ maintenanceCost: Number(e.target.value) })}
              helperText={isEV ? t("maintenanceHelperEv") : t("maintenanceHelper")}
            />
            <div>
              <Select
                label={t("province")}
                options={PROVINCE_OPTIONS}
                value={inputs.province}
                onChange={(e) => onChange({ province: e.target.value as Province })}
              />
              <p style={{ margin: "var(--spacing-1) 0 0 0", fontSize: "var(--text-label-sm-regular-fontSize)", color: "var(--color-text-subtle-default)" }}>
                {t("provinceHelper")}
              </p>
            </div>
          </div>
        </div>

        <Divider />

        {/* Ownership costs section */}
        <div>
          <h3 style={{ margin: "0 0 var(--spacing-3) 0", fontSize: "var(--text-heading-sm-semibold-fontSize)" }}>
            {t("ownershipCosts")}
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-3)" }}>
            <Input
              label={t("ownershipDuration")}
              type="number"
              value={String(inputs.ownershipYears)}
              onChange={(e) => onChange({ ownershipYears: Number(e.target.value) })}
              helperText={t("ownershipDurationHelper")}
            />
            <Input
              label={t("residualValue")}
              type="number"
              value={String(inputs.residualValue)}
              onChange={(e) => onChange({ residualValue: Number(e.target.value) })}
              helperText={t("residualValueHelper")}
            />
          </div>
        </div>

        {/* Tax section (business only) */}
        {isBusinessOwnership && (
          <>
            <Divider />
            <div>
              <h3 style={{ margin: "0 0 var(--spacing-3) 0", fontSize: "var(--text-heading-sm-semibold-fontSize)" }}>
                {t("businessTaxes")}
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-3)" }}>
                <div>
                  <Select
                    label={t("taxBracket")}
                    options={TAX_BRACKET_OPTIONS}
                    value={String(inputs.taxBracket)}
                    onChange={(e) => onChange({ taxBracket: Number(e.target.value) })}
                  />
                  <p style={{ margin: "var(--spacing-1) 0 0 0", fontSize: "var(--text-label-sm-regular-fontSize)", color: "var(--color-text-subtle-default)" }}>
                    {t("taxBracketHelper")}
                  </p>
                </div>
                <Input
                  label={t("businessUsage")}
                  type="number"
                  value={String(Math.round(inputs.businessUsePercent * 100))}
                  onChange={(e) => onChange({ businessUsePercent: Number(e.target.value) / 100 })}
                  helperText={t("businessUsageHelper")}
                />
              </div>
            </div>
          </>
        )}

        {/* Reset button */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "var(--spacing-2)" }}>
          <Button variant="ghost" size="sm" onClick={onReset}>
            {t("resetDefaults")}
          </Button>
        </div>

        {/* Price update notice */}
        <p style={{ margin: 0, fontSize: "var(--text-label-sm-regular-fontSize)", color: "var(--color-text-subtle-default)", textAlign: "center" }}>
          {t("pricesUpdated", { date: FUEL_PRICES_UPDATED })}
        </p>
      </div>
    </Card>
  );
}
