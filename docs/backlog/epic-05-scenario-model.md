# Epic 05: Scenario Model

> **Component Constraint:** All UI must use Muka UI components. If a component doesn't exist, build it in muka-ui first. See [EPICS.md](./EPICS.md#component-dependency-workflow) for the workflow.

## Overview

**Goal:** Define and persist the scenario data model that links a vehicle to an ownership type with all required inputs for cost calculation.

**Phase:** 1 (MVP)
**Priority:** P0
**Dependencies:** Epic 03 (User Accounts), Epic 04 (User Profile)

---

## Data Model

### Scenario (stored in Supabase per user)

```typescript
interface Scenario {
  id: string;
  user_id: string;
  vehicle_id: string;           // Reference to garage vehicle
  created_at: string;
  updated_at: string;

  // Display
  label: string;                // Auto-generated: "Toyota Yaris 2019 · Operational Lease"

  // Ownership type — the core enum
  ownership_type: OwnershipType;

  // Private use
  annual_km_total: number;      // Total km driven per year
  annual_km_business: number;   // Business km per year
  // private_use_exceeds_500: derived (annual_km_total - annual_km_business > 500)

  // Type-specific inputs (only relevant fields populated per type)
  private_owned: PrivateOwnedInputs | null;
  private_lease: PrivateLeaseInputs | null;
  financial_lease: FinancialLeaseInputs | null;
  operational_lease: OperationalLeaseInputs | null;
  business_owned: BusinessOwnedInputs | null;
}

type OwnershipType =
  | 'private_owned'
  | 'private_lease'
  | 'financial_lease'
  | 'operational_lease'
  | 'business_owned';
```

### Type-specific input shapes

```typescript
interface PrivateOwnedInputs {
  purchase_price: number;               // € paid for the vehicle
  ownership_years: number;              // Expected ownership duration
  monthly_fuel: number;                 // € estimate
  monthly_insurance: number;            // €
  monthly_maintenance: number;          // €
  annual_road_tax: number;              // € (or calculated from MRB)
}

interface PrivateLeaseInputs {
  monthly_lease_cost: number;           // All-in monthly € (personal contract)
  monthly_fuel: number;                 // Fuel is always separate
}

interface FinancialLeaseInputs {
  monthly_payment: number;              // Total monthly € to bank
  interest_rate: number | null;         // Optional. Annual % (e.g. 0.045 for 4.5%)
  contract_months: number;
  monthly_fuel: number;
  monthly_insurance: number;
  monthly_maintenance: number;
}

interface OperationalLeaseInputs {
  monthly_lease_cost: number;           // Fixed monthly € — includes maintenance,
                                        // all-risk insurance, replacement vehicle
                                        // Does NOT include fuel
  contract_months: number;
  km_cap_per_year: number;              // Contractual km limit
  monthly_fuel: number;                 // Separate fuel cost
}

interface BusinessOwnedInputs {
  purchase_price: number;
  depreciation_years: number;           // Default 5. Min 5 per Dutch fiscal rules.
  residual_value_percent: number;       // Default 10% (fiscal floor)
  monthly_fuel: number;
  monthly_insurance: number;
  monthly_maintenance: number;
  annual_road_tax: number;
  dagwaarde: number | null;             // Current market value. Required if youngtimer.
  dagwaarde_estimated: boolean;         // True if system-estimated, false if user-entered
}
```

### Scenario label generation

```
{merk} {handelsbenaming} {bouwjaar} · {ownership_type_label}
```

Examples:
- `Toyota Yaris 2019 · Operational Lease`
- `BMW 3 Series 2008 · Zakelijk (youngtimer)`
- `Tesla Model 3 2023 · Financial Lease`

---

## Supabase Table

```sql
create table scenarios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  vehicle_id uuid references garage_vehicles(id) on delete cascade not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- Display
  label text not null,

  -- Core
  ownership_type text not null check (ownership_type in (
    'private_owned', 'private_lease', 'financial_lease',
    'operational_lease', 'business_owned'
  )),

  -- Km fields
  annual_km_total integer not null,
  annual_km_business integer not null,

  -- Type-specific inputs (JSONB)
  private_owned jsonb,
  private_lease jsonb,
  financial_lease jsonb,
  operational_lease jsonb,
  business_owned jsonb
);

-- Indexes
create index scenarios_user_id_idx on scenarios(user_id);
create index scenarios_vehicle_id_idx on scenarios(vehicle_id);

-- Row Level Security
alter table scenarios enable row level security;

create policy "Users can view own scenarios"
  on scenarios for select using (auth.uid() = user_id);

create policy "Users can insert own scenarios"
  on scenarios for insert with check (auth.uid() = user_id);

create policy "Users can update own scenarios"
  on scenarios for update using (auth.uid() = user_id);

create policy "Users can delete own scenarios"
  on scenarios for delete using (auth.uid() = user_id);
```

---

## User Stories

### US-05-001: Scenario TypeScript types

**As a** developer,
**I want** strongly typed scenario interfaces,
**So that** all scenario data is validated at compile time.

**Acceptance criteria:**
- [ ] `types/scenario.ts` contains all interfaces from data model above
- [ ] OwnershipType is a union type, not a string
- [ ] Type guards for each ownership type: `isPrivateOwned()`, `isOperationalLease()`, etc.
- [ ] Helper type `ScenarioWithCalculation` that extends Scenario with calculated results

**Muka UI components:** None (types only)

**Estimate:** 0.5 day

---

### US-05-002: Scenario service layer

**As a** developer,
**I want** a scenario service that handles CRUD operations,
**So that** scenarios can be created, read, updated, and deleted.

**Acceptance criteria:**
- [ ] `getScenarios(userId)` — returns all scenarios for user, sorted by updated_at desc
- [ ] `getScenario(scenarioId)` — returns single scenario with vehicle data joined
- [ ] `createScenario(userId, vehicleId, ownershipType, inputs)` — creates scenario with auto-generated label
- [ ] `updateScenario(scenarioId, updates)` — updates scenario, regenerates label if vehicle/type changed
- [ ] `deleteScenario(scenarioId)` — deletes scenario
- [ ] `duplicateScenario(scenarioId, newOwnershipType)` — creates copy with different ownership type
- [ ] All operations use RLS (user can only access own scenarios)

**Muka UI components:** None (service layer)

**Estimate:** 1 day

---

### US-05-003: Scenario label generation

**As a** ZZP'er,
**I want** scenarios to have clear, auto-generated labels,
**So that** I can easily identify them in lists.

**Acceptance criteria:**
- [ ] Label format: `{merk} {handelsbenaming} {bouwjaar} · {ownership_type_label}`
- [ ] Ownership type labels (Dutch):
  - `private_owned` → "Privé eigendom"
  - `private_lease` → "Privé lease"
  - `financial_lease` → "Financial lease"
  - `operational_lease` → "Operational lease"
  - `business_owned` → "Zakelijk eigendom"
- [ ] Youngtimer suffix: if business scenario and vehicle is youngtimer, append "(youngtimer)"
- [ ] Label regenerates when vehicle or ownership type changes
- [ ] Example: "BMW 3 Series 2008 · Zakelijk eigendom (youngtimer)"

**Muka UI components:** None (utility function)

**Estimate:** 0.5 day

---

### US-05-004: Ownership type display labels and descriptions

**As a** ZZP'er,
**I want** ownership types to have clear descriptions,
**So that** I understand the differences when choosing.

**Acceptance criteria:**
- [ ] Each ownership type has:
  - `label`: short name
  - `description`: one-line explanation
  - `icon`: visual indicator
- [ ] Descriptions (Dutch):
  - Privé eigendom: "Jij koopt de auto zelf. Je declareert €0,23/km zakelijk."
  - Privé lease: "Persoonlijk leasecontract. Geen zakelijke belastingeffecten."
  - Financial lease: "De bank financiert, de auto staat op jouw balans. Bijtelling van toepassing."
  - Operational lease: "Je huurt de auto inclusief onderhoud en verzekering. Alle leasekosten aftrekbaar."
  - Zakelijk eigendom: "Jij koopt de auto via je bedrijf. Afschrijving + bijtelling van toepassing."

**Muka UI components:** None (constants)

**Estimate:** 0.5 day

---

### US-05-005: Private use threshold indicator

**As a** ZZP'er,
**I want to** see whether bijtelling applies based on my km split,
**So that** I understand the tax implications.

**Acceptance criteria:**
- [ ] Calculate: `private_km = annual_km_total - annual_km_business`
- [ ] If `private_km > 500`: show "Bijtelling van toepassing"
- [ ] If `private_km <= 500`: show "Geen bijtelling (onder 500km privé)"
- [ ] Update in real-time as user edits km fields
- [ ] Visual indicator: warning badge for bijtelling, success badge for no bijtelling

**Muka UI components:** Badge

**Estimate:** 0.5 day

---

### US-05-006: Garage vehicle dagwaarde field

**As a** ZZP'er with a youngtimer,
**I want to** store the current market value (dagwaarde) for my vehicle,
**So that** youngtimer bijtelling can be calculated correctly.

**Acceptance criteria:**
- [ ] Add `dagwaarde` field to garage_vehicles table (nullable numeric)
- [ ] Add `dagwaarde_estimated` field to garage_vehicles table (boolean)
- [ ] Update GarageVehicle TypeScript type
- [ ] Field only relevant for youngtimer vehicles (15+ years old, 25+ from 2027)
- [ ] "Schat voor mij" button uses depreciation curve to estimate
- [ ] Estimated values marked with note: "Schatting op basis van afschrijvingscurve"

**Muka UI components:** Input, Button

**Dependencies:** US-02-002 (existing garage model)

**Estimate:** 0.5 day

---

### US-05-007: Dagwaarde estimation algorithm

**As a** ZZP'er,
**I want** the app to estimate my car's current market value,
**So that** I don't have to research it myself.

**Acceptance criteria:**
- [ ] Estimation based on:
  - Original catalog price (catalogusprijs from RDW)
  - Vehicle age (from datum_eerste_toelating)
  - Standard depreciation curve
- [ ] Depreciation curve (simplified):
  - Year 1: 20% depreciation
  - Year 2: 15%
  - Year 3-5: 10% per year
  - Year 6+: 5% per year
  - Minimum: 5% of original price
- [ ] Helper text: "Kijk op Marktplaats voor vergelijkbare auto's voor een nauwkeurigere waarde"

**Muka UI components:** None (calculation logic)

**Estimate:** 0.5 day

---

### US-05-008: Scenario validation

**As a** developer,
**I want** scenario inputs to be validated before saving,
**So that** calculations always have valid data.

**Acceptance criteria:**
- [ ] All numeric fields must be non-negative
- [ ] annual_km_business must be ≤ annual_km_total
- [ ] depreciation_years must be ≥ 5 (fiscal minimum)
- [ ] residual_value_percent must be ≥ 0.10 (fiscal floor)
- [ ] interest_rate (if provided) must be between 0 and 1
- [ ] Required fields based on ownership type are enforced
- [ ] Validation errors shown inline on form fields

**Muka UI components:** Input (error state)

**Estimate:** 0.5 day

---

## Technical Notes

### Files to create

```
src/
├── lib/
│   ├── scenarios.ts          # Scenario service
│   └── dagwaarde.ts          # Dagwaarde estimation
└── types/
    └── scenario.ts           # Scenario types
```

### Migration: Add dagwaarde to garage_vehicles

```sql
alter table garage_vehicles
  add column dagwaarde numeric,
  add column dagwaarde_estimated boolean default false;
```

### Ownership type config

```typescript
export const OWNERSHIP_TYPES = {
  private_owned: {
    label: 'Privé eigendom',
    description: 'Jij koopt de auto zelf. Je declareert €0,23/km zakelijk.',
    icon: 'home',
  },
  private_lease: {
    label: 'Privé lease',
    description: 'Persoonlijk leasecontract. Geen zakelijke belastingeffecten.',
    icon: 'credit-card',
  },
  financial_lease: {
    label: 'Financial lease',
    description: 'De bank financiert, de auto staat op jouw balans. Bijtelling van toepassing.',
    icon: 'building-bank',
  },
  operational_lease: {
    label: 'Operational lease',
    description: 'Je huurt de auto inclusief onderhoud en verzekering. Alle leasekosten aftrekbaar.',
    icon: 'car',
  },
  business_owned: {
    label: 'Zakelijk eigendom',
    description: 'Jij koopt de auto via je bedrijf. Afschrijving + bijtelling van toepassing.',
    icon: 'briefcase',
  },
} as const;
```

---

## Muka UI Components Required

| Component | Status | Notes |
|-----------|--------|-------|
| Badge | ✅ Available | Bijtelling indicator |
| Input | ✅ Available | Dagwaarde input |
| Button | ✅ Available | "Schat voor mij" button |

---

## Out of Scope

- Scenario versioning/history
- Scenario sharing between users
- Import/export scenarios
- Bulk scenario operations
- Scenario templates
- Multiple vehicles per scenario (always 1:1)

---

## Definition of Done

- [ ] All TypeScript types defined and exported
- [ ] Supabase table created with RLS policies
- [ ] Dagwaarde field added to garage_vehicles
- [ ] Scenario service handles all CRUD operations
- [ ] Label generation works correctly with youngtimer suffix
- [ ] Dagwaarde estimation algorithm implemented
- [ ] Validation logic complete
- [ ] Unit tests for type guards and validation
- [ ] `npm run build && npm run lint` passes
