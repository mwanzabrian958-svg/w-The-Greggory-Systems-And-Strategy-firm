// TEMP: three-way schema comparison — local XAMPP (phpMyAdmin) vs the SQL dump
// that seeds production vs the live Aiven cloud database.
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const DB = 'the_greggory_systems_and_strategy_firm_db_main';
require('dotenv').config(); // reads .env from the project root (gitignored)
const LOCAL = { host: 'localhost', port: 3306, user: 'root', password: '', database: DB, connectTimeout: 5000 };
// Cloud (Aiven) credentials come from env vars — NEVER hardcode them:
//   DB_CLOUD_HOST, DB_CLOUD_PORT, DB_CLOUD_USER, DB_CLOUD_PASSWORD
// (values live in .env locally and in the Render environment in production)
const CLOUD = {
  host: process.env.DB_CLOUD_HOST || '',
  port: Number(process.env.DB_CLOUD_PORT || 28360),
  user: process.env.DB_CLOUD_USER || 'avnadmin',
  password: process.env.DB_CLOUD_PASSWORD || '',
  database: DB,
  connectTimeout: 15000,
  ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: false },
};
const DUMP = path.join(__dirname, '..', 'database', 'the-greggory-systems-and-strategy-firm-db-main.sql');

const key = (c) => c.split(':')[0].toLowerCase();

async function liveSchema(cfg, label) {
  try {
    const conn = await mysql.createConnection(cfg);
    const [tabs] = await conn.query(
      "SELECT TABLE_NAME name FROM information_schema.tables WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME", [DB]);
    const schema = {};
    const counts = {};
    for (const t of tabs) {
      const [cols] = await conn.query(
        "SELECT COLUMN_NAME name, COLUMN_TYPE ctype FROM information_schema.columns WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION", [DB, t.name]);
      schema[t.name] = cols.map((c) => `${c.name.toLowerCase()}:${c.ctype.toLowerCase()}`);
      const [r] = await conn.query(`SELECT COUNT(*) n FROM \`${t.name}\``);
      counts[t.name] = r[0].n;
    }
    await conn.end();
    return { ok: true, schema, counts };
  } catch (e) {
    return { ok: false, error: `${e.code || ''} ${e.message}`.slice(0, 160) };
  }
}

function dumpSchema() {
  const sql = fs.readFileSync(DUMP, 'utf8');
  const schema = {};
  const re = /CREATE TABLE (?:IF NOT EXISTS )?`?(\w+)`?\s*\(([\s\S]*?)\)\s*ENGINE/g;
  let m;
  while ((m = re.exec(sql))) {
    const cols = [];
    for (const line of m[2].split(/\r?\n/)) {
      const t = line.trim().replace(/,$/, '');
      if (!t || /^(PRIMARY|UNIQUE|KEY|INDEX|CONSTRAINT|FULLTEXT|FOREIGN)\b/i.test(t)) continue;
      const cm = t.match(/^`?(\w+)`?\s+([a-z]+)/i);
      if (cm) cols.push(`${cm[1].toLowerCase()}:${cm[2].toLowerCase()}`);
    }
    schema[m[1].toLowerCase()] = cols;
  }
  return schema;
}

function compare(labelA, A, labelB, B, withTypes) {
  const aT = Object.keys(A), bT = Object.keys(B);
  const onlyA = aT.filter((t) => !bT.includes(t));
  const onlyB = bT.filter((t) => !aT.includes(t));
  console.log(`\n--- ${labelA} vs ${labelB} ---`);
  console.log(`${labelA}: ${aT.length} tables | ${labelB}: ${bT.length} tables`);
  if (onlyA.length) console.log(`  !! tables missing in ${labelB} (${onlyA.length}): ${onlyA.join(', ')}`);
  if (onlyB.length) console.log(`  !! tables missing in ${labelA} (${onlyB.length}): ${onlyB.join(', ')}`);
  let diffs = 0;
  for (const t of aT.filter((t) => B[t])) {
    const aC = A[t], bC = B[t];
    const aN = aC.map(key), bN = bC.map(key);
    const missB = aN.filter((c) => !bN.includes(c));
    const missA = bN.filter((c) => !aN.includes(c));
    const typeDiff = withTypes
      ? aC.filter((c) => { const n = key(c); const b = bC.find((x) => key(x) === n); return b && b.split(':').slice(1).join(':') !== c.split(':').slice(1).join(':'); })
      : [];
    if (missB.length || missA.length || typeDiff.length) {
      diffs++;
      console.log(`  !! ${t}:`);
      if (missB.length) console.log(`      columns missing in ${labelB}: ${missB.join(', ')}`);
      if (missA.length) console.log(`      columns missing in ${labelA}: ${missA.join(', ')}`);
      if (typeDiff.length) console.log(`      type differences (informational): ${typeDiff.join(', ')}`);
    }
  }
  if (!diffs) console.log('  columns: identical across all common tables OK');
}

const MPESA_REQUIRED = ['merchant_request_id', 'checkout_request_id', 'invoice_id', 'project_id', 'currency', 'result_code', 'result_desc', 'completion_time', 'payment_method', 'business_number', 'account_reference', 'client_id', 'client_name', 'client_email', 'reconciled', 'reconciled_at', 'reconciled_by', 'reconciliation_notes', 'mpesa_receipt', 'updated_at', 'updated_by'];
const mpesaCheck = (label, schema) => {
  const cols = new Set((schema.mpesa_transactions || []).map(key));
  const missing = MPESA_REQUIRED.filter((c) => !cols.has(c));
  console.log(`  ${label}: mpesa_transactions has ${cols.size} cols; code-required missing: ${missing.length ? missing.join(', ') : 'none'}`);
};

(async () => {
  const dump = dumpSchema();
  console.log(`DUMP file: ${Object.keys(dump).length} CREATE TABLE statements`);
  const local = await liveSchema(LOCAL, 'LOCAL');
  const cloud = await liveSchema(CLOUD, 'CLOUD');
  console.log(local.ok ? `LOCAL: connected (${Object.keys(local.schema).length} tables)` : `LOCAL unreachable -> ${local.error}`);
  console.log(cloud.ok ? `CLOUD: connected (${Object.keys(cloud.schema).length} tables)` : `CLOUD app DB not created yet -> ${cloud.error} (it is auto-created on Render's first successful boot)`);

  console.log('\n========== SCHEMA COMPARISON ==========');
  if (local.ok) compare('LOCAL', local.schema, 'DUMP', dump, false);
  if (local.ok && cloud.ok) compare('LOCAL', local.schema, 'CLOUD', cloud.schema, true);
  if (cloud.ok) compare('DUMP', dump, 'CLOUD', cloud.schema, false);

  console.log('\n========== MPESA_COLUMNS CODE REQUIREMENTS ==========');
  mpesaCheck('DUMP ', dump);
  if (local.ok) mpesaCheck('LOCAL', local.schema);
  if (cloud.ok) mpesaCheck('CLOUD', cloud.schema);

  if (local.ok && cloud.ok) {
    console.log('\n========== ROW COUNTS (local | cloud) ==========');
    for (const t of Object.keys(local.schema)) {
      if (cloud.schema[t]) console.log(`  ${t.padEnd(34)} ${String(local.counts[t]).padStart(6)} | ${String(cloud.counts[t]).padStart(6)}`);
    }
  }
})();
