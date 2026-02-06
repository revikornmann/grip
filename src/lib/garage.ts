import { storage } from "@/lib/storage";
import type { GarageVehicle } from "@/types/garage";
import type { Vehicle } from "@/types/vehicle";

const GARAGE_KEY = "garage";

export function getGarage(): GarageVehicle[] {
  return storage.get<GarageVehicle[]>(GARAGE_KEY) ?? [];
}

function saveGarage(vehicles: GarageVehicle[]): void {
  storage.set(GARAGE_KEY, vehicles);
}

/** Convert a lookup Vehicle into the RDW portion of a GarageVehicle. */
export function vehicleToRdw(v: Vehicle): GarageVehicle["rdw"] {
  return {
    kenteken: v.plate,
    merk: v.make,
    handelsbenaming: v.model,
    brandstof_omschrijving: v.fuelType,
    co2_uitstoot_gecombineerd: v.co2Emissions,
    datum_eerste_toelating: v.firstRegistrationDate,
    catalogusprijs: v.catalogPrice,
    bruto_bpm: v.bpmAmount,
  };
}

export function addVehicle(
  rdw: GarageVehicle["rdw"],
  user: GarageVehicle["user"],
): GarageVehicle {
  const vehicle: GarageVehicle = {
    id: crypto.randomUUID(),
    addedAt: new Date().toISOString(),
    rdw,
    user,
  };
  const garage = getGarage();
  saveGarage([...garage, vehicle]);
  return vehicle;
}

export function updateVehicle(
  id: string,
  updates: Partial<GarageVehicle["user"]>,
): void {
  const garage = getGarage();
  const idx = garage.findIndex((v) => v.id === id);
  if (idx === -1) return;
  garage[idx] = { ...garage[idx], user: { ...garage[idx].user, ...updates } };
  saveGarage(garage);
}

export function updateVehicleRdw(
  id: string,
  rdw: GarageVehicle["rdw"],
): void {
  const garage = getGarage();
  const idx = garage.findIndex((v) => v.id === id);
  if (idx === -1) return;
  garage[idx] = { ...garage[idx], rdw };
  saveGarage(garage);
}

export function removeVehicle(id: string): void {
  const garage = getGarage();
  saveGarage(garage.filter((v) => v.id !== id));
}

export function duplicateVehicle(id: string): GarageVehicle | null {
  const garage = getGarage();
  const source = garage.find((v) => v.id === id);
  if (!source) return null;

  const copy: GarageVehicle = {
    id: crypto.randomUUID(),
    addedAt: new Date().toISOString(),
    rdw: { ...source.rdw },
    user: {
      ...source.user,
      nickname: source.user.nickname
        ? `${source.user.nickname} (kopie)`
        : undefined,
    },
  };
  saveGarage([...garage, copy]);
  return copy;
}

export function isInGarage(plate: string): boolean {
  return getGarage().some((v) => v.rdw.kenteken === plate);
}

export function getVehicleByPlate(plate: string): GarageVehicle | null {
  return getGarage().find((v) => v.rdw.kenteken === plate) ?? null;
}
