const mysql = require('mysql2/promise');
const { endpoints, pruneUnreachableNodes } = require('../../server/config/dbEndpoints');

// Create a pool CLUSTER with both MySQL endpoints (local + claude). mysql2
// fails over automatically: dead node -> next live node, and back when it heals.
const cluster = mysql.createPoolCluster({
  canRetry: true,           // retry on the next available node
  removeNodeErrorCount: 1,  // take a node out of rotation after 1 failed conn
  restoreNodeTimeout: 5000, // ...and try it again after 5s
  defaultSelector: 'ORDER', // always prefer endpoint #1 (local), then #2 (claude)
});

endpoints().forEach((cfg, i) => {
  const { label, ...opts } = cfg;
  cluster.add(`db-${label || i}`, {
    ...opts, // keeps each endpoint's OWN database (local DB_NAME_2 vs cloud DB_NAME)
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

// Prune endpoints with nothing listening before the first query runs.
//
// This module used to build the cluster and stop there, while its sibling
// backend/config/database.js did the pruning. That difference was the bug: this
// pool serves the auth routes, so a configured-but-dead local node (XAMPP
// stopped) was still PREFERRED by defaultSelector:'ORDER', failed mid-query with
// a raw ECONNRESET, and got restored into rotation every restoreNodeTimeout.
//
// The visible symptom was a register -> login pair splitting across two nodes:
// the row was written to whichever endpoint answered, the very next read went to
// the other one, and login answered 401 { step: "user_not_found" } for an account
// that had just registered with a 201. The validator wrapped that socket error
// into an opaque 400 "Validation engine error" with an empty violations[] array,
// so the cause was invisible from the HTTP response alone.
//
// Exposed as `clusterReady` so callers can `await` it — the promise facade below
// does so on every query, meaning a query can never race the prune.
const clusterReady = pruneUnreachableNodes(cluster).catch((err) => {
  // A probe failure must never break require(): keep the unpruned cluster so the
  // underlying connection error still surfaces with its own message.
  console.warn(`[DB CLUSTER] reachability probe failed (${err.message}) — continuing with all endpoints`);
  return [];
});

const db = cluster.of('*', 'ORDER');
db.cluster = cluster;

// Promise facade: routes call `await db.promise().query(...)`. Each call awaits
// clusterReady (memoised, so effectively a no-op after the first) and re-takes
// the namespace AFTER the await — the namespace is a view of the live cluster,
// not a snapshot, so a node pruned in the meantime is already excluded.
db.promise = function promiseFacade() {
  return {
    query(sql, values) {
      return clusterReady.then(() => new Promise((resolve, reject) =>
        cluster.of('*', 'ORDER').query(sql, values, (err, rows, fields) =>
          err ? reject(err) : resolve([rows, fields])
        )
      ));
    },
    execute(sql, values) {
      return clusterReady.then(() => new Promise((resolve, reject) =>
        cluster.of('*', 'ORDER').execute(sql, values, (err, rows, fields) =>
          err ? reject(err) : resolve([rows, fields])
        )
      ));
    },
    getConnection() {
      return clusterReady.then(() => new Promise((resolve, reject) =>
        cluster.of('*', 'ORDER').getConnection((err, conn) => (err ? reject(err) : resolve(conn)))
      ));
    },
  };
};

db.end = (cb) => cluster.end(cb);

module.exports = db;
