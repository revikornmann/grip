import type { Units } from "./units";
import type { MotorcycleSpecs, MotorcycleSpecRow } from "@/types/motorcycle";

/**
 * Spec values are stored with BOTH unit systems baked into the string, in one
 * of two shapes:
 *
 *   "1084 cc / 66.1 cu in"          metric / imperial   (slash-separated)
 *   "20 Nm (15 lb·ft)"              metric (imperial)    (imperial in parens)
 *   "6.1 L/100 km / 16.4 km/L / 35.6 US mpg"   metric / metric-alt / imperial
 *
 * Rather than converting numbers (which would double-up or corrupt the already
 * present counterpart), we SELECT the side matching the chosen unit system and
 * drop the other. Values with only one system (e.g. "99 × 70.5 mm" bore/stroke,
 * tyre code "110/80 R19", "20 Nm + 90°") have no counterpart to pick, so they
 * pass through unchanged.
 */

// Imperial unit tokens. Word-boundaried so they don't fire inside other words.
const IMPERIAL = /(?:\bcu\s?in\b|\bin\b|\bft\b|\blbs?\b|\blb[·\-]ft\b|\bhp\b|\bmph\b|\bgal\b|\bmpg\b|\bpsi\b|°F)/;
// Metric unit tokens (kgf·m is metric-origin, grouped here, not imperial).
const METRIC = /(?:\bmm\b|\bcm\b|\bkm\/h\b|\bkm\/L\b|\bkm\b|\bcc\b|\bkgf\b|\bkg\b|\bN(?:·|⋅|-)?m\b|\bkW\b|\bbar\b|\bL\b|\bm\b|°C)/;

function isImperial(part: string): boolean {
  return IMPERIAL.test(part);
}

function isMetric(part: string): boolean {
  return METRIC.test(part) && !IMPERIAL.test(part);
}

/**
 * Pick the metric or imperial representation out of a dual-unit string.
 * Returns the input unchanged when there is no clear two-system split.
 */
export function selectUnitText(text: string, units: Units): string {
  // Shape: "<dual> — <dual>" — a range of two dual-unit values (e.g. seat
  // height "840 mm / 33.0 in — 860 mm / 33.8 in"). Resolve each side, rejoin.
  for (const sep of [" — ", " – "]) {
    if (text.includes(sep)) {
      return text
        .split(sep)
        .map((segment) => selectUnitText(segment, units))
        .join(sep);
    }
  }

  // Shape: "metric (imperial)" — imperial parenthetical at the very end.
  const paren = /^(.*\S)\s*\(([^()]+)\)\s*$/.exec(text);
  if (paren && isMetric(paren[1]) && isImperial(paren[2])) {
    return units === "imperial" ? paren[2].trim() : paren[1].trim();
  }

  // Shape: "metric / … / imperial" — slash-separated, units on each side.
  if (text.includes(" / ")) {
    // Preserve a leading non-numeric prefix such as "@ " on hints.
    const split = /^(\D*?)(\d.*)$/.exec(text);
    const prefix = split ? split[1] : "";
    const body = split ? split[2] : text;

    const parts = body.split(" / ");
    const imperial = parts.filter(isImperial);
    const metric = parts.filter(isMetric);

    if (imperial.length > 0 && metric.length > 0) {
      const chosen = units === "imperial" ? imperial : metric;
      return prefix + chosen.join(" / ");
    }
  }

  return text;
}

function convertRow(
  row: MotorcycleSpecRow,
  units: Units,
  category: keyof MotorcycleSpecs,
): MotorcycleSpecRow {
  // Engine displacement (cc) is the canonical metric figure for motorcycles —
  // keep both metric and imperial regardless of the selected unit system.
  if (category === "engine" && /\bcc\b/.test(row.value)) {
    return row;
  }

  const value = selectUnitText(row.value, units);
  const hint = row.hint ? selectUnitText(row.hint, units) : row.hint;
  if (value === row.value && hint === row.hint) return row;
  return { ...row, value, hint };
}

/**
 * Project a full spec set onto the chosen unit system, dropping the other
 * system's text from each value/hint that carries both.
 */
export function convertSpecs(
  specs: MotorcycleSpecs,
  units: Units,
): MotorcycleSpecs {
  const result: MotorcycleSpecs = {};
  for (const [category, rows] of Object.entries(specs) as [
    keyof MotorcycleSpecs,
    MotorcycleSpecRow[],
  ][]) {
    result[category] = rows.map((row) => convertRow(row, units, category));
  }
  return result;
}

/** Kilometres to whole miles, for the odometer reading. */
export function kmToMiles(km: number): number {
  return Math.round(km * 0.621371);
}
