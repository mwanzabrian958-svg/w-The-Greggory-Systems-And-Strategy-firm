// REAL-BROWSER regression test: logging out of the admin dashboard must
// destroy the admin session and return the operator to the PUBLIC WEBSITE
// HOME PAGE (/) — NOT to /admin/login.
//
// Verifies:
//   1. the admin dashboard renders with the header Logout button,
//   2. clicking Logout lands on / (website home page),
//   3. the destination is not /admin/login,
//   4. gf_admin_session is wiped from both sessionStorage and localStorage,
//   5. the public site rendered (admin chrome gone, brand present).
//
// The backend is not required: /api/* responses are mocked in-browser and a
// fake super_admin session is injected into sessionStorage (same harness as
// scripts/verify-workstation-fullpage.mjs).
//
// Run (from the website folder, after `npx vite build`):
//   node scripts/verify-admin-logout-redirect.mjs
import puppeteer from "puppeteer-core";
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(__dirname, "..", "dist");
const PORT = 4182;

const CHROME = [
  process.env.BROWSER_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
].filter(Boolean).find((p) => fs.existsSync(p));
if (!CHROME) { console.error("No Chrome/Edge executable found — set BROWSER_PATH."); process.exit(1); }

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".mp4": "video/mp4", ".json": "application/json", ".ico": "image/x-icon", ".woff2": "font/woff2" };

const server = http.createServer((req, res) => {
  const p = decodeURIComponent(req.url.split("?")[0]);
  let file = path.join(dist, p);
  if (!file.startsWith(dist) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(dist, "index.html");
  res.setHeader("Content-Type", MIME[path.extname(file)] || "application/octet-stream");
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(PORT, r));

const MOCK_USER = { id: 1, role: "super_admin", admin_level: "super_admin", display_name: "Test Admin", email: "test@gssf.test" };
const GENERIC = { success: true, data: [], users: [], projects: [], posts: [], invoices: [], bills: [], tickets: [], notifications: [], messages: [], activity: [], roles: [], staff: [], applications: [], settings: {}, stats: {}, overview: {}, total: 0 };

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
let failures = 0;
const check = (ok, label, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? "  — " + detail : ""}`);
  if (!ok) failures++;
};

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    const url = req.url();
    if (!url.includes("/api/")) return req.continue();
    const body = url.includes("/api/admin/session") ? { success: true, user: MOCK_USER }
      : url.includes("/api/admin/settings") ? { success: true, settings: {} }
      : GENERIC;
    return req.respond({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
  });
  await page.evaluateOnNewDocument(() => {
    sessionStorage.setItem("gf_admin_session", JSON.stringify({ token: "test-token", user: { id: 1, role: "super_admin", display_name: "Test Admin" } }));
  });

  // ── 1. Dashboard renders with the header Logout button ──────────────────
  await page.goto(`http://localhost:${PORT}/admin`, { waitUntil: "networkidle2", timeout: 45000 });
  await page.waitForSelector('button[title="Logout"]', { timeout: 20000 });
  check(true, "admin dashboard renders with header Logout button");

  // ── 2. Click Logout → must land on the website home page ────────────────
  await page.click('button[title="Logout"]');
  await page.waitForFunction(() => location.pathname === "/", { timeout: 15000 });
  const landed = await page.evaluate(() => location.pathname);
  check(landed === "/", "logout returns the admin to the website home page", `pathname='${landed}'`);
  check(landed !== "/admin/login", "destination is NOT /admin/login");

  // ── 3. Session destroyed in both storages ───────────────────────────────
  const storage = await page.evaluate(() => ({
    ss: sessionStorage.getItem("gf_admin_session"),
    ls: localStorage.getItem("gf_admin_session"),
    token: localStorage.getItem("gf_admin_session_token"),
  }));
  check(storage.ss === null && storage.ls === null && storage.token === null,
    "admin session wiped from sessionStorage + localStorage",
    `ss=${JSON.stringify(storage.ss)} ls=${JSON.stringify(storage.ls)}`);

  // ── 4. Public home page rendered, admin chrome gone ─────────────────────
  const home = await page.evaluate(() => ({
    text: document.getElementById("root")?.innerText || "",
    adminLogoutGone: !document.querySelector('button[title="Logout"]'),
    adminChromeGone: !document.body.innerText.includes("Management Portal"),
    dialogGone: !document.querySelector('[role="dialog"]'),
  }));
  check(home.adminLogoutGone && home.adminChromeGone && home.dialogGone && home.text.length > 300,
    "public site rendered — admin chrome fully unmounted",
    `rootText=${home.text.length}chars`);
  const shot = path.join(process.env.TEMP || process.env.TMP || ".", "admin-logout-home.png");
  await page.screenshot({ path: shot });
  console.log(`      screenshot → ${shot}`);
} catch (e) {
  console.error("FAIL  unexpected error —", e.message);
  failures++;
} finally {
  await browser.close();
  server.close();
}

console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);

