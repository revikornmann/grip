# Grip — Product Brief
## Vehicle tax scenario calculator for Dutch ZZP'ers

**Version:** 1.0  
**Status:** Approved for development  
**Replaces:** existing `docs/backlog/EPICS.md` framing for E04 and E05

---

## 1. Product vision

Grip helps Dutch ZZP'ers answer one question: **is a lease car worth it for me?**

The answer is personal. It depends on income, BTW status, how much someone drives, and which type of ownership or lease they're evaluating. Grip takes those variables and produces a clear, comparable net annual cost for each scenario — so a ZZP'er can make an informed decision without needing an accountant.

---

## 2. Target user

**Primary persona:** Dutch ZZP'er (eenmanszaak) who is considering whether to get a lease car or buy one privately or through their business. They are not a tax expert. They know terms like bijtelling and BTW aftrek exist but don't know how to calculate their actual impact in euros.

**Key insight:** Most ZZP'ers underestimate bijtelling. They see a monthly lease price and think that's their cost. The app's job is to show the real net cost after all tax effects — and compare it fairly against the alternatives.

---

## 3. Three-layer data architecture

### Layer 1 — Profile (set once, stored in Supabase per user)

The fixed financial context that all scenarios are calculated against.

| Field | Type | Notes |
|-------|------|-------|
| `taxable_income` | number | Annual taxable income in €. Used to determine belastingschijf. |
| `is_btw_plichtig` | boolean | Whether the user is VAT registered. Determines BTW recovery eligibility. |
| `province` | enum | Dutch province. Used for MRB (road tax) calculation. |

**Derived from profile (not stored):**
- `tax_rate`: calculated from `taxable_income` against 2026 belastingschijven (see Section 6)
- `btw_recovery_eligible`: true if `is_btw_plichtig` is true

Profile is completed during onboarding. Editable at any time via Settings. Every scenario recalculates automatically when profile changes.

---

### Layer 2 — Vehicle (stored in Supabase per user, existing garage model)

The RDW data already fetched via license plate lookup. No changes to existing garage model except:
- `dagwaarde` (optional number) — current market value in €. Only relevant for youngtimer bijtelling calculation. User-entered or system-estimated.

---

### Layer 3 — Scenario (new — stored in Supabase per user)

One scenario = one vehicle + one ownership type + its specific inputs.

```typescript
interface Scenario {
  id: string;
  user_id: string;
  vehicle_id: string;           // Reference to garage vehicle
  created_at: string;
  updated_at: string;

  // Display
  label: string;                // Auto-generated: "Toyota Yaris 2019 · Operational Lease"
  
  // Ownership type — the core enum
  ownership_type: OwnershipType;

  // Private use
  annual_km_total: number;      // Total km driven per year
  annual_km_business: number;   // Business km per year
  // private_use_exceeds_500: derived (annual_km_total - annual_km_business > 500)

  // Type-specific inputs (only relevant fields populated per type)
  private_owned: PrivateOwnedInputs | null;
  private_lease: PrivateLeaseInputs | null;
  financial_lease: FinancialLeaseInputs | null;
  operational_lease: OperationalLeaseInputs | null;
  business_owned: BusinessOwnedInputs | null;
}

type OwnershipType =
  | 'private_owned'
  | 'private_lease'
  | 'financial_lease'
  | 'operational_lease'
  | 'business_owned';
```

**Type-specific input shapes:**

```typescript
interface PrivateOwnedInputs {
  purchase_price: number;               // € paid for the vehicle
  // Costs the user pays personally
  monthly_fuel: number;                 // € estimate
  monthly_insurance: number;            // €
  monthly_maintenance: number;          // €
  annual_road_tax: number;              // € (or calculated from MRB)
}

interface PrivateLeaseInputs {
  monthly_lease_cost: number;           // All-in monthly € (personal contract)
  // Fuel is always separate for private lease
  monthly_fuel: number;
}

interface FinancialLeaseInputs {
  monthly_payment: number;              // Total monthly € to bank
  interest_rate: number | null;         // Optional. Annual % (e.g. 0.045 for 4.5%)
  contract_months: number;
  // Running costs paid by user
  monthly_fuel: number;
  monthly_insurance: number;
  monthly_maintenance: number;
}

interface OperationalLeaseInputs {
  monthly_lease_cost: number;           // Fixed monthly € — includes maintenance,
                                        // all-risk insurance, replacement vehicle
                                        // Does NOT include fuel
  contract_months: number;
  km_cap_per_year: number;              // Contractual km limit
  monthly_fuel: number;                 // Separate fuel cost
}

interface BusinessOwnedInputs {
  purchase_price: number;
  depreciation_years: number;           // Default 5. Min 5 per Dutch fiscal rules.
  residual_value_percent: number;       // Default 10% (fiscal floor)
  // Running costs — all deductible
  monthly_fuel: number;
  monthly_insurance: number;
  monthly_maintenance: number;
  annual_road_tax: number;
  // Youngtimer
  dagwaarde: number | null;             // Current market value. Required if youngtimer.
  dagwaarde_estimated: boolean;         // True if system-estimated, false if user-entered
}
```

**Scenario label generation:**
`{merk} {handelsbenaming} {bouwjaar} · {ownership_type_label}`

Examples:
- `Toyota Yaris 2019 · Operational Lease`
- `BMW 3 Series 2008 · Zakelijk (youngtimer)`
- `Tesla Model 3 2023 · Financial Lease`

---

## 4. Calculation spec — per ownership type

All scenarios produce a single comparable output: **net annual cost in €** (positive = costs you money, negative = saves you money vs. a baseline). The app always presents this as "what this scenario actually costs you per year after all tax effects."

### Tax benefit/cost framing

For **business scenarios**, two tax effects apply:
1. **Bijtelling** — adds to your taxable income → you pay more income tax → this is a cost
2. **BTW recovery** — reclaims VAT on business costs → this is a benefit
3. **Cost deductibility** — business costs reduce taxable profit → tax saving = cost × tax_rate

For **private scenarios**, one tax effect applies:
1. **Km deduction** — €0.23 × business km reduces taxable income → tax saving = 0.23 × business_km × tax_rate

---

### 4A. Private owned

```
annual_costs = purchase_price / ownership_years   (depreciation, not tax-deductible)
             + monthly_fuel × 12
             + monthly_insurance × 12
             + monthly_maintenance × 12
             + annual_road_tax

km_deduction_benefit = annual_km_business × 0.23 × tax_rate

net_annual_cost = annual_costs - km_deduction_benefit
```

No BTW recovery. No bijtelling. Purely personal costs minus km allowance tax saving.

---

### 4B. Private lease

```
annual_costs = monthly_lease_cost × 12
             + monthly_fuel × 12

km_deduction_benefit = annual_km_business × 0.23 × tax_rate

net_annual_cost = annual_costs - km_deduction_benefit
```

Simplest scenario. No depreciation, no business tax effects.

---

### 4C. Financial lease

The car is on the business balance sheet. Tax treatment = business owned.

```
// Deductible costs (reduce taxable profit)
deductible_costs = monthly_payment × 12        // Full payment deductible
                 + monthly_fuel × 12
                 + monthly_insurance × 12
                 + monthly_maintenance × 12

// If interest_rate is provided, split payment into interest + repayment
// Only interest is deductible as a cost; repayment reduces balance sheet debt
// Simplified fallback: treat full payment as deductible
if interest_rate:
  // This requires knowing the outstanding balance — complex amortisation
  // For MVP: show a note "Interest portion estimated" and use simplified model
  interest_annual = calculate_interest_year1(monthly_payment, interest_rate, contract_months)
  repayment_annual = monthly_payment × 12 - interest_annual
  deductible_costs = interest_annual + fuel + insurance + maintenance
else:
  deductible_costs = monthly_payment × 12 + fuel + insurance + maintenance

tax_saving_on_costs = deductible_costs × tax_rate

// Bijtelling (if private use > 500km)
bijtelling_addition = get_bijtelling_amount(vehicle, tax_rate)  // See Section 5

// BTW recovery on deductible costs (if btw_plichtig)
btw_recovery = btw_recovery_eligible
  ? (deductible_costs × 0.21 / 1.21) × (annual_km_business / annual_km_total)
  : 0

gross_annual_cost = monthly_payment × 12 + monthly_fuel × 12
                  + monthly_insurance × 12 + monthly_maintenance × 12

net_annual_cost = gross_annual_cost
                - tax_saving_on_costs
                + bijtelling_addition
                - btw_recovery
```

---

### 4D. Operational lease

The car is owned by the leasing company. No afschrijving. All lease costs are deductible.

```
gross_annual_cost = monthly_lease_cost × 12 + monthly_fuel × 12

deductible_costs = monthly_lease_cost × 12    // Full lease cost deductible
                 + monthly_fuel × 12           // Fuel also deductible

tax_saving_on_costs = deductible_costs × tax_rate

// Bijtelling (if private use > 500km)
bijtelling_addition = get_bijtelling_amount(vehicle, tax_rate)  // See Section 5

// BTW recovery on lease costs only (fuel BTW recovery separate/complex — exclude for MVP)
btw_recovery = btw_recovery_eligible
  ? (monthly_lease_cost × 12 × 0.21 / 1.21) × (annual_km_business / annual_km_total)
  : 0

net_annual_cost = gross_annual_cost
                - tax_saving_on_costs
                + bijtelling_addition
                - btw_recovery
```

---

### 4E. Business owned (outright purchase)

```
annual_depreciation = (purchase_price - (purchase_price × residual_value_percent))
                    / depreciation_years
// Fiscal floor: residual_value_percent minimum is 10% (0.10)
// Depreciation years minimum is 5

deductible_costs = annual_depreciation
                 + monthly_fuel × 12
                 + monthly_insurance × 12
                 + monthly_maintenance × 12
                 + annual_road_tax

tax_saving_on_costs = deductible_costs × tax_rate

// Bijtelling (if private use > 500km)
bijtelling_addition = get_bijtelling_amount(vehicle, tax_rate)  // See Section 5

// BTW recovery
btw_recovery = btw_recovery_eligible
  ? (deductible_costs × 0.21 / 1.21) × (annual_km_business / annual_km_total)
  : 0

gross_annual_cost = annual_depreciation
                  + monthly_fuel × 12
                  + monthly_insurance × 12
                  + monthly_maintenance × 12
                  + annual_road_tax

net_annual_cost = gross_annual_cost
                - tax_saving_on_costs
                + bijtelling_addition
                - btw_recovery
```

---

## 5. Bijtelling calculation

```typescript
function get_bijtelling_amount(vehicle, tax_rate, scenario_year = current_year): number {
  const private_use_km = annual_km_total - annual_km_business;
  
  // No bijtelling if private use ≤ 500km
  if (private_use_km <= 500) return 0;
  
  const is_youngtimer = check_youngtimer(vehicle, scenario_year);
  const bijtelling_pct = get_bijtelling_percentage(vehicle, scenario_year);
  
  if (is_youngtimer) {
    // Youngtimer: 35% bijtelling over dagwaarde (not cataloguswaarde)
    const dagwaarde = vehicle.dagwaarde ?? estimate_dagwaarde(vehicle);
    return dagwaarde × 0.35 × tax_rate;
  }
  
  return vehicle.rdw.catalogusprijs × bijtelling_pct × tax_rate;
}

function check_youngtimer(vehicle, year): boolean {
  const age = year - vehicle.rdw.bouwjaar;
  if (year < 2027) return age >= 15;
  return age >= 25;   // New threshold from 2027
}

function get_bijtelling_percentage(vehicle, year): number {
  const co2 = vehicle.rdw.co2_uitstoot_gecombineerd ?? 999;
  const fuel = vehicle.rdw.brandstof_omschrijving;
  const is_ev = fuel includes 'elektr' or co2 === 0;
  
  if (is_ev) {
    if (year <= 2026) return 0.18;
    if (year === 2027) return 0.20;
    return 0.22;  // 2028+
  }
  if (co2 <= 50) return 0.16;   // PHEV
  return 0.22;                   // Standard
}
```

---

## 6. Tax constants — 2026

### Belastingschijven inkomstenbelasting 2026

| Schijf | Inkomen | Tarief |
|--------|---------|--------|
| 1 | t/m €38.883 | 35,75% |
| 2 | €38.883 – €78.426 | 37,56% |
| 3 | > €78.426 | 49,50% |

**Effective marginal rate calculation:**
For a given `taxable_income`, the marginal rate (used for bijtelling and deduction calculations) is the rate of the highest bracket reached. For most ZZP'ers this will be schijf 1 or 2.

```typescript
function get_tax_rate(taxable_income: number): number {
  if (taxable_income <= 38883) return 0.3575;
  if (taxable_income <= 78426) return 0.3756;
  return 0.495;
}
```

### BTW
- Standard rate: 21%
- Minimum business use for BTW recovery eligibility: 10%

### Km deduction
- €0.23 per business km (2026 rate)

### Bijtelling percentages 2026
- Standard (CO2 > 50 g/km): 22%
- Low emission (CO2 ≤ 50 g/km, PHEV): 16%
- Electric (CO2 = 0 / EV): 18% (2026), 20% (2027), 22% (2028+)
- Youngtimer (15+ jaar, until 2027): 35% over dagwaarde
- Youngtimer (25+ jaar, from 2027): 35% over dagwaarde

### Youngtimer threshold
- Until 31 Dec 2026: ≥ 15 years old
- From 1 Jan 2027: ≥ 25 years old
- No transition period

---

## 7. Youngtimer warning logic

Show a prominent warning on any scenario where:

```
vehicle.bouwjaar is between (current_year - 24) and (current_year - 15)
AND current_year <= 2026
AND ownership_type in ['business_owned', 'financial_lease', 'operational_lease']
```

Warning content:
> **Let op: Youngtimervoordeel vervalt op 1 januari 2027**
> Jouw [merk model] is [X] jaar oud. Vanaf 2027 geldt de youngtimerregeling pas voor auto's van 25 jaar of ouder. Hierdoor verandert je bijtelling van 35% over de dagwaarde naar 22% over de cataloguswaarde.
> **Geschat extra jaarlijkse belastingdruk vanaf 2027: €[delta]**

Show the calculated delta (post-2027 bijtelling - current bijtelling) as a concrete euro amount.

---

## 8. Screen architecture

### 8.1 Onboarding flow (first-time users)
Shown after Google login if no profile exists.

**Screen 1 — Welcome**
- Headline: "Bereken wat een auto jou écht kost"
- Subline: "We stellen je 3 vragen om je belastingsituatie te bepalen"
- CTA: "Start"

**Screen 2 — Income**
- Question: "Wat is je geschatte belastbare jaarinkomen?"
- Input: Number field, € prefix
- Helper: "Dit is je winst na aftrek van zelfstandigenaftrek en MKB-winstvrijstelling"
- Shows derived schijf + tarief in real-time as user types

**Screen 3 — BTW**
- Question: "Ben je BTW-plichtig?"
- Radio: Ja / Nee
- Helper: "De meeste ZZP'ers zijn BTW-plichtig. Twijfel je? Kijk op je laatste BTW-aangifte."

**Screen 4 — Province**
- Question: "In welke provincie ben je geregistreerd?"
- Select: All 12 provinces
- Helper: "Dit bepaalt je wegenbelasting (MRB)"

**Screen 5 — Ready**
- Summary: "Jouw belastingtarief: 37,56% (schijf 2) · BTW-plichtig · Noord-Holland"
- CTA: "Voeg je eerste auto toe" → goes to license plate lookup

---

### 8.2 Garage (home screen)

Displays all saved scenarios. Empty state if none.

Each scenario card shows:
- Vehicle: merk + model + bouwjaar
- Ownership type label (pill/badge)
- Net annual cost (large, prominent)
- Monthly equivalent
- Youngtimer warning badge if applicable

Actions:
- Tap card → Scenario detail
- "+" button → Add scenario (goes to lookup or pick from garage)
- Long press / swipe → Delete scenario

Sort order: most recently edited first

---

### 8.3 Add scenario flow

**Step 1 — Choose vehicle**
- Option A: Look up by license plate (existing lookup flow)
- Option B: Pick from existing garage vehicles

**Step 2 — Choose ownership type**
Five options presented as cards with a one-line description:
- **Privé eigendom** — "Jij koopt de auto zelf. Je declareert €0,23/km zakelijk."
- **Privé lease** — "Persoonlijk leasecontract. Geen zakelijke belastingeffecten."
- **Financial lease** — "De bank financiert, de auto staat op jouw balans. Bijtelling van toepassing."
- **Operational lease** — "Je huurt de auto inclusief onderhoud en verzekering. Alle leasekosten aftrekbaar."
- **Zakelijk eigendom** — "Jij koopt de auto via je bedrijf. Afschrijving + bijtelling van toepassing."

**Step 3 — Enter inputs**
Form shown depends on ownership type selected (see Section 3 type-specific inputs).

Common fields shown for all types:
- Totaal km per jaar
- Zakelijk km per jaar (with derived private km shown: "X km privé")
- 500km threshold indicator: shows "Bijtelling van toepassing" or "Geen bijtelling (onder 500km privé)" live

Type-specific fields below (see Section 3).

For youngtimer vehicles on business scenarios:
- Dagwaarde field appears with label: "Huidige marktwaarde (dagwaarde)"
- Helper: "Kijk op Marktplaats voor vergelijkbare auto's"
- "Schat voor mij" button → uses depreciation curve, sets `dagwaarde_estimated: true`
- Estimated value shown with note: "Schatting op basis van afschrijvingscurve. Pas aan voor meer nauwkeurigheid."

For financial lease with interest:
- Interest rate field: optional
- Helper: "Vul je rentepercentage in voor een nauwkeurigere berekening. Dit kun je later ook toevoegen."
- Placeholder: "bijv. 4,5%"

**Step 4 — Review**
Shows calculated result before saving.
CTA: "Sla scenario op"

---

### 8.4 Scenario detail

Full breakdown of one scenario's costs and tax effects.

Sections:
1. **Header** — Vehicle name + ownership type + net annual cost (hero number)
2. **Belastingeffecten** — The tax story in plain language
   - Bijtelling: €X/jaar (or "Niet van toepassing")
   - Kostenaftrek: -€X/jaar belastingvoordeel
   - BTW-teruggave: -€X/jaar (or "Niet van toepassing")
3. **Kostenopbouw** — Line-item breakdown of all input costs
4. **Youngtimer waarschuwing** — if applicable (see Section 7)
5. **Edit inputs** — Inline editing of all scenario inputs, auto-recalculates

---

### 8.5 Compare view

Side-by-side comparison of 2–3 scenarios.

- Select scenarios from your saved list (chip-based selector)
- Metric rows: Bruto jaarkosten · Belastingvoordeel kosten · Bijtelling · BTW-teruggave · **Netto jaarkosten** · Netto per maand
- Best value highlighted per row
- CTA: "Voeg scenario toe" if fewer than 3 selected

---

### 8.6 Profile / Settings

- Edit income, BTW status, province
- All scenarios recalculate on save
- Sign out

---

## 9. What to build first (revised Epic 04 + 05 sequence)

```
Sprint 1:   Profile model + onboarding flow (E04 prerequisite)
Sprint 2:   Scenario data model in Supabase + TypeScript types
Sprint 3:   Add scenario flow — private_owned and operational_lease first
            (these cover the clearest use cases for comparison)
Sprint 4:   Scenario detail screen with full cost breakdown
Sprint 5:   private_lease + business_owned + youngtimer logic
Sprint 6:   financial_lease (most complex — interest amortisation)
Sprint 7:   Compare view
Sprint 8:   Youngtimer warning + 2027 delta calculation
```

---

## 10. Things deliberately out of scope for Phase 1

- Kilometer tracking / rittenadministratie log
- MIA/VAMIL environmental investment deductions
- BV vs. eenmanszaak comparison (assumes eenmanszaak throughout)
- Export to PDF or Excel
- Push notifications for youngtimer deadline
- Calendar sync for km estimates

---

## 11. Open questions (resolved)

| Question | Decision |
|----------|----------|
| Financial lease interest rate | Optional field. Full payment deductible as fallback. Help text explains accuracy benefit. |
| Dagwaarde for youngtimer | Manual entry with Marktplaats tip. "Schat voor mij" button uses depreciation curve. |
| Private car as baseline or scenario? | Private is a full scenario like any other — allows fair comparison |
| Auth for MVP | Google login via Supabase — already implemented |
| Income input | Enter taxable income → app derives schijf and tarief |
| Tax year | 2026 constants used throughout. Year shown in UI. |

---

*This document is the single source of truth for E04 and E05 development. Feed it to Claude Code at the start of every session. Update it when product decisions change.*