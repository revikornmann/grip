import type { Vehicle, RDWVehicleRaw, RDWFuelRaw } from "@/types/vehicle";
import { normalizePlate } from "@/lib/validation";

const RDW_BASE = "https://opendata.rdw.nl/resource";
const VEHICLE_ENDPOINT = `${RDW_BASE}/m9d7-ebf2.json`;
const FUEL_ENDPOINT = `${RDW_BASE}/8ys7-d773.json`;

export type RDWErrorCode = "NOT_FOUND" | "NETWORK" | "SERVER" | "UNKNOWN";

export class RDWError extends Error {
  constructor(
    message: string,
    public readonly code: RDWErrorCode,
  ) {
    super(message);
    this.name = "RDWError";
  }
}

/**
 * Fetch vehicle data from the RDW open-data API.
 *
 * Makes two parallel requests:
 *  1. Gekentekende Voertuigen (main dataset) — make, model, registration, price
 *  2. Brandstof (fuel dataset) — fuel type, CO₂ emissions
 *
 * Throws `RDWError` with a user-friendly Dutch message on failure.
 */
export async function lookupVehicle(plate: string): Promise<Vehicle> {
  const normalized = normalizePlate(plate);

  let vehicleRes: Response;
  let fuelRes: Response;

  try {
    [vehicleRes, fuelRes] = await Promise.all([
      fetch(`${VEHICLE_ENDPOINT}?kenteken=${normalized}`),
      fetch(`${FUEL_ENDPOINT}?kenteken=${normalized}`),
    ]);
  } catch {
    throw new RDWError("Verbinding mislukt", "NETWORK");
  }

  if (!vehicleRes.ok) {
    if (vehicleRes.status >= 500) {
      throw new RDWError(
        "RDW service tijdelijk niet beschikbaar",
        "SERVER",
      );
    }
    throw new RDWError("Er is een fout opgetreden", "UNKNOWN");
  }

  const vehicles: RDWVehicleRaw[] = await vehicleRes.json();

  if (vehicles.length === 0) {
    throw new RDWError("Kenteken niet gevonden", "NOT_FOUND");
  }

  const raw = vehicles[0];

  let fuel: RDWFuelRaw | null = null;
  if (fuelRes.ok) {
    const fuels: RDWFuelRaw[] = await fuelRes.json();
    fuel =
      fuels.find((f) => f.brandstof_volgnummer === "1") ?? fuels[0] ?? null;
  }

  return normalizeVehicle(raw, fuel);
}

function normalizeVehicle(
  raw: RDWVehicleRaw,
  fuel: RDWFuelRaw | null,
): Vehicle {
  return {
    plate: raw.kenteken,
    make: capitalize(raw.merk),
    model: capitalize(raw.handelsbenaming),
    fuelType: fuel?.brandstof_omschrijving
      ? capitalize(fuel.brandstof_omschrijving)
      : null,
    co2Emissions: fuel?.co2_uitstoot_gecombineerd
      ? parseInt(fuel.co2_uitstoot_gecombineerd, 10)
      : null,
    firstRegistrationDate: raw.datum_eerste_toelating ?? "",
    catalogPrice: raw.catalogusprijs
      ? parseInt(raw.catalogusprijs, 10)
      : null,
    bpmAmount: raw.bruto_bpm ? parseInt(raw.bruto_bpm, 10) : null,
  };
}

function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
