/**
 * CLEANUP TEST ADMINS (housekeeping)
 * File: scripts/cleanup-test-admins.js
 *
 * Removes the throw-away admin accounts created by scripts/admin-photo-test.js
 * (emails like phototest<timestamp>@test.com).
 *
 * Usage: node scripts/cleanup-test-admins.js
 */

require("dotenv").config();
const db = require("../backend/config/database");
(async () => {
  const [r1] = await db
    .promise()
    .query("DELETE FROM admin_users WHERE email LIKE 'phototest%@test.com'");
  console.log("removed test admins via cluster:", r1.affectedRows);
  const [rows] = await db
    .promise()
    .query("SELECT id, email FROM admin_users ORDER BY id DESC LIMIT 8");
  console.log("latest admin_users rows:");
  for (const r of rows) console.log(`  ${r.id} | ${r.email}`);
  process.exit(0);
})().catch((e) => {
  console.error("ERR:", e.message);
  process.exit(1);
});

