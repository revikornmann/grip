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
  /** @deprecated Dormant legacy column from the removed RDW plate lookup.
   *  Retained (not dropped) to avoid a destructive migration; unused by the app. */
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
  /** Provenance of the spec data. NULL = identity-only row, specs not yet filled. */
  source: "nhtsa" | "car2db" | "wikidata" | "ai" | "manual" | "mixed" | null;
  /** When specs were populated; NULL = identity-only (skeleton) row pending fill. */
  specs_filled_at: string | null;
  /** Lazy spec-generation state. NULL = not requested, then pending → ready | failed. */
  specs_status: "pending" | "ready" | "failed" | null;
  /** True when specs come from a sourced/verified provider rather than AI estimation. */
  verified: boolean;
  /** Future-proofing for cars/trucks; motorcycles only for now. */
  vehicle_type: string;
  created_at: string;
  updated_at: string;
}

/** Per-locale translation of a model's canonical (English) specs. The English
 *  form lives in `motorcycle_models.specs`; rows here mirror it with only the
 *  worded fields (label/group/hint) translated — values and `source` preserved. */
export interface MotorcycleModelSpecTranslationRow {
  model_id: string;
  locale: string;
  /** Translated specs; NULL while a translation is pending or has failed. */
  specs: MotorcycleSpecs | null;
  /** Lazy translation state: pending → ready | failed. */
  status: "pending" | "ready" | "failed";
  created_at: string;
  updated_at: string;
}
