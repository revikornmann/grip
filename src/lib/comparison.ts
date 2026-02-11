/**
 * Ownership Comparison Engine
 * Compares private vs business vehicle ownership costs.
 */

import type { GarageVehicle } from "@/types/garage";
import {
  calculateCosts,
  getDefaultInputs,
  type CostInputs,
  type CostBreakdown,
} from "./calculator";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ComparisonScenario {
  ownership: "private" | "business";
  costs: CostBreakdown;
  netAnnualCost: number;
}

export interface ComparisonResult {
  vehicle: GarageVehicle;
  inputs: CostInputs;
  scenarios: {
    private: ComparisonScenario;
    business: ComparisonScenario;
  };
  difference: {
    annual: number; // Positive = business is cheaper
    fiveYear: number;
    cheaperOption: "private" | "business";
    savingsPercent: number;
    breakEvenBusinessPercent: number | null; // null if never breaks even
  };
}

// ---------------------------------------------------------------------------
// Comparison Function
// ---------------------------------------------------------------------------

export function compareOwnership(
  vehicle: GarageVehicle,
  inputs: CostInputs,
): ComparisonResult {
  // Calculate costs for both ownership types
  const privateCosts = calculateCosts(inputs, "private");
  const businessCosts = calculateCosts(inputs, "business");

  const privateNet = privateCosts.totals.netAnnual;
  const businessNet = businessCosts.totals.netAnnual;

  // Positive difference means business is cheaper
  const annualDifference = privateNet - businessNet;
  const cheaperOption = annualDifference >= 0 ? "business" : "private";
  const cheaperAmount = cheaperOption === "business" ? businessNet : privateNet;
  const moreExpensiveAmount = cheaperOption === "business" ? privateNet : businessNet;

  return {
    vehicle,
    inputs,
    scenarios: {
      private: {
        ownership: "private",
        costs: privateCosts,
        netAnnualCost: privateNet,
      },
      business: {
        ownership: "business",
        costs: businessCosts,
        netAnnualCost: businessNet,
      },
    },
    difference: {
      annual: annualDifference,
      fiveYear: annualDifference * 5,
      cheaperOption,
      savingsPercent:
        moreExpensiveAmount > 0
          ? Math.abs(annualDifference) / moreExpensiveAmount
          : 0,
      breakEvenBusinessPercent: calculateBreakEven(vehicle, inputs),
    },
  };
}

// ---------------------------------------------------------------------------
// Break-Even Calculation
// ---------------------------------------------------------------------------

/**
 * Find the business use percentage where private and business costs are equal.
 * Returns null if there's no break-even point (one is always cheaper).
 */
function calculateBreakEven(
  vehicle: GarageVehicle,
  baseInputs: CostInputs,
): number | null {
  // Binary search for break-even point
  let low = 0;
  let high = 1;
  const tolerance = 0.01; // 1% precision

  // Check extremes first
  const at0 = compareAtBusinessPercent(vehicle, baseInputs, 0);
  const at100 = compareAtBusinessPercent(vehicle, baseInputs, 1);

  // If same option is cheaper at both extremes, no break-even
  if (
    (at0.annual > 0 && at100.annual > 0) ||
    (at0.annual < 0 && at100.annual < 0)
  ) {
    return null;
  }

  // Binary search
  while (high - low > tolerance) {
    const mid = (low + high) / 2;
    const result = compareAtBusinessPercent(vehicle, baseInputs, mid);

    if (Math.abs(result.annual) < 100) {
      // Close enough to break-even (within €100)
      return mid;
    }

    if (result.annual > 0) {
      // Business still cheaper, need more private use
      high = mid;
    } else {
      // Private cheaper, need more business use
      low = mid;
    }
  }

  return (low + high) / 2;
}

function compareAtBusinessPercent(
  vehicle: GarageVehicle,
  baseInputs: CostInputs,
  businessPercent: number,
): { annual: number } {
  const inputs: CostInputs = {
    ...baseInputs,
    businessUsePercent: businessPercent,
  };

  const privateCosts = calculateCosts(inputs, "private");
  const businessCosts = calculateCosts(inputs, "business");

  return {
    annual: privateCosts.totals.netAnnual - businessCosts.totals.netAnnual,
  };
}

// ---------------------------------------------------------------------------
// Comparison Inputs Helper
// ---------------------------------------------------------------------------

export function getComparisonInputs(vehicle: GarageVehicle): CostInputs {
  return {
    vehicle,
    ...getDefaultInputs(vehicle),
  };
}

// ---------------------------------------------------------------------------
// Multi-Vehicle Comparison
// ---------------------------------------------------------------------------

export interface MultiVehicleComparison {
  vehicles: Array<{
    vehicle: GarageVehicle;
    bestOption: "private" | "business";
    netAnnualCost: number;
    comparison: ComparisonResult;
  }>;
  cheapestOverall: {
    vehicle: GarageVehicle;
    ownership: "private" | "business";
    netAnnualCost: number;
  } | null;
}

export function compareMultipleVehicles(
  vehicles: GarageVehicle[],
  sharedInputs?: Partial<Omit<CostInputs, "vehicle">>,
): MultiVehicleComparison {
  const results = vehicles.map((vehicle) => {
    const inputs: CostInputs = {
      vehicle,
      ...getDefaultInputs(vehicle),
      ...sharedInputs,
    };
    const comparison = compareOwnership(vehicle, inputs);

    return {
      vehicle,
      bestOption: comparison.difference.cheaperOption,
      netAnnualCost:
        comparison.difference.cheaperOption === "private"
          ? comparison.scenarios.private.netAnnualCost
          : comparison.scenarios.business.netAnnualCost,
      comparison,
    };
  });

  // Find cheapest overall
  const cheapestResult = results.length > 0
    ? results.reduce((min, curr) =>
        curr.netAnnualCost < min.netAnnualCost ? curr : min
      )
    : null;

  return {
    vehicles: results,
    cheapestOverall: cheapestResult
      ? {
          vehicle: cheapestResult.vehicle,
          ownership: cheapestResult.bestOption,
          netAnnualCost: cheapestResult.netAnnualCost,
        }
      : null,
  };
}
