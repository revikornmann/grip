export const regionOptions = [
  'europe',
  'china',
  'india',
  'indonesia',
  'japan',
  'united-states',
  'vietnam',
  'latin-america',
] as const;

export type Region = (typeof regionOptions)[number];

export const defaultRegion: Region = 'europe';

export const REGION_STORAGE_KEY = 'region';

/** next-intl message keys for each region's display label (under the `region` namespace). */
export const regionLabelKeys: Record<Region, string> = {
  europe: 'europe',
  china: 'china',
  india: 'india',
  indonesia: 'indonesia',
  japan: 'japan',
  'united-states': 'unitedStates',
  vietnam: 'vietnam',
  'latin-america': 'latinAmerica',
};

/**
 * Curated, popularity-ordered brand lists per region.
 *
 * The catalog (`motorcycle_models`) has no region or popularity data, so the
 * "popular brands in {region}" home section is editorial: each list leads with
 * brands that are prominent in that market, then falls back to globally popular
 * makes so every region can still surface a full ten. Entries are matched
 * case-insensitively against the makes actually present in the catalog (see
 * `popularBrandsForRegion`), so a brand that isn't in the dataset is simply
 * skipped. Names use the canonical catalog spelling where it matters for the
 * leading, region-specific picks.
 */
const REGION_BRANDS: Record<Region, string[]> = {
  europe: [
    'BMW',
    'Ducati',
    'KTM',
    'Triumph',
    'Aprilia',
    'MV AGUSTA',
    'MOTO GUZZI',
    'Husqvarna',
    'Vespa',
    'Beta',
    'ROYAL ENFIELD',
    'Honda',
    'Yamaha',
    'Kawasaki',
    'Suzuki',
  ],
  china: [
    'Honda',
    'Yamaha',
    'Suzuki',
    'Kawasaki',
    'Benelli',
    'Cfmoto',
    'Geely',
    'Lifan',
    'Super SOCO',
    'BMW',
    'Ducati',
    'KTM',
    'Triumph',
    'Vespa',
  ],
  india: [
    'ROYAL ENFIELD',
    'Bajaj',
    'Honda',
    'Yamaha',
    'Suzuki',
    'KTM',
    'Kawasaki',
    'BMW',
    'Ducati',
    'Triumph',
    'Aprilia',
    'Husqvarna',
  ],
  indonesia: [
    'Honda',
    'Yamaha',
    'Suzuki',
    'Kawasaki',
    'Vespa',
    'KTM',
    'BMW',
    'Ducati',
    'Benelli',
    'Triumph',
    'ROYAL ENFIELD',
    'Aprilia',
  ],
  japan: [
    'Honda',
    'Yamaha',
    'Suzuki',
    'Kawasaki',
    'BMW',
    'Ducati',
    'KTM',
    'Triumph',
    'HARLEY-DAVIDSON',
    'Vespa',
    'Aprilia',
  ],
  'united-states': [
    'HARLEY-DAVIDSON',
    'Indian',
    'Honda',
    'Yamaha',
    'Kawasaki',
    'Suzuki',
    'BMW',
    'Ducati',
    'KTM',
    'Triumph',
    'Victory',
    'Zero',
    'Polaris',
  ],
  vietnam: [
    'Honda',
    'Yamaha',
    'Suzuki',
    'Kawasaki',
    'SYM',
    'Piaggio',
    'Vespa',
    'KTM',
    'BMW',
    'Ducati',
    'Benelli',
    'Triumph',
  ],
  'latin-america': [
    'Honda',
    'Yamaha',
    'Suzuki',
    'Kawasaki',
    'Bajaj',
    'ROYAL ENFIELD',
    'BMW',
    'KTM',
    'Ducati',
    'Triumph',
    'Dafra Motos',
    'HARLEY-DAVIDSON',
  ],
};

/**
 * The popular brands to show for a region, in curated order, limited to brands
 * that exist in the catalog. `availableMakes` is the catalog's make list (raw
 * casing); the returned values use that exact casing so they can be passed
 * straight back to the make-keyed catalog queries.
 */
export function popularBrandsForRegion(
  region: Region,
  availableMakes: string[],
  limit = 10,
): string[] {
  const byLower = new Map(availableMakes.map((m) => [m.toLowerCase(), m]));
  const out: string[] = [];
  const seen = new Set<string>();
  for (const brand of REGION_BRANDS[region]) {
    const match = byLower.get(brand.toLowerCase());
    if (!match || seen.has(match)) continue;
    seen.add(match);
    out.push(match);
    if (out.length >= limit) break;
  }
  return out;
}
