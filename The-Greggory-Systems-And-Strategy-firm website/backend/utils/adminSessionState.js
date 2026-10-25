const db = require('../config/database');
const { verifySessionToken } = require('./sessionToken');

let versionColumnReady;

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

async function verifyActiveAdminSession(token) {
  const payload = verifySessionToken(token);
  if (!payload) return null;
  const currentVersion = await getAdminSessionVersion(payload.uid);
  return Number(payload.sessionVersion || 0) === currentVersion ? payload : null;
}

module.exports = {
  ensureAdminSessionVersionColumn,
  getAdminSessionVersion,
  revokeAllAdminSessions,
  verifyActiveAdminSession,
};
