/**
 * Dutch license plate validation and formatting.
 *
 * Supports sidecodes 4–9 (covers all plates issued since 1978).
 * Patterns are checked against the normalized (no-dash, uppercase) form.
 */

const DUTCH_PLATE_PATTERNS: RegExp[] = [
  /^[A-Z]{2}\d{2}[A-Z]{2}$/, // sidecode 4: XX-99-XX
  /^\d{2}[A-Z]{4}$/, // sidecode 5: 99-XX-XX
  /^\d{2}[A-Z]{3}\d$/, // sidecode 6: 99-XXX-9
  /^\d[A-Z]{3}\d{2}$/, // sidecode 7: 9-XXX-99
  /^[A-Z]{2}\d{3}[A-Z]$/, // sidecode 8: XX-999-X
  /^[A-Z]\d{3}[A-Z]{2}$/, // sidecode 9: X-999-XX
];

/** Strip dashes and spaces, uppercase. */
export function normalizePlate(input: string): string {
  return input.toUpperCase().replace(/[\s-]/g, "");
}

/** Check whether the input matches a known Dutch plate format. */
export function isValidDutchPlate(input: string): boolean {
  const normalized = normalizePlate(input);
  return DUTCH_PLATE_PATTERNS.some((p) => p.test(normalized));
}

/**
 * Add dashes to a normalized 6-character plate for display.
 * Returns the input unchanged if no known pattern matches.
 */
export function formatPlateDisplay(normalized: string): string {
  if (normalized.length !== 6) return normalized;

  // sidecode 4: XX-99-XX  /  sidecode 5: 99-XX-XX
  if (
    /^[A-Z]{2}\d{2}[A-Z]{2}$/.test(normalized) ||
    /^\d{2}[A-Z]{4}$/.test(normalized)
  ) {
    return `${normalized.slice(0, 2)}-${normalized.slice(2, 4)}-${normalized.slice(4)}`;
  }

  // sidecode 6: 99-XXX-9  /  sidecode 8: XX-999-X
  if (
    /^\d{2}[A-Z]{3}\d$/.test(normalized) ||
    /^[A-Z]{2}\d{3}[A-Z]$/.test(normalized)
  ) {
    return `${normalized.slice(0, 2)}-${normalized.slice(2, 5)}-${normalized.slice(5)}`;
  }

  // sidecode 7: 9-XXX-99  /  sidecode 9: X-999-XX
  if (
    /^\d[A-Z]{3}\d{2}$/.test(normalized) ||
    /^[A-Z]\d{3}[A-Z]{2}$/.test(normalized)
  ) {
    return `${normalized.slice(0, 1)}-${normalized.slice(1, 4)}-${normalized.slice(4)}`;
  }

  return normalized;
}
