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
  | "measuredPerformance";

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
}
