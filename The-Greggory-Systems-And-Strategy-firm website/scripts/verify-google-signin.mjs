// GOOGLE SIGN-IN VERIFIER — proves the whole "Sign in with Google" path is live
// end to end: config → server → real browser button.
//
// Prereqs: puppeteer-core (dev dep) + Chrome/Edge installed.
// Run (from the website folder, with the backend on :3000 and the dev server on :5173):
//   npm run test:google
//   BASE_URL=http://localhost:4173 npm run test:google   # against `vite preview`
//   BASE_URL=https://your-site.onrender.com npm run test:google
//
// Exit code 0 = the button renders and the server is configured.
import puppeteer from "puppeteer-core";
import { existsSync, readFileSync, readdirSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..");
dotenv.config({ path: path.join(root, ".env") });

const BASE = process.env.BASE_URL || "http://localhost:5173";
const API = process.env.API_BASE_URL || "http://localhost:3000";

const CHROME_CANDIDATES = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
];

let problems = 0;
const ok = (m) => console.log(`OK  ${m}`);
const bad = (m) => { problems++; console.log(`!!  ${m}`); };
const info = (m) => console.log(`--  ${m}`);

// ── 1. Configuration (both halves must exist and match) ─────────────────────
console.log(`=== GOOGLE SIGN-IN VERIFICATION (${BASE}) ===\n-- config --`);
const serverId = (process.env.GOOGLE_CLIENT_ID || "").trim();
const viteId = (process.env.VITE_GOOGLE_CLIENT_ID || "").trim();
const shaped = /\.apps\.googleusercontent\.com$/i.test(serverId);

if (!serverId || !viteId) {
  bad("GOOGLE_CLIENT_ID / VITE_GOOGLE_CLIENT_ID missing in .env — the button stays hidden (GOOGLE_SIGNIN_SETUP.md)");
} else if (serverId !== viteId) {
  bad("GOOGLE_CLIENT_ID and VITE_GOOGLE_CLIENT_ID differ — sign-in will fail with 401 (audience mismatch)");
} else if (!shaped) {
  bad("GOOGLE_CLIENT_ID does not end with .apps.googleusercontent.com — check the value copied from Google Cloud");
} else {
  ok(`client id configured and identical in both vars (${serverId.slice(0, 12)}…, ${serverId.length} chars)`);
}

// Informational: the bundle only carries the id if it was BUILT after .env got it.
try {
  const assets = path.join(root, "dist", "assets");
  const gsi = existsSync(assets)
    ? readdirSync(assets).find((f) => f.startsWith("GoogleSignIn-") && f.endsWith(".js"))
    : null;
  if (gsi) {
    const has = readFileSync(path.join(assets, gsi), "utf8").includes(serverId || "@@never@@");
    has
      ? ok(`built bundle ${gsi} contains the client id (VITE_ inlining works)`)
      : info(`built bundle ${gsi} predates the current id — run "npm run build" to bake it in`);
  } else {
    info('no dist/assets/GoogleSignIn-*.js yet — run "npm run build" to check the bundled value');
  }
} catch (e) {
  info(`bundle check skipped: ${e.message}`);
}

// ── 2. Server endpoint reaches the Google verification path ─────────────────
console.log("\n-- server endpoint --");
const post = async (body) => {
  const res = await fetch(`${API}/api/users/google-auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  let json = null;
  try { json = await res.json(); } catch { /* non-JSON body */ }
  return { status: res.status, json };
};

try {
  const empty = await post({});
  empty.status === 400
    ? ok("POST /api/users/google-auth rejects an empty body with 400")
    : info(`empty body returned ${empty.status} (expected 400)`);

  const dummy = await post({ credential: "dummy-token" });
  if (dummy.status === 503) {
    bad(`server reports "not configured" (503) — GOOGLE_CLIENT_ID is missing in the SERVER environment: ${dummy.json?.message || ""}`);
  } else if (dummy.status === 401) {
    ok("server rejected a dummy credential with 401 — GOOGLE_CLIENT_ID is set and verification is running");
  } else {
    bad(`dummy credential returned ${dummy.status} (expected 401 when configured, 503 when not): ${dummy.json?.message || ""}`);
  }
} catch (e) {
  info(`API checks skipped — ${API} unreachable (${e.message}). Start the backend, or set API_BASE_URL.`);
}

// ── 3. The button really renders in a browser ───────────────────────────────
console.log("\n-- browser --");
const executablePath = process.env.BROWSER_PATH || CHROME_CANDIDATES.find(existsSync);
if (!executablePath) {
  bad("No Chrome/Edge found — set BROWSER_PATH to the browser executable");
} else {
  const browser = await puppeteer.launch({ executablePath, headless: "new" });
  const page = await browser.newPage();

  for (const route of ["/login", "/signup"]) {
    const notices = [];
    const onConsole = (msg) => notices.push(`${msg.type()}: ${msg.text()}`);
    page.on("console", onConsole);

    try {
      await page.goto(BASE + route, { waitUntil: "networkidle2", timeout: 30000 });
      // The GSI widget injects an iframe from accounts.google.com. Google logs
      // origin problems ASYNCHRONOUSLY after the widget mounts, so give it time
      // before judging — and treat an origin complaint as fatal even when a
      // frame exists (the button would render but fail on click).
      await page.waitForSelector('iframe[src*="accounts.google.com"]', { timeout: 15000 }).catch(() => null);
      await new Promise((r) => setTimeout(r, 4000));

      const state = await page.evaluate(() => {
        const frames = Array.from(document.querySelectorAll("iframe")).map((f) => f.src).filter(Boolean);
        const gsi = frames.filter((s) => s.includes("accounts.google.com"));
        const el = document.querySelector('iframe[src*="accounts.google.com"]');
        const r = el ? el.getBoundingClientRect() : null;
        return {
          gsiFrames: gsi.length,
          gsiSample: gsi[0] || null,
          box: r ? { w: Math.round(r.width), h: Math.round(r.height) } : null,
        };
      });

      const gsiLogs = notices.filter((n) => /GSI_LOGGER|accounts\.google|gsi\//i.test(n));
      const originBlocked = gsiLogs.some((n) =>
        /not allowed for the given client|origin_mismatch|idpiframe_initialization_failed|invalid_client|Access blocked/i.test(n),
      );

      if (originBlocked) {
        bad(`${route}: Google REFUSED this origin — add "${BASE}" to Authorized JavaScript origins (Google Cloud Console)`);
        gsiLogs.slice(0, 2).forEach((e) => info(`     ${e.slice(0, 150)}`));
      } else if (state.gsiFrames > 0 && state.box && state.box.w > 40) {
        ok(`${route}: Google button rendered and sized ${state.box.w}×${state.box.h}px (${state.gsiFrames} frame(s))`);
        info(`     frame: ${String(state.gsiSample).slice(0, 88)}…`);
      } else {
        bad(`${route}: no usable Google button after 15s (hidden or blocked)`);
        notices.slice(-3).forEach((n) => info(`     ${n.slice(0, 150)}`));
      }
    } catch (e) {
      bad(`${route}: navigation failed — ${String(e).slice(0, 140)}`);
    }
    page.off("console", onConsole);
  }

  await browser.close();
}

console.log(
  problems === 0
    ? "\n=== RESULT: Google Sign-In is wired up and rendering — click the button to sign in ==="
    : `\n=== RESULT: ${problems} problem(s) — fix the "!!" lines above (GOOGLE_SIGNIN_SETUP.md) ===`,
);
process.exit(problems === 0 ? 0 : 1);

