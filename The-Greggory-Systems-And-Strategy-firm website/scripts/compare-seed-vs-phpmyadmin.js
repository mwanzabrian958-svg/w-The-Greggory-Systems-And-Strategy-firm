const fs = require('fs');
const path = require('path');

// Load phpMyAdmin schema
const phpMyAdmin = require('../database/schema-sync.json');
const phpMyAdminTables = new Set(Object.keys(phpMyAdmin.tables));

// Load seed dump
const sql = fs.readFileSync(
  path.join(__dirname, '..', 'database', 'the-greggory-systems-and-strategy-firm-db-main.sql'),
  'utf8'
);
const seedTables = new Set();
const re = /CREATE TABLE\s+(?:IF NOT EXISTS\s+)?`?(\w+)`?/gi;
let m;
while ((m = re.exec(sql)) !== null) {
  seedTables.add(m[1]);
}

console.log(`phpMyAdmin (XAMPP): ${phpMyAdminTables.size} tables`);
console.log(`Seed dump:         ${seedTables.size} tables`);
console.log('');

// Tables in phpMyAdmin but missing from seed
const missingFromSeed = [...phpMyAdminTables].filter(t => !seedTables.has(t));
console.log(`Tables in phpMyAdmin but MISSING FROM SEED (${missingFromSeed.length}):`);
missingFromSeed.sort().forEach(t => console.log(`  - ${t}`));
console.log('');

// Tables in seed but not in phpMyAdmin
const extraInSeed = [...seedTables].filter(t => !phpMyAdminTables.has(t));
console.log(`Tables in seed but NOT in phpMyAdmin (${extraInSeed.length}):`);
extraInSeed.sort().forEach(t => console.log(`  - ${t}`));
console.log('');

// Tables in both
const inBoth = [...phpMyAdminTables].filter(t => seedTables.has(t));
console.log(`Tables in BOTH: ${inBoth.length}`);

// DATA row counts from seed dump
console.log('\n=== INSERT row counts in seed dump ===');
const insertCounts = {};
const insertRe = /INSERT INTO\s+`?(\w+)`?/gi;
while ((m = insertRe.exec(sql)) !== null) {
  insertCounts[m[1]] = (insertCounts[m[1]] || 0) + 1;
}
Object.entries(insertCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([t, c]) => console.log(`  ${c} INSERT${c > 1 ? 'S' : ''} into ${t}`));
