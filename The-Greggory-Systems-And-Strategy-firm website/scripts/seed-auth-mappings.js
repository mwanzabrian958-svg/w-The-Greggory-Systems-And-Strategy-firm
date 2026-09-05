/**
 * SEED AUTH PLATFORM MAPPINGS (idempotent)
 * File: scripts/seed-auth-mappings.js
 *
 * The authEndpointValidator middleware rejects every auth request with
 * 400 MAPPING_NOT_LOCKED unless auth_platform_mapping has a locked+active
 * row for the platform. The system reset purged those seed rows — this
 * script restores them. Safe to run any number of times.
 *
 * Usage: node scripts/seed-auth-mappings.js
 */

require("dotenv").config();
const mysql = require("mysql2");
const { endpoints, clean, DB_NAME } = require("../server/config/dbEndpoints");

// Default: use the shared cluster (prefers local XAMPP, fails over to cloud).
// With --cloud: seed the CLOUD (Aiven) endpoint explicitly so production is
// unblocked too, regardless of whether local XAMPP is running.
let query;
if (process.argv.includes("--cloud")) {
  const cloud = endpoints().find((e) => e.label === "claude");
  if (!cloud) {
    console.error("No cloud endpoint configured (DB_HOST unset)");
    process.exit(1);
  }
  const conn = mysql.createConnection({ ...clean(cloud), database: DB_NAME });
  query = (sql, vals) => conn.promise().query(sql, vals);
  console.log("[SEED] targeting CLOUD endpoint:", cloud.host + ":" + cloud.port);
} else {
  const db = require("../backend/config/database");
  query = (sql, vals) => db.promise().query(sql, vals);
  console.log("[SEED] targeting cluster (local-first, cloud failover)");
}

const MAPPINGS = [
  {
    platform: "user",
    table: "users",
    register: "/api/users/register",
    login: "/api/users/login",
    description: "Public client portal platform",
  },
  {
    platform: "admin",
    table: "admin_users",
    register: "/api/admin-verification/register",
    login: "/api/admin-verification/authenticate-enhanced",
    description: "Admin console platform",
  },
  {
    platform: "developer",
    table: "developer_users",
    register: "/api/admin-verification/register",
    login: "/api/developer-verification/authenticate",
    description: "Developer console platform",
  },
];

async function ensureTables() {
  await query(`CREATE TABLE IF NOT EXISTS auth_platform_mapping (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      platform_name VARCHAR(50) NOT NULL UNIQUE,
      table_name VARCHAR(100) NOT NULL UNIQUE,
      register_endpoint VARCHAR(255) NOT NULL,
      login_endpoint VARCHAR(255) NOT NULL,
      description VARCHAR(500),
      is_active BOOLEAN DEFAULT TRUE,
      is_locked BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      locked_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      locked_by VARCHAR(100) DEFAULT 'SYSTEM',
      INDEX idx_platform_name (platform_name),
      INDEX idx_table_name (table_name),
      INDEX idx_is_locked (is_locked)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  await query(`CREATE TABLE IF NOT EXISTS auth_validation_rules (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      platform VARCHAR(50) NOT NULL,
      rule_name VARCHAR(100) NOT NULL,
      rule_type VARCHAR(50) NOT NULL,
      rule_value VARCHAR(255) NOT NULL,
      description VARCHAR(500),
      enforcement_level VARCHAR(20) DEFAULT 'strict',
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_platform_rule (platform, rule_name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  await query(`CREATE TABLE IF NOT EXISTS auth_request_log (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      request_id VARCHAR(100) NOT NULL UNIQUE,
      platform VARCHAR(50) NOT NULL,
      table_name VARCHAR(100) NOT NULL,
      endpoint VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      ip_address VARCHAR(45),
      request_method VARCHAR(10),
      request_body_hash VARCHAR(64),
      response_status INT,
      response_message VARCHAR(255),
      error_message VARCHAR(500),
      execution_time_ms INT,
      is_success BOOLEAN,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_platform (platform),
      INDEX idx_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  console.log("[SEED] auth tables verified");
}

async function seedMappings() {
  for (const m of MAPPINGS) {
    await query(
      `INSERT INTO auth_platform_mapping
         (platform_name, table_name, register_endpoint, login_endpoint, description, is_active, is_locked, locked_by)
       VALUES (?, ?, ?, ?, ?, TRUE, TRUE, 'SYSTEM')
       ON DUPLICATE KEY UPDATE
         register_endpoint = VALUES(register_endpoint),
         login_endpoint = VALUES(login_endpoint),
         description = VALUES(description),
         is_active = TRUE,
         is_locked = TRUE`,
      [m.platform, m.table, m.register, m.login, m.description],
    );
    console.log(`[SEED] mapping locked: ${m.platform} -> ${m.table}`);
  }
}

module.exports = { ensureTables, seedMappings, MAPPINGS };

// Minimal required-field rules — only what the middleware enforces on
// register/login (email + password). Idempotent via ON DUPLICATE KEY.
const RULES = [
  ["user", "email_required", "required_field", "email", "Email is mandatory for user registration", "strict"],
  ["user", "password_required", "required_field", "password", "Password is mandatory for user registration", "strict"],
  ["admin", "email_required", "required_field", "email", "Email is mandatory for admin registration", "strict"],
  ["admin", "password_required", "required_field", "password", "Password is mandatory for admin registration", "strict"],
  ["developer", "email_required", "required_field", "email", "Email is mandatory for developer registration", "strict"],
  ["developer", "password_required", "required_field", "password", "Password is mandatory for developer registration", "strict"],
];

async function seedRules() {
  for (const r of RULES) {
    await query(
      `INSERT INTO auth_validation_rules
         (platform, rule_name, rule_type, rule_value, description, enforcement_level)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         rule_value = VALUES(rule_value),
         description = VALUES(description),
         enforcement_level = VALUES(enforcement_level),
         is_active = TRUE`,
      r,
    );
  }
  console.log(`[SEED] ${RULES.length} validation rules ensured`);
}

async function verify() {
  const [mappings] = await query(
    `SELECT platform_name, table_name, is_locked, is_active FROM auth_platform_mapping ORDER BY platform_name`,
  );
  console.log("[VERIFY] mappings:");
  for (const m of mappings) {
    console.log(
      `  ${m.platform_name} -> ${m.table_name}  locked=${!!m.is_locked} active=${!!m.is_active}`,
    );
  }
}

(async () => {
  try {
    await ensureTables();
    await seedMappings();
    await seedRules();
    await verify();
    console.log("[SEED] DONE — admin/user/developer auth endpoints are unblocked");
    process.exit(0);
  } catch (e) {
    console.error("[SEED] FAILED:", e.message);
    process.exit(1);
  }
})();
