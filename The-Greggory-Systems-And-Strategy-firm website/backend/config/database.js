const mysql = require('mysql2');
const { endpoints, clean, DB_NAME, pruneUnreachableNodes } = require('../../server/config/dbEndpoints');

// ============================================================================
// Shared DB "connection" with two-MySQL failover (local:3306 + claude:28067).
//
// mysql2's createPoolCluster holds BOTH endpoints as nodes. When the first
// port is unreachable it automatically uses the second one (and vice-versa),
// exactly like "looks at both SQL ports and uses whichever is up".
//
// This module keeps the SAME interface the modular routes already use:
//   - callback:   db.query(sql, values, cb)         / db.execute(...)
//   - promise:    await db.promise().query(sql, vals) / .execute / .getConnection
//   - db.end(cb)  (cluster-level close)
// ============================================================================
const cluster = mysql.createPoolCluster({
  canRetry: true,           // retry on the next available node
  removeNodeErrorCount: 1,  // take a node out of rotation after 1 failed conn
  restoreNodeTimeout: 5000, // ...and try it again after 5s
  defaultSelector: 'ORDER', // always prefer endpoint #1 (local), then #2 (claude)
});

// Guard: skip endpoints with missing required credentials so the cluster
// never builds an empty node list (which would make every query throw).
// This replaces the old approach of re-exporting server.js's mainDb (which
// created a circular dependency: server.js → users.js → database.js → server.js
// and returned an empty module object, breaking db.promise() for all consumers).
endpoints().forEach((cfg, i) => {
  const { label, ...opts } = cfg;
  const missing = ['host', 'user', 'password'].filter(k => !opts[k] && !(k in opts));
  if (missing.length > 0) {
    console.warn(`[DB CLUSTER] skipping endpoint ${label || i} — missing: ${missing.join(', ')}`);
    return;
  }
  cluster.add(`db-${label || i}`, {
    ...opts,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
    connectTimeout: 10000,
  });
});

cluster.on('warn', (err) =>
  console.warn(`[DB CLUSTER] warn: ${err.code || err.message}`)
);
cluster.on('offline', (id) =>
  console.error(`[DB CLUSTER] ${id} offline — failing over to the other port`)
);
cluster.on('remove', (id) => console.error(`[DB CLUSTER] ${id} removed`));

// Prune endpoints with nothing listening before the first query runs. Without
// this, a configured-but-dead node (e.g. XAMPP stopped locally) is preferred by
// defaultSelector:'ORDER', fails mid-query with ECONNRESET, and is put back in
// rotation every restoreNodeTimeout — so a register+login pair could split
// across nodes and report "user not found" for a row that was just written.
//
// Exposed as `clusterReady` so routes can `await` it; the facade below awaits it
// too, so callers get a healthy node whether or not they opt in.
const clusterReady = pruneUnreachableNodes(cluster).catch((err) => {
  // A probe failure must never break require(): keep the unpruned cluster so the
  // underlying connection error still surfaces with its own message.
  console.warn(`[DB CLUSTER] reachability probe failed (${err.message}) — continuing with all endpoints`);
  return [];
});

// Callback-style namespace (db.query(sql, values, cb), db.execute(...)).
const db = cluster.of('*', 'ORDER');

// Retry in place on a connectivity error. Aiven closes idle TLS connections
// server-side, so the first query to pick up a pooled connection that has been
// sitting unused can get its socket reset mid-flight. `read ECONNRESET` is the
// TLS-read flavour of that (the comment in routes/admin.js historically listed
// only the bare `ECONNRESET`) and it is what actually surfaced here: a register
// call failed with `details: "read ECONNRESET"` and the validation engine
// classified it as an infrastructure 400-class failure rather than a retry.
// Neither is an endpoint outage, so with the local endpoint pruned there is no
// second node to fail over to — the pool hands back a fresh connection on the
// next call, so a short bounded retry clears it. SQL errors (ER_DUP_ENTRY,
// ER_NO_SUCH_TABLE, ER_NO_REFERENCED_ROW_2…) are deterministic and throw
// immediately — a write is never silently re-run.
const RETRYABLE = new Set([
  "ECONNREFUSED", "ETIMEDOUT", "ECONNRESET", "EPIPE", "ENOTFOUND",
  "PROTOCOL_CONNECTION_LOST", "PROTOCOL_SEQUENCE_TIMEOUT", "POOL_NOOFFLINE",
  "ER_CON_COUNT_ERROR",
  // The mysql2 driver reports a reset/idle socket as `read ECONNRESET` (and the
  // equivalent EPIPE/ETIMEDOUT variants) rather than the bare code above.
  "read ECONNRESET", "read EPIPE", "read ETIMEDOUT", "write ECONNRESET",
  "write EPIPE", "ALREADY_LOGGED_IN",
]);
const MAX_ATTEMPTS = 3;

function runWithRetry(label, exec) {
  return clusterReady.then(async () => {
    let lastErr;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        return await exec();
      } catch (err) {
        lastErr = err;
        if (!RETRYABLE.has(err.code)) throw err;
        if (attempt === MAX_ATTEMPTS) break;
        console.warn(
          `[DB CLUSTER] ${label} ${err.code} (attempt ${attempt}/${MAX_ATTEMPTS}) — retrying`
        );
        await new Promise((r) => setTimeout(r, 150 * attempt));
      }
    }
    throw lastErr;
  });
}


// Promise facade: routes call `await db.promise().query(...)` everywhere.
db.promise = function promiseFacade() {
  return {
    // Each call awaits clusterReady (memoised, so a no-op after the first) so a
    // query never races the prune and lands on a dead node. The namespace is
    // taken AFTER the await — it is a view of the live cluster, not a snapshot,
    // so a node removed in the meantime is already excluded.
    query(sql, values) {
      return runWithRetry("query", () => new Promise((resolve, reject) =>
        cluster.of('*', 'ORDER').query(sql, values, (err, rows, fields) =>
          err ? reject(err) : resolve([rows, fields])
        )
      ));
    },
    execute(sql, values) {
      return runWithRetry("execute", () => new Promise((resolve, reject) =>
        cluster.of('*', 'ORDER').execute(sql, values, (err, rows, fields) =>
          err ? reject(err) : resolve([rows, fields])
        )
      ));
    },
    getConnection() {
      return runWithRetry("getConnection", () => new Promise((resolve, reject) =>
        cluster.of('*', 'ORDER').getConnection((err, conn) => (err ? reject(err) : resolve(conn)))
      ));
    },
  };
};

db.end = (cb) => cluster.end(cb);
db.cluster = cluster;

module.exports = db;
