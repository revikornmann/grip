# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

---

## Critical Architectural Constraint: Muka UI Only

**This app is a proof-of-concept for the Muka UI design system. ALL UI components must come from muka-ui — no exceptions.**

### What this means

- Import components exclusively from `'muka-ui'`
- Use Muka UI CSS custom properties (tokens) for any layout or spacing
- Check [storybook.mukaui.com](https://storybook.mukaui.com) for available components
- If a component doesn't exist in Muka UI, it must be built there first

### Prohibited approaches

- **No Tailwind CSS** — not installed, don't add it
- **No CSS modules** — don't create `*.module.css` files
- **No styled-components** — don't install or use
- **No inline styles** — except for layout (flexbox, grid) using token values
- **No ad-hoc components** — don't create UI components in this repo

### When a needed component doesn't exist

1. **Stop** — the feature is blocked
2. **Create a story** in the muka-ui backlog for the missing component
3. **Build the component** in `/Users/revikornmann/dev/muka`
4. **Verify** it appears in Storybook at localhost:6006
5. **Rebuild muka-ui** with `npm run build`
6. **Continue** with the Grip feature

### Acceptable styling patterns

```tsx
// GOOD: Import components from muka-ui
import { Button, Card, Input } from 'muka-ui';

// GOOD: Use token values for layout
<div style={{
  display: 'flex',
  gap: 'var(--spacing-4)',
  padding: 'var(--spacing-6)'
}}>

// GOOD: Use semantic color tokens
<p style={{ color: 'var(--color-text-subtle-default)' }}>

// BAD: Don't create custom components
// BAD: Don't use Tailwind classes
// BAD: Don't use CSS modules
// BAD: Don't use arbitrary color values
```

---

## Project Overview

Grip is a vehicle tax optimization tool for Dutch ZZP'ers (self-employed professionals). It helps calculate and compare tax efficiency across private vs business vehicle ownership.

> **Product Specification:** For the full product specification — including data model, ownership types, calculation formulas, tax constants, and screen architecture — read `docs/PRODUCT_BRIEF.md`. This is the single source of truth for E04 and E05.

### Key features (planned)

- Onboarding flow to capture user profile (income, BTW status, province)
- License plate lookup via RDW API (complete)
- Vehicle garage with Supabase persistence (complete)
- Scenario model: five ownership types per vehicle
  (private_owned / private_lease / financial_lease / operational_lease / business_owned)
- Per-scenario cost calculation with full Dutch tax logic
  (bijtelling, BTW aftrek, km deduction, afschrijving, cost deductibility)
- Youngtimer detection with 2027 threshold change warning
- Side-by-side scenario comparison
- Kilometer tracking (Phase 2)

---

## Build & Development Commands

```bash
npm run dev      # Start Next.js dev server (webpack mode)
npm run build    # Production build
npm run lint     # ESLint check
```

### Working with muka-ui

Both projects should be running during development:

```bash
# Terminal 1: Muka UI Storybook
cd /Users/revikornmann/dev/muka
npm run dev

# Terminal 2: Grip
cd /Users/revikornmann/dev/grip
npm run dev
```

After changes to muka-ui:
```bash
cd /Users/revikornmann/dev/muka
npm run build
```

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── auth/               # Google OAuth (complete)
│   ├── onboarding/         # NEW: Profile setup flow (Sprint 1)
│   ├── lookup/             # License plate lookup (complete)
│   ├── garage/             # Vehicle garage (complete)
│   ├── scenarios/          # NEW: Scenario list = home screen (Sprint 2-3)
│   │   ├── new/            # Add scenario flow
│   │   └── [id]/           # Scenario detail + edit
│   ├── compare/            # Side-by-side comparison (Sprint 7)
│   └── settings/           # NEW: Profile edit + sign out
├── components/             # App-specific NON-UI components only
├── lib/
│   ├── rdw.ts              # RDW API client (complete)
│   ├── storage.ts          # localStorage abstraction (complete)
│   ├── calculator.ts       # REWRITE REQUIRED — see PRODUCT_BRIEF.md §4
│   ├── tax-constants.ts    # NEW: 2026 tax constants extracted here
│   ├── bijtelling.ts       # NEW: Bijtelling + youngtimer logic
│   └── validation.ts       # Input validation
└── types/
    ├── garage.ts           # GarageVehicle (add dagwaarde field)
    ├── scenario.ts         # NEW: Scenario + all OwnershipType input shapes
    └── profile.ts          # NEW: UserProfile type
```

---

## Available Muka UI Components

Muka UI is linked to this project via `npm link` for local development. Check the running Storybook at `http://localhost:6006` to verify current component availability.

Current (check Storybook for latest):
- `Alert` — info, success, warning, error variants
- `Badge` — status indicators
- `BottomBar` — mobile navigation bar
- `Button` — primary, secondary, ghost variants; sm/md/lg sizes
- `Card` — content container
- `Checkbox` — checkbox input
- `CheckboxTile` — checkbox with tile styling
- `Chip` — compact interactive element
- `Container` — layout container
- `DatePicker` — date selection
- `Dialog` — modal dialog
- `Divider` — visual separator
- `FormProgressBar` — multi-step form progress
- `Icon` — icon wrapper
- `Input` — text input with label, helper text, error states
- `Label` — form labels
- `ListItem` — list items
- `PriceTag` — price display component
- `Progress` — progress indicator
- `Radio` — radio input
- `RadioTile` — radio with tile styling
- `Section` — content section
- `SegmentGroup` — segmented control
- `Select` — dropdown select
- `Sheet` — bottom sheet overlay
- `Table` — data table
- `Tabs`, `TabList`, `Tab`, `TabPanel` — tabbed interface
- `Tile` — clickable tile
- `Toast` — notification toast
- `Toggle` — toggle switch
- `TopBar` — top navigation bar

Needed but not yet built:
- Skeleton
- Tooltip
- Empty State

---

## Dutch Tax Terminology

| Term | Description |
|------|-------------|
| Bijtelling | Taxable benefit added to income for private use of a company car. % of cataloguswaarde (22% standard, 16% PHEV, 18% EV in 2026). Applied when private use exceeds 500km/year. |
| Youngtimer bijtelling | 35% over dagwaarde (market value) for cars 15+ years old. Threshold changes to 25+ years from 1 Jan 2027. No transition period. |
| BTW aftrek | VAT recovery on business vehicle costs, proportional to business use. Only for BTW-plichtig users with ≥10% business use. |
| Kostenaftrek | All business vehicle costs reduce taxable profit. Tax saving = cost × marginal tax rate. |
| Km-vergoeding | €0.23/km deduction for business use of a privately owned or leased vehicle. |
| Afschrijving | Depreciation on business-owned vehicles. Minimum 5 years, minimum residual value 10% of purchase price (fiscal floor). |
| Operational lease | Fixed monthly rental including maintenance and all-risk insurance. Full lease cost deductible. No afschrijving. Bijtelling still applies. |
| Financial lease | Bank-financed, car on ZZP'er's balance sheet. Same tax treatment as business_owned. Full monthly payment deductible (or interest-only if rate provided). |
| Cataloguswaarde | Official list price at first registration, including BPM and VAT. Used for standard bijtelling calculation. |
| Dagwaarde | Current market value. Used only for youngtimer bijtelling calculation. |
| Belastingschijf | Income tax bracket. 2026: 35.75% (≤€38.883) / 37.56% (≤€78.426) / 49.50% (>€78.426). |
| MRB | Road tax (motorrijtuigenbelasting). Based on province, fuel type, and vehicle weight. |

---

## Documentation

- `/docs/backlog/EPICS.md` — Product backlog overview
- `/docs/backlog/epic-*.md` — Individual epic files with user stories
- `/DEVELOPMENT.md` — Development setup and workflow
