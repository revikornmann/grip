# Product Backlog — Grip

A vehicle tax optimization tool for Dutch ZZP'ers (self-employed professionals).

## Vision

Help Dutch ZZP'ers answer one question: **is a lease car worth it for me?**

The answer is personal. It depends on income, BTW status, how much someone drives, and which type of ownership or lease they're evaluating. This app takes those variables and produces a clear, comparable net annual cost for each scenario — so a ZZP'er can make an informed decision without needing an accountant.

## Target User

**Primary Persona:** Dutch ZZP'er (eenmanszaak) who is considering whether to get a lease car or buy one privately or through their business.

They need to understand:
- Total cost of ownership under different scenarios
- Tax implications (bijtelling, BTW aftrek, kostenaftrek, km-vergoeding)
- How different ownership types compare for their specific situation

**Key insight:** Most ZZP'ers underestimate bijtelling. They see a monthly lease price and think that's their cost. The app's job is to show the real net cost after all tax effects — and compare it fairly against the alternatives.

---

## Epic Overview

| Epic | Name | Phase | Priority | Status |
|------|------|-------|----------|--------|
| 00 | [Foundation](./epic-00-foundation.md) | 1 | P0 | ✅ Complete |
| 01 | [License Plate Lookup](./epic-01-license-plate-lookup.md) | 1 | P0 | ✅ Complete |
| 02 | [Vehicle Garage](./epic-02-vehicle-garage.md) | 1 | P1 | ✅ Complete |
| 03 | [User Accounts](./epic-03-user-accounts.md) | 1 | P1 | ✅ Complete |
| 04 | [User Profile + Onboarding](./epic-04-user-profile.md) | 1 | P0 | Not Started |
| 05 | [Scenario Model](./epic-05-scenario-model.md) | 1 | P0 | Not Started |
| 06 | [Cost Calculator Engine](./epic-06-calculator-engine.md) | 1 | P1 | Not Started |
| 07 | [Scenario UI (Add / View / Edit)](./epic-07-scenario-ui.md) | 1 | P1 | Not Started |
| 08 | [Ownership Comparison](./epic-08-ownership-comparison.md) | 1 | P2 | Not Started |
| 09 | [Youngtimer Warning](./epic-09-youngtimer-warning.md) | 1 | P2 | Not Started |
| 10 | [Kilometer Tracking](./epic-10-kilometer-tracking.md) | 2 | P3 | Not Started |

### Priority Legend
- **P0** — Must have for MVP launch
- **P1** — Core feature, high value
- **P2** — Important but can ship without
- **P3** — Future enhancement (Phase 2)

---

## Dependency Graph

```
E00 → E01 → E02 → E03
                   ↓
                  E04 (Profile)
                   ↓
                  E05 (Scenario Model)
                   ↓
                  E06 (Calculator Engine)
                   ↓
                  E07 (Scenario UI)
                   ↓
         E08 (Compare) + E09 (Youngtimer Warning)
                   ↓
                  E10 (Km Tracking)
```

---

## Key Dutch Tax Concepts

For reference when writing stories:

| Term | Dutch | Description |
|------|-------|-------------|
| Bijtelling | Bijtelling | Taxable benefit added to income for private use of a company car. % of cataloguswaarde (22% standard, 16% PHEV, 18% EV in 2026). Applied when private use exceeds 500km/year. |
| Youngtimer | Youngtimer | 35% bijtelling over dagwaarde for cars 15+ years old. Threshold changes to 25+ years from 1 Jan 2027. |
| VAT Recovery | BTW aftrek | VAT recovery on business vehicle costs, proportional to business use. Only for BTW-plichtig users with ≥10% business use. |
| Cost Deductibility | Kostenaftrek | All business vehicle costs reduce taxable profit. Tax saving = cost × marginal tax rate. |
| Km Deduction | Km-vergoeding | €0.23/km deduction for business use of a privately owned or leased vehicle. |
| Depreciation | Afschrijving | Depreciation on business-owned vehicles. Minimum 5 years, minimum residual value 10% (fiscal floor). |
| Catalog Value | Cataloguswaarde | Official list price including BPM and VAT at time of first registration. Used for standard bijtelling. |
| Market Value | Dagwaarde | Current market value. Used only for youngtimer bijtelling calculation. |
| Tax Bracket | Belastingschijf | 2026 rates: 35.75% (≤€38.883) / 37.56% (≤€78.426) / 49.50% (>€78.426). |

---

## Component Dependency Workflow

> **Architectural Constraint:** All UI components must come from Muka UI. No exceptions.
> This app is a proof-of-concept that drives design system development.

### Available Components (use these)

| Component | Variants/Features |
|-----------|-------------------|
| `Alert` | info, success, warning, error |
| `Badge` | status indicators |
| `BottomBar` | mobile navigation |
| `Button` | primary, secondary, ghost; sm/md/lg |
| `Card` | content container |
| `Checkbox` | checkbox input |
| `CheckboxTile` | checkbox with tile styling |
| `Chip` | compact interactive element |
| `Container` | layout container |
| `DatePicker` | date selection |
| `Dialog` | modal dialog |
| `Divider` | horizontal separator |
| `FormProgressBar` | multi-step form progress |
| `Icon` | icon wrapper |
| `Input` | label, helper text, error state |
| `Label` | form labels |
| `ListItem` | list items |
| `PriceTag` | price display |
| `Progress` | progress indicator |
| `Radio` | radio input |
| `RadioTile` | radio with tile styling |
| `Section` | content section |
| `SegmentGroup` | segmented control |
| `Select` | dropdown with options |
| `Sheet` | bottom sheet overlay |
| `Table` | data table |
| `Tabs` | TabList, Tab, TabPanel |
| `Tile` | clickable tile |
| `Toast` | notification toast |
| `Toggle` | toggle switch |
| `TopBar` | top navigation |

### Needed Components (must build in muka-ui first)

| Component | Blocking Stories |
|-----------|------------------|
| Skeleton | US-00-006 |
| Tooltip | US-07-009 |
| Empty State | US-07-001 |

### Check Component Availability

- **Local Storybook:** http://localhost:6006 (run `npm run dev` in muka)
- **Note:** Local Storybook is always ahead of deployed version

---

## Phase 1 MVP Scope

The MVP allows a user to:
1. Complete onboarding (income, BTW status, province)
2. Look up a vehicle by license plate
3. Save vehicles to a personal garage (Supabase)
4. Create scenarios for each ownership type (private_owned, private_lease, financial_lease, operational_lease, business_owned)
5. See full cost breakdown with tax effects
6. Compare multiple scenarios side by side
7. Get warnings for youngtimer threshold changes

**Out of scope for MVP:**
- Kilometer tracking / rittenadministratie log
- MIA/VAMIL environmental investment deductions
- BV vs. eenmanszaak comparison (assumes eenmanszaak throughout)
- Export to PDF or Excel
- Push notifications for youngtimer deadline

---

## Technical Notes

- **Data source:** RDW Open Data API for vehicle data
- **Storage:** Supabase PostgreSQL with Row Level Security (RLS)
- **Authentication:** Google OAuth via Supabase Auth
- **Calculations:** Client-side JavaScript
- **Design system:** muka-ui (npm linked for development)
- **Tax year:** 2026 constants used throughout

### Key Infrastructure (Epic 03)

The following patterns are established and should be reused in Epics 04-10:

| Pattern | Usage |
|---------|-------|
| `useAuth()` hook | Access current user, loading state, signIn/signOut functions |
| `useRequireAuth()` hook | Redirect to `/auth` if not logged in |
| Auth-aware services | Pass `userId` to service functions; when present, use Supabase; when absent, use localStorage |
| Supabase RLS | All tables use Row Level Security — users can only access their own data |
| Pending item flow | Store in `sessionStorage`, redirect to `/auth`, save after login |

---

## Sprint Sequence (E04–E09)

```
Sprint 1:   Profile model + onboarding flow (E04)
Sprint 2:   Scenario data model in Supabase + TypeScript types (E05)
Sprint 3:   Add scenario flow — private_owned and operational_lease first (E07 partial)
Sprint 4:   Scenario detail screen with full cost breakdown (E07 partial)
Sprint 5:   private_lease + business_owned + youngtimer logic (E06 partial)
Sprint 6:   financial_lease (most complex — interest amortisation) (E06 complete)
Sprint 7:   Compare view (E08)
Sprint 8:   Youngtimer warning + 2027 delta calculation (E09)
```

---

## Source of Truth

For detailed product specification — including data model, ownership types, calculation formulas, tax constants, and screen architecture — read `docs/PRODUCT_BRIEF.md`.
