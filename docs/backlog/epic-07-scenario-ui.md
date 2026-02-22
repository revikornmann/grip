# Epic 07: Scenario UI (Add / View / Edit)

> **Component Constraint:** All UI must use Muka UI components. If a component doesn't exist, build it in muka-ui first. See [EPICS.md](./EPICS.md#component-dependency-workflow) for the workflow.

## Overview

**Goal:** Build the user interface for creating, viewing, and editing scenarios — from choosing a vehicle and ownership type to reviewing the calculated cost breakdown.

**Phase:** 1 (MVP)
**Priority:** P1
**Dependencies:** Epic 04 (User Profile), Epic 05 (Scenario Model), Epic 06 (Calculator Engine)

---

## Screen Architecture

### 7.1 Scenario List (Home Screen)

Displays all saved scenarios. Empty state if none.

### 7.2 Add Scenario Flow

1. Choose vehicle (lookup or existing garage)
2. Choose ownership type
3. Enter type-specific inputs
4. Review and save

### 7.3 Scenario Detail

Full breakdown of one scenario's costs and tax effects, with inline editing.

---

## User Stories

### US-07-001: Scenario list (home screen)

**As a** ZZP'er,
**I want to** see all my scenarios on the home screen,
**So that** I can quickly compare my options.

**Acceptance criteria:**
- [ ] Home screen at `/` or `/scenarios` shows all saved scenarios
- [ ] Each scenario card shows:
  - Vehicle: merk + model + bouwjaar
  - Ownership type label (badge)
  - Net annual cost (large, prominent)
  - Monthly equivalent (smaller)
  - Youngtimer warning badge if applicable
- [ ] Cards sorted by most recently edited first
- [ ] Empty state when no scenarios: "Nog geen scenario's. Voeg je eerste auto toe."
- [ ] "+" floating action button to add new scenario
- [ ] Tap card → navigates to scenario detail

**Muka UI components:** Card, Badge, Button, ListItem

**Dependencies:** US-05-002

**Estimate:** 1 day

---

### US-07-002: Add scenario — choose vehicle

**As a** ZZP'er,
**I want to** choose a vehicle for my new scenario,
**So that** I can calculate costs for that specific car.

**Acceptance criteria:**
- [ ] Step 1 of add flow at `/scenarios/new`
- [ ] Two options:
  - "Kenteken opzoeken" → license plate lookup flow
  - "Kies uit garage" → shows list of existing garage vehicles
- [ ] If garage is empty, only show lookup option
- [ ] After vehicle selected, proceed to step 2
- [ ] Progress indicator shows step 1 of 4

**Muka UI components:** Card, Button, FormProgressBar, Input

**Estimate:** 1 day

---

### US-07-003: Add scenario — choose ownership type

**As a** ZZP'er,
**I want to** select how I'll own or lease this car,
**So that** the right tax rules are applied.

**Acceptance criteria:**
- [ ] Step 2 of add flow
- [ ] Five ownership type cards with:
  - Label (bold)
  - Description (one line)
  - Icon
- [ ] Cards are radio-selectable (only one can be chosen)
- [ ] Options:
  - Privé eigendom: "Jij koopt de auto zelf. Je declareert €0,23/km zakelijk."
  - Privé lease: "Persoonlijk leasecontract. Geen zakelijke belastingeffecten."
  - Financial lease: "De bank financiert, de auto staat op jouw balans. Bijtelling van toepassing."
  - Operational lease: "Je huurt de auto inclusief onderhoud en verzekering. Alle leasekosten aftrekbaar."
  - Zakelijk eigendom: "Jij koopt de auto via je bedrijf. Afschrijving + bijtelling van toepassing."
- [ ] "Volgende" button to proceed
- [ ] "Terug" button to go back

**Muka UI components:** RadioTile, Button, FormProgressBar, Icon

**Estimate:** 0.5 day

---

### US-07-004: Add scenario — enter km inputs

**As a** ZZP'er,
**I want to** enter my annual and business kilometers,
**So that** bijtelling and BTW recovery are calculated correctly.

**Acceptance criteria:**
- [ ] Step 3a of add flow (shown for all ownership types)
- [ ] Fields:
  - "Totaal km per jaar" (number input)
  - "Zakelijk km per jaar" (number input)
- [ ] Derived display: "X km privé" calculated live
- [ ] 500km threshold indicator:
  - If private > 500: warning badge "Bijtelling van toepassing"
  - If private ≤ 500: success badge "Geen bijtelling (onder 500km privé)"
- [ ] Validation: business km ≤ total km
- [ ] "Volgende" button to proceed to type-specific inputs

**Muka UI components:** Input, Label, Badge, Button

**Estimate:** 0.5 day

---

### US-07-005: Add scenario — type-specific inputs

**As a** ZZP'er,
**I want to** enter the cost details specific to my ownership type,
**So that** my scenario is calculated accurately.

**Acceptance criteria:**
- [ ] Step 3b of add flow
- [ ] Form fields based on ownership type:

**Private owned:**
- Purchase price (€)
- Expected ownership years
- Monthly fuel (€)
- Monthly insurance (€)
- Monthly maintenance (€)
- Annual road tax (€) — pre-filled from MRB calculation if possible

**Private lease:**
- Monthly lease cost (€)
- Monthly fuel (€)

**Financial lease:**
- Monthly payment (€)
- Interest rate (%) — optional
- Contract duration (months)
- Monthly fuel (€)
- Monthly insurance (€)
- Monthly maintenance (€)

**Operational lease:**
- Monthly lease cost (€)
- Contract duration (months)
- Km cap per year
- Monthly fuel (€)

**Business owned:**
- Purchase price (€)
- Depreciation years (default 5, min 5)
- Residual value % (default 10%, min 10%)
- Monthly fuel (€)
- Monthly insurance (€)
- Monthly maintenance (€)
- Annual road tax (€)
- Dagwaarde (€) — only shown if youngtimer, with "Schat voor mij" button

- [ ] All fields have helper text explaining what to enter
- [ ] Validation enforced (see US-05-008)
- [ ] "Volgende" button to proceed to review

**Muka UI components:** Input, Label, Select, Button

**Estimate:** 2 days

---

### US-07-006: Add scenario — review and save

**As a** ZZP'er,
**I want to** see the calculated result before saving,
**So that** I can verify the scenario looks correct.

**Acceptance criteria:**
- [ ] Step 4 of add flow
- [ ] Shows:
  - Vehicle: merk + model + bouwjaar
  - Ownership type
  - Net annual cost (hero number)
  - Monthly equivalent
  - Tax effects summary (bijtelling, kostenaftrek, BTW recovery)
- [ ] "Opslaan" button saves scenario to Supabase
- [ ] Success toast: "Scenario opgeslagen"
- [ ] Redirect to scenario detail page
- [ ] "Terug" button to edit inputs

**Muka UI components:** Card, Button, Badge, Divider

**Estimate:** 1 day

---

### US-07-007: Scenario detail screen

**As a** ZZP'er,
**I want to** see a full breakdown of my scenario's costs,
**So that** I understand where my money is going.

**Acceptance criteria:**
- [ ] Page at `/scenarios/[id]`
- [ ] Sections:
  1. **Header** — Vehicle name + ownership type + net annual cost (hero)
  2. **Belastingeffecten** — Tax story in plain language:
     - Bijtelling: €X/jaar (or "Niet van toepassing")
     - Kostenaftrek: -€X/jaar belastingvoordeel
     - BTW-teruggave: -€X/jaar (or "Niet van toepassing")
  3. **Kostenopbouw** — Line-item breakdown:
     - Each cost item with label and amount
     - Subtotals for running costs, ownership costs
  4. **Youngtimer waarschuwing** — if applicable (see Epic 09)
- [ ] Edit button → enters edit mode

**Muka UI components:** Card, Badge, Divider, Button, ListItem

**Estimate:** 1.5 days

---

### US-07-008: Inline scenario editing

**As a** ZZP'er,
**I want to** edit my scenario inputs inline,
**So that** I can quickly see how changes affect my costs.

**Acceptance criteria:**
- [ ] "Bewerken" button toggles edit mode
- [ ] In edit mode:
  - All input fields become editable
  - Changes update calculations in real-time
  - "Opslaan" button saves changes
  - "Annuleren" button discards changes
- [ ] After save: toast "Scenario bijgewerkt"
- [ ] Ownership type cannot be changed (create new scenario instead)
- [ ] Vehicle cannot be changed (create new scenario instead)

**Muka UI components:** Input, Button, Card

**Estimate:** 1 day

---

### US-07-009: Delete scenario

**As a** ZZP'er,
**I want to** delete a scenario I no longer need,
**So that** my scenario list stays clean.

**Acceptance criteria:**
- [ ] Delete button on scenario detail screen
- [ ] Confirmation dialog: "Weet je zeker dat je dit scenario wilt verwijderen?"
- [ ] Delete removes from Supabase
- [ ] Redirect to home screen after delete
- [ ] Toast: "Scenario verwijderd"

**Muka UI components:** Button, Dialog

**Estimate:** 0.5 day

---

### US-07-010: Duplicate scenario with different ownership type

**As a** ZZP'er,
**I want to** quickly create a variant of my scenario with a different ownership type,
**So that** I can compare options for the same car.

**Acceptance criteria:**
- [ ] "Dupliceer met ander type" button on scenario detail
- [ ] Opens ownership type selector (step 2 of add flow)
- [ ] Copies all common inputs (km, fuel, etc.)
- [ ] Pre-fills type-specific inputs where possible
- [ ] New scenario created with new ownership type
- [ ] Navigate to new scenario detail after save

**Muka UI components:** Button, RadioTile, Dialog

**Estimate:** 1 day

---

### US-07-011: Cost breakdown visualization

**As a** ZZP'er,
**I want** costs displayed in a clear visual format,
**So that** I can quickly understand the composition.

**Acceptance criteria:**
- [ ] Cost items grouped by category:
  - Vaste kosten: depreciation/lease, road tax
  - Variabele kosten: fuel, insurance, maintenance
  - Belastingeffecten: bijtelling, kostenaftrek, BTW
- [ ] Each item shows:
  - Label
  - Annual amount (€)
  - Monthly equivalent (€/mnd)
- [ ] Positive costs in neutral/dark color
- [ ] Benefits (negative costs) in green
- [ ] Costs (bijtelling) in warning color
- [ ] Clear visual hierarchy with totals

**Muka UI components:** Card, ListItem, Divider, Badge

**Estimate:** 1 day

---

## Technical Notes

### Route structure

```
/scenarios                    # List (home)
/scenarios/new                # Add flow (multi-step)
/scenarios/new?vehicle=:id    # Add flow with pre-selected vehicle
/scenarios/[id]               # Detail view
/scenarios/[id]/edit          # Edit mode (or inline toggle)
```

### Files to create

```
src/app/
├── scenarios/
│   ├── page.tsx              # List view
│   ├── new/
│   │   └── page.tsx          # Add flow
│   └── [id]/
│       └── page.tsx          # Detail view
└── components/
    └── scenarios/
        ├── ScenarioCard.tsx
        ├── OwnershipTypePicker.tsx
        ├── KmInputs.tsx
        ├── TypeSpecificForm.tsx
        ├── CostBreakdown.tsx
        └── TaxEffectsSummary.tsx
```

### Form state management

Use React Hook Form or similar for multi-step form state. Persist partial state in sessionStorage to survive navigation.

---

## Muka UI Components Required

| Component | Status | Notes |
|-----------|--------|-------|
| Card | ✅ Available | Scenario cards, forms |
| Badge | ✅ Available | Ownership type, warnings |
| Button | ✅ Available | All actions |
| Input | ✅ Available | All form fields |
| Label | ✅ Available | Form labels |
| RadioTile | ✅ Available | Ownership type selection |
| Select | ✅ Available | Dropdowns |
| FormProgressBar | ✅ Available | Add flow progress |
| Divider | ✅ Available | Section separators |
| ListItem | ✅ Available | Cost breakdown items |
| Dialog | ✅ Available | Delete confirmation |
| Icon | ✅ Available | Ownership type icons |
| Toast | ✅ Available | Success/error notifications |
| Empty State | ❌ Needed | No scenarios view |

---

## Out of Scope

- Drag-and-drop scenario reordering
- Scenario archiving (only delete)
- Scenario sharing/export
- Undo/redo for edits
- Bulk scenario operations
- Scenario tags/categories
- Custom scenario labels (auto-generated only)

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Add flow works end-to-end for all 5 ownership types
- [ ] Scenario detail shows complete cost breakdown
- [ ] Inline editing updates calculations in real-time
- [ ] Delete with confirmation works
- [ ] Duplicate scenario works
- [ ] Empty state shown when no scenarios
- [ ] Mobile responsive design
- [ ] Loading states for async operations
- [ ] Error handling for failed saves
- [ ] `npm run build && npm run lint` passes
