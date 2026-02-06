const NL_LOCALE = 'nl-NL';

export function formatNumber(value: number, decimals?: number): string {
  return new Intl.NumberFormat(NL_LOCALE, {
    minimumFractionDigits: decimals ?? 0,
    maximumFractionDigits: decimals ?? 2,
  }).format(value);
}

export function formatCurrency(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat(NL_LOCALE, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(NL_LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

export function formatPercentage(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat(NL_LOCALE, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
