-- Migration: Sync users table with backend expectations
-- Run this in phpMyAdmin SQL tab or via mysql CLI on greggory_foundation_db

-- 1) Ensure canonical columns exist and have expected types
ALTER TABLE users
  MODIFY COLUMN email VARCHAR(255) NOT NULL,
  MODIFY COLUMN password_hash VARCHAR(255) DEFAULT NULL;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS username VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS password_reset_expires DATETIME DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS role_id BIGINT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP NULL DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC',
  ADD COLUMN IF NOT EXISTS locale VARCHAR(10) DEFAULT 'en-US',
  ADD COLUMN IF NOT EXISTS profile_photo_id BIGINT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL DEFAULT NULL;

-- 2) Add lightweight compatibility columns used elsewhere (safe to keep nullable)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS `name` VARCHAR(200) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS profile_image VARCHAR(512) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS primary_role VARCHAR(50) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS last_login TIMESTAMP NULL DEFAULT NULL;

-- 3) Populate compatibility columns from canonical fields (non-destructive)
UPDATE users SET `name` = CONCAT(COALESCE(first_name,''),' ',COALESCE(last_name,'')) WHERE `name` IS NULL;
UPDATE users SET profile_image = NULL WHERE profile_image IS NULL; -- placeholder (no-op)
UPDATE users SET is_email_verified = email_verified WHERE is_email_verified IS NULL;

-- Populate primary_role from role_id via roles.name when possible
UPDATE users u
LEFT JOIN roles r ON u.role_id = r.id
SET u.primary_role = r.name
WHERE u.primary_role IS NULL AND u.role_id IS NOT NULL;

-- 4) Ensure default roles exist and link users without role_id to default 'user' role
INSERT INTO roles (name, description, is_system_role, permissions) 
SELECT 'user', 'Default user role', TRUE, JSON_ARRAY() 
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'user');

INSERT INTO roles (name, description, is_system_role, permissions) 
SELECT 'admin', 'Administrator role', TRUE, JSON_ARRAY() 
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'admin');

-- Assign role_id to users missing one (use 'user' role)
UPDATE users u
JOIN (SELECT id FROM roles WHERE name = 'user' LIMIT 1) r
SET u.role_id = r.id
WHERE u.role_id IS NULL;

-- 5) Create indexes used by the application (if not already present)
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users (is_active, deleted_at);
CREATE INDEX IF NOT EXISTS idx_users_name ON users (first_name, last_name);

-- 6) (Optional) Add foreign key for role_id if roles table exists and FK not present
-- Note: MySQL doesn't support IF NOT EXISTS for ADD CONSTRAINT; run the following only if you confirm no FK exists:
-- ALTER TABLE users ADD CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT;

-- Done. Review output for warnings/errors and then run your application.
