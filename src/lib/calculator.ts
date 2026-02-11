/**
 * Cost Calculator Engine
 * Calculates total cost of ownership for vehicles including running costs,
 * ownership costs, and Dutch tax implications (bijtelling, BTW aftrek).
 */

import type { GarageVehicle } from "@/types/garage";

// ---------------------------------------------------------------------------
// Tax Constants (2024)
// ---------------------------------------------------------------------------

export const TAX_CONSTANTS = {
  /** Bijtelling percentages for private use of business vehicles */
  bijtelling: {
    standard: 0.22, // 22% for standard vehicles
    lowEmission: 0.16, // 16% for CO2 ≤ 50 g/km (PHEV)
    ev: 0.16, // 16% for EV (through 2024)
    youngtimerReduction: 0.35, // 35% reduction for 15+ year old vehicles
  },
  /** Income tax brackets (2024) */
  taxBrackets: {
    low: 0.3693, // Up to €73,031
    high: 0.495, // Above €73,031
  },
  /** BTW (VAT) rate */
  btw: 0.21,
  /** Minimum business use for BTW deduction */
  minBusinessUseForBtw: 0.10,
} as const;

// ---------------------------------------------------------------------------
// MRB (Road Tax) Rates by Province (2024, quarterly amounts in EUR)
// Based on vehicle weight in kg, fuel type
// ---------------------------------------------------------------------------

export const PROVINCES = [
  "Drenthe",
  "Flevoland",
  "Friesland",
  "Gelderland",
  "Groningen",
  "Limburg",
  "Noord-Brabant",
  "Noord-Holland",
  "Overijssel",
  "Utrecht",
  "Zeeland",
  "Zuid-Holland",
] as const;

export type Province = (typeof PROVINCES)[number];

/** MRB rates per quarter based on weight class (simplified 2024 rates) */
const MRB_BASE_RATES: Record<string, number[]> = {
  // Weight classes: 0-900, 901-1100, 1101-1300, 1301-1500, 1501-1800, 1801-2100, 2101-2500, 2500+
  benzine: [86, 129, 172, 258, 344, 430, 516, 645],
  diesel: [171, 257, 343, 514, 685, 856, 1028, 1285],
  lpg: [171, 257, 343, 514, 685, 856, 1028, 1285],
  elektrisch: [0, 0, 0, 0, 0, 0, 0, 0], // EV exempt through 2024
  hybride: [86, 129, 172, 258, 344, 430, 516, 645], // Same as benzine
};

/** Province multipliers (opcenten) - simplified average */
const PROVINCE_MULTIPLIERS: Record<Province, number> = {
  Drenthe: 1.79,
  Flevoland: 1.68,
  Friesland: 1.70,
  Gelderland: 1.76,
  Groningen: 1.82,
  Limburg: 1.75,
  "Noord-Brabant": 1.73,
  "Noord-Holland": 1.67,
  Overijssel: 1.79,
  Utrecht: 1.72,
  Zeeland: 1.74,
  "Zuid-Holland": 1.79,
};

// ---------------------------------------------------------------------------
// Default Values
// ---------------------------------------------------------------------------

export const DEFAULT_FUEL_PRICES: Record<string, number> = {
  benzine: 2.05,
  diesel: 1.85,
  lpg: 0.95,
  elektrisch: 0.30,
  hybride: 2.05,
};

export const DEFAULT_CONSUMPTION: Record<string, number> = {
  benzine: 7.0, // L/100km
  diesel: 6.0,
  lpg: 9.0,
  elektrisch: 18.0, // kWh/100km
  hybride: 5.5,
};

export const FUEL_PRICES_UPDATED = "2024-12-01";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CostInputs {
  vehicle: GarageVehicle;
  fuelConsumption: number; // L/100km or kWh/100km
  fuelPrice: number; // €/L or €/kWh
  annualKilometers: number;
  insurancePremium: number; // €/year
  maintenanceCost: number; // €/year
  ownershipYears: number;
  residualValue: number; // €
  province: Province;
  taxBracket: number; // % as decimal (0.3693 or 0.495)
  businessUsePercent: number; // % as decimal (0-1)
}

export interface CostBreakdown {
  running: {
    fuel: number;
    insurance: number;
    roadTax: number;
    maintenance: number;
  };
  ownership: {
    depreciation: number;
  };
  tax: {
    bijtelling: number; // Positive = cost (taxable benefit)
    btwAftrek: number; // Negative = benefit (VAT reclaimed)
  };
  totals: {
    grossAnnual: number; // Before tax implications
    netAnnual: number; // After tax implications
    monthly: number;
    perKm: number;
  };
}

export interface CalculatorAssumptions {
  fuelConsumption: number;
  fuelPrice: number;
  insurancePremium: number;
  maintenanceCost: number;
  ownershipYears: number;
  residualValue: number;
  province: Province;
  taxBracket: number;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

/** Get fuel type key from RDW description */
export function normalizeFuelType(
  brandstof: string | null,
): keyof typeof DEFAULT_FUEL_PRICES {
  if (!brandstof) return "benzine";
  const lower = brandstof.toLowerCase();
  if (lower.includes("elektr")) return "elektrisch";
  if (lower.includes("diesel")) return "diesel";
  if (lower.includes("lpg")) return "lpg";
  if (lower.includes("hybride")) return "hybride";
  return "benzine";
}

/** Check if vehicle is electric */
export function isElectric(vehicle: GarageVehicle): boolean {
  return normalizeFuelType(vehicle.rdw.brandstof_omschrijving) === "elektrisch";
}

/** Check if vehicle is a youngtimer (15+ years old) */
export function isYoungtimer(vehicle: GarageVehicle): boolean {
  const dateStr = vehicle.rdw.datum_eerste_toelating;
  if (!dateStr || dateStr.length !== 8) return false;

  const year = parseInt(dateStr.substring(0, 4), 10);
  const month = parseInt(dateStr.substring(4, 6), 10);
  const day = parseInt(dateStr.substring(6, 8), 10);
  const registrationDate = new Date(year, month - 1, day);
  const fifteenYearsAgo = new Date();
  fifteenYearsAgo.setFullYear(fifteenYearsAgo.getFullYear() - 15);

  return registrationDate <= fifteenYearsAgo;
}

/** Get vehicle weight class index for MRB lookup (estimated from catalog price) */
function getWeightClassIndex(vehicle: GarageVehicle): number {
  // Estimate weight from catalog price (rough correlation)
  // Real implementation would use RDW massa data
  const price = vehicle.rdw.catalogusprijs ?? vehicle.user.purchasePrice;
  if (price < 15000) return 0;
  if (price < 25000) return 1;
  if (price < 35000) return 2;
  if (price < 45000) return 3;
  if (price < 60000) return 4;
  if (price < 80000) return 5;
  if (price < 100000) return 6;
  return 7;
}

/** Get bijtelling percentage for a vehicle */
export function getBijtellingPercentage(vehicle: GarageVehicle): number {
  const co2 = vehicle.rdw.co2_uitstoot_gecombineerd ?? 999;
  const youngtimer = isYoungtimer(vehicle);
  const electric = isElectric(vehicle);

  let baseRate: number;
  if (electric || co2 === 0) {
    baseRate = TAX_CONSTANTS.bijtelling.ev;
  } else if (co2 <= 50) {
    baseRate = TAX_CONSTANTS.bijtelling.lowEmission;
  } else {
    baseRate = TAX_CONSTANTS.bijtelling.standard;
  }

  if (youngtimer) {
    return baseRate * (1 - TAX_CONSTANTS.bijtelling.youngtimerReduction);
  }

  return baseRate;
}

// ---------------------------------------------------------------------------
// Calculation Functions
// ---------------------------------------------------------------------------

/** Calculate annual fuel cost */
export function calculateFuelCost(
  annualKm: number,
  consumption: number,
  pricePerUnit: number,
): number {
  // consumption is per 100km
  return (annualKm / 100) * consumption * pricePerUnit;
}

/** Calculate annual road tax (MRB) */
export function calculateRoadTax(
  vehicle: GarageVehicle,
  province: Province,
): number {
  const fuelType = normalizeFuelType(vehicle.rdw.brandstof_omschrijving);

  // EVs are exempt
  if (fuelType === "elektrisch") return 0;

  const weightIndex = getWeightClassIndex(vehicle);
  const baseRates = MRB_BASE_RATES[fuelType] ?? MRB_BASE_RATES.benzine;
  const quarterlyBase = baseRates[weightIndex] ?? baseRates[0];
  const multiplier = PROVINCE_MULTIPLIERS[province] ?? 1.75;

  return quarterlyBase * multiplier * 4; // Annual = 4 quarters
}

/** Calculate annual depreciation */
export function calculateDepreciation(
  purchasePrice: number,
  residualValue: number,
  ownershipYears: number,
): number {
  if (ownershipYears <= 0) return 0;
  return Math.max(0, (purchasePrice - residualValue) / ownershipYears);
}

/** Calculate bijtelling tax cost for business ownership */
export function calculateBijtelling(
  vehicle: GarageVehicle,
  taxBracket: number,
): number {
  const catalogValue =
    vehicle.rdw.catalogusprijs ?? vehicle.user.purchasePrice;
  const bijtellingPercent = getBijtellingPercentage(vehicle);

  // Bijtelling = catalog value × bijtelling % × income tax rate
  return catalogValue * bijtellingPercent * taxBracket;
}

/** Calculate BTW (VAT) recovery for business ownership */
export function calculateBtwAftrek(
  annualCosts: number,
  businessUsePercent: number,
): number {
  // BTW recovery only if business use >= 10%
  if (businessUsePercent < TAX_CONSTANTS.minBusinessUseForBtw) return 0;

  // Recover BTW on running costs proportional to business use
  const btwOnCosts = annualCosts * (TAX_CONSTANTS.btw / (1 + TAX_CONSTANTS.btw));
  return btwOnCosts * businessUsePercent;
}

// ---------------------------------------------------------------------------
// Main Calculation Function
// ---------------------------------------------------------------------------

export function calculateCosts(
  inputs: CostInputs,
  ownershipType: "private" | "business" = inputs.vehicle.user.ownershipType,
): CostBreakdown {
  const {
    vehicle,
    fuelConsumption,
    fuelPrice,
    annualKilometers,
    insurancePremium,
    maintenanceCost,
    ownershipYears,
    residualValue,
    province,
    taxBracket,
    businessUsePercent,
  } = inputs;

  const purchasePrice =
    vehicle.user.purchasePrice || vehicle.rdw.catalogusprijs || 0;

  // Running costs
  const fuelCost = calculateFuelCost(annualKilometers, fuelConsumption, fuelPrice);
  const roadTax = calculateRoadTax(vehicle, province);

  // Ownership costs
  const depreciation = calculateDepreciation(
    purchasePrice,
    residualValue,
    ownershipYears,
  );

  // Tax implications (business ownership only)
  let bijtelling = 0;
  let btwAftrek = 0;

  if (ownershipType === "business") {
    bijtelling = calculateBijtelling(vehicle, taxBracket);

    // BTW on running costs (not depreciation)
    const runningCosts = fuelCost + insurancePremium + maintenanceCost;
    btwAftrek = -calculateBtwAftrek(runningCosts, businessUsePercent);
  }

  // Calculate totals
  const grossAnnual =
    fuelCost + insurancePremium + roadTax + maintenanceCost + depreciation;

  const netAnnual = grossAnnual + bijtelling + btwAftrek;

  return {
    running: {
      fuel: fuelCost,
      insurance: insurancePremium,
      roadTax,
      maintenance: maintenanceCost,
    },
    ownership: {
      depreciation,
    },
    tax: {
      bijtelling,
      btwAftrek,
    },
    totals: {
      grossAnnual,
      netAnnual,
      monthly: netAnnual / 12,
      perKm: annualKilometers > 0 ? netAnnual / annualKilometers : 0,
    },
  };
}

// ---------------------------------------------------------------------------
// Default Inputs Generator
// ---------------------------------------------------------------------------

export function getDefaultInputs(vehicle: GarageVehicle): Omit<CostInputs, "vehicle"> {
  const fuelType = normalizeFuelType(vehicle.rdw.brandstof_omschrijving);
  const purchasePrice =
    vehicle.user.purchasePrice || vehicle.rdw.catalogusprijs || 30000;
  const isEV = fuelType === "elektrisch";

  // Insurance estimate: ~3% of vehicle value for WA+
  const insuranceEstimate = Math.round(purchasePrice * 0.03);

  // Maintenance estimate: 4% for regular, 2% for EV (fewer moving parts)
  const maintenanceEstimate = Math.round(
    purchasePrice * (isEV ? 0.02 : 0.04),
  );

  // Residual value estimate: 50% after 5 years
  const residualEstimate = Math.round(purchasePrice * 0.5);

  return {
    fuelConsumption: DEFAULT_CONSUMPTION[fuelType] ?? 7,
    fuelPrice: DEFAULT_FUEL_PRICES[fuelType] ?? 2.0,
    annualKilometers: vehicle.user.annualKilometers || 15000,
    insurancePremium: insuranceEstimate,
    maintenanceCost: maintenanceEstimate,
    ownershipYears: 5,
    residualValue: residualEstimate,
    province: "Noord-Holland" as Province,
    taxBracket: TAX_CONSTANTS.taxBrackets.low,
    businessUsePercent: vehicle.user.businessKilometers
      ? vehicle.user.businessKilometers / vehicle.user.annualKilometers
      : 0.8,
  };
}
