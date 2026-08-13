-- ── PORTAL SYNC SCHEMA ──
-- Ensures all tables required for the Client Portal are present and synchronized with the backend.

USE the_greggory_systems_and_strategy_firm_db_main;

-- 1. User Projects (Main Engagement Nodes)
CREATE TABLE IF NOT EXISTS user_projects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    project_description TEXT,
    project_type VARCHAR(100) DEFAULT 'consulting',
    status ENUM('planning', 'in-progress', 'completed', 'on-hold', 'cancelled') DEFAULT 'planning',
    priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    progress_percentage INT DEFAULT 0,
    start_date DATE,
    end_date DATE,
    estimated_budget DECIMAL(15,2) DEFAULT 0.00,
    actual_budget DECIMAL(15,2) DEFAULT 0.00,
    project_manager_id BIGINT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 2. Project Tasks (Execution Board)
CREATE TABLE IF NOT EXISTS project_tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    task_name VARCHAR(255) NOT NULL,
    task_description TEXT,
    assigned_to BIGINT,
    status ENUM('planned', 'in-progress', 'blocked', 'completed') DEFAULT 'planned',
    priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    due_date DATETIME,
    progress_percentage INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (project_id) REFERENCES user_projects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Project Activities (Live Data Relay)
CREATE TABLE IF NOT EXISTS project_activities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    activity_type VARCHAR(100) DEFAULT 'update',
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES user_projects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Project Invoices (Financial Ledger)
CREATE TABLE IF NOT EXISTS project_invoices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('draft', 'pending', 'paid', 'overdue', 'cancelled') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES user_projects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Project Documents (The Vault)
CREATE TABLE IF NOT EXISTS project_docs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'General',
    file_path VARCHAR(512),
    file_size BIGINT DEFAULT 0,
    version VARCHAR(20) DEFAULT 'v1.0',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (project_id) REFERENCES user_projects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. User Feedback (Satisfaction Relays)
CREATE TABLE IF NOT EXISTS user_feedback (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    project_id BIGINT DEFAULT NULL,
    title VARCHAR(255),
    message TEXT NOT NULL,
    feedback_type VARCHAR(100) DEFAULT 'general',
    rating INT DEFAULT 5,
    status ENUM('new', 'reviewed', 'responded', 'closed') DEFAULT 'new',
    priority ENUM('Low', 'Medium', 'High', 'Urgent') DEFAULT 'Medium',
    source VARCHAR(100) DEFAULT 'portal',
    contact_name VARCHAR(255) DEFAULT NULL,
    contact_email VARCHAR(255) DEFAULT NULL,
    contact_phone VARCHAR(50) DEFAULT NULL,
    admin_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES user_projects(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 7. Notifications (System Relays)
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    notification_type VARCHAR(100) DEFAULT 'system',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('unread', 'read', 'archived') DEFAULT 'unread',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Client Project Summary (Aggregated Telemetry)
CREATE TABLE IF NOT EXISTS client_project_summary (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    total_projects INT DEFAULT 0,
    active_projects INT DEFAULT 0,
    completed_projects INT DEFAULT 0,
    total_budget DECIMAL(15,2) DEFAULT 0.00,
    total_spent DECIMAL(15,2) DEFAULT 0.00,
    client_rating DECIMAL(3,2) DEFAULT 5.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
