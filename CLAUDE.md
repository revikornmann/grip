# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

---

## Critical Architectural Constraint: Muka UI Only

**This app is a proof-of-concept for the Muka UI design system. ALL UI components must come from Muka UI — no exceptions.**

Muka UI is consumed as the published, scoped package **`@revikornmann/muka-ui`** (a pinned GitHub dependency — see `package.json`). The bare `muka-ui` name on npm is an unrelated package; never use it.

### What this means

- Import components exclusively from `'@revikornmann/muka-ui'`
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
2. **Create a story** in the Muka UI backlog (Linear team Muka UI) for the missing component
3. **Build the component** in the muka repo (`github.com/revikornmann/muka`) and verify it in Storybook
4. **Merge to `main`** — CI builds and commits `dist/` on push (see Linear MUK-41)
5. **Bump the pinned ref** of `@revikornmann/muka-ui` in this repo's `package.json` to the new commit, then `npm install`
6. **Continue** with the Grip feature

### Acceptable styling patterns

```tsx
// GOOD: Import components from Muka UI
import { Button, Card, Input } from '@revikornmann/muka-ui';

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

### Working with Muka UI

Muka UI is consumed as the pinned GitHub dependency `@revikornmann/muka-ui` (committed `dist/`, no build step at install). To pick up changes made in the muka repo:

```bash
# 1. Merge the change to muka's main (CI commits dist/ — see Linear MUK-41)
# 2. In this repo, bump the pinned commit in package.json, then:
npm install
npm run dev
```

To develop a Muka UI component against Grip locally before it lands, use `npm link` against a local muka checkout temporarily — but the committed dependency must always point at a real `github:revikornmann/muka#<commit>` ref so clean installs (CI / Vercel) succeed.

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

Muka UI is consumed via the pinned `@revikornmann/muka-ui` GitHub dependency. Check the Storybook at `http://localhost:6006` (or [storybook.mukaui.com](https://storybook.mukaui.com)) to verify current component availability.

Mobile P0 components landed for this pivot: `Sheet`, `Spinner`, `SpecList`, `FAB`, `ActionSheet`, `SearchInput`, `Combobox`, `SwipeActions`, `PullToRefresh`, plus a 6-piece chat family.

Earlier components: `Alert`, `Badge`, `BottomBar`, `Button`, `Card`, `Checkbox`, `CheckboxTile`, `Chip`, `Container`, `DatePicker`, `Dialog`, `Divider`, `FormProgressBar`, `Icon`, `Input`, `Label`, `ListItem`, `PriceTag`, `Progress`, `Radio`, `RadioTile`, `Section`, `SegmentGroup`, `Select`, `Table`, `Tabs/TabList/Tab/TabPanel`, `Tile`, `Toast`, `Toggle`, `TopBar`.

Still needed: Skeleton, Tooltip, Empty State.
