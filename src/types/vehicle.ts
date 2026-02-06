/** Raw response from RDW Gekentekende Voertuigen API (m9d7-ebf2) */
export interface RDWVehicleRaw {
  kenteken: string;
  merk: string;
  handelsbenaming: string;
  datum_eerste_toelating: string; // YYYYMMDD
  catalogusprijs?: string;
  bruto_bpm?: string;
  eerste_kleur?: string;
  inrichting?: string;
  voertuigsoort?: string;
  massa_ledig_voertuig?: string;
}

/** Raw response from RDW Brandstof API (8ys7-d773) */
export interface RDWFuelRaw {
  kenteken: string;
  brandstof_omschrijving?: string;
  co2_uitstoot_gecombineerd?: string;
  brandstof_volgnummer?: string;
}

/** Normalized vehicle data used throughout the app */
export interface Vehicle {
  plate: string;
  make: string;
  model: string;
  fuelType: string | null;
  co2Emissions: number | null;
  firstRegistrationDate: string; // YYYYMMDD
  catalogPrice: number | null;
  bpmAmount: number | null;
}

/** Stored in recent lookups history */
export interface RecentLookup {
  plate: string;
  make: string;
  model: string;
  lookedUpAt: string; // ISO string
}
