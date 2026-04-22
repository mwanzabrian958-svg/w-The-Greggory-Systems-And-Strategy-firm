-- =====================================================
-- CORRECTED Complete Database Schema for Greggory Foundation
-- Database Name: greggory_foundation_db_main
-- Description: Fixed ordering, removed duplicates, added missing tables
-- =====================================================

-- Drop and create database
DROP DATABASE IF EXISTS greggory_foundation_db_main;
CREATE DATABASE greggory_foundation_db_main CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE greggory_foundation_db_main;

-- Enable strict mode
SET SQL_MODE = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- =====================================================
-- SECTION 1: BASE TABLES (No Foreign Key Dependencies)
-- =====================================================

-- =============================================
-- Table: images
-- Centralized image storage - MUST BE FIRST
-- =============================================
CREATE TABLE IF NOT EXISTS images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(512),
    file_type VARCHAR(100),
    file_size BIGINT,
    content_type VARCHAR(100),
    data LONGBLOB,
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
    INDEX idx_images_filename (file_name),
    INDEX idx_images_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: roles
-- User roles and permissions
-- =============================================
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT NULL,
    is_system_role BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    deleted_by BIGINT DEFAULT NULL,
    INDEX idx_roles_name (name),
    INDEX idx_roles_system (is_system_role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default roles (ONCE - not duplicated)
INSERT INTO roles (id, name, description, is_system_role) VALUES 
(1, 'admin', 'Administrator account', 1),
(2, 'user', 'Regular user account', 1),
(3, 'developer', 'Developer account', 1);

-- =============================================
-- Table: team_members
-- Job/role definitions for users - REQUIRED by backend
-- =============================================
CREATE TABLE IF NOT EXISTS team_members (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_team_members_name (name),
    INDEX idx_team_members_role (role),
    INDEX idx_team_members_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default team member roles
INSERT INTO team_members (name, role, department) VALUES
('Project Manager', 'manager', 'Projects'),
('Site Supervisor', 'supervisor', 'Operations'),
('Engineer', 'engineer', 'Technical'),
('Consultant', 'consultant', 'Consulting'),
('Field Worker', 'field_worker', 'Operations'),
('Administrator', 'admin', 'Administration'),
('Developer', 'developer', 'Technology');

-- =============================================
-- Table: users
-- Regular user accounts
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
    profile_photo_blob LONGBLOB NULL DEFAULT NULL,
    profile_photo_mime_type VARCHAR(100) NULL DEFAULT NULL,
    profile_photo_file_name VARCHAR(255) NULL DEFAULT NULL,
    job_id BIGINT DEFAULT NULL,
    primary_role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP NULL DEFAULT NULL,
    last_login_ip VARCHAR(45) DEFAULT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',
    locale VARCHAR(10) DEFAULT 'en-US',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    deleted_by BIGINT DEFAULT NULL,
    FOREIGN KEY (profile_photo_id) REFERENCES images(id) ON DELETE SET NULL,
    FOREIGN KEY (job_id) REFERENCES team_members(id) ON DELETE SET NULL,
    INDEX idx_users_email (email),
    INDEX idx_users_active (is_active, deleted_at),
    INDEX idx_users_name (first_name, last_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: admin_users
-- Admin authentication (per AUTH_PROTOCOL.md)
-- =============================================
CREATE TABLE IF NOT EXISTS admin_users (
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
    profile_photo_blob LONGBLOB NULL DEFAULT NULL,
    profile_photo_mime_type VARCHAR(100) NULL DEFAULT NULL,
    profile_photo_file_name VARCHAR(255) NULL DEFAULT NULL,
    profile_image_id BIGINT DEFAULT NULL,
    admin_level ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin',
    admin_permissions JSON,
    access_level ENUM('full', 'limited', 'read_only') DEFAULT 'full',
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP NULL DEFAULT NULL,
    last_login_ip VARCHAR(45) DEFAULT NULL,
    failed_login_attempts INT DEFAULT 0,
    account_locked_until TIMESTAMP NULL DEFAULT NULL,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255) DEFAULT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',
    locale VARCHAR(10) DEFAULT 'en-US',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    deleted_by BIGINT DEFAULT NULL,
    FOREIGN KEY (profile_photo_id) REFERENCES images(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES admin_users(id) ON DELETE SET NULL,
    INDEX idx_admin_users_email (email),
    INDEX idx_admin_users_active (is_active, deleted_at),
    INDEX idx_admin_users_level (admin_level),
    INDEX idx_admin_users_access (access_level),
    INDEX idx_admin_users_department (department),
    INDEX idx_admin_users_login (last_login_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: developer_users
-- Developer authentication (per AUTH_PROTOCOL.md)
-- =============================================
CREATE TABLE IF NOT EXISTS developer_users (
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
    profile_photo_blob LONGBLOB NULL DEFAULT NULL,
    profile_photo_mime_type VARCHAR(100) NULL DEFAULT NULL,
    profile_photo_file_name VARCHAR(255) NULL DEFAULT NULL,
    profile_image_id BIGINT DEFAULT NULL,
    developer_level ENUM('senior', 'mid', 'junior', 'lead') DEFAULT 'mid',
    tech_stack JSON,
    specialization VARCHAR(100),
    access_level ENUM('full', 'limited', 'read_only') DEFAULT 'limited',
    team_id BIGINT,
    github_username VARCHAR(100),
    linkedin_url VARCHAR(512),
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP NULL DEFAULT NULL,
    last_login_ip VARCHAR(45) DEFAULT NULL,
    failed_login_attempts INT DEFAULT 0,
    account_locked_until TIMESTAMP NULL DEFAULT NULL,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255) DEFAULT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',
    locale VARCHAR(10) DEFAULT 'en-US',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    deleted_by BIGINT DEFAULT NULL,
    FOREIGN KEY (profile_photo_id) REFERENCES images(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES admin_users(id) ON DELETE SET NULL,
    INDEX idx_developer_users_email (email),
    INDEX idx_developer_users_active (is_active, deleted_at),
    INDEX idx_developer_users_level (developer_level),
    INDEX idx_developer_users_stack (specialization),
    INDEX idx_developer_users_team (team_id),
    INDEX idx_developer_users_login (last_login_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: companies
-- =============================================
CREATE TABLE IF NOT EXISTS companies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    logo_id BIGINT,
    website_url VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    deleted_by BIGINT DEFAULT NULL,
    FOREIGN KEY (logo_id) REFERENCES images(id) ON DELETE SET NULL,
    INDEX idx_companies_slug (slug),
    INDEX idx_companies_active (is_active, deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SECTION 2: USER-RELATED TABLES (Reference users)
-- =====================================================

-- =============================================
-- Table: user_roles
-- =============================================
CREATE TABLE IF NOT EXISTS user_roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_user_role (user_id, role_id),
    INDEX idx_user_roles_user (user_id),
    INDEX idx_user_roles_role (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: properties
-- =============================================
CREATE TABLE IF NOT EXISTS properties (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description LONGTEXT,
    property_type ENUM('apartment', 'house', 'villa', 'commercial', 'land', 'office') NOT NULL,
    status ENUM('available', 'rented', 'maintenance', 'unavailable') DEFAULT 'available',
    bedrooms INT DEFAULT 0,
    bathrooms INT DEFAULT 0,
    square_meters DECIMAL(10,2),
    price_per_month DECIMAL(10,2),
    location_address VARCHAR(255),
    location_city VARCHAR(100),
    location_country VARCHAR(100),
    featured_image_id BIGINT,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    deleted_by BIGINT DEFAULT NULL,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (featured_image_id) REFERENCES images(id) ON DELETE SET NULL,
    INDEX idx_properties_company (company_id, status),
    INDEX idx_properties_type (property_type, status),
    INDEX idx_properties_featured (is_featured, status),
    INDEX idx_properties_location (location_city, location_country)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: contact_forms
-- =============================================
CREATE TABLE IF NOT EXISTS contact_forms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255),
    subject VARCHAR(255),
    message LONGTEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_contact_forms_email (email, created_at),
    INDEX idx_contact_forms_read (is_read, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: user_projects
-- =============================================
CREATE TABLE IF NOT EXISTS user_projects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    project_description LONGTEXT,
    project_type ENUM('consulting', 'development', 'design', 'marketing', 'management', 'other') DEFAULT 'consulting',
    status ENUM('planning', 'in_progress', 'completed', 'on_hold', 'cancelled') DEFAULT 'planning',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    start_date DATE,
    end_date DATE,
    estimated_budget DECIMAL(12,2),
    actual_budget DECIMAL(12,2),
    client_name VARCHAR(255),
    client_email VARCHAR(255),
    client_phone VARCHAR(50),
    project_manager_id BIGINT,
    team_members JSON,
    deliverables JSON,
    milestones JSON,
    documents JSON,
    progress_percentage INT DEFAULT 0,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    deleted_by BIGINT DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_manager_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_projects_user (user_id, status),
    INDEX idx_user_projects_client (client_name),
    INDEX idx_user_projects_status (status, priority),
    INDEX idx_user_projects_dates (start_date, end_date),
    INDEX idx_user_projects_active (is_active, deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: project_tasks (user_projects version)
-- =============================================
CREATE TABLE IF NOT EXISTS project_tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    task_name VARCHAR(255) NOT NULL,
    task_description TEXT,
    assigned_to BIGINT,
    status ENUM('not_started', 'in_progress', 'completed', 'blocked', 'cancelled') DEFAULT 'not_started',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    due_date DATETIME,
    completed_at TIMESTAMP NULL DEFAULT NULL,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    dependencies JSON,
    attachments JSON,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    deleted_by BIGINT DEFAULT NULL,
    FOREIGN KEY (project_id) REFERENCES user_projects(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_project_tasks_project (project_id, status),
    INDEX idx_project_tasks_assigned (assigned_to, status),
    INDEX idx_project_tasks_due (due_date, status),
    INDEX idx_project_tasks_priority (priority, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: project_documents (user_projects version)
-- =============================================
CREATE TABLE IF NOT EXISTS project_documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    document_type ENUM('contract', 'proposal', 'report', 'invoice', 'image', 'video', 'document', 'other') DEFAULT 'document',
    file_path VARCHAR(512),
    file_size BIGINT,
    mime_type VARCHAR(100),
    uploaded_by BIGINT,
    is_public BOOLEAN DEFAULT FALSE,
    download_count INT DEFAULT 0,
    last_downloaded_at TIMESTAMP NULL DEFAULT NULL,
    description TEXT,
    tags JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    deleted_by BIGINT DEFAULT NULL,
    FOREIGN KEY (project_id) REFERENCES user_projects(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_project_documents_project (project_id, document_type),
    INDEX idx_project_documents_public (is_public, document_type),
    INDEX idx_project_documents_uploaded (uploaded_by, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: client_project_summary
-- =============================================
CREATE TABLE IF NOT EXISTS client_project_summary (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    total_projects INT DEFAULT 0,
    active_projects INT DEFAULT 0,
    completed_projects INT DEFAULT 0,
    total_budget DECIMAL(15,2) DEFAULT 0,
    total_spent DECIMAL(15,2) DEFAULT 0,
    average_project_duration INT DEFAULT 0,
    last_project_date TIMESTAMP NULL DEFAULT NULL,
    client_rating DECIMAL(3,2) DEFAULT 0,
    notes TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_client_summary_user (user_id),
    INDEX idx_client_summary_active (active_projects),
    INDEX idx_client_summary_updated (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: user_feedback
-- =============================================
CREATE TABLE IF NOT EXISTS user_feedback (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NULL,
    user_id BIGINT,
    feedback_type ENUM('project_review', 'service_feedback', 'complaint', 'suggestion', 'testimonial', 'bug_report') DEFAULT 'project_review',
    rating INT CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    message TEXT NOT NULL,
    status ENUM('new', 'reviewed', 'responded', 'resolved', 'closed') DEFAULT 'new',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    admin_response TEXT,
    responded_by BIGINT NULL,
    responded_at TIMESTAMP NULL,
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    source ENUM('website', 'email', 'phone', 'in_person', 'social_media') DEFAULT 'website',
    ip_address VARCHAR(45),
    user_agent TEXT,
    attachment_url VARCHAR(512),
    attachment_type VARCHAR(100),
    internal_notes TEXT,
    assigned_to BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    deleted_by BIGINT DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (responded_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_feedback_user (user_id),
    INDEX idx_feedback_type (feedback_type),
    INDEX idx_feedback_status (status),
    INDEX idx_feedback_priority (priority),
    INDEX idx_feedback_rating (rating),
    INDEX idx_feedback_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: mpesa_transactions
-- =============================================
CREATE TABLE IF NOT EXISTS mpesa_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_id BIGINT NULL,
    project_id BIGINT NULL,
    transaction_id VARCHAR(100) NOT NULL UNIQUE,
    merchant_request_id VARCHAR(100),
    checkout_request_id VARCHAR(100),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'KES',
    exchange_rate DECIMAL(10,6) DEFAULT 1.000000,
    amount_kes DECIMAL(15,2) GENERATED ALWAYS AS (amount * exchange_rate) STORED,
    phone_number VARCHAR(20) NOT NULL,
    status ENUM('pending', 'completed', 'failed', 'cancelled', 'reversed') DEFAULT 'pending',
    result_code INT,
    result_desc VARCHAR(255),
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completion_time TIMESTAMP NULL,
    response_data JSON,
    payment_method ENUM('paybill', 'till_number', 'buy_goods') DEFAULT 'paybill',
    business_number VARCHAR(20) DEFAULT '174379',
    account_reference VARCHAR(255),
    client_name VARCHAR(255),
    client_email VARCHAR(255),
    reconciled BOOLEAN DEFAULT FALSE,
    reconciled_at TIMESTAMP NULL,
    reconciled_by BIGINT NULL,
    reconciliation_notes TEXT,
    is_refund BOOLEAN DEFAULT FALSE,
    original_transaction_id VARCHAR(100),
    refund_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    deleted_by BIGINT DEFAULT NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (reconciled_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_mpesa_transaction_id (transaction_id),
    INDEX idx_mpesa_status (status),
    INDEX idx_mpesa_phone (phone_number),
    INDEX idx_mpesa_date (transaction_date),
    INDEX idx_mpesa_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SECTION 3: ADMIN/CONTENT TABLES
-- =====================================================

-- =============================================
-- Table: blog_articles
-- =============================================
CREATE TABLE IF NOT EXISTS blog_articles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    excerpt TEXT,
    content LONGTEXT NOT NULL,
    author VARCHAR(100),
    read_time VARCHAR(50),
    category VARCHAR(100),
    image_url VARCHAR(512),
    image_id BIGINT,
    icon_class VARCHAR(100),
    is_published BOOLEAN DEFAULT FALSE,
    published_date TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE SET NULL,
    INDEX idx_blog_articles_published (is_published, published_date),
    INDEX idx_blog_articles_category (category),
    INDEX idx_blog_articles_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: case_studies
-- =============================================
CREATE TABLE IF NOT EXISTS case_studies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    client VARCHAR(255),
    industry VARCHAR(255),
    challenge TEXT,
    solution LONGTEXT,
    results LONGTEXT,
    duration VARCHAR(100),
    image_urls JSON,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_case_studies_featured (is_featured),
    INDEX idx_case_studies_industry (industry),
    INDEX idx_case_studies_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: videos
-- =============================================
CREATE TABLE IF NOT EXISTS videos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_blob LONGBLOB NULL DEFAULT NULL,
    video_mime_type VARCHAR(100) NULL DEFAULT NULL,
    video_file_name VARCHAR(255) NULL DEFAULT NULL,
    video_size BIGINT NULL DEFAULT NULL,
    thumbnail_blob LONGBLOB NULL DEFAULT NULL,
    thumbnail_mime_type VARCHAR(100) NULL DEFAULT NULL,
    thumbnail_file_name VARCHAR(255) NULL DEFAULT NULL,
    video_url VARCHAR(512),
    thumbnail_url VARCHAR(512),
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    deleted_by BIGINT DEFAULT NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_videos_active (is_active, display_order),
    INDEX idx_videos_featured (is_featured, display_order),
    INDEX idx_videos_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: admin_navbar_items
-- =============================================
CREATE TABLE IF NOT EXISTS admin_navbar_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    item_type ENUM('link', 'dropdown', 'button', 'separator') DEFAULT 'link',
    display_text VARCHAR(255) NOT NULL,
    url VARCHAR(512),
    icon_class VARCHAR(100),
    parent_id BIGINT NULL DEFAULT NULL,
    sort_order INT DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    target_blank BOOLEAN DEFAULT FALSE,
    css_class VARCHAR(255),
    requires_auth BOOLEAN DEFAULT FALSE,
    required_role VARCHAR(50),
    mobile_only BOOLEAN DEFAULT FALSE,
    desktop_only BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    deleted_by BIGINT DEFAULT NULL,
    FOREIGN KEY (parent_id) REFERENCES admin_navbar_items(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_admin_navbar_parent (parent_id, sort_order),
    INDEX idx_admin_navbar_visible (is_visible, is_active, sort_order),
    INDEX idx_admin_navbar_type (item_type, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: admin_website_settings
-- =============================================
CREATE TABLE IF NOT EXISTS admin_website_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(255) NOT NULL UNIQUE,
    setting_value LONGTEXT,
    setting_type ENUM('text', 'textarea', 'number', 'boolean', 'json', 'file') DEFAULT 'text',
    display_name VARCHAR(255),
    description TEXT,
    category VARCHAR(100) DEFAULT 'general',
    is_public BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    validation_rules JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by BIGINT,
    INDEX idx_admin_settings_key (setting_key),
    INDEX idx_admin_settings_category (category, sort_order),
    INDEX idx_admin_settings_public (is_public, category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: admin_activity_logs
-- =============================================
CREATE TABLE IF NOT EXISTS admin_activity_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    admin_user_id BIGINT NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    action_description TEXT,
    affected_table VARCHAR(100),
    affected_record_id BIGINT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_admin_activity_admin (admin_user_id, created_at),
    INDEX idx_admin_activity_action (action_type, created_at),
    INDEX idx_admin_activity_table (affected_table, created_at),
    INDEX idx_admin_activity_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SECTION 4: PROJECT MANAGEMENT TABLES
-- =====================================================

-- =============================================
-- Table: projects (main project management)
-- =============================================
CREATE TABLE IF NOT EXISTS projects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('active', 'completed', 'pending', 'on_hold', 'cancelled') DEFAULT 'active',
    progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    start_date DATE NOT NULL,
    expected_completion DATE NOT NULL,
    actual_completion DATE NULL,
    client_name VARCHAR(255) NOT NULL,
    client_contact VARCHAR(255),
    location VARCHAR(500),
    project_type VARCHAR(100),
    budget DECIMAL(12,2) DEFAULT 0.00,
    spent DECIMAL(12,2) DEFAULT 0.00,
    remaining DECIMAL(12,2) GENERATED ALWAYS AS (budget - spent) STORED,
    currency VARCHAR(3) DEFAULT 'USD',
    project_manager_id BIGINT,
    team_lead_id BIGINT,
    team_size INT DEFAULT 0,
    main_photo_data LONGBLOB NULL,
    main_photo_name VARCHAR(255) NULL,
    main_photo_type VARCHAR(100) NULL,
    main_photo_size BIGINT NULL,
    cover_photo_data LONGBLOB NULL,
    cover_photo_name VARCHAR(255) NULL,
    cover_photo_type VARCHAR(100) NULL,
    cover_photo_size BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT NOT NULL,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    deleted_by BIGINT DEFAULT NULL,
    INDEX idx_projects_status (status),
    INDEX idx_projects_client (client_name),
    INDEX idx_projects_manager (project_manager_id),
    INDEX idx_projects_dates (start_date, expected_completion),
    INDEX idx_projects_created (created_at),
    FOREIGN KEY (project_manager_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (team_lead_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: project_team_members
-- =============================================
CREATE TABLE IF NOT EXISTS project_team_members (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role VARCHAR(100) NOT NULL DEFAULT 'team_member',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by BIGINT NOT NULL,
    removed_at TIMESTAMP NULL DEFAULT NULL,
    removed_by BIGINT DEFAULT NULL,
    INDEX idx_project_team_project (project_id),
    INDEX idx_project_team_user (user_id),
    INDEX idx_project_team_role (role),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (removed_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_project_user (project_id, user_id, removed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: project_photos
-- =============================================
CREATE TABLE IF NOT EXISTS project_photos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    photo_data LONGBLOB NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    photo_type ENUM('main', 'cover', 'progress', 'team', 'site', 'completion', 'screenshot', 'document') DEFAULT 'progress',
    title VARCHAR(255),
    description TEXT,
    display_order INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT NOT NULL,
    INDEX idx_project_photos_project (project_id),
    INDEX idx_project_photos_type (photo_type),
    INDEX idx_project_photos_featured (is_featured),
    INDEX idx_project_photos_order (display_order),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: project_activities
-- =============================================
CREATE TABLE IF NOT EXISTS project_activities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    activity_type ENUM('update', 'milestone', 'alert', 'note', 'status_change', 'team_change', 'photo_added', 'document_uploaded') DEFAULT 'update',
    message TEXT NOT NULL,
    details JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT NOT NULL,
    INDEX idx_project_activities_project (project_id),
    INDEX idx_project_activities_user (user_id),
    INDEX idx_project_activities_type (activity_type),
    INDEX idx_project_activities_created (created_at),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: project_expenses
-- =============================================
CREATE TABLE IF NOT EXISTS project_expenses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    description VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    expense_date DATE NOT NULL,
    vendor VARCHAR(255),
    receipt_number VARCHAR(100),
    receipt_image_id BIGINT NULL,
    approved_by BIGINT,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT NOT NULL,
    INDEX idx_project_expenses_project (project_id),
    INDEX idx_project_expenses_category (category),
    INDEX idx_project_expenses_date (expense_date),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (receipt_image_id) REFERENCES images(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: project_invoices
-- =============================================
CREATE TABLE IF NOT EXISTS project_invoices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    client_name VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    amount_kes DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    currency_code VARCHAR(3) NOT NULL DEFAULT 'KES',
    exchange_rate DECIMAL(10,6) DEFAULT 1.000000,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled') DEFAULT 'draft',
    description TEXT,
    terms TEXT,
    notes TEXT,
    paid_amount DECIMAL(12,2) DEFAULT 0.00,
    paid_amount_kes DECIMAL(12,2) DEFAULT 0.00,
    paid_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT NOT NULL,
    updated_by BIGINT,
    INDEX idx_project_invoices_project (project_id),
    INDEX idx_project_invoices_number (invoice_number),
    INDEX idx_project_invoices_status (status),
    INDEX idx_project_invoices_dates (issue_date, due_date),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: project_documents (projects version)
-- =============================================
CREATE TABLE IF NOT EXISTS project_docs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT,
    category VARCHAR(100) DEFAULT 'general',
    file_path VARCHAR(512) NOT NULL,
    file_data LONGBLOB NULL,
    description TEXT,
    version VARCHAR(20) DEFAULT '1.0',
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT NOT NULL,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    deleted_by BIGINT DEFAULT NULL,
    INDEX idx_project_docs_project (project_id),
    INDEX idx_project_docs_category (category),
    INDEX idx_project_docs_type (file_type),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: project_reports
-- =============================================
CREATE TABLE IF NOT EXISTS project_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    report_type ENUM('progress', 'financial', 'inspection', 'milestone', 'final', 'custom') DEFAULT 'progress',
    content LONGTEXT,
    summary TEXT,
    file_path VARCHAR(512),
    file_data LONGBLOB,
    file_type VARCHAR(50),
    file_size BIGINT,
    report_date DATE NOT NULL,
    period_start DATE,
    period_end DATE,
    download_count INT DEFAULT 0,
    generated_by BIGINT,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    template_version VARCHAR(20) DEFAULT '1.0',
    status ENUM('draft', 'final', 'archived') DEFAULT 'draft',
    is_public BOOLEAN DEFAULT TRUE,
    export_format ENUM('pdf', 'excel', 'csv', 'json') DEFAULT 'pdf',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by BIGINT,
    INDEX idx_project_reports_project (project_id),
    INDEX idx_project_reports_type (report_type),
    INDEX idx_project_reports_date (report_date),
    INDEX idx_project_reports_status (status),
    INDEX idx_project_reports_generated (generated_at),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SECTION 5: FINANCIAL TABLES
-- =====================================================

-- =============================================
-- Table: accounting_entries
-- =============================================
CREATE TABLE IF NOT EXISTS accounting_entries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    entry_type ENUM('income', 'expense', 'budget_allocation', 'budget_adjustment', 'invoice_payment', 'refund') NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    amount DECIMAL(15,2) NOT NULL,
    tax_amount DECIMAL(15,2) DEFAULT 0.00,
    total_amount DECIMAL(15,2) GENERATED ALWAYS AS (amount + tax_amount) STORED,
    currency VARCHAR(3) DEFAULT 'USD',
    exchange_rate DECIMAL(10,6) DEFAULT 1.000000,
    amount_usd DECIMAL(15,2) GENERATED ALWAYS AS (total_amount * exchange_rate) STORED,
    transaction_date DATE NOT NULL,
    transaction_reference VARCHAR(255),
    payment_method ENUM('cash', 'bank_transfer', 'credit_card', 'debit_card', 'check', 'online_payment', 'other') DEFAULT 'bank_transfer',
    payment_status ENUM('pending', 'completed', 'failed', 'refunded', 'partially_refunded') DEFAULT 'completed',
    description TEXT NOT NULL,
    notes TEXT,
    internal_notes TEXT,
    invoice_id BIGINT NULL,
    receipt_id BIGINT NULL,
    contract_id BIGINT NULL,
    approved_by BIGINT NULL,
    approved_at TIMESTAMP NULL,
    approval_status ENUM('pending', 'approved', 'rejected', 'needs_revision') DEFAULT 'approved',
    rejection_reason TEXT,
    budget_category VARCHAR(100),
    budget_period VARCHAR(50),
    is_billable BOOLEAN DEFAULT TRUE,
    billable_percentage DECIMAL(5,2) DEFAULT 100.00,
    tax_rate DECIMAL(5,4) DEFAULT 0.0000,
    tax_exempt BOOLEAN DEFAULT FALSE,
    tax_region VARCHAR(100),
    reconciled BOOLEAN DEFAULT FALSE,
    reconciled_by BIGINT NULL,
    reconciled_at TIMESTAMP NULL,
    reconciliation_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    deleted_by BIGINT DEFAULT NULL,
    INDEX idx_accounting_project (project_id),
    INDEX idx_accounting_type (entry_type),
    INDEX idx_accounting_category (category),
    INDEX idx_accounting_date (transaction_date),
    INDEX idx_accounting_status (payment_status),
    INDEX idx_accounting_approval (approval_status),
    INDEX idx_accounting_reconciled (reconciled),
    INDEX idx_accounting_created (created_at),
    INDEX idx_accounting_budget_period (budget_period),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (reconciled_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: accounting_categories
-- =============================================
CREATE TABLE IF NOT EXISTS accounting_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    category_type ENUM('income', 'expense', 'both') DEFAULT 'expense',
    default_budget_percentage DECIMAL(5,2) DEFAULT 0.00,
    is_tax_deductible BOOLEAN DEFAULT FALSE,
    requires_approval BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    color_code VARCHAR(7) DEFAULT '#000000',
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by BIGINT,
    INDEX idx_accounting_categories_type (category_type),
    INDEX idx_accounting_categories_active (is_active),
    INDEX idx_accounting_categories_order (display_order),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: accounting_periods
-- =============================================
CREATE TABLE IF NOT EXISTS accounting_periods (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    period_name VARCHAR(100) NOT NULL,
    period_type ENUM('monthly', 'quarterly', 'yearly', 'custom') DEFAULT 'monthly',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_budget DECIMAL(15,2) DEFAULT 0.00,
    allocated_budget DECIMAL(15,2) DEFAULT 0.00,
    spent_budget DECIMAL(15,2) DEFAULT 0.00,
    remaining_budget DECIMAL(15,2) GENERATED ALWAYS AS (allocated_budget - spent_budget) STORED,
    status ENUM('planning', 'active', 'closed', 'archived') DEFAULT 'planning',
    locked BOOLEAN DEFAULT FALSE,
    description TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by BIGINT,
    INDEX idx_accounting_periods_project (project_id),
    INDEX idx_accounting_periods_dates (start_date, end_date),
    INDEX idx_accounting_periods_status (status),
    INDEX idx_accounting_periods_type (period_type),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: financial_reports
-- =============================================
CREATE TABLE IF NOT EXISTS financial_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    report_name VARCHAR(255) NOT NULL,
    report_type ENUM('profit_loss', 'balance_sheet', 'cash_flow', 'budget_variance', 'expense_breakdown', 'income_statement', 'custom') DEFAULT 'profit_loss',
    report_data LONGTEXT,
    summary TEXT,
    insights TEXT,
    report_date DATE NOT NULL,
    period_start DATE,
    period_end DATE,
    generated_by BIGINT,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    template_version VARCHAR(20) DEFAULT '1.0',
    status ENUM('draft', 'final', 'archived') DEFAULT 'draft',
    is_public BOOLEAN DEFAULT TRUE,
    shared_with JSON,
    download_count INT DEFAULT 0,
    last_downloaded_at TIMESTAMP NULL,
    export_format ENUM('pdf', 'excel', 'csv', 'json') DEFAULT 'pdf',
    file_path VARCHAR(512),
    file_size BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by BIGINT,
    INDEX idx_financial_reports_project (project_id),
    INDEX idx_financial_reports_type (report_type),
    INDEX idx_financial_reports_date (report_date),
    INDEX idx_financial_reports_status (status),
    INDEX idx_financial_reports_generated (generated_at),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: invoices
-- =============================================
CREATE TABLE IF NOT EXISTS invoices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    client_id BIGINT,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    invoice_type ENUM('project_fee', 'milestone', 'expense', 'retainer', 'custom') DEFAULT 'project_fee',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    tax_rate DECIMAL(5,4) DEFAULT 0.0000,
    tax_amount DECIMAL(15,2) GENERATED ALWAYS AS (subtotal * tax_rate) STORED,
    total_amount DECIMAL(15,2) GENERATED ALWAYS AS (subtotal + tax_amount) STORED,
    currency VARCHAR(3) DEFAULT 'KES',
    exchange_rate DECIMAL(10,6) DEFAULT 1.000000,
    total_amount_kes DECIMAL(15,2) GENERATED ALWAYS AS (total_amount * exchange_rate) STORED,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE NULL,
    status ENUM('draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled') DEFAULT 'draft',
    payment_status ENUM('pending', 'partial', 'paid', 'failed') DEFAULT 'pending',
    payment_method ENUM('mpesa', 'bank_transfer', 'cash', 'check', 'online_payment', 'other') DEFAULT 'mpesa',
    payment_phone VARCHAR(20) DEFAULT '+254799789956',
    payment_reference VARCHAR(255),
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255),
    client_phone VARCHAR(20),
    client_address TEXT,
    items JSON,
    notes TEXT,
    payment_terms TEXT,
    terms_conditions TEXT,
    pdf_file_path VARCHAR(512),
    pdf_generated BOOLEAN DEFAULT FALSE,
    pdf_generated_at TIMESTAMP NULL,
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP NULL,
    email_opened BOOLEAN DEFAULT FALSE,
    email_opened_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    deleted_by BIGINT DEFAULT NULL,
    INDEX idx_invoices_project (project_id),
    INDEX idx_invoices_client (client_id),
    INDEX idx_invoices_number (invoice_number),
    INDEX idx_invoices_status (status),
    INDEX idx_invoices_payment_status (payment_status),
    INDEX idx_invoices_dates (issue_date, due_date),
    INDEX idx_invoices_created (created_at),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: quotes
-- =============================================
CREATE TABLE IF NOT EXISTS quotes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NULL,
    client_id BIGINT NULL,
    quote_number VARCHAR(50) NOT NULL UNIQUE,
    quote_type ENUM('project_estimate', 'service_quote', 'product_quote', 'consultation', 'custom') DEFAULT 'project_estimate',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    tax_rate DECIMAL(5,4) DEFAULT 0.0000,
    tax_amount DECIMAL(15,2) GENERATED ALWAYS AS (subtotal * tax_rate) STORED,
    total_amount DECIMAL(15,2) GENERATED ALWAYS AS (subtotal + tax_amount) STORED,
    currency VARCHAR(3) DEFAULT 'KES',
    exchange_rate DECIMAL(10,6) DEFAULT 1.000000,
    total_amount_kes DECIMAL(15,2) GENERATED ALWAYS AS (total_amount * exchange_rate) STORED,
    issue_date DATE NOT NULL,
    valid_until DATE NOT NULL,
    accepted_date DATE NULL,
    rejected_date DATE NULL,
    status ENUM('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'converted') DEFAULT 'draft',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    approved_by BIGINT NULL,
    approved_at TIMESTAMP NULL,
    approval_status ENUM('pending', 'approved', 'rejected', 'needs_revision') DEFAULT 'approved',
    rejection_reason TEXT,
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255),
    client_phone VARCHAR(20),
    client_address TEXT,
    client_company VARCHAR(255),
    items JSON,
    notes TEXT,
    payment_terms TEXT,
    terms_conditions TEXT,
    delivery_timeline TEXT,
    converted_to_invoice_id BIGINT NULL,
    converted_at TIMESTAMP NULL,
    conversion_notes TEXT,
    pdf_file_path VARCHAR(512),
    pdf_generated BOOLEAN DEFAULT FALSE,
    pdf_generated_at TIMESTAMP NULL,
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP NULL,
    email_opened BOOLEAN DEFAULT FALSE,
    email_opened_at TIMESTAMP NULL,
    follow_up_required BOOLEAN DEFAULT TRUE,
    follow_up_date DATE NULL,
    follow_up_count INT DEFAULT 0,
    last_follow_up_at TIMESTAMP NULL,
    discount_type ENUM('percentage', 'fixed', 'none') DEFAULT 'none',
    discount_value DECIMAL(15,2) DEFAULT 0.00,
    discount_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    deleted_by BIGINT DEFAULT NULL,
    INDEX idx_quotes_project (project_id),
    INDEX idx_quotes_client (client_id),
    INDEX idx_quotes_number (quote_number),
    INDEX idx_quotes_status (status),
    INDEX idx_quotes_priority (priority),
    INDEX idx_quotes_dates (issue_date, valid_until),
    INDEX idx_quotes_created (created_at),
    INDEX idx_quotes_follow_up (follow_up_date),
    INDEX idx_quotes_conversion (converted_to_invoice_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (converted_to_invoice_id) REFERENCES invoices(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: quote_items
-- =============================================
CREATE TABLE IF NOT EXISTS quote_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    quote_id BIGINT NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    item_description TEXT,
    item_type ENUM('service', 'product', 'labor', 'material', 'fee', 'custom') DEFAULT 'service',
    unit_price DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1.00,
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    line_total DECIMAL(15,2) GENERATED ALWAYS AS (unit_price * quantity * (1 - discount_percentage/100)) STORED,
    unit VARCHAR(50) DEFAULT 'unit',
    sku VARCHAR(100),
    category VARCHAR(100),
    notes TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by BIGINT,
    INDEX idx_quote_items_quote (quote_id),
    INDEX idx_quote_items_category (category),
    INDEX idx_quote_items_order (display_order),
    FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: quote_activities
-- =============================================
CREATE TABLE IF NOT EXISTS quote_activities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    quote_id BIGINT NOT NULL,
    activity_type ENUM('created', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'converted', 'follow_up', 'modified') NOT NULL,
    description TEXT NOT NULL,
    user_id BIGINT NULL,
    user_type ENUM('client', 'admin', 'system') DEFAULT 'system',
    activity_data JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_quote_activities_quote (quote_id),
    INDEX idx_quote_activities_type (activity_type),
    INDEX idx_quote_activities_user (user_id),
    INDEX idx_quote_activities_created (created_at),
    FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SECTION 6: DEFAULT DATA INSERTS
-- =====================================================

-- Insert default navbar items
INSERT INTO admin_navbar_items (item_name, item_type, display_text, url, sort_order, is_visible) VALUES
('home', 'link', 'Home', '/', 1, TRUE),
('about', 'link', 'About Us', '/about', 2, TRUE),
('services', 'link', 'Our Services', '/services', 3, TRUE),
('projects', 'link', 'Projects & Activities', '/projects', 4, TRUE),
('companies', 'dropdown', 'Subsidiaries', '#', 5, TRUE),
('case_studies', 'link', 'Case Studies', '/case-studies', 6, TRUE),
('blog', 'link', 'Blog', '/blog', 7, TRUE),
('contact', 'link', 'Contact', '/contact', 8, TRUE);

-- Insert default website settings
INSERT INTO admin_website_settings (setting_key, setting_value, setting_type, display_name, description, category, is_public) VALUES
('site_title', 'The Greggory Foundation', 'text', 'Site Title', 'Main title of the website', 'general', TRUE),
('site_description', 'Strategic Project Development for all clients. Your Vision Delivered with Trust.', 'textarea', 'Site Description', 'Meta description for SEO', 'general', TRUE),
('contact_email', 'brianmwanza651@gmail.com', 'text', 'Contact Email', 'Main contact email address', 'contact', TRUE),
('contact_phone', '+254799789956', 'text', 'Contact Phone', 'Main contact phone number', 'contact', TRUE),
('company_address', 'rafiki kabarak, kabarak', 'textarea', 'Company Address', 'Physical office address', 'contact', TRUE),
('maintenance_mode', 'false', 'boolean', 'Maintenance Mode', 'Put site in maintenance mode', 'system', FALSE),
('allow_registration', 'true', 'boolean', 'Allow Registration', 'Enable user registration', 'auth', FALSE);

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
SELECT 'Complete database schema created successfully with all tables!' as message;
