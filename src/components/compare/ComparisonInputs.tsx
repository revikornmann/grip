"use client";

import { Card, Input, Select, Button, Divider } from "muka-ui";
import type { CostInputs, Province } from "@/lib/calculator";
import { PROVINCES, TAX_CONSTANTS } from "@/lib/calculator";

interface ComparisonInputsProps {
  inputs: Omit<CostInputs, "vehicle">;
  onChange: (updates: Partial<Omit<CostInputs, "vehicle">>) => void;
  onReset: () => void;
}

const PROVINCE_OPTIONS = PROVINCES.map((p) => ({ value: p, label: p }));

const TAX_BRACKET_OPTIONS = [
  { value: String(TAX_CONSTANTS.taxBrackets.low), label: "36,93%" },
  { value: String(TAX_CONSTANTS.taxBrackets.high), label: "49,50%" },
];

const PRESETS = [
  {
    label: "Vooral zakelijk (90%)",
    businessUsePercent: 0.9,
    annualKilometers: 25000,
  },
  {
    label: "Gemengd gebruik (70%)",
    businessUsePercent: 0.7,
    annualKilometers: 20000,
  },
  {
    label: "Vooral privé (40%)",
    businessUsePercent: 0.4,
    annualKilometers: 15000,
  },
];

export function ComparisonInputs({
  inputs,
  onChange,
  onReset,
}: ComparisonInputsProps) {
  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    onChange({
      businessUsePercent: preset.businessUsePercent,
      annualKilometers: preset.annualKilometers,
    });
  };

  return (
    <Card>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
        <h3 style={{ margin: 0, fontSize: "var(--text-heading-sm-semibold-fontSize)" }}>
          Aannames aanpassen
        </h3>

        {/* Quick presets */}
        <div>
          <p
            style={{
              margin: "0 0 var(--spacing-2) 0",
              fontSize: "var(--text-label-sm-regular-fontSize)",
              color: "var(--color-text-subtle-default)",
            }}
          >
            Snelkeuze scenario:
          </p>
          <div style={{ display: "flex", gap: "var(--spacing-2)", flexWrap: "wrap" }}>
            {PRESETS.map((preset) => (
              <Button
                key={preset.label}
                variant="secondary"
                size="sm"
                onClick={() => applyPreset(preset)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        <Divider />

        {/* Input fields */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-3)" }}>
          <Input
            label="Jaarkilometers"
            type="number"
            value={String(inputs.annualKilometers)}
            onChange={(e) => onChange({ annualKilometers: Number(e.target.value) })}
          />
          <Input
            label="Zakelijk gebruik (%)"
            type="number"
            value={String(Math.round(inputs.businessUsePercent * 100))}
            onChange={(e) =>
              onChange({ businessUsePercent: Number(e.target.value) / 100 })
            }
            helperText="0-100%"
          />
          <div>
            <Select
              label="Belastingschijf"
              options={TAX_BRACKET_OPTIONS}
              value={String(inputs.taxBracket)}
              onChange={(e) => onChange({ taxBracket: Number(e.target.value) })}
            />
          </div>
          <Input
            label="Bezitduur (jaren)"
            type="number"
            value={String(inputs.ownershipYears)}
            onChange={(e) => onChange({ ownershipYears: Number(e.target.value) })}
            helperText="1-20 jaar"
          />
        </div>

        <Divider />

        {/* More options (collapsible in future) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-3)" }}>
          <Input
            label="Verzekering (€/jaar)"
            type="number"
            value={String(inputs.insurancePremium)}
            onChange={(e) => onChange({ insurancePremium: Number(e.target.value) })}
          />
          <Input
            label="Onderhoud (€/jaar)"
            type="number"
            value={String(inputs.maintenanceCost)}
            onChange={(e) => onChange({ maintenanceCost: Number(e.target.value) })}
          />
          <div>
            <Select
              label="Provincie"
              options={PROVINCE_OPTIONS}
              value={inputs.province}
              onChange={(e) => onChange({ province: e.target.value as Province })}
            />
          </div>
          <Input
            label="Restwaarde (€)"
            type="number"
            value={String(inputs.residualValue)}
            onChange={(e) => onChange({ residualValue: Number(e.target.value) })}
          />
        </div>

        {/* Reset button */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button variant="ghost" size="sm" onClick={onReset}>
            Reset naar standaard
          </Button>
        </div>
      </div>
    </Card>
  );
}
