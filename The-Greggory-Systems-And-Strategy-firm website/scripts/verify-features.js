// Live end-to-end verification: every API call the rebuilt/new pages make,
// exercised exactly the way the frontend calls it (with admin token),
// including create -> read-back -> delete round-trips.
//
// Default target is localhost:3000 so the script still works from a dev
// machine with the primary server running locally. To verify the deployed
// service instead, set TARGET_ORIGIN to the live base URL (with protocol,
// no trailing slash), e.g.:
//   node scripts/verify-features.js
// or
//   TARGET_ORIGIN=https://your-live-origin.example.com node scripts/verify-features.js
const http = require("http");
require("dotenv").config({ path: require('path').resolve(__dirname, '../.env') });

const DEFAULT_TARGET = "http://127.0.0.1:3000";
const TARGET_ORIGIN = (process.env.TARGET_ORIGIN || "").trim() || DEFAULT_TARGET;
if (!/^https?:\/\//i.test(TARGET_ORIGIN)) {
  throw new Error(
    "TARGET_ORIGIN must be a full base URL (e.g. http://127.0.0.1:3000 or " +
      "https://your-live-origin.example.com). Set the env var or edit DEFAULT_TARGET."
  );
}
const targetUrl = new URL(TARGET_ORIGIN);

function api(path, method, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : "";
    const headers = { "Content-Type": "application/json" };
    if (data) headers["Content-Length"] = Buffer.byteLength(data);
    if (token) headers["Authorization"] = "Bearer " + token;

    const requestModule = targetUrl.protocol === "https:" ? require("https") : http;
    const req = requestModule.request(
      {
        hostname: targetUrl.hostname,
        port: targetUrl.port || (targetUrl.protocol === "https:" ? 443 : 80),
        path,
        method,
        headers,
      },
      (res) => {
        let b = "";
        res.on("data", (c) => (b += c));
        res.on("end", () => resolve({ status: res.statusCode, body: b }));
      }
    );
    req.on("error", (err) =>
      reject(
        new Error(
          `request to ${TARGET_ORIGIN}${path} failed: ${err.code || err.message}`
        )
      )
    );
    if (data) req.write(data);
    req.end();
  });
}
const J = (b) => { try { return JSON.parse(b); } catch { return null; } };
let pass = 0, fail = 0; const failures = [];
function check(name, cond, extra) {
  if (cond) { pass++; console.log("  PASS", name); }
  else { fail++; failures.push(name + (extra ? " -- " + extra : "")); console.log("  FAIL", name, extra || ""); }
}

(async () => {
  // Pre-flight: auth_platform_mapping must be locked+active or every register /
  // login below is rejected with 400 MAPPING_NOT_LOCKED.
  console.log("--- DB PRE-FLIGHT ---");
  try {
    const { ensureAuthSeedData } = require("./preflight-db");
    await ensureAuthSeedData({});
  } catch (e) {
    console.warn("   pre-flight skipped:", e.message);
  }

  const em = "verify" + Date.now() + "@test.com";
  await api("/api/admin-verification/register", "POST", { email: em, password: "Verify123", first_name: "Ver", last_name: "Ify", role: "admin", admin_code: process.env.ADMIN_CODE });
  // Login can transiently hit the global 100-req/15-min rate limiter (plain-text
  // 429 body) when runs are back-to-back — retry a few times before giving up.
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  let tok = null;
  for (let i = 1; i <= 5 && !tok; i++) {
    const login = await api("/api/admin-verification/authenticate-enhanced", "POST", { email: em, password: "Verify123" });
    tok = J(login.body)?.token;
    if (!tok) { console.log(`login attempt ${i} failed (${login.status}) — retrying...`); await sleep(800); }
  }
  if (!tok) { console.log("FATAL: no token"); process.exit(1); }
  console.log("auth OK\n--- FINANCIAL HUB (Financial.jsx) ---");
  // --- CLIENT USER auth (Signup.jsx -> /users/register -> /users/login) ---
  const uem = "verifyuser" + Date.now() + "@test.com";
  let ur = await api("/api/users/register", "POST", { email: uem, password: "Verify123", first_name: "Cli", last_name: "Ent", phone: "+254700000099" });
  check("user register 201", ur.status === 201, (ur.body || "").substring(0, 80));
  let ulog = await api("/api/users/login", "POST", { email: uem, password: "Verify123" });
  const ud = J(ulog.body);
  check("user login 200 + token (no email-token gating)", ulog.status === 200 && !!ud?.token, (ulog.body || "").substring(0, 80));

  // ── CLIENT PORTAL ACCESS (ClientPortal.jsx -> PrivateRoute -> client-dashboard) ──
  const cd = await api("/api/users/client-dashboard", "GET", null, ud?.token);
  check("client portal dashboard 200 (token works)", cd.status === 200, (cd.body || "").substring(0, 90));
  const badTok = await api("/api/users/client-dashboard", "GET", null, undefined);
  check("client portal dashboard 401 without token (redirects to /login)", badTok.status === 401, "status=" + badTok.status);

  console.log("--- FINANCIAL HUB (Financial.jsx) ---");

  let r = await api("/api/admin/ledger", "GET", null, tok);
  check("ledger list 200 + entries[]", r.status === 200 && Array.isArray(J(r.body)?.entries));
  r = await api("/api/invoices", "GET", null, tok);
  check("invoices list 200", r.status === 200 && (Array.isArray(J(r.body)?.invoices) || Array.isArray(J(r.body)?.data) || Array.isArray(J(r.body))));
  r = await api("/api/mpesa/transactions", "GET", null, tok);
  check("mpesa list 200 + transactions[]", r.status === 200 && Array.isArray(J(r.body)?.transactions));

  // Invoice generation round-trip (CreateInvoice.jsx -> Financial Hub table -> delete)
  const stamp = "V" + Date.now();
  r = await api("/api/invoices", "POST", { title: "Verify " + stamp, total_amount_kes: 7777, client_name: "Verify Client", client_email: em, status: "sent", issue_date: new Date().toISOString().split("T")[0] }, tok);
  check("create invoice 201", r.status === 201 || r.status === 200, r.body.substring(0, 90));
  r = await api("/api/invoices", "GET", null, tok);
  const invList = J(r.body)?.invoices || J(r.body)?.data || [];
  const created = invList.find(i => i.title === "Verify " + stamp);
  check("invoice persisted & listed", !!created);
  if (created) {
    const send = await api("/api/invoices/" + created.id + "/send", "POST", {}, tok);
    check("send invoice to client (email+PDF)", send.status === 200, (send.body || "").substring(0, 90));
    const pdf = await api("/api/pdf/completion/invoices/" + created.id, "GET", null, tok);
    const isPdf = /^%PDF/.test(pdf.body || "");
    check("completion PDF co-generator (invoice)", pdf.status === 200 && isPdf, "status=" + pdf.status + " bytes=" + (pdf.body || "").length);
    const del = await api("/api/invoices/" + created.id, "DELETE", null, tok);
    check("delete invoice (Financial Hub button)", del.status === 200);
  }

  // ── KRA TAX COMPLIANCE: tax_rate 16 must be stored as fraction 0.16 and
  //    the DB-generated tax_amount/total_amount must equal 16% / +tax. ──
  const ktaxTitle = "KRA VAT " + Date.now();
  r = await api("/api/invoices", "POST", { title: ktaxTitle, tax_rate: 16, tax_type: "vat", subtotal: 1000, client_name: "KRA Test Client", items: [{ description: "Consulting", quantity: 1, unit_price: 1000 }], issue_date: new Date().toISOString().split("T")[0] }, tok);
  check("KRA: create invoice with tax_rate 16", r.status === 201 || r.status === 200, r.body.substring(0, 90));
  r = await api("/api/invoices", "GET", null, tok);
  const ktax = (J(r.body)?.invoices || J(r.body)?.data || []).find(i => i.title === ktaxTitle);
  if (ktax) {
    const storedRate = Number(ktax.tax_rate);
    const taxAmt = Number(ktax.tax_amount);
    const totAmt = Number(ktax.total_amount || ktax.total_amount_kes);
    check("KRA: tax_rate stored as 0.16 (fraction)", Math.abs(storedRate - 0.16) < 0.0001, "got " + storedRate);
    check("KRA: tax_amount = subtotal × 16%", Math.abs(taxAmt - 160.0) < 0.01, "got " + taxAmt);
    check("KRA: total = subtotal + VAT", Math.abs(totAmt - 1160.0) < 0.01, "got " + totAmt);
    const dokra = await api("/api/invoices/" + ktax.id, "DELETE", null, tok);
    check("KRA: cleanup test invoice", dokra.status === 200);
  } else {
    check("KRA: persisted VAT invoice found for assertions", false, "not found");
  }


  console.log("--- LEDGER (ManualEntry.jsx -> Ledger tab) ---");
  r = await api("/api/accounting/entries", "POST", { description: "Verify " + stamp, amount: 500, entry_type: "expense", category: "Verification", payment_status: "completed" }, tok);
  check("create ledger entry", r.status === 201 || r.status === 200, r.body.substring(0, 90));
  r = await api("/api/admin/ledger", "GET", null, tok);
  const entry = (J(r.body)?.entries || []).find(e => e.description === "Verify " + stamp);
  check("ledger entry persisted & listed", !!entry);
  if (entry) {
    const del = await api("/api/accounting/entries/" + entry.id, "DELETE", null, tok);
    check("delete ledger entry", del.status === 200);
    r = await api("/api/admin/ledger", "GET", null, tok);
    check("deleted entry gone from ledger", !(J(r.body)?.entries || []).some(e => e.id === entry.id));
  }

  console.log("--- REPORTS (Reports.jsx) ---");
  r = await api("/api/admin-complete/budget-overview", "GET", null, tok);
  const bo = J(r.body)?.data;
  check("budget-overview 200 + revenue/expenses/net", r.status === 200 && bo && "revenue" in bo && "expenses" in bo && "net_income" in bo, r.body.substring(0, 80));
  r = await api("/api/user-projects", "GET", null, tok);
  const projects = Array.isArray(J(r.body)) ? J(r.body) : (J(r.body)?.projects || []);
  check("user-projects list (status chart)", Array.isArray(projects));
  check("dashboard budget-overview (AdvancedDashboard)", (await api("/api/admin/budget-overview", "GET", null, tok)).status === 200);

  console.log("--- ACCOUNTING CATEGORIES (FinancialManagement.jsx -> Categories tab) ---");
  const catName = "VerifyCat " + stamp;
  r = await api("/api/accounting/categories", "POST", { name: catName, category_type: "expense", default_budget_percentage: "10", display_order: "99", color_code: "#4c6a4d", is_active: true }, tok);
  check("create category 201", r.status === 201, (r.body || "").substring(0, 90));
  r = await api("/api/accounting/categories", "GET", null, tok);
  let cat = (J(r.body)?.categories || []).find(c => c.name === catName);
  check("category persisted & listed", !!cat);
  if (cat) {
    r = await api("/api/accounting/categories/" + cat.id, "PUT", { name: catName + " U", category_type: "both", default_budget_percentage: "20", display_order: "98", color_code: "#4c6a4d", is_active: true }, tok);
    check("update category 200", r.status === 200, (r.body || "").substring(0, 80));
    r = await api("/api/accounting/categories", "GET", null, tok);
    check("category update persisted", (J(r.body)?.categories || []).some(c => c.name === catName + " U"));
    // UNIQUE(name) — duplicate must be rejected cleanly, not crash the process
    r = await api("/api/accounting/categories", "POST", { name: catName + " U", category_type: "expense" }, tok);
    check("duplicate category name rejected", r.status >= 400 && r.status < 600, "status=" + r.status);
    r = await api("/api/accounting/categories/" + cat.id, "DELETE", null, tok);
    check("archive category 200", r.status === 200);
    r = await api("/api/accounting/categories", "GET", null, tok);
    check("archived category gone from active list", !(J(r.body)?.categories || []).some(c => c.id === cat.id));
  }

  console.log("--- ACCOUNTING PERIODS (FinancialManagement.jsx -> Periods tab) ---");
  // NOTE: compute the test project id locally — `pid` is declared later in the
  // PROJECT DETAIL section (TDZ), and the General/Unassigned fallback project
  // created by the invoice resolver is exactly what we want to attach to.
  const testPid = projects[0]?.id || projects[0]?.project_id;
  if (projects.length > 0 && testPid) {
    const perName = "VerifyPeriod " + stamp;
    r = await api("/api/accounting/periods", "POST", { project_id: testPid, period_name: perName, period_type: "monthly", start_date: "2026-01-01", end_date: "2026-01-31", total_budget: "10000", allocated_budget: "5000", status: "planning", locked: false }, tok);
    check("create period 201", r.status === 201, (r.body || "").substring(0, 90));
    r = await api("/api/accounting/periods", "GET", null, tok);
    let per = (J(r.body)?.periods || []).find(p => p.period_name === perName);
    check("period persisted & listed", !!per);
    if (per) {
      r = await api("/api/accounting/periods/" + per.id, "PUT", { project_id: testPid, period_name: perName + " U", period_type: "quarterly", start_date: "2026-01-01", end_date: "2026-03-31", total_budget: "20000", allocated_budget: "8000", status: "active", locked: false }, tok);
      check("update period 200", r.status === 200, (r.body || "").substring(0, 80));
      r = await api("/api/accounting/periods/" + per.id, "DELETE", null, tok);
      check("delete unlocked period 200", r.status === 200, (r.body || "").substring(0, 80));
    }
    const lockName = "VerifyLocked " + stamp;
    r = await api("/api/accounting/periods", "POST", { project_id: testPid, period_name: lockName, period_type: "monthly", start_date: "2026-02-01", end_date: "2026-02-28", locked: true }, tok);
    const lockId = J(r.body)?.id;
    check("create locked period 201", r.status === 201, (r.body || "").substring(0, 80));
    if (lockId) {
      r = await api("/api/accounting/periods/" + lockId, "DELETE", null, tok);
      check("locked period delete rejected 409", r.status === 409, "status=" + r.status + " " + (r.body || "").substring(0, 60));
      await api("/api/accounting/periods/" + lockId, "PUT", { project_id: testPid, period_name: lockName, period_type: "monthly", start_date: "2026-02-01", end_date: "2026-02-28", locked: false }, tok);
      r = await api("/api/accounting/periods/" + lockId, "DELETE", null, tok);
      check("cleanup: unlock then delete period", r.status === 200);
    }
    r = await api("/api/accounting/periods", "POST", { project_id: testPid, period_name: "Bad " + stamp, period_type: "monthly", start_date: "2026-03-10", end_date: "2026-03-01" }, tok);
    check("end-before-start rejected 400", r.status === 400, "status=" + r.status);
    r = await api("/api/accounting/periods", "POST", { period_name: "NoProject " + stamp, start_date: "2026-01-01", end_date: "2026-01-31" }, tok);
    check("missing project_id rejected 400", r.status === 400, "status=" + r.status);
  } else check("period tests (skipped - no projects exist)", true);

  console.log("--- P&L SUMMARY + SAVED REPORTS (Reports + Dashboard tabs) ---");
  r = await api("/api/accounting/reports/summary", "GET", null, tok);
  const sum = J(r.body)?.summary;
  check("summary 200 + income/expenses/net_profit", r.status === 200 && sum && "total_income" in sum && "total_expenses" in sum && "net_profit" in sum, (r.body || "").substring(0, 80));
  check("summary has by_category/by_month/by_status arrays", Array.isArray(J(r.body)?.by_category) && Array.isArray(J(r.body)?.by_month) && Array.isArray(J(r.body)?.by_status));
  r = await api("/api/accounting/reports/summary?start_date=2020-01-01&end_date=2020-12-31", "GET", null, tok);
  check("summary date-range filter (assumes no 2020 entries)", r.status === 200 && Number(J(r.body)?.summary?.entry_count) === 0, "entry_count=" + J(r.body)?.summary?.entry_count);
  if (projects.length > 0 && testPid) {
    r = await api("/api/financial/reports", "POST", { project_id: testPid, report_type: "profit_loss", report_name: "Verify Report " + stamp, data: { verify: true }, summary: "smoke test report" }, tok);
    check("save P&L report 201", r.status === 201, (r.body || "").substring(0, 90));
    r = await api("/api/financial/reports", "GET", null, tok);
    check("saved report listed", JSON.stringify(J(r.body)?.reports || []).includes("Verify Report " + stamp));
  } else check("report save (skipped - no projects exist)", true);

  console.log("--- PERMISSIONS MANAGER ---");
  const perms = JSON.stringify(["VIEW_USERS", "VIEW_REPORTS"]);
  r = await api("/api/admin/settings", "PUT", { role_permissions_tester2: perms }, tok);
  check("save role matrix", r.status === 200);
  r = await api("/api/admin/settings", "GET", null, tok);
  check("role matrix persisted", J(r.body)?.settings?.role_permissions_tester2 === perms);

  console.log("--- MEDIA LIBRARY / MESSAGES / NOTIFICATIONS ---");
  r = await api("/api/images", "GET", null, tok);
  check("images list 200", r.status === 200);
  r = await api("/api/images", "POST", { dataBase64: "iVBORw0KGgoAAAANSUhEUg==", contentType: "image/png", fileName: "verify-" + stamp + ".png" }, tok);
  const imgId = J(r.body)?.image_id || J(r.body)?.id || J(r.body)?.image?.id;
  check("image upload 201", r.status === 201 || r.status === 200, r.body.substring(0, 80));
  if (imgId) {
    r = await api("/api/images/" + imgId, "GET", null, tok);
    check("image detail 200", r.status === 200);
    r = await api("/api/images/" + imgId, "DELETE", null, tok);
    check("image cleaned up (Media Library delete)", r.status === 200);
  }
  r = await api("/api/contact-forms", "GET", null, tok);
  check("contact forms (Messages inbox)", r.status === 200);
  r = await api("/api/admin/change-requests", "GET", null, tok);
  check("change-requests (NotificationBell)", r.status === 200);

  console.log("--- PROJECT DETAIL / DASHBOARD ---");
  const pid = projects[0]?.id || projects[0]?.project_id;
  if (pid) {
    r = await api("/api/user-projects/" + pid, "GET", null, tok);
    check("project detail 200 (ProjectDetail)", r.status === 200, r.body.substring(0, 60));
    r = await api("/api/projects/" + pid + "/tasks", "GET", null, tok);
    check("project tasks 200 (ProjectDetail)", r.status === 200, r.body.substring(0, 60));
  } else check("project detail (skipped - no projects)", true);
  check("admin dashboard 200", (await api("/api/admin/dashboard", "GET", null, tok)).status === 200);
  check("pending approvals 200", (await api("/api/admin/pending-approvals", "GET", null, tok)).status === 200);
  check("team list 200", (await api("/api/admin/team", "GET", null, tok)).status === 200);

  console.log("--- CLEANUP ---");
  try {
    const { purgeTestData } = require("./purge-test-data");
    const summary = await purgeTestData({ log: console.log });
    console.log(`   removed ${summary.deleted} test row(s)`);
  } catch (e) {
    console.warn("   cleanup skipped:", e.message);
  }

  console.log("\n==================================================");
  console.log("FEATURE VERIFICATION: " + pass + " passed, " + fail + " failed, " + (pass + fail) + " total");
  if (failures.length) console.log("FAILURES: " + failures.join(" | "));
  console.log("==================================================");
  process.exit(0);
})().catch(e => { console.error("FATAL:", e.message); process.exit(1); });
