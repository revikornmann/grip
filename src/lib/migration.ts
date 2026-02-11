import { storage } from "@/lib/storage";
import { getLocalGarageData, clearLocalGarage, addVehicle } from "@/lib/garage";

const MIGRATED_KEY = "garage_migrated";

export async function migrateLocalToSupabase(
  userId: string,
): Promise<{ migrated: number; failed: number }> {
  // Check if already migrated
  if (storage.get<boolean>(MIGRATED_KEY)) {
    return { migrated: 0, failed: 0 };
  }

  const localVehicles = getLocalGarageData();

  if (localVehicles.length === 0) {
    storage.set(MIGRATED_KEY, true);
    return { migrated: 0, failed: 0 };
  }

  let migrated = 0;
  let failed = 0;

  for (const vehicle of localVehicles) {
    try {
      await addVehicle(vehicle.rdw, vehicle.user, userId);
      migrated++;
    } catch {
      failed++;
    }
  }

  if (failed === 0) {
    clearLocalGarage();
  }

  storage.set(MIGRATED_KEY, true);

  return { migrated, failed };
}
