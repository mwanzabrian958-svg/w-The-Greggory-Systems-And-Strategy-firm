// HERO responsive check (Home.jsx "/hero-phoenix.jpg").
//
// Captures the hero at PC / tablet-landscape / tablet-portrait / phone
// viewports and prints the rendered fit metrics (object-fit, box size,
// crop ratio) so before/after runs can be compared numerically.
//
// Run (from the website folder, after `npx vite build`):
//   node scripts/screenshot-hero-viewports.mjs before
//   node scripts/screenshot-hero-viewports.mjs after
import puppeteer from "puppeteer-core";
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(__dirname, "..", "dist");
const label = process.argv[2] || "shot";
const PORT = 4183;
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

const VIEWPORTS = [
  { name: "pc", width: 1440, height: 900 },
  { name: "tablet-landscape", width: 1024, height: 768 },
  { name: "tablet-portrait", width: 820, height: 1180 },
  { name: "phone", width: 390, height: 844 },
];

try {
  for (const vp of VIEWPORTS) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height });
    await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle2", timeout: 30000 });
    await sleep(800);

    const metrics = await page.evaluate(() => {
      const img = document.querySelector("img[src^='/hero-phoenix']");
      const hero = img?.closest("section");
      if (!img || !hero) return null;
      const ir = img.getBoundingClientRect();
      const hr = hero.getBoundingClientRect();
      const cs = getComputedStyle(img);
      // How much of the source artwork is cut off, if object-fit is cover.
      const scale = Math.max(hr.width / img.naturalWidth, hr.height / img.naturalHeight);
      const coverCropPct = Math.max(
        0,
        (1 - Math.min(hr.width, img.naturalWidth * scale) / Math.max(hr.width, img.naturalWidth * scale)) * 100,
        (1 - Math.min(hr.height, img.naturalHeight * scale) / Math.max(hr.height, img.naturalHeight * scale)) * 100
      );
      return {
        natural: `${img.naturalWidth}x${img.naturalHeight}`,
        objectFit: cs.objectFit,
        filter: cs.filter,
        imgBox: `${Math.round(ir.width)}x${Math.round(ir.height)}`,
        heroBox: `${Math.round(hr.width)}x${Math.round(hr.height)}`,
        coverCropWorstPct: coverCropPct.toFixed(1),
        fullyVisible: ir.width <= hr.width + 1 && ir.height <= hr.height + 1,
      };
    });

    const file = path.join(__dirname, `hero-${label}-${vp.name}.png`);
    await page.screenshot({ path: file });
    console.log(`[${vp.name} ${vp.width}x${vp.height}]`, JSON.stringify(metrics), "->", path.basename(file));
    await page.close();
  }
} finally {
  await browser.close();
  server.close();
}
