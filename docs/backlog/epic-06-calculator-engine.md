# Epic 06: Cost Calculator Engine

> **Component Constraint:** All UI must use Muka UI components. If a component doesn't exist, build it in muka-ui first. See [EPICS.md](./EPICS.md#component-dependency-workflow) for the workflow.

## Overview

**Goal:** Implement the calculation engine that computes net annual cost for each ownership type, including all Dutch tax effects (bijtelling, BTW aftrek, kostenaftrek, km-vergoeding).

**Phase:** 1 (MVP)
**Priority:** P1
**Dependencies:** Epic 04 (User Profile), Epic 05 (Scenario Model)

---

## Tax Constants (2026)

Source: `docs/PRODUCT_BRIEF.md` §6

```typescript
// Source: docs/PRODUCT_BRIEF.md §6. Update annually.
export const TAX_CONSTANTS = {
  bijtelling: {
    standard: 0.22,           // CO2 > 50 g/km
    lowEmission: 0.16,        // PHEV, CO2 ≤ 50 g/km
    ev_2026: 0.18,
    ev_2027: 0.20,
    ev_2028_plus: 0.22,
    youngtimer_rate: 0.35,    // Applied to dagwaarde, not cataloguswaarde
  },
  taxBrackets: [
    { upTo: 38883, rate: 0.3575 },
    { upTo: 78426, rate: 0.3756 },
    { upTo: Infinity, rate: 0.495 },
  ],
  btw: 0.21,
  minBusinessUseForBtw: 0.10,
  kmDeduction: 0.23,          // €/km for private vehicle business use (2026)
  youngtimer: {
    thresholdUntil2026: 15,   // years
    thresholdFrom2027: 25,    // years — new rule, no transition period
    changeDate: '2027-01-01',
  },
} as const;
```

---

## Calculation Spec — Per Ownership Type

All scenarios produce: **net annual cost in €** (positive = costs you money)

### Tax benefit/cost framing

**Business scenarios** have three tax effects:
1. **Bijtelling** — adds to taxable income → you pay more income tax → this is a cost
2. **BTW recovery** — reclaims VAT on business costs → this is a benefit
3. **Cost deductibility** — business costs reduce taxable profit → tax saving = cost × tax_rate

**Private scenarios** have one tax effect:
1. **Km deduction** — €0.23 × business km reduces taxable income → tax saving = 0.23 × business_km × tax_rate

---

## User Stories

### US-06-001: Tax rate calculation from income

**As a** ZZP'er,
**I want** my tax rate to be calculated from my taxable income,
**So that** all tax effects use the correct marginal rate.

**Acceptance criteria:**
- [ ] Function: `getTaxRate(taxableIncome: number): number`
- [ ] Returns marginal rate (highest bracket reached):
  - ≤€38.883 → 0.3575
  - €38.883–€78.426 → 0.3756
  - >€78.426 → 0.495
- [ ] Tax rate is fetched from user profile, not hardcoded per scenario

**Formula (from PRODUCT_BRIEF.md §6):**
```typescript
function getTaxRate(taxableIncome: number): number {
  if (taxableIncome <= 38883) return 0.3575;
  if (taxableIncome <= 78426) return 0.3756;
  return 0.495;
}
```

**Muka UI components:** None (calculation logic)

**Estimate:** 0.5 day

---

### US-06-002: Private owned calculation

**As a** ZZP'er with a privately owned car,
**I want** my net annual cost calculated including km deduction benefit,
**So that** I can compare it against other ownership types.

**Acceptance criteria:**
- [ ] Calculate annual costs:
  - `purchase_price / ownership_years` (depreciation, not tax-deductible)
  - `+ monthly_fuel × 12`
  - `+ monthly_insurance × 12`
  - `+ monthly_maintenance × 12`
  - `+ annual_road_tax`
- [ ] Calculate km deduction benefit:
  - `annual_km_business × 0.23 × tax_rate`
- [ ] Net annual cost = annual_costs - km_deduction_benefit
- [ ] No BTW recovery. No bijtelling.

**Formula (from PRODUCT_BRIEF.md §4A):**
```
annual_costs = purchase_price / ownership_years
             + monthly_fuel × 12
             + monthly_insurance × 12
             + monthly_maintenance × 12
             + annual_road_tax

km_deduction_benefit = annual_km_business × 0.23 × tax_rate

net_annual_cost = annual_costs - km_deduction_benefit
```

**Muka UI components:** None (calculation logic)

**Estimate:** 0.5 day

---

### US-06-003: Private lease calculation

**As a** ZZP'er with a private lease car,
**I want** my net annual cost calculated,
**So that** I can see how it compares to owning.

**Acceptance criteria:**
- [ ] Calculate annual costs:
  - `monthly_lease_cost × 12`
  - `+ monthly_fuel × 12`
- [ ] Calculate km deduction benefit:
  - `annual_km_business × 0.23 × tax_rate`
- [ ] Net annual cost = annual_costs - km_deduction_benefit
- [ ] No depreciation, no business tax effects

**Formula (from PRODUCT_BRIEF.md §4B):**
```
annual_costs = monthly_lease_cost × 12
             + monthly_fuel × 12

km_deduction_benefit = annual_km_business × 0.23 × tax_rate

net_annual_cost = annual_costs - km_deduction_benefit
```

**Muka UI components:** None (calculation logic)

**Estimate:** 0.5 day

---

### US-06-004: Operational lease calculation

**As a** ZZP'er with an operational lease,
**I want** my net annual cost calculated including bijtelling and tax benefits,
**So that** I understand the true cost after all tax effects.

**Acceptance criteria:**
- [ ] Calculate gross annual cost:
  - `monthly_lease_cost × 12 + monthly_fuel × 12`
- [ ] Calculate deductible costs:
  - Full lease cost deductible
  - Fuel also deductible
- [ ] Calculate tax saving: `deductible_costs × tax_rate`
- [ ] Calculate bijtelling (if private use > 500km) — see US-06-007
- [ ] Calculate BTW recovery (if btw_plichtig):
  - `(monthly_lease_cost × 12 × 0.21 / 1.21) × (annual_km_business / annual_km_total)`
- [ ] Net annual cost = gross - tax_saving + bijtelling - btw_recovery

**Formula (from PRODUCT_BRIEF.md §4D):**
```
gross_annual_cost = monthly_lease_cost × 12 + monthly_fuel × 12

deductible_costs = monthly_lease_cost × 12 + monthly_fuel × 12

tax_saving_on_costs = deductible_costs × tax_rate

bijtelling_addition = get_bijtelling_amount(vehicle, tax_rate)

btw_recovery = btw_recovery_eligible
  ? (monthly_lease_cost × 12 × 0.21 / 1.21) × (annual_km_business / annual_km_total)
  : 0

net_annual_cost = gross_annual_cost
                - tax_saving_on_costs
                + bijtelling_addition
                - btw_recovery
```

**Muka UI components:** None (calculation logic)

**Estimate:** 1 day

---

### US-06-005: Business owned calculation

**As a** ZZP'er who bought a car through my business,
**I want** my net annual cost calculated with depreciation and all tax effects,
**So that** I can compare it against lease options.

**Acceptance criteria:**
- [ ] Calculate annual depreciation:
  - `(purchase_price - (purchase_price × residual_value_percent)) / depreciation_years`
  - Fiscal floor: residual_value_percent minimum 10%
  - Depreciation years minimum 5
- [ ] Calculate deductible costs:
  - `annual_depreciation + monthly_fuel × 12 + monthly_insurance × 12 + monthly_maintenance × 12 + annual_road_tax`
- [ ] Calculate tax saving: `deductible_costs × tax_rate`
- [ ] Calculate bijtelling (if private use > 500km) — see US-06-007
- [ ] Calculate BTW recovery (if btw_plichtig):
  - `(deductible_costs × 0.21 / 1.21) × (annual_km_business / annual_km_total)`
- [ ] Net annual cost = gross - tax_saving + bijtelling - btw_recovery

**Formula (from PRODUCT_BRIEF.md §4E):**
```
annual_depreciation = (purchase_price - (purchase_price × residual_value_percent))
                    / depreciation_years

deductible_costs = annual_depreciation
                 + monthly_fuel × 12
                 + monthly_insurance × 12
                 + monthly_maintenance × 12
                 + annual_road_tax

tax_saving_on_costs = deductible_costs × tax_rate

bijtelling_addition = get_bijtelling_amount(vehicle, tax_rate)

btw_recovery = btw_recovery_eligible
  ? (deductible_costs × 0.21 / 1.21) × (annual_km_business / annual_km_total)
  : 0

gross_annual_cost = annual_depreciation
                  + monthly_fuel × 12
                  + monthly_insurance × 12
                  + monthly_maintenance × 12
                  + annual_road_tax

net_annual_cost = gross_annual_cost
                - tax_saving_on_costs
                + bijtelling_addition
                - btw_recovery
```

**Muka UI components:** None (calculation logic)

**Estimate:** 1 day

---

### US-06-006: Financial lease calculation

**As a** ZZP'er with a financial lease,
**I want** my net annual cost calculated including optional interest split,
**So that** I get an accurate picture of my costs.

**Acceptance criteria:**
- [ ] Car is on business balance sheet — same tax treatment as business_owned
- [ ] Calculate deductible costs:
  - If no interest_rate: full monthly_payment × 12 is deductible (simplified)
  - If interest_rate provided: only interest portion is deductible, repayment reduces balance sheet debt
  - Plus: monthly_fuel × 12 + monthly_insurance × 12 + monthly_maintenance × 12
- [ ] Calculate tax saving: `deductible_costs × tax_rate`
- [ ] Calculate bijtelling (if private use > 500km)
- [ ] Calculate BTW recovery (if btw_plichtig)
- [ ] Note shown in UI: "Interest portion estimated" when interest_rate provided
- [ ] Net annual cost = gross - tax_saving + bijtelling - btw_recovery

**Formula (from PRODUCT_BRIEF.md §4C):**
```
// Simplified — treat full payment as deductible if no interest_rate
if interest_rate:
  interest_annual = calculate_interest_year1(monthly_payment, interest_rate, contract_months)
  repayment_annual = monthly_payment × 12 - interest_annual
  deductible_costs = interest_annual + fuel + insurance + maintenance
else:
  deductible_costs = monthly_payment × 12 + fuel + insurance + maintenance

tax_saving_on_costs = deductible_costs × tax_rate

bijtelling_addition = get_bijtelling_amount(vehicle, tax_rate)

btw_recovery = btw_recovery_eligible
  ? (deductible_costs × 0.21 / 1.21) × (annual_km_business / annual_km_total)
  : 0

gross_annual_cost = monthly_payment × 12 + monthly_fuel × 12
                  + monthly_insurance × 12 + monthly_maintenance × 12

net_annual_cost = gross_annual_cost
                - tax_saving_on_costs
                + bijtelling_addition
                - btw_recovery
```

**Muka UI components:** None (calculation logic)

**Estimate:** 1.5 days

---

### US-06-007: Bijtelling calculation

**As a** ZZP'er with a business vehicle,
**I want** bijtelling calculated correctly based on vehicle type and my tax rate,
**So that** I know my actual tax cost from private use.

**Acceptance criteria:**
- [ ] No bijtelling if private use ≤ 500km (`annual_km_total - annual_km_business <= 500`)
- [ ] Check if vehicle is youngtimer — see US-06-008
- [ ] Get bijtelling percentage based on vehicle (CO2, fuel type, year)
- [ ] For youngtimer: `dagwaarde × 0.35 × tax_rate`
- [ ] For standard: `catalogusprijs × bijtelling_pct × tax_rate`

**Formula (from PRODUCT_BRIEF.md §5):**
```typescript
function get_bijtelling_amount(vehicle, tax_rate, scenario_year = current_year): number {
  const private_use_km = annual_km_total - annual_km_business;

  // No bijtelling if private use ≤ 500km
  if (private_use_km <= 500) return 0;

  const is_youngtimer = check_youngtimer(vehicle, scenario_year);
  const bijtelling_pct = get_bijtelling_percentage(vehicle, scenario_year);

  if (is_youngtimer) {
    // Youngtimer: 35% bijtelling over dagwaarde (not cataloguswaarde)
    const dagwaarde = vehicle.dagwaarde ?? estimate_dagwaarde(vehicle);
    return dagwaarde * 0.35 * tax_rate;
  }

  return vehicle.rdw.catalogusprijs * bijtelling_pct * tax_rate;
}
```

**Muka UI components:** None (calculation logic)

**Estimate:** 1 day

---

### US-06-008: Youngtimer detection

**As a** ZZP'er with an older car,
**I want** youngtimer status detected automatically,
**So that** the reduced bijtelling rate is applied correctly.

**Acceptance criteria:**
- [ ] Until 31 Dec 2026: youngtimer if vehicle age ≥ 15 years
- [ ] From 1 Jan 2027: youngtimer if vehicle age ≥ 25 years
- [ ] No transition period — threshold changes instantly
- [ ] Age calculated from `datum_eerste_toelating` (first registration date)
- [ ] Function returns boolean with scenario year parameter

**Formula (from PRODUCT_BRIEF.md §5):**
```typescript
function check_youngtimer(vehicle, year): boolean {
  const age = year - vehicle.rdw.bouwjaar;
  if (year < 2027) return age >= 15;
  return age >= 25;   // New threshold from 2027
}
```

**Muka UI components:** None (calculation logic)

**Estimate:** 0.5 day

---

### US-06-009: Bijtelling percentage by vehicle type

**As a** developer,
**I want** bijtelling percentages determined by vehicle characteristics,
**So that** EVs and PHEVs get correct reduced rates.

**Acceptance criteria:**
- [ ] EV (CO2 = 0 or fuel includes 'elektr'):
  - 2026: 18%
  - 2027: 20%
  - 2028+: 22%
- [ ] PHEV (CO2 ≤ 50 g/km): 16%
- [ ] Standard (CO2 > 50 g/km): 22%
- [ ] Youngtimer: always 35% (over dagwaarde, not cataloguswaarde)

**Formula (from PRODUCT_BRIEF.md §5):**
```typescript
function get_bijtelling_percentage(vehicle, year): number {
  const co2 = vehicle.rdw.co2_uitstoot_gecombineerd ?? 999;
  const fuel = vehicle.rdw.brandstof_omschrijving;
  const is_ev = fuel.includes('elektr') || co2 === 0;

  if (is_ev) {
    if (year <= 2026) return 0.18;
    if (year === 2027) return 0.20;
    return 0.22;  // 2028+
  }
  if (co2 <= 50) return 0.16;   // PHEV
  return 0.22;                   // Standard
}
```

**Muka UI components:** None (calculation logic)

**Estimate:** 0.5 day

---

### US-06-010: BTW recovery calculation

**As a** BTW-plichtige ZZP'er,
**I want** BTW recovery calculated on my business vehicle costs,
**So that** I see the actual benefit of VAT reclaim.

**Acceptance criteria:**
- [ ] Only calculate if `is_btw_plichtig` is true (from profile)
- [ ] Only calculate if business use ≥ 10% (`annual_km_business / annual_km_total >= 0.10`)
- [ ] BTW recovery = `(deductible_costs × 0.21 / 1.21) × business_use_percent`
- [ ] Business use percent = `annual_km_business / annual_km_total`
- [ ] Result is a benefit (negative cost / positive saving)

**Muka UI components:** None (calculation logic)

**Estimate:** 0.5 day

---

### US-06-011: Cost breakdown output structure

**As a** developer,
**I want** a structured output from calculations,
**So that** the UI can display a detailed cost breakdown.

**Acceptance criteria:**
- [ ] Output interface includes:
  - `grossAnnualCost`: total costs before tax effects
  - `netAnnualCost`: final cost after all tax effects
  - `netMonthlyCost`: netAnnualCost / 12
  - `breakdown.costs`: itemized list of all cost components
  - `breakdown.taxEffects`: bijtelling, kostenaftrek, btw_recovery
  - `breakdown.kmDeduction`: (for private scenarios)
- [ ] All values in euros with 2 decimal precision

**Output structure:**
```typescript
interface CalculationResult {
  grossAnnualCost: number;
  netAnnualCost: number;
  netMonthlyCost: number;

  breakdown: {
    costs: {
      fuel: number;
      insurance: number;
      maintenance: number;
      roadTax: number;
      depreciation?: number;      // business_owned only
      leaseCost?: number;         // lease types only
      monthlyPayment?: number;    // financial_lease only
    };
    taxEffects: {
      bijtelling: number;         // Positive = cost
      kostenaftrek: number;       // Negative = benefit
      btwRecovery: number;        // Negative = benefit
      kmDeduction?: number;       // Private scenarios only, negative = benefit
    };
  };

  metadata: {
    ownershipType: OwnershipType;
    isYoungtimer: boolean;
    bijtellingApplies: boolean;
    btwRecoveryEligible: boolean;
  };
}
```

**Muka UI components:** None (types)

**Estimate:** 0.5 day

---

### US-06-012: Calculator service integration

**As a** developer,
**I want** a single calculate function that handles all ownership types,
**So that** the UI has a simple interface to get results.

**Acceptance criteria:**
- [ ] Function: `calculateScenario(scenario: Scenario, profile: UserProfile, vehicle: GarageVehicle): CalculationResult`
- [ ] Routes to correct calculation based on `ownership_type`
- [ ] All calculations use profile's tax rate and BTW status
- [ ] Results cached per scenario (invalidated on profile or scenario change)
- [ ] Error handling for missing required inputs

**Muka UI components:** None (service layer)

**Estimate:** 1 day

---

## Technical Notes

### Files to create/modify

```
src/lib/
├── calculator.ts       # Main calculator service (REWRITE)
├── tax-constants.ts    # 2026 tax constants
├── bijtelling.ts       # Bijtelling calculation logic
└── scenarios.ts        # Add calculateScenario integration
```

### Interest amortization (financial lease)

For MVP, use simplified year-1 interest calculation:
```typescript
function calculate_interest_year1(
  monthlyPayment: number,
  annualRate: number,
  contractMonths: number
): number {
  // Assume equal principal repayment (linear amortization)
  const totalPrincipal = monthlyPayment * contractMonths;
  const avgBalance = totalPrincipal * 0.75; // Rough approximation for year 1
  return avgBalance * annualRate;
}
```

---

## Muka UI Components Required

None — this epic is pure calculation logic with no UI.

---

## Out of Scope

- MIA/VAMIL environmental investment deductions
- Exact interest amortization schedules (use approximation)
- Multi-year projections (calculate single year only)
- Tax optimization suggestions
- What-if sliders for inputs
- Historical tax year calculations (2026 only)
- BPM (paid at purchase, not recurring)

---

## Definition of Done

- [ ] All calculation formulas match PRODUCT_BRIEF.md exactly
- [ ] Tax constants extracted to dedicated file
- [ ] All five ownership types calculate correctly
- [ ] Bijtelling respects 500km threshold
- [ ] Youngtimer detection works with 2027 threshold change
- [ ] BTW recovery respects 10% minimum business use
- [ ] Unit tests cover all formulas with expected values
- [ ] Output structure provides complete breakdown for UI
- [ ] `npm run build && npm run lint` passes
