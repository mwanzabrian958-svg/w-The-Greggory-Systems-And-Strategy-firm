// ============================================================================
// Company tenure — the "Years Active" figure shown on the marketing pages.
//
// THE COUNTER IS DERIVED, NOT STORED. There is deliberately no counter to bump
// by hand and no cron job: a stored number always goes stale, because someone
// has to remember to update it on New Year's Day and usually doesn't.
//
// Instead we record only WHEN the firm was founded and derive the count from
// the calendar. That reproduces the requested behaviour exactly —
// 3 years this year, +1 automatically on the 1st of January next year, +1 again
// the year after that — with no code change and no deploy each new year.
//
//   2026 -> 3   |   2027 -> 4   |   2028 -> 5
//
// If the firm is re-founded, the founding year, or the baseline below, is the
// only thing that ever needs editing.
// ============================================================================

/** The year the firm was founded. Drives every tenure figure on the site. */
export const FOUNDED_YEAR = 2023;

/**
 * The tenure the firm is entitled to claim regardless of the clock.
 *
 * Acts as a floor: if a visitor's device has a badly wrong year (or the site is
 * viewed just before a timezone rolls over on 31 Dec), we never advertise a
 * LOWER number than we are entitled to. Change this only if the firm's real
 * founding date changes.
 */
export const MIN_YEARS_ACTIVE = 3;

/**
 * Years the firm has been active, as a plain number (3, 4, 5, ...).
 *
 * Deliberately computed from the current calendar year only — NOT from the
 * month or day — so the figure flips exactly on 1 January rather than drifting
 * part-way through the founding year.
 */
export function getYearsActive(now = new Date()) {
  const elapsed = now.getFullYear() - FOUNDED_YEAR;
  // Never report fewer years than the baseline, and never a negative number.
  return Math.max(MIN_YEARS_ACTIVE, elapsed);
}

/**
 * The same figure pre-formatted for display, e.g. `'3'` or `'4'`.
 *
 * The trailing "+" is kept on purpose: it reads as "3 or more", which stays
 * true forever and therefore never needs a yearly edit.
 */
export function getYearsActiveLabel(now = new Date()) {
  return `${getYearsActive(now)}+`;
}