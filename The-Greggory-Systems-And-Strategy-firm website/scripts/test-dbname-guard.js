// Verify the DB_NAME guard: with DB_NAME cleared, dbEndpoints must throw
// immediately rather than defaulting to the dead local XAMPP name.
// Load .env FIRST so `saved` captures the real value. Without this, saved is
// undefined and the second require throws for the wrong reason.
require('dotenv').config();
const path = require('path');
const mod = path.join(__dirname, '..', 'server', 'config', 'dbEndpoints.js');

const saved = process.env.DB_NAME;
delete process.env.DB_NAME;
try {
  delete require.cache[require.resolve(mod)];
  require(mod);
  console.log('FAIL: loaded without DB_NAME (fallback still present)');
  process.exitCode = 1;
} catch (e) {
  console.log('PASS: refuses to guess —', e.message.split('.')[0]);
} finally {
  // Restore BEFORE the second require: dotenv only runs once, so clearing the
  // key here would otherwise leave it unset for the rest of the process.
  if (saved !== undefined) process.env.DB_NAME = saved;
  delete require.cache[require.resolve(mod)];
}

// And it must load normally when DB_NAME IS set.
require(mod);
console.log('PASS: loads normally with DB_NAME =', process.env.DB_NAME);