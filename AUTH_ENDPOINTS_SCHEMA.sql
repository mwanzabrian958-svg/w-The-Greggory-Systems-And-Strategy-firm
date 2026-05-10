-- =====================================================
-- AUTH PLATFORM ENDPOINTS - LOCKED MAPPING TABLE
-- =====================================================
-- This table locks in the platform-to-table associations
-- NO changes allowed after initialization
-- Database: greggory_foundation_db_main
-- =====================================================

USE greggory_foundation_db_main;

-- =============================================
-- Table: auth_platform_mapping
-- Locks platform → table → endpoint associations
-- =============================================
CREATE TABLE IF NOT EXISTS auth_platform_mapping (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    platform_name VARCHAR(50) NOT NULL UNIQUE,
    table_name VARCHAR(100) NOT NULL UNIQUE,
    register_endpoint VARCHAR(255) NOT NULL,
    login_endpoint VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    is_locked BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    locked_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    locked_by VARCHAR(100) DEFAULT 'SYSTEM',
    INDEX idx_platform_name (platform_name),
    INDEX idx_table_name (table_name),
    INDEX idx_is_locked (is_locked),
    CONSTRAINT check_platform_name CHECK (platform_name IN ('user', 'admin', 'developer')),
    CONSTRAINT check_table_name CHECK (table_name IN ('users', 'admin_users', 'developer_users'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert locked platform mappings
DELETE FROM auth_platform_mapping; -- Clear any existing entries

INSERT INTO auth_platform_mapping (
    platform_name, 
    table_name, 
    register_endpoint, 
    login_endpoint, 
    description, 
    is_active, 
    is_locked,
    locked_by
) VALUES 
(
    'user',
    'users',
    'POST /api/users/register',
    'POST /api/users/login',
    'Regular user authentication - public user accounts, donors, beneficiaries',
    TRUE,
    TRUE,
    'SYSTEM'
),
(
    'admin',
    'admin_users',
    'POST /api/admin/create (admin-create via users.js)',
    'POST /api/admin-verification/authenticate-enhanced',
    'Administrative staff - super admins, admins, moderators',
    TRUE,
    TRUE,
    'SYSTEM'
),
(
    'developer',
    'developer_users',
    'POST /api/admin/developer-create (admin-create via users.js)',
    'POST /api/developer-verification/authenticate',
    'Development team - senior, mid, junior, lead level developers',
    TRUE,
    TRUE,
    'SYSTEM'
);

-- =============================================
-- Table: auth_request_log
-- Logs all authentication requests for audit
-- =============================================
CREATE TABLE IF NOT EXISTS auth_request_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id VARCHAR(100) NOT NULL UNIQUE,
    platform VARCHAR(50) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    ip_address VARCHAR(45),
    request_method VARCHAR(10),
    request_body_hash VARCHAR(64),
    response_status INT,
    response_message VARCHAR(255),
    error_message VARCHAR(500),
    execution_time_ms INT,
    is_success BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_platform (platform),
    INDEX idx_table_name (table_name),
    INDEX idx_endpoint (endpoint),
    INDEX idx_email (email),
    INDEX idx_created_at (created_at),
    INDEX idx_is_success (is_success)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: auth_validation_rules
-- Defines strict validation rules per platform
-- =============================================
CREATE TABLE IF NOT EXISTS auth_validation_rules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    platform VARCHAR(50) NOT NULL,
    rule_name VARCHAR(100) NOT NULL,
    rule_type ENUM('required_field', 'table_isolation', 'cross_check', 'password_policy', 'rate_limit') DEFAULT 'required_field',
    rule_value VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    enforcement_level ENUM('strict', 'warning', 'info') DEFAULT 'strict',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_platform_rule (platform, rule_name),
    INDEX idx_platform (platform),
    INDEX idx_rule_type (rule_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert validation rules
DELETE FROM auth_validation_rules;

INSERT INTO auth_validation_rules (
    platform,
    rule_name,
    rule_type,
    rule_value,
    description,
    enforcement_level
) VALUES
-- User platform rules
('user', 'email_required', 'required_field', 'email', 'Email field is mandatory for user registration', 'strict'),
('user', 'password_required', 'required_field', 'password', 'Password field is mandatory for user registration', 'strict'),
('user', 'first_name_required', 'required_field', 'first_name', 'First name field is mandatory for user registration', 'strict'),
('user', 'last_name_required', 'required_field', 'last_name', 'Last name field is mandatory for user registration', 'strict'),
('user', 'only_users_table', 'table_isolation', 'users', 'User auth MUST ONLY reference users table', 'strict'),
('user', 'no_admin_check', 'cross_check', 'admin_users', 'NEVER check admin_users table in user auth flow', 'strict'),
('user', 'no_developer_check', 'cross_check', 'developer_users', 'NEVER check developer_users table in user auth flow', 'strict'),
('user', 'password_min_length', 'password_policy', '8', 'Password must be minimum 8 characters', 'strict'),
-- Admin platform rules
('admin', 'email_required', 'required_field', 'email', 'Email field is mandatory for admin registration', 'strict'),
('admin', 'password_required', 'required_field', 'password', 'Password field is mandatory for admin registration', 'strict'),
('admin', 'first_name_required', 'required_field', 'first_name', 'First name field is mandatory for admin registration', 'strict'),
('admin', 'last_name_required', 'required_field', 'last_name', 'Last name field is mandatory for admin registration', 'strict'),
('admin', 'role_required', 'required_field', 'role', 'Role field is mandatory for admin registration', 'strict'),
('admin', 'only_admin_users_table', 'table_isolation', 'admin_users', 'Admin auth MUST ONLY reference admin_users table', 'strict'),
('admin', 'no_users_check', 'cross_check', 'users', 'NEVER check users table in admin auth flow', 'strict'),
('admin', 'no_developer_check', 'cross_check', 'developer_users', 'NEVER check developer_users table in admin auth flow', 'strict'),
('admin', 'password_min_length', 'password_policy', '8', 'Password must be minimum 8 characters', 'strict'),
-- Developer platform rules
('developer', 'email_required', 'required_field', 'email', 'Email field is mandatory for developer registration', 'strict'),
('developer', 'password_required', 'required_field', 'password', 'Password field is mandatory for developer registration', 'strict'),
('developer', 'first_name_required', 'required_field', 'first_name', 'First name field is mandatory for developer registration', 'strict'),
('developer', 'last_name_required', 'required_field', 'last_name', 'Last name field is mandatory for developer registration', 'strict'),
('developer', 'role_required', 'required_field', 'role', 'Role field is mandatory for developer registration', 'strict'),
('developer', 'only_developer_users_table', 'table_isolation', 'developer_users', 'Developer auth MUST ONLY reference developer_users table', 'strict'),
('developer', 'no_users_check', 'cross_check', 'users', 'NEVER check users table in developer auth flow', 'strict'),
('developer', 'no_admin_check', 'cross_check', 'admin_users', 'NEVER check admin_users table in developer auth flow', 'strict'),
('developer', 'password_min_length', 'password_policy', '8', 'Password must be minimum 8 characters', 'strict');

-- =============================================
-- VIEWS for Auth Platform Monitoring
-- =============================================

-- View: Active Auth Platforms
CREATE OR REPLACE VIEW v_active_auth_platforms AS
SELECT 
    platform_name,
    table_name,
    register_endpoint,
    login_endpoint,
    description,
    is_active,
    is_locked,
    locked_at,
    locked_by
FROM auth_platform_mapping
WHERE is_active = TRUE AND is_locked = TRUE
ORDER BY platform_name;

-- View: Auth Request Success Rate
CREATE OR REPLACE VIEW v_auth_request_stats AS
SELECT 
    platform,
    table_name,
    endpoint,
    COUNT(*) as total_requests,
    SUM(CASE WHEN is_success = TRUE THEN 1 ELSE 0 END) as successful_requests,
    SUM(CASE WHEN is_success = FALSE THEN 1 ELSE 0 END) as failed_requests,
    ROUND(
        (SUM(CASE WHEN is_success = TRUE THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2
    ) as success_rate_percentage,
    ROUND(AVG(execution_time_ms), 2) as avg_execution_time_ms,
    MIN(created_at) as first_request_at,
    MAX(created_at) as last_request_at
FROM auth_request_log
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY platform, table_name, endpoint
ORDER BY platform, endpoint;

-- =============================================
-- Sample Audit Query
-- =============================================
-- SELECT 
--     platform_name,
--     table_name,
--     register_endpoint,
--     login_endpoint,
--     is_locked,
--     locked_at,
--     locked_by
-- FROM auth_platform_mapping
-- WHERE is_locked = TRUE;
