-- Schema for Greggory Foundation Ltd Website (MySQL)
-- Created for MySQL/phpMyAdmin compatibility

-- --------------------
-- Helper ENUMs (MySQL syntax)
-- --------------------
CREATE TABLE IF NOT EXISTS prop_type_enum (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO prop_type_enum (name) VALUES 
('apartments'), ('single-rooms'), ('bedsitters'), ('1-bedroom'), ('2-plus-bedrooms');

CREATE TABLE IF NOT EXISTS app_status_enum (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO app_status_enum (name) VALUES 
('pending'), ('approved'), ('rejected');

CREATE TABLE IF NOT EXISTS user_primary_role_enum (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO user_primary_role_enum (name) VALUES 
('employee'), ('developer'), ('admin');

-- --------------------
-- Core centralized Images table
-- --------------------
CREATE TABLE IF NOT EXISTS images (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  owner_table VARCHAR(100),               -- e.g. 'companies','properties','team_members','property_features','case_studies'
  owner_id BIGINT,                        -- id of the record in owner_table
  purpose VARCHAR(100),                   -- e.g. 'logo','photo','room_condition','signature'
  url TEXT,                               -- public/cdn URL (nullable)
  filename VARCHAR(255),
  content_type VARCHAR(100),
  data LONGBLOB,                          -- binary BLOB (nullable)
  metadata JSON,                          -- optional: width, height, source, etc.
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_images_owner ON images(owner_table, owner_id);
CREATE INDEX idx_images_purpose ON images(purpose);

-- --------------------
-- Roles (to support multi-role assignments)
-- --------------------
CREATE TABLE IF NOT EXISTS roles (
  id SMALLINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,      -- 'employee','developer','admin', etc.
  description TEXT
);

INSERT INTO roles(name, description) VALUES
('employee', 'Employee role (regular staff)'),
('developer', 'Developer / technical role'),
('admin', 'Administrator');

-- --------------------
-- Users
-- --------------------
CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),             -- nullable for OAuth-only accounts
  google_id VARCHAR(255),                 -- Google OAuth subject id (nullable)
  oauth_provider VARCHAR(50),             -- e.g. 'google'
  primary_role VARCHAR(50) DEFAULT 'employee',
  name VARCHAR(255),
  job_id BIGINT,                          -- optional link to team_members.id
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  
  FOREIGN KEY (job_id) REFERENCES team_members(id)
);

CREATE INDEX idx_users_email ON users(email);

-- --------------------
-- Companies
-- --------------------
CREATE TABLE IF NOT EXISTS companies (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  logo_image_id BIGINT,                   -- optional pointer to images.id (logo BLOB)
  website_url TEXT,
  contact_email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (logo_image_id) REFERENCES images(id)
);

CREATE INDEX idx_companies_name ON companies(name);

-- --------------------
-- Properties
-- --------------------
CREATE TABLE IF NOT EXISTS properties (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  type_id INT NOT NULL,                    -- reference to prop_type_enum
  building VARCHAR(255),
  location TEXT,                          -- free-form address / neighborhood
  price DECIMAL(14,2),
  security_deposit DECIMAL(14,2),
  room_count INT DEFAULT 1,
  tags JSON,                              -- array of tags or key-values
  description TEXT,
  image_urls JSON,                        -- list of image URLs (useful for CDN references)
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (type_id) REFERENCES prop_type_enum(id),
  
  CHECK (room_count >= 1 AND room_count <= 200),
  CHECK (price >= 0 AND security_deposit >= 0)
);

CREATE INDEX idx_properties_company ON properties(company_id);
CREATE INDEX idx_properties_type ON properties(type_id);

-- --------------------
-- Applications
-- --------------------
CREATE TABLE IF NOT EXISTS applications (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  property_id BIGINT NOT NULL,
  room_number INT,
  application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status_id INT DEFAULT 1,                -- default to 'pending' from app_status_enum
  total_cost DECIMAL(14,2),
  agent_name VARCHAR(255),
  agent_signature_image_id BIGINT,       -- pointer to images table for agent signature (BLOB/url)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  FOREIGN KEY (status_id) REFERENCES app_status_enum(id),
  FOREIGN KEY (agent_signature_image_id) REFERENCES images(id),
  
  CHECK (room_number >= 1 AND room_number <= 200)
);

-- --------------------
-- Applicants (multiple tenants per application)
-- --------------------
CREATE TABLE IF NOT EXISTS applicants (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  application_id BIGINT NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  id_number VARCHAR(100),
  phone_number VARCHAR(50),
  email VARCHAR(255),
  employer_name VARCHAR(255),
  employer_address TEXT,
  employer_phone VARCHAR(50),
  monthly_income DECIMAL(14,2),
  applicant_signature_image_id BIGINT,   -- pointer to images (signature)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
  FOREIGN KEY (applicant_signature_image_id) REFERENCES images(id)
);

-- --------------------
-- Services
-- --------------------
CREATE TABLE IF NOT EXISTS services (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle TEXT,
  description TEXT,
  icon_class VARCHAR(100),
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- --------------------
-- Service Offerings (sub-services)
-- --------------------
CREATE TABLE IF NOT EXISTS service_offerings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  service_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon_class VARCHAR(100),
  sort_order INT DEFAULT 0,
  
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- --------------------
-- Team Members
-- --------------------
CREATE TABLE IF NOT EXISTS team_members (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  credentials TEXT,
  bio TEXT,
  photo_url TEXT,
  photo_image_id BIGINT,                  -- pointer to images table for photo BLOB
  email VARCHAR(255),
  phone VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (photo_image_id) REFERENCES images(id)
);

-- --------------------
-- Company Values
-- --------------------
CREATE TABLE IF NOT EXISTS company_values (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon_class VARCHAR(100),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- --------------------
-- Blog Articles
-- --------------------
CREATE TABLE IF NOT EXISTS blog_articles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT,
  content LONGTEXT,
  author VARCHAR(255),                    -- could be team_members.name or free-text
  published_date TIMESTAMP NULL,
  read_time INT,                          -- in minutes
  category VARCHAR(100),
  image_url TEXT,
  image_id BIGINT,                        -- pointer to images table for article image
  icon_class VARCHAR(100),
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (image_id) REFERENCES images(id)
);

-- --------------------
-- Contact Forms
-- --------------------
CREATE TABLE IF NOT EXISTS contact_forms (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  company VARCHAR(255),
  phone VARCHAR(50),
  service VARCHAR(255),
  message TEXT,
  preferred_channel VARCHAR(50),           -- 'email'/'whatsapp'/etc.
  success_token VARCHAR(100) UNIQUE,      -- tracking token
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contact_forms_token ON contact_forms(success_token);

-- --------------------
-- Management Info
-- --------------------
CREATE TABLE IF NOT EXISTS management_info (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT,
  station_manager VARCHAR(255),
  service_area TEXT,
  base_location VARCHAR(255),
  updated_by BIGINT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- --------------------
-- Case Studies
-- --------------------
CREATE TABLE IF NOT EXISTS case_studies (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  client VARCHAR(255),
  industry VARCHAR(255),
  challenge TEXT,
  solution TEXT,
  results TEXT,
  duration VARCHAR(100),                  -- e.g. "6 months"
  image_urls JSON,                        -- array of image URLs
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- --------------------
-- Projects
-- --------------------
CREATE TABLE IF NOT EXISTS projects (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  client VARCHAR(255),
  start_date DATE,
  end_date DATE,
  status VARCHAR(100),                    -- e.g. 'planned','active','completed','on-hold'
  budget DECIMAL(16,2),
  assigned_to BIGINT,                     -- FK to users.id (employee or developer)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (assigned_to) REFERENCES users(id)
);

-- --------------------
-- Property Features (room-specific)
-- --------------------
CREATE TABLE IF NOT EXISTS property_features (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  property_id BIGINT NOT NULL,
  room_number INT,
  feature_type VARCHAR(255),
  description TEXT,
  image_url TEXT,
  image_id BIGINT,                        -- pointer to images table for room condition photo (BLOB)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  FOREIGN KEY (image_id) REFERENCES images(id),
  
  CHECK (room_number >= 1 AND room_number <= 200)
);

-- --------------------
-- Property Statistics (auto-calculated snapshots)
-- --------------------
CREATE TABLE IF NOT EXISTS property_statistics (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT,
  total_properties INT,
  unique_buildings INT,
  unique_locations INT,
  occupancy_rate DECIMAL(5,2),            -- percentage 0-100
  calculated_date DATE,
  
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

CREATE INDEX idx_property_statistics_company_date ON property_statistics(company_id, calculated_date);

-- --------------------
-- Navigation Menu
-- --------------------
CREATE TABLE IF NOT EXISTS navigation_menu (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  url VARCHAR(500),
  parent_id BIGINT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  role_required VARCHAR(100),             -- free-text role name or JSON list of roles (could be roles.name)
  
  FOREIGN KEY (parent_id) REFERENCES navigation_menu(id) ON DELETE SET NULL
);

CREATE INDEX idx_nav_parent ON navigation_menu(parent_id);

-- --------------------
-- Site Settings
-- --------------------
CREATE TABLE IF NOT EXISTS site_settings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(255) UNIQUE NOT NULL,
  setting_value TEXT,
  description TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_site_settings_key ON site_settings(setting_key);

-- --------------------
-- Additional linking tables
-- --------------------
-- Users <-> Roles many-to-many (supports multi-role assignments)
CREATE TABLE IF NOT EXISTS user_roles (
  user_id BIGINT NOT NULL,
  role_id SMALLINT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role_id),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Properties <-> Images linking convenience
CREATE TABLE IF NOT EXISTS property_images (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  property_id BIGINT NOT NULL,
  image_id BIGINT NOT NULL,
  caption TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE
);

-- CaseStudy <-> Images linking convenience
CREATE TABLE IF NOT EXISTS case_study_images (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  case_study_id BIGINT NOT NULL,
  image_id BIGINT NOT NULL,
  caption TEXT,
  sort_order INT DEFAULT 0,
  
  FOREIGN KEY (case_study_id) REFERENCES case_studies(id) ON DELETE CASCADE,
  FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE
);

-- --------------------
-- Sample Data (for testing)
-- --------------------
INSERT INTO companies (name, description, contact_email, phone, address) VALUES 
('BARAKA HOUSING AGENCY', 'Property management company in Kangundo', 'barakahousing@gmail.com', '+254799789956', 'Kangundo Town'),
('MAMA GIRLS HOUSING AND REAL ESTATE AGENCY', 'Real estate agency focusing on housing solutions', 'info@mamagirls.com', '+254712345678', 'Tala Town');

INSERT INTO properties (company_id, name, type_id, building, location, price, security_deposit, room_count, description, is_active) VALUES 
(1, 'Modern Apartment', 1, 'Baraka Heights', 'Kangundo Town', 15000.00, 15000.00, 1, 'Modern apartment with all amenities', TRUE),
(1, 'Cozy Studio', 2, 'Tala Plaza', 'Tala Town', 8000.00, 8000.00, 1, 'Comfortable studio apartment', TRUE),
(1, 'Luxury Suite', 1, 'Greggory Court', 'Kangundo', 25000.00, 25000.00, 1, 'Luxury suite with premium features', TRUE);

INSERT INTO management_info (company_id, station_manager, service_area, base_location) VALUES 
(1, 'MD Damarice', 'Kangundo, Tala, and surrounding areas', 'Kangundo');
