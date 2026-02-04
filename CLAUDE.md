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
6. **Continue** with the tax-calculator feature

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

Tax Calculator is a vehicle tax optimization tool for Dutch ZZP'ers (self-employed professionals). It helps calculate and compare tax efficiency across private vs business vehicle ownership.

### Key features (planned)

1. License plate lookup via RDW API
2. Vehicle garage (local storage)
3. Cost calculator with Dutch tax rules
4. Private vs business ownership comparison
5. Kilometer tracking (Phase 2)

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

# Terminal 2: Tax Calculator
cd /Users/revikornmann/dev/tax-calculator
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
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (imports muka-ui styles)
│   ├── page.tsx            # Home page
│   ├── lookup/             # License plate lookup
│   ├── garage/             # Vehicle garage
│   ├── calculator/         # Cost calculator
│   └── compare/            # Ownership comparison
├── components/             # App-specific NON-UI components only
│   └── (providers, context, layouts - NOT buttons, cards, etc.)
├── lib/                    # Utilities and services
│   ├── rdw.ts              # RDW API client
│   ├── storage.ts          # Local storage abstraction
│   ├── calculator.ts       # Cost calculations
│   └── validation.ts       # Input validation
└── types/                  # TypeScript definitions
```

---

## Available Muka UI Components

Current (check Storybook for latest):
- `Button` — primary, secondary, ghost variants; sm/md/lg sizes
- `Input` — text input with label, helper text, error states
- `Card` — content container
- `Badge` — status indicators
- `Label` — form labels
- `Icon` — icon wrapper
- `Divider` — visual separator
- `Select` — dropdown select
- `Tabs`, `TabList`, `Tab`, `TabPanel` — tabbed interface
- `ListItem` — list items

Needed but not yet built:
- Modal/Dialog
- Alert/Toast
- Table
- Loading/Spinner
- Skeleton
- Tooltip
- Progress
- Empty State

---

## Dutch Tax Terminology

| Term | Description |
|------|-------------|
| Bijtelling | Taxable benefit for private use of company car |
| BTW aftrek | VAT deduction on business vehicle costs |
| MIA/VAMIL | Environmental investment deductions |
| Youngtimer | 15+ year old vehicles with reduced bijtelling |
| Cataloguswaarde | Official catalog price for bijtelling calculation |

---

## Documentation

- `/docs/backlog/EPICS.md` — Product backlog overview
- `/docs/backlog/epic-*.md` — Individual epic files with user stories
- `/DEVELOPMENT.md` — Development setup and workflow
