# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

---

## Critical Architectural Constraint: Muka UI Only

**This app is a proof-of-concept for the Muka UI design system. ALL UI components must come from Muka UI — no exceptions.**

Muka UI is consumed as the scoped package **`@revikornmann/muka-ui`** — published to the public npm registry and pinned in `package.json` as a semver range (e.g. `^0.2.4`). CI auto-bumps it on each Muka UI **release** (see `package.json` and `.github/workflows/update-muka.yml`). The bare `muka-ui` name on npm is an unrelated package; never use it.

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
4. **Merge to `main`** — this alone does **not** propagate to Grip. Merging only lands the code on muka's main branch
5. **Cut a release** — bump the version in muka's `package.json`, then publish a GitHub Release (tag `vX.Y.Z`). `publish.yml` builds `dist/` fresh, publishes to npm, and dispatches `muka-released` to this repo
6. **Auto-bump** — the `update-muka` workflow installs the new published version and commits the lockfile here, which redeploys via Vercel (no manual step). To pull it immediately, run the `Update muka-ui` workflow manually (Actions → Run workflow)
7. **Continue** with the Grip feature

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

Muka UI is published to the public npm registry and pinned here as a semver range. Propagation happens **per release** (not per merge to muka main):

```text
muka: bump version + publish GitHub Release → publish.yml builds dist/, publishes to npm, dispatches `muka-released`
grip: update-muka workflow installs the new version → commits package.json + package-lock.json → Vercel deploys
```

`package.json` pins `@revikornmann/muka-ui` to a semver range (e.g. `^0.2.4`); the exact resolved version lives in the committed `package-lock.json`, which the workflow advances. This keeps Vercel's `npm ci` reproducible. **Merging to muka `main` is not enough — a new release must be cut for changes to reach Grip.**

- **Pull a muka change now:** first confirm a release was published (merging to muka main alone won't propagate), then Actions → "Update muka-ui" → Run workflow (installs `@latest`).
- **Local dev against an unreleased component:** `npm link` a local muka checkout temporarily — but never commit a `link:`/`file:` spec; the committed dependency must stay a real published `@revikornmann/muka-ui@x.y.z` range so clean installs (CI / Vercel) succeed.
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

Muka UI is consumed via the published `@revikornmann/muka-ui` npm package (semver-pinned). Check the Storybook at `http://localhost:6006` (or [storybook.mukaui.com](https://storybook.mukaui.com)) to verify current component availability.

Mobile P0 components landed for this pivot: `Sheet`, `Spinner`, `SpecList`, `FAB`, `ActionSheet`, `SearchInput`, `Combobox`, `SwipeActions`, `PullToRefresh`, plus a 6-piece chat family.

Earlier components: `Alert`, `Badge`, `BottomBar`, `Button`, `Card`, `Checkbox`, `CheckboxTile`, `Chip`, `Container`, `DatePicker`, `Dialog`, `Divider`, `Icon`, `Input`, `Label`, `ListItem`, `PriceTag`, `Progress`, `ProgressTracker`, `Radio`, `RadioTile`, `Section`, `SegmentGroup`, `Select`, `Table`, `Tabs/TabList/Tab/TabPanel`, `Tile`, `Toast`, `Toggle`, `TopBar`.

Still needed: Skeleton, Tooltip, Empty State.
