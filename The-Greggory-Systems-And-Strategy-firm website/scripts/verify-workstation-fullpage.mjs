// REAL-BROWSER regression test: every admin navbar item must open a
// FULL-PAGE workstation ("popup page") that occupies the entire viewport.
//
// Guards the AdminLayout portal takeover: the workstation is rendered via
// createPortal(...) straight into <body> with `fixed inset-0`, so no ancestor
// stacking/clipping context can shrink or scroll it. Verifies:
//   1. /admin/<any-item> opens the workstation overlay sized to 100% of the
//      viewport (top/left = 0, width/height = innerWidth/innerHeight),
//      covering the page corners above the header/nav (z-order),
//   2. body scroll is locked while it is open and restored on close,
//   3. the X button closes it and returns to the /admin dashboard home,
//   4. Escape does the same,
//   5. the same full-page behavior holds at a mobile viewport.
//
// The backend is not required: /api/* responses are mocked in-browser and a
// fake super_admin session is injected into sessionStorage.
//
// Run (from the website folder, after `npx vite build`):
//   node scripts/verify-workstation-fullpage.mjs
import puppeteer from "puppeteer-core";
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(__dirname, "..", "dist");
const PORT = 4181;

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

const openWorkstation = async (page, url) => {
  await page.goto(`http://localhost:${PORT}${url}`, { waitUntil: "networkidle2", timeout: 45000 });
  await page.waitForSelector('[role="dialog"]', { timeout: 20000 });
};

const geometry = (page) =>
  page.evaluate(() => {
    const d = document.querySelector('[role="dialog"]');
    const r = d.getBoundingClientRect();
    return {
      top: Math.round(r.top), left: Math.round(r.left),
      width: Math.round(r.width), height: Math.round(r.height),
      vw: window.innerWidth, vh: window.innerHeight,
      bodyOverflow: document.body.style.overflow,
      coversCorner: document.elementFromPoint(2, 2)?.closest('[role="dialog"]') === d,
      label: d.getAttribute("aria-label"),
    };
  });

try {
  const page = await browser.newPage();
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

  // ── 1. Desktop: navbar item opens a full-viewport workstation ──────────
  await page.setViewport({ width: 1280, height: 800 });
  await openWorkstation(page, "/admin/users");
  let g = await geometry(page);
  check(g.top === 0 && g.left === 0 && g.width === g.vw && g.height === g.vh,
    "workstation occupies 100% of the viewport (desktop)",
    `box=${g.top},${g.left} ${g.width}x${g.height} viewport=${g.vw}x${g.vh}`);
  check(g.coversCorner, "workstation renders above header/nav (covers viewport corner)");
  check(g.bodyOverflow === "hidden", "body scroll locked while workstation open", `overflow='${g.bodyOverflow}'`);
  const shot1 = path.join(process.env.TEMP || process.env.TMP || ".", "workstation-desktop.png");
  await page.screenshot({ path: shot1 });
  console.log(`      screenshot → ${shot1}`);

  // ── 2. X button closes it → dashboard home ─────────────────────────────
  await page.click('button[title="Close Workstation"]');
  await page.waitForFunction(() => location.pathname === "/admin" && !document.querySelector('[role="dialog"]'), { timeout: 10000 });
  const overflowAfter = await page.evaluate(() => document.body.style.overflow);
  check(overflowAfter !== "hidden", "body scroll restored after close", `overflow='${overflowAfter}'`);

  // ── 3. Reopens via navbar; Escape closes it ────────────────────────────
  await openWorkstation(page, "/admin/settings");
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => location.pathname === "/admin" && !document.querySelector('[role="dialog"]'), { timeout: 10000 });
  check(true, "Escape closes the workstation → dashboard home");

  // ── 4. Mobile viewport: still full-page ────────────────────────────────
  await page.setViewport({ width: 375, height: 667 });
  await openWorkstation(page, "/admin/users");
  g = await geometry(page);
  check(g.top === 0 && g.left === 0 && g.width === g.vw && g.height === g.vh,
    "workstation occupies 100% of the viewport (mobile 375x667)",
    `box=${g.top},${g.left} ${g.width}x${g.height} viewport=${g.vw}x${g.vh}`);
  const shot2 = path.join(process.env.TEMP || process.env.TMP || ".", "workstation-mobile.png");
  await page.screenshot({ path: shot2 });
  console.log(`      screenshot → ${shot2}`);
} catch (e) {
  console.error("FAIL  unexpected error —", e.message);
  failures++;
} finally {
  await browser.close();
  server.close();
}

console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
