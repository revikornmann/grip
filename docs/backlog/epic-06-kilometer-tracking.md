# Epic 06: Kilometer Tracking

> **Component Constraint:** All UI must use Muka UI components. If a component doesn't exist, build it in muka-ui first. See [EPICS.md](./EPICS.md#component-dependency-workflow) for the workflow.

## Overview

**Goal:** Provide AI-assisted kilometer administration to help ZZP'ers maintain compliant records for tax purposes, with calendar integration to estimate business vs private usage.

**Phase:** 2 (Post-MVP)
**Priority:** P3
**Dependencies:** Epic 02 (Vehicle Garage), Epic 04 (Cost Calculator)

---

## Why Kilometer Tracking Matters

For business vehicle owners, the Dutch tax authority (Belastingdienst) requires:

1. **Rittenadministratie** — A log of all trips to prove business vs private use
2. **500 km rule** — If private use exceeds 500 km/year, full bijtelling applies
3. **Verklaring geen privégebruik** — Declaration that vehicle is only for business use

Without proper records, the tax authority may deny bijtelling benefits or assess penalties.

---

## Core Features

1. **Trip Logging** — Record trips with date, distance, purpose
2. **Calendar Integration** — Import calendar events to suggest business trips
3. **AI Categorization** — Automatically classify trips as business/private
4. **Compliance Dashboard** — Track progress toward 500 km private limit
5. **Export for Accountant** — Generate reports suitable for tax filing

---

## User Stories

### US-06-001: Manual trip entry

**As a** business vehicle owner,
**I want to** log individual trips,
**So that** I have accurate records for tax compliance.

**Acceptance criteria:**
- [ ] Quick-add form for new trip
- [ ] Fields: Date, Start location, End location, Distance (km), Purpose
- [ ] Purpose dropdown: Klantbezoek, Vergadering, Inkoop, Privé, etc.
- [ ] Auto-calculate distance from locations (optional)
- [ ] Odometer reading option (start/end km)
- [ ] Save trip to local storage

**Muka UI components:** Input, Select, Button, Card, DatePicker (#21)

**Dependencies:** Epic 02

**Estimate:** 2 days

---

### US-06-002: View trip history

**As a** user,
**I want to** see all my logged trips,
**So that** I can review and verify my records.

**Acceptance criteria:**
- [ ] List view of all trips, newest first
- [ ] Filter by: Month, Business/Private, Purpose
- [ ] Search by location or notes
- [ ] Shows running total: km this month/year
- [ ] Color-coded: green (business), orange (private)
- [ ] Pagination for large lists

**Muka UI components:** ListItem, Select (filters), Input (search), Badge

**Dependencies:** US-06-001

**Estimate:** 1 day

---

### US-06-003: Edit and delete trips

**As a** user,
**I want to** correct mistakes in logged trips,
**So that** my records are accurate.

**Acceptance criteria:**
- [ ] Edit button on each trip
- [ ] Same form as add, pre-filled with current values
- [ ] Delete option with confirmation
- [ ] Audit trail: "Gewijzigd op [date]" notation
- [ ] Batch delete option for multiple trips

**Muka UI components:** Button, Modal (#15)

**Dependencies:** US-06-002

**Estimate:** 0.5 day

---

### US-06-004: Connect Google Calendar

**As a** user with appointments in Google Calendar,
**I want to** import calendar events as potential trips,
**So that** I don't have to manually enter every business meeting.

**Acceptance criteria:**
- [ ] OAuth flow to connect Google account
- [ ] Select which calendars to sync
- [ ] Import events with location as potential trips
- [ ] Events appear as "suggested trips" to confirm
- [ ] One-click to add suggested trip to log
- [ ] Can disconnect calendar at any time

**Muka UI components:** Button, Card, ListItem, Badge ("Suggestie")

**Dependencies:** US-06-001

**Estimate:** 3 days

---

### US-06-005: AI trip categorization

**As a** user,
**I want** trips automatically categorized as business or private,
**So that** I spend less time on admin.

**Acceptance criteria:**
- [ ] Analyzes trip details (location, time, calendar event)
- [ ] Suggests: Business (high confidence), Private, Onzeker
- [ ] Learn from user corrections over time
- [ ] Shows reasoning: "Klantadres herkend" or "Weekendrit"
- [ ] User can always override suggestion
- [ ] Privacy: processing happens locally or with consent

**Muka UI components:** Badge (confidence), Button (confirm/change)

**Dependencies:** US-06-004

**Estimate:** 3 days

---

### US-06-006: Track business vs private ratio

**As a** user,
**I want to** see my business/private kilometer split,
**So that** I know my current tax situation.

**Acceptance criteria:**
- [ ] Dashboard widget showing: Business km, Private km, Total km
- [ ] Percentage split visualization (pie or bar)
- [ ] Year-to-date and monthly views
- [ ] Compare to expected annual km
- [ ] Show trend over recent months

**Muka UI components:** Card, Progress (#28), Chart (if available)

**Dependencies:** US-06-001

**Estimate:** 1 day

---

### US-06-007: 500 km private use warning

**As a** business vehicle owner,
**I want to** be warned when approaching the 500 km private limit,
**So that** I can adjust my behavior or plan for bijtelling.

**Acceptance criteria:**
- [ ] Alert when private km reaches 400 (80% of limit)
- [ ] Prominent warning at 500 km
- [ ] Explain implications: full bijtelling applies
- [ ] Suggest options: use personal vehicle for private trips
- [ ] Can dismiss warning (with confirmation of understanding)

**Muka UI components:** Alert (#24), Badge, Card

**Dependencies:** US-06-006

**Estimate:** 0.5 day

---

### US-06-008: Monthly summary report

**As a** user,
**I want** a monthly summary of my kilometers,
**So that** I can review and prepare for tax filing.

**Acceptance criteria:**
- [ ] Auto-generated at month end
- [ ] Shows: Total km, Business km, Private km, Trip count
- [ ] List of all trips in the month
- [ ] Highlight any incomplete or unverified trips
- [ ] Option to "lock" month (no further edits)

**Muka UI components:** Card, Table (#12), Button

**Dependencies:** US-06-002

**Estimate:** 1 day

---

### US-06-009: Export kilometer log

**As a** user filing taxes,
**I want to** export my kilometer administration,
**So that** I can provide it to my accountant or the Belastingdienst.

**Acceptance criteria:**
- [ ] Export as PDF (formal report format)
- [ ] Export as CSV/Excel (for accountant)
- [ ] Include: Vehicle info, period, all trips, totals
- [ ] Signed declaration: "Ik verklaar dat deze administratie juist is"
- [ ] Date range selector for export period

**Muka UI components:** Button, Select (format), Modal (#15)

**Dependencies:** US-06-002

**Estimate:** 1.5 days

---

### US-06-010: Recurring trips

**As a** user with regular commutes,
**I want to** set up recurring trips,
**So that** I don't have to log the same trip daily.

**Acceptance criteria:**
- [ ] "Maak terugkerend" option on a trip
- [ ] Frequency: Dagelijks (werkdagen), Wekelijks, Maandelijks
- [ ] Auto-generate trips based on schedule
- [ ] Can skip or edit individual occurrences
- [ ] End date or "tot nader order"

**Muka UI components:** Select, Input, DatePicker (#21)

**Dependencies:** US-06-001

**Estimate:** 1.5 days

---

### US-06-011: Multiple vehicles tracking

**As a** user with multiple business vehicles,
**I want to** track kilometers per vehicle,
**So that** each vehicle has its own compliant record.

**Acceptance criteria:**
- [ ] Select vehicle when logging trip
- [ ] Filter trip history by vehicle
- [ ] Separate dashboards per vehicle
- [ ] Combined view for all vehicles
- [ ] Export per vehicle or combined

**Muka UI components:** Select (vehicle), Tabs

**Dependencies:** US-06-001, Epic 02

**Estimate:** 1 day

---

## Technical Notes

### Data Model
```typescript
interface Trip {
  id: string;
  vehicleId: string;
  date: string;                    // ISO date
  startLocation: string;
  endLocation: string;
  distanceKm: number;
  purpose: TripPurpose;
  category: 'business' | 'private';
  confidence: 'high' | 'medium' | 'low';
  calendarEventId?: string;        // If from calendar sync
  odometerStart?: number;
  odometerEnd?: number;
  notes?: string;
  verified: boolean;               // User confirmed categorization
  createdAt: string;
  updatedAt: string;
}

type TripPurpose =
  | 'klantbezoek'
  | 'vergadering'
  | 'inkoop'
  | 'levering'
  | 'opleiding'
  | 'netwerken'
  | 'woon-werk'                    // Counted as private!
  | 'prive'
  | 'overig';
```

### Calendar Integration
```typescript
// Using Google Calendar API
interface CalendarEvent {
  id: string;
  summary: string;
  location?: string;
  start: { dateTime: string };
  end: { dateTime: string };
}

function importCalendarEvents(
  startDate: Date,
  endDate: Date
): Promise<CalendarEvent[]>

function suggestTripFromEvent(
  event: CalendarEvent,
  previousTrips: Trip[]
): SuggestedTrip
```

### AI Categorization
```typescript
interface CategorizationResult {
  category: 'business' | 'private';
  confidence: number;              // 0-1
  reasoning: string[];             // Explanation points
}

function categorizeTrip(
  trip: Partial<Trip>,
  context: {
    previousTrips: Trip[];
    knownBusinessLocations: string[];
    calendarEvent?: CalendarEvent;
  }
): CategorizationResult
```

### Component Structure
```
src/
├── app/
│   └── tracking/
│       ├── page.tsx              # Dashboard
│       ├── trips/
│       │   └── page.tsx          # Trip list
│       └── reports/
│           └── page.tsx          # Monthly reports
├── components/
│   └── tracking/
│       ├── TripForm.tsx
│       ├── TripList.tsx
│       ├── KilometerDashboard.tsx
│       ├── CalendarSync.tsx
│       └── ExportOptions.tsx
└── lib/
    ├── trips.ts                  # Trip CRUD operations
    ├── calendar.ts               # Google Calendar integration
    └── categorization.ts         # AI categorization logic
```

---

## Privacy Considerations

- Calendar access requires explicit OAuth consent
- Trip data stored locally by default
- Cloud sync is opt-in with clear data policy
- AI categorization can run locally (no server required)
- Export includes only what user chooses to share

---

## Future Enhancements (Beyond Phase 2)

- GPS tracking integration (with consent)
- Fuel receipt scanning with OCR
- Integration with accounting software (Exact, Moneybird)
- Multi-user access for family/company vehicles
- Apple Calendar and Outlook integration

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Calendar OAuth flow works end-to-end
- [ ] AI categorization accuracy > 80% in testing
- [ ] Export formats validated with accountant
- [ ] Mobile-friendly trip entry
- [ ] Data persists across sessions
- [ ] Privacy policy updated and accessible
