#!/usr/bin/env node
/**
 * Ingest the Car2DB motorcycle database (moto.car2db.com CSV export) into the
 * Supabase `motorcycle_models` catalogue.
 *
 * The export is a normalized relational dump (single-quoted CSV):
 *   car_make → car_model → car_serie → car_trim, with `year` mapping trims to
 *   individual years and `car_specification_value` holding per-trim specs
 *   (keyed by `car_specification`, which is grouped into Engine / Transmission /
 *   Chassis / Dimensions / Tyres / Power-system / Performance).
 *
 * We collapse to one catalogue row per (trim × year): make + a display model
 * built from model/serie/trim names, the year, and the trim's specs mapped onto
 * our `MotorcycleSpecCategory` groups. Rows are tagged source='car2db',
 * verified=true.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     node scripts/ingest-moto-car2db.mjs --dir /path/to/moto-csv [--dry-run] [--limit N]
 *
 * The service-role key is required for writes (the catalogue is RLS read-only
 * to clients). Get it from Supabase Dashboard → Settings → API. --dry-run prints
 * counts + samples and writes nothing.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

// ---------- args ----------
const args = process.argv.slice(2);
const getArg = (flag, def) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : def;
};
const DIR = getArg("--dir", "/tmp/moto-csv");
const DRY_RUN = args.includes("--dry-run");
const LIMIT = Number(getArg("--limit", "0")) || 0;

// ---------- single-quoted CSV parser ----------
function parseLine(line) {
  const out = [];
  let i = 0;
  const n = line.length;
  while (i <= n) {
    if (line.startsWith("NULL", i) && (line[i + 4] === "," || i + 4 >= n)) {
      out.push(null);
      i += 4;
    } else if (line[i] === "'") {
      i++;
      let s = "";
      while (i < n) {
        const c = line[i];
        if (c === "\\" && i + 1 < n) {
          s += line[i + 1];
          i += 2;
          continue;
        }
        if (c === "'") {
          if (line[i + 1] === "'") {
            s += "'";
            i += 2;
            continue;
          }
          break;
        }
        s += c;
        i++;
      }
      i++; // closing quote
      out.push(s);
    } else {
      let s = "";
      while (i < n && line[i] !== ",") s += line[i++];
      out.push(s === "" ? null : s);
    }
    if (line[i] === ",") {
      i++;
      continue;
    }
    break;
  }
  return out;
}

function loadCsv(name) {
  const text = readFileSync(join(DIR, name), "utf8");
  const lines = text.split(/\r?\n/);
  lines.shift(); // header
  const rows = [];
  for (const line of lines) {
    if (!line) continue;
    rows.push(parseLine(line));
  }
  return rows;
}

// ---------- spec field → our category mapping ----------
// id_car_specification → { category, label }. Specs not listed are skipped
// (parent group headers, Color noise, etc.).
const SPEC_META = {
  // engine
  995: ["engine", "Displacement"],
  1011: ["engine", "Fuel system"],
  1029: ["engine", "Bore × stroke"],
  1031: ["engine", "Compression ratio"],
  1614: ["engine", "Type"],
  1675: ["engine", "Electronic rider aids"],
  // engineOutput
  996: ["engineOutput", "Power"],
  1021: ["engineOutput", "Torque"],
  // drivetrain
  998: ["drivetrain", "Gearbox"],
  1615: ["drivetrain", "Primary drive"],
  1616: ["drivetrain", "Clutch"],
  1617: ["drivetrain", "Final drive"],
  // brakes
  1000: ["brakes", "Front brake"],
  1001: ["brakes", "Rear brake"],
  // chassis
  1022: ["chassis", "Front suspension"],
  1023: ["chassis", "Rear suspension"],
  1024: ["chassis", "Frame"],
  // wheelsTyres
  1619: ["wheelsTyres", "Front tyre"],
  1620: ["wheelsTyres", "Rear tyre"],
  // dimensions
  1003: ["dimensions", "Dry weight"],
  1015: ["dimensions", "Wheelbase"],
  1017: ["dimensions", "Overall length"],
  1018: ["dimensions", "Overall width"],
  1662: ["dimensions", "Overall height"],
  1025: ["dimensions", "Ground clearance"],
  1032: ["dimensions", "Seat height"],
  1039: ["dimensions", "Rake"],
  1040: ["dimensions", "Trail"],
  1541: ["dimensions", "Weight"],
  1664: ["dimensions", "Curb weight"],
  1666: ["dimensions", "Wet weight"],
  // fuelEconomy
  1618: ["fuelEconomy", "Fuel capacity"],
  1674: ["fuelEconomy", "Average consumption"],
  1678: ["fuelEconomy", "Full-tank range"],
  // electrical (EV power system)
  1622: ["electrical", "Power pack"],
  1623: ["electrical", "Nominal capacity"],
  1624: ["electrical", "Maximum capacity"],
  1625: ["electrical", "Charger type"],
  1626: ["electrical", "Charging time (normal)"],
  1627: ["electrical", "Charging time (quick)"],
  1628: ["electrical", "Range"],
};

const UNIT_PRETTY = { cm3: "cc", KW: "kW", Nm: "Nm", kg: "kg", mm: "mm" };
function formatValue(value, unit) {
  if (!value) return null;
  const v = String(value).trim();
  if (!unit) return v;
  return `${v} ${UNIT_PRETTY[unit] ?? unit}`;
}

function titleMake(name) {
  // Title-case all-caps brand names of length ≥ 4 (YAMAHA → Yamaha); keep short
  // acronyms (KTM, BMW, SYM, MZ) as-is. Cosmetic.
  if (/^[A-Z0-9]+$/.test(name) && name.length >= 4) {
    return name.charAt(0) + name.slice(1).toLowerCase();
  }
  return name;
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildDisplayModel(parts) {
  const seen = new Set();
  const kept = [];
  for (const p of parts) {
    if (!p) continue;
    const norm = p.trim();
    if (!norm) continue;
    const key = norm.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    kept.push(norm);
  }
  // Car2DB splits some models (model "MT" + serie "-07"); collapse the stray
  // space before a hyphen ("MT -07" → "MT-07") and any double spaces.
  return kept
    .join(" ")
    .replace(/\s+-/g, "-")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// ---------- load ----------
console.log(`Loading CSVs from ${DIR} …`);
const makes = new Map(loadCsv("car_make.csv").map((r) => [r[0], r[1]]));
const models = new Map(
  loadCsv("car_model.csv").map((r) => [r[0], { make: r[1], name: r[2] }]),
);
const series = new Map(
  loadCsv("car_serie.csv").map((r) => [r[0], { model: r[1], name: r[2] }]),
);
const trims = new Map(
  loadCsv("car_trim.csv").map((r) => [
    r[0],
    { serie: r[1], model: r[2], name: r[3] },
  ]),
);
const yearRows = loadCsv("year.csv"); // [id, make, model, gen, serie, trim, equip, year, type]

// spec values grouped by trim
const valuesByTrim = new Map();
for (const r of loadCsv("car_specification_value.csv")) {
  const trim = r[1];
  const specId = Number(r[2]);
  const value = r[3];
  const unit = r[4];
  if (!trim || !SPEC_META[specId]) continue;
  if (!valuesByTrim.has(trim)) valuesByTrim.set(trim, []);
  valuesByTrim.get(trim).push({ specId, value, unit });
}

console.log(
  `  makes=${makes.size} models=${models.size} series=${series.size} ` +
    `trims=${trims.size} year_rows=${yearRows.length} trims_with_specs=${valuesByTrim.size}`,
);

// ---------- build catalogue rows ----------
const SPEC_ORDER = [
  "identification",
  "engine",
  "electrical",
  "engineOutput",
  "drivetrain",
  "chassis",
  "brakes",
  "wheelsTyres",
  "dimensions",
  "fuelEconomy",
  "torqueSpecs",
];

function buildSpecs(trimId) {
  const vals = valuesByTrim.get(trimId);
  if (!vals) return {};
  const byCat = {};
  for (const { specId, value, unit } of vals) {
    const [category, label] = SPEC_META[specId];
    const v = formatValue(value, unit);
    if (!v) continue;
    (byCat[category] ??= []).push({ label, value: v, source: "verified" });
  }
  // emit in canonical category order
  const out = {};
  for (const cat of SPEC_ORDER) if (byCat[cat]) out[cat] = byCat[cat];
  return out;
}

const bySlug = new Map();
let skippedNoTrim = 0;
let skippedNoSpecs = 0;

for (const r of yearRows) {
  const trimId = r[5];
  const yearStr = r[7];
  if (!trimId || !yearStr) {
    skippedNoTrim++;
    continue;
  }
  const trim = trims.get(trimId);
  if (!trim) continue;
  const modelId = trim.model ?? r[2];
  const model = models.get(modelId);
  if (!model) continue;
  const makeName = makes.get(model.make ?? r[1]);
  if (!makeName) continue;

  const serie = trim.serie ? series.get(trim.serie) : null;
  const displayModel = buildDisplayModel([
    model.name,
    serie?.name,
    trim.name,
  ]);
  const make = titleMake(makeName);
  const year = Number(yearStr);
  if (!Number.isInteger(year) || year < 1900 || year > 2100) continue;

  const slug = slugify(`${make}-${displayModel}-${year}`);
  if (bySlug.has(slug)) continue; // first trim-year wins

  const specs = buildSpecs(trimId);
  if (Object.keys(specs).length === 0) {
    skippedNoSpecs++;
    // keep identity-only rows too (dropdowns), but mark for lazy fill
  }

  bySlug.set(slug, {
    make,
    model: displayModel,
    year,
    slug,
    specs,
    source: "car2db",
    verified: Object.keys(specs).length > 0,
    specs_status: Object.keys(specs).length > 0 ? "ready" : null,
    specs_filled_at:
      Object.keys(specs).length > 0 ? new Date().toISOString() : null,
    vehicle_type: "motorcycle",
  });
}

let rows = [...bySlug.values()];
if (LIMIT) rows = rows.slice(0, LIMIT);

const withSpecs = rows.filter((r) => r.verified).length;
console.log(
  `Built ${rows.length} catalogue rows ` +
    `(${withSpecs} with specs, ${rows.length - withSpecs} identity-only); ` +
    `skipped ${skippedNoTrim} non-trim year rows, ${skippedNoSpecs} trims w/o mapped specs.`,
);
console.log(
  `Distinct makes: ${new Set(rows.map((r) => r.make)).size}; ` +
    `distinct make+model: ${new Set(rows.map((r) => r.make + "|" + r.model)).size}`,
);

if (DRY_RUN) {
  console.log("\n=== SAMPLE ROWS (dry-run, nothing written) ===");
  const sample = rows.filter((r) => r.verified).slice(0, 3);
  for (const s of sample) {
    console.log(`\n• ${s.make} ${s.model} (${s.year})  [slug: ${s.slug}]`);
    console.log(JSON.stringify(s.specs, null, 2));
  }
  console.log("\nDry-run complete — re-run without --dry-run to write.");
  process.exit(0);
}

// ---------- upsert ----------
const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to write (see Dashboard → Settings → API).",
  );
  process.exit(1);
}

const { createClient } = await import("@supabase/supabase-js");
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

const BATCH = 500;
let written = 0;
for (let i = 0; i < rows.length; i += BATCH) {
  const chunk = rows.slice(i, i + BATCH);
  const { error } = await supabase
    .from("motorcycle_models")
    .upsert(chunk, { onConflict: "slug", ignoreDuplicates: false });
  if (error) {
    console.error(`Batch ${i / BATCH} failed:`, error.message);
    process.exit(1);
  }
  written += chunk.length;
  if (i % (BATCH * 10) === 0 || i + BATCH >= rows.length) {
    console.log(`  upserted ${written}/${rows.length}`);
  }
}
console.log(`Done — upserted ${written} catalogue rows.`);
