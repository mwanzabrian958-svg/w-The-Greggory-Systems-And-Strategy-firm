/**
 * MySQL endpoint list — the app tries these in ORDER and automatically uses
 * whichever one answers first. This is how it "looks at both SQL ports":
 *
  *   1. DB_HOST_2 / DB_PORT_2    -> "claude" MySQL (e.g. port 28067) — LOCAL FALLBACK
 *        * If DB_HOST_2 is empty, falls back to DB_CLOUD_HOST / DB_CLOUD_PORT
 *          so it still knows about the cloud DB already in your .env.
 *   2. DB_HOST / DB_PORT        -> local XAMPP, default localhost:3306 — PRIMARY NOW
 *
 * mysql2's `createPoolCluster` uses these as two nodes: if endpoint #1 is
 * down it fails over to endpoint #2 automatically (and back again once it
 * recovers). Endpoints build the ready-to-pass connection option objects that
 * every DB config module + boot script consumes.
 */
"use strict";

const DB_NAME =
  process.env.DB_NAME || "the_greggory_systems_and_strategy_firm_db_main";

const DEFAULT_SSL = process.env.DB_SSL === "true";

function buildEndpoint({ host, port, user, password, ssl, label }) {
  const cfg = {
    host: host || "localhost",
    port: Number(port || 3306),
    user: user || "root",
    password: password || "",
    label: label || `${host || "localhost"}:${port || 3306}`,
    connectTimeout: 15000,
    // Cloud MySQL (Aiven, claude...) requires TLS; local XAMPP does not.
    ...(ssl ? { ssl: { minVersion: "TLSv1.2", rejectUnauthorized: false } } : {}),
  };
  return cfg;
}

function endpoints() {
  const list = [];

  // 1) Primary endpoint (claude / cloud Aiven on :28067).
  list.push(
        buildEndpoint({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === "true",    // default false on .env is fine
      label: process.env.DB_HOST === "localhost" ? "local" : "claude",
    })
  );

  // 2) Fallback endpoint (local XAMPP on :3306).
  //    Explicit DB_HOST_2/DB_PORT_2 win; DB_CLOUD_* are the legacy fallback so
  //    the existing .env (backup scripts) keeps the cloud DB wired up.
  const hasExplicitSecond =
    process.env.DB_HOST_2 || process.env.DB_PORT_2 || process.env.DB_USER_2;
  const h2 = process.env.DB_HOST_2 || process.env.DB_CLOUD_HOST;
  const u2 =
    process.env.DB_USER_2 || process.env.DB_CLOUD_USER || process.env.DB_USER;
  const pw2 =
    process.env.DB_PASSWORD_2 ||
    process.env.DB_CLOUD_PASSWORD ||
    process.env.DB_PASSWORD;

  if (h2) {
    list.push(
      buildEndpoint({
        host: h2,
        // If the user explicitly provided *_2 vars, honor DB_PORT_2 (default to
        // 3306). Otherwise pair the legacy DB_CLOUD_HOST with DB_CLOUD_PORT.
        port: hasExplicitSecond
          ? process.env.DB_PORT_2 || process.env.DB_CLOUD_PORT
          : process.env.DB_CLOUD_PORT,
        user: u2,
        password: pw2,
        ssl:
          process.env.DB_SSL_2 !== undefined
            ? process.env.DB_SSL_2 === "true"
            : DEFAULT_SSL,
        label: "local",
      })
    );
  }

  return list;
}

/** Strip internal `label` before handing an endpoint to mysql2. */
function clean(cfg) {
  const { label, ...opts } = cfg;
  return opts;
}

module.exports = { endpoints, clean, DB_NAME };