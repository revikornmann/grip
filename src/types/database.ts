import type { MotorcycleSpecs } from "./motorcycle";

export interface MotorcycleRow {
  id: string;
  user_id: string;
  model_id: string | null;
  nickname: string | null;
  make: string;
  model: string;
  year: number | null;
  vin: string | null;
  license_plate: string | null;
  rdw_snapshot: Record<string, unknown> | null;
  mileage_km: number | null;
  photo_url: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface MotorcycleModelRow {
  id: string;
  make: string;
  model: string;
  year: number;
  slug: string;
  normalized_key: string;
  specs: MotorcycleSpecs;
  created_at: string;
  updated_at: string;
}
