-- ============================================================
-- Migration: Add 'role' column to users table
-- Reason: server.js fallback queries at L2666/L2967 try
--   SELECT id FROM users WHERE role = 'admin' before falling
--   back to primary_role. The 'role' column didn't exist,
--   causing ER_BAD_FIELD_ERROR on every accounting/finance
--   write that needs a created_by admin user.
--   This ALTER is idempotent: IF NOT EXISTS avoids errors
--   when the column is already present.
-- ============================================================

ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS `role` VARCHAR(50) DEFAULT 'user'
    AFTER `primary_role`;
