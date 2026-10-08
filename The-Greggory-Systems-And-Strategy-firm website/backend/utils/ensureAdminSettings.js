/**
 * Self-heals the `admin_settings` table.
 *
 * WHY THIS EXISTS
 * ---------------
 * `admin_settings` was referenced by nine call sites (server.js, routes/admin.js,
 * routes/admin-complete.js and several scripts) but NEVER had a CREATE TABLE —
 * not in database/schema-sync.json, not in the reference SQL dump. The table that
 * actually exists is `admin_website_settings`, which is a DIFFERENT shape
 * (namespaced by `category`, no `setting_group`) and is NOT a drop-in substitute.
 *
 * On any database that was built from the real schema the result was a hard
 * `ER_NO_SUCH_TABLE` on every settings access, surfacing as:
 *   - PUT /api/admin/settings  -> 500 "Failed to update settings"
 *   - GET /api/admin/settings  -> 500 "Failed to fetch settings"
 *   - GET /api/admin/permissions -> 500 "Permissions failed"
 * which made the entire Permissions Manager a no-op: toggles never persisted and
 * the sidebar nav enforcement never saw a saved matrix.
 *
 * The schema is guaranteed here (lazy CREATE, same convention as ensureOtpColumns
 * in routes/whatsappAuth.js) rather than in a migration file, because the
 * callers are spread across both the monolith and the modular routers and a
 * fresh/purged database must work with no manual step.
 *
 * NOTE: the UNIQUE KEY on setting_key is load-bearing, not cosmetic — the write
 * path uses `INSERT ... ON DUPLICATE KEY UPDATE`, which silently degrades into
 * duplicate-inserting (every save appends a new row) if the key is missing.
 */
"use strict";

const DDL = `
CREATE TABLE IF NOT EXISTS admin_settings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  setting_key VARCHAR(191) NOT NULL,
  setting_value LONGTEXT,
  setting_group VARCHAR(100) DEFAULT 'general',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by BIGINT UNSIGNED DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admin_settings_key (setting_key),
  KEY idx_admin_settings_group (setting_group, setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
`;

let ready = null;

/**
 * @param {{ promise: () => any }} db A mysql2 pool (or `mysql2/promise` pool).
 * @returns {Promise<boolean>} resolves true once the table is guaranteed.
 */
async function ensureAdminSettingsTable(db) {
  // Memoised: the DDL runs at most once per process. Cleared on failure so a
  // transient DB outage retries on the next call instead of caching the miss.
  if (ready) return ready;

  ready = (async () => {
    const conn = db.promise();
    await conn.query(DDL);
    return true;
  })().catch((err) => {
    ready = null;
    throw err;
  });

  return ready;
}

module.exports = { ensureAdminSettingsTable, ADMIN_SETTINGS_DDL: DDL };
