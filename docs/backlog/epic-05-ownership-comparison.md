# Epic 05: Ownership Comparison

> **Component Constraint:** All UI must use Muka UI components. If a component doesn't exist, build it in muka-ui first. See [EPICS.md](./EPICS.md#component-dependency-workflow) for the workflow.

## Overview

**Goal:** Enable side-by-side comparison of the same vehicle under private vs business ownership, clearly showing which scenario is more tax-efficient for the user's situation.

**Phase:** 1 (MVP)
**Priority:** P2
**Dependencies:** Epic 02 (Vehicle Garage), Epic 03 (User Accounts), Epic 04 (Cost Calculator)

---

## Comparison Scenarios

| Scenario | Key Factors |
|----------|-------------|
| **Privé (Private)** | No bijtelling, no BTW aftrek, full personal expense |
| **Zakelijk - Eenmanszaak** | Bijtelling on private use, BTW aftrek proportional, costs deductible from profit |
| **Zakelijk - BV** | Bijtelling as income, company pays costs, BTW aftrek, potential dividend implications |

For MVP, we focus on **Privé** vs **Zakelijk** (combined), with BV-specific nuances in Phase 2.

---

## User Stories

### US-05-001: Initiate comparison from garage

**As a** user with vehicles in my garage,
**I want to** compare ownership scenarios for a vehicle,
**So that** I can decide whether to buy privately or through my business.

**Acceptance criteria:**
- [ ] "Vergelijk eigendom" button on vehicle card in garage
- [ ] Can also select vehicle on comparison page
- [ ] Pre-selects vehicle if coming from garage
- [ ] Shows vehicle details at top for context
- [ ] Clear indication that both scenarios are being compared

**Muka UI components:** Button, Card, Select

**Dependencies:** Epic 02, Epic 04

**Estimate:** 0.5 day

---

### US-05-002: Side-by-side cost comparison

**As a** user comparing ownership options,
**I want to** see costs side-by-side,
**So that** I can easily spot the differences.

**Acceptance criteria:**
- [ ] Two-column layout: Privé | Zakelijk
- [ ] Same cost categories in both columns
- [ ] Aligned rows for easy comparison
- [ ] Different costs highlighted (color or badge)
- [ ] Tax-related rows only appear in Zakelijk column
- [ ] Responsive: stacks vertically on mobile with toggle

**Muka UI components:** Card, Table (#12), Badge, Tabs (for mobile)

**Dependencies:** US-05-001

**Estimate:** 1 day

---

### US-05-003: Show net annual cost difference

**As a** user,
**I want to** see the bottom-line difference between scenarios,
**So that** I know which option saves me money.

**Acceptance criteria:**
- [ ] Prominent display: "Zakelijk bespaart €X per jaar" or vice versa
- [ ] Shows both annual and 5-year projected difference
- [ ] Green highlight for the cheaper option
- [ ] Includes all factors (running costs + tax implications)
- [ ] Explains key drivers of the difference

**Muka UI components:** Card (highlight), Badge, Icon

**Dependencies:** US-05-002

**Estimate:** 0.5 day

---

### US-05-004: Adjust comparison inputs

**As a** user,
**I want to** change assumptions and see how they affect the comparison,
**So that** I can model different scenarios.

**Acceptance criteria:**
- [ ] Input panel with key variables:
  - Annual kilometers
  - Business use percentage
  - Tax bracket
  - Expected ownership period
- [ ] Changes update both scenarios in real-time
- [ ] "Reset naar standaard" to restore defaults
- [ ] Preset buttons: "Veel zakelijk gebruik", "Vooral privé"

**Muka UI components:** Input, Select, Button

**Dependencies:** US-05-002

**Estimate:** 0.5 day

---

### US-05-005: Explain bijtelling impact

**As a** user unfamiliar with bijtelling,
**I want** a clear explanation of how it affects the comparison,
**So that** I understand why business ownership has this cost.

**Acceptance criteria:**
- [ ] Collapsible section: "Wat is bijtelling?"
- [ ] Shows calculation: Cataloguswaarde × % × belastingtarief
- [ ] Lists current bijtelling percentages (22%, 16%, EV rates)
- [ ] Explains youngtimer reduction if applicable
- [ ] Link to Belastingdienst for more info

**Muka UI components:** Card (collapsible), Label, Divider, Icon (info)

**Dependencies:** US-05-002

**Estimate:** 0.5 day

---

### US-05-006: Show break-even point

**As a** user,
**I want to** know at what business use percentage the scenarios are equal,
**So that** I can assess if my usage makes business ownership worthwhile.

**Acceptance criteria:**
- [ ] Calculate break-even business use %
- [ ] Display: "Bij X% zakelijk gebruik zijn de kosten gelijk"
- [ ] Visual indicator (slider or chart) showing break-even
- [ ] Explanation of what drives the break-even
- [ ] Handle edge cases: always cheaper, never cheaper

**Muka UI components:** Card, Slider (read-only visualization)

**Dependencies:** US-05-003

**Estimate:** 1 day

---

### US-05-007: Compare multiple vehicles

**As a** user considering multiple vehicles,
**I want to** compare them against each other,
**So that** I can find the most cost-effective option.

**Acceptance criteria:**
- [ ] Select up to 3 vehicles from garage
- [ ] Matrix view: rows = cost categories, columns = vehicles
- [ ] Each vehicle shows its optimal ownership type
- [ ] Highlight the cheapest overall option
- [ ] Mobile: swipe between vehicles or vertical layout

**Muka UI components:** Select (multi), Table (#12), Card

**Dependencies:** US-05-002, Epic 02

**Estimate:** 1 day

---

### US-05-008: EV-specific comparison benefits

**As a** user considering an electric vehicle,
**I want to** see EV-specific tax benefits highlighted,
**So that** I understand why EVs can be tax-advantaged.

**Acceptance criteria:**
- [ ] Auto-detect EV from fuel type
- [ ] Highlight: Lower bijtelling (16% in 2024)
- [ ] Highlight: MRB exemption
- [ ] Show MIA/VAMIL eligibility if applicable
- [ ] Show energy cost savings vs fuel
- [ ] Note: bijtelling increases in future years

**Muka UI components:** Badge (EV), Card (highlight), Alert (#24)

**Dependencies:** US-05-002

**Estimate:** 0.5 day

---

### US-05-009: Youngtimer advantage display

**As a** user considering an older vehicle,
**I want to** see youngtimer tax benefits highlighted,
**So that** I understand this special category.

**Acceptance criteria:**
- [ ] Auto-detect youngtimer (15+ years old) from registration date
- [ ] Badge: "Youngtimer" on vehicle info
- [ ] Explain: 35% reduction in bijtelling
- [ ] Calculate: Bijtelling at 22% × 0.35 = ~7.7%
- [ ] Note: Only applies to business ownership

**Muka UI components:** Badge, Card, Tooltip (#18)

**Dependencies:** US-05-002

**Estimate:** 0.5 day

---

### US-05-010: Export comparison as PDF

**As a** user,
**I want to** export the comparison results,
**So that** I can share with my accountant or save for reference.

**Acceptance criteria:**
- [ ] "Exporteer als PDF" button
- [ ] PDF includes:
  - Vehicle details
  - Both scenarios with all costs
  - Key assumptions used
  - Recommendation summary
  - Date generated
  - User name and email (if logged in) for accountant reference
- [ ] Professional formatting suitable for accountant
- [ ] Works on mobile (triggers download)
- [ ] Anonymous users can still export (without user info header)

**Muka UI components:** Button, Icon (download)

**Dependencies:** US-05-003, Epic 03

**Estimate:** 1 day

---

### US-05-011: Disclaimer and accuracy notice

**As a** user making financial decisions,
**I want to** understand the limitations of the calculations,
**So that** I know to verify with a professional.

**Acceptance criteria:**
- [ ] Disclaimer visible on comparison page
- [ ] Text: "Deze berekening is indicatief. Raadpleeg een boekhouder voor definitief advies."
- [ ] Note that tax rules change and calculations use current rates
- [ ] "Laatste update: [date]" for tax rates
- [ ] Link to sources (Belastingdienst, RDW)

**Muka UI components:** Alert (#24), Card (footer)

**Dependencies:** US-05-001

**Estimate:** 0.5 day

---

## Technical Notes

### Comparison Engine
```typescript
// lib/comparison.ts
interface ComparisonScenario {
  ownership: 'private' | 'business';
  costs: CostBreakdown;
  taxBenefits: {
    btwReclaimed: number;
    deductibleCosts: number;
    miaVamil?: number;
  };
  netAnnualCost: number;
}

interface ComparisonResult {
  vehicle: GarageVehicle;
  scenarios: {
    private: ComparisonScenario;
    business: ComparisonScenario;
  };
  difference: {
    annual: number;
    fiveYear: number;
    cheaperOption: 'private' | 'business';
    breakEvenBusinessPercent: number;
  };
}

function compareOwnership(
  vehicle: GarageVehicle,
  inputs: CostInputs
): ComparisonResult
```

### Component Structure
```
src/
├── app/
│   └── compare/
│       └── page.tsx              # Comparison page
├── components/
│   └── compare/
│       ├── VehiclePicker.tsx     # Select vehicle(s)
│       ├── ComparisonTable.tsx   # Side-by-side costs
│       ├── DifferenceSummary.tsx # Bottom line
│       ├── BreakEvenChart.tsx    # Visual break-even
│       ├── BijtellungExplainer.tsx # Educational content
│       └── ExportButton.tsx      # PDF export
└── lib/
    └── comparison.ts             # Comparison logic
```

### PDF Generation
Consider using:
- `@react-pdf/renderer` for React-based PDF generation
- `html2pdf.js` for simpler HTML-to-PDF conversion
- Server-side generation for complex layouts (future)

---

## Calculation Notes

### Private Ownership Total Cost
```
= Fuel + Insurance + Road Tax + Maintenance + Depreciation
```

### Business Ownership Total Cost
```
= Fuel + Insurance + Road Tax + Maintenance + Depreciation
+ Bijtelling tax cost
- BTW reclaimed (purchase + running costs) × business use %
- Cost deduction benefit (costs × tax rate)
```

### Break-Even Calculation
Find `businessPercent` where:
```
PrivateCost = BusinessCost(businessPercent)
```

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Comparison calculations verified with accountant/example
- [ ] Mobile layout is usable for comparison
- [ ] PDF export works across browsers
- [ ] Disclaimer is prominent and clear
- [ ] Help content is accurate and up-to-date
