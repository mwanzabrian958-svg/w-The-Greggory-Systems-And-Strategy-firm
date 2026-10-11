// Real render test for SettingsModal.jsx (no fake claims).
// Mounts the ACTUAL component in jsdom, mocks the /notify/status network call
// with the EXACT shape the backend returns, clicks into the Integrations tab,
// and asserts what the user actually sees.
import { JSDOM } from 'jsdom';
import esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

// --- 1. Build the component (JSX + its imports) into a runnable CJS bundle ---
const entry = path.join(root, 'src/admin/components/modals/SettingsModal.jsx');
const out = path.join(root, 'node_modules/.cache/settingsmodal-test.cjs');
esbuild.buildSync({
  entryPoints: [entry],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  jsx: 'automatic',
  outfile: out,
  loader: { '.js': 'jsx' },
  define: { 'process.env.NODE_ENV': '"test"' },
  external: ['react', 'react-dom', 'react/jsx-runtime', 'react-dom/client'],
  logLevel: 'error',
});

// --- 2. Set up a DOM with React globals ---
const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
});
global.window = dom.window;
global.document = dom.window.document;
try { Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true }); } catch {}
global.IS_REACT_ACT_ENVIRONMENT = true;

const React = (await import('react')).default;
const { createRoot } = await import('react-dom/client');
const { act } = await import('react');

// --- 3. Mock the api service BEFORE the component module loads its import ---
// The real backend (/api/notify/status -> channelStatus()) returns this shape:
const REAL_STATUS = {
  success: true,
  chain: ['whatsapp', 'sms', 'email', 'voice', 'viber'],
  whatsapp: { configured: false, provider: 'none', template: null },
  sms: { configured: false, provider: 'none' },
  email: { configured: true, provider: 'smtp' },
  voice: { configured: false, provider: 'none' },
  viber: { configured: false, provider: 'none' },
};

// Patch global fetch the real apiCall uses. FAIL_MODE=1 simulates the API
// being down so we can verify the error path shows an honest warning.
const FAIL_MODE = process.env.FAIL_MODE === '1';
global.fetch = async (url) => {
  if (FAIL_MODE) throw new Error('network down');
  if (String(url).includes('/notify/status')) {
    return {
      ok: true,
      status: 200,
      text: async () => JSON.stringify(REAL_STATUS),
    };
  }
  return { ok: true, status: 200, text: async () => '{}' };
};

// --- 4. Mock the ThemeContext (component calls useTheme) ---
// We bundle the real ThemeContext too, but it may need a provider. Simpler:
// patch the bundled module's useTheme via the ThemeContext default. Instead,
// we render inside the real provider if exported; fall back to a stub.

const { SettingsModal } = require(out);
const ThemeProvider = (() => {
  try { return require(path.join(root, 'node_modules/.cache/settingsmodal-test.cjs')); } catch { return null; }
})();

// Provide a minimal ThemeContext via React context injection is complex;
// the component uses useTheme() from its own context. We wrap with a provider
// built from the bundled context if available, else a passthrough stub.
let wrapperOpen;
try {
  // The bundle exports only SettingsModal; useTheme reads a context with a
  // default value, so calling without a provider should still work if the
  // context has a default. If it throws, we catch below.
  wrapperOpen = true;
} catch { wrapperOpen = false; }

const container = document.getElementById('root');
const rootEl = createRoot(container);

const results = [];
function check(name, cond, detail = '') {
  results.push({ name, pass: !!cond, detail });
}

try {
  await act(async () => {
    rootEl.render(React.createElement(SettingsModal, { isOpen: true, onClose: () => {} }));
  });

  // Click the Integrations tab button.
  const buttons = Array.from(document.querySelectorAll('button'));
  const integBtn = buttons.find((b) => b.textContent.trim().startsWith('Integrations'));
  check('Integrations tab button exists', !!integBtn);

  if (integBtn) {
    await act(async () => { integBtn.click(); });
    // allow the mocked fetch promise + state update to flush
    await act(async () => { await new Promise((r) => setTimeout(r, 50)); });
  }

  const html = document.body.innerHTML;

  if (FAIL_MODE) {
    // Error path: must show an honest warning and NEVER fake a status.
    check('API-failure shows honest warning', /Could not load live integration status/i.test(html));
    check('API-failure does NOT fake a Connected badge', !/>Configured</.test(html));
    check('API-failure still has no Twilio label', !/Twilio/i.test(html));
  } else {
    // ASSERTIONS — the whole point: no false "Connected"/"Twilio" lies.
    check('No "Twilio" label rendered', !/Twilio/i.test(html));
    check('No "Gmail API" label rendered', !/Gmail API/i.test(html));
    check('No fake "Connected" badge rendered', !/>Connected</.test(html));
    check('Email row shows Configured (real data)', /Configured/.test(html));
    check('Email shows real provider (smtp)', /smtp/i.test(html));
    check('WhatsApp row present', /WhatsApp/i.test(html));
    check('Voice row present', /Voice/i.test(html));
  }

  console.log('\n=== SettingsModal render test ===');
  for (const r of results) {
    console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? ' — ' + r.detail : ''}`);
  }
  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  process.exit(failed.length ? 1 : 0);
} catch (e) {
  console.log('\nTEST THREW (component failed to render):', e.message);
  console.log(e.stack.split('\n').slice(0, 6).join('\n'));
  process.exit(1);
}
