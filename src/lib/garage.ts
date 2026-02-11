import { storage } from "@/lib/storage";
import { createClient } from "@/lib/supabase";
import type { GarageVehicle } from "@/types/garage";
import type { GarageVehicleRow } from "@/types/database";
import type { Vehicle } from "@/types/vehicle";

const GARAGE_KEY = "garage";

// ---------------------------------------------------------------------------
// Conversion helpers between Supabase row and local GarageVehicle shape
// ---------------------------------------------------------------------------

function rowToGarageVehicle(row: GarageVehicleRow): GarageVehicle {
  return {
    id: row.id,
    addedAt: row.added_at,
    rdw: {
      kenteken: row.kenteken,
      merk: row.merk ?? "",
      handelsbenaming: row.handelsbenaming ?? "",
      brandstof_omschrijving: row.brandstof_omschrijving,
      co2_uitstoot_gecombineerd: row.co2_uitstoot_gecombineerd,
      datum_eerste_toelating: row.datum_eerste_toelating ?? "",
      catalogusprijs: row.catalogusprijs,
      bruto_bpm: row.bruto_bpm,
    },
    user: {
      purchasePrice: row.purchase_price,
      annualKilometers: row.annual_kilometers,
      businessKilometers: row.business_kilometers,
      ownershipType: row.ownership_type,
      nickname: row.nickname ?? undefined,
      notes: row.notes ?? undefined,
    },
  };
}

function garageVehicleToInsert(
  vehicle: GarageVehicle,
  userId: string,
): Record<string, unknown> {
  return {
    user_id: userId,
    added_at: vehicle.addedAt,
    kenteken: vehicle.rdw.kenteken,
    merk: vehicle.rdw.merk,
    handelsbenaming: vehicle.rdw.handelsbenaming,
    brandstof_omschrijving: vehicle.rdw.brandstof_omschrijving,
    co2_uitstoot_gecombineerd: vehicle.rdw.co2_uitstoot_gecombineerd,
    datum_eerste_toelating: vehicle.rdw.datum_eerste_toelating,
    catalogusprijs: vehicle.rdw.catalogusprijs,
    bruto_bpm: vehicle.rdw.bruto_bpm,
    purchase_price: vehicle.user.purchasePrice,
    annual_kilometers: vehicle.user.annualKilometers,
    business_kilometers: vehicle.user.businessKilometers,
    ownership_type: vehicle.user.ownershipType,
    nickname: vehicle.user.nickname ?? null,
    notes: vehicle.user.notes ?? null,
  };
}

// ---------------------------------------------------------------------------
// Local storage helpers (original implementation)
// ---------------------------------------------------------------------------

function getLocalGarage(): GarageVehicle[] {
  return storage.get<GarageVehicle[]>(GARAGE_KEY) ?? [];
}

function saveLocalGarage(vehicles: GarageVehicle[]): void {
  storage.set(GARAGE_KEY, vehicles);
}

// ---------------------------------------------------------------------------
// Public API — accepts optional userId to choose backend
// ---------------------------------------------------------------------------

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

export async function getGarage(
  userId?: string | null,
): Promise<GarageVehicle[]> {
  if (!userId) return getLocalGarage();

  const supabase = createClient();
  const { data, error } = await supabase
    .from("garage_vehicles")
    .select("*")
    .eq("user_id", userId)
    .order("added_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as GarageVehicleRow[]).map(rowToGarageVehicle);
}

export async function addVehicle(
  rdw: GarageVehicle["rdw"],
  user: GarageVehicle["user"],
  userId?: string | null,
): Promise<GarageVehicle> {
  const vehicle: GarageVehicle = {
    id: crypto.randomUUID(),
    addedAt: new Date().toISOString(),
    rdw,
    user,
  };

  if (!userId) {
    const garage = getLocalGarage();
    saveLocalGarage([...garage, vehicle]);
    return vehicle;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("garage_vehicles")
    .insert(garageVehicleToInsert(vehicle, userId))
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToGarageVehicle(data as GarageVehicleRow);
}

export async function updateVehicle(
  id: string,
  updates: Partial<GarageVehicle["user"]>,
  userId?: string | null,
): Promise<void> {
  if (!userId) {
    const garage = getLocalGarage();
    const idx = garage.findIndex((v) => v.id === id);
    if (idx === -1) return;
    garage[idx] = { ...garage[idx], user: { ...garage[idx].user, ...updates } };
    saveLocalGarage(garage);
    return;
  }

  const supabase = createClient();
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.purchasePrice !== undefined)
    row.purchase_price = updates.purchasePrice;
  if (updates.annualKilometers !== undefined)
    row.annual_kilometers = updates.annualKilometers;
  if (updates.businessKilometers !== undefined)
    row.business_kilometers = updates.businessKilometers;
  if (updates.ownershipType !== undefined)
    row.ownership_type = updates.ownershipType;
  if (updates.nickname !== undefined) row.nickname = updates.nickname ?? null;
  if (updates.notes !== undefined) row.notes = updates.notes ?? null;

  const { error } = await supabase
    .from("garage_vehicles")
    .update(row)
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function updateVehicleRdw(
  id: string,
  rdw: GarageVehicle["rdw"],
  userId?: string | null,
): Promise<void> {
  if (!userId) {
    const garage = getLocalGarage();
    const idx = garage.findIndex((v) => v.id === id);
    if (idx === -1) return;
    garage[idx] = { ...garage[idx], rdw };
    saveLocalGarage(garage);
    return;
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("garage_vehicles")
    .update({
      kenteken: rdw.kenteken,
      merk: rdw.merk,
      handelsbenaming: rdw.handelsbenaming,
      brandstof_omschrijving: rdw.brandstof_omschrijving,
      co2_uitstoot_gecombineerd: rdw.co2_uitstoot_gecombineerd,
      datum_eerste_toelating: rdw.datum_eerste_toelating,
      catalogusprijs: rdw.catalogusprijs,
      bruto_bpm: rdw.bruto_bpm,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function removeVehicle(
  id: string,
  userId?: string | null,
): Promise<void> {
  if (!userId) {
    const garage = getLocalGarage();
    saveLocalGarage(garage.filter((v) => v.id !== id));
    return;
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("garage_vehicles")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function duplicateVehicle(
  id: string,
  userId?: string | null,
): Promise<GarageVehicle | null> {
  if (!userId) {
    const garage = getLocalGarage();
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
    saveLocalGarage([...garage, copy]);
    return copy;
  }

  const supabase = createClient();
  const { data: sourceData, error: fetchError } = await supabase
    .from("garage_vehicles")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !sourceData) return null;

  const source = rowToGarageVehicle(sourceData as GarageVehicleRow);
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

  const { data, error } = await supabase
    .from("garage_vehicles")
    .insert(garageVehicleToInsert(copy, userId))
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToGarageVehicle(data as GarageVehicleRow);
}

export async function isInGarage(
  plate: string,
  userId?: string | null,
): Promise<boolean> {
  if (!userId) return getLocalGarage().some((v) => v.rdw?.kenteken === plate);

  const supabase = createClient();
  const { count, error } = await supabase
    .from("garage_vehicles")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("kenteken", plate);

  if (error) return false;
  return (count ?? 0) > 0;
}

export async function getVehicleByPlate(
  plate: string,
  userId?: string | null,
): Promise<GarageVehicle | null> {
  if (!userId)
    return getLocalGarage().find((v) => v.rdw?.kenteken === plate) ?? null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("garage_vehicles")
    .select("*")
    .eq("user_id", userId)
    .eq("kenteken", plate)
    .limit(1)
    .single();

  if (error || !data) return null;
  return rowToGarageVehicle(data as GarageVehicleRow);
}

/** Get local garage data directly (used for migration). */
export function getLocalGarageData(): GarageVehicle[] {
  return getLocalGarage();
}

/** Clear local garage data (used after migration). */
export function clearLocalGarage(): void {
  storage.remove(GARAGE_KEY);
}
