-- ============================================================
-- Migration: Add 'role' column to users table
-- Reason: server.js fallback queries at L2666/L2967 try
--   SELECT id FROM users WHERE role = 'admin' before falling
--   back to primary_role. The 'role' column didn't exist,
--   causing ER_BAD_FIELD_ERROR on every accounting/finance
--   write that needs a created_by admin user.
--   This ALTER is idempotent. Note: "ADD COLUMN IF NOT EXISTS" is MariaDB-only
--   syntax and is a parse error (1064) on MySQL 8, which is what the cloud
--   database (Aiven) runs -- so the column is guarded with an information_schema
--   lookup and a prepared statement instead. The seed dump already declares
--   `role`, so on a fresh install this is a no-op; it only matters for
--   databases created before that column landed.
-- ============================================================

SET @role_col := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = COALESCE(DATABASE(), 'the_greggory_systems_and_strategy_firm_db_main')
    AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role'
);

SET @role_sql := IF(@role_col = 0,
  'ALTER TABLE `users` ADD COLUMN `role` VARCHAR(50) DEFAULT ''user'' AFTER `primary_role`',
  'DO 0');

PREPARE stmt_role FROM @role_sql;
EXECUTE stmt_role;
DEALLOCATE PREPARE stmt_role;
