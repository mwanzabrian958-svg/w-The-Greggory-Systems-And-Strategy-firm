/**
 * Team Templates migration — run once to create the tables:
 *   node scripts/create-team-tables.js
 *
 * team_templates: groups team members under a project with a team leader
 * team_template_members: links team_members to a template
 */
require('dotenv').config();
const db = require('../backend/config/database');

async function migrate() {
  try {
    console.log('[MIGRATE] Creating team_templates table...');
    await db.promise().query(`
      CREATE TABLE IF NOT EXISTS team_templates (
        id BIGINT(20) AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        project_id BIGINT(20) DEFAULT NULL,
        team_leader_id BIGINT(20) DEFAULT NULL,
        team_leader_image LONGBLOB DEFAULT NULL,
        team_leader_image_mime VARCHAR(100) DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_project_id (project_id),
        INDEX idx_team_leader_id (team_leader_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('[MIGRATE] team_templates OK');

    console.log('[MIGRATE] Creating team_template_members table...');
    await db.promise().query(`
      CREATE TABLE IF NOT EXISTS team_template_members (
        id BIGINT(20) AUTO_INCREMENT PRIMARY KEY,
        template_id BIGINT(20) NOT NULL,
        team_member_id BIGINT(20) NOT NULL,
        role VARCHAR(100) DEFAULT 'member',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_template_id (template_id),
        INDEX idx_team_member_id (team_member_id),
        FOREIGN KEY (template_id) REFERENCES team_templates(id) ON DELETE CASCADE,
        FOREIGN KEY (team_member_id) REFERENCES team_members(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('[MIGRATE] team_template_members OK');

    console.log('[MIGRATE] Done.');
    process.exit(0);
  } catch (error) {
    console.error('[MIGRATE] Error:', error.message);
    process.exit(1);
  }
}

migrate();
