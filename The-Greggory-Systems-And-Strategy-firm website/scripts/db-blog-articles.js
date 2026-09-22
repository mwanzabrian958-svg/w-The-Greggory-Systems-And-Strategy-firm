/**
 * db-blog-articles.js — inspect / purge blog_articles rows.
 *
 *   node scripts/db-blog-articles.js list
 *       Prints every row (id, title, author, flags, dates).
 *
 *   node scripts/db-blog-articles.js purge <id> [<id> ...]
 *       Hard-deletes the given row ids. Use only after reviewing `list`.
 *
 * Reads DB credentials from .env (same pool config as server.js).
 */
require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 3,
  connectTimeout: 15000,
});

async function list() {
  const [rows] = await pool.query(
    "SELECT id, title, author, category, is_published, deleted_at, created_at, CHAR_LENGTH(content) AS len, LEFT(REPLACE(REPLACE(content, '\n', ' '), '\r', ' '), 90) AS preview FROM blog_articles ORDER BY created_at DESC"
  );
  if (rows.length === 0) {
    console.log("blog_articles is EMPTY — nothing to purge.");
    return;
  }
  console.log(`blog_articles: ${rows.length} row(s)\n`);
  for (const r of rows) {
    console.log(
      [
        `#${String(r.id).padEnd(4)}`,
        (r.deleted_at ? "[DELETED] " : "") +
          (r.is_published ? "[PUB] " : "[DRAFT] "),
        JSON.stringify((r.title || "").slice(0, 50)),
        `author=${JSON.stringify(r.author)}`,
        `len=${r.len}`,
        `created=${r.created_at ? new Date(r.created_at).toISOString().slice(0, 19) : "?"}`,
      ].join(" ")
    );
    console.log(`     preview: ${JSON.stringify(r.preview || "")}`);
  }
}

async function purge(ids) {
  const numeric = ids.map(Number).filter((n) => Number.isInteger(n) && n > 0);
  if (numeric.length === 0) {
    console.error("No valid numeric ids given.");
    process.exit(1);
  }
  const [result] = await pool.query(
    "DELETE FROM blog_articles WHERE id IN (?)",
    [numeric]
  );
  console.log(`Deleted ${result.affectedRows} row(s): ${numeric.join(", ")}`);
}

(async () => {
  const [cmd, ...ids] = process.argv.slice(2);
  try {
    if (cmd === "list") await list();
    else if (cmd === "purge") await purge(ids);
    else {
      console.error("Usage: node scripts/db-blog-articles.js list|purge <id> ...");
      process.exit(1);
    }
  } catch (err) {
    console.error("DB error:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
