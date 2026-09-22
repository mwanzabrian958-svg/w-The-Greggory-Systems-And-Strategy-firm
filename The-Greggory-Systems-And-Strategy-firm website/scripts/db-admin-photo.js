/**
 * db-admin-photo.js — inspect where the admin/developer profile photo lives.
 *
 *   node scripts/db-admin-photo.js
 *
 * Prints the photo/image-related columns of admin_users and developer_users,
 * plus every row's photo reference (with byte-length for binary columns).
 */
require("dotenv").config({ quiet: true });
const mysql = require("mysql2/promise");

const hasLocalDbConfig = process.env.DB_HOST && process.env.DB_USER;

async function main() {
  if (!hasLocalDbConfig) {
    console.error("DB config missing (DB_HOST/DB_USER) — aborting.");
    process.exit(1);
  }

  const pool = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    connectTimeout: 20000,
  });

  for (const table of ["admin_users", "developer_users", "users"]) {
    console.log(`\n=== ${table} ===`);
    let cols;
    try {
      [cols] = await pool.query(
        "SELECT COLUMN_NAME AS cn, DATA_TYPE AS dt FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? ORDER BY ordinal_position",
        [table]
      );
    } catch (e) {
      console.log(`  (table missing: ${e.message})`);
      continue;
    }
    if (cols.length === 0) {
      console.log("  (table does not exist)");
      continue;
    }

    const photoCols = cols.filter((c) => /photo|image/i.test(c.cn));
    console.log(
      `  columns: ${cols.map((c) => `${c.cn}:${c.dt}`).join(", ")}`
    );
    if (photoCols.length === 0) {
      console.log("  NO photo/image columns — nothing stored for this table.");
      continue;
    }

    const selects = ["id", "display_name"].concat(
      photoCols
        .map((c) => c.cn)
        .filter((cn) => cn !== "id" && cn !== "display_name")
    );
    let rows;
    try {
      [rows] = await pool.query(
        `SELECT ${selects.map((s) => "`" + s + "`").join(", ")} FROM \`${table}\` ORDER BY id`
      );
    } catch (e) {
      console.log(`  (query failed: ${e.message})`);
      continue;
    }
    for (const r of rows) {
      const parts = photoCols.map((c) => {
        const v = r[c.cn];
        if (v == null) return `${c.cn}=NULL`;
        if (Buffer.isBuffer(v)) return `${c.cn}=<binary ${v.length} bytes>`;
        const s = String(v);
        return `${c.cn}=${JSON.stringify(s.length > 60 ? s.slice(0, 60) + "…" : s)}`;
      });
      console.log(`  #${r.id} "${r.display_name || "(no display name)"}"  ${parts.join("  ")}`);
    }
  }

  await pool.end();
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});