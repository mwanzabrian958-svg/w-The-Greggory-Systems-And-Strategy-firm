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

/**
 * The year the firm was founded. Drives every tenure figure on the site.
 *
 * CONFIRMED 2023 by the firm — this is the real founding year, not an estimate
 * and not derived from the git history (the repo's first commit is 2025, which
 * only records when the code was written, not when the business started).
 *
 * Do NOT "fix" this to 2024 to match the `© 2024` in README.md: that copyright
 * line predates this value and is not the founding date. Changing this constant
 * silently shifts the advertised tenure by a year forever, because every figure
 * on the site is computed from it.
 */
export const FOUNDED_YEAR = 2023;

/**
 * The tenure the firm is entitled to claim regardless of the clock.
 *
 * Acts as a floor: if a visitor's device has a badly wrong year (or the site is
 * viewed just before a timezone rolls over on 31 Dec), we never advertise a
 * LOWER number than we are entitled to.
 *
 * At the confirmed 2023 founding year this equals `2026 - 2023 = 3` exactly, so
 * the floor is currently a no-op safety net rather than a fudge factor. It only
 * ever engages if the site's clock is wrong. Keep it in step with FOUNDED_YEAR
 * if the founding year is ever revised.
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