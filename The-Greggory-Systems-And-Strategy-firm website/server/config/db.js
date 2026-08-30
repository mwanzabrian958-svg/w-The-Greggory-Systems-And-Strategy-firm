const mysql = require('mysql2/promise');
const { endpoints, clean, DB_NAME } = require('./dbEndpoints');

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
    database: DB_NAME,
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

const db = cluster.of('*', 'ORDER');
db.cluster = cluster;

module.exports = db;
