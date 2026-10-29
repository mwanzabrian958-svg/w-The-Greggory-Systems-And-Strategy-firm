const db = require('../config/database');
const crypto = require('crypto');
const { signSessionToken, verifySessionToken } = require('./sessionToken');

let versionColumnReady;
let sessionTableReady;

async function ensureAdminSessionTable() {
  if (!sessionTableReady) {
    sessionTableReady = db.promise().query(
      `CREATE TABLE IF NOT EXISTS admin_sessions (
        session_id VARCHAR(64) PRIMARY KEY,
        admin_id BIGINT UNSIGNED NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        revoked_at TIMESTAMP NULL,
        KEY idx_admin_sessions_admin (admin_id, revoked_at),
        KEY idx_admin_sessions_expiry (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    ).then(() => true).catch((error) => {
      sessionTableReady = null;
      throw error;
    });
  }
  return sessionTableReady;
}

async function ensureAdminSessionVersionColumn() {
  if (!versionColumnReady) {
    versionColumnReady = db.promise().query(
      "SHOW COLUMNS FROM admin_users LIKE 'session_version'",
    ).then(async ([columns]) => {
      if (!columns.length) {
        try {
          await db.promise().query(
            'ALTER TABLE admin_users ADD COLUMN session_version BIGINT UNSIGNED NOT NULL DEFAULT 0',
          );
        } catch (error) {
          if (error.code !== 'ER_DUP_FIELDNAME') throw error;
        }
      }
      return true;
    }).catch((error) => {
      versionColumnReady = null;
      throw error;
    });
  }
  return versionColumnReady;
}

async function getAdminSessionVersion(adminId) {
  await ensureAdminSessionVersionColumn();
  const [rows] = await db.promise().query(
    'SELECT session_version FROM admin_users WHERE id = ? LIMIT 1',
    [adminId],
  );
  if (!rows.length) throw new Error('Admin account was not found');
  return Number(rows[0].session_version);
}

async function revokeAllAdminSessions(adminId) {
  await ensureAdminSessionVersionColumn();
  const [result] = await db.promise().query(
    'UPDATE admin_users SET session_version = session_version + 1 WHERE id = ?',
    [adminId],
  );
  if (result.affectedRows !== 1) throw new Error('Admin sessions could not be revoked');
  return getAdminSessionVersion(adminId);
}

async function createAdminSession(adminId, role = 'admin') {
  await ensureAdminSessionTable();
  const sessionVersion = await getAdminSessionVersion(adminId);
  const sessionId = crypto.randomBytes(24).toString('hex');
  const token = signSessionToken(adminId, role, sessionVersion, sessionId);
  await db.promise().query(
    `DELETE FROM admin_sessions
      WHERE expires_at <= NOW() OR revoked_at IS NOT NULL`,
  );
  await db.promise().query(
    `INSERT INTO admin_sessions (session_id, admin_id, expires_at)
     VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 8 HOUR))`,
    [sessionId, adminId],
  );
  return token;
}

async function revokeAdminSession(token) {
  const payload = verifySessionToken(token);
  if (!payload) return 0;
  if (!payload.sid) {
    await revokeAllAdminSessions(payload.uid);
    return 1;
  }
  await ensureAdminSessionTable();
  const [result] = await db.promise().query(
    `UPDATE admin_sessions
        SET revoked_at = NOW()
      WHERE session_id = ? AND admin_id = ? AND revoked_at IS NULL`,
    [payload.sid, payload.uid],
  );
  return result.affectedRows || 0;
}

async function verifyActiveAdminSession(token) {
  const payload = verifySessionToken(token);
  if (!payload) return null;
  const currentVersion = await getAdminSessionVersion(payload.uid);
  if (Number(payload.sessionVersion || 0) !== currentVersion) return null;
  if (payload.sid) {
    await ensureAdminSessionTable();
    const [sessions] = await db.promise().query(
      `SELECT session_id
         FROM admin_sessions
        WHERE session_id = ? AND admin_id = ? AND revoked_at IS NULL AND expires_at > NOW()
        LIMIT 1`,
      [payload.sid, payload.uid],
    );
    if (!sessions.length) return null;
  }
  return payload;
}

module.exports = {
  ensureAdminSessionVersionColumn,
  ensureAdminSessionTable,
  getAdminSessionVersion,
  createAdminSession,
  revokeAdminSession,
  revokeAllAdminSessions,
  verifyActiveAdminSession,
};
