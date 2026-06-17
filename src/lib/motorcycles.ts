import { createClient } from "@/lib/supabase";
import type {
  Motorcycle,
  MotorcycleInput,
  MotorcycleModel,
} from "@/types/motorcycle";
import type { MotorcycleRow, MotorcycleModelRow } from "@/types/database";

function rowToMotorcycle(row: MotorcycleRow): Motorcycle {
  return {
    id: row.id,
    modelId: row.model_id,
    nickname: row.nickname,
    make: row.make,
    model: row.model,
    year: row.year,
    vin: row.vin,
    licensePlate: row.license_plate,
    mileageKm: row.mileage_km,
    photoUrl: row.photo_url,
    isArchived: row.is_archived,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToMotorcycleModel(row: MotorcycleModelRow): MotorcycleModel {
  return {
    id: row.id,
    make: row.make,
    model: row.model,
    year: row.year,
    slug: row.slug,
    specs: row.specs ?? {},
    source: row.source ?? null,
    verified: row.verified ?? false,
    specsFilledAt: row.specs_filled_at ?? null,
    specsStatus: row.specs_status ?? null,
  };
}

export async function listMotorcycles(userId: string): Promise<Motorcycle[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("motorcycles")
    .select("*")
    .eq("user_id", userId)
    .eq("is_archived", false)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as MotorcycleRow[]).map(rowToMotorcycle);
}

export async function getMotorcycle(id: string): Promise<Motorcycle | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("motorcycles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? rowToMotorcycle(data as MotorcycleRow) : null;
}

export async function getMotorcycleModel(
  id: string,
): Promise<MotorcycleModel | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("motorcycle_models")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? rowToMotorcycleModel(data as MotorcycleModelRow) : null;
}

function normalizeMakeModelKey(make: string, model: string): string {
  return `${make}${model}`.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export async function findMotorcycleModel(
  make: string,
  model: string,
  year: number | null | undefined,
): Promise<MotorcycleModel | null> {
  if (!year) return null;
  const supabase = createClient();
  const { data, error } = await supabase
    .from("motorcycle_models")
    .select("*")
    .eq("normalized_key", normalizeMakeModelKey(make, model))
    .eq("year", year)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? rowToMotorcycleModel(data as MotorcycleModelRow) : null;
}

export async function createMotorcycle(
  input: MotorcycleInput,
  userId: string,
): Promise<Motorcycle> {
  const supabase = createClient();
  const match = await findMotorcycleModel(
    input.make,
    input.model,
    input.year ?? null,
  );

  const { data, error } = await supabase
    .from("motorcycles")
    .insert({
      user_id: userId,
      model_id: match?.id ?? null,
      nickname: input.nickname ?? null,
      make: input.make,
      model: input.model,
      year: input.year ?? null,
      mileage_km: input.mileageKm ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToMotorcycle(data as MotorcycleRow);
}

export async function archiveMotorcycle(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("motorcycles")
    .update({ is_archived: true })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteMotorcycle(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("motorcycles").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
