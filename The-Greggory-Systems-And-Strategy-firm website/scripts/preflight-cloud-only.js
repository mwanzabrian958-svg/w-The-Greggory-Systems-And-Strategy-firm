// Run the pre-flight against the CLOUD endpoint only.
//
// dbEndpoints() puts the local XAMPP entry (127.0.0.1:3306) FIRST whenever
// DB_HOST_2 is set, and with XAMPP stopped that entry fails with ECONNREFUSED
// and aborts the run before the cloud endpoint is ever tried. Blank the *_2
// vars instead of deleting them (dotenv re-hydrates deleted keys) so
// hasExplicitSecond() sees no local endpoint.
const saved = {};
for (const k of ['DB_HOST_2', 'DB_PORT_2', 'DB_USER_2', 'DB_PASSWORD_2', 'DB_NAME_2', 'DB_SSL_2']) {
  saved[k] = process.env[k];
  process.env[k] = '';
}
const { ensureAuthSeedData, MAPPINGS } = require('./preflight-db');
(async () => {
  console.log('\n=== DB PRE-FLIGHT (cloud endpoint only) ===');
  const summary = await ensureAuthSeedData({});
  const bad = summary.details.filter((d) => d.mappings < MAPPINGS.length);
  if (bad.length) {
    console.error('FAILED:', bad.map((b) => `${b.endpoint} ${b.mappings}/${MAPPINGS.length}`).join(', '));
    process.exit(1);
  }
  console.log(`\nREADY: every auth platform locked & active (${summary.endpoints} endpoint).`);
})()
  .catch((e) => {
    console.error('PRE-FLIGHT FAILED:', e.code || e.message);
    process.exit(1);
  })
  .finally(() => Object.assign(process.env, saved));