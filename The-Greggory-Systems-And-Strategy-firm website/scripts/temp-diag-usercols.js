// Temp: dump users/admin_users columns on each endpoint
require("dotenv").config();
const { endpoints, clean, DB_NAME } = require("../server/config/dbEndpoints");
const mysql = require("mysql2/promise");

(async () => {
  for (const target of endpoints()) {
    let conn;
    try { conn = await mysql.createConnection({ ...clean(target), database: DB_NAME, connectTimeout: 8000 }); }
    catch (e) { console.log(`[${target.label}] connect failed (${e.code || e.message})`); continue; }
    console.log(`\n===== ${target.label} =====`);
    for (const t of ["users", "admin_users", "developer_users"]) {
      const roleCol = t === "users" ? "primary_role" : t === "admin_users" ? "admin_level" : "developer_level";
      const [rows] = await conn.query(`SELECT id, email, department, mission_briefing, \`${roleCol}\` AS role_col FROM \`${t}\` ORDER BY id LIMIT 3`);
      for (const r of rows) console.log(`${t} #${r.id}: ${r.email} | dept=${r.department || "∅"} | mission=${(r.mission_briefing || "").slice(0,40) || "∅"} | role=${r.role_col || "∅"}`);
    }
    await conn.end();
  }
  process.exit(0);
})();