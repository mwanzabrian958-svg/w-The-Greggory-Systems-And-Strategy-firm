/* Step 2 — BACKUP every table to JSON before the reset.
   Run: node scripts/system-reset-step2-backup.js
   Saves JSON copies under backup/ (gitignored, never committed). */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('../backend/config/database');

async function main() {
  const stamp = new Date().toISOString().replace(/[:TZ]/g, '-').slice(0, 19);
  const outDir = path.join(__dirname, '..', 'backup', 'pre-reset-' + stamp);
  fs.mkdirSync(outDir, { recursive: true });
  try {
    const [rows] = await db.promise().query('SHOW TABLES');
    const tables = rows.map(r => Object.values(r)[0]).sort();
    let total = 0;
    for (const tn of tables) {
      try {
        const [data] = await db.promise().query('SELECT * FROM `' + tn + '`');
        fs.writeFileSync(path.join(outDir, tn + '.json'), JSON.stringify(data, null, 2));
        total += data.length;
        console.log('  [OK] ' + tn + ' (' + data.length + ' rows)');
      } catch (e) {
        console.log('  [SKIP] ' + tn + ': ' + e.message.slice(0, 60));
      }
    }
    fs.writeFileSync(path.join(outDir, '_manifest.json'), JSON.stringify({
      timestamp: stamp, tables: tables.length, totalRows: total,
    }, null, 2));
    console.log('\nBackup complete: ' + tables.length + ' tables, ' + total + ' total rows -> ' + outDir);
    process.exit(0);
  } catch (e) { console.error('BACKUP ERROR:', e.message); process.exit(1); }
}
main();