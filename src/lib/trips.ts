/**
 * Trip Management Service
 * Handles CRUD operations for kilometer tracking with dual-backend support.
 */

import { storage } from "@/lib/storage";
import { createClient } from "@/lib/supabase";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TripPurpose =
  | "klantbezoek"
  | "vergadering"
  | "inkoop"
  | "levering"
  | "opleiding"
  | "netwerken"
  | "woon-werk" // Counted as private
  | "prive"
  | "overig";

export type TripCategory = "business" | "private";

export interface Trip {
  id: string;
  vehicleId: string;
  date: string; // ISO date (YYYY-MM-DD)
  startLocation: string;
  endLocation: string;
  distanceKm: number;
  purpose: TripPurpose;
  category: TripCategory;
  confidence: "high" | "medium" | "low";
  odometerStart?: number;
  odometerEnd?: number;
  notes?: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TripInput {
  vehicleId: string;
  date: string;
  startLocation: string;
  endLocation: string;
  distanceKm: number;
  purpose: TripPurpose;
  category?: TripCategory;
  odometerStart?: number;
  odometerEnd?: number;
  notes?: string;
}

export interface TripStats {
  totalKm: number;
  businessKm: number;
  privateKm: number;
  tripCount: number;
  businessTripCount: number;
  privateTripCount: number;
  businessPercent: number;
  privatePercent: number;
}

export interface MonthlyReport {
  month: string; // YYYY-MM
  stats: TripStats;
  trips: Trip[];
  isLocked: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TRIPS_KEY = "trips";
const LOCKED_MONTHS_KEY = "locked-months";

export const TRIP_PURPOSE_LABELS: Record<TripPurpose, string> = {
  klantbezoek: "Klantbezoek",
  vergadering: "Vergadering",
  inkoop: "Inkoop",
  levering: "Levering",
  opleiding: "Opleiding",
  netwerken: "Netwerken",
  "woon-werk": "Woon-werk",
  prive: "Privé",
  overig: "Overig",
};

/** Purposes that count as private use */
const PRIVATE_PURPOSES: TripPurpose[] = ["woon-werk", "prive"];

/** Maximum private km before full bijtelling applies */
export const PRIVATE_KM_LIMIT = 500;

/** Warning threshold (80% of limit) */
export const PRIVATE_KM_WARNING = 400;

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

/** Determine trip category based on purpose */
export function getCategoryFromPurpose(purpose: TripPurpose): TripCategory {
  return PRIVATE_PURPOSES.includes(purpose) ? "private" : "business";
}

/** Calculate stats from a list of trips */
export function calculateTripStats(trips: Trip[]): TripStats {
  const businessTrips = trips.filter((t) => t.category === "business");
  const privateTrips = trips.filter((t) => t.category === "private");

  const businessKm = businessTrips.reduce((sum, t) => sum + t.distanceKm, 0);
  const privateKm = privateTrips.reduce((sum, t) => sum + t.distanceKm, 0);
  const totalKm = businessKm + privateKm;

  return {
    totalKm,
    businessKm,
    privateKm,
    tripCount: trips.length,
    businessTripCount: businessTrips.length,
    privateTripCount: privateTrips.length,
    businessPercent: totalKm > 0 ? businessKm / totalKm : 0,
    privatePercent: totalKm > 0 ? privateKm / totalKm : 0,
  };
}

/** Get month string from date */
function getMonth(date: string): string {
  return date.substring(0, 7); // YYYY-MM
}

// ---------------------------------------------------------------------------
// Local Storage Helpers
// ---------------------------------------------------------------------------

function getLocalTrips(): Trip[] {
  return storage.get<Trip[]>(TRIPS_KEY) ?? [];
}

function saveLocalTrips(trips: Trip[]): void {
  storage.set(TRIPS_KEY, trips);
}

function getLocalLockedMonths(): string[] {
  return storage.get<string[]>(LOCKED_MONTHS_KEY) ?? [];
}

function saveLocalLockedMonths(months: string[]): void {
  storage.set(LOCKED_MONTHS_KEY, months);
}

// ---------------------------------------------------------------------------
// Supabase Row Conversion
// ---------------------------------------------------------------------------

interface TripRow {
  id: string;
  user_id: string;
  vehicle_id: string;
  date: string;
  start_location: string;
  end_location: string;
  distance_km: number;
  purpose: string;
  category: string;
  confidence: string;
  odometer_start: number | null;
  odometer_end: number | null;
  notes: string | null;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

function rowToTrip(row: TripRow): Trip {
  return {
    id: row.id,
    vehicleId: row.vehicle_id,
    date: row.date,
    startLocation: row.start_location,
    endLocation: row.end_location,
    distanceKm: row.distance_km,
    purpose: row.purpose as TripPurpose,
    category: row.category as TripCategory,
    confidence: row.confidence as "high" | "medium" | "low",
    odometerStart: row.odometer_start ?? undefined,
    odometerEnd: row.odometer_end ?? undefined,
    notes: row.notes ?? undefined,
    verified: row.verified,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function tripToInsert(
  trip: Trip,
  userId: string,
): Record<string, unknown> {
  return {
    user_id: userId,
    vehicle_id: trip.vehicleId,
    date: trip.date,
    start_location: trip.startLocation,
    end_location: trip.endLocation,
    distance_km: trip.distanceKm,
    purpose: trip.purpose,
    category: trip.category,
    confidence: trip.confidence,
    odometer_start: trip.odometerStart ?? null,
    odometer_end: trip.odometerEnd ?? null,
    notes: trip.notes ?? null,
    verified: trip.verified,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Get all trips for a user/vehicle */
export async function getTrips(
  vehicleId?: string,
  userId?: string | null,
): Promise<Trip[]> {
  if (!userId) {
    const trips = getLocalTrips();
    return vehicleId ? trips.filter((t) => t.vehicleId === vehicleId) : trips;
  }

  const supabase = createClient();
  let query = supabase
    .from("trips")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (vehicleId) {
    query = query.eq("vehicle_id", vehicleId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as TripRow[]).map(rowToTrip);
}

/** Get trips for a specific month */
export async function getTripsByMonth(
  month: string, // YYYY-MM
  vehicleId?: string,
  userId?: string | null,
): Promise<Trip[]> {
  const trips = await getTrips(vehicleId, userId);
  return trips.filter((t) => getMonth(t.date) === month);
}

/** Get trips for the current year */
export async function getTripsThisYear(
  vehicleId?: string,
  userId?: string | null,
): Promise<Trip[]> {
  const currentYear = new Date().getFullYear().toString();
  const trips = await getTrips(vehicleId, userId);
  return trips.filter((t) => t.date.startsWith(currentYear));
}

/** Add a new trip */
export async function addTrip(
  input: TripInput,
  userId?: string | null,
): Promise<Trip> {
  const category = input.category ?? getCategoryFromPurpose(input.purpose);

  const trip: Trip = {
    id: crypto.randomUUID(),
    vehicleId: input.vehicleId,
    date: input.date,
    startLocation: input.startLocation,
    endLocation: input.endLocation,
    distanceKm: input.distanceKm,
    purpose: input.purpose,
    category,
    confidence: "high", // Manual entry = high confidence
    odometerStart: input.odometerStart,
    odometerEnd: input.odometerEnd,
    notes: input.notes,
    verified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (!userId) {
    const trips = getLocalTrips();
    saveLocalTrips([trip, ...trips]);
    return trip;
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("trips")
    .insert(tripToInsert(trip, userId))
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToTrip(data as TripRow);
}

/** Update an existing trip */
export async function updateTrip(
  id: string,
  updates: Partial<TripInput>,
  userId?: string | null,
): Promise<void> {
  // Recalculate category if purpose changed
  const category = updates.purpose
    ? getCategoryFromPurpose(updates.purpose)
    : undefined;

  if (!userId) {
    const trips = getLocalTrips();
    const idx = trips.findIndex((t) => t.id === id);
    if (idx === -1) return;

    trips[idx] = {
      ...trips[idx],
      ...updates,
      ...(category && { category }),
      updatedAt: new Date().toISOString(),
    };
    saveLocalTrips(trips);
    return;
  }

  const supabase = createClient();
  const row: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.vehicleId !== undefined) row.vehicle_id = updates.vehicleId;
  if (updates.date !== undefined) row.date = updates.date;
  if (updates.startLocation !== undefined)
    row.start_location = updates.startLocation;
  if (updates.endLocation !== undefined) row.end_location = updates.endLocation;
  if (updates.distanceKm !== undefined) row.distance_km = updates.distanceKm;
  if (updates.purpose !== undefined) row.purpose = updates.purpose;
  if (category !== undefined) row.category = category;
  if (updates.odometerStart !== undefined)
    row.odometer_start = updates.odometerStart ?? null;
  if (updates.odometerEnd !== undefined)
    row.odometer_end = updates.odometerEnd ?? null;
  if (updates.notes !== undefined) row.notes = updates.notes ?? null;

  const { error } = await supabase.from("trips").update(row).eq("id", id);
  if (error) throw new Error(error.message);
}

/** Delete a trip */
export async function deleteTrip(
  id: string,
  userId?: string | null,
): Promise<void> {
  if (!userId) {
    const trips = getLocalTrips();
    saveLocalTrips(trips.filter((t) => t.id !== id));
    return;
  }

  const supabase = createClient();
  const { error } = await supabase.from("trips").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** Get stats for trips */
export async function getTripStats(
  vehicleId?: string,
  userId?: string | null,
): Promise<TripStats> {
  const trips = await getTripsThisYear(vehicleId, userId);
  return calculateTripStats(trips);
}

/** Get monthly report */
export async function getMonthlyReport(
  month: string,
  vehicleId?: string,
  userId?: string | null,
): Promise<MonthlyReport> {
  const trips = await getTripsByMonth(month, vehicleId, userId);
  const stats = calculateTripStats(trips);

  const lockedMonths = userId
    ? [] // TODO: Implement Supabase locked months
    : getLocalLockedMonths();

  return {
    month,
    stats,
    trips,
    isLocked: lockedMonths.includes(month),
  };
}

/** Lock a month (prevent further edits) */
export async function lockMonth(
  month: string,
  userId?: string | null,
): Promise<void> {
  if (!userId) {
    const locked = getLocalLockedMonths();
    if (!locked.includes(month)) {
      saveLocalLockedMonths([...locked, month]);
    }
    return;
  }

  // TODO: Implement Supabase locked months
}

/** Check if approaching or exceeded private km limit */
export async function getPrivateKmStatus(
  vehicleId?: string,
  userId?: string | null,
): Promise<{
  currentKm: number;
  limit: number;
  warningThreshold: number;
  status: "ok" | "warning" | "exceeded";
  remainingKm: number;
}> {
  const stats = await getTripStats(vehicleId, userId);

  let status: "ok" | "warning" | "exceeded";
  if (stats.privateKm >= PRIVATE_KM_LIMIT) {
    status = "exceeded";
  } else if (stats.privateKm >= PRIVATE_KM_WARNING) {
    status = "warning";
  } else {
    status = "ok";
  }

  return {
    currentKm: stats.privateKm,
    limit: PRIVATE_KM_LIMIT,
    warningThreshold: PRIVATE_KM_WARNING,
    status,
    remainingKm: Math.max(0, PRIVATE_KM_LIMIT - stats.privateKm),
  };
}

/** Get all trips local data (for migration) */
export function getLocalTripsData(): Trip[] {
  return getLocalTrips();
}

/** Clear local trips data (after migration) */
export function clearLocalTrips(): void {
  storage.remove(TRIPS_KEY);
  storage.remove(LOCKED_MONTHS_KEY);
}
