const http = require("http");
const BASE = "http://localhost:3000";

let passed = 0, failed = 0;
const failures = [];

async function apiCall(method, path, body = null) {
  return new Promise((resolve) => {
    const url = new URL(BASE + path);
    const data = body ? JSON.stringify(body) : null;
    const headers = {};
    if (data) { headers["Content-Type"] = "application/json"; headers["Content-Length"] = Buffer.byteLength(data); }
    const req = http.request({ hostname: url.hostname, port: url.port || 3000, path: url.pathname + url.search, method, headers, timeout: 15000 }, (res) => {
      let chunks = "";
      res.on("data", (c) => { chunks += c; });
      res.on("end", () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(chunks) }); }
        catch { resolve({ status: res.statusCode, body: chunks.substring(0, 120) }); }
      });
    });
    req.on("error", (err) => resolve({ status: 0, error: err.message }));
    req.on("timeout", () => { req.destroy(); resolve({ status: 0, error: "timeout" }); });
    if (data) req.write(data);
    req.end();
  });
}

async function test(method, path, body, label) {
  const tag = label || `${method} ${path}`;
  const res = await apiCall(method, path, body);
  if (res.error || res.status === 0) {
    console.log(`  ERR ${tag} → ${res.error || "no connection"}`);
    failed++; failures.push(`${tag} (${res.error || "no connection"})`);
    return null;
  }
  if (res.status >= 500) {
    console.log(`  FAIL ${tag} (${res.status})`);
    failed++; failures.push(`${tag} (${res.status})`);
    return null;
  }
  console.log(`  OK   ${tag} (${res.status})`);
  passed++;
  return res.body;
}

(async () => {
  console.log("=== FULL ENDPOINT AUDIT (post-dedup) ===\n");

  console.log("--- Health ---");
  await test("GET", "/api/health");

  console.log("\n--- Admin dashboard/stats ---");
  await test("GET", "/api/admin/dashboard");
  await test("GET", "/api/admin/pending-approvals");

  console.log("\n--- CRM ---");
  await test("GET", "/api/admin/crm/contacts");
  await test("POST", "/api/admin/crm/contacts", { name: "Audit Contact", email: `audit-${Date.now()}@test.com` });

  console.log("\n--- Invoices ---");
  await test("GET", "/api/invoices");
  await test("POST", "/api/invoices", { title: "Audit Invoice", total_amount_kes: 1000, client_name: "Audit Client" });
  await test("PUT", "/api/invoices/1", { status: "pending" });

  console.log("\n--- Accounting ---");
  await test("GET", "/api/accounting-entries");
  await test("POST", "/api/accounting-entries", { description: "Audit Entry", amount: 500, entry_type: "expense", category: "Audit" });
  await test("PUT", "/api/accounting/entries/1", { description: "Audit Update", amount: 700 });

  console.log("\n--- Website content / Blog ---");
  await test("GET", "/api/website-content");
  await test("PUT", "/api/website-content/audit_key", { value: "Audit Value" });
  await test("GET", "/api/blog-articles");
  await test("GET", "/api/blog-articles/1");

  console.log("\n--- Personnel / Team ---");
  await test("GET", "/api/company-personnel");
  await test("POST", "/api/company-personnel", { name: "Audit Person", position: "Director" });
  await test("PUT", "/api/company-personnel/1", { name: "Audit Updated" });
  await test("GET", "/api/admin/team");
  await test("POST", "/api/admin/team", { name: "Audit Member", role: "developer" });

  console.log("\n--- Projects / Tasks ---");
  await test("GET", "/api/admin/projects");
  await test("POST", "/api/projects/4/tasks", { task_name: "Audit Task", status: "not_started", priority: "medium" });
  await test("GET", "/api/projects/4/tasks");

  console.log("\n--- Search / Settings / Reports ---");
  await test("GET", "/api/admin/search?q=test");
  await test("GET", "/api/admin/settings");
  await test("GET", "/api/admin/reports");

  console.log("\n--- Security / Logs ---");
  await test("GET", "/api/admin/data-safety-summary");
  await test("GET", "/api/admin/audit-logs");
  await test("GET", "/api/admin/data-access-logs");
  await test("GET", "/api/admin/activity-logs");

  console.log("\n--- Node settings / Calibration / Backup ---");
  await test("GET", "/api/admin/node-settings");
  await test("POST", "/api/admin/system-calibration", {});
  await test("GET", "/api/admin/backup/status");
  await test("POST", "/api/admin/backup/run", {});

  console.log("\n--- Change / Signature requests ---");
  await test("GET", "/api/admin/change-requests");
  await test("PUT", "/api/admin/change-requests/1", { status: "approved" });
  await test("GET", "/api/admin/signature-requests");

  console.log("\n--- Budget ---");
  await test("GET", "/api/admin/budget-overview");

  console.log(`\n=== SUMMARY ===`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  if (failures.length) {
    console.log("\nFailures:");
    failures.forEach((f) => console.log("  - " + f));
  }
  process.exit(0);
})();