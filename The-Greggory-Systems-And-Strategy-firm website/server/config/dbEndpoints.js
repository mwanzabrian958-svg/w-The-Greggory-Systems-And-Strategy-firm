/**
 * MySQL endpoint list — the app tries these in ORDER and automatically uses
 * whichever one answers first. This is how it "looks at both SQL ports":
 *
 *   1. LOCAL endpoint  -> DB_HOST_2 / DB_PORT_2 / DB_USER_2 / DB_PASSWORD_2
 *        (XAMPP/MariaDB on 127.0.0.1:3306, root with an EMPTY password).
 *        Used first when configured so a dead cloud endpoint can never slow
 *        local dev down. NOTE: use 127.0.0.1, NOT "localhost" — MariaDB's
 *        root@localhost is socket-auth only, which mysql2 cannot complete.
 *   2. CLOUD endpoint  -> DB_HOST / DB_PORT / DB_USER / DB_PASSWORD
 *        (Aiven, requires DB_SSL=true). On Render only this one exists, so
 *        production behaviour is unchanged.
 *
 * IMPORTANT: the *_2 values are used EXACTLY as given when the variables are
 * defined — an intentionally EMPTY DB_PASSWORD_2 must NOT fall through to the
 * cloud DB_PASSWORD (the `||` chain used to do exactly that and produced
 * "root + cloud password" -> ER_ACCESS_DENIED on localhost).
 *
 * mysql2's `createPoolCluster` uses these as two nodes: if endpoint #1 is
 * down it fails over to endpoint #2 automatically (and back again once it
 * recovers). Endpoints build the ready-to-pass connection option objects that
 * every DB config module + boot script consumes.
 */
"use strict";

const DB_NAME =
  process.env.DB_NAME || "the_greggory_systems_and_strategy_firm_db_main";

const IS_LOCAL_HOST = (h) =>
  ["localhost", "127.0.0.1", "::1"].includes((h || "").toLowerCase());

// TLS policy: DB_SSL wins when explicitly set; otherwise we INFER it — any
// non-local (managed/remote) MySQL such as Aiven REQUIRES TLS, local XAMPP
// does not. Inference exists because a Render service created manually
// (not from render.yaml) can end up without the DB_SSL variable, which
// silently broke the cloud connection ("Pool does Not have online node").
function cloudSslEnabled() {
  if (process.env.DB_SSL !== undefined) return process.env.DB_SSL === "true";
  return !IS_LOCAL_HOST(process.env.DB_HOST || process.env.DB_CLOUD_HOST || "");
}
const DEFAULT_SSL = cloudSslEnabled();

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

  // 1) LOCAL endpoint (XAMPP/MariaDB on 127.0.0.1:3306) — preferred when set.
  const hasExplicitSecond =
    process.env.DB_HOST_2 || process.env.DB_PORT_2 || process.env.DB_USER_2;
  if (hasExplicitSecond) {
    list.push(
      buildEndpoint({
        host: process.env.DB_HOST_2 || "127.0.0.1",
        port: process.env.DB_PORT_2 || 3306,
        user: process.env.DB_USER_2 || "root",
        // Presence check, NOT truthiness: "" means "no password on purpose".
        password:
          process.env.DB_PASSWORD_2 !== undefined
            ? process.env.DB_PASSWORD_2
            : "",
        ssl: process.env.DB_SSL_2 === "true",
        label: "local",
      })
    );
  }

  // 2) CLOUD endpoint (Aiven) — primary in production (Render), fallback in
  //    dev. Legacy DB_CLOUD_* vars still win if the main DB_* ones are unset
  //    so older .env files (backup scripts) keep working.
  const h1 = process.env.DB_HOST || process.env.DB_CLOUD_HOST;
  if (h1) {
    list.push(
      buildEndpoint({
        host: h1,
        port: process.env.DB_PORT || process.env.DB_CLOUD_PORT,
        user: process.env.DB_USER || process.env.DB_CLOUD_USER || "avnadmin",
        password:
          process.env.DB_PASSWORD !== undefined
            ? process.env.DB_PASSWORD
            : process.env.DB_CLOUD_PASSWORD,
        ssl: cloudSslEnabled(),
        label: IS_LOCAL_HOST(h1) ? "local" : "claude",
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

module.exports = { endpoints, clean, DB_NAME, cloudSslEnabled };