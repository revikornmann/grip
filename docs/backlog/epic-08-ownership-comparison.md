# Epic 08: Ownership Comparison

> **Component Constraint:** All UI must use Muka UI components. If a component doesn't exist, build it in muka-ui first. See [EPICS.md](./EPICS.md#component-dependency-workflow) for the workflow.

## Overview

**Goal:** Enable side-by-side comparison of 2–3 scenarios so ZZP'ers can see which ownership type is most cost-effective for their situation.

**Phase:** 1 (MVP)
**Priority:** P2
**Dependencies:** Epic 06 (Calculator Engine), Epic 07 (Scenario UI)

---

## User Stories

### US-08-001: Compare view with scenario selection

**As a** ZZP'er,
**I want to** compare multiple scenarios side by side,
**So that** I can see which option is best for me.

**Acceptance criteria:**
- [ ] Compare page at `/compare`
- [ ] Chip-based selector to choose scenarios (multi-select)
- [ ] Minimum 2 scenarios required to show comparison
- [ ] Maximum 3 scenarios in comparison
- [ ] Selected scenarios shown as columns
- [ ] "Voeg scenario toe" button if fewer than 3 selected
- [ ] Error state if user has fewer than 2 scenarios total

**Muka UI components:** Chip, Card, Button

**Estimate:** 1 day

---

### US-08-002: Comparison metric rows

**As a** ZZP'er,
**I want to** see key metrics compared across scenarios,
**So that** I can understand the differences at a glance.

**Acceptance criteria:**
- [ ] Metric rows displayed:
  - Bruto jaarkosten (gross annual cost)
  - Belastingvoordeel kosten (tax saving on costs)
  - Bijtelling (bijtelling cost)
  - BTW-teruggave (VAT recovery)
  - Km-vergoeding (km deduction — private scenarios only)
  - **Netto jaarkosten** (net annual cost — highlighted)
  - Netto per maand (monthly equivalent)
- [ ] Each cell shows the value for that scenario
- [ ] Missing values (e.g., km-vergoeding for business) show "n.v.t."
- [ ] Clear visual hierarchy with net cost emphasized

**Muka UI components:** Table, Card

**Estimate:** 1 day

---

### US-08-003: Best value highlighting

**As a** ZZP'er,
**I want** the best value highlighted for each metric,
**So that** I can quickly see which scenario wins.

**Acceptance criteria:**
- [ ] For each row, highlight the best (lowest cost or highest benefit) value
- [ ] Highlighting rules:
  - Costs (bruto, bijtelling): lowest is best → green highlight
  - Benefits (belastingvoordeel, BTW, km-vergoeding): highest is best → green highlight
  - Net cost: lowest is best → green highlight
- [ ] Use subtle background color or badge for highlight
- [ ] Clear visual distinction without being distracting

**Muka UI components:** Badge, Table

**Estimate:** 0.5 day

---

### US-08-004: Comparison header with scenario info

**As a** ZZP'er,
**I want to** see which scenarios I'm comparing,
**So that** I don't confuse them.

**Acceptance criteria:**
- [ ] Column headers show:
  - Vehicle: merk + model + bouwjaar
  - Ownership type badge
  - Youngtimer indicator if applicable
- [ ] Tap header → navigates to scenario detail
- [ ] "X" button to remove scenario from comparison
- [ ] Sticky headers when scrolling on mobile

**Muka UI components:** Card, Badge, Button, Icon

**Estimate:** 0.5 day

---

### US-08-005: Comparison empty state

**As a** ZZP'er with no scenarios,
**I want to** see helpful guidance on the compare page,
**So that** I know how to get started.

**Acceptance criteria:**
- [ ] If user has 0 scenarios: "Maak eerst een scenario aan om te vergelijken"
- [ ] If user has 1 scenario: "Maak nog een scenario aan om te vergelijken"
- [ ] CTA button: "Nieuw scenario" → navigates to add flow
- [ ] Helpful illustration or icon

**Muka UI components:** Card, Button

**Estimate:** 0.5 day

---

### US-08-006: Quick duplicate for comparison

**As a** ZZP'er,
**I want to** quickly create a comparison variant,
**So that** I can compare the same car with different ownership types.

**Acceptance criteria:**
- [ ] "Vergelijk met ander type" button on scenario card in compare view
- [ ] Opens ownership type selector
- [ ] Creates duplicate scenario with new type
- [ ] Automatically adds new scenario to comparison
- [ ] Useful for: "What if I leased instead of bought?"

**Muka UI components:** Button, RadioTile, Dialog

**Estimate:** 1 day

---

### US-08-007: Mobile-responsive comparison

**As a** ZZP'er on mobile,
**I want** the comparison view to work well on small screens,
**So that** I can compare scenarios anywhere.

**Acceptance criteria:**
- [ ] On mobile: horizontal scroll for columns
- [ ] Row labels stay fixed while scrolling
- [ ] Touch-friendly tap targets
- [ ] Scenario selector works well on mobile
- [ ] Consider swipe gestures for navigation

**Muka UI components:** Table, Card

**Estimate:** 1 day

---

### US-08-008: Share comparison (URL)

**As a** ZZP'er,
**I want to** share my comparison with others,
**So that** I can discuss it with my accountant or partner.

**Acceptance criteria:**
- [ ] "Deel" button generates shareable URL
- [ ] URL includes selected scenario IDs: `/compare?scenarios=id1,id2,id3`
- [ ] Visiting URL with scenarios pre-selects them in comparison
- [ ] If scenarios belong to another user: show "Je hebt geen toegang tot deze scenario's"
- [ ] Copy to clipboard functionality

**Muka UI components:** Button, Toast, Input

**Estimate:** 0.5 day

---

## Technical Notes

### Route structure

```
/compare                          # Empty or with saved selection
/compare?scenarios=id1,id2,id3    # Pre-selected scenarios
```

### Comparison data structure

```typescript
interface ComparisonRow {
  label: string;
  key: string;
  format: 'currency' | 'percentage';
  higherIsBetter: boolean;  // For highlighting
  values: (number | null)[];
}

interface ComparisonData {
  scenarios: Scenario[];
  rows: ComparisonRow[];
  bestValueIndices: Record<string, number>;  // key → index of best scenario
}
```

### Files to create

```
src/app/
└── compare/
    └── page.tsx

src/components/
└── compare/
    ├── ScenarioSelector.tsx
    ├── ComparisonTable.tsx
    ├── ComparisonHeader.tsx
    └── MetricRow.tsx
```

---

## Muka UI Components Required

| Component | Status | Notes |
|-----------|--------|-------|
| Card | ✅ Available | Scenario headers |
| Chip | ✅ Available | Scenario selector |
| Badge | ✅ Available | Ownership type, best value |
| Button | ✅ Available | Actions |
| Table | ✅ Available | Comparison grid |
| Dialog | ✅ Available | Quick duplicate |
| Toast | ✅ Available | Copy confirmation |
| Icon | ✅ Available | Remove, share icons |

---

## Out of Scope

- More than 3 scenarios in comparison
- Saved comparison presets
- PDF/Excel export of comparison
- Interactive what-if sliders
- Graph/chart visualizations
- Cost over time projections
- Comparison sharing with non-users

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Compare view shows 2-3 scenarios side by side
- [ ] All metric rows display correctly
- [ ] Best values highlighted per row
- [ ] Empty states handled gracefully
- [ ] Quick duplicate works
- [ ] Mobile responsive with horizontal scroll
- [ ] Share URL works
- [ ] `npm run build && npm run lint` passes
