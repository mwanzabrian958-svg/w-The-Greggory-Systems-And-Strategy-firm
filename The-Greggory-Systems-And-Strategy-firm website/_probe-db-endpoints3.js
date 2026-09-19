// Clean dual-endpoint reachability probe (mysql2/promise).
'use strict';
const fs = require('fs');
const mysql = require('mysql2/promise');

const envRaw = fs.readFileSync('.env', 'utf8');
const kv = {};
envRaw.split(/\r?\n/).forEach(l => {
  if (!l || l.startsWith('#')) return;
  const i = l.indexOf('=');
  if (i < 0) return;
  kv[l.slice(0, i).trim()] = l.slice(i + 1).trim();
});

const def = (k) => (kv[k] !== undefined ? kv[k] : null);
const DB = (prefix) => ({
  host: def(prefix + '_HOST'),
  port: Number(def(prefix + '_PORT')),
  user: def(prefix + '_USER'),
  password: def(prefix + '_PASSWORD'),
  ssl: def('DB_SSL'),
  database: def(prefix + '_DATABASE') || def('DB_DATABASE') || def('DB_NAME') || 'the_greggory_systems_and_strategy_firm_db_main',
});

const tryConnect = async (label, db, sslMode) => {
  const opts = { ...db };
  opts.ssl = sslMode === 'verify' ? {} : sslMode === 'noverify' ? { rejectUnauthorized: false } : false;
  try {
    const conn = await mysql.createConnection(opts);
    const [row] = await conn.query('SELECT DATABASE() AS db, CONNECTION_ID() AS cid, @@version AS v');
    await conn.end();
    return { kind: label, ok: true, db: row.db, cid: row.cid, version: row.v, sslMode };
  } catch (e) {
    return { kind: label, ok: false, error: e.message, code: e.code, sslMode };
  }
};

(async () => {
  console.log('endpoint | sslMode | ok | db | error/code');
  const primary = DB('');
  const backup  = DB('DB_BACKUP');
  const local2  = DB('DB_HOST_2');

  // PRIMARY with different SSL modes
  for (const mode of ['verify', 'noverify', false]) {
    const r = await tryConnect('PRIMARY', primary, mode);
    console.log(JSON.stringify(r));
  }

  // LOCAL2 (XAMPP) - the common "just make it work locally" fallback
  if (local2.host && local2.port) {
    const r = await tryConnect('LOCAL2', local2, false);
    console.log(JSON.stringify(r));
  } else {
    console.log(JSON.stringify({ kind: 'LOCAL2', ok: false, error: 'DB_HOST_2 block empty/unset' }));
  }

  // BACKUP - only if present
  if (backup.host && backup.port) {
    const r = await tryConnect('BACKUP', backup, false);
    console.log(JSON.stringify(r));
  } else {
    console.log(JSON.stringify({ kind: 'BACKUP', ok: false, error: 'DB_BACKUP block empty/unset' }));
  }
})().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
