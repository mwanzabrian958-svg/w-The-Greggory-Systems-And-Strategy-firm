// Real behavior test for the Navbar hide/show-on-scroll logic.
// Mounts the ACTUAL Navbar in jsdom, drives window.scrollY + 'scroll' events,
// then STOPS scrolling and asserts the bar returns to translate-y-0 (popped
// back). Proves the "reappear when scrolling stops" guarantee instead of
// just claiming it.
import { JSDOM } from 'jsdom';
import esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

// 1. Bundle the real Navbar (JSX + local imports); keep React/Router external.
const entry = path.join(root, 'src/components/Navbar.jsx');
const out = path.join(root, 'node_modules/.cache/navbar-test.cjs');
esbuild.buildSync({
  entryPoints: [entry],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  jsx: 'automatic',
  outfile: out,
  loader: { '.js': 'jsx' },
  define: { 'process.env.NODE_ENV': '"test"' },
  external: ['react', 'react-dom', 'react/jsx-runtime', 'react-dom/client', 'react-router-dom'],
  logLevel: 'error',
});

// 2. DOM with a settable scrollY (jsdom's is read-only 0).
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

const React = require('react');
const { createRoot } = require('react-dom/client');
const { act } = require('react');
const { MemoryRouter } = require('react-router-dom');
const Navbar = require(out).default;

const results = [];
const check = (name, cond) => results.push({ name, pass: !!cond });

const nav = () => document.querySelector('nav');
const cls = () => (nav()?.className || '');
const isShown = () => /translate-y-0/.test(cls()) && !/-translate-y-full/.test(cls());
const isHidden = () => /-translate-y-full/.test(cls());
const fireScroll = () => dom.window.dispatchEvent(new dom.window.Event('scroll'));
const setScroll = (v) => { scrollY = v; };

(async () => {
  const container = document.getElementById('root');
  const rootEl = createRoot(container);
  await act(async () => {
    rootEl.render(React.createElement(MemoryRouter, null, React.createElement(Navbar)));
  });

  check('starts visible at top', isShown());

  // Scroll DOWN -> should hide.
  setScroll(600);
  await act(async () => { fireScroll(); });
  check('hides while scrolling down', isHidden());

  // STOP scrolling -> idle timer (250ms) must bring it back.
  await act(async () => { await new Promise((r) => setTimeout(r, 350)); });
  check('POPS BACK after scrolling stops', isShown());

  // Scroll UP -> should show again (even before the timer).
  setScroll(300);
  await act(async () => { fireScroll(); });
  check('shows when scrolling up', isShown());

  // Jitter below threshold must NOT re-hide it.
  setScroll(303);
  await act(async () => { fireScroll(); });
  await act(async () => { await new Promise((r) => setTimeout(r, 350)); });
  check('ignores sub-threshold jitter (stays visible)', isShown());

  console.log('\n=== Navbar pop-back test ===');
  for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}`);
  const failed = results.filter((r) => !r.pass).length;
  console.log(`\n${results.length - failed}/${results.length} checks passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.log('TEST THREW:', e.message); console.log(e.stack.split('\n').slice(0, 5).join('\n')); process.exit(1); });
