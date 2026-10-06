#!/usr/bin/env node
/**
 * Generate visual samples of every document type the firm produces.
 *
 *   node scripts/generate-doc-samples.js
 *
 * Renders each document with the SAME generators the live app uses
 * (server/lib/invoiceRenderer.js, server/services/pdfGenerator.js and the
 * profile-export route in backend/routes/admin.js), writes the source
 * PDFs/HTML alongside, then rasterises page 1 of every PDF to PNG with
 * Chrome + pdf.js so the output can be eyeballed without a PDF viewer.
 *
 * Output: samples/ (PNG previews + source PDF/HTML files).
 */
"use strict";
const path = require("path");
const fs = require("fs");
const Module = require("node:module");
const puppeteer = require("puppeteer-core");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "samples");
const PDFJS_VERSION = "3.11.174";
const PDFJS_DIR = path.join(OUT, ".pdfjs");

const CHROME_CANDIDATES = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
];

// ── Sample record data (realistic, distinct per document) ───────────────────
const invoice = {
  invoice_number: "GSSF-INV-2026-0142",
  client_name: "Savannah Agri Ltd",
  client_email: "accounts@savannahagri.co.ke",
  client_phone: "+254 711 200 300",
  client_address: "Kasarani, Nairobi",
  issue_date: "2026-10-01",
  due_date: "2026-10-15",
  status: "sent",
  currency: "KES",
  tax_rate: 0.16,
  payment_method: "mpesa",
  payment_phone: "+254 115 525 854",
  notes: "Kindly pay before the due date to avoid interruption of service.",
  terms_conditions: "Late payments attract 5% monthly interest.",
  items: JSON.stringify([
    { description: "Systems strategy consulting", quantity: 6, unit_price: 8500 },
    { description: "ERP integration (Phase 1)", quantity: 1, unit_price: 145000 },
    { description: "On-site training workshop", quantity: 2, unit_price: 25000 },
  ]),
};

const quote = {
  quote_number: "GSSF-QTE-2026-0088",
  client_name: "Lakeview Hotels Group",
  client_email: "procurement@lakeviewhotels.co.ke",
  issue_date: "2026-10-03",
  due_date: "2026-11-03",
  status: "quoted",
  currency: "KES",
  tax_rate: 0.16,
  payment_method: "bank",
  payment_phone: "KCB 1234567890 — Greggory Systems",
  notes: "Quote valid for 30 days from issue date.",
  items: JSON.stringify([
    { description: "Website redesign & CMS", quantity: 1, unit_price: 320000 },
    { description: "SEO setup (3 months)", quantity: 3, unit_price: 18000 },
  ]),
};

const receipt = {
  transaction_id: "SFF7K2QM9X",
  client_name: "Savannah Agri Ltd",
  issue_date: "2026-10-06",
  status: "paid",
  currency: "KES",
  tax_rate: 0.16,
  payment_method: "mpesa",
  payment_phone: "+254 115 525 854",
  items: JSON.stringify([
    { description: "Invoice GSSF-INV-2026-0142 — deposit", quantity: 1, unit_price: 98440 },
  ]),
};

const completionRecord = {
  id: 142,
  invoice_number: invoice.invoice_number,
  client_name: invoice.client_name,
  status: "paid",
  issue_date: invoice.issue_date,
  due_date: invoice.due_date,
  created_at: invoice.issue_date,
  subtotal: 246000,
  tax_amount: 39360,
  total_amount: 285360,
  items: invoice.items,
};

const profileUser = {
  id: 7,
  display_name: "Miriam A. Otieno",
  first_name: "Miriam",
  last_name: "Otieno",
  email: "miriam.otieno@greggorysystems.co.ke",
  phone_number: "+254 722 118 904",
  alt_phone: "+254 733 900 112",
  id_number: "38472611",
  department: "Strategy & Operations",
  expertise: "Financial Systems, KRA Tax Compliance",
  created_at: "2023-06-12T08:00:00Z",
  physical_address: "Kilimani, Nairobi, Kenya",
  emergency_contact_name: "Peter Otieno (Spouse)",
  emergency_contact_phone: "+254 722 556 771",
  mission_briefing:
    "Lead the Q4 ERP rollout for Savannah Agri Ltd and standardise the firm's monthly reporting pack.",
  private_notes: "Top-performing lead. Eligible for promotion review in January.",
  is_active: 1,
  admin_level: "senior_admin",
  developer_level: null,
  primary_role: null,
};
// ── Profile export: invoke the real route handler with a stubbed DB ─────────
function renderProfilePdf() {
  const adminPath = path.join(ROOT, "backend", "routes", "admin.js");
  const fakeDb = {
    promise: () => ({ query: async () => [[{ ...profileUser }]] }),
  };
  const originalLoad = Module._load;
  Module._load = function patchedLoad(request, parent) {
    if (parent && /routes[\\/]admin\.js$/.test(parent.filename)) {
      if (request === "../config/database") return fakeDb;
      if (request === "../utils/sessionToken") {
        return { verifySessionToken: () => ({ uid: 7, role: "admin" }) };
      }
    }
    return originalLoad.apply(this, arguments);
  };
  let router;
  try {
    delete require.cache[require.resolve(adminPath)];
    router = require(adminPath);
  } finally {
    Module._load = originalLoad;
  }

  const layer = router.stack.find(
    (l) => l.route && l.route.path === "/users/:id/export-pdf" && l.route.methods.get
  );
  if (!layer) throw new Error("export-pdf route not found");

  return new Promise((resolve, reject) => {
    const res = {
      statusCode: 200,
      headers: {},
      status(c) { this.statusCode = c; return this; },
      setHeader(k, v) { this.headers[k.toLowerCase()] = v; return this; },
      json(payload) { reject(new Error(`unexpected JSON: ${JSON.stringify(payload)}`)); },
      send(payload) {
        resolve({ buffer: Buffer.isBuffer(payload) ? payload : Buffer.from(String(payload)), headers: this.headers });
      },
    };
    const req = {
      method: "GET",
      headers: { authorization: "Bearer sample-token" },
      params: { id: "7" },
      query: { role_type: "admin" },
      body: {},
    };
    let i = 0;
    const next = () => {
      const guard = layer.route.stack[i++];
      if (!guard) return reject(new Error("handler never responded"));
      guard.handle(req, res, next);
    };
    next();
    setTimeout(() => reject(new Error("profile export timed out")), 8000).unref?.();
  });
}
// ── Business report HTML (mirrors the Report Builder output) ────────────────
function buildReportHtml() {
  const stamp = new Date().toLocaleString();
  const rows = [
    ["Total Revenue", "KSH 4,860,000"],
    ["Total Expenses", "KSH 2,145,500"],
    ["Net Profit", "KSH 2,714,500"],
    ["Outstanding (Unpaid Invoices)", "KSH 612,300"],
    ["Invoices (total / paid / unpaid)", "38 / 29 / 9"],
    ["Active Projects", "11"],
    ["Ledger Entries", "214"],
  ];
  return `<!doctype html><html><head><meta charset="utf-8">
<style>body{font-family:Arial,Helvetica,sans-serif;margin:0;background:#f1f5f9;color:#0f172a}
.card{max-width:760px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.08)}
.banner{background:#0f172a;padding:26px 32px;color:#fff}
.banner h1{margin:0;font-size:17px;letter-spacing:.12em}
.banner p{margin:6px 0 0;font-size:12px;color:#5eead4;letter-spacing:.2em;text-transform:uppercase}
.body{padding:26px 32px}
.body h2{font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:#64748b;margin:0 0 14px}
table{width:100%;border-collapse:collapse}
td{padding:10px 6px;font-size:13px;border-bottom:1px solid #e2e8f0}
td:last-child{text-align:right;font-weight:700}
.foot{padding:16px 32px;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between}
.conf{color:#b91c1c;font-weight:700}</style></head><body>
<div class="card">
  <div class="banner"><h1>THE GREGGORY SYSTEMS AND STRATEGY FIRM</h1><p>Business Report — Reports &amp; Analytics</p></div>
  <div class="body">
    <h2>Financial Summary — ${stamp}</h2>
    <table>${rows.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join("")}</table>
  </div>
  <div class="foot"><span>Generated from live endpoints (budget, invoices, projects, ledger)</span><span class="conf">CONFIDENTIAL — INTERNAL USE ONLY</span></div>
</div></body></html>`;
}

// ── Generate every source document ──────────────────────────────────────────
async function buildDocuments() {
  const { generatePDFContent, buildDocumentEmailHtml } = require(path.join(ROOT, "server", "lib", "invoiceRenderer"));
  const { generateCompletionPdf } = require(path.join(ROOT, "server", "services", "pdfGenerator"));

  fs.mkdirSync(OUT, { recursive: true });

  const docs = [];

  const invPdf = await generatePDFContent("invoices", invoice);
  fs.writeFileSync(path.join(OUT, "01-invoice.pdf"), invPdf);
  docs.push({ name: "01-invoice", pdf: invPdf });

  const qtePdf = await generatePDFContent("quotes", quote);
  fs.writeFileSync(path.join(OUT, "02-quote.pdf"), qtePdf);
  docs.push({ name: "02-quote", pdf: qtePdf });

  const rctPdf = await generatePDFContent("receipt", receipt);
  fs.writeFileSync(path.join(OUT, "03-receipt.pdf"), rctPdf);
  docs.push({ name: "03-receipt", pdf: rctPdf });

  const cmpPdf = await generateCompletionPdf("invoices", completionRecord);
  fs.writeFileSync(path.join(OUT, "04-completion-certificate.pdf"), cmpPdf);
  docs.push({ name: "04-completion-certificate", pdf: cmpPdf });

  const { buffer: profPdf, headers } = await renderProfilePdf();
  if (headers["content-type"] !== "application/pdf") {
    throw new Error(`profile export returned ${headers["content-type"]}`);
  }
  fs.writeFileSync(path.join(OUT, "05-profile-export.pdf"), profPdf);
  docs.push({ name: "05-profile-export", pdf: profPdf });

  const emailHtml = buildDocumentEmailHtml("invoices", invoice);
  fs.writeFileSync(path.join(OUT, "06-invoice-email.html"), emailHtml);
  docs.push({ name: "06-invoice-email", html: emailHtml });

  const reportHtml = buildReportHtml();
  fs.writeFileSync(path.join(OUT, "07-business-report.html"), reportHtml);
  docs.push({ name: "07-business-report", html: reportHtml });

  return docs;
}
// ── Rasterise with Chrome + pdf.js ──────────────────────────────────────────
async function ensurePdfJs() {
  fs.mkdirSync(PDFJS_DIR, { recursive: true });
  const base = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}`;
  const files = [
    ["pdf.min.js", `${base}/pdf.min.js`],
    ["pdf.worker.min.js", `${base}/pdf.worker.min.js`],
  ];
  for (const [file, url] of files) {
    const dest = path.join(PDFJS_DIR, file);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) continue;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`failed to download ${url}: ${res.status}`);
    fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    console.log(`downloaded ${file}`);
  }
}

/** Page that renders PDF page 1 to a canvas via local pdf.js. */
function viewerHtml() {
  return `<!doctype html><html><head><meta charset="utf-8">
<style>html,body{margin:0;background:#fff}canvas{display:block}</style>
<script src="./.pdfjs/pdf.min.js"></script>
</head><body><canvas id="c"></canvas>
<script>
pdfjsLib.GlobalWorkerOptions.workerSrc = "./.pdfjs/pdf.worker.min.js";
window.renderPdf = async (bytes, scale) => {
  const doc = await pdfjsLib.getDocument({ data: bytes }).promise;
  const page = await doc.getPage(1);
  const viewport = page.getViewport({ scale });
  const canvas = document.getElementById("c");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
  return { w: canvas.width, h: canvas.height, pages: doc.numPages };
};
</script></body></html>`;
}

async function rasterise(docs) {
  const executablePath =
    process.env.BROWSER_PATH || CHROME_CANDIDATES.find((p) => fs.existsSync(p));
  if (!executablePath) throw new Error("No Chrome/Edge found — set BROWSER_PATH");

  await ensurePdfJs();
  const viewerPath = path.join(OUT, ".viewer.html");
  fs.writeFileSync(viewerPath, viewerHtml());

  const browser = await puppeteer.launch({
    executablePath,
    headless: "new",
    args: ["--allow-file-access-from-files", "--font-render-hinting=none"],
  });

  try {
    for (const doc of docs) {
      const page = await browser.newPage();
      try {
        if (doc.pdf) {
          // A4 @ 150dpi-ish; keep 2x for crisp previews.
          await page.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 1 });
          await page.goto(`file:///${viewerPath.replace(/\\/g, "/")}`, {
            waitUntil: "load",
          });
          const size = await page.evaluate(async (b64, scale) => {
            const bin = atob(b64);
            const bytes = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
            return window.renderPdf(bytes, scale);
          }, doc.pdf.toString("base64"), 2);
          await page.setViewport({
            width: Math.ceil(size.w),
            height: Math.ceil(size.h),
            deviceScaleFactor: 1,
          });
          await page.screenshot({
            path: path.join(OUT, `${doc.name}.png`),
            clip: { x: 0, y: 0, width: size.w, height: size.h },
          });
          console.log(`✔ ${doc.name}.png  (${size.pages} page(s) in PDF)`);
        } else {
          await page.setViewport({ width: 900, height: 1400, deviceScaleFactor: 2 });
          await page.setContent(doc.html, { waitUntil: "networkidle0" });
          await page.screenshot({
            path: path.join(OUT, `${doc.name}.png`),
            fullPage: true,
          });
          console.log(`✔ ${doc.name}.png`);
        }
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
}

// ── Main ────────────────────────────────────────────────────────────────────
(async () => {
  const docs = await buildDocuments();
  await rasterise(docs);
  console.log(`\nSamples written to: ${OUT}`);
  console.log(
    fs
      .readdirSync(OUT)
      .filter((f) => f.endsWith(".png"))
      .map((f) => `  ${f}`)
      .join("\n")
  );
})().catch((err) => {
  console.error("FAILED:", err.message);
  process.exit(1);
});



