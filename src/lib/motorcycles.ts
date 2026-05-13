import { createClient } from "@/lib/supabase";
import type { Motorcycle, MotorcycleInput } from "@/types/motorcycle";
import type { MotorcycleRow } from "@/types/database";

function rowToMotorcycle(row: MotorcycleRow): Motorcycle {
  return {
    id: row.id,
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

export async function createMotorcycle(
  input: MotorcycleInput,
  userId: string,
): Promise<Motorcycle> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("motorcycles")
    .insert({
      user_id: userId,
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
