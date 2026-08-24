// UI SMOKE TEST — verifies every route renders in a real browser without crashes.
//
// Prereqs (one-time):
//   npm i -D puppeteer-core
//
// Run (from the website folder, with backend on :3000):
//   npx vite preview &            # serves the production build on :4173
//   node scripts/ui-smoke.mjs     # audits every route headlessly
//
import puppeteer from "puppeteer-core";
import { existsSync } from "fs";

const CHROME_CANDIDATES = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
];
const executablePath = process.env.BROWSER_PATH || CHROME_CANDIDATES.find(existsSync);
if (!executablePath) { console.error("No Chrome/Edge found. Set BROWSER_PATH env var."); process.exit(1); }

const BASE = process.env.BASE_URL || "http://localhost:4173";

const ROUTES = [
  { path: "/", name: "Home" },
  { path: "/about", name: "About" },
  { path: "/services", name: "Services" },
  { path: "/projects", name: "Projects" },
  { path: "/projects/1", name: "Project Details" },
  { path: "/case-studies", name: "Case Studies" },
  { path: "/blog", name: "Blog" },
  { path: "/blog/1", name: "Blog Details" },
  { path: "/contact", name: "Contact" },
  { path: "/companies", name: "Companies" },
  { path: "/pricing", name: "Pricing" },
  { path: "/login", name: "Login" },
  { path: "/signup", name: "Signup" },
  { path: "/forgot-password", name: "Forgot Password" },
  { path: "/terms", name: "Terms" },
  { path: "/privacy", name: "Privacy" },
  { path: "/client-portal", name: "Client Portal (redirects to login)" },
  { path: "/admin/login", name: "Admin Login" },
];

const browser = await puppeteer.launch({ executablePath, headless: "new" });
const page = await browser.newPage();

let failures = 0;
for (const route of ROUTES) {
  const errors = [];
  const onConsole = (msg) => { if (msg.type() === "error") errors.push("console: " + msg.text().slice(0, 140)); };
  const onPageError = (err) => errors.push("pageerror: " + String(err).slice(0, 140));
  page.on("console", onConsole);
  page.on("pageerror", onPageError);

  try {
    await page.goto(BASE + route.path, { waitUntil: "networkidle2", timeout: 20000 });
    await new Promise((r) => setTimeout(r, 600)); // let lazy chunks settle

    const rendered = await page.evaluate(() => {
      const root = document.getElementById("root");
      return { hasContent: !!root && root.children.length > 0, textLen: root ? root.innerText.length : 0 };
    });

    // Ignore expected auth-guard API noise; a crash (pageerror) is always fatal.
    const fatal = errors.filter((e) => !e.startsWith("console:") || /failed to fetch|401|403|404/i.test(e) === false);

    if (!rendered.hasContent || fatal.length > 0) {
      failures++;
      console.log(`✖ ${route.name} (${route.path}) — rendered=${rendered.hasContent} text=${rendered.textLen}`);
      fatal.slice(0, 3).forEach((e) => console.log(`    ${e}`));
    } else {
      console.log(`✔ ${route.name} (${route.path}) — ${rendered.textLen} chars${errors.length ? ` [${errors.length} benign api notice(s)]` : ""}`);
    }
  } catch (e) {
    failures++;
    console.log(`✖ ${route.name} (${route.path}) — NAVIGATION FAILED: ${String(e).slice(0, 120)}`);
  }
  page.off("console", onConsole);
  page.off("pageerror", onPageError);
}

await browser.close();
console.log(failures ? `\n${failures} route(s) FAILED` : "\nALL ROUTES RENDER CLEAN ✅");
process.exit(failures ? 1 : 0);
