// Real behavior test for the Navbar hide/show-on-scroll logic.
// Mounts the ACTUAL Navbar in jsdom, drives window.scrollY + 'scroll' events,
// then STOPS scrolling and asserts the bar returns to translate-y-0.
//
// Triple-check hardening:
//   1. MUTATION TEST: builds a second bundle with the idle timer
//      (setTimeout(() => setIsVisible(true), 250)) removed. The mutated
//      build MUST stay hidden after scrolling stops — if it still "pops
//      back", the main pop-back checks prove nothing and this meta-check
//      fails.
//   2. SUSTAINED SCROLL: a stream of events keeps resetting the idle timer;
//      the bar must stay hidden DURING the stream and only return after it
//      stops.
//   3. REPEATED CYCLES + TOP: down/stop twice, and returning to page top
//      must always show.
import { JSDOM } from 'jsdom';
import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const entry = path.join(root, 'src/components/Navbar.jsx');
const cacheDir = path.join(root, 'node_modules/.cache');
fs.mkdirSync(cacheDir, { recursive: true });

const IDLE_TIMER_SNIPPET = 'scrollTimer.current = setTimeout(() => setIsVisible(true), 250)';

// Bundle the real Navbar (JSX + local imports); keep React/Router external.
// When `mutated`, rip out the idle timer so we can prove the test detects
// its absence (guards against a vacuous "POPS BACK" pass).
function build({ mutated = false, outfile }) {
  let src = fs.readFileSync(entry, 'utf8');
  if (mutated) {
    if (!src.includes(IDLE_TIMER_SNIPPET)) {
      throw new Error('Could not find idle-timer snippet to mutate — update the test.');
    }
    src = src.replace(IDLE_TIMER_SNIPPET, 'scrollTimer.current = null /* MUTATED */');
  }
  esbuild.buildSync({
    stdin: {
      contents: src,
      resolveDir: path.dirname(entry),
      sourcefile: 'Navbar.jsx',
      loader: 'jsx',
    },
    bundle: true,
    platform: 'node',
    format: 'cjs',
    jsx: 'automatic',
    outfile,
    loader: { '.js': 'jsx' },
    define: { 'process.env.NODE_ENV': '"test"' },
    external: ['react', 'react-dom', 'react/jsx-runtime', 'react-dom/client', 'react-router-dom'],
    logLevel: 'error',
  });
}

const React = require('react');
const { createRoot } = require('react-dom/client');
const { act } = require('react');
const { MemoryRouter } = require('react-router-dom');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Fresh DOM + fresh component instance per scenario.
async function withNavbar(mutated, fn) {
  const outfile = path.join(cacheDir, mutated ? 'navbar-mutated.cjs' : 'navbar-test.cjs');
  build({ mutated, outfile });

  // DOM with a settable scrollY (jsdom's is read-only 0).
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    url: 'http://localhost/',
    pretendToBeVisual: true,
  });
  let scrollY = 0;
  Object.defineProperty(dom.window, 'scrollY', { get: () => scrollY, configurable: true });
  global.window = dom.window;
  global.document = dom.window.document;
  try { Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true }); } catch {}
  global.IS_REACT_ACT_ENVIRONMENT = true;

  delete require.cache[require.resolve(outfile)];
  const Navbar = require(outfile).default;

  const rootEl = createRoot(document.getElementById('root'));
  await act(async () => {
    rootEl.render(React.createElement(MemoryRouter, null, React.createElement(Navbar)));
  });

  const cls = () => document.querySelector('nav')?.className || '';
  const isShown = () => /translate-y-0/.test(cls()) && !/-translate-y-full/.test(cls());
  const isHidden = () => /-translate-y-full/.test(cls());
  const setScroll = (v) => { scrollY = v; };
  const fireScroll = async () => { await act(async () => { dom.window.dispatchEvent(new dom.window.Event('scroll')); }); };
  const settle = async (ms = 350) => { await act(async () => { await sleep(ms); }); };

  try {
    await fn({ isShown, isHidden, setScroll, fireScroll, settle });
  } finally {
    try { await act(async () => rootEl.unmount()); } catch { /* teardown best-effort */ }
  }
}

const results = [];
const check = (name, cond) => results.push({ name, pass: !!cond });

// ── Scenario A: the real component must hide, stay hidden while scrolling,
//    and POP BACK the moment scrolling stops — every cycle.
await withNavbar(false, async ({ isShown, isHidden, setScroll, fireScroll, settle }) => {
  check('A1 starts visible at top', isShown());

  setScroll(600);
  await fireScroll();
  check('A2 hides on scroll down', isHidden());
  await settle();
  check('A3 POPS BACK after scrolling stops', isShown());

  // Sustained scroll: events every 40ms (well under the 250ms idle timer),
  // so the timer keeps resetting and the bar must stay hidden throughout.
  for (let i = 1; i <= 8; i++) {
    setScroll(600 + i * 40);
    await fireScroll();
    await (async () => { await act(async () => { await sleep(40); }); })();
  }
  check('A4 stays hidden DURING sustained scrolling', isHidden());
  await settle();
  check('A5 POPS BACK after sustained scrolling stops', isShown());

  // Second cycle: the guarantee must hold repeatedly, not just once.
  setScroll(1400);
  await fireScroll();
  check('A6 hides on second scroll-down cycle', isHidden());
  await settle();
  check('A7 POPS BACK on second cycle', isShown());

  // Scroll up reveals immediately (before the idle timer).
  setScroll(1000);
  await fireScroll();
  check('A8 shows when scrolling up', isShown());

  // Sub-threshold jitter (trackpad) must not re-hide it.
  setScroll(1004);
  await fireScroll();
  await settle();
  check('A9 ignores sub-threshold jitter', isShown());

  // Returning to the very top always shows.
  setScroll(0);
  await fireScroll();
  check('A10 visible again at page top', isShown());
});

// ── Scenario B (MUTATION): with the idle timer removed, the bar must STAY
//    hidden after scrolling stops. If it pops back anyway, something other
//    than the idle timer is doing the work and A3/A5/A7 prove nothing.
await withNavbar(true, async ({ isShown, isHidden, setScroll, fireScroll, settle }) => {
  setScroll(600);
  await fireScroll();
  check('B1 mutated build still hides on scroll down', isHidden());
  await settle();
  check('B2 mutated build (no idle timer) does NOT pop back', isHidden());
  check('B3 mutated build never self-recovers', !isShown());

  // Scroll-up must still work in the mutation (it never depended on the
  // timer), confirming the mutation only removed the idle path.
  setScroll(300);
  await fireScroll();
  check('B4 scroll-up still reveals (mutation isolated to idle timer)', isShown());
});

console.log('\n=== Navbar pop-back test ===');
for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}`);
const failed = results.filter((r) => !r.pass).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
