const mysql = require('mysql2/promise');
const { endpoints, clean, DB_NAME, pruneUnreachableNodes } = require('./dbEndpoints');

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
    ...opts,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
});

cluster.on('warn', (err) =>
  console.warn(`[DB CLUSTER] warn: ${err.code || err.message}`)
);
cluster.on('offline', (id) =>
  console.error(`[DB CLUSTER] ${id} offline — failing over to the other port`)
);
cluster.on('remove', (id) => console.error(`[DB CLUSTER] ${id} removed`));

// Prune endpoints with nothing listening before the first query runs — WITHOUT
// this, a configured-but-dead node (e.g. XAMPP stopped locally) is preferred by
// defaultSelector:'ORDER', fails mid-query with ECONNRESET, and is put back in
// rotation every restoreNodeTimeout. That produced a genuine READ-AFTER-WRITE
// SPLIT: register wrote the admin row to the cloud endpoint, the very next
// login round-robined onto the dead local node, failed, retried on cloud and
// still 401'd with "Admin user not found" — and ledger/invoice writes
// "disappeared" for the same reason.
//
// backend/config/database.js (the modular routers) already does this; mainDb —
// which serves ~7000 lines of server.js — was missing it, so the two halves of
// the app disagreed about which node was healthy.
//
// Memoised, so the probe round happens once per process.
const clusterReady = pruneUnreachableNodes(cluster).catch((err) => {
  // A probe failure must never break require(): keep the unpruned cluster so the
  // underlying connection error still surfaces with its own message.
  console.warn(`[DB CLUSTER] reachability probe failed (${err.message}) — continuing with all endpoints`);
  return [];
});

const db = cluster.of('*', 'ORDER');
db.cluster = cluster;

// Await clusterReady on every call so a query can never race the prune and land
// on a node that is about to be removed. Taken AFTER the await: the namespace is
// a live view of the cluster, not a snapshot, so a pruned node is already gone.
const RAW_QUERY = db.query.bind(db);
const RAW_EXECUTE = db.execute ? db.execute.bind(db) : null;

function readyQuery(sql, values) {
  return clusterReady.then(() => RAW_QUERY(sql, values));
}

function readyExecute(sql, values) {
  return clusterReady.then(() => RAW_EXECUTE(sql, values));
}

// Wrap in place so every existing `mainDb.query(...)` / `.execute(...)` call site
// is fixed without touching them. Non-wrapped keys are forwarded to the cluster
// namespace via the prototype, so `db.promise()`, `.cluster` etc. still work.
db.query = readyQuery;
if (RAW_EXECUTE) db.execute = readyExecute;

module.exports = db;
