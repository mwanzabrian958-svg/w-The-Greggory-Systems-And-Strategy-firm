// Regression test for firebaseAdmin credential resolution + the firebase-admin
// v14 API migration.
//
// Run: node scripts/test-fcm-credentials.js
//
// Guards two bugs that both failed silently:
//   1. Credentials were read only from a file on disk, which Render never has.
//   2. firebase-admin v14 removed the namespace API (admin.credential /
//      admin.apps / admin.messaging), so the SDK could never initialize even
//      with a valid key.
//
// Case B needs google-services (a CLIENT config) and is skipped when absent.
// It has no fixed path requirement beyond that — set FIREBASE_TEST_GS_JSON to
// point at any copy of that file.
//
// NOTE: getFirebaseApp() deliberately CATCHES init errors and logs them (the
// module's contract is "never throw — return null and simulate"). So the test
// captures console.error/warn rather than asserting on a thrown error.
const assert = require('assert');
const fs = require('fs');

const GOOGLE_SERVICES =
  process.env.FIREBASE_TEST_GS_JSON ||
  'C:\\Users\\Lydia mwanza\\Downloads\\google-services (1).json';
const svcPath = require.resolve('../backend/services/firebaseAdmin');

function fresh() {
  // Bust require cache so each case re-reads env + re-runs init logic.
  delete require.cache[svcPath];
  return require(svcPath);
}

function run(label, envValue) {
  if (envValue === null) delete process.env.FIREBASE_SERVICE_ACCOUNT;
  else process.env.FIREBASE_SERVICE_ACCOUNT = envValue;

  const svc = fresh();

  const logs = [];
  const origError = console.error;
  const origWarn = console.warn;
  console.error = (...a) => logs.push(['error', a.join(' ')]);
  console.warn = (...a) => logs.push(['warn', a.join(' ')]);

  let app = false;
  let threw = null;
  try {
    app = !!svc.getFirebaseApp();
  } catch (err) {
    threw = err.message;
  } finally {
    console.error = origError;
    console.warn = origWarn;
  }

  return {
    label,
    app,
    configured: svc.isConfigured(),
    threw,
    logs,
    text: logs.map((l) => l[1]).join(' | '),
  };
}

const results = [];

// A — no credentials anywhere: must fall back to "simulated" (null), not throw.
results.push(run('A: no credentials', null));

// B — the likely mistake: pasting google-services.json (a CLIENT config).
// Must be rejected with an actionable message, not a cryptic cert() failure.
let gs = null;
if (fs.existsSync(GOOGLE_SERVICES)) gs = fs.readFileSync(GOOGLE_SERVICES, 'utf8');
else console.warn(`(google-services.json not found at ${GOOGLE_SERVICES} — skipping B)`);
results.push(run('B: google-services.json pasted', gs));

// C — truncated JSON: must name the parse error.
results.push(run('C: truncated JSON', '{"type":"service_account",'));

// D — a syntactically valid service account built from a synthetic RSA key.
// This is the decisive case: it proves the whole v14 path
// (admin.cert -> initializeApp -> getMessaging) actually works. No network
// I/O happens during init, so this must succeed fully offline.
const { generateKeyPairSync } = require('crypto');
const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const goodAccount = JSON.stringify({
  type: 'service_account',
  project_id: 'diag-test-project',
  private_key_id: 'diag-key-id',
  private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }),
  client_email: 'diag@diag-test-project.iam.gserviceaccount.com',
  client_id: '1234567890',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
});
results.push(run('D: valid synthetic service account', goodAccount));

// E — getCredentialStatus() must mirror the same resolution order the boot
// warning in server.js relies on. E1 (no creds) is checked against the last
// state left by run() only after re-running with the env cleared.
process.env.FIREBASE_SERVICE_ACCOUNT = goodAccount;
delete require.cache[svcPath];
const svcWithCreds = require(svcPath);
const statusWith = svcWithCreds.getCredentialStatus();
delete process.env.FIREBASE_SERVICE_ACCOUNT;
delete require.cache[svcPath];
const svcNoCreds = require(svcPath);
const statusWithout = svcNoCreds.getCredentialStatus();
process.env.FIREBASE_SERVICE_ACCOUNT = '{"type":"service_account",';
delete require.cache[svcPath];
const svcBadCreds = require(svcPath);
const statusBad = svcBadCreds.getCredentialStatus();
delete process.env.FIREBASE_SERVICE_ACCOUNT;

results.forEach((r) => {
  console.log(`\n[${r.label}]`);
  console.log(`  app        = ${r.app}`);
  console.log(`  configured = ${r.configured}`);
  console.log(`  threw      = ${r.threw || '(none — good)'}`);
  console.log(`  log        = ${r.text || '(silent)'}`);
});

// Assertions
assert.strictEqual(results[0].app, false, 'A: must return null with no creds');
assert.strictEqual(results[0].configured, false, 'A: must not claim configured');
assert.strictEqual(results[0].threw, null, 'A: must never throw');
assert.ok(
  results[0].text.includes('No service-account credentials found'),
  `A: expected the guidance warning, got: ${results[0].text}`
);

if (gs) {
  assert.ok(
    results[1].text.includes('service-account key'),
    `B: expected the service-account guard, got: ${results[1].text}`
  );
}

assert.ok(
  results[2].text.includes('not valid JSON'),
  `C: expected a JSON parse message, got: ${results[2].text}`
);

// D — the real proof: valid credentials must initialize the SDK.
assert.strictEqual(
  results[3].app,
  true,
  `D: valid creds must create the app, got log: ${results[3].text || '(silent)'}`
);
assert.strictEqual(
  results[3].configured,
  true,
  `D: isConfigured() must become true, log: ${results[3].text || '(silent)'}`
);

// E assertions — getCredentialStatus() drives the server.js boot warning.
assert.strictEqual(statusWith.ok, true, 'E1: valid env var must report ok');
assert.strictEqual(
  statusWith.source,
  'env:FIREBASE_SERVICE_ACCOUNT',
  'E1: source must name the env var when it is the one providing the key'
);
assert.strictEqual(statusWith.error, null, 'E1: no error expected');

assert.strictEqual(statusWithout.ok, false, 'E2: no creds must report not ok');
assert.strictEqual(statusWithout.source, null, 'E2: source must be null');
assert.strictEqual(statusWithout.error, null, 'E2: missing is not an error');

assert.strictEqual(statusBad.ok, false, 'E3: malformed env var must not be ok');
assert.ok(
  statusBad.error && statusBad.error.includes('not valid JSON'),
  `E3: error must explain the JSON problem, got: ${statusBad.error}`
);

console.log('\nALL ASSERTIONS PASSED');
