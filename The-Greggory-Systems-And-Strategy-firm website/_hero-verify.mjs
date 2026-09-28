// TEMPORARY hero verification - serves the production build and checks the
// phone / tablet / desktop hero at three widths. Deleted after use.
import puppeteer from "puppeteer-core";
import { existsSync, createReadStream, statSync, mkdirSync } from "fs";
import { createServer } from "http";
import { extname, join, normalize } from "path";

const CHROME = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
].find(existsSync);
if (!CHROME) { console.error("no chrome"); process.exit(1); }

const MIME = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css",
  ".jpg":"image/jpeg", ".png":"image/png", ".svg":"image/svg+xml",
  ".json":"application/json", ".webp":"image/webp", ".woff2":"font/woff2", ".ico":"image/x-icon" };
const root = join(process.cwd(), "dist");
const server = createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);
  let p = join(root, normalize(url).replace(/^(\.\.[/\\])+/, ""));
  if (!existsSync(p) || statSync(p).isDirectory()) p = join(root, "index.html");
  res.setHeader("Content-Type", MIME[extname(p).toLowerCase()] || "application/octet-stream");
  createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(4188, "127.0.0.1", r));

mkdirSync("hero-check", { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new" });

const VIEWS = [
  ["phone-320", 320, 568, 2], ["phone-360", 360, 800, 3],
  ["phone-375", 375, 667, 2], ["phone-390", 390, 844, 3],
  ["phone-430", 430, 932, 3],
  ["tablet", 820, 1180, 2], ["desktop", 1440, 900, 1],
];
for (const [name, w, h, dpr] of VIEWS) {
  const page = await browser.newPage();
  await page.setViewport({ width: w, height: h, deviceScaleFactor: dpr });
  await page.goto("http://127.0.0.1:4188/", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 600));

  const info = await page.evaluate(() => {
    const img = document.querySelector("section img");
    const sec = document.querySelector("section");
    const vis = (el) => !!el && getComputedStyle(el).display !== "none" && el.getBoundingClientRect().height > 0;
    const h1s = [...document.querySelectorAll("h1")].filter(vis);
    // Two links share the label: the hero's phone-only block (sm:hidden) and
    // the HEADLINE section's. `.find` always grabbed the hidden one on
    // tablet/desktop, so cta=false there was a false alarm, not a real miss.
    // Pick the rendered one; report which we found.
    const ctas = [...document.querySelectorAll("a")].filter((a) => a.textContent.includes("Start a project"));
    const cta = ctas.find(vis) ?? null;
    const ctaWhich = cta ? (ctas.indexOf(cta) === 0 ? "hero" : "headline") : "none";
    const cue = document.querySelector(".ldr-scroll-cue");
    const fab = document.querySelector('a[aria-label="Chat on WhatsApp"]');
    // The fixed WhatsApp button sits over the hero's body copy on phones unless
    // the copy is padded clear of it. Measure the real overlap, don't eyeball it.
    let fabOverlap = null;
    if (fab && vis(cta)) {
      const para = cta.closest("div").parentElement.querySelector("p");
      const f = fab.getBoundingClientRect();
      const q = para.getBoundingClientRect();
      const ox = Math.min(f.right, q.right) - Math.max(f.left, q.left);
      const oy = Math.min(f.bottom, q.bottom) - Math.max(f.top, q.top);
      fabOverlap = ox > 0 && oy > 0 ? Math.round(ox) + "x" + Math.round(oy) : "clear";
    }
    const r = img.getBoundingClientRect();
    const s = sec.getBoundingClientRect();
    const h1r = h1s[0]?.getBoundingClientRect();
    const cr = cue && vis(cue) ? cue.getBoundingClientRect() : null;
    const fr = fab?.getBoundingClientRect();
    // object-cover: scale so the image COVERS the box, then centre-crop the
    // overflow. naturalWidth/Height are the srcSet-adjusted CSS px, not the
    // file's pixel size, so work in CSS px throughout.
    const scale = Math.max(r.width / img.naturalWidth, r.height / img.naturalHeight);
    const paintedW = img.naturalWidth * scale;
    const cropPx = (paintedW - window.innerWidth) / 2;
    return {
      image: (img?.currentSrc || "").split("/").pop(),
      h1Count: h1s.length,
      h1: h1s[0]?.innerText.replace(/\s+/g, " ").slice(0, 60),
      ctaVisible: vis(cta),
      ctaWhich,
      fabOverlap,
      scrollCueVisible: vis(cue),
      secH: Math.round(s.height),
      natural: `${img.naturalWidth}x${img.naturalHeight}`,
      // fold-relative rects (viewport px): negative top = above the fold
      h1Pos: h1r ? `${Math.round(h1r.top)}..${Math.round(h1r.bottom)}` : "-",
      ctaPos: vis(cta) ? (() => { const q = cta.getBoundingClientRect(); return `${Math.round(q.top)}..${Math.round(q.bottom)}`; })() : "-",
      cuePos: cr ? `${Math.round(cr.top)}..${Math.round(cr.bottom)}` : "-",
      fabPos: fr ? `${Math.round(fr.top)}..${Math.round(fr.bottom)}` : "-",
      // as a % of the painted width, the number that matters for the wordmark
      crop: `${(100 * cropPx / paintedW).toFixed(1)}%`,
    };
  });
  await page.screenshot({ path: `hero-check/hero-${name}.png` });
  console.log(`${name.padEnd(10)} ${String(w).padStart(4)}x${h}  img=${info.image.padEnd(26)} h1s=${info.h1Count} cta=${info.ctaVisible}(${info.ctaWhich}) cue=${info.scrollCueVisible} fabVsCopy=${info.fabOverlap}`);
  console.log(`            sec=${info.secH} natural(css)=${info.natural} cropEachSide=${info.crop}`);
  console.log(`            h1=${info.h1Pos} cta=${info.ctaPos} cue=${info.cuePos} fab=${info.fabPos} (fold=${h}px)`);
  console.log(`            h1: "${info.h1}"`);
  await page.close();
}
await browser.close();
server.close();
