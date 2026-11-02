// Creates the Posts-area tables (testimonials, portfolio_items, portfolio_media).
// The committed schema manifest predates the Posts feature. This idempotent
// script applies its tables to a local database; cloud startup applies the
// same definitions from scripts/sync-db-schema.js.
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
  {
    name: "portfolio_media",
    create: `CREATE TABLE IF NOT EXISTS portfolio_media (
  id BIGINT NOT NULL AUTO_INCREMENT,
  portfolio_id BIGINT NOT NULL,
  media_type ENUM('image','video') NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size INT UNSIGNED NOT NULL,
  file_data MEDIUMBLOB NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_portfolio_media_parent (portfolio_id, sort_order),
  CONSTRAINT fk_portfolio_media_parent FOREIGN KEY (portfolio_id)
    REFERENCES portfolio_items (id) ON DELETE CASCADE
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
