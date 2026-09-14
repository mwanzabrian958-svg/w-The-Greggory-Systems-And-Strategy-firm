const mysql = require('mysql2/promise');
require('dotenv').config();

async function applySchema() {
    const config = {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : null
    };

    console.log(`Connecting to ${config.host}:${config.port}...`);

    try {
        const connection = await mysql.createConnection(config);
        console.log('Connected to database.');

        const sql = `
CREATE TABLE IF NOT EXISTS project_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    file_data LONGBLOB,
    file_type VARCHAR(100) DEFAULT 'application/pdf',
    file_size BIGINT DEFAULT 0,
    report_date DATE NOT NULL,
    status ENUM('draft', 'review', 'final') DEFAULT 'final',
    admin_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (project_id) REFERENCES user_projects(id) ON DELETE CASCADE
) ENGINE=InnoDB;`;

        console.log('Applying project_reports table schema...');
        await connection.query(sql);
        console.log('Schema applied successfully.');

        await connection.end();
    } catch (error) {
        console.error('Error applying schema:', error.message);
        process.exit(1);
    }
}

applySchema();
