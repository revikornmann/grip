export const unitsOptions = ['metric', 'imperial'] as const;
export type Units = (typeof unitsOptions)[number];

export const defaultUnits: Units = 'metric';

export const UNITS_STORAGE_KEY = 'units';

export const unitsLabelKeys: Record<Units, string> = {
  metric: 'unitsMetric',
  imperial: 'unitsImperial',
};
