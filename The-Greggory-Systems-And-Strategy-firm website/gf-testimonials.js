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
      const [t] = await conn.query("SELECT COUNT(*) n FROM testimonials");
      console.log(label, 'testimonials total =', t[0].n);
      const [tr] = await conn.query("SELECT id, author_name, quote, deleted_at FROM testimonials ORDER BY id LIMIT 20");
      for (const r of tr) console.log('  T', JSON.stringify(r));
    } catch (e) { console.log(label, 'ERR', e.code || e.message); }
    finally { await conn.end(); }
  }
})().catch(e => { console.error(e); process.exit(1); });
