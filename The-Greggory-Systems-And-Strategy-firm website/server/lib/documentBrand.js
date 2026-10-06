// =============================================================================
// Shared brand stamps for every PDF the firm generates (invoices/quotes/
// receipts, completion certificates, personnel profile exports).
//   - stampLogo()      → phoenix emblem at the top of the document
//   - stampWatermark() → large diagonal, near-transparent notice drawn FIRST
//                        so all content paints over it
// =============================================================================
"use strict";
const fs = require("fs");
const path = require("path");

const LOGO_PATH = path.join(__dirname, "..", "..", "public", "apple-touch-icon.png");
let logoCache = null;

/** Cached logo bytes (square phoenix emblem, white background). */
function brandLogo() {
  if (!logoCache) logoCache = fs.readFileSync(LOGO_PATH);
  return logoCache;
}

/**
 * Draw the emblem at (x, y). Never throws — a missing/corrupt logo must not
 * fail document generation.
 * @returns {boolean} whether the logo was stamped.
 */
function stampLogo(doc, x, y, size) {
  const s = size || 46;
  try {
    doc.image(brandLogo(), x, y, { width: s, height: s });
    return true;
  } catch (e) {
    console.error("[brand] logo stamp failed:", e.message);
    return false;
  }
}

/**
 * Diagonal watermark centred on the page at ~8% opacity. Call BEFORE any
 * content so the text sits underneath. Safe to call from a `pageAdded`
 * handler — it never overflows, so it cannot trigger another page break.
 */
function stampWatermark(doc, text) {
  const label = text || "THE GREGGORY SYSTEMS AND STRATEGY FIRM";
  const ox = doc.x;
  const oy = doc.y;
  try {
    doc.save();
    doc.fillColor("#0f172a", 0.08);
    doc.font("Helvetica-Bold").fontSize(36);
    const w = doc.widthOfString(label);
    doc.translate(doc.page.width / 2, doc.page.height / 2);
    doc.rotate(-30);
    doc.text(label, -w / 2, -24, { lineBreak: false });
    doc.restore();
  } catch (e) {
    console.error("[brand] watermark failed:", e.message);
    try { doc.restore(); } catch { /* restore without save — ignore */ }
  }
  // pdfkit tracks x/y in JS, outside the PDF graphics state — put them back.
  doc.x = ox;
  doc.y = oy;
}

module.exports = { brandLogo, stampLogo, stampWatermark };
