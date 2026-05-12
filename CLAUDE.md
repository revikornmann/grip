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
3. **Build the component** in `/Users/revikornmann/conductor/workspaces/muka-ui/florence`
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

Grip is a cross-platform motorcycle app — garage management, maintenance log, and AI mechanic chat. The codebase is a Next.js web app wrapped with Capacitor to ship to iOS, Android, and web from a single source.

### Planned features

- Motorcycle garage (add, edit, photo, mileage, archive)
- Service log: maintenance entries with cost, shop, notes
- Maintenance invoice upload + OCR/extraction
- AI mechanic chat threaded per motorcycle
- License-plate lookup via RDW (carry-over from previous product; needs motorcycle dataset)

### Legacy

The previous incarnation of this repo was a Dutch ZZP vehicle-tax-optimization tool. That code is preserved at the git tag `legacy/tax-tool-v1` and has been deleted from `main`.

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
cd /Users/revikornmann/conductor/workspaces/muka-ui/florence
npm run dev

# Terminal 2: Grip
cd /Users/revikornmann/conductor/workspaces/grip/delhi
npm run dev
```

After changes to muka-ui:
```bash
cd /Users/revikornmann/conductor/workspaces/muka-ui/florence
npm run build
```

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── auth/               # Supabase Google OAuth
│   ├── lookup/             # License plate lookup (RDW — needs motorcycle dataset)
│   └── garage/             # Motorcycle garage
├── components/             # App-specific NON-UI components only
├── lib/
│   ├── rdw.ts              # RDW API client
│   ├── storage.ts          # localStorage abstraction (web fallback)
│   ├── supabase.ts         # Supabase browser client
│   ├── auth.ts             # useRequireAuth hook
│   ├── garage.ts           # CRUD against Supabase
│   ├── formatting.ts       # currency/number/date helpers
│   ├── theme.ts            # theme tokens
│   └── validation.ts       # input validation
└── types/
    ├── garage.ts
    ├── vehicle.ts
    ├── auth.ts
    ├── database.ts
    └── storage.ts
```

---

## Available Muka UI Components

Muka UI is linked to this project via `npm link` for local development. Check the running Storybook at `http://localhost:6006` to verify current component availability.

Mobile P0 components landed for this pivot: `Sheet`, `Spinner`, `SpecList`, `FAB`, `ActionSheet`, `SearchInput`, `Combobox`, `SwipeActions`, `PullToRefresh`, plus a 6-piece chat family.

Earlier components: `Alert`, `Badge`, `BottomBar`, `Button`, `Card`, `Checkbox`, `CheckboxTile`, `Chip`, `Container`, `DatePicker`, `Dialog`, `Divider`, `FormProgressBar`, `Icon`, `Input`, `Label`, `ListItem`, `PriceTag`, `Progress`, `Radio`, `RadioTile`, `Section`, `SegmentGroup`, `Select`, `Table`, `Tabs/TabList/Tab/TabPanel`, `Tile`, `Toast`, `Toggle`, `TopBar`.

Still needed: Skeleton, Tooltip, Empty State.
