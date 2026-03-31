-- Greggory Foundation Ltd - Authentication Platform Schema
-- Created: 2025-03-08
-- Description: Complete SQL schema for registration and login platform matching website requirements
-- Usage: Import this file into your existing MySQL database

USE greggory_auth_platform;

-- Enable strict mode for better data integrity
SET SQL_MODE = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- =============================================
-- Table: roles
-- User roles with JSON permissions for RBAC
-- =============================================
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE,
    permissions JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_roles_name (name),
    INDEX idx_roles_system (is_system_role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: images
-- Centralized image storage for profile photos and uploads
-- =============================================
CREATE TABLE IF NOT EXISTS images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    alt_text VARCHAR(255),
    title VARCHAR(255),
    width INT,
    height INT,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    deleted_by BIGINT DEFAULT NULL,
    INDEX idx_images_public (is_public, created_at),
    INDEX idx_images_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: users
-- User accounts with authentication and profile information
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255) DEFAULT NULL,
    email_verification_expires DATETIME DEFAULT NULL,
    password_hash VARCHAR(255) DEFAULT NULL,
    password_reset_token VARCHAR(255) DEFAULT NULL,
    password_reset_expires DATETIME DEFAULT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(200) GENERATED ALWAYS AS (CONCAT(first_name, ' ', last_name)) STORED,
    phone_number VARCHAR(50),
    profile_photo_id BIGINT DEFAULT NULL,
    role_id BIGINT NOT NULL DEFAULT 2, -- Default to 'user' role
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP NULL DEFAULT NULL,
    last_login_ip VARCHAR(45) DEFAULT NULL,
    login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP NULL DEFAULT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',
    locale VARCHAR(10) DEFAULT 'en-US',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    deleted_by BIGINT DEFAULT NULL,
    FOREIGN KEY (profile_photo_id) REFERENCES images(id) ON DELETE SET NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
    INDEX idx_users_email (email),
    INDEX idx_users_active (is_active, deleted_at),
    INDEX idx_users_name (first_name, last_name),
    INDEX idx_users_login_attempts (login_attempts, locked_until)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: oauth_providers
-- OAuth provider configurations (Google, etc.)
-- =============================================
CREATE TABLE IF NOT EXISTS oauth_providers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    client_id VARCHAR(255) NOT NULL,
    client_secret VARCHAR(255) NOT NULL,
    authorize_url VARCHAR(512) NOT NULL,
    token_url VARCHAR(512) NOT NULL,
    profile_url VARCHAR(512) NOT NULL,
    scope VARCHAR(255) DEFAULT 'openid email profile',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_oauth_providers_name (name),
    INDEX idx_oauth_providers_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: user_oauth_accounts
-- Link users to their OAuth accounts
-- =============================================
CREATE TABLE IF NOT EXISTS user_oauth_accounts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    oauth_provider_id BIGINT NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP NULL DEFAULT NULL,
    email VARCHAR(255),
    profile_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (oauth_provider_id) REFERENCES oauth_providers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_provider_user (oauth_provider_id, provider_user_id),
    INDEX idx_user_oauth_user (user_id),
    INDEX idx_user_oauth_provider (oauth_provider_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: user_sessions
-- Active user sessions for session management
-- =============================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    refresh_token VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sessions_user (user_id),
    INDEX idx_sessions_token (session_token),
    INDEX idx_sessions_active (is_active, expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: login_attempts
-- Track login attempts for security monitoring
-- =============================================
CREATE TABLE IF NOT EXISTS login_attempts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    failure_reason VARCHAR(255),
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_login_attempts_email (email),
    INDEX idx_login_attempts_ip (ip_address),
    INDEX idx_login_attempts_success (success),
    INDEX idx_login_attempts_date (attempted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: audit_logs
-- Audit trail for user actions
-- =============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id BIGINT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_logs_user (user_id),
    INDEX idx_audit_logs_action (action),
    INDEX idx_audit_logs_resource (resource_type, resource_id),
    INDEX idx_audit_logs_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Insert default roles (only if they don't exist)
-- =============================================
INSERT IGNORE INTO roles (name, description, is_system_role, permissions) VALUES
('super_admin', 'Super Administrator with full system access', TRUE, JSON_OBJECT(
    'users', JSON_OBJECT('create', true, 'read', true, 'update', true, 'delete', true),
    'roles', JSON_OBJECT('create', true, 'read', true, 'update', true, 'delete', true),
    'content', JSON_OBJECT('create', true, 'read', true, 'update', true, 'delete', true),
    'system', JSON_OBJECT('admin', true, 'config', true, 'logs', true)
)),
('admin', 'Administrator with limited access', TRUE, JSON_OBJECT(
    'users', JSON_OBJECT('create', true, 'read', true, 'update', true, 'delete', false),
    'content', JSON_OBJECT('create', true, 'read', true, 'update', true, 'delete', true),
    'system', JSON_OBJECT('logs', true)
)),
('user', 'Regular user with basic access', TRUE, JSON_OBJECT(
    'profile', JSON_OBJECT('read', true, 'update', true),
    'content', JSON_OBJECT('read', true)
)),
('guest', 'Guest user with minimal access', TRUE, JSON_OBJECT(
    'content', JSON_OBJECT('read', true)
));

-- =============================================
-- Insert default OAuth providers (only if they don't exist)
-- =============================================
INSERT IGNORE INTO oauth_providers (name, client_id, client_secret, authorize_url, token_url, profile_url, scope) VALUES
('google', 'your-google-client-id', 'your-google-client-secret', 
 'https://accounts.google.com/o/oauth2/v2/auth',
 'https://oauth2.googleapis.com/token',
 'https://www.googleapis.com/oauth2/v2/userinfo',
 'openid email profile');

-- =============================================
-- Insert default admin user (only if they don't exist)
-- =============================================
INSERT IGNORE INTO users (email, first_name, last_name, password_hash, role_id, email_verified, is_active) VALUES
('admin@greggoryfoundation.com', 'System', 'Administrator', 
 '$2b$10$rOzJqQjQjQjQjQjQjQjQjOzJqQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQjQ', 1, TRUE, TRUE);

-- =============================================
-- Insert sample images for the video display (only if they don't exist)
-- =============================================
INSERT IGNORE INTO images (id, file_name, file_path, file_type, file_size, alt_text, title, width, height, is_public) VALUES
(1, 'business-solutions.jpg', '/uploads/business-solutions.jpg', 'image/jpeg', 245760, 'Business Solutions and Innovation', 'Business Solutions', 400, 300, TRUE),
(2, 'team-collaboration.jpg', '/uploads/team-collaboration.jpg', 'image/jpeg', 312456, 'Team Working Together', 'Team Collaboration', 400, 300, TRUE),
(3, 'digital-transformation.jpg', '/uploads/digital-transformation.jpg', 'image/jpeg', 289765, 'Digital Technology Solutions', 'Digital Transformation', 400, 300, TRUE);

-- =============================================
-- Success message
-- =============================================
SELECT 'Greggory Foundation Ltd Authentication Platform Schema Created Successfully' as status;
SELECT COUNT(*) as total_roles FROM roles;
SELECT COUNT(*) as total_users FROM users WHERE deleted_at IS NULL;
SELECT COUNT(*) as total_images FROM images WHERE deleted_at IS NULL;
