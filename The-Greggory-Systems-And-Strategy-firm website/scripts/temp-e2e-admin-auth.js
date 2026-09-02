// Temp E2E: test ALL admin auth endpoints against the real running server.
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { spawn } = require('child_process');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { endpoints, DB_NAME } = require('../server/config/dbEndpoints');

const PORT = 3997;
const BASE = `http://127.0.0.1:${PORT}/api`;
const TEST_EMAIL = 'e2e-auth-' + Date.now() + '@example.com';
const TEST_PASS = 'Throwaway123!';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getConn() {
  let conn;
  for (const ep of endpoints()) {
    try { conn = await mysql.createConnection({ ...ep, database: DB_NAME, connectTimeout: 3000 }); break; } catch { /* next */ }
  }
  return conn;
}

async function main() {
  // 1. Create temp admin
  const conn = await getConn();
  if (!conn) { console.log('NO DB'); process.exit(3); }
  const hash = await bcrypt.hash(TEST_PASS, 10);
  const [ins] = await conn.query(
    `INSERT INTO admin_users (email, password_hash, first_name, last_name, display_name, admin_level, is_active, created_at)
     VALUES (?, ?, 'E2E', 'Auth', 'E2E Auth', 'admin', 1, NOW())`,
    [TEST_EMAIL, hash]
  );
  const tempId = ins.insertId;
  console.log('[setup] temp admin id:', tempId);
  await conn.end();

  // 2. Boot server
  const server = spawn(process.execPath, ['server.js'], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, PORT: String(PORT) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  server.stderr.on('data', (d) => process.stderr.write('[SVR] ' + d));

  let up = false;
  for (let i = 0; i < 40; i++) {
    try { if ((await fetch(`${BASE}/health`)).ok) { up = true; break; } } catch { /* wait */ }
    await sleep(500);
  }
  if (!up) { console.log('SERVER FAILED TO BOOT'); server.kill(); await cleanup(tempId); process.exit(4); }
  console.log('[boot] server up on', PORT);

  const j = async (r) => { let x = null; try { x = await r.json(); } catch { x = { raw: await r.text() }; } return { status: r.status, body: x }; };

  // 3. LOGIN (reads from DB)
  let r = await fetch(`${BASE}/admin-verification/authenticate-enhanced`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASS }),
  });
  const login = await j(r);
  console.log('[login]', login.status, JSON.stringify(login.body).slice(0, 200));

  // 4. REGISTER (posts to DB)
  const regEmail = 'e2e-reg-' + Date.now() + '@example.com';
  r = await fetch(`${BASE}/admin-verification/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: regEmail, password: TEST_PASS, first_name: 'Reg', last_name: 'Test', role: 'admin' }),
  });
  const reg = await j(r);
  console.log('[register]', reg.status, JSON.stringify(reg.body).slice(0, 200));

  // 5. PROFILE READ (reads from DB)
  r = await fetch(`${BASE}/admin-verification/profile/${tempId}`);
  const prof = await j(r);
  console.log('[profile read]', prof.status, JSON.stringify(prof.body).slice(0, 200));

  // 6. PROFILE UPDATE (posts to DB)
  r = await fetch(`${BASE}/admin-verification/profile/${tempId}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ display_name: 'Renamed E2E' }),
  });
  const upd = await j(r);
  console.log('[profile update]', upd.status, JSON.stringify(upd.body).slice(0, 200));

  // 7. HEALTH
  r = await fetch(`${BASE}/admin-verification/health`);
  const heal = await j(r);
  console.log('[health]', heal.status, JSON.stringify(heal.body).slice(0, 200));

  // 8. SESSION with the login token
  if (login.body.token) {
    r = await fetch(`${BASE}/admin/session`, { headers: { Authorization: `Bearer ${login.body.token}` } });
    const sess = await j(r);
    console.log('[session]', sess.status, JSON.stringify(sess.body).slice(0, 200));
  }

  server.kill();

  // cleanup both temp admins
  await cleanup(tempId, TEST_EMAIL);
  if (reg.body.userId) { await cleanup(reg.body.userId, regEmail); }
  process.exit(0);
}

async function cleanup(id, email) {
  const conn = await getConn();
  if (!conn) return;
  try { await conn.query('DELETE FROM admin_users WHERE id = ?', [id]); console.log('[cleanup] purged', id, email); } catch (e) { console.log('[cleanup] failed for', id, e.message); }
  await conn.end();
}

main().catch((e) => { console.error('E2E ERROR:', e); process.exit(5); });