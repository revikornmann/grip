# Epic 02: Vehicle Garage

> **Component Constraint:** All UI must use Muka UI components. If a component doesn't exist, build it in muka-ui first. See [EPICS.md](./EPICS.md#component-dependency-workflow) for the workflow.

## Overview

**Goal:** Allow users to save multiple vehicles they're considering, with additional user-supplied data like purchase price and expected usage, enabling comparison across vehicles.

**Phase:** 1 (MVP)
**Priority:** P1
**Dependencies:** Epic 00 (Foundation), Epic 01 (License Plate Lookup)

---

## Data Model

```typescript
interface GarageVehicle {
  id: string;                       // UUID
  addedAt: string;                  // ISO timestamp

  // RDW data (from lookup)
  rdw: {
    kenteken: string;
    merk: string;
    handelsbenaming: string;
    brandstof_omschrijving: string;
    co2_uitstoot_gecombineerd?: number;
    datum_eerste_toelating: string;
    catalogusprijs?: number;
    bruto_bpm?: number;
  };

  // User-supplied data
  user: {
    purchasePrice: number;          // Actual/expected purchase price
    annualKilometers: number;       // Expected annual km
    businessKilometers: number;     // Expected business km
    ownershipType: 'private' | 'business';
    nickname?: string;              // Optional custom name
    notes?: string;                 // User notes
  };
}
```

---

## User Stories

### US-02-001: View empty garage state

**As a** new user with no saved vehicles,
**I want to** see a helpful empty state on the garage page,
**So that** I understand how to get started.

**Acceptance criteria:**
- [ ] Empty state shows illustration or icon
- [ ] Headline: "Je garage is nog leeg"
- [ ] Explanation text about what the garage is for
- [ ] Primary CTA: "Voertuig opzoeken" linking to lookup page
- [ ] Secondary CTA: "Voeg handmatig toe" (if manual entry is supported)

**Muka UI components:** Card, Button, Empty State (#30 or custom)

**Dependencies:** US-00-001

**Estimate:** 0.5 day

---

### US-02-002: Add vehicle from lookup

**As a** user who looked up a vehicle,
**I want to** add it to my garage with one click,
**So that** I can save it for later comparison.

**Acceptance criteria:**
- [ ] Vehicle is added to garage with RDW data populated
- [ ] User is prompted to enter purchase price and annual km
- [ ] Modal or slide-out form for additional details
- [ ] "Sla op" saves to local storage
- [ ] "Annuleren" returns to lookup without saving
- [ ] Success toast: "Voertuig toegevoegd aan garage"

**Muka UI components:** Modal (#15), Input, Button, Select

**Dependencies:** US-01-006, US-00-004 (storage)

**Estimate:** 1 day

---

### US-02-003: View garage list

**As a** user with saved vehicles,
**I want to** see all my vehicles in a list,
**So that** I can review and manage them.

**Acceptance criteria:**
- [ ] List shows all saved vehicles as cards
- [ ] Each card shows: make/model, license plate, ownership type
- [ ] Cards show key stats: purchase price, annual km
- [ ] Visual indicator for private vs business ownership
- [ ] Sort by: date added (default), make/model, price
- [ ] Grid layout on desktop, stack on mobile

**Muka UI components:** Card, Badge, Select (sort dropdown)

**Dependencies:** US-02-001, US-02-002

**Estimate:** 1 day

---

### US-02-004: Edit vehicle details

**As a** user,
**I want to** edit the details I entered for a saved vehicle,
**So that** I can update my assumptions as they change.

**Acceptance criteria:**
- [ ] "Bewerken" button on each vehicle card
- [ ] Opens same form as add, pre-filled with current values
- [ ] Can edit: purchase price, annual km, business km, ownership type, nickname, notes
- [ ] Cannot edit RDW data (fetched from API)
- [ ] "Opslaan" updates local storage
- [ ] "Annuleren" discards changes

**Muka UI components:** Modal (#15), Input, Button, Select

**Dependencies:** US-02-002

**Estimate:** 0.5 day

---

### US-02-005: Remove vehicle from garage

**As a** user,
**I want to** remove a vehicle I'm no longer considering,
**So that** my garage stays organized.

**Acceptance criteria:**
- [ ] "Verwijderen" option on each vehicle card
- [ ] Confirmation dialog: "Weet je zeker dat je dit voertuig wilt verwijderen?"
- [ ] Confirm button: "Verwijderen" (destructive style)
- [ ] Cancel button: "Annuleren"
- [ ] Success toast: "Voertuig verwijderd"
- [ ] Can undo within 5 seconds (optional enhancement)

**Muka UI components:** Modal (#15), Button (destructive variant)

**Dependencies:** US-02-003

**Estimate:** 0.5 day

---

### US-02-006: Enter purchase price

**As a** user adding a vehicle,
**I want to** enter the actual or expected purchase price,
**So that** cost calculations use realistic numbers instead of catalog price.

**Acceptance criteria:**
- [ ] Number input with € prefix
- [ ] Accepts values from €0 to €500,000
- [ ] Pre-fills with catalog price from RDW if available
- [ ] Helper text explains: "Werkelijke of verwachte aankoopprijs"
- [ ] Formats with thousands separator as user types
- [ ] Required field (cannot save without it)

**Muka UI components:** Input (number type, with prefix)

**Dependencies:** US-02-002

**Estimate:** 0.5 day

---

### US-02-007: Enter expected annual kilometers

**As a** user,
**I want to** enter how many kilometers I expect to drive per year,
**So that** fuel and maintenance costs can be calculated.

**Acceptance criteria:**
- [ ] Number input for total annual km
- [ ] Accepts values from 0 to 100,000 km
- [ ] Default suggestion: 15,000 km (Dutch average)
- [ ] Helper text: "Gemiddeld rijden Nederlanders 15.000 km per jaar"
- [ ] Second input for business km (for bijtelling calculation)
- [ ] Business km cannot exceed total km (validation)

**Muka UI components:** Input (number type), Label

**Dependencies:** US-02-002

**Estimate:** 0.5 day

---

### US-02-008: Select ownership type

**As a** user,
**I want to** indicate whether I'd own the vehicle privately or through my business,
**So that** the correct tax rules are applied.

**Acceptance criteria:**
- [ ] Radio buttons or segmented control: "Privé" / "Zakelijk"
- [ ] Default: "Privé" (most common starting point)
- [ ] Selection affects which tax rules apply in calculations
- [ ] Helper text explains difference briefly
- [ ] If "Zakelijk", show additional question about BV vs eenmanszaak (future)

**Muka UI components:** Radio group or Toggle/Segmented control

**Dependencies:** US-02-002

**Estimate:** 0.5 day

---

### US-02-009: Duplicate vehicle for comparison

**As a** user,
**I want to** duplicate a vehicle with different ownership settings,
**So that** I can easily compare private vs business ownership.

**Acceptance criteria:**
- [ ] "Dupliceren" button on vehicle card
- [ ] Creates copy with same RDW data
- [ ] Prompts to change ownership type on duplicate
- [ ] Adds "(kopie)" to nickname if present
- [ ] New vehicle appears in garage list
- [ ] Both vehicles can be selected for comparison

**Muka UI components:** Button, Modal (#15)

**Dependencies:** US-02-004

**Estimate:** 0.5 day

---

### US-02-010: Refresh RDW data

**As a** user with an old saved vehicle,
**I want to** refresh the RDW data,
**So that** I have the latest information if it changed.

**Acceptance criteria:**
- [ ] "Vernieuwen" option on vehicle card
- [ ] Fetches latest data from RDW API
- [ ] Shows loading state during fetch
- [ ] Updates RDW fields, preserves user-entered data
- [ ] Shows "Bijgewerkt" toast with timestamp
- [ ] If vehicle no longer in RDW, show warning (don't delete)

**Muka UI components:** Button (ghost), Loading state

**Dependencies:** US-02-003, Epic 01

**Estimate:** 0.5 day

---

## Technical Notes

### Storage Schema
```typescript
// Local storage key: 'grip:garage'
interface GarageStorage {
  version: 1;
  vehicles: GarageVehicle[];
}
```

### Component Structure
```
src/
├── app/
│   └── garage/
│       └── page.tsx              # Garage list page
├── components/
│   └── garage/
│       ├── GarageList.tsx        # Vehicle list/grid
│       ├── VehicleCard.tsx       # Individual vehicle card
│       ├── AddVehicleModal.tsx   # Add/edit form
│       └── EmptyGarage.tsx       # Empty state
└── lib/
    └── garage.ts                 # Garage storage operations
```

### Garage Service
```typescript
// lib/garage.ts
function getGarage(): GarageVehicle[]
function addVehicle(vehicle: Omit<GarageVehicle, 'id' | 'addedAt'>): GarageVehicle
function updateVehicle(id: string, updates: Partial<GarageVehicle['user']>): void
function removeVehicle(id: string): void
function duplicateVehicle(id: string): GarageVehicle
```

---

## Edge Cases

- Local storage full → Show error, suggest removing old vehicles
- Corrupted storage data → Reset with warning, offer backup download
- Maximum vehicles → Consider limit of 20 for performance
- Same license plate added twice → Allow it (different scenarios)
- Vehicle lookup fails when refreshing → Keep old data, show warning

---

## Future Enhancements (Out of Scope for MVP)

- Cloud sync with user accounts
- Share garage via link
- Import/export garage as JSON
- Vehicle images from external API
- Price history tracking

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Garage persists across browser sessions
- [ ] Works in private browsing (graceful degradation)
- [ ] Form validation prevents invalid data
- [ ] Keyboard navigation works for all actions
- [ ] Mobile touch targets are adequate size

---

## Implementation Plan

> **BLOCKED:** Do not implement until the Modal/Dialog component is available in muka-ui Storybook. US-02-002, 004, 005, and 009 all require Modal. See the [component dependency workflow](./EPICS.md#component-dependency-workflow).

### Prerequisite: Modal component in muka-ui

Build `Modal`, `ModalHeader`, `ModalBody`, `ModalFooter` as a compound component in `/Users/revikornmann/dev/muka`:

- **API:** `<Modal open={bool} onClose={fn} size="sm|md|lg">` with `ModalHeader`, `ModalBody`, `ModalFooter` children
- **Behaviour:** Portal to `document.body`, focus trap (Tab/Shift+Tab cycle), Escape to close, overlay click to close, body scroll lock, restore focus on close
- **Accessibility:** `role="dialog"`, `aria-modal="true"`, auto-generated `aria-labelledby` from ModalHeader
- **Sizes:** sm (400px), md (560px), lg (720px)
- **CSS:** BEM naming (`.muka-modal`, `.muka-modal__overlay`, etc.), existing tokens for surface, spacing, radius, shadow
- **Files:** `components/Modal/Modal.tsx`, `Modal.css`, `Modal.stories.tsx`; export from `components/index.ts`; run `npm run build`

### Data model migration

The lookup page (Epic 01) currently stores raw `Vehicle[]` under the `"garage"` storage key. This must be migrated to the `GarageVehicle` data model with `id`, `addedAt`, nested `rdw` + `user` data. The lookup page's `handleAddToGarage` will be replaced by opening `VehicleFormModal` so the user can enter purchase price, km, and ownership type before saving.

### Files to create/modify

| # | File | Action | Stories |
|---|------|--------|---------|
| 1 | `src/types/garage.ts` | Create | All |
| 2 | `src/lib/garage.ts` | Create | All |
| 3 | `src/components/garage/VehicleFormModal.tsx` | Create | US-02-002, 004, 006, 007, 008, 009 |
| 4 | `src/components/garage/GarageCard.tsx` | Create | US-02-003, 004, 005, 009, 010 |
| 5 | `src/components/garage/EmptyGarage.tsx` | Create | US-02-001 |
| 6 | `src/app/garage/page.tsx` | Rewrite | US-02-001, 003, 005, 010 |
| 7 | `src/app/lookup/page.tsx` | Modify | US-02-002 |

### Component architecture

**`src/types/garage.ts`** — `GarageVehicle` interface matching the data model above. Nullable types for fields that may be absent from RDW (`brandstof_omschrijving: string | null`, `co2_uitstoot_gecombineerd: number | null`, etc.).

**`src/lib/garage.ts`** — Storage service wrapping `@/lib/storage`. Functions: `getGarage()`, `addVehicle(rdw, user)` (generates UUID + timestamp), `updateVehicle(id, updates)`, `removeVehicle(id)`, `duplicateVehicle(id)` (copies RDW data, appends "(kopie)" to nickname), `isInGarage(plate)`, `getVehicleByPlate(plate)`.

**`src/components/garage/VehicleFormModal.tsx`** — Shared add/edit form used from both lookup and garage pages. Props: `open`, `onClose`, `onSave`, `vehicle?` (edit mode), `rdwData?` (new from lookup). Form fields: purchase price (Input, pre-filled from catalogPrice), annual km (Input, default 15.000), business km (Input, validated ≤ annual), ownership type (RadioTile pair: "Privé"/"Zakelijk"), nickname (optional Input), notes (optional Input). Footer: "Sla op" (primary) / "Annuleren" (secondary).

**`src/components/garage/GarageCard.tsx`** — Vehicle card for the garage list. Shows make/model (or nickname), formatted plate, ownership Badge ("Privé"/"Zakelijk"), purchase price, annual km. Actions: "Bewerken", "Dupliceren", "Verwijderen" (ghost), "Vernieuwen" (ghost). Uses Card, Badge, Button, Divider, Label.

**`src/components/garage/EmptyGarage.tsx`** — Empty state with Card + "Je garage is nog leeg" headline + explanation + "Voertuig opzoeken" CTA Button (→ /lookup).

**`src/app/garage/page.tsx`** — Full page: loads from `getGarage()`, renders `EmptyGarage` or grid of `GarageCard` (2 cols desktop, 1 col mobile via CSS grid). Sort dropdown (Select): date added, make/model, price. Delete confirmation via Modal + Alert (warning). Refresh via `lookupVehicle()` from `@/lib/rdw`. Toast for all mutations.

**`src/app/lookup/page.tsx`** — Replace direct `Vehicle[]` storage with `garage.isInGarage()` / open `VehicleFormModal`. Remove `GARAGE_KEY` constant.

### Verification

1. `npm run build && npm run lint` — no errors
2. Browser: empty garage → CTA → lookup → add (modal form) → garage list → edit → duplicate → delete → refresh
3. Mobile (375px): cards stack, modal full-width
4. Keyboard: Tab through actions, Escape closes modals
