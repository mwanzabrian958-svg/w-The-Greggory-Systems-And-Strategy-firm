// Run the pre-flight against application cloud endpoints. Local XAMPP settings
// are intentionally excluded by liveEndpoints().
const { ensureAuthSeedData, MAPPINGS } = require('./preflight-db');
(async () => {
  console.log('\n=== DB PRE-FLIGHT (cloud endpoint only) ===');
  const summary = await ensureAuthSeedData({});
  if (summary.endpoints === 0) {
    console.error('FAILED: no cloud database endpoint could be reached.');
    process.exit(1);
  }
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
  });