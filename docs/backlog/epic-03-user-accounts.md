# Epic 03: User Accounts

> **Component Constraint:** All UI must use Muka UI components. If a component doesn't exist, build it in muka-ui first. See [EPICS.md](./EPICS.md#component-dependency-workflow) for the workflow.

## Overview

**Goal:** Allow users to create an account so their garage data persists across devices and sessions. Account creation is triggered naturally when a user adds a vehicle to their garage — they are prompted to sign in or sign up before the vehicle is saved.

**Phase:** 1 (MVP)
**Priority:** P1
**Dependencies:** Epic 00 (Foundation), Epic 02 (Vehicle Garage)

---

## User Flow

```
┌─────────────────────┐
│ User looks up        │
│ vehicle (Epic 01)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Clicks "Toevoegen   │
│ aan garage"          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐     ┌─────────────────────┐
│ Is user logged in?   │─Yes─▶ Save vehicle to     │
│                      │     │ Supabase garage      │
└──────────┬──────────┘     └──────────┬──────────┘
           │ No                        │
           ▼                           ▼
┌─────────────────────┐     ┌─────────────────────┐
│ Store vehicle in     │     │ Redirect to /garage  │
│ sessionStorage as    │     │ with success toast:  │
│ pendingVehicle       │     │ "Voertuig toegevoegd │
└──────────┬──────────┘     │  aan garage"         │
           │                 └─────────────────────┘
           ▼
┌─────────────────────┐
│ Redirect to          │
│ /auth (login/signup) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Google sign-in       │
│ (Supabase Auth)      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ On success:          │
│ 1. Migrate local     │
│    storage → Supa    │
│ 2. Save pending      │
│    vehicle           │
│ 3. Redirect /garage  │
│    with confirmation │
└─────────────────────┘
```

---

## Data Model

### Supabase tables

```sql
-- Users are managed by Supabase Auth (auth.users)
-- No custom users table needed for MVP

-- Garage vehicles (replaces local storage)
create table garage_vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  added_at timestamptz default now() not null,

  -- RDW data
  kenteken text not null,
  merk text,
  handelsbenaming text,
  brandstof_omschrijving text,
  co2_uitstoot_gecombineerd integer,
  datum_eerste_toelating text,
  catalogusprijs integer,
  bruto_bpm integer,

  -- User-supplied data
  purchase_price numeric not null,
  annual_kilometers integer not null,
  business_kilometers integer not null default 0,
  ownership_type text not null check (ownership_type in ('private', 'business')),
  nickname text,
  notes text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Row Level Security
alter table garage_vehicles enable row level security;

create policy "Users can view own vehicles"
  on garage_vehicles for select using (auth.uid() = user_id);

create policy "Users can insert own vehicles"
  on garage_vehicles for insert with check (auth.uid() = user_id);

create policy "Users can update own vehicles"
  on garage_vehicles for update using (auth.uid() = user_id);

create policy "Users can delete own vehicles"
  on garage_vehicles for delete using (auth.uid() = user_id);
```

### TypeScript types

```typescript
// types/auth.ts
interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}
```

---

## User Stories

### US-03-001: Auth gate on "Add to garage"

**As a** user who looked up a vehicle and is not logged in,
**I want to** be redirected to sign in when I click "Toevoegen aan garage",
**So that** my vehicle is saved to a persistent account.

**Acceptance criteria:**
- [ ] "Toevoegen aan garage" button works for both logged-in and anonymous users
- [ ] If logged in: vehicle is saved directly to Supabase, user is redirected to /garage with success toast
- [ ] If not logged in: vehicle data is stored in `sessionStorage` under key `pendingVehicle`
- [ ] User is redirected to `/auth` with a `returnTo=/garage` query parameter
- [ ] After successful auth, the pending vehicle is saved to Supabase and cleared from sessionStorage
- [ ] The garage page shows a success toast: "Voertuig toegevoegd aan garage"

**Muka UI components:** Button, Card

**Dependencies:** US-01-006, US-02-002

**Estimate:** 1 day

---

### US-03-002: Login/signup page with Google sign-in

**As a** user who needs to sign in,
**I want to** see a clean login page with a "Sign in with Google" button,
**So that** I can create an account or log in with one click.

**Acceptance criteria:**
- [ ] Page at `/auth` with clear heading: "Inloggen of account aanmaken"
- [ ] Subheading explains why: "Log in om je garage op te slaan en op elk apparaat te gebruiken"
- [ ] "Inloggen met Google" button triggers Supabase Google OAuth
- [ ] Loading state while OAuth is in progress
- [ ] Error state if Google sign-in fails with "Inloggen mislukt, probeer opnieuw"
- [ ] After success: redirect to `returnTo` URL or `/garage` (default)
- [ ] Page is accessible without authentication (public route)
- [ ] If user is already logged in and visits `/auth`, redirect to `/garage`

**Muka UI components:** Button, Card, Label

**Dependencies:** US-00-001

**Estimate:** 1 day

---

### US-03-003: Supabase client setup

**As a** developer,
**I want** a configured Supabase client available throughout the app,
**So that** all features can use auth and database services.

**Acceptance criteria:**
- [ ] Supabase client initialized with project URL and anon key from environment variables
- [ ] Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `.env.local.example` file documents required variables
- [ ] Supabase client is a singleton, importable from `@/lib/supabase`
- [ ] Server-side compatible (for potential future SSR usage)
- [ ] TypeScript types generated or manually defined for database schema

**Muka UI components:** None (infrastructure)

**Dependencies:** US-00-001

**Estimate:** 0.5 day

---

### US-03-004: Auth context provider

**As a** developer,
**I want** auth state (user, loading, error) available via React context,
**So that** any component can check if the user is logged in.

**Acceptance criteria:**
- [ ] `AuthProvider` wraps the app in root layout
- [ ] Provides: `user`, `loading`, `signIn()`, `signOut()`
- [ ] `useAuth()` hook for consuming components
- [ ] Listens to Supabase `onAuthStateChange` for session changes
- [ ] On mount: checks for existing session (auto-login)
- [ ] Loading state is true until initial session check completes
- [ ] Session persists across page reloads (Supabase handles via cookies/localStorage)

**Muka UI components:** None (infrastructure)

**Dependencies:** US-03-003

**Estimate:** 0.5 day

---

### US-03-005: Migrate local storage data to Supabase

**As a** user who added vehicles before signing up,
**I want** my existing local storage garage data automatically moved to my account,
**So that** I don't lose vehicles I already saved.

**Acceptance criteria:**
- [ ] On first successful login, check for existing garage data in local storage
- [ ] If local data exists: insert all vehicles into Supabase `garage_vehicles` table
- [ ] Preserve all user-entered data (price, km, ownership type, etc.)
- [ ] After successful migration, clear local storage garage data
- [ ] If migration partially fails: keep remaining local data, show warning
- [ ] Migration runs only once (flag in local storage: `garage_migrated`)
- [ ] Toast: "Je bestaande voertuigen zijn overgezet naar je account" (if migration occurred)

**Muka UI components:** None (background operation)

**Dependencies:** US-03-004, US-02-002 (existing garage storage)

**Estimate:** 1 day

---

### US-03-006: Auth-aware garage service

**As a** developer,
**I want** the garage service to read/write from Supabase when logged in and local storage when not,
**So that** the garage works for both anonymous and authenticated users.

**Acceptance criteria:**
- [ ] `getGarage()` reads from Supabase if user is logged in, local storage otherwise
- [ ] `addVehicle()` writes to Supabase if logged in, local storage otherwise
- [ ] `updateVehicle()`, `removeVehicle()`, `duplicateVehicle()` follow same pattern
- [ ] All Supabase operations use RLS (no admin/service role key on client)
- [ ] Error handling: if Supabase call fails, show user-friendly error
- [ ] Loading states exposed for UI to show spinners/skeletons
- [ ] Existing `lib/garage.ts` is refactored, not replaced — same function signatures

**Muka UI components:** None (service layer)

**Dependencies:** US-03-004, US-02-002

**Estimate:** 1 day

---

### US-03-007: User avatar and logout in header

**As a** logged-in user,
**I want to** see my profile picture in the header and be able to log out,
**So that** I know I'm signed in and can switch accounts if needed.

**Acceptance criteria:**
- [ ] When logged in: show Google profile avatar (or initials fallback) in header
- [ ] Clicking avatar shows dropdown or navigates to simple menu with "Uitloggen"
- [ ] "Uitloggen" calls `signOut()` and redirects to home page
- [ ] After logout: garage falls back to local storage mode
- [ ] When not logged in: show "Inloggen" link/button in header
- [ ] Transition between states is smooth (no layout shift)

**Muka UI components:** Button, Card (dropdown), Label

**Dependencies:** US-03-004, US-00-001

**Estimate:** 0.5 day

---

### US-03-008: Protected route handling

**As a** developer,
**I want** a pattern for pages that require authentication,
**So that** future features can easily gate content behind login.

**Acceptance criteria:**
- [ ] Utility component or hook: `useRequireAuth()` — redirects to `/auth` if not logged in
- [ ] Passes current URL as `returnTo` parameter
- [ ] Shows loading state while checking auth
- [ ] For MVP: no pages strictly require auth (garage works for anonymous too)
- [ ] Pattern is ready for future use (e.g., kilometer tracking in Epic 06)

**Muka UI components:** None (infrastructure)

**Dependencies:** US-03-004

**Estimate:** 0.5 day

---

## Technical Notes

### Supabase Setup

```bash
# Install Supabase client
npm install @supabase/supabase-js @supabase/ssr
```

### Key files

```
src/
├── app/
│   ├── auth/
│   │   └── page.tsx              # Login/signup page
│   │   └── callback/
│   │       └── route.ts          # OAuth callback handler
│   └── layout.tsx                # Wrap with AuthProvider
├── components/
│   └── auth/
│       └── AuthProvider.tsx      # Auth context provider
├── lib/
│   ├── supabase.ts              # Supabase client singleton
│   ├── auth.ts                  # Auth helper functions
│   ├── garage.ts                # Updated: auth-aware garage service
│   └── migration.ts             # Local storage → Supabase migration
└── types/
    └── auth.ts                  # Auth-related types
```

### OAuth callback flow

Supabase Google OAuth uses a redirect flow:
1. User clicks "Inloggen met Google"
2. `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: '/auth/callback?returnTo=/garage' } })`
3. User authenticates with Google
4. Google redirects back to `/auth/callback`
5. Callback route exchanges code for session
6. Redirect to `returnTo` URL with session established

### Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Garage service refactor strategy

The existing `lib/garage.ts` should be refactored to support both storage backends:

```typescript
// Pseudocode for the dual-backend approach
async function getGarage(userId?: string): Promise<GarageVehicle[]> {
  if (userId) {
    return await supabase.from('garage_vehicles').select('*').eq('user_id', userId);
  }
  return getLocalGarage(); // existing local storage logic
}
```

---

## Needed Muka UI Components

No new Muka UI components are strictly required for this epic. All stories can be built with existing components: Button, Card, Label, Input, Badge, Icon, Divider.

---

## Edge Cases

- Google OAuth popup blocked → Show message: "Sta pop-ups toe voor inloggen"
- User signs in with different Google account → Each account has its own garage
- Local storage has corrupted data at migration time → Skip corrupted entries, log warning
- Supabase service unavailable → Fall back to local storage with warning
- User logs out and logs in with different account → Show new account's garage
- sessionStorage `pendingVehicle` exists but user navigates away from auth → Data persists until session ends
- User already has the same vehicle (by plate) in Supabase and local storage → Add both (allow duplicates, same as current behavior per Epic 02 edge cases)

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Google OAuth flow works end-to-end (sign in → redirect → garage)
- [ ] Pending vehicle is saved after sign-up and confirmation shown
- [ ] Local storage data migrates on first login
- [ ] RLS policies prevent users from accessing other users' data
- [ ] Logout returns app to anonymous/local storage mode
- [ ] Works in private browsing (graceful degradation — sessionStorage for pending vehicle)
- [ ] Mobile: OAuth flow works on mobile browsers
- [ ] No Supabase service role key exposed to client

---

## Implementation Plan

### Prerequisite: Supabase project

1. Create a Supabase project (or use existing one)
2. Enable Google OAuth provider in Supabase dashboard (Authentication → Providers → Google)
3. Configure Google Cloud Console OAuth credentials (client ID + secret)
4. Set authorized redirect URI to `https://your-project.supabase.co/auth/v1/callback`
5. Run the SQL migration to create `garage_vehicles` table with RLS policies

### Implementation order

| # | Story | Description |
|---|-------|-------------|
| 1 | US-03-003 | Set up Supabase client and env vars |
| 2 | US-03-004 | Build AuthProvider and useAuth hook |
| 3 | US-03-002 | Build /auth page with Google sign-in |
| 4 | US-03-006 | Refactor garage service for dual backend |
| 5 | US-03-005 | Implement local → Supabase migration |
| 6 | US-03-001 | Wire up auth gate on "Add to garage" flow |
| 7 | US-03-007 | Add user avatar and logout to header |
| 8 | US-03-008 | Create useRequireAuth pattern for future use |

### Verification

1. `npm run build && npm run lint` — no errors
2. Browser flow: lookup → add to garage → redirected to /auth → Google sign-in → redirected to /garage with "Voertuig toegevoegd" toast
3. Existing vehicles in local storage appear in garage after first login
4. Logout → garage shows local storage data only
5. New browser/device: login → see same garage data
6. Mobile: full flow works on iOS Safari and Android Chrome

---

## Implementation Summary

### Approach

The implementation followed the planned story order and used a **dual-backend pattern** as the central architectural decision: every garage service function accepts an optional `userId` parameter. When `userId` is present, operations go through Supabase; when absent, they use localStorage (the original behavior). This allowed the refactored `lib/garage.ts` to maintain backwards compatibility while adding cloud persistence.

All garage functions were converted from synchronous to **async** (returning `Promise`), and all consumers (garage page, lookup page) were updated accordingly.

### Files created

| File | Purpose |
|------|---------|
| `src/lib/supabase.ts` | Supabase browser client singleton with `isSupabaseConfigured()` guard for build-time safety |
| `src/lib/auth.ts` | `useRequireAuth()` hook for protecting future routes |
| `src/lib/migration.ts` | One-time local storage → Supabase migration logic with `garage_migrated` flag |
| `src/types/auth.ts` | `AuthUser` and `AuthState` interfaces |
| `src/types/database.ts` | `GarageVehicleRow` type matching Supabase table schema |
| `src/components/auth/AuthProvider.tsx` | `AuthProvider` context + `useAuth()` hook; handles session, migration on sign-in |
| `src/app/auth/page.tsx` | Login page with "Inloggen met Google" button, auto-redirect if already logged in |
| `src/app/auth/callback/route.ts` | Server-side OAuth callback that exchanges code for session |
| `.env.local.example` | Documents required Supabase environment variables |

### Files modified

| File | Changes |
|------|---------|
| `src/lib/garage.ts` | Full rewrite: dual-backend (localStorage / Supabase), all functions async, added `getLocalGarageData()` and `clearLocalGarage()` for migration |
| `src/app/layout.tsx` | Wrapped app in `AuthProvider` |
| `src/app/garage/page.tsx` | Async garage operations with `userId`, pending vehicle processing from `sessionStorage`, migration toast |
| `src/app/lookup/page.tsx` | Auth gate on form save: logged-in saves directly, anonymous stores in `sessionStorage` and redirects to `/auth` |
| `src/components/layout/TopNav.tsx` | Added `UserMenu` component (avatar dropdown with name/email/logout), "Inloggen" button when anonymous, `/auth` route config |
| `package.json` | Added `@supabase/supabase-js` and `@supabase/ssr` dependencies |

### Key design decisions

1. **Build-time safety**: `AuthProvider` gracefully handles missing Supabase env vars (returns `null` client, `loading: false`, `user: null`) so `npm run build` works without `.env.local`
2. **Pending vehicle flow**: When an anonymous user fills out the vehicle form, the data is stored in `sessionStorage` under `pendingVehicle`. After auth redirect, the garage page picks it up and saves it to Supabase
3. **Migration runs once**: The `garage_migrated` localStorage flag prevents re-migration on subsequent sign-ins. Partial failures keep remaining local data intact
4. **No new Muka UI components needed**: Avatar uses a styled `<button>` with `next/image` for the Google profile picture (or initials fallback), dropdown uses existing `Card` and `Divider`
5. **Supabase client per-call**: The garage service creates a fresh Supabase client for each operation rather than sharing one, keeping things simple and avoiding stale session references
