-- BARAKA HOUSING AGENCY: Full Property Management Schema (MySQL)
-- Fresh schema from scratch, production-ready core tables + seed

CREATE DATABASE IF NOT EXISTS baraka_housing_agency;
USE baraka_housing_agency;

-- ====================
-- Helper lookups / enums
-- ====================
CREATE TABLE IF NOT EXISTS prop_type_enum (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);
INSERT INTO prop_type_enum (name) VALUES
('apartments'),('single-rooms'),('bedsitters'),('1-bedroom'),('2-plus-bedrooms')
ON DUPLICATE KEY UPDATE name = VALUES(name);

CREATE TABLE IF NOT EXISTS app_status_enum (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);
INSERT INTO app_status_enum (name) VALUES
('pending'),('approved'),('rejected')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Minimal images registry (URLs or filenames)
CREATE TABLE IF NOT EXISTS images (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  url TEXT,
  filename VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ====================
-- Users and Team Members
-- ====================
CREATE TABLE IF NOT EXISTS team_members (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  email VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  primary_role VARCHAR(50) DEFAULT 'employee',
  name VARCHAR(255),
  job_id BIGINT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  INDEX idx_users_job (job_id)
);
ALTER TABLE users
  ADD CONSTRAINT fk_users_job_baraka
  FOREIGN KEY (job_id) REFERENCES team_members(id);

-- Optional roles mapping (if you need multi-role assignments)
CREATE TABLE IF NOT EXISTS roles (
  id SMALLINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT
);
INSERT INTO roles(name, description) VALUES
('employee','Employee role'),('developer','Developer role'),('admin','Administrator')
ON DUPLICATE KEY UPDATE description = VALUES(description);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id BIGINT NOT NULL,
  role_id SMALLINT NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- ====================
-- Company / Properties (high level)
-- ====================
CREATE TABLE IF NOT EXISTS companies (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  contact_email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE INDEX idx_companies_name ON companies(name);

CREATE TABLE IF NOT EXISTS properties (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  type_id INT NOT NULL,
  building VARCHAR(255),
  location TEXT,
  price DECIMAL(14,2),
  security_deposit DECIMAL(14,2),
  room_count INT DEFAULT 1,
  tags JSON,
  description TEXT,
  image_urls JSON,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (type_id) REFERENCES prop_type_enum(id)
);
CREATE INDEX idx_properties_company ON properties(company_id);
CREATE INDEX idx_properties_type ON properties(type_id);

-- ====================
-- Buildings / Units (core for PM system)
-- ====================
CREATE TABLE IF NOT EXISTS buildings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  region VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  year_built INT,
  total_units INT,
  amenities JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);
CREATE INDEX idx_buildings_company ON buildings(company_id);

CREATE TABLE IF NOT EXISTS units (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT NOT NULL,
  building_id BIGINT,
  property_id BIGINT,
  unit_number VARCHAR(50) NOT NULL,
  floor INT,
  bedrooms INT,
  bathrooms DECIMAL(3,1),
  size_sqft DECIMAL(10,2),
  base_rent DECIMAL(14,2),
  deposit DECIMAL(14,2),
  status VARCHAR(50) DEFAULT 'vacant',
  features JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE SET NULL,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL
);
CREATE INDEX idx_units_company ON units(company_id);
CREATE INDEX idx_units_building ON units(building_id);
CREATE INDEX idx_units_property ON units(property_id);
CREATE UNIQUE INDEX uniq_units_number_per_building ON units(building_id, unit_number);

-- ====================
-- Tenants / Leases / Payments
-- ====================
CREATE TABLE IF NOT EXISTS tenants (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  id_number VARCHAR(100),
  employer_name VARCHAR(255),
  monthly_income DECIMAL(14,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leases (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  unit_id BIGINT NOT NULL,
  tenant_id BIGINT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  rent_amount DECIMAL(14,2) NOT NULL,
  deposit_amount DECIMAL(14,2),
  payment_day INT DEFAULT 1,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT
);
CREATE INDEX idx_leases_unit ON leases(unit_id);
CREATE INDEX idx_leases_tenant ON leases(tenant_id);

CREATE TABLE IF NOT EXISTS payments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  lease_id BIGINT NOT NULL,
  amount DECIMAL(14,2) NOT NULL,
  payment_date DATE NOT NULL,
  method VARCHAR(50),
  reference VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lease_id) REFERENCES leases(id) ON DELETE CASCADE
);
CREATE INDEX idx_payments_lease ON payments(lease_id);

-- ====================
-- Maintenance / Vendors / Expenses / Documents
-- ====================
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  unit_id BIGINT NOT NULL,
  requested_by VARCHAR(255),
  request_date DATE DEFAULT (CURRENT_DATE),
  category VARCHAR(100),
  description TEXT,
  status VARCHAR(50) DEFAULT 'open',
  priority VARCHAR(50) DEFAULT 'normal',
  resolved_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE
);
CREATE INDEX idx_maint_unit ON maintenance_requests(unit_id);

CREATE TABLE IF NOT EXISTS vendors (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS expenses (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  company_id BIGINT NOT NULL,
  building_id BIGINT,
  unit_id BIGINT,
  vendor_id BIGINT,
  category VARCHAR(100),
  description TEXT,
  amount DECIMAL(14,2) NOT NULL,
  expense_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE SET NULL,
  FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL
);
CREATE INDEX idx_exp_company ON expenses(company_id);

CREATE TABLE IF NOT EXISTS documents (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  owner_type VARCHAR(50) NOT NULL, -- company, building, unit, lease
  owner_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  url TEXT,
  content_type VARCHAR(100),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_docs_owner ON documents(owner_type, owner_id);

-- ====================
-- Applications / Applicants (matches your API)
-- ====================
CREATE TABLE IF NOT EXISTS applications (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  property_id BIGINT NOT NULL,
  room_number INT,
  application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status_id INT DEFAULT 1,
  total_cost DECIMAL(14,2),
  agent_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  FOREIGN KEY (status_id) REFERENCES app_status_enum(id)
);

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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

-- ====================
-- Management info (used by /management routes)
-- ====================
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
ALTER TABLE management_info
  ADD UNIQUE KEY uniq_management_company_baraka (company_id);

-- ====================
-- Seed BARAKA company, properties, building, units
-- ====================
INSERT INTO companies (name, description, contact_email, phone, address) VALUES
('BARAKA HOUSING AGENCY', 'Property management company in Kangundo', 'barakahousing@gmail.com', '+254799789956', 'Kangundo Town')
ON DUPLICATE KEY UPDATE description = VALUES(description), contact_email = VALUES(contact_email), phone = VALUES(phone), address = VALUES(address);

INSERT INTO properties (company_id, name, type_id, building, location, price, security_deposit, room_count, description, is_active)
SELECT c.id, 'Modern Apartment', 1, 'Baraka Heights', 'Kangundo Town', 15000.00, 15000.00, 1, 'Modern apartment with all amenities', TRUE
FROM companies c WHERE c.name = 'BARAKA HOUSING AGENCY'
ON DUPLICATE KEY UPDATE description = VALUES(description), price = VALUES(price);

INSERT INTO properties (company_id, name, type_id, building, location, price, security_deposit, room_count, description, is_active)
SELECT c.id, 'Cozy Studio', 2, 'Tala Plaza', 'Tala Town', 8000.00, 8000.00, 1, 'Comfortable studio apartment', TRUE
FROM companies c WHERE c.name = 'BARAKA HOUSING AGENCY'
ON DUPLICATE KEY UPDATE description = VALUES(description), price = VALUES(price);

INSERT INTO management_info (company_id, station_manager, service_area, base_location)
SELECT c.id, 'MD Damarice', 'Kangundo, Tala, and surrounding areas', 'Kangundo'
FROM companies c WHERE c.name = 'BARAKA HOUSING AGENCY'
ON DUPLICATE KEY UPDATE station_manager = VALUES(station_manager), service_area = VALUES(service_area), base_location = VALUES(base_location);

-- Seed building and units
INSERT INTO buildings (company_id, name, address_line1, city, region, total_units)
SELECT c.id, 'Baraka Heights', 'Main Road', 'Kangundo', 'Machakos', 2
FROM companies c WHERE c.name = 'BARAKA HOUSING AGENCY'
ON DUPLICATE KEY UPDATE address_line1 = VALUES(address_line1), city = VALUES(city), region = VALUES(region), total_units = VALUES(total_units);

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
