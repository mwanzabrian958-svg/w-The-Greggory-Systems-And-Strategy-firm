/**
 * Tests for the auto-incrementing "Years Active" figure (src/utils/companyStats.js).
 *
 * The requirement is specific and must keep holding without anyone editing the
 * site each New Year: the firm reads 3 years today, 4 on 1 January next year,
 * 5 the year after, and so on forever.
 *
 * Because the count is DERIVED from a founding year rather than stored, there is
 * nothing to bump by hand — these tests pin the derived behaviour so a future
 * refactor cannot quietly reintroduce a hardcoded number.
 */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// backend/tests/ -> backend/ -> <website>/src/utils/companyStats.js
const SRC = path.join(__dirname, '..', '..', 'src', 'utils', 'companyStats.js');

/**
 * The util is ESM (it is consumed by Vite/React), so load it here by
 * transpiling just this one dependency-free module to a CommonJS shim.
 * Avoids needing a global ESM loader or duplicating the constants.
 */
function loadCompanyStats() {
  const source = fs.readFileSync(SRC, 'utf8');
  // `export const X =` -> `const X =`, and drop the ESM export keywords, so the
  // file can be evaluated as CJS. Only the trailing `export` lines are touched.
  const cjs = source
    .replace(/^export\s+const\s+/gm, 'const ')
    .replace(/^export\s+function\s+/gm, 'function ')
    .concat('\nmodule.exports = { getYearsActive, getYearsActiveLabel, FOUNDED_YEAR, MIN_YEARS_ACTIVE };\n');
  const module = { exports: {} };
  // eslint-disable-next-line no-new-func
  new Function('module', 'exports', cjs)(module, module.exports);
  return module.exports;
}

const { getYearsActive, getYearsActiveLabel, FOUNDED_YEAR, MIN_YEARS_ACTIVE } = loadCompanyStats();

test('reports the baseline tenure in the founding year + baseline', () => {
  assert.strictEqual(getYearsActive(new Date(FOUNDED_YEAR + MIN_YEARS_ACTIVE, 0, 1)), 3);
});

test('increments by exactly one each calendar year (3 -> 4 -> 5)', () => {
  assert.strictEqual(getYearsActive(new Date(2026, 0, 1)), 3);
  assert.strictEqual(getYearsActive(new Date(2027, 0, 1)), 4);
  assert.strictEqual(getYearsActive(new Date(2028, 0, 1)), 5);
  assert.strictEqual(getYearsActive(new Date(2029, 0, 1)), 6);
  assert.strictEqual(getYearsActive(new Date(2035, 0, 1)), 12);
});

test('flips on 1 January, not part-way through the year', () => {
  // 31 Dec still shows the old figure; the very next day shows the new one.
  assert.strictEqual(getYearsActive(new Date(2026, 11, 31)), 3);
  assert.strictEqual(getYearsActive(new Date(2027, 0, 1)), 4);
  // The month/day are ignored entirely, so mid-year must equal that year's value.
  assert.strictEqual(getYearsActive(new Date(2027, 6, 15)), 4);
  assert.strictEqual(getYearsActive(new Date(2027, 11, 31)), 4);
});

test('never reports fewer years than the baseline (bad clock safety)', () => {
  assert.strictEqual(getYearsActive(new Date(2020, 0, 1)), MIN_YEARS_ACTIVE);
  assert.strictEqual(getYearsActive(new Date(1999, 0, 1)), MIN_YEARS_ACTIVE);
  // Never negative, even far before the founding year.
  assert.ok(getYearsActive(new Date(1950, 0, 1)) >= 0);
});

test('the display label keeps the "+" so it reads as "3 or more"', () => {
  assert.strictEqual(getYearsActiveLabel(new Date(2026, 0, 1)), '3+');
  assert.strictEqual(getYearsActiveLabel(new Date(2027, 0, 1)), '4+');
});

test('defaults to the current date when no argument is supplied', () => {
  assert.strictEqual(typeof getYearsActive(), 'number');
  assert.ok(getYearsActive() >= MIN_YEARS_ACTIVE);
});