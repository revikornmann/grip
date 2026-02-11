# Epic 04: Cost Calculator

> **Component Constraint:** All UI must use Muka UI components. If a component doesn't exist, build it in muka-ui first. See [EPICS.md](./EPICS.md#component-dependency-workflow) for the workflow.

## Overview

**Goal:** Calculate total annual cost of ownership for a vehicle, including running costs, depreciation, and tax implications based on ownership type.

**Phase:** 1 (MVP)
**Priority:** P1
**Dependencies:** Epic 00 (Foundation), Epic 02 (Vehicle Garage)

---

## Cost Components

### Running Costs
| Component | Calculation Method |
|-----------|-------------------|
| Fuel/Energy | (Annual km ÷ consumption) × fuel price |
| Insurance | User input or estimate based on vehicle value |
| Road Tax (MRB) | Based on weight, fuel type, province |
| Maintenance | User input or estimate (% of vehicle value) |

### Ownership Costs
| Component | Calculation Method |
|-----------|-------------------|
| Depreciation | (Purchase price - Residual value) ÷ Years |
| Financing | Interest on loan if applicable |

### Tax Implications
| Component | Applies To | Calculation |
|-----------|-----------|-------------|
| Bijtelling | Business | Catalog value × bijtelling % × income tax rate |
| BTW aftrek | Business | VAT on purchase and running costs × business use % |
| MIA/VAMIL | Business (EV) | Investment deduction on qualifying vehicles |

---

## User Stories

### US-04-001: View cost calculator for a vehicle

**As a** user with a vehicle in my garage,
**I want to** see a breakdown of annual costs,
**So that** I understand the true cost of ownership.

**Acceptance criteria:**
- [ ] Select vehicle from garage to calculate
- [ ] Shows cost breakdown in clear categories
- [ ] Total annual cost prominently displayed
- [ ] Monthly equivalent shown alongside annual
- [ ] Costs grouped: Running, Ownership, Tax
- [ ] Each line item shows amount and how it was calculated

**Muka UI components:** Card, Select, Table (#12 or custom list)

**Dependencies:** Epic 02

**Estimate:** 1 day

---

### US-04-002: Enter fuel consumption

**As a** user,
**I want to** enter or estimate fuel consumption,
**So that** fuel costs are calculated accurately.

**Acceptance criteria:**
- [ ] Input for consumption (L/100km or kWh/100km for EV)
- [ ] Default value based on fuel type and vehicle class
- [ ] Helper text shows typical ranges
- [ ] For EVs, input is in kWh/100km
- [ ] Validation: 0-50 L/100km, 0-50 kWh/100km

**Muka UI components:** Input (number), Label, Select (unit)

**Dependencies:** US-04-001

**Estimate:** 0.5 day

---

### US-04-003: Use current fuel prices

**As a** user,
**I want** fuel costs calculated with current prices,
**So that** estimates reflect real-world costs.

**Acceptance criteria:**
- [ ] Default fuel prices pre-filled (manually updated periodically)
- [ ] Shows prices for: Benzine, Diesel, LPG, Elektriciteit
- [ ] User can override with custom prices
- [ ] Prices shown per liter (fuel) or per kWh (electricity)
- [ ] "Prijzen bijgewerkt op: [date]" indicator
- [ ] Future: API integration for live prices

**Muka UI components:** Input (number with prefix €), Label

**Dependencies:** US-04-002

**Estimate:** 0.5 day

---

### US-04-004: Estimate insurance costs

**As a** user,
**I want to** enter or estimate insurance costs,
**So that** this significant expense is included.

**Acceptance criteria:**
- [ ] Input for annual insurance premium (€)
- [ ] Default estimate based on vehicle value (rough %)
- [ ] Options: WA, WA+, Allrisk with different estimates
- [ ] Helper text: "Gemiddeld €X-€Y voor dit type voertuig"
- [ ] Link to explain coverage types (optional)

**Muka UI components:** Input (number), Select (coverage type)

**Dependencies:** US-04-001

**Estimate:** 0.5 day

---

### US-04-005: Calculate road tax (MRB)

**As a** user,
**I want** road tax automatically calculated,
**So that** I don't have to look it up manually.

**Acceptance criteria:**
- [ ] Auto-calculate based on vehicle weight and fuel type
- [ ] Province selector (affects rate)
- [ ] Default province: Noord-Holland (or detect from IP)
- [ ] Shows quarterly and annual amount
- [ ] EV exemption applied automatically
- [ ] Link to Belastingdienst for verification

**Muka UI components:** Select (province), Label, Card

**Dependencies:** US-04-001

**Estimate:** 1 day

---

### US-04-006: Estimate maintenance costs

**As a** user,
**I want to** estimate maintenance costs,
**So that** I budget for servicing and repairs.

**Acceptance criteria:**
- [ ] Input for annual maintenance (€)
- [ ] Default estimate: 3-5% of vehicle value per year
- [ ] Slider or quick options: "Laag", "Gemiddeld", "Hoog"
- [ ] EVs show lower default (fewer moving parts)
- [ ] Older vehicles show higher default
- [ ] Includes APK cost in estimate

**Muka UI components:** Input (number), Slider (if available), Badge

**Dependencies:** US-04-001

**Estimate:** 0.5 day

---

### US-04-007: Calculate depreciation

**As a** user,
**I want to** see estimated depreciation,
**So that** I understand the vehicle's value loss over time.

**Acceptance criteria:**
- [ ] Input: ownership period (default 5 years)
- [ ] Input: expected residual value or calculate from depreciation curve
- [ ] Shows annual depreciation amount
- [ ] Different depreciation curves for new vs used
- [ ] EVs may have different depreciation (battery concerns)
- [ ] Youngtimers show minimal depreciation

**Muka UI components:** Input (number), Select (years)

**Dependencies:** US-04-001

**Estimate:** 1 day

---

### US-04-008: Calculate bijtelling (business ownership)

**As a** ZZP'er with a business vehicle,
**I want** bijtelling calculated correctly,
**So that** I know the tax cost of private use.

**Acceptance criteria:**
- [ ] Only applies when ownership type is "Zakelijk"
- [ ] Uses catalog value from RDW (or user override)
- [ ] Applies correct bijtelling percentage:
  - 22% standard (2024)
  - 16% for CO2 ≤ 50 g/km (PHEV)
  - 16% for EV (through 2024, increases later)
  - 35% reduction for youngtimers (15+ years)
- [ ] Input: user's marginal tax rate (default 37.07% / 49.50%)
- [ ] Shows: bijtelling amount and resulting income tax

**Muka UI components:** Select (tax bracket), Input (override), Card

**Dependencies:** US-04-001, US-02-008

**Estimate:** 1 day

---

### US-04-009: Calculate BTW aftrek (business ownership)

**As a** ZZP'er buying a vehicle through my business,
**I want** BTW (VAT) deduction calculated,
**So that** I see the tax benefit.

**Acceptance criteria:**
- [ ] Only applies when ownership type is "Zakelijk"
- [ ] Calculates VAT on purchase price (21%)
- [ ] Prorates by business use percentage
- [ ] Shows: BTW on purchase, annual BTW on running costs
- [ ] Note: BTW is one-time on purchase, ongoing on costs
- [ ] Warning if business use < 10% (no deduction allowed)

**Muka UI components:** Card, Input (business %), Alert (#24)

**Dependencies:** US-04-001, US-02-007

**Estimate:** 0.5 day

---

### US-04-010: Show cost summary and total

**As a** user,
**I want** a clear summary of all costs,
**So that** I can see the bottom line at a glance.

**Acceptance criteria:**
- [ ] Summary card with total annual cost
- [ ] Breakdown showing each category's contribution
- [ ] Pie chart or bar chart visualization (optional)
- [ ] "Per maand" toggle to show monthly breakdown
- [ ] "Per kilometer" calculation (total ÷ annual km)
- [ ] Highlight largest cost component

**Muka UI components:** Card, Badge, Divider, Chart (if available)

**Dependencies:** US-04-001 through US-04-009

**Estimate:** 1 day

---

### US-04-011: Save calculation assumptions

**As a** user,
**I want** my entered assumptions saved with the vehicle,
**So that** I don't have to re-enter them.

**Acceptance criteria:**
- [ ] All input values persist when leaving calculator
- [ ] Values stored in garage vehicle record
- [ ] Returning to calculator shows previous values
- [ ] "Reset naar standaard" option to clear custom values
- [ ] Version assumption values for future changes

**Muka UI components:** Button (reset)

**Dependencies:** US-04-001, Epic 02

**Estimate:** 0.5 day

---

## Technical Notes

### Calculation Engine
```typescript
// lib/calculator.ts
interface CostInputs {
  vehicle: GarageVehicle;
  fuelConsumption: number;        // L/100km or kWh/100km
  fuelPrice: number;              // €/L or €/kWh
  insurancePremium: number;       // €/year
  maintenanceCost: number;        // €/year
  ownershipYears: number;
  residualValue: number;          // €
  province: string;               // For MRB
  taxBracket: number;             // % for bijtelling
  businessUsePercent: number;     // % for BTW aftrek
}

interface CostBreakdown {
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
    bijtelling: number;           // Positive = cost (taxable benefit)
    btwAftrek: number;            // Negative = benefit (VAT reclaimed)
    miaVamil?: number;            // Negative = benefit (investment deduction)
  };
  totals: {
    annual: number;
    monthly: number;
    perKm: number;
  };
}

function calculateCosts(inputs: CostInputs): CostBreakdown
```

### Tax Constants (2024)
```typescript
const TAX_CONSTANTS = {
  bijtelling: {
    standard: 0.22,
    lowEmission: 0.16,    // CO2 ≤ 50 g/km
    ev: 0.16,             // EV through 2024
    youngtimerReduction: 0.35,
  },
  taxBrackets: {
    low: 0.3693,          // Up to €73,031
    high: 0.495,          // Above €73,031
  },
  btw: 0.21,
  mrb: {
    // Province-specific rates loaded from config
  }
};
```

### Component Structure
```
src/
├── app/
│   └── calculator/
│       └── page.tsx              # Calculator page
├── components/
│   └── calculator/
│       ├── VehicleSelector.tsx   # Choose vehicle from garage
│       ├── CostInputs.tsx        # All input fields
│       ├── CostBreakdown.tsx     # Results display
│       └── CostSummary.tsx       # Total and chart
└── lib/
    ├── calculator.ts             # Calculation engine
    ├── tax-rates.ts              # Tax constants and rates
    └── mrb-rates.ts              # Road tax rates by province
```

---

## Validation Rules

| Field | Min | Max | Default |
|-------|-----|-----|---------|
| Fuel consumption | 0 | 50 | 7 (benzine), 6 (diesel), 18 (EV) |
| Fuel price | €0.50 | €5.00 | Current market rate |
| Insurance | €0 | €10,000 | 3% of value |
| Maintenance | €0 | €20,000 | 4% of value |
| Ownership years | 1 | 20 | 5 |
| Residual value | €0 | Purchase price | 50% for 5yr |
| Business use | 0% | 100% | 80% |

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Calculations verified against manual computation
- [ ] Tax rates sourced from official government data
- [ ] Numbers formatted with Dutch conventions
- [ ] Responsive layout (inputs stack on mobile)
- [ ] Results update in real-time as inputs change
