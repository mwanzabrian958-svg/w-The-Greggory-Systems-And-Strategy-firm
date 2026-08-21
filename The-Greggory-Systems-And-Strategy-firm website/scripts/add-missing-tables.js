// Migration: create missing tables (currencies, website_content, rental module)
require("dotenv").config();
const mysql = require("mysql2/promise");

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME,
    multipleStatements: true,
  });
  console.log("Connected. Running migrations...");

  // 1. CURRENCIES
  await conn.query(`CREATE TABLE IF NOT EXISTS currencies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    exchange_rate DECIMAL(15,6) DEFAULT 1.000000,
    region VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`);
  const [curCount] = await conn.query("SELECT COUNT(*) as c FROM currencies");
  if (curCount[0].c === 0) {
    await conn.query(`INSERT INTO currencies (code,name,symbol,exchange_rate,region,is_active,is_default) VALUES
      ('KES','Kenyan Shilling','KSh',1.000000,'Africa',TRUE,TRUE),
      ('USD','US Dollar','$',0.007700,'Americas',TRUE,FALSE),
      ('EUR','Euro','\u20AC',0.007100,'Europe',TRUE,FALSE),
      ('GBP','British Pound','\u00A3',0.006100,'Europe',TRUE,FALSE),
      ('TZS','Tanzanian Shilling','TSh',19.500000,'Africa',TRUE,FALSE),
      ('UGX','Ugandan Shilling','USh',28.200000,'Africa',TRUE,FALSE),
      ('RWF','Rwandan Franc','FRw',9.900000,'Africa',TRUE,FALSE),
      ('ZAR','South African Rand','R',0.140000,'Africa',TRUE,FALSE);`);
    console.log("currencies created + seeded");
  }

  // 2. WEBSITE CONTENT
  await conn.query(`CREATE TABLE IF NOT EXISTS website_content (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    content_key VARCHAR(100) NOT NULL UNIQUE,
    content_value LONGTEXT,
    content_type ENUM('text','html','json','image_url') DEFAULT 'text',
    section VARCHAR(100),
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by BIGINT,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`);
  const [wcCount] = await conn.query("SELECT COUNT(*) as c FROM website_content");
  if (wcCount[0].c === 0) {
    await conn.query(`INSERT INTO website_content (content_key,content_value,content_type,section,description) VALUES
      ('hero_title','THE GREGGORY SYSTEMS AND STRATEGY FIRM','text','hero','Main landing page title'),
      ('hero_motto','Strategic Project Development for all clients','text','hero','Main landing page motto'),
      ('intro_title','Empowering Your Success Through Comprehensive Solutions','text','intro','Introduction section title'),
      ('intro_description','At The Greggory Systems And Strategy Firm, we believe that every business challenge - from systems design to strategic planning - can be solved with excellence.','text','intro','Introduction section description');`);
    console.log("website_content created + seeded");
  }

  // 3. RENTAL MODULE
  await conn.query(`CREATE TABLE IF NOT EXISTS prop_type_enum (
    id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL UNIQUE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  CREATE TABLE IF NOT EXISTS properties (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_id BIGINT NOT NULL,
    type_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    building VARCHAR(255),
    location VARCHAR(255),
    price DECIMAL(15,2) DEFAULT 0,
    security_deposit DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'available',
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    tags TEXT,
    image_urls TEXT,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (type_id) REFERENCES prop_type_enum(id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  CREATE TABLE IF NOT EXISTS property_features (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    property_id BIGINT NOT NULL,
    room_number VARCHAR(50),
    feature_name VARCHAR(255) NOT NULL,
    feature_value VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  CREATE TABLE IF NOT EXISTS app_status_enum (
    id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) NOT NULL UNIQUE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  CREATE TABLE IF NOT EXISTS applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    property_id BIGINT NOT NULL,
    room_number VARCHAR(50),
    agent_name VARCHAR(255),
    total_cost DECIMAL(15,2) DEFAULT 0,
    status_id INT DEFAULT 1,
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id),
    FOREIGN KEY (status_id) REFERENCES app_status_enum(id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  CREATE TABLE IF NOT EXISTS applicants (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_id BIGINT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    id_number VARCHAR(100),
    phone_number VARCHAR(50),
    email VARCHAR(255),
    employer_name VARCHAR(255),
    employer_address VARCHAR(255),
    employer_phone VARCHAR(50),
    monthly_income DECIMAL(15,2),
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`);
  const [ptCount] = await conn.query("SELECT COUNT(*) as c FROM prop_type_enum");
  if (ptCount[0].c === 0) {
    await conn.query(`INSERT INTO prop_type_enum (name) VALUES ('Residential'),('Commercial'),('Office Space'),('Mixed Use');`);
    await conn.query(`INSERT INTO app_status_enum (name) VALUES ('Pending'),('Under Review'),('Approved'),('Rejected'),('Withdrawn');`);
    console.log("rental module tables created + enums seeded");
  }

  console.log("ALL MIGRATIONS COMPLETE");
})().catch((e) => {
  console.error("MIGRATION FAILED:", e.message);
  process.exit(1);
});
