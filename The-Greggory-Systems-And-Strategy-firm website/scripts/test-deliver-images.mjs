// REAL-BROWSER check for the "What We Deliver" service photos (Home.jsx).
//
// Each of the 10 service badges in the What We Deliver timeline shows a jpg
// inside its 40px icon box, falling back to the lucide icon via onError. This
// test verifies the files exist in dist/ AND actually render in Chrome
// (naturalWidth > 0 after lazy-load), plus a screenshot of the section.
//
// Run (from the website folder, after `npx vite build`):
//   node scripts/test-deliver-images.mjs
import puppeteer from "puppeteer-core";
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(__dirname, "..", "dist");
const PORT = 4179;
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
  await sleep(1000);

  // 1. Every deliver-*.jpg referenced by Home.jsx must ship in dist/.
  const expected = [
    "deliver-systems-design.jpg",
    "deliver-strategic-creation.jpg",
    "deliver-continuous-maintenance.jpg",
    "deliver-website-development.jpg",
    "deliver-web-desktop-apps.jpg",
    "deliver-mobile-applications.jpg",
    "deliver-product-support.jpg",
    "deliver-hardware-installations.jpg",
    "deliver-network-infrastructure.jpg",
    "deliver-strategy-consultations.jpg",
  ];
  for (const f of expected) check(fs.existsSync(path.join(dist, f)), `dist has ${f}`);

  // 2. All timeline badge images (10 services + 4 phases) must actually render.
  const heading = await page.evaluateHandle(() =>
    [...document.querySelectorAll("h2")].find((h) => h.textContent.trim() === "What We Deliver")
  );
  await heading.evaluate((h) => h.scrollIntoView({ block: "start" }));
  await sleep(1200);

  // Force lazy images into view one by one, then wait for decode.
  const badgeImgs = await page.$$("section img[src^='/deliver-'], section img[src^='/systems-'], section img[src^='/strategy-'], section img[src^='/network-'], section img[src^='/optimization-']");
  for (const img of badgeImgs) {
    await img.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await sleep(200);
  }
  await sleep(1500);

  const results = await page.evaluate(() =>
    [...document.querySelectorAll("img[src^='/deliver-']")].map((i) => ({
      src: i.getAttribute("src"),
      ok: i.complete && i.naturalWidth > 0,
      w: i.naturalWidth,
    }))
  );
  check(results.length === 10, "10 service badge <img> elements rendered", `found ${results.length}`);
  for (const r of results) check(r.ok, `renders ${r.src}`, `${r.w}px natural width`);

  const phaseResults = await page.evaluate(() =>
    [...document.querySelectorAll("img[src^='/systems-'], img[src^='/strategy-'], img[src^='/network-'], img[src^='/optimization-']")].map((i) => ({
      src: i.getAttribute("src"),
      ok: i.complete && i.naturalWidth > 0,
    }))
  );
  for (const r of phaseResults) check(r.ok, `phase image still renders ${r.src}`);

  // 3. Screenshot of the What We Deliver heading area (first services).
  await heading.evaluate((h) => h.scrollIntoView({ block: "start" }));
  await sleep(600);
  const shot = path.join(__dirname, "deliver-section-check.png");
  await page.screenshot({ path: shot });
  console.log(`SCREENSHOT  ${shot}`);

  check(failures === 0, "ALL CHECKS PASSED", `${failures} failure(s)`);
  process.exitCode = failures === 0 ? 0 : 1;
} finally {
  await browser.close();
  server.close();
}
