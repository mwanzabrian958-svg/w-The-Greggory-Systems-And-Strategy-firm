"use strict";
/**
 * PDF Co-Generator for The Greggory Systems & Strategy Firm
 * =========================================
 * Generates professional completion/completion-record PDFs for ALL record types
 * whenever a record is marked as completed.
 *
 * Supported record types:
 *   - invoices         -> Completion Certificate / Completion Report
 *   - project_invoices -> Completion Certificate
 *   - accounting_entries -> Transaction Completion Receipt
 *   - quotes           -> Completion Certificate (accepted quotes)
 *   - project_docs     -> Document Completion Certificate
 *   - tasks            -> Task Completion Report
 *   - projects         -> Project Completion Report
 *
 * Usage:
 *   POST /api/pdf/generate-completion
 *   { recordType: "invoices", recordId: 123 }
 */

const PDFDocument = require("pdfkit");
const {
  FIRM_LEGAL_NAME,
  FIRM_TAGLINE,
  FIRM_EMAIL,
  FIRM_PHONE,
  FIRM_ADDRESS,
  fmtMoney,
} = require("../lib/invoiceRenderer");

/**
 * Co-generate a professional completion PDF for any record.
 * @param {string} recordType
 * @param {object} record - the full DB row for that record
 * @param {object} [options]
 * @returns {Promise<Buffer>}
 */
async function generateCompletionPdf(recordType, record, options = {}) {
  const { includeLineItems = true, title, subtitle } = options;
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      info: {
        Title: title || defaultTitle(recordType, record),
        Author: FIRM_LEGAL_NAME,
        Subject: subtitle || "Completion Record",
        Keywords: `${FIRM_LEGAL_NAME}, completion, ${recordType}`,
        CreationDate: new Date(),
      },
    });

    const buffers = [];
    doc.on("data", (d) => buffers.push(d));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    try {
      buildCompletionDoc(doc, recordType, record, {
        includeLineItems,
        title: title || defaultTitle(recordType, record),
        subtitle: subtitle || defaultSubtitle(recordType, record),
      });
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

function defaultTitle(recordType, r) {
  const base = {
    invoices: `INVOICE COMPLETION - ${r.invoice_number || "#" + r.id}`,
    project_invoices: `PROJECT INVOICE COMPLETION - ${r.invoice_number || "#" + r.id}`,
    accounting_entries: `ACCOUNTING COMPLETION - ${r.category || "Entry #" + r.id}`,
    quotes: `QUOTE COMPLETION - ${r.quote_number || "#" + r.id}`,
    project_docs: `DOCUMENT COMPLETION - ${r.name || "Doc #" + r.id}`,
    tasks: `TASK COMPLETION - ${r.title || "Task #" + r.id}`,
    projects: `PROJECT COMPLETION - ${r.title || r.name || "Project #" + r.id}`,
  };
  return base[recordType] || `COMPLETION RECORD - ${recordType.toUpperCase()} #${r.id}`;
}

function defaultSubtitle(recordType, r) {
  const status = (r.status || "").toUpperCase() || "COMPLETED";
  const date = r.completed_at || r.paid_date || r.updated_at || r.created_at || new Date().toISOString().split("T")[0];
  const base = {
    invoices: `Invoice Status: ${status} | Completed: ${fmtDate(date)}`,
    project_invoices: `Invoice Status: ${status} | Completed: ${fmtDate(date)}`,
    accounting_entries: `Entry Type: ${(r.entry_type || "income").toUpperCase()} | Completed: ${fmtDate(date)}`,
    quotes: `Quote Status: ${status} | Completed: ${fmtDate(date)}`,
    project_docs: `Document Category: ${r.category || "GENERAL"} | Completed: ${fmtDate(date)}`,
    tasks: `Task Status: ${status} | Completed: ${fmtDate(date)}`,
    projects: `Project Status: ${status} | Completed: ${fmtDate(date)}`,
  };
  return base[recordType] || `Status: ${status} | Date: ${fmtDate(date)}`;
}

function fmtDate(d) {
  if (!d) return "N/A";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return String(d);
  return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function gatherDetails(recordType, r) {
  const details = [];
  switch (recordType) {
    case "invoices":
    case "project_invoices":
      details.push(["Invoice #", r.invoice_number || r.id]);
      details.push(["Client", r.client_name || r.client_name || "—"]);
      details.push(["Issue Date", fmtDate(r.issue_date || r.created_at)]);
      details.push(["Due Date", fmtDate(r.due_date)]);
      details.push(["Status", r.status || "completed"]);
      break;
    case "accounting_entries":
      details.push(["Entry #", r.id]);
      details.push(["Category", r.category || "—"]);
      details.push(["Type", r.entry_type || "income"]);
      details.push(["Date", fmtDate(r.transaction_date || r.created_at)]);
      details.push(["Status", r.payment_status || r.status || "completed"]);
      break;
    case "quotes":
      details.push(["Quote #", r.quote_number || r.id]);
      details.push(["Client", r.client_name || "—"]);
      details.push(["Issue Date", fmtDate(r.issue_date || r.created_at)]);
      details.push(["Valid Until", fmtDate(r.valid_until)]);
      details.push(["Status", r.status || "accepted"]);
      break;
    case "project_docs":
      details.push(["Document Name", r.name || "—"]);
      details.push(["Category", r.category || "general"]);
      details.push(["File Type", r.file_type || "—"]);
      details.push(["Version", r.version || "1.0"]);
      details.push(["Created", fmtDate(r.created_at)]);
      break;
    case "tasks":
      details.push(["Task #", r.id]);
      details.push(["Title", r.title || "—"]);
      details.push(["Description", r.description || "—"]);
      details.push(["Created", fmtDate(r.created_at)]);
      details.push(["Status", r.status || "completed"]);
      break;
    case "projects":
      details.push(["Project #", r.id]);
      details.push(["Title", r.title || r.name || "—"]);
      details.push(["Description", r.description || "—"]);
      details.push(["Created", fmtDate(r.created_at)]);
      details.push(["Status", r.status || "completed"]);
      break;
    default:
      details.push(["Record ID", r.id]);
      details.push(["Created", fmtDate(r.created_at)]);
      details.push(["Status", r.status || "completed"]);
  }
  return details;
}

function gatherTotals(recordType, r) {
  const totals = [];
  if (["invoices", "project_invoices"].includes(recordType)) {
    totals.push(["Subtotal", fmtMoney(r.subtotal || r.amount || 0)]);
    if (r.tax_amount || r.tax_rate) {
      totals.push(["Tax", fmtMoney(r.tax_amount || 0)]);
    }
    totals.push(["Total", fmtMoney(r.total_amount || r.grand_total || r.amount || 0)]);
  } else if (recordType === "quotes") {
    totals.push(["Subtotal", fmtMoney(r.subtotal || 0)]);
    totals.push(["Total", fmtMoney(r.total_amount || 0)]);
  } else if (recordType === "accounting_entries") {
    totals.push(["Amount", fmtMoney(r.amount || 0)]);
    if (r.tax_amount) totals.push(["Tax", fmtMoney(r.tax_amount)]);
    totals.push(["Total", fmtMoney(r.total_amount || r.amount || 0)]);
  }
  return totals;
}

function parseItems(r) {
  let items = [];
  try {
    const raw = typeof r.items === "string" ? JSON.parse(r.items) : r.items;
    if (Array.isArray(raw)) items = raw;
  } catch (_) { /* ignore */ }
  return items.map((it) => ({
    description: String(it.item_description || it.description || it.name || "Service item"),
    quantity: it.quantity != null ? Number(it.quantity) : 1,
    unit_price: it.unit_price || it.rate || it.price || 0,
    line_total: it.line_total || it.amount || 0,
  }));
}

/** Build the actual PDF document into a PDFKit doc instance. */
function buildCompletionDoc(doc, recordType, r, { includeLineItems, title, subtitle }) {
  const primary = "#0f172a"; // slate-900
  const accent = "#0d9488";  // teal-600
  const gold = "#eab308";

  // ===== HEADER BANNER =====
  doc.rect(0, 0, doc.page.width, 110).fill(primary).stroke(primary);
  doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(18).text(FIRM_LEGAL_NAME, 50, 30);
  doc.font("Helvetica").fontSize(9).fillColor("#cbd5e1").text(FIRM_TAGLINE, 50, 52);
  doc.fillColor(gold).font("Helvetica-Bold").fontSize(11).text("COMPLETION CERTIFICATE", doc.page.width - 50, 30, { align: "right" });
  doc.moveDown(4.2);

  // ===== DOCUMENT TITLE =====
  doc.fillColor("#1e293b").font("Helvetica-Bold").fontSize(24).text(title, { align: "center" });
  doc.font("Helvetica").fontSize(12).fillColor("#64748b").text(subtitle, { align: "center" });
  doc.moveDown(2);

  // ===== CERTIFICATE BODY =====
  doc.fillColor("#334151").font("Helvetica").fontSize(11).text(
    `This is to certify that the following ${recordType.replace(/_/g, " ")} record has been marked as completed within the ${FIRM_LEGAL_NAME} system.`,
    { align: "center" }
  );
  doc.moveDown(1.5);

  // ===== RECORD DETAILS TABLE =====
  const details = gatherDetails(recordType, r);
  const detailY = doc.y;
  doc.save().rect(50, detailY, doc.page.width - 100, details.length * 22 + 14).fill("#f8fafc").stroke("#e2e8f0").restore();
  doc.font("Helvetica-Bold").fontSize(10).fillColor("#0f172a").text("Record Details", 65, detailY + 6);

  let y = detailY + 30;
  for (const [label, value] of details) {
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#475569").text(label, 65, y);
    doc.font("Helvetica").fontSize(9).fillColor("#1e293b").text(value || "—", 140, y, { width: 300 });
    y += 22;
  }
  doc.y = y + 10;

  // ===== LINE ITEMS TABLE =====
  if (includeLineItems) {
    const items = parseItems(r);
    if (items.length > 0) {
      drawLineItemsTable(doc, items, r);
    }
  }

  // ===== TOTALS BOX =====
  const totals = gatherTotals(recordType, r);
  if (totals.length > 0) {
    const boxY = doc.y + 15;
    const boxW = 180;
    const boxH = totals.length * 18 + 20;
    doc.save().rect(doc.page.width - 50 - boxW, boxY, boxW, boxH).fill("#f0fdfa").stroke("#99f6e4").restore();
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#0d9488").text("Amounts", doc.page.width - 50 - boxW + 12, boxY + 8);

    let ty = boxY + 26;
    for (const [label, value] of totals) {
      doc.font("Helvetica").fontSize(9).fillColor("#0f172a").text(label, doc.page.width - 50 - boxW + 12, ty);
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#0d9488").text(value, doc.page.width - 50 - 8, ty, { align: "right" });
      ty += 18;
    }
  }

  doc.moveDown(4);

  // ===== SIGNATURE BLOCK =====
  const sigY = Math.max(doc.y + 20, doc.page.height - 140);
  doc.font("Helvetica").fontSize(10).fillColor("#475569").text("Completed & Recorded by,", 50, sigY);
  doc.font("Helvetica-Bold").fontSize(12).fillColor("#0f172a").text(FIRM_LEGAL_NAME, 50, sigY + 20);
  doc.font("Helvetica").fontSize(9).fillColor("#64748b").text(FIRM_EMAIL, 50, sigY + 36);
  doc.font("Helvetica").fontSize(9).fillColor("#64748b").text(FIRM_PHONE, 50, sigY + 50);

  doc.font("Helvetica-Bold").fontSize(8).fillColor(accent).text("VERIFIED", 50, sigY + 70);
  doc.rect(50, sigY + 76, 40, 14).stroke(accent);
  doc.font("Helvetica").fontSize(7).fillColor("#94a3b8").text(`Date: ${fmtDate(new Date())}`, 95, sigY + 80);

  doc.font("Helvetica").fontSize(8).fillColor("#94a3b8").text("Page 1", doc.page.width - 50, doc.page.height - 25, { align: "right" });

  // ===== FOOTER =====
  const footY = doc.page.height - 45;
  doc.rect(0, footY - 10, doc.page.width, 1).fill("#e2e8f0");
  doc.font("Helvetica").fontSize(8).fillColor("#64748b").text(`${FIRM_LEGAL_NAME} | ${FIRM_ADDRESS} | ${FIRM_EMAIL} | ${FIRM_PHONE}`, 50, footY);
  doc.font("Helvetica").fontSize(7).fillColor("#94a3b8").text(`Completion ID: ${recordType}-${r.id}-${Date.now()}`, doc.page.width - 50, footY, { align: "right" });
}

function drawLineItemsTable(doc, items, r) {
  doc.font("Helvetica-Bold").fontSize(10).fillColor("#0f172a").text("Service Items", 50, doc.y + 15);
  const headers = ["#", "Description", "Qty", "Rate", "Amount"];
  const colX = [50, 90, 320, 380, 450];
  const rowH = 20;
  let y = doc.y + 8;

  doc.font("Helvetica-Bold").fontSize(8).fillColor("#f1f5f9");
  headers.forEach((h, i) => {
    doc.text(h, colX[i], y + 4, { width: i === 0 ? 40 : i === 1 ? 230 : 60, align: i === 0 ? "center" : "right" });
  });
  doc.rect(50, y, doc.page.width - 100, rowH).fill("#f1f5f9").stroke("#e2e8f0");

  y += rowH;
  doc.font("Helvetica").fontSize(8).fillColor("#334151");
  items.forEach((it, i) => {
    const rowFill = i % 2 ? "#f8fafc" : "#ffffff";
    doc.rect(50, y, doc.page.width - 100, rowH).fill(rowFill).stroke("#e2e8f0");
    const vals = [i + 1, it.description, it.quantity, fmtMoney(it.unit_price), fmtMoney(it.line_total)];
    vals.forEach((v, i) => {
      doc.text(String(v), colX[i], y + 4, { width: i === 0 ? 40 : i === 1 ? 230 : 60, align: i === 0 ? "center" : "right" });
    });
    y += rowH;
  });
  doc.y = y + 5;
}

module.exports = {
  generateCompletionPdf,
  defaultTitle,
  defaultSubtitle,
  fmtDate,
  gatherDetails,
  gatherTotals,
  buildCompletionDoc,
  drawLineItemsTable,
};