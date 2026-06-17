export interface Motorcycle {
  id: string;
  modelId: string | null;
  nickname: string | null;
  make: string;
  model: string;
  year: number | null;
  vin: string | null;
  licensePlate: string | null;
  mileageKm: number | null;
  photoUrl: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MotorcycleInput {
  nickname?: string;
  make: string;
  model: string;
  year?: number;
  mileageKm?: number;
}

export interface MotorcycleSpecRow {
  label: string;
  value: string;
  hint?: string;
  /** Optional subgroup, used to split long lists (e.g. torque specs) into
   *  expandable subcategories like "Engine", "Brakes", "Final drive". */
  group?: string;
  /** Per-value provenance. "verified" = from a sourced provider (Car2DB,
   *  Wikidata); "ai" = Claude-estimated, shown with a badge and disclosed by
   *  the AI mechanic. Absent on legacy rows = treat as unspecified. */
  source?: "verified" | "ai";
}

export type MotorcycleSpecCategory =
  | "identification"
  | "engine"
  | "electrical"
  | "engineOutput"
  | "drivetrain"
  | "chassis"
  | "brakes"
  | "wheelsTyres"
  | "dimensions"
  | "fuelEconomy"
  | "torqueSpecs";

export type MotorcycleSpecs = Partial<
  Record<MotorcycleSpecCategory, MotorcycleSpecRow[]>
>;

export interface MotorcycleModel {
  id: string;
  make: string;
  model: string;
  year: number;
  slug: string;
  specs: MotorcycleSpecs;
  /** Provenance of the spec data; null = identity-only row, specs not yet filled. */
  source: "nhtsa" | "car2db" | "wikidata" | "ai" | "manual" | "mixed" | null;
  /** True when specs come from a sourced/verified provider rather than AI estimation. */
  verified: boolean;
  /** ISO timestamp specs were populated; null = identity-only (skeleton) row. */
  specsFilledAt: string | null;
  /** Lazy spec-generation state: null → pending → ready | failed. */
  specsStatus: "pending" | "ready" | "failed" | null;
}
