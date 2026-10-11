// REAL-BROWSER regression test for the navbar hide/show scroll behavior.
//
// jsdom (scripts/test-navbar-scroll.mjs) has no layout, no CSS transitions
// and no scroll anchoring — it literally cannot see the bug this test
// guards: the old negative-margin space collapse made Chrome's scroll
// anchoring fire synthetic scroll events that re-hid the bar and starved
// its idle timer, leaving it STUCK HIDDEN while the page sat stationary
// (observed: 78 scroll events + 29 visibility flips during 3s of zero input).
//
// Run (from the website folder, after `npx vite build`):
//   node scripts/test-navbar-browser.mjs
import puppeteer from "puppeteer-core";
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(__dirname, "..", "dist");
const PORT = 4178;
const CHROME = process.env.BROWSER_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".mp4": "video/mp4", ".json": "application/json", ".ico": "image/x-icon", ".woff2": "font/woff2" };

const server = http.createServer((req, res) => {
  const p = decodeURIComponent(req.url.split("?")[0]);
  let file = path.join(dist, p);
  if (!file.startsWith(dist) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(dist, "index.html");
  res.setHeader("Content-Type", MIME[path.extname(file)] || "application/octet-stream");
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(PORT, r));

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new" });
let failures = 0;
const check = (ok, label, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? "  — " + detail : ""}`);
  if (!ok) failures++;
};

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle2", timeout: 30000 });
  await sleep(1200);

  // Instrument: scroll events + nav visibility mutations (class changes).
  await page.evaluate(() => {
    const snap = () => {
      const n = document.querySelector("nav");
      if (!n) return { vis: "no-nav" };
      return {
        vis: n.className.includes("-translate-y-full") ? "hidden" : "shown",
        y: Math.round(window.scrollY),
        top: Math.round(n.getBoundingClientRect().top * 10) / 10,
      };
    };
    window.__snap = snap;
    window.__ev = { scrolls: [], toggles: [] };
    window.addEventListener("scroll", () => window.__ev.scrolls.push({ t: Math.round(performance.now()), y: Math.round(window.scrollY) }), { passive: true });
    const nav = document.querySelector("nav");
    new MutationObserver(() => window.__ev.toggles.push({ t: Math.round(performance.now()), ...snap() })).observe(nav, { attributes: true, attributeFilter: ["class"] });
    window.__reset = () => { window.__ev.scrolls = []; window.__ev.toggles = []; };
  });

  // 1. Real wheel scroll-down → bar must hide.
  await page.mouse.move(640, 400);
  for (let i = 0; i < 12; i++) {
    await page.mouse.wheel({ deltaY: 150 });
    await sleep(50);
  }
  const afterDown = await page.evaluate(() => window.__snap());
  check(afterDown.vis === "hidden" && afterDown.y > 400, "scroll-down hides the bar", JSON.stringify(afterDown));

  // 2. STATIONARY (zero input, 3s) → bar must pop back and STAY back.
  await page.evaluate(() => window.__reset());
  await sleep(3000);
  const idle = await page.evaluate(() => ({ ev: window.__ev, final: window.__snap() }));

  check(idle.ev.scrolls.length <= 5, "no scroll-event storm while stationary", `${idle.ev.scrolls.length} scroll events in 3s (bug repro: 78)`);
  check(idle.final.vis === "shown", "bar pops back when scrolling stops", JSON.stringify(idle.final));
  check(Math.abs(idle.final.top) <= 2, "revealed bar rests at viewport top", `nav top=${idle.final.top}px`);
  let flips = 0;
  for (let i = 1; i < idle.ev.toggles.length; i++) if (idle.ev.toggles[i].vis !== idle.ev.toggles[i - 1].vis) flips++;
  check(flips <= 2, "no visibility oscillation while stationary", `${flips} flips in 3s (bug repro: 29)`);

  // 3. Scroll up from this state → bar must still be shown (reveal path intact).
  for (let i = 0; i < 3; i++) {
    await page.mouse.wheel({ deltaY: -150 });
    await sleep(50);
  }
  await sleep(600);
  const afterUp = await page.evaluate(() => window.__snap());
  check(afterUp.vis === "shown", "scroll-up keeps the bar revealed", JSON.stringify(afterUp));
} finally {
  await browser.close();
  server.close();
}

console.log(failures === 0 ? "\nALL REAL-BROWSER CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
