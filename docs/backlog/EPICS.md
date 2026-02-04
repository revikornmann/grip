# Product Backlog — Tax Calculator

A vehicle tax optimization tool for Dutch ZZP'ers (self-employed professionals).

## Vision

Help Dutch ZZP'ers make informed decisions about vehicle ownership by calculating and comparing tax efficiency across private and business ownership scenarios.

## Target User

**Primary Persona:** Dutch ZZP'er evaluating whether to purchase a vehicle privately or through their business (eenmanszaak or BV).

They need to understand:
- Total cost of ownership under different scenarios
- Tax implications (bijtelling, BTW aftrek, MIA/VAMIL)
- Compliance requirements (kilometer administration)

---

## Epic Overview

| Epic | Name | Phase | Priority | Status |
|------|------|-------|----------|--------|
| 00 | [Foundation](./epic-00-foundation.md) | 1 | P0 | Not Started |
| 01 | [License Plate Lookup](./epic-01-license-plate-lookup.md) | 1 | P0 | Not Started |
| 02 | [Vehicle Garage](./epic-02-vehicle-garage.md) | 1 | P1 | Not Started |
| 03 | [Cost Calculator](./epic-03-cost-calculator.md) | 1 | P1 | Not Started |
| 04 | [Ownership Comparison](./epic-04-ownership-comparison.md) | 1 | P2 | Not Started |
| 05 | [Kilometer Tracking](./epic-05-kilometer-tracking.md) | 2 | P3 | Not Started |

### Priority Legend
- **P0** — Must have for MVP launch
- **P1** — Core feature, high value
- **P2** — Important but can ship without
- **P3** — Future enhancement (Phase 2)

---

## Dependency Graph

```
┌─────────────────┐
│  E00: Foundation │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ E01: License    │
│ Plate Lookup    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ E02: Vehicle    │◄──────────────────┐
│ Garage          │                   │
└────────┬────────┘                   │
         │                            │
         ▼                            │
┌─────────────────┐                   │
│ E03: Cost       │                   │
│ Calculator      │                   │
└────────┬────────┘                   │
         │                            │
         ▼                            │
┌─────────────────┐                   │
│ E04: Ownership  │                   │
│ Comparison      │                   │
└────────┬────────┘                   │
         │                            │
         ▼                            │
┌─────────────────┐                   │
│ E05: Kilometer  │───────────────────┘
│ Tracking        │ (uses garage data)
└─────────────────┘
```

---

## Key Dutch Tax Concepts

For reference when writing stories:

| Term | Dutch | Description |
|------|-------|-------------|
| Bijtelling | Bijtelling | Taxable benefit added to income for private use of a company car. Percentage of catalog value (22% standard, 16% for low-emission, 4% for EV as of 2024) |
| VAT Deduction | BTW aftrek | Businesses can reclaim VAT on vehicle purchase and running costs (proportional to business use) |
| MIA/VAMIL | MIA/VAMIL | Environmental investment deductions for electric/low-emission vehicles |
| Youngtimer | Youngtimer | Vehicles 15+ years old qualify for reduced bijtelling (35% of normal rate) |
| Km Admin | Rittenadministratie | Required kilometer log proving >500km private use to avoid full bijtelling |
| Catalog Value | Cataloguswaarde | Official list price including BPM and VAT at time of first registration |

---

## Component Dependency Workflow

> **Architectural Constraint:** All UI components must come from Muka UI. No exceptions.
> This app is a proof-of-concept that drives design system development.

### Available Components (use these)

| Component | Variants/Features |
|-----------|-------------------|
| `Button` | primary, secondary, ghost; sm/md/lg |
| `Input` | label, helper text, error state |
| `Card` | content container |
| `Badge` | info, success, warning, error |
| `Label` | form labels |
| `Icon` | icon wrapper |
| `Divider` | horizontal separator |
| `Select` | dropdown with options |
| `Tabs` | TabList, Tab, TabPanel |
| `ListItem` | list items |

### Needed Components (must build in muka-ui first)

| Component | Roadmap # | Blocking Stories |
|-----------|-----------|------------------|
| Modal/Dialog | #15 | US-02-002, US-02-004, US-02-005 |
| Alert/Toast | #24 | US-01-004, US-01-005, US-04-11 |
| Table | #12 | US-03-001, US-04-002 |
| Loading/Spinner | #27 | US-01-001 |
| Skeleton | #29 | US-00-006 |
| Tooltip | #18 | US-04-009 |
| Progress | #28 | US-05-006 |
| Empty State | #30 | US-02-001 |
| DatePicker | #21 | US-05-001 |

### Workflow When Component is Missing

```
┌─────────────────────────────────────────────────────────┐
│  Story requires component that doesn't exist in Muka UI │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  1. STOP - Story is BLOCKED                             │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  2. Create component story in muka-ui backlog           │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  3. Build component in /Users/revikornmann/dev/muka     │
│     - Create component files                            │
│     - Add Storybook stories                             │
│     - Test all themes (light/dark, muka/wireframe)      │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  4. Run `npm run build` in muka directory               │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  5. Resume tax-calculator story                         │
└─────────────────────────────────────────────────────────┘
```

### Check Component Availability

- **Production Storybook:** [storybook.mukaui.com](https://storybook.mukaui.com)
- **Local Storybook:** http://localhost:6006 (run `npm run dev` in muka)

---

## Phase 1 MVP Scope

The MVP allows a user to:
1. Look up a vehicle by license plate
2. Save vehicles to a personal garage (local storage)
3. Enter cost assumptions (fuel, insurance, maintenance)
4. See total annual cost calculated
5. Compare private vs business ownership for a vehicle

**Out of scope for MVP:**
- User accounts / authentication
- Cloud sync
- Kilometer tracking
- Calendar integration
- Export functionality

---

## Technical Notes

- **Data source:** RDW Open Data API for vehicle data
- **Storage:** Local storage for MVP (no backend required)
- **Calculations:** Client-side JavaScript
- **Design system:** muka-ui (npm linked for development)
