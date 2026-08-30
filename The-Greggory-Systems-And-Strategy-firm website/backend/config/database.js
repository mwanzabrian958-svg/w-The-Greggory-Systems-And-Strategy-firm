const mysql = require('mysql2');
const { endpoints, clean, DB_NAME } = require('../../server/config/dbEndpoints');

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

endpoints().forEach((cfg, i) => {
  const { label, ...opts } = cfg;
  cluster.add(`db-${label || i}`, {
    ...opts,
    database: DB_NAME,
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

// Callback-style namespace (db.query(sql, values, cb), db.execute(...)).
const db = cluster.of('*', 'ORDER');

// Promise facade: routes call `await db.promise().query(...)` everywhere.
db.promise = function promiseFacade() {
  const ns = cluster.of('*', 'ORDER');
  return {
    query(sql, values) {
      return new Promise((resolve, reject) =>
        ns.query(sql, values, (err, rows, fields) =>
          err ? reject(err) : resolve([rows, fields])
        )
      );
    },
    execute(sql, values) {
      return new Promise((resolve, reject) =>
        ns.execute(sql, values, (err, rows, fields) =>
          err ? reject(err) : resolve([rows, fields])
        )
      );
    },
    getConnection() {
      return new Promise((resolve, reject) =>
        ns.getConnection((err, conn) => (err ? reject(err) : resolve(conn)))
      );
    },
  };
};

db.end = (cb) => cluster.end(cb);
db.cluster = cluster;

module.exports = db;
