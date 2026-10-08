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

// DB_NAME has no local XAMPP fallback on purpose. The old default was
// "the_greggory_systems_and_strategy_firm_db_main", which is a LOCAL database
// name; a managed host (Aiven) owns only `defaultdb`, so an unset DB_NAME would
// silently connect every consumer to a database that does not exist there —
// ER_BAD_DB_ERROR on every request, with the real cause hidden behind a
// plausible-looking name. Failing at require() time is far easier to diagnose.
const DB_NAME = process.env.DB_NAME;
if (!DB_NAME) {
  throw new Error(
    "DB_NAME is not set. Set it in the environment: `defaultdb` on the Aiven " +
      "service, or the local XAMPP database name for local dev."
  );
}

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

function buildEndpoint({ host, port, user, password, database, ssl, label }) {
  const cfg = {
    host: host || "localhost",
    port: Number(port || 3306),
    user: user || "root",
    password: password || "",
    database: database || DB_NAME,
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
        database: process.env.DB_NAME_2,
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
        database: process.env.DB_NAME,
        ssl: cloudSslEnabled(),
        label: IS_LOCAL_HOST(h1) ? "local" : "claude",
      })
    );
  }

  return list;
}


/**
 * TCP reachability probe used to keep DEAD endpoints out of the pool cluster.
 *
 * WHY THIS EXISTS
 * ---------------
 * `endpoints()` returns every endpoint that is merely *configured*, which on a
 * dev machine normally means two: a local XAMPP/MariaDB node and the cloud node.
 * The cluster was built with both, and mysql2's `defaultSelector: 'ORDER'`
 * always prefers #1 — so with local XAMPP stopped, every query first burned a
 * connection attempt against a refused port, was removed after one failure, then
 * put BACK in rotation by `restoreNodeTimeout: 5000` and tried again.
 *
 * The visible damage was mid-flight connection loss:
 *
 *   [DB CLUSTER] db-local offline — failing over to the other port
 *   [DB CLUSTER] warn: ECONNREFUSED
 *   [AUTH VALIDATOR] Error validating request: Error: read ECONNRESET
 *   -> 400 {"errorCode":"VALIDATION_ERROR"}
 *
 * Failover still "worked", but a write and the read that followed it could land
 * on different nodes — or the write could fail outright — so `POST /register`
 * returned 400 and the immediately following `POST /login` answered
 * "Admin user not found" for an account that had actually just been created.
 *
 * Probing once at boot and registering only the endpoints that answer removes
 * the flapping entirely instead of papering over it per-query.
 *
 * A raw TCP check is deliberate: it costs one connect, needs no credentials, and
 * correctly distinguishes "nothing is listening" (the case this fixes) from an
 * auth problem, which must still fail loudly rather than be silently skipped.
 */

const net = require("net");

/**
 * @param {string} host
 * @param {number|string} port
 * @param {number} timeoutMs
 * @returns {Promise<boolean>} true if something accepts a TCP connection.
 */
function tcpReachable(host, port, timeoutMs = 0) {
  // A single flat timeout is wrong here: the LOCAL endpoint is on loopback and
  // refuses instantly when XAMPP is stopped, while a managed cloud endpoint
  // (Aiven) has to complete a TLS handshake from the other side of the internet
  // — 1.5s is routinely not enough. A probe that times out on a healthy remote
  // host reports it as dead, which is worse than useless: the safety net then
  // restores EVERY node (dead local included) and the split-brain this whole
  // module exists to prevent comes straight back.
  //
  // So: generous deadline for remote hosts, near-instant for loopback (where a
  // refusal is immediate, so waiting adds nothing but boot latency).
  const isLocal = ["localhost", "127.0.0.1", "::1"].includes(String(host).toLowerCase());
  const budget = timeoutMs || (isLocal ? 1000 : 8000);
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;
    const finish = (ok) => {
      if (settled) return;
      settled = true;
      try { socket.destroy(); } catch { /* already closed */ }
      resolve(ok);
    };
    socket.setTimeout(budget);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
    try {
      socket.connect(Number(port) || 3306, host);
    } catch {
      finish(false);
    }
  });
}

let livePromise = null;

/**
 * Reachable subset of `endpoints()`.
 *
 * Memoised so the ~one probe round happens once per process and every later
 * caller (both config modules) shares the answer. A failed probe run is NOT
 * cached, so a cloud endpoint that was merely slow to answer is retried on the
 * next call rather than being pinned as dead for the process lifetime.
 */
function liveEndpoints() {
  if (!livePromise) {
    livePromise = (async () => {
      const all = endpoints();
      // One endpoint means there is nothing to choose between — probing would
      // only add boot latency (Render/production), so hand it straight back.
      if (all.length < 2) return all;

      const reachable = await Promise.all(
        all.map((cfg) => tcpReachable(cfg.host, cfg.port))
      );

      const live = all.filter((cfg, i) => reachable[i]);
      all.forEach((cfg, i) => {
        if (!reachable[i]) {
          console.warn(
            `[DB CLUSTER] skipping ${cfg.label} (${cfg.host}:${cfg.port}) — ` +
              `nothing listening; it would otherwise fail every query once and ` +
              `be re-tried every 5s.`
          );
        }
      });

      // Never return an empty list: an empty node list makes mysql2 throw
      // POOL_NOEXIST with no indication of which endpoint was at fault. If
      // nothing answered, fall back to the full set so the real connection
      // error (timeout / TLS / auth) surfaces with its own message.
      return live.length ? live : all;
    })().catch((err) => {
      livePromise = null;
      throw err;
    });
  }
  return livePromise;
}

/** Test seam: forget the memoised probe result. */
function resetLiveEndpointsCache() {
  livePromise = null;
}

/**
 * Detach endpoints that are not answering from a live mysql2 PoolCluster.
 *
 * Clusters must still be built synchronously (the config modules export a ready
 * `db` object that routes call at require time), so the node list cannot simply
 * be filtered up front. Instead the cluster is built with everything configured
 * and the dead nodes are pruned as soon as the probe finishes. Callers that need
 * a guaranteed-healthy node `await` the returned promise first — see
 * `clusterReady` in backend/config/database.js and backend/config/db.js.
 *
 * This is a permanent `cluster.remove()`, not the automatic
 * remove/restore cycle, so a pruned node does not come back into rotation every
 * `restoreNodeTimeout`.
 *
 * @returns {Promise<Array>} the endpoints that were kept.
 */
async function pruneUnreachableNodes(cluster) {
  const live = await liveEndpoints();
  const liveLabels = new Set(live.map((cfg) => cfg.label));
  for (const cfg of endpoints()) {
    if (liveLabels.has(cfg.label)) continue;
    try {
      cluster.remove(`db-${cfg.label}`);
    } catch {
      // Already detached — nothing to undo.
    }
  }
  return live;
}


function clean(cfg) {
  const { label, ...opts } = cfg;
  return opts;
}

module.exports = {
  endpoints,
  clean,
  DB_NAME,
  cloudSslEnabled,
  liveEndpoints,
  resetLiveEndpointsCache,
  pruneUnreachableNodes,
};
