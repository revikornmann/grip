export interface Motorcycle {
  id: string;
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
