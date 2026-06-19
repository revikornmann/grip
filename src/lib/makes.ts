/**
 * Display-only formatting for motorcycle make names.
 *
 * The catalog stores makes in inconsistent casing — some all-caps
 * (`HARLEY-DAVIDSON`, `MOTO GUZZI`, `ROYAL ENFIELD`), some title-case (`Honda`).
 * `prettifyMake` normalises them to title case for display while leaving genuine
 * acronyms (BMW, KTM, MV, …) uppercase. The raw catalog value must still be used
 * for queries and links — only labels shown to the user should be prettified.
 */
const MAKE_ACRONYMS = new Set([
  "BMW",
  "KTM",
  "MV",
  "BRP",
  "SYM",
  "TGB",
  "CPI",
  "BSA",
  "AJS",
  "AJP",
  "MZ",
  "NCR",
  "MTT",
  "VOR",
  "SWM",
  "PGO",
  "GG",
  "IZH",
  "BFG",
  "ATK",
  "CCM",
  "EBR",
  "HRD",
  "NSU",
  "WRM",
]);

export function prettifyMake(make: string): string {
  return make
    .toLowerCase()
    .replace(/[a-z0-9]+/g, (word) =>
      MAKE_ACRONYMS.has(word.toUpperCase())
        ? word.toUpperCase()
        : word.charAt(0).toUpperCase() + word.slice(1),
    );
}
