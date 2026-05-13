export interface MotorcycleRow {
  id: string;
  user_id: string;
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
