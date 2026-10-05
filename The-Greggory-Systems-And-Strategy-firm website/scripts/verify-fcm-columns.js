// Verifies the exact queries backend/routes/fcm.js runs now succeed against the
// live cloud DB (they used to fail with "Unknown column 'fcm_token'").
// Run: node scripts/verify-fcm-columns.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
require('../backend/config/database');

setTimeout(async () => {
  const db = require('../backend/config/database');
  const conn = db.promise ? db.promise() : db;
  let failed = false;

  async function probe(label, sql, params = []) {
    try {
      const [rows] = await conn.query(sql, params);
      console.log(`  OK   ${label}  (${Array.isArray(rows) ? rows.length : '-'} row(s))`);
      return rows;
    } catch (e) {
      failed = true;
      console.log(`  FAIL ${label}\n       ${e.message}`);
      return null;
    }
  }

  console.log('\n--- columns referenced by routes/fcm.js ---');
  await probe('users.fcm_token/device_info', "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME IN ('fcm_token','device_info','last_active_at')");
  await probe('admin_users.fcm_token/device_info', "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'admin_users' AND COLUMN_NAME IN ('fcm_token','device_info','last_active_at')");

  console.log('\n--- fcm.js:88  GET fallback (all devices) ---');
  await probe('SELECT fcm_token FROM users ...', `SELECT fcm_token FROM users WHERE fcm_token IS NOT NULL AND fcm_token != '' AND deleted_at IS NULL`);

  console.log('\n--- fcm.js:79  send to a single userId ---');
  await probe('SELECT fcm_token FROM users WHERE id = ?', 'SELECT fcm_token FROM users WHERE id = ? AND deleted_at IS NULL LIMIT 1', [0]);

  console.log('\n--- register-token write shape ---');
  await probe('users write cols present', "SELECT COLUMN_NAME, IS_NULLABLE, COLUMN_DEFAULT FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME IN ('fcm_token','device_info','updated_at')");

  console.log('\n--- register-token targets the calling user (UPDATE-by-id) ---');
  // The old shape was `INSERT INTO users (fcm_token, device_info, updated_at)
  // ... ON DUPLICATE KEY UPDATE`, which never referenced req.userId. There is
  // no unique key on users.fcm_token, so the ON DUPLICATE branch could never
  // fire — and because email/first_name/last_name are NOT NULL with no default,
  // the INSERT failed outright and every registration 500'd. register-token now
  // mirrors unregister-token's UPDATE-by-id. This probe runs it with a
  // non-existent id, so a pass means "SQL valid" and affectedRows must be 0.
  try {
    const [r] = await conn.query(
      'UPDATE users SET fcm_token = ?, device_info = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL',
      ['PROBE-NO-KEEP', null, -999999]
    );
    const ok = r.affectedRows === 0;
    if (!ok) failed = true;
    console.log(`  ${ok ? 'OK  ' : 'FAIL'} users UPDATE-by-id  affectedRows=${r.affectedRows} (0 expected)`);
  } catch (e) {
    failed = true;
    console.log(`  FAIL users UPDATE-by-id\n       ${e.message}`);
  }

  console.log(failed ? '\nRESULT: FAILURES ABOVE\n' : '\nRESULT: ALL ROUTE QUERIES OK\n');
  process.exit(failed ? 1 : 0);
}, 3000);
