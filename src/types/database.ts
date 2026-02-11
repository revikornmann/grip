export interface GarageVehicleRow {
  id: string;
  user_id: string;
  added_at: string;

  // RDW data
  kenteken: string;
  merk: string | null;
  handelsbenaming: string | null;
  brandstof_omschrijving: string | null;
  co2_uitstoot_gecombineerd: number | null;
  datum_eerste_toelating: string | null;
  catalogusprijs: number | null;
  bruto_bpm: number | null;

  // User-supplied data
  purchase_price: number;
  annual_kilometers: number;
  business_kilometers: number;
  ownership_type: "private" | "business";
  nickname: string | null;
  notes: string | null;

  created_at: string;
  updated_at: string;
}