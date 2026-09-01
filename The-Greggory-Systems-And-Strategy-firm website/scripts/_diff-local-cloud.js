// TEMP: direct diff — local XAMPP DB (phpMyAdmin) vs Aiven cloud DB.
// Compares table sets, row counts and column counts. Never prints secrets.
require("dotenv").config({ override: true });
const mysql = require("mysql2/promise");

const DB =
  process.env.DB_NAME || "the_greggory_systems_and_strategy_firm_db_main";

async function connect({ host, port, user, password, ssl }) {
  return mysql.createConnection({
    host,
    port: Number(port),
    user,
    password: password || "",
    database: DB,
    connectTimeout: 15000,
    ...(ssl ? { ssl: { minVersion: "TLSv1.2", rejectUnauthorized: false } } : {}),
  });
}

(async () => {
  let local, cloud;
  try {
    local = await connect({
      host: process.env.DB_HOST_2 || "127.0.0.1",
      port: process.env.DB_PORT_2 || 3306,
      user: process.env.DB_USER_2 || "root",
      password: process.env.DB_PASSWORD_2 || "",
      ssl: false,
    });
    console.log(`LOCAL  ✅  ${process.env.DB_HOST_2 || "127.0.0.1"}:${process.env.DB_PORT_2 || 3306} (${DB})`);
  } catch (e) {
    console.log(`LOCAL  ❌ ${e.code || ""} ${e.message}`);
    process.exit(1);
  }
  try {
    cloud = await connect({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: String(process.env.DB_SSL || "true") !== "false",
    });
    console.log(`CLOUD  ✅  ${process.env.DB_HOST}:${process.env.DB_PORT} (${DB})`);
  } catch (e) {
    console.log(`CLOUD  ❌ ${e.code || ""} ${e.message}`);
    process.exit(1);
  }

  const [lt] = await local.query("SHOW TABLES");
  const [ct] = await cloud.query("SHOW TABLES");
  const lSet = new Set(lt.map((r) => Object.values(r)[0]));
  const cSet = new Set(ct.map((r) => Object.values(r)[0]));

  const onlyLocal = [...lSet].filter((t) => !cSet.has(t)).sort();
  const onlyCloud = [...cSet].filter((t) => !lSet.has(t)).sort();
  const common = [...lSet].filter((t) => cSet.has(t)).sort();

  console.log(`\nLocal tables: ${lSet.size} | Cloud tables: ${cSet.size} | Common: ${common.length}`);

  // row + column counts on every common table
  let rowMismatch = 0, colMismatch = 0;
  const rows = [];
  for (const t of common) {
    const [[a]] = await local.query(`SELECT COUNT(*) n FROM \`${t}\``);
    const [[b]] = await cloud.query(`SELECT COUNT(*) n FROM \`${t}\``);
    const [lc] = await local.query(
      `SELECT COUNT(*) n FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME=?`,
      [DB, t]
    );
    const [cc] = await cloud.query(
      `SELECT COUNT(*) n FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME=?`,
      [DB, t]
    );
    const sameRows = a.n === b.n;
    const sameCols = lc[0].n === cc[0].n;
    if (!sameRows) rowMismatch++;
    if (!sameCols) colMismatch++;
    rows.push({ t, local: a.n, cloud: b.n, lc: lc[0].n, cc: cc[0].n, sameRows, sameCols });
  }

  console.log("\nTABLE".padEnd(34) + "LOCAL(rows/cols)".padEnd(18) + "CLOUD(rows/cols)".padEnd(18) + "MATCH");
  for (const r of rows) {
    const flag = r.sameRows && r.sameCols ? "✅" : (r.sameRows ? "⚠️ cols" : (r.sameCols ? "⚠️ rows" : "❌"));
    console.log(
      r.t.padEnd(34) +
        `${r.local}/${r.lc}`.padEnd(18) +
        `${r.cloud}/${r.cc}`.padEnd(18) +
        flag
    );
  }

  console.log(`\nOnly in LOCAL, missing in cloud (${onlyLocal.length}):`);
  console.log(onlyLocal.length ? "  " + onlyLocal.join(", ") : "  (none) ✅");
  console.log(`\nOnly in CLOUD, not in local (${onlyCloud.length}):`);
  console.log(onlyCloud.length ? "  " + onlyCloud.join(", ") : "  (none) ✅");
  console.log(`\nRow-count differences: ${rowMismatch} | Column-count differences: ${colMismatch}`);
  console.log(
    rowMismatch === 0 && colMismatch === 0 && !onlyLocal.length && !onlyCloud.length
      ? "\n🎉 CLOUD IS AN EXACT MIRROR OF LOCAL (tables + rows + columns)"
      : "\nSee flags above for what differs."
  );

  await local.end();
  await cloud.end();
})();
