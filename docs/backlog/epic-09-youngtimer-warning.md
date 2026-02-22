# Epic 09: Youngtimer Warning

> **Component Constraint:** All UI must use Muka UI components. If a component doesn't exist, build it in muka-ui first. See [EPICS.md](./EPICS.md#component-dependency-workflow) for the workflow.

## Overview

**Goal:** Warn ZZP'ers about the upcoming youngtimer threshold change on 1 January 2027, and show them the concrete euro impact on their tax situation.

**Phase:** 1 (MVP)
**Priority:** P2
**Dependencies:** Epic 06 (Calculator Engine), Epic 07 (Scenario UI)

---

## Background

On 1 January 2027, the Dutch youngtimer threshold changes from 15 years to 25 years with **no transition period**. This means:

- Cars aged 15-24 years lose their youngtimer status overnight
- Their bijtelling changes from 35% of dagwaarde to 22% of cataloguswaarde
- For most affected cars, this is a significant tax increase

This epic ensures users are clearly warned about this change and understand its impact.

---

## Affected Vehicles

Show warning when:
- Vehicle is between 15 and 24 years old (inclusive)
- Current year is 2026 or earlier
- Ownership type involves bijtelling (business_owned, financial_lease, operational_lease)
- Private use exceeds 500km/year (bijtelling applies)

```typescript
function shouldShowYoungtimerWarning(vehicle, scenario, currentYear): boolean {
  const age = currentYear - vehicle.rdw.bouwjaar;

  // Only warn for vehicles that will lose youngtimer status
  if (age < 15 || age >= 25) return false;

  // Only warn before the change
  if (currentYear >= 2027) return false;

  // Only warn for business scenarios with bijtelling
  const businessTypes = ['business_owned', 'financial_lease', 'operational_lease'];
  if (!businessTypes.includes(scenario.ownership_type)) return false;

  // Only warn if bijtelling applies (private use > 500km)
  const privateKm = scenario.annual_km_total - scenario.annual_km_business;
  if (privateKm <= 500) return false;

  return true;
}
```

---

## User Stories

### US-09-001: Youngtimer warning on scenario detail

**As a** ZZP'er with a vehicle affected by the threshold change,
**I want to** see a clear warning about the 2027 rule change,
**So that** I can plan for the increased tax burden.

**Acceptance criteria:**
- [ ] Warning section shown on scenario detail page when applicable
- [ ] Warning headline: "Let op: Youngtimervoordeel vervalt op 1 januari 2027"
- [ ] Warning body explains:
  - Current vehicle age
  - What changes on 1 Jan 2027
  - Impact on bijtelling calculation
- [ ] Example text: "Jouw [merk model] is [X] jaar oud. Vanaf 2027 geldt de youngtimerregeling pas voor auto's van 25 jaar of ouder. Hierdoor verandert je bijtelling van 35% over de dagwaarde naar 22% over de cataloguswaarde."
- [ ] Warning styled with appropriate urgency (warning color, icon)

**Muka UI components:** Alert, Card

**Estimate:** 0.5 day

---

### US-09-002: Delta calculation (post-2027 impact)

**As a** ZZP'er,
**I want to** see the concrete euro impact of the threshold change,
**So that** I understand exactly how much more I'll pay.

**Acceptance criteria:**
- [ ] Calculate current bijtelling: `dagwaarde × 0.35 × tax_rate`
- [ ] Calculate post-2027 bijtelling: `catalogusprijs × 0.22 × tax_rate`
- [ ] Delta = post-2027 - current (usually positive = cost increase)
- [ ] Display: "Geschat extra jaarlijkse belastingdruk vanaf 2027: €[delta]"
- [ ] Monthly equivalent also shown: "€[delta/12]/maand"
- [ ] Delta highlighted prominently

**Formula:**
```typescript
function calculateYoungtimerDelta(vehicle, scenario, profile): number {
  const taxRate = getTaxRate(profile.taxable_income);

  // Current (youngtimer) bijtelling
  const dagwaarde = vehicle.dagwaarde ?? estimateDagwaarde(vehicle);
  const currentBijtelling = dagwaarde * 0.35 * taxRate;

  // Post-2027 bijtelling (standard 22% over cataloguswaarde)
  const cataloguswaarde = vehicle.rdw.catalogusprijs;
  const futureBijtelling = cataloguswaarde * 0.22 * taxRate;

  return futureBijtelling - currentBijtelling;
}
```

**Muka UI components:** Card, Badge

**Estimate:** 0.5 day

---

### US-09-003: Youngtimer badge on scenario cards

**As a** ZZP'er viewing my scenario list,
**I want to** see a visual indicator for affected scenarios,
**So that** I'm aware at a glance.

**Acceptance criteria:**
- [ ] Badge shown on scenario cards in list view
- [ ] Badge text: "2027 wijziging" or warning icon
- [ ] Badge uses warning color
- [ ] Tooltip (if available): "Youngtimervoordeel vervalt in 2027"
- [ ] Badge links to more info in scenario detail

**Muka UI components:** Badge, Card

**Estimate:** 0.5 day

---

### US-09-004: Warning in comparison view

**As a** ZZP'er comparing scenarios,
**I want to** see youngtimer warnings in the comparison,
**So that** I consider the 2027 change when deciding.

**Acceptance criteria:**
- [ ] Youngtimer warning row added to comparison table
- [ ] Row shows: "2027 extra kosten" with delta amount per affected scenario
- [ ] Non-affected scenarios show "n.v.t."
- [ ] Warning row styled distinctly (warning background or border)
- [ ] Consider: show "Netto 2027" row with projected costs after change

**Muka UI components:** Table, Badge

**Estimate:** 0.5 day

---

### US-09-005: Dagwaarde requirement for affected vehicles

**As a** ZZP'er with an affected vehicle,
**I want to** be prompted to enter dagwaarde,
**So that** the warning calculation is accurate.

**Acceptance criteria:**
- [ ] If vehicle is in affected range and dagwaarde is missing:
  - Prompt user to enter dagwaarde
  - Show "Schat voor mij" button as alternative
  - Explain why it's needed: "Om de impact van de 2027 wijziging te berekenen, hebben we de huidige marktwaarde nodig"
- [ ] Warning shows estimated impact if using estimated dagwaarde
- [ ] Note when estimate is used: "Op basis van geschatte dagwaarde"

**Muka UI components:** Input, Button, Alert

**Estimate:** 0.5 day

---

### US-09-006: Info modal explaining youngtimer rules

**As a** ZZP'er,
**I want to** understand the youngtimer rules in detail,
**So that** I can make informed decisions.

**Acceptance criteria:**
- [ ] "Meer info" link on youngtimer warning
- [ ] Opens modal/sheet with explanation:
  - What is youngtimer bijtelling
  - Current rule (15+ years, 35% over dagwaarde)
  - New rule from 2027 (25+ years)
  - No transition period
  - Example calculation with sample values
- [ ] Link to official government source (if available)

**Muka UI components:** Dialog or Sheet, Button

**Estimate:** 0.5 day

---

### US-09-007: 2027 scenario projection

**As a** ZZP'er,
**I want to** see what my scenario will cost in 2027,
**So that** I can plan ahead.

**Acceptance criteria:**
- [ ] Optional "Toon 2027 kosten" toggle on affected scenarios
- [ ] When enabled, recalculates entire scenario assuming:
  - 2027 tax rules
  - Youngtimer threshold at 25 years
  - Vehicle one year older
  - Same input costs (fuel, insurance, etc.)
- [ ] Side-by-side display: "2026 vs 2027"
- [ ] Clear labeling of which year is shown

**Muka UI components:** Toggle, Card, Table

**Estimate:** 1 day

---

## Technical Notes

### Vehicle age calculation

```typescript
function getVehicleAge(vehicle, referenceYear: number): number {
  // bouwjaar is the construction year
  return referenceYear - vehicle.rdw.bouwjaar;
}

function isInYoungtimerDangerZone(vehicle, currentYear: number): boolean {
  const age = getVehicleAge(vehicle, currentYear);
  return age >= 15 && age < 25 && currentYear < 2027;
}
```

### Files to create/modify

```
src/lib/
├── youngtimer.ts          # Youngtimer detection and delta calculation
└── calculator.ts          # Add 2027 projection support

src/components/
└── scenarios/
    └── YoungtimerWarning.tsx
```

### Warning content (Dutch)

```typescript
const WARNING_CONTENT = {
  headline: "Let op: Youngtimervoordeel vervalt op 1 januari 2027",
  body: (vehicle, age) =>
    `Jouw ${vehicle.rdw.merk} ${vehicle.rdw.handelsbenaming} is ${age} jaar oud. ` +
    `Vanaf 2027 geldt de youngtimerregeling pas voor auto's van 25 jaar of ouder. ` +
    `Hierdoor verandert je bijtelling van 35% over de dagwaarde naar 22% over de cataloguswaarde.`,
  delta: (amount) =>
    `Geschat extra jaarlijkse belastingdruk vanaf 2027: €${amount.toFixed(0)}`,
};
```

---

## Muka UI Components Required

| Component | Status | Notes |
|-----------|--------|-------|
| Alert | ✅ Available | Warning display |
| Card | ✅ Available | Warning container |
| Badge | ✅ Available | Scenario list indicator |
| Dialog | ✅ Available | Info modal |
| Sheet | ✅ Available | Alternative info display |
| Toggle | ✅ Available | 2027 projection toggle |
| Button | ✅ Available | More info, actions |
| Input | ✅ Available | Dagwaarde input |
| Table | ✅ Available | Comparison row |

---

## Out of Scope

- Push notifications for deadline
- Calendar reminder integration
- Historical youngtimer calculations (before 2026)
- Predictions beyond 2027
- Advice on whether to sell/keep vehicle
- Vehicle value tracking over time

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Warning shows for vehicles aged 15-24 in business scenarios
- [ ] Delta calculation is accurate
- [ ] Badge appears on scenario cards in list
- [ ] Warning appears in comparison view
- [ ] Info modal explains rules clearly
- [ ] 2027 projection works correctly
- [ ] Mobile responsive
- [ ] `npm run build && npm run lint` passes
