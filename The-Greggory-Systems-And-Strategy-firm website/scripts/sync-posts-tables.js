// Creates ONLY the two Posts-area tables (testimonials, portfolio_items).
// The committed schema-sync.json manifest predates the Posts feature
// (generatedAt 2026-08-31, 76 tables, neither table present), so the
// boot-time sync never creates them — every /api/posts query answers
// ER_NO_SUCH_TABLE and the whole Posts area is dead on a fresh deploy.
// CREATE TABLE IF NOT EXISTS is idempotent and never touches existing
// data, so this is safe to run any number of times, on any database.
// Run: node scripts/sync-posts-tables.js
"use strict";
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mysql = require("mysql2/promise");
const { endpoints } = require("../server/config/dbEndpoints");

const TABLES = [
  {
    name: "testimonials",
    create: `CREATE TABLE IF NOT EXISTS testimonials (
  id BIGINT NOT NULL AUTO_INCREMENT,
  quote TEXT NOT NULL,
  author_name VARCHAR(255) NOT NULL,
  author_role VARCHAR(255) NULL,
  author_company VARCHAR(255) NULL,
  rating INT NOT NULL DEFAULT 5,
  status ENUM('draft','published') NOT NULL DEFAULT 'draft',
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by BIGINT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by BIGINT NULL,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_posts_public (status, is_active, deleted_at),
  KEY idx_posts_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  },
  {
    name: "portfolio_items",
    create: `CREATE TABLE IF NOT EXISTS portfolio_items (
  id BIGINT NOT NULL AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  client_name VARCHAR(255) NULL,
  sector VARCHAR(160) NULL,
  summary VARCHAR(500) NULL,
  body MEDIUMTEXT NULL,
  image_url VARCHAR(512) NULL,
  outcomes TEXT NULL,
  status ENUM('draft','published') NOT NULL DEFAULT 'draft',
  sort_order INT NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by BIGINT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by BIGINT NULL,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_posts_public (status, is_active, deleted_at),
  KEY idx_posts_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  },
];

(async () => {
  const dbArg = process.argv.indexOf("--database");
  const targetDb =
    dbArg > -1 && process.argv[dbArg + 1]
      ? process.argv[dbArg + 1]
      : process.env.DB_NAME;
  const cfgs = endpoints();
  let conn = null;
  let lastErr = null;
  for (const cfg of cfgs) {
    const { label, ...opts } = cfg;
    try {
      conn = await mysql.createConnection({
        ...opts,
        database: targetDb,
        connectTimeout: 15000,
      });
      console.log(`[posts-sync] using endpoint ${label || opts.host}:${opts.port}`);
      break;
    } catch (e) {
      lastErr = e;
      console.log(`[posts-sync] endpoint ${label || opts.host} unreachable (${e.code || e.message})`);
    }
  }
  if (!conn) throw lastErr || new Error("No MySQL endpoint reachable");

  for (const t of TABLES) {
    await conn.query(t.create);
    const [rows] = await conn.query(
      "SELECT COUNT(*) AS n FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?",
      [t.name]
    );
    console.log(`[posts-sync] ${t.name}: present (count=${rows[0].n})`);
  }
  await conn.end();
  console.log("[posts-sync] done");
  process.exit(0);
})().catch((e) => {
  console.error("[posts-sync] ERROR:", e.message);
  process.exit(1);
});
