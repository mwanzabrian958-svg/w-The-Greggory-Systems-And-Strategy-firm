"use strict";
/**
 * KRA (Kenya Revenue Authority) tax rate registry & helpers.
 * ==========================================================
 * Single source of truth for the tax rates this app can apply to invoices,
 * quotes and ledger entries. Kept deliberately small and readable so a rate
 * change in a Finance Act is a one-line edit — not a hunt through PDF/HTML
 * renderers.
 *
 * Rates in force (as of the latest Finance Act consolidation):
 *   - VAT standard rate ........................ 16%   (0.16)
 *   - VAT zero-rated / exempt supplies .........  0%   (0)
 *   - Withholding tax — professional/consultancy
 *     fees (resident) ..........................  5%   (0.05)
 *   - Withholding tax (non-resident) ........... 20%   (0.20)
 *   - Turnover tax (turnover <= KES 25M) .......  3%   (0.03)
 *   - Corporation tax (resident companies) ..... 30%   (0.30)
 */

const KRA_RATES = Object.freeze({
  VAT_STANDARD_PCT: 16,
  VAT_STANDARD_RATE: 0.16,
  VAT_ZERO_PCT: 0,
  WITHHOLDING_PROFESSIONAL_PCT: 5,
  WITHHOLDING_PROFESSIONAL_RATE: 0.05,
  WITHHOLDING_NON_RESIDENT_PCT: 20,
  WITHHOLDING_NON_RESIDENT_RATE: 0.2,
  TURNOVER_TAX_PCT: 3,
  TURNOVER_TAX_RATE: 0.03,
  CORPORATION_TAX_PCT: 30,
  CORPORATION_TAX_RATE: 0.3,
});

/** Preset tax choices offered in the Create-Invoice UI. */
const TAX_PRESETS = Object.freeze([
  { type: "vat", pct: 16, rate: 0.16, label: "VAT (16%) — KRA standard rate" },
  { type: "none", pct: 0, rate: 0, label: "No tax / VAT-exempt (0%)" },
  { type: "withholding", pct: 5, rate: 0.05, label: "Withholding Tax (5%) — professional fees" },
]);

/** Firm's KRA PIN / VAT registration (env-configured; blank until provided). */
const KRA_PIN = String(process.env.COMPANY_KRA_PIN || "").trim();
const VAT_NUMBER = String(process.env.COMPANY_VAT_NUMBER || "").trim();

/**
 * Normalize any tax input to the DECIMAL FRACTION the `invoices` table expects.
 * DB columns: tax_rate DECIMAL(5,4), and `tax_amount` is a STORED generated
 * column `subtotal * tax_rate`. That means we MUST store 0.16 (not 16) —
 * storing 16 would compute tax_amount = subtotal * 16 (1600%!).
 * Accepts 0.16 (already fraction) OR 16 (whole percent) OR "16" (string).
 */
function normalizeRate(value) {
  let n = Number(value);
  if (!isFinite(n) || n < 0) return 0;
  if (n === 0) return 0;
  if (n <= 1) return Math.round(n * 10000) / 10000; // already a fraction: 0.16
  return Math.min(1, Math.round((n / 100) * 10000) / 10000); // percent → fraction
}

/** Convert a stored rate (0.16 or 16) into a display percent (16). */
function rateToPct(value) {
  let n = Number(value);
  if (!isFinite(n) || n <= 0) return 0;
  if (n > 1) return n; // stored as whole percent already
  return Math.round(n * 10000) / 100; // fraction → percent
}

/** KRA-aware label for a tax line on invoices/quotes/receipts. */
function taxLabel(pct) {
  const p = Number(pct) || 0;
  if (p <= 0) return "";
  const r = Math.round(p);
  if (r === KRA_RATES.VAT_STANDARD_PCT && p === r) return "VAT (16%)";
  if (r === KRA_RATES.WITHHOLDING_PROFESSIONAL_PCT && p === r) return "Withholding Tax (5%)";
  if (r === KRA_RATES.WITHHOLDING_NON_RESIDENT_PCT && p === r) return "Withholding Tax (20%)";
  if (r === KRA_RATES.TURNOVER_TAX_PCT && p === r) return "Turnover Tax (3%)";
  return `Tax (${p}%)`;
}

/** Round to 2 decimal places (KES cents) — matches DB DECIMAL(15,2). */
function roundMoney(n) {
  const v = Number(n || 0);
  return Math.round((v + Number.EPSILON) * 100) / 100;
}

module.exports = {
  KRA_RATES,
  TAX_PRESETS,
  KRA_PIN,
  VAT_NUMBER,
  normalizeRate,
  rateToPct,
  taxLabel,
  roundMoney,
};