/**
 * Team Templates migration — creates the crew-template tables:
 *   node scripts/create-team-tables.js
 *
 * team_templates: groups team members under a project with a team leader
 * team_template_members: links team_members to a template
 *
 * Idempotent (CREATE TABLE IF NOT EXISTS) and runs against BOTH configured
 * MySQL endpoints — the app's modular + inline routes use the cloud pool while
 * other tooling reads the local XAMPP mirror, so both must have the tables.
 */
require("dotenv").config();
const mysql = require("mysql2/promise");
const { endpoints: dbEndpoints } = require("../server/config/dbEndpoints");

const TEAM_TEMPLATES_DDL = `
  CREATE TABLE IF NOT EXISTS team_templates (
    id BIGINT(20) AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    project_id BIGINT(20) DEFAULT NULL,
    team_leader_id BIGINT(20) DEFAULT NULL,
    team_leader_image LONGBLOB DEFAULT NULL,
    team_leader_image_mime VARCHAR(100) DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_project_id (project_id),
    INDEX idx_team_leader_id (team_leader_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;

const TEAM_TEMPLATE_MEMBERS_DDL = `
  CREATE TABLE IF NOT EXISTS team_template_members (
    id BIGINT(20) AUTO_INCREMENT PRIMARY KEY,
    template_id BIGINT(20) NOT NULL,
    team_member_id BIGINT(20) NOT NULL,
    role VARCHAR(100) DEFAULT 'member',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_template_id (template_id),
    INDEX idx_team_member_id (team_member_id),
    FOREIGN KEY (template_id) REFERENCES team_templates(id) ON DELETE CASCADE,
    FOREIGN KEY (team_member_id) REFERENCES team_members(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;

async function tableExists(conn, table) {
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS n FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [table],
  );
  return rows[0].n > 0;
}

async function migrateEndpoint(label, cfg) {
  const { label: _drop, ...opts } = cfg;
  const conn = await mysql.createConnection({ connectTimeout: 20000, ...opts });
  try {
    console.log(`\n[${label}] ${opts.host}:${opts.port}`);
    for (const [table, ddl] of [
      ["team_templates", TEAM_TEMPLATES_DDL],
      ["team_template_members", TEAM_TEMPLATE_MEMBERS_DDL],
    ]) {
      const existed = await tableExists(conn, table);
      await conn.query(ddl);
      console.log(`   ${existed ? "=" : "+"} ${table}${existed ? " (already present)" : " created"}`);
    }
    const [cols] = await conn.query("SHOW COLUMNS FROM team_templates");
    console.log(`   team_templates columns: ${cols.map((c) => c.Field).join(", ")}`);
  } finally {
    await conn.end();
  }
}

(async () => {
  const list = dbEndpoints();
  if (!list.length) {
    console.error("No DB endpoints configured — check DB_* / DB_*_2 env vars.");
    process.exit(1);
  }
  for (const cfg of list) {
    try {
      await migrateEndpoint(cfg.label || cfg.host, cfg);
    } catch (error) {
      console.error(`   ! ${cfg.label} failed: ${error.code || error.message}`);
      process.exitCode = 1;
    }
  }
  console.log("\n[MIGRATE] Done.");
})();
