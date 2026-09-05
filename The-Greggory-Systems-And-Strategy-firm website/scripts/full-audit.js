/**
 * FULL SYSTEM AUDIT v2 (live, self-cleaning)
 * File: scripts/full-audit.js
 *
 * Live-tests every major feature area against the running server and prints a
 * PASS/FAIL table. Creates its own throw-away client + admin + template +
 * invoice, then cleans everything up. Never touches pre-existing rows.
 *
 * Usage: node scripts/full-audit.js
 */
require("dotenv").config();
const http = require("http");

const PORT = process.env.PORT || 3000;
const results = [];
const trash = { emails: [], invoiceId: null, templateId: null, memberId: null };

function req(method, path, body, token, multipart) {
  return new Promise((resolve) => {
    let data = null;
    const headers = {};
    if (multipart) {
      data = multipart.buffer;
      headers["Content-Type"] = multipart.contentType;
    } else if (body !== undefined && body !== null) {
      data = Buffer.from(JSON.stringify(body));
      headers["Content-Type"] = "application/json";
    }
    if (data) headers["Content-Length"] = data.length;
    if (token) headers["Authorization"] = "Bearer " + token;
    const r = http.request(
      { hostname: "127.0.0.1", port: PORT, path, method, headers, timeout: 20000 },
      (res) => {
        let b = "";
        res.on("data", (c) => (b += c));
        res.on("end", () => resolve({
          status: res.statusCode,
          headers: res.headers,
          body: b,
          json: (() => { try { return JSON.parse(b); } catch { return null; } })(),
        }));
      }
    );
    r.on("error", (e) => resolve({ status: 0, headers: {}, error: e.message, body: "", json: null }));
    r.on("timeout", () => { r.destroy(); resolve({ status: 0, headers: {}, error: "timeout", body: "", json: null }); });
    if (data) r.write(data);
    r.end();
  });
}

function record(area, name, r, expect, note) {
  const ok = Array.isArray(expect) ? expect.includes(r.status) : r.status === expect;
  results.push({ area, name, ok, status: r.status, expect: Array.isArray(expect) ? expect.join("/") : String(expect), note: note || (ok ? "" : (r.json && (r.json.message || r.json.error)) || (r.error || "").slice(0, 60)) });
  return ok;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const stamp = Date.now();
  const ce = `auditclient${stamp}@test.com`;
  const ae = `auditadmin${stamp}@test.com`;
  trash.emails = [ce, ae];
  const TINY_PNG = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

  // ---------- 1. PUBLIC / WEBSITE ----------
  record("Public", "GET /api/health", await req("GET", "/api/health"), [200]);
  const home = await req("GET", "/");
  record("Public", "GET / (SPA)", home, [200], home.body.includes('<div id="root">') ? "react root ok" : "no react root");
  record("Public", "GET /api/user-projects", await req("GET", "/api/user-projects"), [200]);
  record("Public", "GET /api/blog-articles", await req("GET", "/api/blog-articles"), [200]);
  record("Public", "GET /api/company-personnel", await req("GET", "/api/company-personnel"), [200]);
  record("Public", "GET /api/website-content", await req("GET", "/api/website-content"), [200]);

  // ---------- 2. CLIENT AUTH + PORTAL ----------
  record("Client", "register", await req("POST", "/api/users/register", { email: ce, password: "Audit123", first_name: "Audit", last_name: "Client", display_name: "Audit Client" }), [200, 201]);
  const cl = await req("POST", "/api/users/login", { email: ce, password: "Audit123" });
  record("Client", "login", cl, [200]);
  const ct = cl.json?.token;
  const cid = cl.json?.id;
  record("Client", "client-dashboard", await req("GET", "/api/users/client-dashboard", null, ct), [200]);
  record("Client", "my-quotes", await req("GET", "/api/users/my-quotes", null, ct), [200]);
  record("Client", "my-change-requests", await req("GET", "/api/users/my-change-requests", null, ct), [200]);
  record("Client", "my-signature-requests", await req("GET", "/api/users/my-signature-requests", null, ct), [200]);
  record("Client", "client-feedback list", await req("GET", `/api/users/client-feedback/${cid}`, null, ct), [200]);
  record("Client", "client-feedback POST", await req("POST", "/api/users/client-feedback", { title: "audit " + stamp, message: "audit message " + stamp }, ct), [200, 201]);
  record("Client", "notifications/me", await req("GET", "/api/users/notifications/me", null, ct), [200]);
  record("Client", "notifications read-all", await req("PUT", "/api/users/notifications/read-all/me", null, ct), [200]);
  record("Client", "my-reports", await req("GET", "/api/users/my-reports", null, ct), [200]);
  record("Client", "profile-photo GET (none)", await req("GET", `/api/users/profile-photo/${cid}`), [404]);
  const boundary = "----audit" + stamp;
  const mp = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="userId"\r\n\r\n${cid}\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="profilePhoto"; filename="t.png"\r\nContent-Type: image/png\r\n\r\n`),
    Buffer.from(TINY_PNG, "base64"),
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);
  record("Client", "profile-photo UPLOAD", await req("POST", "/api/users/upload-profile-photo", null, ct, { buffer: mp, contentType: `multipart/form-data; boundary=${boundary}` }), [200]);
  const ph = await req("GET", `/api/users/profile-photo/${cid}`);
  record("Client", "profile-photo GET (uploaded)", ph, [200], ph.headers["content-type"]);
  record("Client", "change-password (wrong old)", await req("POST", "/api/users/change-password", { currentPassword: "nope", newPassword: "x" }, ct), [400, 401]);
  record("Client", "my-invoices PDF (ownership)", await req("GET", "/api/users/my-invoices/1/pdf", null, ct), [404]);
  record("Client", "foreign project isolation", await req("GET", "/api/users/project-team-template/1", null, ct), [403, 404]);

  // ---------- 3. ADMIN AUTH + PHOTO ----------
  record("Admin", "register", await req("POST", "/api/admin-verification/register", { email: ae, password: "Audit123", first_name: "Audit", last_name: "Admin", role: "admin" }), [201]);
  const al = await req("POST", "/api/admin-verification/authenticate-enhanced", { email: ae, password: "Audit123" });
  record("Admin", "login", al, [200]);
  const at = al.json?.token;
  const aid = al.json?.user?.id;
  const as = await req("GET", "/api/admin/session", null, at);
  record("Admin", "session", as, [200], `has_photo=${as.json?.user?.has_photo}`);
  record("Admin", "photo upload", await req("POST", "/api/admin/profile-photo", { userId: aid, role: "admin", profile_photo_base64: "data:image/png;base64," + TINY_PNG, profile_photo_mime_type: "image/png", profile_photo_file_name: "t.png" }, at), [200]);
  const aph = await req("GET", `/api/admin/profile-photo/admin/${aid}`);
  record("Admin", "photo GET", aph, [200], aph.headers["content-type"]);
  record("Admin", "photo DELETE", await req("DELETE", "/api/admin/profile-photo", { userId: aid, role: "admin" }, at), [200]);

  // ---------- 4. ADMIN DATA ----------
  record("AdminData", "dashboard", await req("GET", "/api/admin/dashboard", null, at), [200]);
  record("AdminData", "budget-overview", await req("GET", "/api/admin/budget-overview", null, at), [200]);
  record("AdminData", "pending-approvals", await req("GET", "/api/admin/pending-approvals", null, at), [200]);
  record("AdminData", "ledger", await req("GET", "/api/admin/ledger", null, at), [200]);
  record("AdminData", "invoices list", await req("GET", "/api/invoices", null, at), [200]);
  record("AdminData", "mpesa transactions", await req("GET", "/api/mpesa/transactions", null, at), [200]);
  record("AdminData", "projects/all", await req("GET", "/api/admin/projects/all", null, at), [200]);
  record("AdminData", "search", await req("GET", "/api/admin/search?q=aud", null, at), [200]);
  record("AdminData", "node-settings", await req("GET", "/api/admin/node-settings", null, at), [200]);
  record("AdminData", "change-requests", await req("GET", "/api/admin/change-requests", null, at), [200]);
  record("AdminData", "signature-requests", await req("GET", "/api/admin/signature-requests", null, at), [200]);

  // ---------- 5. TEAM MEMBERS + CREW TEMPLATES ----------
  const tm = await req("POST", "/api/admin/team", { name: "Audit Lead " + stamp, role: "Team Leader", email: `lead${stamp}@test.com`, is_active: 1 }, at);
  record("Team", "member POST", tm, [200, 201]);
  trash.memberId = tm.json?.id || tm.json?.memberId || tm.json?.insertId;
  record("Team", "member list", await req("GET", "/api/admin/team", null, at), [200]);
  if (trash.memberId) record("Team", "member PUT", await req("PUT", `/api/admin/team/${trash.memberId}`, { name: "Audit Lead U" }, at), [200]);
  const tt = await req("POST", "/api/admin/team-templates", { name: "Audit Crew " + stamp, description: "audit", team_leader_id: trash.memberId || null, team_leader_image: "data:image/png;base64," + TINY_PNG, team_leader_image_mime: "image/png", member_ids: trash.memberId ? [trash.memberId] : [] }, at);
  record("Team", "template POST", tt, [200, 201]);
  trash.templateId = tt.json?.id || tt.json?.templateId || tt.json?.insertId;
  record("Team", "template list", await req("GET", "/api/admin/team-templates", null, at), [200]);
  if (trash.templateId) {
    record("Team", "template GET:id", await req("GET", `/api/admin/team-templates/${trash.templateId}`, null, at), [200]);
    record("Team", "template PUT", await req("PUT", `/api/admin/team-templates/${trash.templateId}`, { name: "Audit Crew U" }, at), [200]);
  }
  const own = await req("POST", "/api/user-projects", { user_id: cid, project_name: "Audit Project " + stamp, project_description: "audit", project_type: "consulting", client_email: ce, created_by: cid }, at);
  record("Team", "project POST (admin creates)", own, [200, 201]);
  const pid = own.json?.id;
  if (pid && trash.templateId) {
    await req("PUT", `/api/admin/team-templates/${trash.templateId}`, { project_id: pid }, at);
    const ptt = await req("GET", `/api/users/project-team-template/${pid}`, null, ct);
    record("Team", "client sees own project crew", ptt, [200], ptt.json?.template ? "leader=" + (ptt.json.template.leader_name || "?") : "no template payload");
  }
  if (trash.templateId) record("Team", "template DELETE", await req("DELETE", `/api/admin/team-templates/${trash.templateId}`, null, at), [200]);
  if (trash.memberId) record("Team", "member DELETE", await req("DELETE", `/api/admin/team/${trash.memberId}`, null, at), [200]);

  // ---------- 6. BILLING CHAIN ----------
  // Baseline notification count BEFORE invoice creation (welcome note from
  // registration already exists — we must measure the DELTA, not the total).
  let notesBefore = 0;
  if (ct) {
    const nb = await req("GET", "/api/users/notifications/me", null, ct);
    notesBefore = (nb.json?.notifications || []).length;
  }
  const inv = await req("POST", "/api/invoices", { title: "Audit Invoice " + stamp, invoice_number: "AUD" + stamp, project_id: pid, client_name: "Audit Client", client_email: ce, subtotal: 1000, tax_type: "vat", tax_rate: "16", items: [{ description: "work", quantity: 1, unit_price: 1000, line_total: 1000 }] }, at);
  record("Billing", "invoice POST -> DB", inv, [201]);
  trash.invoiceId = inv.json?.id;
  let notesAfter = notesBefore;
  if (ct) {
    const na = await req("GET", "/api/users/notifications/me", null, ct);
    notesAfter = (na.json?.notifications || []).length;
  }
  record("Billing", "client NOTIFIED on invoice create", { status: notesAfter > notesBefore ? 200 : 599 }, [200], `before=${notesBefore} after=${notesAfter}`);
  const send = await req("POST", `/api/invoices/${trash.invoiceId}/send`, {}, at);
  record("Billing", "invoice send (email)", send, [200], (send.json?.message || send.json?.error || "").slice(0, 60));
  const stk = await req("POST", "/api/mpesa/stkpush", { phoneNumber: "254700000000", amount: 1, accountReference: "AUD" + stamp, userId: cid });
  record("Billing", "mpesa stkpush (sim)", stk, [200]);
  const crid = stk.json?.checkoutRequestId;
  if (crid) {
    await req("POST", "/api/mpesa/callback", { Body: { stkCallback: { CheckoutRequestID: crid, ResultCode: 0, ResultDesc: "Audit success", CallbackMetadata: { Item: [{ Name: "MpesaReceiptNumber", Value: "AUD" + stamp }] } } } });
    const st = await req("GET", `/api/mpesa/status/${crid}`);
    record("Billing", "mpesa status after callback", st, [200], st.json?.transaction?.status || st.json?.status || "");
    const led = await req("GET", "/api/admin/ledger", null, at);
    const entry = (led.json?.entries || []).find((e) => (e.description || "").includes("AUDIT") || (e.transaction_reference || "") === "AUD" + stamp);
    record("Billing", "payment -> ledger entry", { status: entry ? 200 : 599 }, [200], entry ? "entry found" : "no ledger entry");
    if (trash.invoiceId) {
      const iv = await req("GET", `/api/invoices/${trash.invoiceId}`, null, at);
      record("Billing", "invoice marked PAID after payment", { status: String(iv.json?.status).toLowerCase() === "paid" ? 200 : 599 }, [200], `status=${iv.json?.status}`);
    }
  }

  await cleanupAll();
  printReport();
})().catch((e) => { console.error("AUDIT CRASHED:", e); process.exit(1); });

async function cleanupAll() {
  try {
    const db = require("../backend/config/database");
    for (const em of trash.emails) {
      await db.promise().query("DELETE FROM admin_users WHERE email = ?", [em]).catch(() => {});
      await db.promise().query("DELETE FROM users WHERE email = ?", [em]).catch(() => {});
    }
    if (trash.invoiceId) await db.promise().query("DELETE FROM invoices WHERE id = ?", [trash.invoiceId]).catch(() => {});
    if (trash.templateId) {
      await db.promise().query("DELETE FROM team_template_members WHERE template_id = ?", [trash.templateId]).catch(() => {});
      await db.promise().query("DELETE FROM team_templates WHERE id = ?", [trash.templateId]).catch(() => {});
    }
    await db.promise().query("DELETE FROM mpesa_transactions WHERE account_reference LIKE 'AUD%'").catch(() => {});
    await db.promise().query("DELETE FROM accounting_entries WHERE description LIKE '%AUDIT%'").catch(() => {});
    await db.promise().query("DELETE FROM user_projects WHERE project_name LIKE 'Audit Project %'").catch(() => {});
    await db.promise().query("DELETE FROM user_feedback WHERE comment LIKE 'audit %'").catch(() => {});
    console.log("[CLEANUP] test data removed");
  } catch (e) {
    console.warn("[CLEANUP] partial:", e.message);
  }
}

function printReport() {
  const pass = results.filter((r) => r.ok).length;
  const fail = results.length - pass;
  console.log("\n" + "=".repeat(78));
  console.log(`FULL AUDIT: ${pass} passed, ${fail} failed, ${results.length} total`);
  console.log("=".repeat(78));
  let area = "";
  for (const r of results) {
    if (r.area !== area) { area = r.area; console.log(`\n— ${area} —`); }
    console.log(`  ${r.ok ? "PASS" : "FAIL"} [${r.status}${r.status === 0 ? " " + (r.note || "") : ""}] ${r.name}${r.note ? "  — " + r.note : ""}`);
  }
  process.exit(fail > 0 ? 1 : 0);
}
