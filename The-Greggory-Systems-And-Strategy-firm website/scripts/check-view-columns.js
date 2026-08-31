const env = require('dotenv').config().parsed || {};
const mysql = require('mysql2/promise');

(async () => {
  let conn;
  try {
    conn = await mysql.createConnection({
      host: env.DB_HOST,
      port: 28067,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      ssl: { rejectUnauthorized: false }
    });

    const [views] = await conn.query("SHOW FULL TABLES WHERE table_comment='VIEW' AND Tables_in_??? LIKE 'client_project_summary'", [env.DB_NAME]);
    console.log('[CHECK] client_project_summary view rows:', JSON.stringify(views));

    const [cols] = await conn.query("SELECT COLUMN_NAME, TABLE_NAME FROM information_schema.columns WHERE table_schema=? AND table_name='client_project_summary'", [env.DB_NAME]);
    console.log('[CHECK] columns in view:', cols.map(c => c.COLUMN_NAME).join(', '));
  } catch (e) {
    console.error('[CHECK] ERROR:', e.message);
  } finally {
    if (conn) await conn.end();
  }
})();