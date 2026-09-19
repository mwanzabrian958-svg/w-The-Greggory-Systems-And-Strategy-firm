/**
 * Targeted DB reachability probe for the Greggory site's dual-endpoint config.
 * Mirrors server/config/dbEndpoints.js logic exactly — does NOT import server.js
 * (which currently fails fast when keys are missing), so we always learn which side
 * is reachable even when the real app won't start.
 */
"use strict";

const dotenv = require("dotenv");
dotenv.config({ path: ".env", debug: false });

const URL_BASE = "C:\\Users\\Lydia mwanza\\OneDrive\\Desktop\\personal projects\\w-The-Greggory-Systems-And-Strategy-firm";
const ENV_PATH = `${URL_BASE}\\The-Greggory-Systems-And-Strategy-firm website\\.env`;
const dotenv2 = require("dotenv");
const cfg = dotenv2.parse(require("fs").readFileSync(ENV_PATH, "utf8"));

const LOCAL = {
  host:      cfg.DB_HOST_2     || "127.0.0.1",
  port:      Number(cfg.DB_PORT_2 || 3306),
  user:      cfg.DB_USER_2     || "root",
  password:  cfg.DB_PASSWORD_2 !== undefined ? (cfg.DB_PASSWORD_2 || "") : "",
  database:  cfg.DB_NAME_2     || "the_greggory_systems_and_strategy_firm_db_main",
  ssl:       cfg.DB_SSL_2 === "true" ? { minVersion: "TLSv1.2", rejectUnauthorized: false } : undefined,
  label:     "local XAMPP",
};

const CLOUD = {
  host:      cfg.DB_HOST     || cfg.DB_CLOUD_HOST,
  port:      Number(cfg.DB_PORT || cfg.DB_CLOUD_PORT || 28067),
  user:      cfg.DB_USER     || cfg.DB_CLOUD_USER || "avnadmin",
  password:  cfg.DB_PASSWORD !== undefined ? cfg.DB_PASSWORD : (cfg.DB_CLOUD_PASSWORD || ""),
  database:  cfg.DB_NAME     || "the_greggory_systems_and_strategy_firm_db_main",
  ssl:       cfg.DB_SSL === "true" ? { minVersion: "TLSv1.2", rejectUnauthorized: false } : { minVersion: "TLSv1.2", rejectUnauthorized: false },
  label:     "cloud Aiven",
};

function probe(label, opts) {
  return new Promise((resolve) => {
    const mysql = require("mysql2");
    const conn = mysql.createConnection({
      host:         opts.host,
      port:         opts.port,
      user:         opts.user,
      password:     opts.password,
      database:     opts.database,
      connectTimeout: 8000,
      ...(opts.ssl ? { ssl: opts.ssl } : {}),
    });
    const t = setTimeout(() => {
      try { conn.end(); } catch (e) {}
      resolve({ label, ok: false, error: "ETIMEDOUT after 8000ms", timeout: true });
    }, 8000);
    conn.query("SELECT 1 AS ok, VERSION() AS version, DATABASE() AS db").then(([rows]) => {
      clearTimeout(t);
      try { conn.end(); } catch (e) {}
      resolve({
        label,
        ok: true,
        version: rows && rows[0] && rows[0].version || "?",
        db: rows && rows[0] && rows[0].db || "?",
        error: null,
      });
    }).catch((e) => {
      clearTimeout(t);
      try { conn.end(); } catch (e) {}
      resolve({ label, ok: false, error: e.message || e.code || String(e) });
    });
  });
}

(async () => {
  console.log("== DB reachability probe (dual-endpoint) ==");
  console.log("local endpoint :  %s:%s  user=%s  password=%s  ssl=%s",
    LOCAL.host, LOCAL.port, LOCAL.user, LOCAL.password || "(empty)", LOCAL.ssl ? "true" : "false");
  console.log("cloud endpoint : %s:%s  user=%s  password=%s  ssl=%s",
    CLOUD.host, CLOUD.port, CLOUD.user, CLOUD.password ? "(set)" : "(empty)", CLOUD.ssl ? "true" : "false");
  console.log("----");
  const results = await Promise.all([probe("local", LOCAL), probe("cloud", CLOUD)]);
  results.forEach((r) => {
    if (r.ok) {
      console.log("[%s] CONNECTED  version=%s  db=%s", r.label, r.version, r.db);
    } else {
      console.log("[%s] FAILED    %s", r.label, r.error);
    }
  });
})().catch((e) => {
  console.error("probe crashed:", e);
  process.exit(1);
});
