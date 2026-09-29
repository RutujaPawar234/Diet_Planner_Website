import { AppError } from './AppError.js';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Plans and progress entries belong to a calendar day, not an instant.
 * We store them as UTC midnight so "2026-09-29" means the same day for every client.
 */
export function toDateOnly(value) {
  if (typeof value !== 'string' || !DATE_RE.test(value)) {
    throw new AppError('Invalid date, expected format YYYY-MM-DD', 400);
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || toISODate(date) !== value) {
    throw new AppError('Invalid calendar date', 400);
  }
  return date;
}

export const toISODate = (date) => new Date(date).toISOString().slice(0, 10);

export const todayISO = () => toISODate(new Date());

/** Today's date in the machine's local timezone (used by the seed script). */
export const localTodayISO = () => new Date().toLocaleDateString('en-CA'); // en-CA formats as YYYY-MM-DD

export const addDays = (date, days) => new Date(new Date(date).getTime() + days * DAY_MS);

export const isISODate = (value) => DATE_RE.test(value);
