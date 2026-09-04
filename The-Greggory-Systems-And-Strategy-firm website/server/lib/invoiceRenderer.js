// =============================================================================
// Professional invoice/quote/receipt renderers (PDF + email HTML).
// Mirrors the contractor/consultant print template the firm's clients expect:
//   brand banner + big document title → meta (number/date/due/status)
//   → bill-to block → line-item table (# / description / qty / rate / amount)
//   → subtotal + tax + bold total → payment instructions → notes → footer.
// =============================================================================
"use strict";
const PDFDocument = require("pdfkit");

const FIRM_LEGAL_NAME = "THE GREGGORY SYSTEMS AND STRATEGY FIRM";
const FIRM_TAGLINE = "Strategic Projects, Systems & Business Solutions";
const FIRM_EMAIL =
  process.env.COMPANY_EMAIL || "thegreggorysystemsandstrategyf@gmail.com";
const FIRM_PHONE = process.env.COMPANY_PHONE_NUMBER || "+254 115 525 854";
const FIRM_ADDRESS = process.env.COMPANY_ADDRESS || "Nairobi, Kenya";

/** Escape a value for safe interpolation into email HTML. */
const escHtml = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m]
  );

/** Money formatting shared by the PDF + email renderers. */
const fmtMoney = (num, currency = "KES") => {
  const n = Number(num || 0);
  return `${currency} ${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/** Normalize a stored invoice/quote `items` JSON into table rows. */
function parseDocumentItems(document) {
  let items = [];
  try {
    const raw =
      typeof document.items === "string"
        ? JSON.parse(document.items)
        : document.items;
    if (Array.isArray(raw)) items = raw;
  } catch (_) {
    /* fall through to fallback row */
  }
  if (!items.length) {
    const fallback = Number(
      document.grand_total ||
        document.total_amount ||
        document.subtotal ||
        document.amount ||
        0
    );
    items = [
      {
        description:
          document.title ||
          document.description ||
          "Professional services as per agreement",
        quantity: 1,
        unit_price: fallback,
        line_total: fallback,
      },
    ];
  }
  return items.map((it) => {
    const quantity = it.quantity != null ? Number(it.quantity) : 1;
    let line = it.line_total != null ? Number(it.line_total) : null;
    if (line == null && it.amount != null) line = Number(it.amount);
    let rate = it.unit_price != null ? Number(it.unit_price) : null;
    if (line != null && rate == null) rate = quantity ? line / quantity : line;
    if (rate != null && line == null) line = rate * quantity;
    if (line == null)
      line = Number(document.subtotal || document.total_amount || 0);
    return {
      description: String(
        it.item_description || it.description || "Service item"
      ),
      quantity,
      unit_price: rate ?? 0,
      line_total: line ?? 0,
    };
  });
}

/**
 * Totals for documents. `tax_rate` is DECIMAL(5,4) in the DB (0.16 = 16%)
 * but older clients may have sent a whole percent (16) — accept both.
 */
function documentTotals(document, items) {
  const subtotal = items.reduce((s, it) => s + it.line_total, 0);
  const rateRaw = Number(document.tax_rate || 0);
  const ratePct = rateRaw > 1 ? rateRaw : Math.round(rateRaw * 10000) / 100;
  const taxAmount =
    Number(document.tax_amount) > 0
      ? Number(document.tax_amount)
      : subtotal * (ratePct / 100);
  const total =
    Number(document.total_amount) > 0
      ? Number(document.total_amount)
      : subtotal + taxAmount;
  return { subtotal, taxAmount, ratePct, total };
}

/** Human-readable payment instruction lines. */
function paymentInstructions(document) {
  const method = String(document.payment_method || "mpesa").toLowerCase();
  const phone = document.payment_phone || FIRM_PHONE;
  const reference =
    document.invoice_number || document.payment_reference || "Invoice";
  if (method.includes("bank")) {
    return [
      "Bank Transfer",
      `Account / Details: ${phone}`,
      `Reference: ${reference}`,
    ];
  }
  if (method.includes("cash")) {
    return [`Cash Payment`, `Collect from: ${phone}`, `Reference: ${reference}`];
  }
  return [
    "M-Pesa Send Money (Lipa na M-Pesa)",
    `Send to: ${phone}`,
    `Use ${reference} as the account reference`,
  ];
}
/** Professional document PDF (A4 single page) — invoices / quotes / receipts. */
function generatePDFContent(type, document) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 42, size: "A4" });
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const PAGE_W = doc.page.width; // 595.28
    const PAGE_H = doc.page.height; // 841.89
    const M = 42;
    const CW = PAGE_W - 2 * M;
    const TEAL = "#0d9488";
    const INK = "#0f172a";
    const SLATE = "#64748b";
    const LIGHT = "#e2e8f0";

    const isQuote = String(type).toLowerCase().indexOf("quote") === 0;
    const isReceipt =
      String(type).toLowerCase().indexOf("receipt") === 0 || type === "transactions";
    const docTitle = isReceipt ? "RECEIPT" : isQuote ? "QUOTE" : "INVOICE";
    const ref =
      document.invoice_number ||
      document.quote_number ||
      document.transaction_id ||
      `${docTitle}-${document.id || 1}`;

    const items = parseDocumentItems(document);
    const { subtotal, taxAmount, ratePct, total } = documentTotals(document, items);
    const currency = document.currency || "KES";

    const clientLines = [
      document.client_name || "Client",
      document.client_email || "",
      document.client_phone || "",
      document.client_address || "",
    ].filter(Boolean);

    const statusValue = isReceipt
      ? "PAID"
      : String(document.status || (isQuote ? "QUOTED" : "SENT")).toUpperCase();

    const meta = [
      [isReceipt ? "TRANSACTION NO" : isQuote ? "QUOTE NO" : "INVOICE NO", ref],
      ["ISSUED", document.issue_date || String(document.created_at || "").slice(0, 10)],
    ];
    if (document.due_date) meta.push(["DUE DATE", document.due_date]);
    meta.push([isReceipt ? "PAID" : "STATUS", statusValue]);

    let y = 44;

    // ---- Brand banner + document title ----
    doc.rect(M, y, 250, 66).fill(INK);
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(15);
    doc.text("THE GREGGORY SYSTEMS", M + 16, y + 14, { width: 220 });
    doc.fontSize(10).text("AND STRATEGY FIRM", M + 16, y + 32, { width: 220 });
    doc.font("Helvetica").fontSize(7).fillColor("#5eead4");
    doc.text(FIRM_TAGLINE.toUpperCase(), M + 16, y + 49, { width: 220 });

    doc.fillColor(TEAL).font("Helvetica-Bold").fontSize(36);
    doc.text(docTitle, PAGE_W - M, y + 8, { width: 180, align: "right" });
    doc.fillColor(SLATE).font("Helvetica").fontSize(8);
    doc.text(`No. ${ref}`, PAGE_W - M, y + 52, { width: 180, align: "right" });
    y += 80;

    doc.rect(M, y, CW, 3).fill(TEAL);
    y += 20;

    // ---- Bill-to (left) + meta grid (right) ----
    const billTop = y;
    doc.fillColor(SLATE).font("Helvetica-Bold").fontSize(6.5);
    doc.text("BILL TO", M, billTop);
    doc.fillColor(INK).font("Helvetica-Bold").fontSize(13);
    doc.text(clientLines[0], M, billTop + 12, { width: 240 });
    doc.font("Helvetica").fontSize(8).fillColor(SLATE);
    let bly = billTop + 28;
    for (let i = 1; i < clientLines.length; i++) {
      doc.text(clientLines[i], M, bly, { width: 240 });
      bly += 11;
    }

    const metaX = PAGE_W - M - 200;
    const metaW = 200;
    meta.forEach((row, i) => {
      const ry = billTop + i * 19;
      doc.font("Helvetica-Bold").fontSize(6.5).fillColor(SLATE);
      doc.text(row[0], metaX, ry);
      doc.font("Helvetica-Bold").fontSize(8).fillColor(INK);
      doc.text(String(row[1]), metaX, ry + 8, { width: metaW, align: "right" });
    });

    y = Math.max(bly, billTop + meta.length * 19) + 22;

    // ---- Line items table ----
    const xIdx = M;
    const xDesc = M + 24;
    const xQty = PAGE_W - M - 195;
    const xRate = PAGE_W - M - 118;
    const xAmt = PAGE_W - M - 8;
    const colH = 18;

    doc.rect(M, y, CW, colH).fill(INK);
    doc.font("Helvetica-Bold").fontSize(6).fillColor("#ffffff");
    doc.text("#", xIdx, y + 6);
    doc.text("DESCRIPTION", xDesc, y + 6);
    doc.text("QTY", xQty, y + 6, { width: 60, align: "right" });
    doc.text("RATE", xRate, y + 6, { width: 60, align: "right" });
    doc.text("AMOUNT", xAmt, y + 6, { width: 70, align: "right" });
    y += colH;
let rowIdx = 1;
    for (const it of items) {
      const descW = xQty - xDesc - 8;
      doc.font("Helvetica").fontSize(7);
      const descH = doc.heightOfString(it.description, { width: descW });
      const rowH = Math.max(20, descH + 8);

      if ((rowIdx - 1) % 2 === 1) doc.rect(M, y, CW, rowH).fill("#f8fafc");

      doc.fillColor(SLATE).font("Helvetica-Bold").fontSize(6.5);
      doc.text(String(rowIdx), xIdx, y + 7);
      doc.font("Helvetica").fontSize(7).fillColor("#1e293b");
      doc.text(it.description, xDesc, y + 7, { width: descW });
      doc.fillColor(SLATE).font("Helvetica-Bold").fontSize(6.5);
      doc.text(String(it.quantity), xQty, y + 7, { width: 60, align: "right" });
      doc.text(fmtMoney(it.unit_price, currency), xRate, y + 7, { width: 60, align: "right" });
      doc.fillColor(INK).font("Helvetica-Bold").fontSize(7);
      doc.text(fmtMoney(it.line_total, currency), xAmt, y + 7, { width: 70, align: "right" });
      doc
        .moveTo(M, y + rowH)
        .lineTo(PAGE_W - M, y + rowH)
        .lineWidth(0.5)
        .strokeColor(LIGHT)
        .stroke();
      y += rowH;
      rowIdx++;
    }

    // ---- Totals ----
    y += 10;
    const totalX = PAGE_W - M - 150;
    const totalW = 150;
    doc.font("Helvetica").fontSize(8).fillColor(SLATE);
    doc.text("Subtotal", totalX, y);
    doc.font("Helvetica-Bold").fillColor(INK);
    doc.text(fmtMoney(subtotal, currency), totalX, y, { width: totalW, align: "right" });
    y += 15;
    if (ratePct > 0) {
      doc.font("Helvetica").fontSize(8).fillColor(SLATE);
      doc.text(`Tax (${ratePct}%)`, totalX, y);
      doc.font("Helvetica-Bold").fillColor(INK);
      doc.text(fmtMoney(taxAmount, currency), totalX, y, { width: totalW, align: "right" });
      y += 15;
    }
    doc
      .moveTo(totalX, y)
      .lineTo(PAGE_W - M, y)
      .lineWidth(1)
      .strokeColor(INK)
      .stroke();
    y += 10;
    doc.font("Helvetica-Bold").fontSize(10).fillColor(INK);
    doc.text("TOTAL", totalX, y);
    doc.font("Helvetica-Bold").fontSize(13).fillColor(TEAL);
    doc.text(fmtMoney(total, currency), totalX, y, { width: totalW, align: "right" });
    y += 24;
// ---- Payment instructions ----
    const lines = paymentInstructions(document);
    const boxH = 58;
    doc.rect(M, y, CW, boxH).fill("#f0fdfa");
    doc.rect(M, y, 3, boxH).fill(TEAL);
    doc.font("Helvetica-Bold").fontSize(6.5).fillColor(TEAL);
    doc.text("PAYMENT", M + 14, y + 10);
    doc.font("Helvetica-Bold").fontSize(8).fillColor(INK);
    doc.text(lines[0], M + 14, y + 20);
    doc.font("Helvetica").fontSize(7).fillColor(SLATE);
    for (let i = 1; i < lines.length; i++) {
      doc.text(lines[i], M + 14, y + 20 + i * 11);
    }
    y += boxH + 16;

    // ---- Notes / terms ----
    const noteText = [document.notes, document.terms_conditions, document.payment_terms]
      .filter((n) => n && String(n).trim())
      .join("\n");
    if (noteText) {
      doc.font("Helvetica-Bold").fontSize(6.5).fillColor(SLATE);
      doc.text("NOTES & TERMS", M, y);
      y += 11;
      doc.font("Helvetica").fontSize(8).fillColor("#475569");
      doc.text(noteText, M, y, { width: CW });
      y += 30;
    }

    // ---- Thank-you + branded footer ----
    doc.fontSize(8).fillColor(SLATE);
    doc.text(
      "Thank you for choosing The Greggory Systems And Strategy Firm.",
      M,
      y,
      { width: CW }
    );
    doc
      .moveTo(M, PAGE_H - 78)
      .lineTo(PAGE_W - M, PAGE_H - 78)
      .lineWidth(0.5)
      .strokeColor(LIGHT)
      .stroke();
    doc.font("Helvetica-Bold").fontSize(8).fillColor(INK);
    doc.text(FIRM_LEGAL_NAME, M, PAGE_H - 70, { width: CW });
    doc.font("Helvetica").fontSize(6.5).fillColor(SLATE);
    doc.text(`${FIRM_EMAIL}  ·  ${FIRM_PHONE}  ·  ${FIRM_ADDRESS}`, M, PAGE_H - 60, { width: CW });
    doc.text(`© ${new Date().getFullYear()} ${FIRM_LEGAL_NAME}. All rights reserved.`, M, PAGE_H - 48, { width: CW });

    doc.end();
  });
}
/**
 * Professional invoice/quote/receipt email HTML — the client-facing version of
 * the PDF, styled like a contractor/consultant print template. Self-contained
 * inline CSS (safe in Gmail/Outlook) and every supplied value is HTML-escaped.
 */
function buildDocumentEmailHtml(type, document) {
  const isQuote = String(type).toLowerCase().indexOf("quote") === 0;
  const isReceipt = String(type).toLowerCase().indexOf("receipt") === 0;
  const docTitle = isReceipt ? "RECEIPT" : isQuote ? "QUOTE" : "INVOICE";
  const ref =
    document.invoice_number || document.quote_number || document.transaction_id || "INV";
  const items = parseDocumentItems(document);
  const { subtotal, taxAmount, ratePct, total } = documentTotals(document, items);
  const currency = document.currency || "KES";
  const esc = escHtml;
  const money = (n, c) => fmtMoney(n, c);

  const payLines = paymentInstructions(document);

  const metaRows = [
    [isQuote ? "QUOTE NO" : "INVOICE NO", ref],
    ["ISSUED", document.issue_date || String(document.created_at || "").slice(0, 10)],
    ...(document.due_date ? [["DUE DATE", document.due_date]] : []),
    [
      isReceipt ? "PAID" : "STATUS",
      document.status
        ? String(document.status).toUpperCase()
        : isQuote
        ? "QUOTED"
        : "SENT",
    ],
  ]
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 0;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">${esc(k)}</td>` +
        `<td style="padding:6px 0;font-size:12px;font-weight:700;color:#0f172a;text-align:right;">${esc(v)}</td></tr>`
    )
    .join("");

  const rowsHtml = items
    .map(
      (it, i) =>
        `<tr${i % 2 === 1 ? ' style="background:#f8fafc;"' : ""}>
        <td style="padding:9px 8px;font-size:11px;color:#94a3b8;border-bottom:1px solid #eef2f7;">${i + 1}</td>
        <td style="padding:9px 8px;font-size:12px;font-weight:700;color:#1e293b;border-bottom:1px solid #eef2f7;">${esc(it.description)}</td>
        <td style="padding:9px 8px;font-size:11px;color:#64748b;text-align:right;border-bottom:1px solid #eef2f7;">${it.quantity}</td>
        <td style="padding:9px 8px;font-size:11px;color:#64748b;text-align:right;border-bottom:1px solid #eef2f7;">${money(it.unit_price, currency)}</td>
        <td style="padding:9px 8px;font-size:12px;font-weight:700;color:#0f172a;text-align:right;border-bottom:1px solid #eef2f7;">${money(it.line_total, currency)}</td>
      </tr>`
    )
    .join("");
const totalsRows = `
    <tr><td style="padding:5px 8px;font-size:11px;color:#64748b;">Subtotal</td>
        <td style="padding:5px 8px;font-size:12px;font-weight:700;color:#0f172a;text-align:right;">${money(subtotal, currency)}</td></tr>
    ${
      ratePct > 0
        ? `<tr><td style="padding:5px 8px;font-size:11px;color:#64748b;">Tax (${ratePct}%)</td>
        <td style="padding:5px 8px;font-size:12px;font-weight:700;color:#0f172a;text-align:right;">${money(taxAmount, currency)}</td></tr>`
        : ""
    }
    <tr><td style="padding:10px 8px 4px;border-top:2px solid #0f172a;font-size:12px;font-weight:800;color:#0f172a;text-transform:uppercase;">TOTAL</td>
        <td style="padding:10px 8px 4px;border-top:2px solid #0f172a;font-size:18px;font-weight:800;color:#0d9488;text-align:right;">${money(total, currency)}</td></tr>`;

  const notes = [document.notes, document.terms_conditions, document.payment_terms]
    .filter((n) => n && String(n).trim())
    .join("  ·  ");

  return `<!doctype html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#eef2f7;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f7;padding:24px 8px;">
    <tr><td align="center">
      <table width="620" cellpadding="0" cellspacing="0" style="width:620px;max-width:100%;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
        <tr><td colspan="2" style="height:6px;background:linear-gradient(90deg,#0f172a,#0d9488);font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr>
          <td style="background:#0f172a;color:#ffffff;padding:26px 30px;">
            <div style="font-size:9px;color:#5eead4;font-weight:700;letter-spacing:3px;text-transform:uppercase;">The Greggory Systems</div>
            <div style="font-size:22px;font-weight:800;letter-spacing:1px;margin-top:2px;">AND STRATEGY FIRM</div>
            <div style="font-size:10px;color:#94a3b8;margin-top:3px;">${esc(FIRM_TAGLINE)}</div>
          </td>
          <td align="right" style="background:#0f172a;color:#ffffff;padding:26px 30px;width:200px;">
            <div style="font-size:30px;font-weight:900;color:#5eead4;letter-spacing:3px;">${docTitle}</div>
            <div style="font-size:10px;color:#94a3b8;margin-top:2px;">No. ${esc(ref)}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:22px 30px 4px;width:50%;vertical-align:top;">
            <div style="font-size:9px;color:#64748b;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Billed To</div>
            <div style="font-size:15px;font-weight:800;color:#0f172a;margin-top:6px;">${esc(document.client_name || "Client")}</div>
            ${[document.client_email, document.client_phone, document.client_address]
              .filter(Boolean)
              .map((l) => `<div style="font-size:11px;color:#64748b;margin-top:2px;">${esc(l)}</div>`)
              .join("")}
          </td>
          <td style="padding:22px 30px 4px;width:50%;vertical-align:top;">
            <table width="100%" cellpadding="0" cellspacing="0">${metaRows}</table>
          </td>
        </tr>
<tr>
          <td colspan="2" style="padding:18px 30px 8px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
              <tr style="background:#0f172a;color:#ffffff;">
                <th style="padding:9px 8px;font-size:9px;text-align:left;letter-spacing:1px;text-transform:uppercase;">#</th>
                <th style="padding:9px 8px;font-size:9px;text-align:left;letter-spacing:1px;text-transform:uppercase;">Description</th>
                <th style="padding:9px 8px;font-size:9px;text-align:right;letter-spacing:1px;text-transform:uppercase;">Qty</th>
                <th style="padding:9px 8px;font-size:9px;text-align:right;letter-spacing:1px;text-transform:uppercase;">Rate</th>
                <th style="padding:9px 8px;font-size:9px;text-align:right;letter-spacing:1px;text-transform:uppercase;">Amount</th>
              </tr>
              ${rowsHtml}
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:10px 30px 24px;vertical-align:top;width:50%;">
            <div style="background:#f0fdfa;border-left:3px solid #0d9488;border-radius:6px;padding:12px 14px;margin-top:4px;">
              <div style="font-size:9px;font-weight:800;color:#0d9488;letter-spacing:1px;text-transform:uppercase;">Payment Instructions</div>
              ${payLines
                .map(
                  (l, i) =>
                    `<div style="font-size:11px;color:${i === 0 ? "#0f172a" : "#64748b"};font-weight:${i === 0 ? 700 : 400};margin-top:2px;">${esc(l)}</div>`
                )
                .join("")}
            </div>
</td>
          <td style="padding:10px 30px 24px;vertical-align:top;width:50%;">
            <table width="100%" cellpadding="0" cellspacing="0">${totalsRows}</table>
          </td>
        </tr>
${
          notes
            ? `<tr><td colspan="2" style="padding:14px 30px 18px;font-size:11px;color:#475569;border-top:1px solid #eef2f7;"><strong style="color:#0f172a;">Notes &amp; Terms</strong><br/>${esc(notes)}</td></tr>`
            : ""
        }
        <tr>
          <td colspan="2" style="background:#f8fafc;padding:16px 30px;border-top:1px solid #e2e8f0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:10px;color:#64748b;text-align:left;">${esc(FIRM_EMAIL)}<br/>${esc(FIRM_PHONE)}<br/>${esc(FIRM_ADDRESS)}</td>
                <td style="font-size:9px;color:#94a3b8;text-align:right;">© ${new Date().getFullYear()} ${esc(FIRM_LEGAL_NAME)}<br/>All rights reserved.</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

module.exports = {
  generatePDFContent,
  buildDocumentEmailHtml,
  parseDocumentItems,
  documentTotals,
  paymentInstructions,
  fmtMoney,
  escHtml,
  FIRM_LEGAL_NAME,
  FIRM_TAGLINE,
  FIRM_EMAIL,
  FIRM_PHONE,
  FIRM_ADDRESS,
};