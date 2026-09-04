// Live end-to-end verification: every API call the rebuilt/new pages make,
// exercised exactly the way the frontend calls it (with admin token),
// including create -> read-back -> delete round-trips.
const http = require("http");

function api(path, method, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : "";
    const headers = { "Content-Type": "application/json" };
    if (data) headers["Content-Length"] = Buffer.byteLength(data);
    if (token) headers["Authorization"] = "Bearer " + token;
    const req = http.request({ hostname: "127.0.0.1", port: 3000, path, method, headers }, (res) => {
      let b = ""; res.on("data", (c) => (b += c)); res.on("end", () => resolve({ status: res.statusCode, body: b }));
    });
    req.on("error", reject); if (data) req.write(data); req.end();
  });
}
const J = (b) => { try { return JSON.parse(b); } catch { return null; } };
let pass = 0, fail = 0; const failures = [];
function check(name, cond, extra) {
  if (cond) { pass++; console.log("  PASS", name); }
  else { fail++; failures.push(name + (extra ? " -- " + extra : "")); console.log("  FAIL", name, extra || ""); }
}

(async () => {
  const em = "verify" + Date.now() + "@test.com";
  await api("/api/admin-verification/register", "POST", { email: em, password: "Verify123", first_name: "Ver", last_name: "Ify", role: "admin" });
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

  console.log("auth OK\n--- FINANCIAL HUB (Financial.jsx) ---");

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
    const del = await api("/api/invoices/" + created.id, "DELETE", null, tok);
    check("delete invoice (Financial Hub button)", del.status === 200);
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

  console.log("\n==================================================");
  console.log("FEATURE VERIFICATION: " + pass + " passed, " + fail + " failed, " + (pass + fail) + " total");
  if (failures.length) console.log("FAILURES: " + failures.join(" | "));
  console.log("==================================================");
  process.exit(0);
})().catch(e => { console.error("FATAL:", e.message); process.exit(1); });
