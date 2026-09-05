/* Step 1 — INVENTORY: list all tables + row counts
   Run: node scripts/system-reset-step1-inventory.js */
require('dotenv').config();
const db = require('../backend/config/database');

async function main() {
  try {
    console.log('===== DATABASE INVENTORY =====');
    const [rows] = await db.promise().query('SHOW TABLES');
    const tables = rows.map(r => Object.values(r)[0]).

sort();
    for (const tn of tables) {
      try {
        const [cnt] = await db.promise().query('SELECT COUNT(*) AS n FROM `' + tn + '`');
        console.log(`  ${tn.padEnd(52)}  rows: ${String(cnt[0].n).padStart(6)}`);
      } catch (e) {
        console.log(`  ${tn.padEnd(52)}  ERROR: ${e.message.slice(0, 60)}`);
      }
    }
    process.exit(0);
  } catch (e) { console.error('INVENTORY ERROR:', e.message); process.exit(1); }
}
main();