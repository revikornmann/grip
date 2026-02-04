# Epic 00: Foundation

> **Component Constraint:** All UI must use Muka UI components. If a component doesn't exist, build it in muka-ui first. See [EPICS.md](./EPICS.md#component-dependency-workflow) for the workflow.

## Overview

**Goal:** Establish the core application shell, navigation, and shared infrastructure that all feature epics depend on.

**Phase:** 1 (MVP)
**Priority:** P0
**Dependencies:** None — this is the foundation

---

## User Stories

### US-00-001: App shell with responsive layout

**As a** user on any device,
**I want** the app to have a consistent layout that adapts to my screen size,
**So that** I can use the tool on desktop, tablet, or mobile.

**Acceptance criteria:**
- [ ] App has a header with logo/title and navigation
- [ ] Main content area with max-width constraint for readability
- [ ] Footer with links (privacy, about, feedback)
- [ ] Layout is responsive: single column on mobile, wider on desktop
- [ ] Navigation collapses to hamburger menu on mobile
- [ ] Minimum touch target size of 44x44px on mobile

**Muka UI components:** Card (layout container), Divider, Button (nav)

**Dependencies:** None

**Estimate:** 1 day

---

### US-00-002: Navigation between main sections

**As a** user,
**I want** to navigate between different sections of the app,
**So that** I can access the features I need.

**Acceptance criteria:**
- [ ] Navigation shows: Home, Garage, Calculator, Compare
- [ ] Current section is visually highlighted
- [ ] Navigation is accessible via keyboard (Tab, Enter)
- [ ] Route changes update browser URL for bookmarking/sharing
- [ ] Back/forward browser buttons work correctly

**Muka UI components:** Tabs (or custom nav), Button, Icon

**Dependencies:** US-00-001

**Estimate:** 0.5 day

---

### US-00-003: Home page with value proposition

**As a** first-time visitor,
**I want** to understand what the app does and how to get started,
**So that** I know if it's useful for me.

**Acceptance criteria:**
- [ ] Clear headline explaining the tool's purpose
- [ ] Brief explanation of key features (3-4 bullet points)
- [ ] Primary CTA: "Look up a vehicle" leading to license plate input
- [ ] Secondary CTA: "View my garage" (if vehicles exist)
- [ ] Works without JavaScript for initial render (SSR)

**Muka UI components:** Button, Card, Badge (for feature highlights)

**Dependencies:** US-00-001, US-00-002

**Estimate:** 0.5 day

---

### US-00-004: Local storage abstraction layer

**As a** developer,
**I want** a consistent API for storing and retrieving data locally,
**So that** all features use the same storage patterns and we can later migrate to cloud storage.

**Acceptance criteria:**
- [ ] TypeScript interface for storage operations (get, set, remove, clear)
- [ ] Handles JSON serialization/deserialization
- [ ] Graceful fallback if localStorage is unavailable (private browsing)
- [ ] Storage keys are namespaced to avoid conflicts
- [ ] Includes data versioning for future migrations
- [ ] Unit tests for all operations

**Muka UI components:** None (infrastructure)

**Dependencies:** None

**Estimate:** 0.5 day

---

### US-00-005: Error boundary and fallback UI

**As a** user,
**I want** the app to handle errors gracefully,
**So that** I don't see a broken page and can recover from issues.

**Acceptance criteria:**
- [ ] React Error Boundary catches component errors
- [ ] Fallback UI shows friendly error message
- [ ] "Try again" button resets the error state
- [ ] Errors are logged to console (and later to monitoring service)
- [ ] Critical errors show different messaging than minor ones

**Muka UI components:** Card, Button, Alert (#24 - to be built)

**Dependencies:** US-00-001

**Estimate:** 0.5 day

---

### US-00-006: Loading states and skeleton screens

**As a** user,
**I want** to see visual feedback when content is loading,
**So that** I know the app is working and not frozen.

**Acceptance criteria:**
- [ ] Skeleton components for Card, Input, Table row
- [ ] Skeleton matches approximate shape of loaded content
- [ ] Subtle animation to indicate loading (pulse or shimmer)
- [ ] Loading states accessible (aria-busy, aria-live)
- [ ] Can be composed for page-level loading states

**Muka UI components:** Skeleton (#29 - to be built or create local version)

**Dependencies:** US-00-001

**Estimate:** 1 day

---

### US-00-007: Theme support (light/dark)

**As a** user,
**I want** to use the app in light or dark mode,
**So that** it matches my system preference and is comfortable to view.

**Acceptance criteria:**
- [ ] App respects system preference (prefers-color-scheme)
- [ ] User can override system preference via toggle
- [ ] Preference persists in local storage
- [ ] Theme switch is instant with no flash of wrong theme
- [ ] All components render correctly in both themes

**Muka UI components:** Uses muka-ui theme CSS (muka-light.css, muka-dark.css)

**Dependencies:** US-00-004 (storage)

**Estimate:** 0.5 day

---

### US-00-008: Dutch language content

**As a** Dutch ZZP'er,
**I want** the app to be in Dutch,
**So that** I can understand all labels and instructions without translation.

**Acceptance criteria:**
- [ ] All UI text is in Dutch
- [ ] Numbers formatted with Dutch conventions (comma as decimal, period as thousands)
- [ ] Currency displayed as € with proper formatting
- [ ] Date formatting follows Dutch convention (DD-MM-YYYY)
- [ ] Tax terminology uses correct Dutch terms

**Muka UI components:** None (content only)

**Dependencies:** None

**Estimate:** 0.5 day (applied throughout development)

---

## Technical Notes

### Folder Structure
```
src/
├── app/                    # Next.js app router pages
│   ├── layout.tsx          # Root layout with theme provider
│   ├── page.tsx            # Home page
│   ├── garage/
│   ├── calculator/
│   └── compare/
├── components/             # App-specific components
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Navigation.tsx
│   └── ui/
│       ├── ErrorBoundary.tsx
│       └── Skeleton.tsx
├── lib/                    # Utilities and services
│   ├── storage.ts          # Local storage abstraction
│   └── formatting.ts       # Dutch number/date formatting
└── types/                  # TypeScript type definitions
```

### Key Decisions
- Use Next.js App Router for routing
- Local storage for MVP (no authentication)
- Dutch as primary language (no i18n framework needed for MVP)
- muka-ui for component library

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Works on latest Chrome, Firefox, Safari, Edge
- [ ] Mobile responsive (tested at 375px width)
- [ ] Keyboard accessible
- [ ] No console errors
- [ ] TypeScript strict mode passes
