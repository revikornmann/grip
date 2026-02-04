# Epic 01: License Plate Lookup

> **Component Constraint:** All UI must use Muka UI components. If a component doesn't exist, build it in muka-ui first. See [EPICS.md](./EPICS.md#component-dependency-workflow) for the workflow.

## Overview

**Goal:** Allow users to enter a Dutch license plate and retrieve vehicle data from the RDW API, providing the foundation data for all calculations.

**Phase:** 1 (MVP)
**Priority:** P0
**Dependencies:** Epic 00 (Foundation)

---

## RDW API Reference

**Endpoint:** `https://opendata.rdw.nl/resource/m9d7-ebf2.json`

**Query:** `?kenteken={LICENSE_PLATE}` (uppercase, no dashes)

**Key fields returned:**
- `kenteken` — License plate
- `merk` — Make (e.g., "VOLKSWAGEN")
- `handelsbenaming` — Model (e.g., "GOLF")
- `brandstof_omschrijving` — Fuel type
- `co2_uitstoot_gecombineerd` — CO2 emissions (g/km)
- `datum_eerste_toelating` — First registration date
- `catalogusprijs` — Catalog price (not always present)
- `bruto_bpm` — BPM tax paid

**Rate limits:** No authentication required, reasonable use expected

---

## User Stories

### US-01-001: Enter license plate and fetch vehicle data

**As a** ZZP'er considering a vehicle purchase,
**I want to** enter a Dutch license plate and see the vehicle details,
**So that** I don't have to manually research vehicle specifications.

**Acceptance criteria:**
- [ ] Input field accepts Dutch license plate
- [ ] Input auto-formats to uppercase
- [ ] Strips dashes/spaces before API call
- [ ] Displays loading state while fetching (spinner or skeleton)
- [ ] Shows vehicle make, model, fuel type on success
- [ ] API errors show user-friendly message
- [ ] Input is focused on page load for quick entry

**Muka UI components:** Input, Button, Card, Loading State (#27)

**Dependencies:** US-00-001, US-00-006

**Estimate:** 1 day

---

### US-01-002: Validate license plate format

**As a** user,
**I want** immediate feedback if I enter an invalid license plate format,
**So that** I can correct it before wasting time on an API call.

**Acceptance criteria:**
- [ ] Validates against Dutch license plate patterns:
  - XX-99-XX (sidecode 4)
  - 99-XX-XX (sidecode 5)
  - 99-XXX-9 (sidecode 6)
  - 9-XXX-99 (sidecode 7)
  - XX-999-X (sidecode 8)
  - X-999-XX (sidecode 9)
  - And newer formats
- [ ] Shows inline error message for invalid format
- [ ] Error clears when user starts typing again
- [ ] Submit button disabled until format is valid
- [ ] Validation happens on blur and on submit attempt

**Muka UI components:** Input (error state), Alert (#24)

**Dependencies:** US-01-001

**Estimate:** 0.5 day

---

### US-01-003: Display comprehensive vehicle details

**As a** user who looked up a vehicle,
**I want to** see all relevant details for tax calculations,
**So that** I have the information needed to make decisions.

**Acceptance criteria:**
- [ ] Display card shows:
  - Make and model (e.g., "Volkswagen Golf")
  - Year of first registration
  - Fuel type (Benzine, Diesel, Elektrisch, etc.)
  - CO2 emissions (g/km) — or "0" badge for EV
  - Catalog price (if available)
  - BPM paid
  - Age of vehicle (calculated from first registration)
- [ ] Missing data shows "Onbekend" (unknown) rather than empty
- [ ] EV vehicles highlighted with special badge
- [ ] Youngtimer eligible (15+ years) highlighted

**Muka UI components:** Card, Badge, Label, Divider

**Dependencies:** US-01-001

**Estimate:** 0.5 day

---

### US-01-004: Handle vehicle not found

**As a** user who entered a license plate that doesn't exist,
**I want to** see a clear message explaining the issue,
**So that** I know to double-check the plate or try a different one.

**Acceptance criteria:**
- [ ] "Kenteken niet gevonden" message displayed
- [ ] Suggests checking for typos
- [ ] Option to try again (clears input and refocuses)
- [ ] Does not show technical error details
- [ ] Tracks "not found" events for analytics (future)

**Muka UI components:** Card (empty state), Button, Alert (#24)

**Dependencies:** US-01-001

**Estimate:** 0.5 day

---

### US-01-005: Handle API errors gracefully

**As a** user,
**I want** the app to handle API failures gracefully,
**So that** I'm not stuck on a broken page.

**Acceptance criteria:**
- [ ] Network timeout shows "Verbinding mislukt" with retry option
- [ ] Server error (5xx) shows "RDW service tijdelijk niet beschikbaar"
- [ ] Rate limiting (if any) shows appropriate message
- [ ] Retry button attempts the same request
- [ ] After 3 retries, suggest trying again later
- [ ] Errors logged to console with full details

**Muka UI components:** Alert (#24), Button

**Dependencies:** US-01-001

**Estimate:** 0.5 day

---

### US-01-006: Quick action to add vehicle to garage

**As a** user who found the vehicle I'm interested in,
**I want to** quickly add it to my garage for comparison,
**So that** I can save time and continue my research.

**Acceptance criteria:**
- [ ] "Toevoegen aan garage" button appears after successful lookup
- [ ] Button is prominent (primary variant)
- [ ] Clicking navigates to garage with vehicle pre-added
- [ ] If vehicle already in garage, button says "Bekijk in garage"
- [ ] Success toast confirms vehicle was added

**Muka UI components:** Button, Toast (#24)

**Dependencies:** US-01-001, Epic 02 (Garage)

**Estimate:** 0.5 day

---

### US-01-007: Recent lookups history

**As a** returning user,
**I want to** see my recent license plate lookups,
**So that** I can quickly re-check vehicles I looked at before.

**Acceptance criteria:**
- [ ] Stores last 5 lookups in local storage
- [ ] Shows list below the search input
- [ ] Each item shows: plate, make/model
- [ ] Clicking an item performs the lookup again
- [ ] "Wis geschiedenis" option to clear the list
- [ ] History persists across sessions

**Muka UI components:** ListItem, Button (ghost), Icon

**Dependencies:** US-01-001, US-00-004 (storage)

**Estimate:** 0.5 day

---

### US-01-008: Share vehicle lookup via URL

**As a** user,
**I want to** share a vehicle lookup with someone else,
**So that** I can discuss the vehicle with my partner or accountant.

**Acceptance criteria:**
- [ ] URL updates to include license plate (e.g., `/lookup?plate=XX-123-YY`)
- [ ] Opening URL directly performs the lookup automatically
- [ ] "Kopieer link" button copies URL to clipboard
- [ ] Shared URL works without requiring login
- [ ] Invalid plate in URL shows appropriate error

**Muka UI components:** Button, Icon (copy), Toast (#24)

**Dependencies:** US-01-001

**Estimate:** 0.5 day

---

## Technical Notes

### RDW API Service
```typescript
// lib/rdw.ts
interface RDWVehicle {
  kenteken: string;
  merk: string;
  handelsbenaming: string;
  brandstof_omschrijving: string;
  co2_uitstoot_gecombineerd?: number;
  datum_eerste_toelating: string; // YYYYMMDD format
  catalogusprijs?: number;
  bruto_bpm?: number;
}

async function lookupVehicle(plate: string): Promise<RDWVehicle | null>
```

### License Plate Validation
```typescript
// lib/validation.ts
const DUTCH_PLATE_PATTERNS = [
  /^[A-Z]{2}-\d{2}-[A-Z]{2}$/,      // XX-99-XX
  /^\d{2}-[A-Z]{2}-[A-Z]{2}$/,      // 99-XX-XX
  /^\d{2}-[A-Z]{3}-\d$/,            // 99-XXX-9
  /^\d-[A-Z]{3}-\d{2}$/,            // 9-XXX-99
  /^[A-Z]{2}-\d{3}-[A-Z]$/,         // XX-999-X
  /^[A-Z]-\d{3}-[A-Z]{2}$/,         // X-999-XX
  // Add newer formats as needed
];

function isValidDutchPlate(plate: string): boolean
function normalizePlate(input: string): string // Removes dashes, uppercase
```

### Component Structure
```
src/
├── app/
│   └── lookup/
│       └── page.tsx              # Lookup page
├── components/
│   └── lookup/
│       ├── LicensePlateInput.tsx # Input with validation
│       ├── VehicleCard.tsx       # Display vehicle details
│       └── RecentLookups.tsx     # History list
└── lib/
    ├── rdw.ts                    # RDW API service
    └── validation.ts             # Plate validation
```

---

## Edge Cases

- Vehicle exists but has no catalog price → Show "Catalogusprijs onbekend"
- Very old vehicles (pre-RDW digitization) → May have incomplete data
- Temporary plates (e.g., export) → May not be in RDW
- Commercial vehicles → Show appropriate classification
- Multiple fuel types (hybrid) → Show both with primary first

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Works offline-first (shows cached data if available)
- [ ] API calls include proper error handling
- [ ] Mobile keyboard shows appropriate type (text)
- [ ] Screen reader announces lookup results
- [ ] No sensitive data logged to console
