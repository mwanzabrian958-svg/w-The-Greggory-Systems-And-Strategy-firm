// =============================================================================
// Professional invoice/quote/receipt renderers (PDF + email HTML).
// Mirrors the contractor/consultant print template the firm's clients expect:
//   brand banner + big document title → meta (number/date/due/status)
//   → bill-to block → line-item table (# / description / qty / rate / amount)
//   → subtotal + tax + bold total → payment instructions → notes → footer.
// =============================================================================
"use strict";
const PDFDocument = require("pdfkit");
const { rateToPct, taxLabel, roundMoney } = require("./kraTax");
const { stampLogo, stampWatermark } = require("./documentBrand");

const FIRM_LEGAL_NAME = "THE GREGGORY SYSTEMS AND STRATEGY FIRM";
const FIRM_TAGLINE = "Strategic Projects, Systems & Business Solutions";
const FIRM_INTRO =
  process.env.FIRM_INTRO ||
  "Thank you for partnering with The Greggory Systems & Strategy Firm. " +
  "This document outlines professional services delivered as per our agreement. " +
  "Kindly remit payment using the details provided below.";
const FIRM_EMAIL =
  process.env.COMPANY_EMAIL || "thegreggorysystemsandstrategyf@gmail.com";
const FIRM_PHONE = process.env.COMPANY_PHONE_NUMBER || "+254 115 525 854";
const FIRM_ADDRESS = process.env.COMPANY_ADDRESS || "Nairobi, Kenya";
const KCB_PAYBILL = process.env.KCB_PAYBILL || "522533";
const KCB_ACCOUNT_NUMBER = process.env.KCB_ACCOUNT_NUMBER || "129064383";

// PDF design colors (matched from reference invoice PDF):
const PRIMARY_DARK = "#0f172a";       // RGB(0.043, 0.071, 0.125) - main brand dark
const ACCENT_TEAL = "#14b8a6";       // RGB(0.078, 0.722, 0.651) - primary accent
const ACCENT_GOLD = "#eab308";       // RGB(0.961, 0.702, 0.004) - highlight accent
const LIGHT_TEAL = "#ccfbf1";        // RGB(0.8, 0.984, 0.945) - light background
const TEXT_COLOR = "#f1f5f9";        // RGB(0.945, 0.961, 0.976) - on dark

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
  const ratePct = rateToPct(document.tax_rate);
  const taxAmount =
    Number(document.tax_amount) > 0
      ? Number(document.tax_amount)
      : roundMoney(subtotal * (ratePct / 100));
  const total =
    Number(document.total_amount) > 0
      ? Number(document.total_amount)
      : roundMoney(subtotal + taxAmount);
  return { subtotal, taxAmount, ratePct, total };
}

/** Human-readable payment instruction lines. */
function paymentInstructions(document) {
  const method = String(document.payment_method || "mpesa").toLowerCase();
  const phone = FIRM_PHONE.replace(/\D/g, "");
  const reference =
    document.invoice_number || document.payment_reference || "Invoice";
  const total = Number(
    document.grand_total || document.total_amount || document.subtotal || 0
  );
  const fmtTotal = total > 0 ? `KES ${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "KES 0.00";
  if (method.includes("bank")) {
    return [
      "KCB Bank — Paybill / Send Money",
      `Paybill: ${KCB_PAYBILL}`,
      `Account Number: ${KCB_ACCOUNT_NUMBER}`,
      `Amount: ${fmtTotal}`,
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
    `…or pay via KCB: Paybill ${KCB_PAYBILL}, Account ${KCB_ACCOUNT_NUMBER}, Amount ${fmtTotal}, Reference ${reference}`,
  ];
}

function formatInvoiceDate(value) {
  if (!value) return "—";
  const raw = String(value);
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(raw) ? `${raw}T00:00:00Z` : raw);
  if (Number.isNaN(date.getTime())) return raw;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function clampText(value, maxChars = 80) {
  const text = String(value ?? "").trim();
  if (text.length <= maxChars) return text;
  return `${text.slice(0, Math.max(12, maxChars - 1)).trimEnd()}…`;
}

function generateInvoicePDFContent(document) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 36, size: "A4" });
    doc.addPage = function () { return this; };
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const PAGE_W = doc.page.width;
    const PAGE_H = doc.page.height;
    const M = 36;
    const CW = PAGE_W - 2 * M;
    const INK = PRIMARY_DARK;
    const SLATE = "#64748b";
    const TEAL = ACCENT_TEAL;
    const LIGHT = "#e2e8f0";
    const ref = String(document.invoice_number || `INV-${document.id || "DRAFT"}`);
    const items = parseDocumentItems(document);
    const { subtotal, taxAmount, ratePct, total } = documentTotals(document, items);
    const currency = document.currency || "KES";
    const status = String(document.status || "DRAFT").toUpperCase();
    const completionValue = document.completed_at || document.completion_date;
    const completed = status === "COMPLETED" || Boolean(completionValue);
    const issueDate = formatInvoiceDate(
      document.issue_date || document.created_at
    );
    const dueDate = formatInvoiceDate(document.due_date);
    const completedDate = formatInvoiceDate(completionValue);
    const accountName =
      document.payment_account_name ||
      process.env.PAYMENT_ACCOUNT_NAME ||
      "Brian Mwanza";
    const paymentPhone = document.payment_phone || FIRM_PHONE;

    stampWatermark(doc);
    doc.on("pageAdded", () => stampWatermark(doc));

    let y = 150;
    doc.rect(0, 0, PAGE_W, y).fill(INK);
    doc.rect(0, y - 3, PAGE_W, 3).fill(TEAL);
    stampLogo(doc, M + 8, 24, 60);
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(17);
    doc.text("THE GREGGORY SYSTEMS", M + 82, 30, { width: 240 });
    doc.fontSize(12).text("AND STRATEGY FIRM", M + 82, 52, { width: 240 });
    doc.font("Helvetica").fontSize(9).fillColor("#99f6e4");
    doc.text("Your vision delivered with trust", M + 82, 78, { width: 240 });

    const invoiceX = PAGE_W - M - 205;
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(29);
    doc.text("INVOICE", invoiceX, 24, { width: 205, align: "right" });
    doc.fillColor("#facc15").font("Helvetica-Bold").fontSize(11);
    doc.text(ref, invoiceX, 62, { width: 205, align: "right" });
    doc.roundedRect(invoiceX + 8, 94, 197, 28, 14)
      .lineWidth(1.2)
      .strokeColor(ACCENT_GOLD)
      .stroke();
    doc.fillColor(ACCENT_GOLD).font("Helvetica-Bold").fontSize(8);
    doc.text("COMPLETION CERTIFICATE", invoiceX + 14, 103, {
      width: 185,
      align: "center",
    });

    const amountBoxY = y + 16;
    doc.roundedRect(M, amountBoxY, CW, 82, 14).fill("#119b8e");
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(8);
    doc.text("AMOUNT DUE", M + 24, amountBoxY + 14);
    doc.font("Helvetica-Bold").fontSize(24);
    doc.text(fmtMoney(total, currency), M + 24, amountBoxY + 34, {
      width: CW - 235,
    });
    const dueBoxX = M + CW - 182;
    doc.roundedRect(dueBoxX, amountBoxY + 12, 164, 58, 12).fill("#32ad9f");
    doc.fillColor("#d1fae5").font("Helvetica-Bold").fontSize(8);
    doc.text("PLEASE PAY BY", dueBoxX + 8, amountBoxY + 21, {
      width: 148,
      align: "center",
    });
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(13);
    doc.text(dueDate, dueBoxX + 6, amountBoxY + 39, {
      width: 152,
      align: "center",
    });
    y = amountBoxY + 104;

    const detailsTop = y;
    doc.fillColor(SLATE).font("Helvetica-Bold").fontSize(7);
    doc.text("BILLED TO", M, detailsTop);
    doc.fillColor(INK).font("Helvetica-Bold").fontSize(11);
    const clientName = clampText(document.client_name || "Client", 26);
    doc.text(clientName, M, detailsTop + 12, {
      width: 235,
    });
    doc.fillColor(SLATE).font("Helvetica").fontSize(8);
    const clientDetails = [
      document.client_type || "Client",
      document.client_company,
      document.client_email,
      document.client_phone,
      document.client_address,
    ]
      .filter((value) => value && value !== clientName)
      .map((value) => clampText(value, 28));
    let clientY = detailsTop + 28;
    const clientBottomLimit = PAGE_H - 136;
    for (const detail of clientDetails) {
      const safeDetail = String(detail);
      const detailHeight = doc.heightOfString(safeDetail, { width: 230 });
      if (clientY + detailHeight > clientBottomLimit) break;
      doc.text(safeDetail, M, clientY, { width: 230 });
      clientY += detailHeight + 2;
    }

    const metaX = M + CW - 218;
    const metaRows = [
      ["Invoice number", ref],
      ["Issue date", issueDate],
      ["Due date", dueDate],
      ["Status", status],
    ];
    if (completionValue) {
      metaRows.push(["Completed", completedDate]);
    }
    metaRows.forEach(([label, value], index) => {
      const metaY = detailsTop + index * 19;
      doc.fillColor(SLATE).font("Helvetica").fontSize(7);
      doc.text(label, metaX, metaY, { width: 92 });
      doc.fillColor(INK).font("Helvetica-Bold").fontSize(7.5);
      doc.text(String(value), metaX + 92, metaY, {
        width: 126,
        align: "right",
      });
    });
    y = Math.max(clientY, detailsTop + metaRows.length * 19) + 20;

    doc.fillColor(INK).font("Helvetica-Bold").fontSize(8);
    doc.text("SERVICE ITEMS", M, y);
    y += 13;

    const xIdx = M + 8;
    const xDesc = M + 34;
    const xQty = M + CW - 220;
    const xRate = M + CW - 140;
    const xAmount = M + CW - 76;
    const drawTableHeader = (label) => {
      doc.rect(M, y, CW, 22).fill(INK);
      doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(7);
      doc.text(label || "#", xIdx, y + 7);
      doc.text("DESCRIPTION", xDesc, y + 7);
      doc.text("QTY", xQty, y + 7, { width: 48, align: "right" });
      doc.text("RATE", xRate, y + 7, { width: 60, align: "right" });
      doc.text("AMOUNT", xAmount, y + 7, { width: 68, align: "right" });
      y += 22;
    };
    drawTableHeader();

    for (const [index, item] of items.entries()) {
      const descWidth = xQty - xDesc - 10;
      const itemDescription = clampText(item.description, 48);
      const descHeight = doc.heightOfString(itemDescription, {
        width: descWidth,
        font: "Helvetica",
        fontSize: 8,
      });
      const rowHeight = Math.max(18, Math.min(28, descHeight + 8));
      const serviceBottom = PAGE_H - 235;
      if (y + rowHeight > serviceBottom) {
        break;
      }

      if (index % 2 === 1) doc.rect(M, y, CW, rowHeight).fill(LIGHT_TEAL);
      doc.fillColor(SLATE).font("Helvetica").fontSize(7);
      doc.text(String(index + 1), xIdx, y + 8);
      doc.fillColor(INK).font("Helvetica").fontSize(8);
      doc.text(itemDescription, xDesc, y + 6, { width: descWidth });
      doc.fillColor(SLATE).font("Helvetica").fontSize(7);
      doc.text(String(item.quantity), xQty, y + 8, {
        width: 48,
        align: "right",
      });
      doc.text(fmtMoney(item.unit_price, currency), xRate, y + 8, {
        width: 60,
        align: "right",
      });
      doc.fillColor(INK).font("Helvetica-Bold").fontSize(7);
      doc.text(fmtMoney(item.line_total, currency), xAmount, y + 8, {
        width: 68,
        align: "right",
      });
      doc
        .moveTo(M, y + rowHeight)
        .lineTo(M + CW, y + rowHeight)
        .lineWidth(0.5)
        .strokeColor(ACCENT_TEAL)
        .stroke();
      y += rowHeight;
    }

    y += 10;
    const certificationText = completed
      ? `This is to certify that the above invoice record has been marked as completed within the ${FIRM_LEGAL_NAME} system.`
      : `This document certifies the invoice details and service items recorded above. The amount due is ${fmtMoney(total, currency)}.`;
    const certX = M;
    const certW = 252;
    const summaryGap = 18;
    const totalsX = certX + certW + summaryGap;
    const totalsW = CW - certW - summaryGap;
    const certTextHeight = doc.heightOfString(certificationText, {
      width: certW,
      font: "Helvetica",
      fontSize: 8,
      lineGap: 2,
    });
    const summaryY = y + 8;
    const footerBandY = PAGE_H - 58;
    const paymentHeight = 28 + 88 + 15;
    const summaryHeight = Math.max(certTextHeight + 42, ratePct > 0 ? 94 : 76);
    const singlePageBottom = footerBandY - 110;
    if (summaryY + summaryHeight + paymentHeight + 52 > singlePageBottom) {
      y = Math.max(70, singlePageBottom - (summaryHeight + paymentHeight + 24));
    } else {
      y = summaryY;
    }

    const detailY = y;
    doc.fillColor(TEAL).font("Helvetica-Bold").fontSize(8);
    doc.text("CERTIFICATION", certX, detailY);
    doc.fillColor(SLATE).font("Helvetica").fontSize(8);
    doc.text(certificationText, certX, detailY + 18, {
      width: certW,
      lineGap: 2,
    });

    let totalY = detailY;
    const drawTotal = (label, amount) => {
      doc.fillColor(SLATE).font("Helvetica").fontSize(8);
      doc.text(label, totalsX, totalY + 3, { width: totalsW / 2 });
      doc.fillColor(INK).font("Helvetica-Bold").fontSize(8);
      doc.text(fmtMoney(amount, currency), totalsX + totalsW / 2, totalY + 3, {
        width: totalsW / 2,
        align: "right",
      });
      totalY += 18;
    };
    drawTotal("Subtotal", subtotal);
    if (ratePct > 0) drawTotal(taxLabel(ratePct) || `Tax (${ratePct}%)`, taxAmount);
    doc.roundedRect(totalsX, totalY + 3, totalsW, 34, 10)
      .fillAndStroke("#e6fffb", TEAL);
    doc.fillColor("#0f766e").font("Helvetica-Bold").fontSize(10);
    doc.text("Total", totalsX + 12, totalY + 14, { width: 70 });
    doc.text(fmtMoney(total, currency), totalsX + 82, totalY + 14, {
      width: totalsW - 94,
      align: "right",
    });
    y = detailY + Math.max(certTextHeight + 30, totalY - detailY + 48) + 12;

    if (y + paymentHeight + 60 > footerBandY - 8) {
      y = Math.max(64, footerBandY - paymentHeight - 68);
    }
    doc.fillColor(TEAL).font("Helvetica-Bold").fontSize(8);
    doc.text("PAYMENT OPTIONS", M, y);
    doc.fillColor(SLATE).font("Helvetica").fontSize(7);
    doc.text(`Use ${ref} as your payment reference`, M + 180, y, {
      width: CW - 180,
      align: "right",
    });
    y += 20;

    const cardGap = 14;
    const cardWidth = (CW - cardGap) / 2;
    const cardHeight = 72;
    const drawPaymentCard = (x, number, title, subtitle, lines) => {
      doc.roundedRect(x, y, cardWidth, cardHeight, 12)
        .fillAndStroke("#f8fafc", "#e2e8f0");
      doc.roundedRect(x, y, 4, cardHeight, 2).fill(TEAL);
      doc.circle(x + 24, y + 23, 12).fill(TEAL);
      doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(9);
      doc.text(String(number), x + 18, y + 19, { width: 12, align: "center" });
      doc.fillColor(INK).font("Helvetica-Bold").fontSize(9);
      doc.text(title, x + 43, y + 10, { width: cardWidth - 54 });
      doc.fillColor(SLATE).font("Helvetica").fontSize(7);
      doc.text(subtitle, x + 43, y + 24, { width: cardWidth - 54 });
      let lineY = y + 42;
      for (const [label, value] of lines) {
        const safeLabel = clampText(label, 16);
        const safeValue = clampText(value, 18);
        doc.fillColor(SLATE).font("Helvetica").fontSize(6.5);
        doc.text(safeLabel, x + 12, lineY, { width: 84 });
        doc.fillColor(INK).font("Helvetica-Bold").fontSize(6.5);
        doc.text(String(safeValue), x + 96, lineY, {
          width: cardWidth - 108,
          align: "right",
        });
        lineY += 12;
      }
    };
    drawPaymentCard(M, 1, "Send Money", "Mobile money transfer", [
      ["Send to (number)", paymentPhone],
      ["Account name", accountName],
      ["Amount", fmtMoney(total, currency)],
      ["Reference", ref],
    ]);
    drawPaymentCard(M + cardWidth + cardGap, 2, "Bank Transfer", "KCB paybill deposit", [
      ["Bank", "KCB"],
      ["Paybill number", KCB_PAYBILL],
      ["Account number", KCB_ACCOUNT_NUMBER],
      ["Reference", ref],
    ]);
    y += cardHeight + 12;

    const signatureSpace = 42;
    if (y + signatureSpace > footerBandY - 8) {
      y = Math.max(60, footerBandY - signatureSpace - 26);
    }
    doc.fillColor(SLATE).font("Helvetica").fontSize(8);
    doc.text(completed ? "Completed & Recorded by," : "Issued & Recorded by,", M, y);
    doc.fillColor(INK).font("Helvetica-Bold").fontSize(9);
    doc.text(FIRM_LEGAL_NAME, M, y + 15);
    doc.fillColor(SLATE).font("Helvetica").fontSize(8);
    doc.text(`${FIRM_EMAIL}  |  ${FIRM_PHONE}`, M, y + 29);

    const verification = document.verified === true && completed ? "VERIFIED" : status;
    const verifyX = M + CW - 132;
    doc.roundedRect(verifyX, y + 2, 132, 30, 8)
      .lineWidth(1.3)
      .strokeColor(TEAL)
      .stroke();
    if (verification === "VERIFIED") {
      doc.moveTo(verifyX + 13, y + 17)
        .lineTo(verifyX + 18, y + 22)
        .lineTo(verifyX + 27, y + 11)
        .lineWidth(2)
        .strokeColor(TEAL)
        .stroke();
    }
    doc.fillColor(TEAL).font("Helvetica-Bold").fontSize(8);
    doc.text(verification, verifyX + 32, y + 12, { width: 92, align: "center" });
    const recordId = document.completion_id || document.id || ref;
    doc.fillColor(SLATE).font("Helvetica").fontSize(7);
    doc.text(`Date: ${completed ? completedDate : issueDate}  |  Completion ID: invoices-${document.id || ref}-${recordId}`, verifyX - 100, y + 38, {
      width: 232,
      align: "right",
    });

    const footerY = PAGE_H - 58;
    doc.rect(0, footerY, PAGE_W, PAGE_H - footerY).fill(INK);
    doc.rect(0, footerY, PAGE_W, 3).fill(TEAL);
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(8);
    doc.text(FIRM_LEGAL_NAME, M, footerY + 17, { width: 315 });
    doc.fillColor("#94a3b8").font("Helvetica").fontSize(7);
    doc.text(`${FIRM_ADDRESS}  |  ${FIRM_EMAIL}  |  ${FIRM_PHONE}`, M, footerY + 31, {
      width: 360,
    });
    doc.fillColor(ACCENT_GOLD).font("Helvetica-Bold").fontSize(8);
    doc.text("Thank you for your business", PAGE_W - M - 175, footerY + 18, {
      width: 175,
      align: "right",
    });
    doc.fillColor("#94a3b8").font("Helvetica").fontSize(7);
    doc.text("Page 1", PAGE_W - M - 175, footerY + 33, {
      width: 175,
      align: "right",
    });
    doc.end();
  });
}

/** Professional document PDF (A4 single page) — invoices / quotes / receipts. */
function generatePDFContent(type, document) {
  const normalizedType = String(type).toLowerCase();
  if (normalizedType.indexOf("invoice") === 0 || normalizedType === "invoices") {
    return generateInvoicePDFContent(document);
  }

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
    const TEAL = ACCENT_TEAL;
    const INK = PRIMARY_DARK;
    const SLATE = "#64748b";
    const LIGHT = "#e2e8f0";

    // Watermark UNDER everything, repeated automatically if content flows to
    // a second page.
    stampWatermark(doc);
    doc.on("pageAdded", () => stampWatermark(doc));

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
    // Banner widened 250 → 290 so the emblem fits left of the wordmark
    // (still clear of the INVOICE title box at PAGE_W - M - 180).
    doc.rect(M, y, 290, 66).fill(INK);
    stampLogo(doc, M + 12, y + 11, 44);
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(15);
    doc.text("THE GREGGORY SYSTEMS", M + 68, y + 14, { width: 200 });
    doc.fontSize(10).text("AND STRATEGY FIRM", M + 68, y + 32, { width: 200 });
    doc.font("Helvetica").fontSize(7).fillColor(ACCENT_TEAL);
    doc.text(FIRM_TAGLINE.toUpperCase(), M + 68, y + 49, { width: 200 });

    doc.fillColor(TEAL).font("Helvetica-Bold").fontSize(36);
    // Box must END at the right margin — starting it at PAGE_W - M pushes
    // the right-aligned text 180pt off the page (it clipped the title away).
    doc.text(docTitle, PAGE_W - M - 180, y + 8, { width: 180, align: "right" });
    doc.fillColor(SLATE).font("Helvetica").fontSize(8);
    doc.text(`No. ${ref}`, PAGE_W - M - 180, y + 52, { width: 180, align: "right" });
    y += 80;

    doc.rect(M, y, CW, 3).fill(TEAL);
    y += 20;

    // ---- Company pre-text / intro ---
    doc.fillColor(SLATE).font("Helvetica-Bold").fontSize(6.5);
    doc.text("FROM THE FIRM", M, y);
    doc.fillColor(INK).font("Helvetica").fontSize(8.5);
    doc.text(FIRM_INTRO, M, y + 10, { width: CW, lineGap: 2 });
    y += 56;

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
    const xAmt = PAGE_W - M - 70; // right edge must land ON the margin (was -8, spilling 62pt off-page)
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

      if ((rowIdx - 1) % 2 === 1) doc.rect(M, y, CW, rowH).fill(LIGHT_TEAL);

      doc.fillColor(SLATE).font("Helvetica-Bold").fontSize(6.5);
      doc.text(String(rowIdx), xIdx, y + 7);
      doc.font("Helvetica").fontSize(7).fillColor(PRIMARY_DARK);
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
      doc.text(taxLabel(ratePct) || `Tax (${ratePct}%)`, totalX, y);
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
    doc.rect(M, y, CW, boxH).fill(LIGHT_TEAL);
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
      doc.font("Helvetica").fontSize(8).fillColor(SLATE);
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
      .strokeColor(ACCENT_TEAL)
      .stroke();
    // Footer lines sit high enough that y + lineHeight stays inside the
    // bottom margin — at PAGE_H - 48 pdfkit spilled the © line to page 2.
    doc.font("Helvetica-Bold").fontSize(8).fillColor(INK);
    doc.text(FIRM_LEGAL_NAME, M, PAGE_H - 76, { width: CW });
    doc.font("Helvetica").fontSize(6.5).fillColor(SLATE);
    doc.text(`${FIRM_EMAIL}  ·  ${FIRM_PHONE}  ·  ${FIRM_ADDRESS}`, M, PAGE_H - 66, { width: CW });
    doc.text(`© ${new Date().getFullYear()} ${FIRM_LEGAL_NAME}. All rights reserved.`, M, PAGE_H - 56, { width: CW });

    doc.end();
  });
}
/**
 * Professional invoice/quote/receipt email HTML — the client-facing version of
 * the PDF, styled like a contractor/consultant print template. Self-contained
 * inline CSS (safe in Gmail/Outlook) and every supplied value is HTML-escaped.
 * `message` (optional) is the admin's composed note — rendered as a bordered
 * block under the header so the client actually sees it (HTML part wins in
 * every mail client; the text part alone would be ignored).
 */
function buildDocumentEmailHtml(type, document, message) {
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
    ${ratePct > 0
      ? `<tr><td style="padding:5px 8px;font-size:11px;color:#64748b;">${esc(taxLabel(ratePct) || `Tax (${ratePct}%)`)}</td>
        <td style="padding:5px 8px;font-size:12px;font-weight:700;color:#0f172a;text-align:right;">${money(taxAmount, currency)}</td></tr>`
      : ""
    }
    <tr><td style="padding:10px 8px 4px;border-top:2px solid #0f172a;font-size:12px;font-weight:800;color:#0f172a;text-transform:uppercase;">TOTAL</td>
        <td style="padding:10px 8px 4px;border-top:2px solid #0f172a;font-size:18px;font-weight:800;color:#0d9488;text-align:right;">${money(total, currency)}</td></tr>`;

  const notes = [document.notes, document.terms_conditions, document.payment_terms]
    .filter((n) => n && String(n).trim())
    .join("  ·  ");

  // Admin-composed note from the full-screen compose area (escaped; newlines kept)
  const personalNote =
    message && String(message).trim()
      ? `<tr><td colspan="2" style="padding:16px 30px 2px;">
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-left:3px solid #0d9488;border-radius:6px;padding:14px 16px;">
            <div style="font-size:9px;color:#0d9488;font-weight:800;letter-spacing:2px;text-transform:uppercase;">A note from your project team</div>
            <div style="font-size:12px;color:#334155;line-height:1.65;margin-top:6px;white-space:pre-line;">${esc(String(message).trim())}</div>
          </div>
        </td></tr>`
      : "";

  return `<!doctype html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#ccfbf1;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#ccfbf1;padding:24px 8px;">
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
          <td colspan="2" style="padding:20px 30px;">
            <div style="background:#f8fafc;border-left:3px solid #0d9488;border-radius:6px;padding:14px 16px;">
              <div style="font-size:9px;color:#0d9488;font-weight:800;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">From The Firm</div>
              <div style="font-size:12px;color:#334155;line-height:1.6;white-space:pre-line;">${esc(FIRM_INTRO)}</div>
            </div>
          </td>
        </tr>
${personalNote}
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
              ${document.title ? `<div style="font-size:11px;color:#64748b;margin-top:8px;"><strong style="color:#0f172a;">Reference:</strong> ${esc(document.title)}</div>` : ""}
            </div>
</td>
          <td style="padding:10px 30px 24px;vertical-align:top;width:50%;">
            <table width="100%" cellpadding="0" cellspacing="0">${totalsRows}</table>
          </td>
        </tr>
${notes
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
  formatInvoiceDate,
};