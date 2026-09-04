// KRA (Kenya Revenue Authority) tax helpers — mirrored from
// server/lib/kraTax.js so the invoice UI shows the same KRA-compliant rates.
// Rates in force: VAT 16% (standard), 0% (exempt), WHT 5% (professional fees).

export const KRA_RATES = Object.freeze({
  VAT_STANDARD_PCT: 16,
  VAT_ZERO_PCT: 0,
  WITHHOLDING_PROFESSIONAL_PCT: 5,
  WITHHOLDING_NON_RESIDENT_PCT: 20,
  TURNOVER_TAX_PCT: 3,
  CORPORATION_TAX_PCT: 30,
});

export const TAX_PRESETS = Object.freeze([
  { type: "vat", pct: 16, rate: 0.16, label: "VAT (16%) — KRA standard rate" },
  { type: "none", pct: 0, rate: 0, label: "No tax / VAT-exempt (0%)" },
  { type: "withholding", pct: 5, rate: 0.05, label: "Withholding Tax (5%) — professional fees" },
]);

/** Convert a stored rate (0.16 or 16) into a display percent (16). */
export function rateToPct(value) {
  const n = Number(value);
  if (!isFinite(n) || n <= 0) return 0;
  if (n > 1) return n;
  return Math.round(n * 10000) / 100;
}

/** KRA-aware label for a tax line on invoices/quotes/receipts. */
export function taxLabel(pct) {
  const p = Number(pct) || 0;
  if (p <= 0) return "";
  const r = Math.round(p);
  if (r === KRA_RATES.VAT_STANDARD_PCT && p === r) return "VAT (16%)";
  if (r === KRA_RATES.WITHHOLDING_PROFESSIONAL_PCT && p === r) return "Withholding Tax (5%)";
  if (r === KRA_RATES.WITHHOLDING_NON_RESIDENT_PCT && p === r) return "Withholding Tax (20%)";
  if (r === KRA_RATES.TURNOVER_TAX_PCT && p === r) return "Turnover Tax (3%)";
  return `Tax (${p}%)`;
}

/** Round to 2 decimal places (KES cents). */
export function roundMoney(n) {
  const v = Number(n || 0);
  return Math.round((v + Number.EPSILON) * 100) / 100;
}