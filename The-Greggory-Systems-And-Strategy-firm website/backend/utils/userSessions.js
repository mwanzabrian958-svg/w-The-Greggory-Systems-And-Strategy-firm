/**
 * MULTI-DEVICE SESSION PROTOCOL (user_sessions)
 *
 * The legacy auth flow stored ONE token per credential in `users.auth_token`,
 * so every new login overwrote the previous device's token (second device
 * login kicked the first) and logout blanked the column for ALL devices.
 *
 * This module fixes that with one row per device:
 *   - login  => issueSessionToken()      INSERTs a distinct token per device
 *   - auth   => findSessionUser()        validates ANY live (non-revoked) row
 *   - logout => revokeSessionToken()     revokes ONLY the presented token's row
 *
 * `users.auth_token` is still kept in sync with the MOST RECENT login so
 * legacy readers keep working, and clientAuth falls back to that column for
 * tokens issued before this table existed (smooth migration: old devices stay
 * signed in until they next log out).
 */
const db = require("../config/database");
const crypto = require("crypto");

let tableReady = null;

function ensureSessionTable() {
  if (!tableReady) {
    tableReady = db
      .promise()
      .query(
        `CREATE TABLE IF NOT EXISTS user_sessions (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          user_id BIGINT NOT NULL,
          token VARCHAR(128) NOT NULL,
          ip VARCHAR(45) NULL,
          user_agent VARCHAR(255) NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          revoked_at TIMESTAMP NULL,
          UNIQUE KEY uniq_user_sessions_token (token),
          KEY idx_user_sessions_user (user_id, revoked_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
      )
      .then(() => true)
      .catch((err) => {
        console.error("[SESSIONS] ensure user_sessions failed:", err.message);
        tableReady = null; // retry on next call
        throw err;
      });
  }
  return tableReady;
}

/**
 * Issue a fresh per-device token and persist it as its own session row.
 * Never touches other devices' rows. Degrades to legacy single-column
 * behaviour (token still returned; caller writes users.auth_token) if the
 * table cannot be created — login must never hard-fail on this.
 */
async function issueSessionToken(userId, { ip, userAgent } = {}) {
  const token = `gf_lock_${crypto.randomBytes(24).toString("hex")}`;
  try {
    await ensureSessionTable();
    await db.promise().query(
      "INSERT INTO user_sessions (user_id, token, ip, user_agent) VALUES (?, ?, ?, ?)",
      [userId, token, ip || null, userAgent ? String(userAgent).slice(0, 255) : null],
    );
  } catch (err) {
    console.error("[SESSIONS] issue failed (legacy fallback active):", err.message);
  }
  return token;
}

/**
 * Validate a token against live session rows. Returns { id, email, primary_role }
 * or null. Joins users so is_active/deleted_at are enforced here too.
 */
async function findSessionUser(token) {
  await ensureSessionTable();
  const [rows] = await db.promise().query(
    `SELECT u.id, u.email, u.primary_role
     FROM user_sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token = ? AND s.revoked_at IS NULL
       AND u.is_active = TRUE AND u.deleted_at IS NULL
     LIMIT 1`,
    [token],
  );
  return rows[0] || null;
}

/** Purge protocol (logout): revoke ONLY this token's row. Returns rows affected. */
async function revokeSessionToken(token) {
  try {
    await ensureSessionTable();
    const [result] = await db.promise().query(
      "UPDATE user_sessions SET revoked_at = NOW() WHERE token = ? AND revoked_at IS NULL",
      [token],
    );
    return result.affectedRows || 0;
  } catch (err) {
    console.error("[SESSIONS] revoke failed:", err.message);
    return 0;
  }
}

/** "Log out everywhere else": revoke every live row except keepToken. */
async function revokeOtherSessions(userId, keepToken) {
  await ensureSessionTable();
  const [result] = await db.promise().query(
    "UPDATE user_sessions SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL AND token != ?",
    [userId, keepToken || ""],
  );
  return result.affectedRows || 0;
}

module.exports = {
  ensureSessionTable,
  issueSessionToken,
  findSessionUser,
  revokeSessionToken,
  revokeOtherSessions,
};