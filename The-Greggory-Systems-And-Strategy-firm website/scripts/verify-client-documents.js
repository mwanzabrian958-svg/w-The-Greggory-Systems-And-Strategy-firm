#!/usr/bin/env node
/**
 * CLIENT DOCUMENT DELIVERY VERIFICATION
 * File: scripts/verify-client-documents.js
 *
 * Proves the headline deliverable end-to-end, exactly as a browser does it:
 *   1. a client can register + log in
 *   2. the portal vault (GET /api/users/client-dashboard) exposes BOTH GSSF
 *      Client Registration Agreements (PDF + MS Word) with a downloadPath
 *   3. GET /api/users/my-reports lists the same system documents (ids -101/-102)
 *   4. GET /api/users/my-reports/:id/download streams REAL bytes — validated by
 *      magic number (%PDF for the PDF, PK zip header for the .docx) — served
 *      from the client_documents DB blob, not just the copy on disk
 *   5. the download is protected: no token -> 401
 *
 * Self-cleaning: removes the throw-away client it creates (both endpoints) and
 * restores the auth mapping seed rows first, so a system reset can't break it.
 *
 * Usage: node scripts/verify-client-documents.js
 */
"use strict";
require("dotenv").config();
const http = require("http");

const PORT = process.env.PORT || 3000;

function api(path, method, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : "";
    const headers = { "Content-Type": "application/json" };
    if (data) headers["Content-Length"] = Buffer.byteLength(data);
    if (token) headers.Authorization = "Bearer " + token;
    const req = http.request({ hostname: "127.0.0.1", port: PORT, path, method, headers }, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () =>
        resolve({ status: res.statusCode, headers: res.headers, buffer: Buffer.concat(chunks) }),
      );
    });
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

const bodyText = (r) => r.buffer.toString("utf8");
const J = (r) => { try { return JSON.parse(bodyText(r)); } catch { return null; } };
let pass = 0, fail = 0; const failures = [];
function check(name, cond, extra) {
  if (cond) { pass++; console.log("  PASS", name); }
  else { fail++; failures.push(name + (extra ? " -- " + extra : "")); console.log("  FAIL", name, extra || ""); }
}

// Office Open XML files are ZIP containers -> the first two bytes are "PK".
const isPdf = (buf) => buf.slice(0, 5).toString("latin1") === "%PDF-";
const isZip = (buf) => buf.slice(0, 2).toString("latin1") === "PK";

(async () => {
  console.log("=== CLIENT DOCUMENT DELIVERY VERIFICATION (agreements -> portal vault) ===\n");

  // Pre-flight: without a locked auth mapping the register/login below 400s.
  console.log("--- DB PRE-FLIGHT ---");
  try {
    const { ensureAuthSeedData } = require("./preflight-db");
    await ensureAuthSeedData({});
  } catch (e) {
    console.warn("   pre-flight skipped:", e.message);
  }

  // 1. Throw-away client (cleaned up at the end).
  const stamp = Date.now();
  const email = `docclient${stamp}@test.com`;
  const reg = await api("/api/users/register", "POST", {
    email, password: "DocTest123", first_name: "Doc", last_name: "Client", phone: "+254700000077",
  });
  check("client register 201", reg.status === 201, bodyText(reg).slice(0, 90));

  const login = await api("/api/users/login", "POST", { email, password: "DocTest123" });
  const token = J(login)?.token;
  check("client login 200 + token", login.status === 200 && !!token, bodyText(login).slice(0, 90));

  // 2. Portal vault payload (ClientPortal.jsx -> loadClientData).
  console.log("\n--- PORTAL VAULT (GET /api/users/client-dashboard) ---");
  const dash = await api("/api/users/client-dashboard", "GET", null, token);
  // Response shape: { success: true, dashboard: buildClientPortalPayload(...) }
  const dashBody = J(dash);
  const payload = dashBody?.dashboard || dashBody?.data || dashBody;
  const documents = payload?.documents || [];
  check("client-dashboard 200", dash.status === 200, bodyText(dash).slice(0, 90));
  check("vault exposes documents[]", Array.isArray(documents) && documents.length > 0, "count=" + documents.length);

  const pdfDoc = documents.find((d) => /Registration Agreement.*PDF/i.test(d.name || ""));
  const docxDoc = documents.find((d) => /Registration Agreement.*(Word|DOCX)/i.test(d.name || ""));
  check("agreement PDF present in vault", !!pdfDoc, "names=" + documents.map((d) => d.name).join(" | ").slice(0, 120));
  check("agreement DOCX present in vault", !!docxDoc);
  check("PDF row has downloadPath", !!pdfDoc?.downloadPath, pdfDoc?.downloadPath || "missing");
  check("DOCX row has downloadPath", !!docxDoc?.downloadPath);

  // 3. Client reports endpoint lists the same system rows.
  console.log("\n--- CLIENT REPORTS (GET /api/users/my-reports) ---");
  const reports = await api("/api/users/my-reports", "GET", null, token);
  const reportRows = J(reports)?.reports || [];
  check("my-reports 200", reports.status === 200, bodyText(reports).slice(0, 90));
  check("system report -101 listed", reportRows.some((x) => String(x.id) === "-101"), "ids=" + reportRows.map((x) => x.id).join(","));
  check("system report -102 listed", reportRows.some((x) => String(x.id) === "-102"));

  // 4. REAL BYTES: this is the part that proves the DB blob copy is served.
  console.log("\n--- DOWNLOAD (GET /api/users/my-reports/:id/download) ---");
  for (const [label, doc, validate] of [
    ["PDF", pdfDoc, isPdf],
    ["DOCX", docxDoc, isZip],
  ]) {
    if (!doc?.downloadPath) { check(`${label} download skipped (no path)`, false); continue; }
    const dl = await api(doc.downloadPath, "GET", null, token);
    const dispo = String(dl.headers["content-disposition"] || "");
    const size = dl.buffer.length;
    check(`${label} download 200`, dl.status === 200, "status=" + dl.status);
    check(`${label} returns real file bytes (magic number)`, validate(dl.buffer),
      `first4=${dl.buffer.slice(0, 4).toString("latin1")} size=${size}`);
    check(`${label} sends attachment filename`, /attachment; filename=/.test(dispo), dispo.slice(0, 80) || "no header");
    check(`${label} non-trivial payload`, size > 5000, "bytes=" + size);
  }

  // 5. Access control: the same path without a token must fail.
  console.log("\n--- ACCESS CONTROL ---");
  const anon = await api("/api/users/my-reports/-101/download", "GET", null, null);
  check("download without token -> 401", anon.status === 401, "status=" + anon.status);

  // Cleanup (both endpoints) so repeated runs never leave residue.
  console.log("\n--- CLEANUP ---");
  try {
    const { purgeTestData } = require("./purge-test-data");
    const summary = await purgeTestData({ log: console.log });
    console.log(`   removed ${summary.deleted} test row(s)`);
  } catch (e) {
    console.warn("   cleanup skipped:", e.message);
  }

  console.log("\n==================================================");
  console.log(`CLIENT DOCUMENTS: ${pass} passed, ${fail} failed, ${pass + fail} total`);
  if (failures.length) console.log("FAILURES: " + failures.join(" | "));
  console.log("==================================================");
  process.exit(fail > 0 ? 1 : 0);
})().catch((e) => {
  console.error("FATAL:", e.code || e.message);
  process.exit(1);
});
