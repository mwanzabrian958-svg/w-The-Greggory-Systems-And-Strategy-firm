require('dotenv').config();
const mysql = require('mysql2/promise');
(async () => {
  const { endpoints } = require('./server/config/dbEndpoints');
  for (const cfg of endpoints()) {
    const { label, ...opts } = cfg;
    let conn;
    try { conn = await mysql.createConnection({ connectTimeout: 15000, ...opts }); }
    catch (e) { console.log(label, '-> UNREACHABLE', e.code || e.message); continue; }
    try {
      const [rows] = await conn.query("SELECT id, title, client_name, sector, status, is_active, is_featured, sort_order, deleted_at, created_at FROM portfolio_items ORDER BY id");
      console.log('=== endpoint', label, '-> rows:', rows.length);
      for (const r of rows) console.log(JSON.stringify(r));
    } catch (e) { console.log(label, '-> QUERY ERR', e.code || e.message); }
    finally { await conn.end(); }
  }
})().catch(e => { console.error(e); process.exit(1); });
