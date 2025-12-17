-- ====================================================================
-- BARAKA HOUSING AGENCY - Property Management Database Schema
-- Comprehensive Property Management System
-- ====================================================================
-- This schema supports property management operations including:
-- - Property and building management
-- - Unit/room management
-- - Tenant and lease management
-- - Rental applications and screening
-- - Payment processing and accounting
-- - Maintenance and work orders
-- - Vendor and expense management
-- - Document storage and management
-- - Online tenant portal
-- - Reporting and analytics
-- ====================================================================

-- Create database with proper character set and collation
CREATE DATABASE IF NOT EXISTS baraka_housing_agency 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE baraka_housing_agency;

-- ====================================================================
-- SECTION 1: ENUMERATION TABLES (Lookup Data)
-- ====================================================================

-- Property types
CREATE TABLE IF NOT EXISTS property_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_class VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
) ENGINE=InnoDB;

-- Amenity types
CREATE TABLE IF NOT EXISTS amenity_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_class VARCHAR(100),
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
) ENGINE=InnoDB;

-- Document types
CREATE TABLE IF NOT EXISTS document_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_required BOOLEAN DEFAULT FALSE,
    is_tenant_document BOOLEAN DEFAULT FALSE,
    is_property_document BOOLEAN DEFAULT FALSE,
    is_lease_document BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
) ENGINE=InnoDB;

-- Payment methods
CREATE TABLE IF NOT EXISTS payment_methods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    requires_processing BOOLEAN DEFAULT FALSE,
    processing_fee_percentage DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
) ENGINE=InnoDB;

-- Maintenance categories
CREATE TABLE IF NOT EXISTS maintenance_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    response_time_hours INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
) ENGINE=InnoDB;

-- Lease statuses
CREATE TABLE IF NOT EXISTS lease_statuses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
) ENGINE=InnoDB;

-- ====================================================================
-- SECTION 2: CORE TABLES
-- ====================================================================

-- Companies/Management Companies
CREATE TABLE IF NOT EXISTS companies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    registration_number VARCHAR(100),
    tax_id VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    logo_url VARCHAR(512),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state_province VARCHAR(100),
    postal_code VARCHAR(50),
    country VARCHAR(100),
    bank_name VARCHAR(255),
    bank_account_number VARCHAR(100),
    bank_routing_number VARCHAR(100),
    currency VARCHAR(3) DEFAULT 'KES',
    timezone VARCHAR(50) DEFAULT 'Africa/Nairobi',
    date_format VARCHAR(20) DEFAULT 'd/m/Y',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL,
    deleted_by BIGINT,
    INDEX idx_company_active (is_active)
) ENGINE=InnoDB;

-- Users (for system access)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(50),
    profile_image_url VARCHAR(512),
    last_login_at TIMESTAMP NULL,
    last_login_ip VARCHAR(45),
    email_verified_at TIMESTAMP NULL,
    phone_verified_at TIMESTAMP NULL,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    two_factor_recovery_codes TEXT,
    remember_token VARCHAR(100),
    password_reset_token VARCHAR(100),
    password_reset_sent_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    must_change_password BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL,
    deleted_by BIGINT,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_user_company (company_id, is_active),
    INDEX idx_user_email (email),
    INDEX idx_user_username (username)
) ENGINE=InnoDB;

-- User roles
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_company (company_id, name)
) ENGINE=InnoDB;

-- User role assignments
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by BIGINT,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Permissions
CREATE TABLE IF NOT EXISTS permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100),
    description TEXT,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_permission_name (name)
) ENGINE=InnoDB;

-- Role permissions
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- User permissions (direct assignments that override role permissions)
CREATE TABLE IF NOT EXISTS user_permissions (
    user_id BIGINT NOT NULL,
    permission_id INT NOT NULL,
    is_granted BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    PRIMARY KEY (user_id, permission_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- User sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(100) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    payload TEXT,
    last_activity TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_sessions_user (user_id),
    INDEX idx_user_sessions_expires (expires_at)
) ENGINE=InnoDB;
-- ====================================================================
-- SECTION 3: PROPERTY MANAGEMENT
-- ====================================================================

-- Properties
CREATE TABLE IF NOT EXISTS properties (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL,
    property_type_id INT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    year_built YEAR,
    total_units INT DEFAULT 0,
    available_units INT DEFAULT 0,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state_province VARCHAR(100),
    postal_code VARCHAR(50),
    country VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    property_size_sqft DECIMAL(10, 2),
    property_size_sqm DECIMAL(10, 2),
    parking_spaces INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL,
    deleted_by BIGINT,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (property_type_id) REFERENCES property_types(id) ON DELETE SET NULL,
    INDEX idx_property_location (city, country, is_active),
    INDEX idx_property_company (company_id, is_active)
) ENGINE=InnoDB;

-- Property Images
CREATE TABLE IF NOT EXISTS property_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    property_id BIGINT NOT NULL,
    image_url VARCHAR(512) NOT NULL,
    thumbnail_url VARCHAR(512),
    is_primary BOOLEAN DEFAULT FALSE,
    caption VARCHAR(255),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    INDEX idx_property_image (property_id, is_primary, sort_order)
) ENGINE=InnoDB;

-- Property Amenities
CREATE TABLE IF NOT EXISTS property_amenities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    property_id BIGINT NOT NULL,
    amenity_id INT NOT NULL,
    description TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES amenity_types(id) ON DELETE CASCADE,
    UNIQUE KEY unique_property_amenity (property_id, amenity_id)
) ENGINE=InnoDB;

-- Property Documents
CREATE TABLE IF NOT EXISTS property_documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    property_id BIGINT NOT NULL,
    document_type_id INT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(512) NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    is_public BOOLEAN DEFAULT FALSE,
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL,
    deleted_by BIGINT,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (document_type_id) REFERENCES document_types(id) ON DELETE SET NULL,
    INDEX idx_property_document (property_id, document_type_id)
) ENGINE=InnoDB;

-- Property Notes
CREATE TABLE IF NOT EXISTS property_notes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    property_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    note TEXT NOT NULL,
    is_important BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL,
    deleted_by BIGINT,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_property_note (property_id, is_important, created_at)
) ENGINE=InnoDB;

-- Property Contacts
CREATE TABLE IF NOT EXISTS property_contacts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    property_id BIGINT NOT NULL,
    contact_type ENUM('owner', 'manager', 'contractor', 'other') NOT NULL,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    notes TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL,
    deleted_by BIGINT,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    INDEX idx_property_contact (property_id, contact_type, is_primary)
) ENGINE=InnoDB;

-- ====================================================================
-- SECTION 4: UNITS AND FLOOR PLANS
-- ====================================================================

-- Unit Types
CREATE TABLE IF NOT EXISTS unit_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    bedrooms INT,
    bathrooms DECIMAL(3, 1),
    size_sqft DECIMAL(10, 2),
    size_sqm DECIMAL(10, 2),
    base_rent_amount DECIMAL(15, 2),
    deposit_amount DECIMAL(15, 2),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL,
    deleted_by BIGINT,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    INDEX idx_unit_type_company (company_id, is_active)
) ENGINE=InnoDB;

-- Units
CREATE TABLE IF NOT EXISTS units (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL,
    property_id BIGINT NOT NULL,
    unit_type_id INT,
    unit_number VARCHAR(50) NOT NULL,
    floor_number VARCHAR(20),
    floor_name VARCHAR(50),
    bedrooms INT,
    bathrooms DECIMAL(3, 1),
    size_sqft DECIMAL(10, 2),
    size_sqm DECIMAL(10, 2),
    market_rent_amount DECIMAL(15, 2),
    deposit_amount DECIMAL(15, 2),
    status ENUM('vacant', 'occupied', 'maintenance', 'reserved') DEFAULT 'vacant',
    is_rent_ready BOOLEAN DEFAULT TRUE,
    is_rented BOOLEAN DEFAULT FALSE,
    is_leased BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT TRUE,
    available_date DATE,
    notes TEXT,
    floor_plan_url VARCHAR(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL,
    deleted_by BIGINT,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_type_id) REFERENCES unit_types(id) ON DELETE SET NULL,
    UNIQUE KEY unique_unit_property (property_id, unit_number),
    INDEX idx_unit_property (property_id, status, is_available),
    INDEX idx_unit_availability (status, is_available, available_date)
) ENGINE=InnoDB;

-- Unit Amenities
CREATE TABLE IF NOT EXISTS unit_amenities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    unit_id BIGINT NOT NULL,
    amenity_id INT NOT NULL,
    description TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES amenity_types(id) ON DELETE CASCADE,
    UNIQUE KEY unique_unit_amenity (unit_id, amenity_id)
) ENGINE=InnoDB;

-- Unit Images
CREATE TABLE IF NOT EXISTS unit_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    unit_id BIGINT NOT NULL,
    image_url VARCHAR(512) NOT NULL,
    thumbnail_url VARCHAR(512),
    is_primary BOOLEAN DEFAULT FALSE,
    caption VARCHAR(255),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,
    INDEX idx_unit_image (unit_id, is_primary, sort_order)
) ENGINE=InnoDB;

-- Unit Documents
CREATE TABLE IF NOT EXISTS unit_documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    unit_id BIGINT NOT NULL,
    document_type_id INT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(512) NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    is_public BOOLEAN DEFAULT FALSE,
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL,
    deleted_by BIGINT,
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,
    FOREIGN KEY (document_type_id) REFERENCES document_types(id) ON DELETE SET NULL,
    INDEX idx_unit_document (unit_id, document_type_id)
) ENGINE=InnoDB;
-- ====================================================================
-- SECTION 5: TENANT MANAGEMENT
-- ====================================================================

-- Tenants
CREATE TABLE IF NOT EXISTS tenants (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL,
    user_id BIGINT, -- Link to user account if they have one
    tenant_id_number VARCHAR(50) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other', 'prefer_not_to_say'),
    marital_status ENUM('single', 'married', 'divorced', 'widowed', 'separated'),
    id_type ENUM('national_id', 'passport', 'driving_license', 'other') DEFAULT 'national_id',
    id_number VARCHAR(100),
    id_issue_date DATE,
    id_expiry_date DATE,
    tax_id_number VARCHAR(100),
    phone_primary VARCHAR(50) NOT NULL,
    phone_secondary VARCHAR(50),
    email_primary VARCHAR(255),
    email_secondary VARCHAR(255),
    profile_image_url VARCHAR(512),
    preferred_contact_method ENUM('phone', 'email', 'sms', 'whatsapp') DEFAULT 'phone',
    preferred_language VARCHAR(10) DEFAULT 'en',
    is_smoker BOOLEAN DEFAULT FALSE,
    has_pets BOOLEAN DEFAULT FALSE,
    pets_description TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_blacklisted BOOLEAN DEFAULT FALSE,
    blacklist_reason TEXT,
    blacklisted_at TIMESTAMP NULL,
    blacklisted_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL,
    deleted_by BIGINT,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (blacklisted_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_tenant_name (last_name, first_name),
    INDEX idx_tenant_contact (phone_primary, email_primary),
    INDEX idx_tenant_active (is_active, is_blacklisted)
) ENGINE=InnoDB;

-- Tenant Addresses
CREATE TABLE IF NOT EXISTS tenant_addresses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    address_type ENUM('permanent', 'billing', 'shipping', 'previous', 'other') DEFAULT 'permanent',
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state_province VARCHAR(100),
    postal_code VARCHAR(50),
    country VARCHAR(100) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    INDEX idx_tenant_address (tenant_id, address_type, is_primary)
) ENGINE=InnoDB;

-- Tenant Employment
CREATE TABLE IF NOT EXISTS tenant_employment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    employer_name VARCHAR(255) NOT NULL,
    job_title VARCHAR(255),
    department VARCHAR(255),
    employment_type ENUM('full_time', 'part_time', 'contract', 'self_employed', 'unemployed', 'retired', 'student') NOT NULL,
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT TRUE,
    monthly_income DECIMAL(15, 2),
    income_currency VARCHAR(3) DEFAULT 'KES',
    phone VARCHAR(50),
    email VARCHAR(255),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state_province VARCHAR(100),
    postal_code VARCHAR(50),
    country VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP NULL,
    verified_by BIGINT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL,
    deleted_by BIGINT,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_tenant_employment (tenant_id, is_current, employer_name)
) ENGINE=InnoDB;

-- Tenant References
CREATE TABLE IF NOT EXISTS tenant_references (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    reference_type ENUM('personal', 'professional', 'landlord') NOT NULL,
    name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100),
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state_province VARCHAR(100),
    postal_code VARCHAR(50),
    country VARCHAR(100),
    years_known INT,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP NULL,
    verified_by BIGINT,
    verification_notes TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL,
    deleted_by BIGINT,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_tenant_reference (tenant_id, reference_type, is_verified)
) ENGINE=InnoDB;

-- Tenant Documents
CREATE TABLE IF NOT EXISTS tenant_documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    document_type_id INT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(512) NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    issue_date DATE,
    expiry_date DATE,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP NULL,
    verified_by BIGINT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL,
    deleted_by BIGINT,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (document_type_id) REFERENCES document_types(id) ON DELETE SET NULL,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_tenant_document (tenant_id, document_type_id, expiry_date)
) ENGINE=InnoDB;

-- Tenant Notes
CREATE TABLE IF NOT EXISTS tenant_notes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    note TEXT NOT NULL,
    is_important BOOLEAN DEFAULT FALSE,
    is_private BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL,
    deleted_by BIGINT,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_tenant_note (tenant_id, is_important, created_at)
) ENGINE=InnoDB;

-- ====================================================================
-- SECTION 6: LEASE MANAGEMENT
-- ====================================================================

-- Leases
CREATE TABLE IF NOT EXISTS leases (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL,
    property_id BIGINT NOT NULL,
    unit_id BIGINT NOT NULL,
    lease_number VARCHAR(50) UNIQUE,
    lease_type ENUM('fixed', 'month_to_month', 'week_to_week', 'other') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    move_in_date DATE,
    move_out_date DATE,
    status ENUM('draft', 'pending', 'active', 'expired', 'terminated', 'cancelled') DEFAULT 'draft',
    monthly_rent_amount DECIMAL(15, 2) NOT NULL,
    security_deposit_amount DECIMAL(15, 2) NOT NULL,
    security_deposit_paid DECIMAL(15, 2) DEFAULT 0,
    security_deposit_refundable BOOLEAN DEFAULT TRUE,
    security_deposit_refunded_amount DECIMAL(15, 2) DEFAULT 0,
    security_deposit_refund_date DATE,
    security_deposit_refund_notes TEXT,
    rent_due_day TINYINT NOT NULL DEFAULT 1,
    late_fee_type ENUM('percentage', 'fixed', 'daily') DEFAULT 'fixed',
    late_fee_amount DECIMAL(10, 2) DEFAULT 0,
    late_fee_percentage DECIMAL(5, 2) DEFAULT 0,
    late_fee_grace_days TINYINT DEFAULT 5,
    late_fee_frequency ENUM('per_occurrence', 'daily', 'weekly', 'monthly') DEFAULT 'per_occurrence',
    late_fee_max_amount DECIMAL(15, 2),
    is_auto_late_fee BOOLEAN DEFAULT TRUE,
    is_notify_late_fee BOOLEAN DEFAULT TRUE,
    lease_document_url VARCHAR(512),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL,
    deleted_by BIGINT,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,
    INDEX idx_lease_dates (start_date, end_date, status),
    INDEX idx_lease_property_unit (property_id, unit_id, status)
) ENGINE=InnoDB;

-- Lease Tenants (for multiple tenants per lease)
CREATE TABLE IF NOT EXISTS lease_tenants (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lease_id BIGINT NOT NULL,
    tenant_id BIGINT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    is_guarantor BOOLEAN DEFAULT FALSE,
    move_in_date DATE,
    move_out_date DATE,
    status ENUM('active', 'inactive', 'moved_out') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL,
    deleted_by BIGINT,
    FOREIGN KEY (lease_id) REFERENCES leases(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE KEY unique_lease_tenant (lease_id, tenant_id),
    INDEX idx_lease_tenant (lease_id, tenant_id, status)
) ENGINE=InnoDB;

-- Lease Terms
CREATE TABLE IF NOT EXISTS lease_terms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lease_id BIGINT NOT NULL,
    term_name VARCHAR(100) NOT NULL,
    term_value TEXT NOT NULL,
    is_system_term BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    FOREIGN KEY (lease_id) REFERENCES leases(id) ON DELETE CASCADE,
    INDEX idx_lease_terms (lease_id, term_name)
) ENGINE=InnoDB;

-- Lease Documents
CREATE TABLE IF NOT EXISTS lease_documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lease_id BIGINT NOT NULL,
    document_type_id INT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(512) NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    is_required BOOLEAN DEFAULT FALSE,
    is_signed BOOLEAN DEFAULT FALSE,
    signed_at TIMESTAMP NULL,
    signed_by BIGINT,
    signed_ip VARCHAR(45),
    signature_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL,
    deleted_by BIGINT,
    FOREIGN KEY (lease_id) REFERENCES leases(id) ON DELETE CASCADE,
    FOREIGN KEY (document_type_id) REFERENCES document_types(id) ON DELETE SET NULL,
    FOREIGN KEY (signed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_lease_document (lease_id, document_type_id, is_signed)
) ENGINE=InnoDB;

-- Lease Payments
CREATE TABLE IF NOT EXISTS lease_payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lease_id BIGINT NOT NULL,
    payment_id BIGINT, -- Will be set when payment is recorded
    amount_due DECIMAL(15, 2) NOT NULL,
    amount_paid DECIMAL(15, 2) DEFAULT 0,
    due_date DATE NOT NULL,
    status ENUM('pending', 'partial', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
    is_recurring BOOLEAN DEFAULT TRUE,
    recurring_frequency ENUM('weekly', 'biweekly', 'monthly', 'quarterly', 'annually') DEFAULT 'monthly',
    is_late_fee_applied BOOLEAN DEFAULT FALSE,
    late_fee_amount DECIMAL(15, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL,
    deleted_by BIGINT,
    FOREIGN KEY (lease_id) REFERENCES leases(id) ON DELETE CASCADE,
    INDEX idx_lease_payment (lease_id, due_date, status)
) ENGINE=InnoDB;

-- Lease Payment Items
CREATE TABLE IF NOT EXISTS lease_payment_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lease_payment_id BIGINT NOT NULL,
    charge_type ENUM('rent', 'deposit', 'utility', 'maintenance', 'late_fee', 'other') NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    tax_amount DECIMAL(15, 2) DEFAULT 0,
    is_taxable BOOLEAN DEFAULT FALSE,
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    is_recurring BOOLEAN DEFAULT FALSE,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL,
    deleted_by BIGINT,
    FOREIGN KEY (lease_payment_id) REFERENCES lease_payments(id) ON DELETE CASCADE,
    INDEX idx_lease_payment_item (lease_payment_id, charge_type)
) ENGINE=InnoDB;

-- Lease Notes
CREATE TABLE IF NOT EXISTS lease_notes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lease_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    note TEXT NOT NULL,
    is_important BOOLEAN DEFAULT FALSE,
    is_private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL,
    deleted_by BIGINT,
    FOREIGN KEY (lease_id) REFERENCES leases(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_lease_note (lease_id, is_important, created_at)
) ENGINE=InnoDB;
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO app_status_enum (name) VALUES
('pending'),
('approved'),
('rejected')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ====================================================================
-- SECTION 7: MAINTENANCE MANAGEMENT
-- ====================================================================

-- Maintenance Categories
CREATE TABLE IF NOT EXISTS maintenance_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_class VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL,
    deleted_by BIGINT,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE KEY unique_category_company (company_id, name),
    INDEX idx_maintenance_category_active (company_id, is_active)
) ENGINE=InnoDB;

-- Maintenance Priorities
CREATE TABLE IF NOT EXISTS maintenance_priorities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    color_code VARCHAR(20),
    response_time_hours INT,
    resolution_time_hours INT,
    is_default BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    UNIQUE KEY unique_priority_name (name)
) ENGINE=InnoDB;

-- Maintenance Requests
CREATE TABLE IF NOT EXISTS maintenance_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL,
    property_id BIGINT NOT NULL,
    unit_id BIGINT,
    tenant_id BIGINT,
    category_id INT,
    priority_id INT,
    assigned_to_user_id BIGINT,
    assigned_to_vendor_id BIGINT,
    request_number VARCHAR(50) UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('pending', 'assigned', 'in_progress', 'on_hold', 'completed', 'cancelled') DEFAULT 'pending',
    is_emergency BOOLEAN DEFAULT FALSE,
    is_tenant_accessible BOOLEAN DEFAULT TRUE,
    preferred_date DATE,
    preferred_time VARCHAR(50),
    actual_start_date DATETIME,
    actual_end_date DATETIME,
    estimated_hours DECIMAL(10, 2),
    actual_hours_spent DECIMAL(10, 2),
    cost_estimate DECIMAL(15, 2),
    actual_cost DECIMAL(15, 2),
    payment_status ENUM('unpaid', 'partially_paid', 'paid', 'waived') DEFAULT 'unpaid',
    payment_notes TEXT,
    resolution_notes TEXT,
    satisfaction_rating TINYINT,
    satisfaction_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL,
    deleted_by BIGINT,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES maintenance_categories(id) ON DELETE SET NULL,
    FOREIGN KEY (priority_id) REFERENCES maintenance_priorities(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to_vendor_id) REFERENCES vendors(id) ON DELETE SET NULL,
    INDEX idx_maintenance_request_status (status, is_emergency),
    INDEX idx_maintenance_request_dates (preferred_date, actual_start_date, actual_end_date),
    INDEX idx_maintenance_request_assignment (assigned_to_user_id, assigned_to_vendor_id)
) ENGINE=InnoDB;

-- Maintenance Request Images
CREATE TABLE IF NOT EXISTS maintenance_request_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    maintenance_request_id BIGINT NOT NULL,
    image_url VARCHAR(512) NOT NULL,
    thumbnail_url VARCHAR(512),
    is_before_image BOOLEAN DEFAULT TRUE,
    caption VARCHAR(255),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    FOREIGN KEY (maintenance_request_id) REFERENCES maintenance_requests(id) ON DELETE CASCADE,
    INDEX idx_maintenance_image (maintenance_request_id, is_before_image, sort_order)
) ENGINE=InnoDB;

-- Maintenance Request Notes
CREATE TABLE IF NOT EXISTS maintenance_request_notes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    maintenance_request_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    note TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL,
    deleted_by BIGINT,
    FOREIGN KEY (maintenance_request_id) REFERENCES maintenance_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_maintenance_note (maintenance_request_id, created_at)
) ENGINE=InnoDB;

-- Maintenance Request Tasks
CREATE TABLE IF NOT EXISTS maintenance_request_tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    maintenance_request_id BIGINT NOT NULL,
    task_description TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    completed_by BIGINT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL,
    deleted_by BIGINT,
    FOREIGN KEY (maintenance_request_id) REFERENCES maintenance_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (completed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_maintenance_task (maintenance_request_id, is_completed, sort_order)
) ENGINE=InnoDB;

-- Maintenance Request Costs
CREATE TABLE IF NOT EXISTS maintenance_request_costs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    maintenance_request_id BIGINT NOT NULL,
    cost_type ENUM('labor', 'material', 'equipment', 'other') NOT NULL,
    description VARCHAR(255) NOT NULL,
    quantity DECIMAL(10, 2) DEFAULT 1,
    unit_cost DECIMAL(15, 2) NOT NULL,
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    tax_amount DECIMAL(15, 2) DEFAULT 0,
    total_amount DECIMAL(15, 2) GENERATED ALWAYS AS (quantity * unit_cost * (1 + COALESCE(tax_rate, 0) / 100)) STORED,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL,
    deleted_by BIGINT,
    FOREIGN KEY (maintenance_request_id) REFERENCES maintenance_requests(id) ON DELETE CASCADE,
    INDEX idx_maintenance_cost (maintenance_request_id, cost_type)
) ENGINE=InnoDB;

-- ====================================================================
-- SECTION 8: VENDOR MANAGEMENT
-- ====================================================================

-- Vendor Types
CREATE TABLE IF NOT EXISTS vendor_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL,
    deleted_by BIGINT,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    UNIQUE KEY unique_vendor_type_company (company_id, name),
    INDEX idx_vendor_type_active (company_id, is_active)
) ENGINE=InnoDB;

-- Vendors
CREATE TABLE IF NOT EXISTS vendors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL,
    vendor_type_id INT,
    business_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    contact_title VARCHAR(100),
    tax_id_number VARCHAR(100),
    business_registration_number VARCHAR(100),
    year_established YEAR,
    website_url VARCHAR(255),
    primary_phone VARCHAR(50) NOT NULL,
    secondary_phone VARCHAR(50),
    primary_email VARCHAR(255),
    secondary_email VARCHAR(255),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state_province VARCHAR(100),
    postal_code VARCHAR(50),
    country VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    service_area_radius_km DECIMAL(10, 2),
    is_approved BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_blacklisted BOOLEAN DEFAULT FALSE,
    blacklist_reason TEXT,
    blacklisted_at TIMESTAMP NULL,
    blacklisted_by BIGINT,
    rating DECIMAL(3, 2) DEFAULT 0,
    total_ratings INT DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL,
    deleted_by BIGINT,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (vendor_type_id) REFERENCES vendor_types(id) ON DELETE SET NULL,
    FOREIGN KEY (blacklisted_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_vendor_search (business_name, city, is_active, is_approved),
    INDEX idx_vendor_location (city, country, is_active)
) ENGINE=InnoDB;

-- Vendor Services
CREATE TABLE IF NOT EXISTS vendor_services (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vendor_id BIGINT NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    description TEXT,
    hourly_rate DECIMAL(15, 2),
    flat_rate DECIMAL(15, 2),
    minimum_hours DECIMAL(5, 2) DEFAULT 1,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL,
    deleted_by BIGINT,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    INDEX idx_vendor_service (vendor_id, service_name, is_available)
) ENGINE=InnoDB;

-- Vendor Documents
CREATE TABLE IF NOT EXISTS vendor_documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vendor_id BIGINT NOT NULL,
    document_type_id INT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(512) NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    issue_date DATE,
    expiry_date DATE,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP NULL,
    verified_by BIGINT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL,
    deleted_by BIGINT,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    FOREIGN KEY (document_type_id) REFERENCES document_types(id) ON DELETE SET NULL,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_vendor_document (vendor_id, document_type_id, expiry_date)
) ENGINE=InnoDB;

-- Vendor Contracts
CREATE TABLE IF NOT EXISTS vendor_contracts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vendor_id BIGINT NOT NULL,
    contract_number VARCHAR(100) UNIQUE,
    contract_type ENUM('one_time', 'recurring', 'project_based') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    is_auto_renewal BOOLEAN DEFAULT FALSE,
    renewal_terms TEXT,
    notice_period_days INT DEFAULT 30,
    total_contract_value DECIMAL(15, 2),
    payment_terms TEXT,
    terms_and_conditions TEXT,
    special_notes TEXT,
    status ENUM('draft', 'active', 'expired', 'terminated', 'cancelled') DEFAULT 'draft',
    document_url VARCHAR(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL,
    deleted_by BIGINT,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    INDEX idx_vendor_contract_dates (vendor_id, start_date, end_date, status)
) ENGINE=InnoDB;

-- Vendor Reviews
CREATE TABLE IF NOT EXISTS vendor_reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vendor_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    maintenance_request_id BIGINT,
    rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    review TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    approved_at TIMESTAMP NULL,
    approved_by BIGINT,
    response_text TEXT,
    response_date TIMESTAMP NULL,
    response_by BIGINT,
    is_helpful_count INT DEFAULT 0,
    is_not_helpful_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL,
    deleted_by BIGINT,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (maintenance_request_id) REFERENCES maintenance_requests(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (response_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_vendor_review (vendor_id, rating, is_approved, is_featured)
) ENGINE=InnoDB;

-- Vendor Notes
CREATE TABLE IF NOT EXISTS vendor_notes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    vendor_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    note TEXT NOT NULL,
    is_important BOOLEAN DEFAULT FALSE,
    is_private BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    deleted_at TIMESTAMP NULL,
    deleted_by BIGINT,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_vendor_note (vendor_id, is_important, created_at)
) ENGINE=InnoDB;

-- ====================================================================
-- SECTION 9: CORE SYSTEM TABLES
-- ====================================================================

-- --------------------
-- Images Management
-- --------------------
CREATE TABLE IF NOT EXISTS images (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  owner_table VARCHAR(100) NOT NULL,        -- 'companies','properties','units','tenants','documents'
  owner_id BIGINT NOT NULL,
  purpose VARCHAR(100),                     -- 'logo','photo','signature','document','condition'
  url TEXT,                                 -- Image URL
  filename VARCHAR(255),
  content_type VARCHAR(100),
  data LONGBLOB,                            -- Binary data (optional)
  metadata JSON,                            -- Additional metadata
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_images_owner (owner_table, owner_id),
  INDEX idx_images_purpose (purpose)
);

-- --------------------
-- User Roles
-- --------------------
CREATE TABLE IF NOT EXISTS roles (
  id SMALLINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,        -- 'employee','manager','admin','agent'
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (name, description) VALUES
('employee', 'Regular employee with standard access'),
('manager', 'Property manager with oversight capabilities'),
('admin', 'Administrator with full system access'),
('agent', 'Rental agent with application management access')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- --------------------
-- Team Members
-- --------------------
CREATE TABLE IF NOT EXISTS team_members (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255),                        -- Job title
  email VARCHAR(255),
  phone VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_team_active (is_active)
);

-- --------------------
-- Users (System Access)
-- --------------------
CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),               -- bcrypt hash
  primary_role VARCHAR(50) DEFAULT 'employee',
  name VARCHAR(255),
  job_id BIGINT,                            -- FK to team_members.id
  profile_image_id BIGINT,                  -- FK to images.id for profile photo (real image data stored in images.data)
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  
  FOREIGN KEY (job_id) REFERENCES team_members(id) ON DELETE SET NULL,
  FOREIGN KEY (profile_image_id) REFERENCES images(id) ON DELETE SET NULL,
  INDEX idx_users_email (email),
  INDEX idx_users_active (is_active)
);

-- Users <-> Roles (Many-to-Many)
CREATE TABLE IF NOT EXISTS user_roles (
  user_id BIGINT NOT NULL,
  role_id SMALLINT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- ====================================================================
-- SECTION 3: COMPANY & PROPERTY STRUCTURE
-- ====================================================================

-- --------------------
-- Companies
-- --------------------
CREATE TABLE IF NOT EXISTS companies (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  contact_email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_companies_name (name)
);

-- --------------------
-- Properties (Property Listings)
-- --------------------
CREATE TABLE IF NOT EXISTS properties (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,               -- Property name/title
  type_id INT NOT NULL,                     -- FK to prop_type_enum
  building VARCHAR(255),                    -- Building name
  location TEXT,                            -- Address/location
  price DECIMAL(14,2),                      -- Monthly rent
  security_deposit DECIMAL(14,2),           -- Security deposit amount
  room_count INT DEFAULT 1,                 -- Number of rooms
  tags JSON,                                -- Additional tags/metadata
  description TEXT,                         -- Property description
  image_urls JSON,                          -- Array of image URLs
  is_active BOOLEAN DEFAULT TRUE,           -- Active listing
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (type_id) REFERENCES prop_type_enum(id),
  INDEX idx_properties_company (company_id),
  INDEX idx_properties_type (type_id),
  INDEX idx_properties_active (is_active),
  CHECK (room_count >= 1 AND room_count <= 200),
  CHECK (price >= 0 AND security_deposit >= 0)
);

-- --------------------
-- Buildings
-- --------------------
CREATE TABLE IF NOT EXISTS buildings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,               -- Building name
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  region VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Kenya',
  year_built INT,
  total_units INT,                          -- Total number of units
  amenities JSON,                           -- Building amenities (array)
  notes TEXT,                               -- Additional notes
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  INDEX idx_buildings_company (company_id),
  INDEX idx_buildings_city (city)
);

-- --------------------
-- Units (Individual Rental Units)
-- --------------------
CREATE TABLE IF NOT EXISTS units (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT NOT NULL,
  building_id BIGINT,                       -- FK to buildings.id (optional if standalone)
  property_id BIGINT,                       -- FK to properties.id (optional link to listing)
  unit_number VARCHAR(50) NOT NULL,         -- Unit/room number
  floor INT,                                -- Floor number
  bedrooms INT DEFAULT 1,                   -- Number of bedrooms
  bathrooms DECIMAL(3,1) DEFAULT 1.0,       -- Number of bathrooms
  size_sqft DECIMAL(10,2),                  -- Unit size in square feet
  base_rent DECIMAL(14,2) NOT NULL,         -- Base monthly rent
  deposit DECIMAL(14,2) NOT NULL,           -- Security deposit
  status VARCHAR(50) DEFAULT 'vacant',      -- 'vacant','occupied','maintenance','reserved'
  features JSON,                            -- Unit features (array)
  notes TEXT,                               -- Additional notes
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE SET NULL,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL,
  INDEX idx_units_company (company_id),
  INDEX idx_units_building (building_id),
  INDEX idx_units_property (property_id),
  INDEX idx_units_status (status),
  UNIQUE INDEX uniq_units_number_per_building (building_id, unit_number)
);

-- --------------------
-- Property Images (real photos linked to properties)
-- --------------------
CREATE TABLE IF NOT EXISTS property_images (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  property_id BIGINT NOT NULL,              -- FK to properties.id
  image_id BIGINT NOT NULL,                 -- FK to images.id (real photo bytes in images.data)
  caption TEXT,                             -- Optional caption/description
  sort_order INT DEFAULT 0,                 -- Display order
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE,
  INDEX idx_prop_images_property (property_id),
  INDEX idx_prop_images_image (image_id),
  INDEX idx_prop_images_sort (sort_order)
);

-- --------------------
-- Unit Images (real photos linked to individual units/rooms)
-- --------------------
CREATE TABLE IF NOT EXISTS unit_images (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  unit_id BIGINT NOT NULL,                  -- FK to units.id
  image_id BIGINT NOT NULL,                 -- FK to images.id (real photo bytes in images.data)
  caption TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,
  FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE,
  INDEX idx_unit_images_unit (unit_id),
  INDEX idx_unit_images_image (image_id),
  INDEX idx_unit_images_sort (sort_order)
);

-- ====================================================================
-- SECTION 4: TENANT & LEASE MANAGEMENT
-- ====================================================================

-- --------------------
-- Tenants
-- --------------------
CREATE TABLE IF NOT EXISTS tenants (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  id_number VARCHAR(100),                   -- National ID number
  employer_name VARCHAR(255),               -- Current employer
  employer_address TEXT,                    -- Employer address
  employer_phone VARCHAR(50),               -- Employer phone
  monthly_income DECIMAL(14,2),             -- Monthly income
  emergency_contact_name VARCHAR(255),      -- Emergency contact
  emergency_contact_phone VARCHAR(50),      -- Emergency contact phone
  notes TEXT,                               -- Additional tenant notes
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_tenants_name (full_name),
  INDEX idx_tenants_email (email),
  INDEX idx_tenants_phone (phone)
);

-- --------------------
-- Leases
-- --------------------
CREATE TABLE IF NOT EXISTS leases (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  unit_id BIGINT NOT NULL,                  -- FK to units.id
  tenant_id BIGINT NOT NULL,                -- FK to tenants.id
  start_date DATE NOT NULL,                 -- Lease start date
  end_date DATE,                            -- Lease end date (NULL = month-to-month)
  rent_amount DECIMAL(14,2) NOT NULL,       -- Monthly rent
  deposit_amount DECIMAL(14,2),             -- Security deposit
  payment_day INT DEFAULT 1,                -- Day of month rent is due (1-31)
  status VARCHAR(50) DEFAULT 'active',      -- 'active','expired','terminated','renewed'
  renewal_date DATE,                        -- Renewal date (if applicable)
  notes TEXT,                               -- Lease notes
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT,
  INDEX idx_leases_unit (unit_id),
  INDEX idx_leases_tenant (tenant_id),
  INDEX idx_leases_status (status),
  INDEX idx_leases_dates (start_date, end_date),
  CHECK (payment_day >= 1 AND payment_day <= 31)
);

-- --------------------
-- Payments (Rent and Other)
-- --------------------
CREATE TABLE IF NOT EXISTS payments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  lease_id BIGINT NOT NULL,                 -- FK to leases.id
  amount DECIMAL(14,2) NOT NULL,            -- Payment amount
  payment_date DATE NOT NULL,               -- Payment date
  due_date DATE,                            -- Original due date
  method VARCHAR(50),                       -- 'cash','m-pesa','bank_transfer','cheque'
  reference VARCHAR(100),                   -- Payment reference/tracking number
  notes TEXT,                               -- Payment notes
  recorded_by BIGINT,                       -- FK to users.id (who recorded)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (lease_id) REFERENCES leases(id) ON DELETE CASCADE,
  FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_payments_lease (lease_id),
  INDEX idx_payments_date (payment_date),
  INDEX idx_payments_method (method)
);

-- ====================================================================
-- SECTION 5: RENTAL APPLICATIONS
-- ====================================================================

-- --------------------
-- Applications (Rental Applications)
-- --------------------
CREATE TABLE IF NOT EXISTS applications (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  property_id BIGINT NOT NULL,              -- FK to properties.id
  room_number INT,                          -- Room/unit number applied for
  application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status_id INT DEFAULT 1,                  -- FK to app_status_enum (1=pending)
  total_cost DECIMAL(14,2),                 -- Total cost (rent + deposit)
  agent_name VARCHAR(255),                  -- Agent who handled application
  agent_signature_image_id BIGINT,          -- FK to images.id (signature)
  reviewed_by BIGINT,                       -- FK to users.id (who reviewed)
  reviewed_at TIMESTAMP NULL,               -- Review timestamp
  notes TEXT,                               -- Application notes
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  FOREIGN KEY (status_id) REFERENCES app_status_enum(id),
  FOREIGN KEY (agent_signature_image_id) REFERENCES images(id) ON DELETE SET NULL,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_applications_property (property_id),
  INDEX idx_applications_status (status_id),
  INDEX idx_applications_date (application_date),
  CHECK (room_number >= 1 AND room_number <= 200)
);

-- --------------------
-- Applicants (Multiple tenants per application)
-- --------------------
CREATE TABLE IF NOT EXISTS applicants (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  application_id BIGINT NOT NULL,           -- FK to applications.id
  full_name VARCHAR(255) NOT NULL,
  id_number VARCHAR(100),                   -- National ID
  phone_number VARCHAR(50),
  email VARCHAR(255),
  employer_name VARCHAR(255),
  employer_address TEXT,
  employer_phone VARCHAR(50),
  monthly_income DECIMAL(14,2),
  applicant_signature_image_id BIGINT,      -- FK to images.id (signature)
  is_primary BOOLEAN DEFAULT FALSE,         -- Primary applicant flag
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
  FOREIGN KEY (applicant_signature_image_id) REFERENCES images(id) ON DELETE SET NULL,
  INDEX idx_applicants_application (application_id),
  INDEX idx_applicants_primary (is_primary)
);

-- ====================================================================
-- SECTION 6: MAINTENANCE & OPERATIONS
-- ====================================================================

-- --------------------
-- Maintenance Requests
-- --------------------
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  unit_id BIGINT NOT NULL,                  -- FK to units.id
  requested_by VARCHAR(255),                -- Requester name (tenant/manager)
  request_date DATE DEFAULT (CURRENT_DATE),
  category VARCHAR(100),                    -- 'plumbing','electrical','appliance','general'
  description TEXT,                         -- Detailed description
  status VARCHAR(50) DEFAULT 'open',        -- 'open','in_progress','completed','cancelled'
  priority VARCHAR(50) DEFAULT 'normal',    -- 'low','normal','high','urgent'
  assigned_to BIGINT,                       -- FK to users.id (assigned staff)
  resolved_date DATE,                       -- Resolution date
  resolution_notes TEXT,                    -- Resolution details
  cost DECIMAL(14,2),                       -- Maintenance cost
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_maint_unit (unit_id),
  INDEX idx_maint_status (status),
  INDEX idx_maint_priority (priority),
  INDEX idx_maint_date (request_date)
);

-- --------------------
-- Vendors (Service Providers)
-- --------------------
CREATE TABLE IF NOT EXISTS vendors (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,               -- Vendor/company name
  contact_name VARCHAR(255),                -- Contact person
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  service_type VARCHAR(100),                -- Type of service (plumbing, electrical, etc.)
  rating DECIMAL(3,2),                      -- Vendor rating (1-5)
  notes TEXT,                               -- Vendor notes
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_vendors_name (name),
  INDEX idx_vendors_service (service_type),
  INDEX idx_vendors_active (is_active)
);

-- --------------------
-- Expenses
-- --------------------
CREATE TABLE IF NOT EXISTS expenses (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT NOT NULL,               -- FK to companies.id
  building_id BIGINT,                       -- FK to buildings.id (optional)
  unit_id BIGINT,                           -- FK to units.id (optional)
  vendor_id BIGINT,                         -- FK to vendors.id (optional)
  maintenance_request_id BIGINT,            -- FK to maintenance_requests.id (if maintenance-related)
  category VARCHAR(100),                    -- 'maintenance','utilities','insurance','taxes','other'
  description TEXT,                         -- Expense description
  amount DECIMAL(14,2) NOT NULL,            -- Expense amount
  expense_date DATE NOT NULL,               -- Expense date
  invoice_number VARCHAR(100),              -- Invoice/receipt number
  payment_method VARCHAR(50),               -- Payment method
  notes TEXT,                               -- Additional notes
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  recorded_by BIGINT,                       -- FK to users.id
  
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE SET NULL,
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL,
  FOREIGN KEY (maintenance_request_id) REFERENCES maintenance_requests(id) ON DELETE SET NULL,
  FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_exp_company (company_id),
  INDEX idx_exp_category (category),
  INDEX idx_exp_date (expense_date),
  INDEX idx_exp_vendor (vendor_id)
);

-- ====================================================================
-- SECTION 7: DOCUMENTS & MANAGEMENT
-- ====================================================================

-- --------------------
-- Documents
-- --------------------
CREATE TABLE IF NOT EXISTS documents (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  owner_type VARCHAR(50) NOT NULL,          -- 'company','building','unit','lease','tenant','application'
  owner_id BIGINT NOT NULL,                 -- ID of the owner record
  title VARCHAR(255) NOT NULL,              -- Document title
  document_type VARCHAR(100),               -- 'lease','contract','invoice','receipt','id','other'
  url TEXT,                                 -- Document URL/path
  filename VARCHAR(255),                    -- Original filename
  content_type VARCHAR(100),                -- MIME type
  file_size BIGINT,                         -- File size in bytes
  uploaded_by BIGINT,                       -- FK to users.id
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  description TEXT,                         -- Document description
  expiry_date DATE,                         -- Expiry date (if applicable, e.g., insurance)
  
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_docs_owner (owner_type, owner_id),
  INDEX idx_docs_type (document_type),
  INDEX idx_docs_expiry (expiry_date)
);

-- --------------------
-- Management Information
-- --------------------
CREATE TABLE IF NOT EXISTS management_info (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT,                        -- FK to companies.id
  station_manager VARCHAR(255),             -- Manager name
  service_area TEXT,                        -- Service area description
  base_location VARCHAR(255),               -- Base location
  updated_by BIGINT,                        -- FK to users.id
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY uniq_management_company (company_id)
);

-- ====================================================================
-- SECTION 8: INITIAL DATA / SEED DATA
-- ====================================================================

-- Insert BARAKA HOUSING AGENCY company
INSERT INTO companies (name, description, contact_email, phone, address) VALUES
('BARAKA HOUSING AGENCY', 
 'Property management company in Kangundo specializing in quality rental accommodations',
 'barakahousing@gmail.com', 
 '+254799789956', 
 'Kangundo Town')
ON DUPLICATE KEY UPDATE 
  description = VALUES(description),
  contact_email = VALUES(contact_email),
  phone = VALUES(phone),
  address = VALUES(address);

-- Insert management info
INSERT INTO management_info (company_id, station_manager, service_area, base_location)
SELECT c.id, 'MD Damarice', 'Kangundo, Tala, and surrounding areas', 'Kangundo'
FROM companies c WHERE c.name = 'BARAKA HOUSING AGENCY'
ON DUPLICATE KEY UPDATE 
  station_manager = VALUES(station_manager),
  service_area = VALUES(service_area),
  base_location = VALUES(base_location);

-- Insert sample properties
INSERT INTO properties (company_id, name, type_id, building, location, price, security_deposit, room_count, description, is_active)
SELECT c.id, 'Modern Apartment', 1, 'Baraka Heights', 'Kangundo Town', 15000.00, 15000.00, 1, 'Modern apartment with all amenities', TRUE
FROM companies c WHERE c.name = 'BARAKA HOUSING AGENCY'
ON DUPLICATE KEY UPDATE 
  description = VALUES(description),
  price = VALUES(price),
  security_deposit = VALUES(security_deposit);

INSERT INTO properties (company_id, name, type_id, building, location, price, security_deposit, room_count, description, is_active)
SELECT c.id, 'Cozy Studio', 2, 'Tala Plaza', 'Tala Town', 8000.00, 8000.00, 1, 'Comfortable studio apartment', TRUE
FROM companies c WHERE c.name = 'BARAKA HOUSING AGENCY'
ON DUPLICATE KEY UPDATE 
  description = VALUES(description),
  price = VALUES(price),
  security_deposit = VALUES(security_deposit);

-- Insert sample building
INSERT INTO buildings (company_id, name, address_line1, city, region, total_units)
SELECT c.id, 'Baraka Heights', 'Main Road', 'Kangundo', 'Machakos', 2
FROM companies c WHERE c.name = 'BARAKA HOUSING AGENCY'
ON DUPLICATE KEY UPDATE 
  address_line1 = VALUES(address_line1),
  city = VALUES(city),
  region = VALUES(region),
  total_units = VALUES(total_units);

-- Insert sample units
INSERT IGNORE INTO units (company_id, building_id, property_id, unit_number, floor, bedrooms, bathrooms, size_sqft, base_rent, deposit, status)
SELECT c.id, b.id, p.id, 'A-1', 1, 1, 1.0, 450.00, 15000.00, 15000.00, 'vacant'
FROM companies c
JOIN buildings b ON b.company_id = c.id AND b.name = 'Baraka Heights'
JOIN properties p ON p.company_id = c.id AND p.name = 'Modern Apartment'
WHERE c.name = 'BARAKA HOUSING AGENCY';

INSERT IGNORE INTO units (company_id, building_id, property_id, unit_number, floor, bedrooms, bathrooms, size_sqft, base_rent, deposit, status)
SELECT c.id, b.id, p.id, 'A-2', 1, 1, 1.0, 420.00, 8000.00, 8000.00, 'vacant'
FROM companies c
JOIN buildings b ON b.company_id = c.id AND b.name = 'Baraka Heights'
JOIN properties p ON p.company_id = c.id AND p.name = 'Cozy Studio'
WHERE c.name = 'BARAKA HOUSING AGENCY';

-- ====================================================================
-- END OF SCHEMA
-- ====================================================================

