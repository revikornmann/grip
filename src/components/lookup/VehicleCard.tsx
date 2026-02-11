"use client";

import { Card, Chip, Label, Divider } from "muka-ui";
import type { Vehicle } from "@/types/vehicle";
import { formatCurrency, formatDate } from "@/lib/formatting";

function parseRDWDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.length !== 8) return null;
  const year = parseInt(dateStr.slice(0, 4), 10);
  const month = parseInt(dateStr.slice(4, 6), 10) - 1;
  const day = parseInt(dateStr.slice(6, 8), 10);
  return new Date(year, month, day);
}

function getVehicleAge(dateStr: string): number | null {
  const date = parseRDWDate(dateStr);
  if (!date) return null;
  const now = new Date();
  return Math.floor(
    (now.getTime() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
  );
}

function isEV(vehicle: Vehicle): boolean {
  if (!vehicle.fuelType) return false;
  const lower = vehicle.fuelType.toLowerCase();
  return lower === "elektriciteit" || lower === "elektrisch";
}

function isYoungtimer(vehicle: Vehicle): boolean {
  const age = getVehicleAge(vehicle.firstRegistrationDate);
  return age !== null && age >= 15;
}

interface DetailRowProps {
  label: string;
  value: string;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        padding: "var(--spacing-2) 0",
      }}
    >
      <Label size="sm">{label}</Label>
      <span>{value}</span>
    </div>
  );
}

interface VehicleCardProps {
  vehicle: Vehicle;
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const registrationDate = parseRDWDate(vehicle.firstRegistrationDate);
  const age = getVehicleAge(vehicle.firstRegistrationDate);
  const ev = isEV(vehicle);
  const youngtimer = isYoungtimer(vehicle);

  return (
    <Card padding="lg" as="article" aria-label={`${vehicle.make} ${vehicle.model}`}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-4)",
        }}
      >
        {/* Header: make + model + badges */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "var(--spacing-2)",
          }}
        >
          <h2
            style={{
              fontSize: "var(--font-size-xl)",
              margin: 0,
            }}
          >
            {vehicle.make} {vehicle.model}
          </h2>
          <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
            {ev && <Chip variant="success">Elektrisch</Chip>}
            {youngtimer && <Chip variant="info">Youngtimer</Chip>}
          </div>
        </div>

        <Divider />

        {/* Vehicle details */}
        <div>
          <DetailRow
            label="Eerste toelating"
            value={
              registrationDate
                ? formatDate(registrationDate)
                : "Onbekend"
            }
          />
          <DetailRow
            label="Leeftijd"
            value={age !== null ? `${age} jaar` : "Onbekend"}
          />
          <DetailRow
            label="Brandstoftype"
            value={vehicle.fuelType ?? "Onbekend"}
          />
          <DetailRow
            label="CO₂-uitstoot"
            value={
              vehicle.co2Emissions !== null
                ? ev && vehicle.co2Emissions === 0
                  ? "0 g/km"
                  : `${vehicle.co2Emissions} g/km`
                : "Onbekend"
            }
          />
          <DetailRow
            label="Catalogusprijs"
            value={
              vehicle.catalogPrice !== null
                ? formatCurrency(vehicle.catalogPrice, 0)
                : "Onbekend"
            }
          />
          <DetailRow
            label="Bruto BPM"
            value={
              vehicle.bpmAmount !== null
                ? formatCurrency(vehicle.bpmAmount, 0)
                : "Onbekend"
            }
          />
        </div>
      </div>
    </Card>
  );
}
