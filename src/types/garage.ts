/** A vehicle saved in the user's garage with both RDW and user-supplied data. */
export interface GarageVehicle {
  id: string;
  addedAt: string; // ISO timestamp

  /** Data fetched from the RDW API */
  rdw: {
    kenteken: string;
    merk: string;
    handelsbenaming: string;
    brandstof_omschrijving: string | null;
    co2_uitstoot_gecombineerd: number | null;
    datum_eerste_toelating: string; // YYYYMMDD
    catalogusprijs: number | null;
    bruto_bpm: number | null;
  };

  /** User-supplied data entered via the garage form */
  user: {
    purchasePrice: number;
    annualKilometers: number;
    businessKilometers: number;
    ownershipType: "private" | "business";
    nickname?: string;
    notes?: string;
  };
}

/** Default values for user-supplied garage data */
export const GARAGE_USER_DEFAULTS: GarageVehicle["user"] = {
  purchasePrice: 0,
  annualKilometers: 15000,
  businessKilometers: 0,
  ownershipType: "private",
};
