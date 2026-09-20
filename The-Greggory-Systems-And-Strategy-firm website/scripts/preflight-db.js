#!/usr/bin/env node
/**
 * DB PRE-FLIGHT (idempotent) — run before any verification suite:
 *
 *   node scripts/preflight-db.js
 *
 * WHY THIS EXISTS
 * ---------------
 * `auth_platform_mapping` is the table the authEndpointValidator middleware
 * checks on EVERY register/login. If it has no locked+active row for the
 * platform, every auth request is rejected with
 *   400 { errorCode: "MAPPING_NOT_LOCKED" }
 * — which silently breaks the whole login pipeline (admin console, client
 * portal, developer console) and makes every auth-dependent audit fail.
 *
 * The mapping rows are seed data (the system-reset scripts purge them), so this
 * pre-flight restores them across EVERY configured endpoint and reports what it
 * found. Safe to run any number of times — inserts are idempotent.
 */
"use strict";

const mysql = require("mysql2/promise");
const { MAPPINGS } = require("./seed-auth-mappings");

// Same strict required-field rules the middleware enforces on register/login.
const RULES = [
  ["user", "email_required", "email", "Email is mandatory for user registration"],
  ["user", "password_required", "password", "Password is mandatory for user registration"],
  ["admin", "email_required", "email", "Email is mandatory for admin registration"],
  ["admin", "password_required", "password", "Password is mandatory for admin registration"],
  ["developer", "email_required", "email", "Email is mandatory for developer registration"],
  ["developer", "password_required", "password", "Password is mandatory for developer registration"],
];

const DDL_MAPPING = `CREATE TABLE IF NOT EXISTS auth_platform_mapping (
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
    locked_by VARCHAR(100) DEFAULT 'SYSTEM'
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;

const DDL_RULES = `CREATE TABLE IF NOT EXISTS auth_validation_rules (
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
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;

// The middleware logs every auth attempt here (logAuthRequest); a missing table
// produced "Logging error: ER_NO_SUCH_TABLE" noise on every auth call.
const DDL_REQUEST_LOG = `CREATE TABLE IF NOT EXISTS auth_request_log (
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
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;

/**
 * Guarantee the auth mapping + rule seed rows exist on every endpoint.
 * @returns {Promise<{endpoints:number, repaired:number, details:Array}>}
 */
async function ensureAuthSeedData({ log = console.log, endpoints } = {}) {
  const list = endpoints || require("../server/config/dbEndpoints").endpoints();
  const summary = { endpoints: 0, repaired: 0, details: [] };

  for (const cfg of list) {
    const { label, ...opts } = cfg;
    const conn = await mysql.createConnection({ connectTimeout: 20000, ...opts });
    const detail = { endpoint: label || opts.host, mappings: 0, added: 0, rules: 0 };
    try {
      await conn.query(DDL_MAPPING);
      await conn.query(DDL_RULES);
      await conn.query(DDL_REQUEST_LOG);

      for (const m of MAPPINGS) {
        await conn.query(
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
      }
      for (const [platform, ruleName, field, description] of RULES) {
        await conn.query(
          `INSERT INTO auth_validation_rules
             (platform, rule_name, rule_type, rule_value, description, enforcement_level)
           VALUES (?, ?, 'required_field', ?, ?, 'strict')
           ON DUPLICATE KEY UPDATE
             rule_value = VALUES(rule_value), description = VALUES(description),
             enforcement_level = 'strict', is_active = TRUE`,
          [platform, ruleName, field, description],
        );
      }

      const [[locked]] = await conn.query(
        "SELECT COUNT(*) n FROM auth_platform_mapping WHERE is_locked = TRUE AND is_active = TRUE",
      );
      const [[rules]] = await conn.query(
        "SELECT COUNT(*) n FROM auth_validation_rules WHERE is_active = TRUE",
      );
      detail.mappings = locked.n;
      detail.rules = rules.n;
      detail.added = Math.max(0, MAPPINGS.length - locked.n);
      summary.repaired += detail.added;
      log(`   [${detail.endpoint}] locked mappings=${locked.n}/${MAPPINGS.length} active rules=${rules.n}`);
    } finally {
      await conn.end();
    }
    summary.endpoints += 1;
    summary.details.push(detail);
  }
  return summary;
}

module.exports = { ensureAuthSeedData, MAPPINGS, RULES };

// CLI: node scripts/preflight-db.js
if (require.main === module) {
  require("dotenv").config();
  (async () => {
    console.log("\n=== DB PRE-FLIGHT (auth mappings + rules, all endpoints) ===");
    const summary = await ensureAuthSeedData({});
    const bad = summary.details.filter((d) => d.mappings < MAPPINGS.length);
    if (bad.length) {
      console.error(
        `\nFAILED: ${bad.map((b) => `${b.endpoint} has ${b.mappings}/${MAPPINGS.length} locked mappings`).join(", ")}`,
      );
      process.exit(1);
    }
    console.log(`\nREADY: every auth platform is locked & active (${summary.endpoints} endpoint(s)).\n`);
  })().catch((e) => {
    console.error("PRE-FLIGHT FAILED:", e.code || e.message);
    process.exit(1);
  });
}
