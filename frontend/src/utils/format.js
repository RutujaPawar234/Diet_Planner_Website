const numberFmt = new Intl.NumberFormat('en-IN');

export const formatNumber = (value, decimals = 0) =>
  value == null || Number.isNaN(Number(value))
    ? '—'
    : new Intl.NumberFormat('en-IN', { maximumFractionDigits: decimals }).format(value);

export const formatKcal = (value) => `${numberFmt.format(Math.round(value || 0))} kcal`;

/** "2026-09-29" → "Tue, 29 Sep" (parsed as a local calendar date, not UTC). */
export function formatDate(iso, options = { weekday: 'short', day: 'numeric', month: 'short' }) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-IN', options);
}

export const formatLongDate = (iso) =>
  formatDate(iso, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || 'U';

export const capitalize = (text = '') => text.charAt(0).toUpperCase() + text.slice(1);

export const firstName = (name = '') => name.split(' ')[0] || name;
