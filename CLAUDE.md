# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

---

## Critical Architectural Constraint: Muka UI Only

**This app is a proof-of-concept for the Muka UI design system. ALL UI components must come from Muka UI — no exceptions.**

Muka UI is consumed as the scoped package **`@revikornmann/muka-ui`** — a GitHub dependency tracking `#main` and auto-bumped by CI (see `package.json` and `.github/workflows/update-muka.yml`). The bare `muka-ui` name on npm is an unrelated package; never use it.

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
4. **Merge to `main`** — CI builds and commits `dist/` on push (see Linear MUK-41), then dispatches `muka-released` to this repo
5. **Auto-bump** — the `update-muka` workflow re-resolves `#main` and commits the new lockfile here, which redeploys via Vercel (no manual step). To pull it immediately, run the `Update muka-ui` workflow manually (Actions → Run workflow)
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

Muka UI is consumed as the GitHub dependency `@revikornmann/muka-ui` tracking `#main` (committed `dist/`, no build step at install). Propagation is automatic:

```text
muka main: merge → CI commits dist/ → dispatches `muka-released`
grip:      update-muka workflow re-resolves #main → commits new package-lock.json → Vercel deploys
```

`package.json` points at `github:revikornmann/muka#main`; the exact resolved SHA lives in the committed `package-lock.json`, which the workflow advances. This keeps Vercel's `npm ci` reproducible while still following main.

- **Pull a muka change now (don't wait for the next release):** Actions → "Update muka-ui" → Run workflow.
- **Local dev against an unlanded component:** `npm link` a local muka checkout temporarily — but never commit a `link:`/`file:` spec; the committed dependency must stay a real `github:revikornmann/muka#…` ref so clean installs (CI / Vercel) succeed.
- **Setup note:** cross-repo dispatch requires the `CONSUMER_DISPATCH_TOKEN` PAT secret in the muka repo (Contents: write on this repo).

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
