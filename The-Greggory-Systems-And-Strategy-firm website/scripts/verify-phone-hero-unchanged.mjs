// BYTE-LEVEL PROOF that the phone (<641px) hero render is unchanged.
//
// Renders ONLY the phone viewport (390x844) with every animation frozen
// (prefers-reduced-motion + CSS animations/transitions disabled + rAF
// parked), screenshots it, and writes hero-phone-proof-<label>.png.
// Run it once against the working tree ("current") and once against HEAD
// ("head"); the two PNGs must hash identically.
//
// Run (from the website folder, after `npx vite build`):
//   node scripts/verify-phone-hero-unchanged.mjs current
//   node scripts/verify-phone-hero-unchanged.mjs head
import puppeteer from "puppeteer-core";
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(__dirname, "..", "dist");
const label = process.argv[2] || "shot";
const PORT = 4184;
const CHROME = process.env.BROWSER_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".mp4": "video/mp4", ".json": "application/json", ".ico": "image/x-icon", ".woff2": "font/woff2" };

const server = http.createServer((req, res) => {
  const p = decodeURIComponent(req.url.split("?")[0]);
  let file = path.join(dist, p);
  if (!file.startsWith(dist) || !fs.existsSync(file) || statIsDir(file)) file = path.join(dist, "index.html");
  res.setHeader("Content-Type", MIME[path.extname(file)] || "application/octet-stream");
  fs.createReadStream(file).pipe(res);
});
function statIsDir(f) {
  try { return fs.statSync(f).isDirectory(); } catch { return true; }
}
await new Promise((r) => server.listen(PORT, r));

const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new" });

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });
  // Kill every time-based animation at the media-query level too.
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle2", timeout: 30000 });
  // Freeze CSS animations/transitions and stop the frame loop so two runs
  // produce byte-identical PNGs for an unchanged render.
  await page.addStyleTag({
    content: `*, *::before, *::after {
      animation: none !important;
      transition: none !important;
      caret-color: transparent !important;
    }`,
  });
  await page.evaluate(() => {
    window.requestAnimationFrame = () => 0;
    window.cancelAnimationFrame = () => 0;
  });
  await sleep(1000);

  const info = await page.evaluate(() => {
    const img = document.querySelector("img[src^='/hero-phoenix']");
    if (!img) return null;
    const cs = getComputedStyle(img);
    const r = img.getBoundingClientRect();
    return {
      objectFit: cs.objectFit,
      filter: cs.filter,
      box: `${Math.round(r.width)}x${Math.round(r.height)}`,
      src: img.getAttribute("src"),
      className: img.className,
    };
  });

  const file = path.join(__dirname, `hero-phone-proof-${label}.png`);
  await page.screenshot({ path: file });
  console.log(`[phone 390x844 ${label}]`, JSON.stringify(info), "->", path.basename(file));
  await page.close();
} finally {
  await browser.close();
  server.close();
}
