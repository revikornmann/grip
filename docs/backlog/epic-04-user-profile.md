# Epic 04: User Profile + Onboarding

> **Component Constraint:** All UI must use Muka UI components. If a component doesn't exist, build it in muka-ui first. See [EPICS.md](./EPICS.md#component-dependency-workflow) for the workflow.

## Overview

**Goal:** Capture the user's financial context (taxable income, BTW status, province) during onboarding so that all scenario calculations use their actual tax situation.

**Phase:** 1 (MVP)
**Priority:** P0
**Dependencies:** Epic 03 (User Accounts)

---

## Data Model

### Profile (stored in Supabase per user)

```typescript
interface UserProfile {
  id: string;
  user_id: string;
  taxable_income: number;      // Annual taxable income in €
  is_btw_plichtig: boolean;    // Whether the user is VAT registered
  province: Province;          // Dutch province for MRB calculation
  created_at: string;
  updated_at: string;
}

// Derived (not stored)
// tax_rate: calculated from taxable_income against 2026 belastingschijven
// btw_recovery_eligible: true if is_btw_plichtig is true
```

### Supabase table

```sql
create table user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  taxable_income numeric not null,
  is_btw_plichtig boolean not null default true,
  province text not null check (province in (
    'Drenthe', 'Flevoland', 'Friesland', 'Gelderland', 'Groningen',
    'Limburg', 'Noord-Brabant', 'Noord-Holland', 'Overijssel',
    'Utrecht', 'Zeeland', 'Zuid-Holland'
  )),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Row Level Security
alter table user_profiles enable row level security;

create policy "Users can view own profile"
  on user_profiles for select using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on user_profiles for insert with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on user_profiles for update using (auth.uid() = user_id);
```

---

## User Stories

### US-04-001: Onboarding welcome screen

**As a** ZZP'er who just signed up,
**I want to** see a clear explanation of why the app needs my financial info,
**So that** I understand the value before providing personal data.

**Acceptance criteria:**
- [ ] Screen shown after Google login if no profile exists
- [ ] Headline: "Bereken wat een auto jou écht kost"
- [ ] Subline: "We stellen je 3 vragen om je belastingsituatie te bepalen"
- [ ] CTA button: "Start"
- [ ] Skip option is NOT available (profile is required for calculations)

**Muka UI components:** Card, Button

**Estimate:** 0.5 day

---

### US-04-002: Income input screen

**As a** ZZP'er,
**I want to** enter my estimated taxable annual income,
**So that** the app can determine my tax bracket for accurate calculations.

**Acceptance criteria:**
- [ ] Question: "Wat is je geschatte belastbare jaarinkomen?"
- [ ] Number input field with € prefix
- [ ] Helper text: "Dit is je winst na aftrek van zelfstandigenaftrek en MKB-winstvrijstelling"
- [ ] Real-time feedback shows derived schijf + tarief as user types:
  - ≤€38.883 → "Schijf 1: 35,75%"
  - €38.883–€78.426 → "Schijf 2: 37,56%"
  - >€78.426 → "Schijf 3: 49,50%"
- [ ] Validation: must be positive number
- [ ] "Volgende" button to proceed

**Muka UI components:** Input, Label, Card, Button

**Estimate:** 0.5 day

---

### US-04-003: BTW status input screen

**As a** ZZP'er,
**I want to** indicate whether I'm VAT-registered,
**So that** the app knows if I can recover BTW on business vehicle costs.

**Acceptance criteria:**
- [ ] Question: "Ben je BTW-plichtig?"
- [ ] Two options: "Ja" / "Nee"
- [ ] Helper text: "De meeste ZZP'ers zijn BTW-plichtig. Twijfel je? Kijk op je laatste BTW-aangifte."
- [ ] Default selection: none (user must choose)
- [ ] "Volgende" button to proceed
- [ ] "Terug" button to go back to income screen

**Muka UI components:** RadioTile, Label, Card, Button

**Estimate:** 0.5 day

---

### US-04-004: Province input screen

**As a** ZZP'er,
**I want to** select my province,
**So that** the app can calculate accurate road tax (MRB).

**Acceptance criteria:**
- [ ] Question: "In welke provincie ben je geregistreerd?"
- [ ] Dropdown select with all 12 provinces
- [ ] Helper text: "Dit bepaalt je wegenbelasting (MRB)"
- [ ] Default: none (user must select)
- [ ] "Volgende" button to proceed
- [ ] "Terug" button to go back

**Muka UI components:** Select, Label, Card, Button

**Estimate:** 0.5 day

---

### US-04-005: Onboarding confirmation screen

**As a** ZZP'er,
**I want to** see a summary of my entered profile data,
**So that** I can verify it's correct before proceeding.

**Acceptance criteria:**
- [ ] Summary shows: "Jouw belastingtarief: 37,56% (schijf 2) · BTW-plichtig · Noord-Holland"
- [ ] "Wijzigen" link returns to first input screen
- [ ] CTA button: "Voeg je eerste auto toe" → navigates to license plate lookup
- [ ] Profile is saved to Supabase on CTA click
- [ ] Success toast: "Profiel opgeslagen"

**Muka UI components:** Card, Button, Badge

**Estimate:** 0.5 day

---

### US-04-006: Profile service layer

**As a** developer,
**I want** a profile service that reads/writes profile data to Supabase,
**So that** profile data is persisted and available throughout the app.

**Acceptance criteria:**
- [ ] `getProfile(userId)` — returns UserProfile or null
- [ ] `saveProfile(userId, data)` — creates or updates profile
- [ ] `hasProfile(userId)` — returns boolean
- [ ] Profile is cached in React context after first fetch
- [ ] All scenarios recalculate when profile changes (via context update)
- [ ] Error handling for Supabase failures

**Muka UI components:** None (service layer)

**Estimate:** 0.5 day

---

### US-04-007: Redirect to onboarding if no profile

**As a** ZZP'er who is logged in but hasn't completed onboarding,
**I want to** be redirected to onboarding when I try to access protected pages,
**So that** I complete my profile before using the app.

**Acceptance criteria:**
- [ ] After login, check if profile exists
- [ ] If no profile: redirect to `/onboarding`
- [ ] Protected pages: `/garage`, `/scenarios`, `/compare`, `/calculator`
- [ ] `/lookup` remains accessible (user can look up vehicles before completing profile)
- [ ] "Add to garage" from lookup requires profile completion

**Muka UI components:** None (routing logic)

**Estimate:** 0.5 day

---

### US-04-008: Settings page for profile editing

**As a** ZZP'er,
**I want to** edit my profile information after onboarding,
**So that** I can update my tax situation when it changes.

**Acceptance criteria:**
- [ ] Settings page at `/settings`
- [ ] Shows current profile values with edit capability
- [ ] Income, BTW status, province all editable
- [ ] "Opslaan" button saves changes
- [ ] Toast: "Profiel bijgewerkt"
- [ ] All existing scenarios recalculate automatically after save
- [ ] "Uitloggen" button at bottom of settings

**Muka UI components:** Input, RadioTile, Select, Button, Card

**Estimate:** 1 day

---

## Technical Notes

### Tax rate calculation

```typescript
function getTaxRate(taxableIncome: number): number {
  if (taxableIncome <= 38883) return 0.3575;
  if (taxableIncome <= 78426) return 0.3756;
  return 0.495;
}
```

### Profile context

```typescript
interface ProfileContext {
  profile: UserProfile | null;
  loading: boolean;
  taxRate: number;
  btwRecoveryEligible: boolean;
  refetch: () => Promise<void>;
}
```

### Files to create

```
src/
├── app/
│   ├── onboarding/
│   │   └── page.tsx          # Multi-step onboarding flow
│   └── settings/
│       └── page.tsx          # Profile edit page
├── components/
│   └── profile/
│       └── ProfileProvider.tsx
├── lib/
│   └── profile.ts            # Profile service
└── types/
    └── profile.ts            # UserProfile type
```

---

## Muka UI Components Required

| Component | Status | Notes |
|-----------|--------|-------|
| Card | ✅ Available | Onboarding cards |
| Button | ✅ Available | Navigation buttons |
| Input | ✅ Available | Income input |
| Label | ✅ Available | Form labels |
| RadioTile | ✅ Available | BTW selection |
| Select | ✅ Available | Province dropdown |
| Badge | ✅ Available | Tax bracket display |
| FormProgressBar | ✅ Available | Onboarding progress |
| Toast | ✅ Available | Success notifications |

---

## Out of Scope

- Multiple user profiles (only one profile per user)
- Historical income tracking
- Income estimation helper
- Tax advisor connection
- BV vs. eenmanszaak profile type (assumes eenmanszaak)
- Company registration details (KvK number, etc.)

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Onboarding flow works end-to-end
- [ ] Profile persists in Supabase
- [ ] Settings page allows profile editing
- [ ] Tax rate derives correctly from income
- [ ] Protected pages redirect to onboarding if no profile
- [ ] All scenarios recalculate when profile changes
- [ ] Mobile responsive design
- [ ] `npm run build && npm run lint` passes
