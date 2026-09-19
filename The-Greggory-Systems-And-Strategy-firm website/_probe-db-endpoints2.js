// DB reachability probe (mysql2/promise, dual endpoint). Writes results to probe-result.txt.
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
const has = (k) => def(k) !== undefined;
const login = (host, port, user, password, ssl, database) => mysql.createConnection({
  host,
  port: Number(port),
  user,
  password: password || null,
  database,
  ssl: ssl === 'true' ? {} : false,
  connectTimeout: 12000,
});

const run = async () => {
  const results = [];
  const record = (info) => { results.push(info); console.log(JSON.stringify(info)); };
  try {
    const conn = await login(
      def('DB_HOST') || def('DB_HOST_2'),
      def('DB_PORT') || def('DB_PORT_2'),
      def('DB_USER') || def('DB_USER_2'),
      def('DB_PASSWORD') || def('DB_PASSWORD_2'),
      def('DB_SSL'),
      def('DB_DATABASE') || def('DB_NAME') || 'the_greggory_systems_and_strategy_firm_db_main',
    ).catch(e => { record({ kind: 'PRIMARY', ok: false, error: e.message, code: e.code }); throw e; });
    const [r] = await conn.query('SELECT DATABASE() AS db, CONNECTION_ID() AS cid, @@version AS v');
    record({ kind: 'PRIMARY', ok: true, db: r.db, cid: r.cid, version: r.v, endpoint: (def('DB_HOST') || def('DB_HOST_2')) + ':' + (def('DB_PORT') || def('DB_PORT_2')) });
    await conn.end();
  } catch {}

  try {
    const host = def('DB_BACKUP_HOST');
    const port = def('DB_BACKUP_PORT');
    if (host && port) {
      const conn = await login(host, port, def('DB_BACKUP_USER'), def('DB_BACKUP_PASSWORD'), def('DB_SSL'), def('DB_DATABASE') || def('DB_NAME') || 'the_greggory_systems_and_strategy_firm_db_main');
      const [r] = await conn.query('SELECT DATABASE() AS db, CONNECTION_ID() AS cid, @@version AS v');
      record({ kind: 'BACKUP', ok: true, db: r.db, cid: r.cid, version: r.v, endpoint: host + ':' + port });
      await conn.end();
    } else {
      record({ kind: 'BACKUP', ok: false, error: 'backup block empty/unset' });
    }
  } catch (e) { record({ kind: 'BACKUP', ok: false, error: e.message, code: e.code }); }
};

run().then(() => {
  fs.writeFileSync('probe-result.txt', JSON.stringify(require('./_env-parsed2.js') ? undefined : [], null, 2) + '\n', 'utf8');
  process.exit(0);
}).catch(e => {
  fs.writeFileSync('probe-result.txt', e.stack, 'utf8');
  process.exit(1);
});
