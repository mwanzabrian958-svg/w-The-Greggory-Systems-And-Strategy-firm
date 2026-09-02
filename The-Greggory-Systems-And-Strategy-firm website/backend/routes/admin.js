// Admin Management Routes
// Handles admin and user management from separate tables

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { formatActivityLog } = require('../utils/activityLogFormatter');
const { verifySessionToken } = require('../utils/sessionToken');

/**
 * Authenticate an admin session (same scheme as the main server's
 * `authenticateAdmin` middleware). Verifies the signed session token that the
 * login endpoints now issue (see backend/utils/sessionToken.js).
 */
function requireAdminSession(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization || '';
  const m = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!m) {
    return res.status(401).json({ success: false, message: 'Admin authentication required' });
  }
  const payload = verifySessionToken(m[1].trim());
  if (!payload) {
    return res.status(401).json({ success: false, message: 'Invalid or expired admin session' });
  }
  req.adminId = payload.uid;
  next();
}

// =============================================
// GET LIVE USERS (Who's Online)
// =============================================
router.get('/live-users', async (req, res) => {
  try {
    // Define "Live" as activity within the last 5 minutes
    const LIVE_THRESHOLD = '5 MINUTE';

    const [liveUsers] = await db.promise().query(`
      (SELECT id, display_name, email, 'client' as role_type, last_active_at, profile_photo_blob IS NOT NULL as has_photo
       FROM users
       WHERE last_active_at > DATE_SUB(NOW(), INTERVAL ${LIVE_THRESHOLD}) AND deleted_at IS NULL)
      UNION ALL
      (SELECT id, display_name, email, admin_level as role_type, last_active_at, profile_photo_blob IS NOT NULL as has_photo
       FROM admin_users
       WHERE last_active_at > DATE_SUB(NOW(), INTERVAL ${LIVE_THRESHOLD}) AND deleted_at IS NULL)
      UNION ALL
      (SELECT id, display_name, email, developer_level as role_type, last_active_at, profile_photo_blob IS NOT NULL as has_photo
       FROM developer_users
       WHERE last_active_at > DATE_SUB(NOW(), INTERVAL ${LIVE_THRESHOLD}) AND deleted_at IS NULL)
      ORDER BY last_active_at DESC
    `);

    res.json({
      success: true,
      count: liveUsers.length,
      users: liveUsers.map(u => ({
        ...u,
        online: true,
        last_active: u.last_active_at
      }))
    });
  } catch (error) {
    console.error('Error fetching live users:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =============================================
// GLOBAL SEARCH TELEMETRY
// =============================================
router.get('/search', async (req, res) => {
  try {
    const { q, deep } = req.query;
    if (!q || q.length < 2) return res.json({ success: true, results: [] });

    const searchTerm = `%${q}%`;
    const isDeep = deep === 'true';
    const limit = isDeep ? 20 : 5;

    // 1. Search Personnel (Users, Admins) - PURGED DEVELOPERS
    const personnelQuery = isDeep
      ? `(SELECT 'user' as type, id, COALESCE(display_name, CONCAT_WS(' ', first_name, last_name), email) as title, email, phone_number as phone, primary_role as role, is_active, created_at as metadata, CONCAT('/admin/users/detail/', id, '/client') as link FROM users WHERE (display_name LIKE ? OR email LIKE ? OR phone_number LIKE ?) AND deleted_at IS NULL)
         UNION ALL
         (SELECT 'user' as type, id, COALESCE(display_name, CONCAT_WS(' ', first_name, last_name), email) as title, email, phone_number as phone, admin_level as role, is_active, created_at as metadata, CONCAT('/admin/users/detail/', id, '/admin') as link FROM admin_users WHERE (display_name LIKE ? OR email LIKE ? OR phone_number LIKE ?) AND deleted_at IS NULL)
         LIMIT ?`
      : `(SELECT 'user' as type, id, COALESCE(display_name, CONCAT_WS(' ', first_name, last_name), email) as title, email as subtitle, CONCAT('/admin/users/detail/', id, '/client') as link FROM users WHERE (display_name LIKE ? OR email LIKE ?) AND deleted_at IS NULL)
         UNION ALL
         (SELECT 'user' as type, id, COALESCE(display_name, CONCAT_WS(' ', first_name, last_name), email) as title, email as subtitle, CONCAT('/admin/users/detail/', id, '/admin') as link FROM admin_users WHERE (display_name LIKE ? OR email LIKE ?) AND deleted_at IS NULL)
         LIMIT ?`;

    const personnelParams = isDeep
      ? [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, limit]
      : [searchTerm, searchTerm, searchTerm, searchTerm, limit];

    const [users] = await db.promise().query(personnelQuery, personnelParams);

    // 2. Search Projects
    const projectQuery = isDeep
      ? "SELECT 'project' as type, id, project_name as title, client_name as subtitle, project_description as description, status, progress_percentage as metadata, '/admin/projects' as link FROM user_projects WHERE (project_name LIKE ? OR client_name LIKE ?) AND deleted_at IS NULL LIMIT ?"
      : "SELECT 'project' as type, id, project_name as title, client_name as subtitle, '/admin/projects' as link FROM user_projects WHERE (project_name LIKE ? OR client_name LIKE ?) AND deleted_at IS NULL LIMIT ?";

    const [projects] = await db.promise().query(projectQuery, [searchTerm, searchTerm, limit]);

    // 3. Search Ledger
    const [ledger] = await db.promise().query(
      "SELECT 'ledger' as type, id, description as title, CONCAT('KSH ', FORMAT(amount, 2)) as subtitle, '/admin/billing' as link FROM accounting_entries WHERE (description LIKE ? OR transaction_reference LIKE ?) AND deleted_at IS NULL LIMIT ?",
      [searchTerm, searchTerm, limit]
    );

    // 4. Search Tasks
    const [tasks] = await db.promise().query(
      "SELECT 'task' as type, id, task_name as title, task_description as description, status, priority as metadata, CONCAT('/admin/projects/', project_id, '/tasks') as link FROM project_tasks WHERE (task_name LIKE ? OR task_description LIKE ?) AND deleted_at IS NULL LIMIT ?",
      [searchTerm, searchTerm, limit]
    );

    res.json({
      success: true,
      results: [...users, ...projects, ...ledger, ...tasks]
    });
  } catch (error) {
    console.error('Global Search Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =============================================
// GET ALL ADMIN USERS
// =============================================
router.get('/admin-users', async (req, res) => {
  try {
    const [adminUsers] = await db.promise().query(`
      SELECT 
        au.id,
        au.email,
        au.first_name,
        au.last_name,
        au.display_name,
        au.phone_number,
        au.physical_address,
        au.id_number,
        au.alt_phone,
        au.expertise,
        au.private_notes,
        au.manual_projects,
        au.emergency_contact_name,
        au.emergency_contact_phone,
        au.admin_level,
        au.access_level,
        au.department,
        au.is_active,
        au.last_login_at,
        au.last_login_ip,
        au.last_active_at,
        au.whatsapp_verified,
        au.whatsapp_auth_key,
        au.created_at,
        au.updated_at
      FROM admin_users au
      WHERE au.deleted_at IS NULL
      ORDER BY au.created_at DESC
    `);

    res.json({
      success: true,
      users: adminUsers,
      count: adminUsers.length
    });

  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin users',
      error: error.message
    });
  }
});

// =============================================
// GET ALL REGULAR USERS
// =============================================
router.get('/users', async (req, res) => {
  try {
    const [regularUsers] = await db.promise().query(`
      SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.display_name,
        u.phone_number,
        u.physical_address,
        u.id_number,
        u.alt_phone,
        u.expertise,
        u.private_notes,
        u.manual_projects,
        u.emergency_contact_name,
        u.emergency_contact_phone,
        u.primary_role,
        u.is_active,
        u.last_login_at,
        u.last_login_ip,
        u.last_active_at,
        u.whatsapp_verified,
        u.whatsapp_auth_key,
        u.created_at,
        u.updated_at,
        tm.name as job_title,
        tm.role as job_role
      FROM users u
      LEFT JOIN team_members tm ON u.job_id = tm.id
      WHERE u.deleted_at IS NULL
      ORDER BY u.created_at DESC
    `);

    res.json({
      success: true,
      users: regularUsers,
      count: regularUsers.length
    });

  } catch (error) {
    console.error('Error fetching regular users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch regular users',
      error: error.message
    });
  }
});

// =============================================
// CREATE ADMIN USER
// =============================================
router.post('/create-admin', async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      admin_level = 'admin',
      access_level = 'full',
      department = 'General',
      admin_code
    } = req.body;

    // Basic validation
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Validate admin code if provided (must match ADMIN_CODE configured in .env).
    // Fail-closed: if ADMIN_CODE is not configured, no code can pass.
    if (admin_code) {
      const expected = process.env.ADMIN_CODE;
      if (!expected || admin_code !== expected) {
        return res.status(403).json({
          success: false,
          message: 'Invalid admin code for admin account creation'
        });
      }
    }

    // Check if user already exists in admin table
    const [existingAdmin] = await db.promise().query(
      'SELECT id FROM admin_users WHERE email = ?',
      [email]
    );

    if (existingAdmin.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Admin user with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    const [result] = await db.promise().query(`
      INSERT INTO admin_users (
        email, password_hash, first_name, last_name, admin_level, 
        access_level, department, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      email, hashedPassword, first_name, last_name, admin_level,
      access_level, department, 1
    ]);

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      userId: result.insertId,
      admin_level: admin_level,
      access_level: access_level
    });

  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin user',
      error: error.message
    });
  }
});

// =============================================
// EXPORT USER PROFILE AS PDF
// =============================================
router.get('/users/:id/export-pdf', async (req, res) => {
  try {
    const { id } = req.params;
    const { role_type } = req.query;

    let query;
    if (role_type === 'admin') {
      query = 'SELECT * FROM admin_users WHERE id = ? AND deleted_at IS NULL';
    } else if (role_type === 'developer') {
      query = 'SELECT * FROM developer_users WHERE id = ? AND deleted_at IS NULL';
    } else {
      query = 'SELECT * FROM users WHERE id = ? AND deleted_at IS NULL';
    }

    const [users] = await db.promise().query(query, [id]);
    if (users.length === 0) return res.status(404).send('User not found');

    const user = users[0];
    const name = user.display_name || `${user.first_name} ${user.last_name}`;

    // Simple Text-based PDF Relay (In production, use a library like PDFKit)
    const profileText = `
==================================================
GREGGORY SYSTEMS & STRATEGY FIRM
OFFICIAL PERSONNEL IDENTITY REPORT
==================================================
Generated: ${new Date().toLocaleString()}
Node ID: ${user.id}
Status: ${user.is_active ? 'ACTIVE' : 'INACTIVE'}
Role: ${user.admin_level || user.primary_role || 'Personnel'}

[ IDENTITY PHOTO ATTACHED IN DIGITAL PORTAL ]
--------------------------------------------------

PRIMARY IDENTIFICATION:
Full Name: ${name}
Primary Email: ${user.email}
Secure Line: ${user.phone_number || 'NOT RECORDED'}
Backup Phone: ${user.alt_phone || 'NOT RECORDED'}
ID/Passport: ${user.id_number || 'NOT RECORDED'}

PROFESSIONAL MATRIX:
Department: ${user.department || 'Operations'}
Expertise: ${user.expertise || 'General'}
Joined: ${new Date(user.created_at).toLocaleDateString()}

PHYSICAL ADDRESS:
${user.physical_address || 'NOT RECORDED'}

EMERGENCY CONTACT:
Name: ${user.emergency_contact_name || 'NOT RECORDED'}
Phone: ${user.emergency_contact_phone || 'NOT RECORDED'}

MISSION BRIEFING & DIRECTIVES:
${user.mission_briefing || 'No specific directive assigned.'}

INTERNAL COMPANY NOTES (RESTRICTED ACCESS):
${user.private_notes || 'None recorded.'}

--------------------------------------------------
END OF IDENTITY REPORT
© 2024 Greggory Systems & Strategy Firm
CONFIDENTIAL - INTERNAL USE ONLY
==================================================
    `;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="PROFILE_${name.replace(/\s+/g, '_')}.pdf"`);

    // For now, sending as a plain text buffer that opens in PDF viewers
    // In a real environment, we'd pipe through a PDF generator
    res.send(Buffer.from(profileText, 'utf-8'));

  } catch (error) {
    console.error('Export Error:', error);
    res.status(500).send('Export synchronization failed');
  }
});

// =============================================
// UPDATE USER DETAILS
// =============================================
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name, last_name, email, role, admin_level, department,
      mission_briefing, is_active, phone_number, physical_address,
      id_number, alt_phone, expertise, private_notes, manual_projects,
      emergency_contact_name, emergency_contact_phone
    } = req.body;

    const roleType = req.query.role_type || (role === 'admin' ? 'admin' : 'client');

    let tableName;
    let updates = [];
    let params = [];

    const commonUpdates = [
      'first_name = ?', 'last_name = ?', 'email = ?', 'phone_number = ?',
      'physical_address = ?', 'id_number = ?', 'alt_phone = ?', 'expertise = ?',
      'private_notes = ?', 'manual_projects = ?', 'emergency_contact_name = ?',
      'emergency_contact_phone = ?', 'is_active = ?'
    ];

    const commonParams = [
      first_name, last_name, email, phone_number || null,
      physical_address || null, id_number || null, alt_phone || null, expertise || null,
      private_notes || null, manual_projects || null, emergency_contact_name || null,
      emergency_contact_phone || null, is_active ? 1 : 0
    ];

    if (roleType === 'admin') {
      tableName = 'admin_users';
      updates = [...commonUpdates, 'admin_level = ?', 'department = ?'];
      params = [...commonParams, admin_level || 'admin', department || 'General'];
    } else {
      tableName = 'users';
      updates = [...commonUpdates, 'primary_role = ?', 'mission_briefing = ?'];
      params = [...commonParams, role || 'user', mission_briefing || null];
    }

    params.push(id);
    const [result] = await db.promise().query(
      `UPDATE ${tableName} SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
      params
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User details synchronized successfully'
    });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, message: 'Internal update failure', error: error.message });
  }
});

// =============================================
// UPDATE USER STATUS
// =============================================
router.put('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, role_type } = req.body;

    if (!status || !role_type) {
      return res.status(400).json({
        success: false,
        message: 'Status and role_type are required'
      });
    }

    let tableName;
    if (role_type === 'admin') {
      tableName = 'admin_users';
    } else {
      tableName = 'users';
    }

    const [result] = await db.promise().query(
      `UPDATE ${tableName} SET is_active = ?, updated_at = NOW() WHERE id = ?`,
      [status === 'active' ? 1 : 0, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User status updated to ${status}`,
      userId: id,
      role_type: role_type
    });

  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message
    });
  }
});

// =============================================
// DELETE USER
// =============================================
router.delete('/users/:id', requireAdminSession, async (req, res) => {
  try {
    const { id } = req.params;
    const { role_type } = req.query;

    if (!role_type) {
      return res.status(400).json({
        success: false,
        message: 'Role type parameter is required'
      });
    }

    // Map the role_type (as reported by the user-management UI: source_table)
    // to the correct identity table so the deletion lands in the right table.
    // Developer accounts are purged from this project — only `users` and
    // `admin_users` are active identity tables.
    const tableMap = {
      admin: 'admin_users', admin_users: 'admin_users', 'admin-user': 'admin_users',
      client: 'users', user: 'users', users: 'users'
    };
    const tableName = tableMap[String(role_type).toLowerCase()] || 'users';

    // Grab the target row first (for the audit trail + existence check), then
    // soft-delete it so the change is actually applied in the database.
    const [targets] = await db.promise().query(
      `SELECT id, display_name, email FROM ${tableName} WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );

    if (targets.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found in the requested identity table'
      });
    }
    const target = targets[0];

    // Soft delete by setting deleted_at, disabling the account, and recording
    // who performed the termination.
    const [result] = await db.promise().query(
      `UPDATE ${tableName} SET deleted_at = NOW(), is_active = 0, deleted_by = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL`,
      [req.adminId || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Best-effort audit trail (admin id must exist in `users` for the FK —
    // failures are swallowed so deletion is never blocked by logging).
    try {
      await db.promise().query(
        `INSERT INTO admin_activity_logs (admin_user_id, action_type, action_description, affected_table, affected_record_id, old_values, ip_address, created_at)
         VALUES (?, 'USER_DELETED', ?, ?, ?, ?, ?, NOW())`,
        [
          req.adminId || 0,
          `Soft-deleted ${tableName.slice(0, -6)} account "${target.display_name || target.email || target.id}" (id: ${id})`,
          tableName,
          id,
          JSON.stringify({ deleted_at: new Date().toISOString(), is_active: 0 })
        ]
      );
    } catch (logError) {
      console.warn('[ADMIN] Could not write USER_DELETED activity log:', logError.message);
    }

    res.json({
      success: true,
      message: 'User deleted successfully',
      userId: id,
      role_type: role_type,
      table: tableName
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

// =============================================
// GET USER BY ID
// =============================================
router.get('/users/:id', requireAdminSession, async (req, res) => {
  try {
    const { id } = req.params;
    const { role_type } = req.query;

    if (!role_type) {
      return res.status(400).json({
        success: false,
        message: 'Role type parameter is required'
      });
    }

    const tableMap = {
      admin: 'admin_users', admin_users: 'admin_users', 'admin-user': 'admin_users',
      client: 'users', user: 'users', users: 'users'
    };
    const tableName = tableMap[String(role_type).toLowerCase()] || 'users';

    let query;
    if (tableName === 'admin_users') {
      query = `
        SELECT 
          au.id, au.email, au.first_name, au.last_name, au.display_name,
          au.phone_number, au.physical_address, au.id_number, au.alt_phone,
          au.expertise, au.private_notes, au.manual_projects,
          au.emergency_contact_name, au.emergency_contact_phone,
          au.admin_level, au.access_level, au.department, au.mission_briefing,
          au.is_active, au.last_login_at, au.last_login_ip,
          au.created_at, au.updated_at, au.deleted_at
        FROM admin_users au
        WHERE au.id = ? AND au.deleted_at IS NULL
      `;
    } else {
      query = `
        SELECT 
          u.id, u.email, u.first_name, u.last_name, u.display_name,
          u.phone_number, u.physical_address, u.id_number, u.alt_phone,
          u.expertise, u.private_notes, u.manual_projects,
          u.emergency_contact_name, u.emergency_contact_phone,
          u.primary_role, u.mission_briefing, u.is_active, u.last_login_at,
          u.last_login_ip, u.created_at, u.updated_at, u.deleted_at,
          tm.name as job_title, tm.role as job_role
        FROM users u
        LEFT JOIN team_members tm ON u.job_id = tm.id
        WHERE u.id = ? AND u.deleted_at IS NULL
      `;
    }

    const [users] = await db.promise().query(query, [id]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: users[0],
      role_type: role_type
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
});

// =============================================
// GET ACTIVITY LOGS
// =============================================
router.get('/activity-logs', async (req, res) => {
  try {
    const [activityRows] = await db.promise().query(`
      SELECT
        aal.id,
        aal.action_type,
        aal.action_description,
        aal.affected_table,
        aal.affected_record_id,
        aal.created_at,
        aal.ip_address,
        u.first_name,
        u.last_name,
        u.display_name,
        u.email AS admin_email
      FROM admin_activity_logs aal
      LEFT JOIN users u ON aal.admin_user_id = u.id
      ORDER BY aal.created_at DESC
      LIMIT 200
    `);

    const activities = activityRows.map((row) => {
      const formatted = formatActivityLog(row);
      const actorName = [row.display_name, row.first_name, row.last_name].find(Boolean) || 'System';
      const activityLabel = formatted.type ? formatted.type.replace(/_/g, ' ').toLowerCase() : 'activity';

      return {
        id: formatted.id,
        activity: formatted.type,
        details: formatted.description,
        admin_name: actorName,
        admin_email: row.admin_email || null,
        ip_address: row.ip_address || 'N/A',
        timestamp: row.created_at,
        success: true,
        status: formatted.status,
        type: activityLabel,
        ...formatted
      };
    });

    res.json(activities);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity logs',
      error: error.message
    });
  }
});

// =============================================
// GET DASHBOARD DATA
// =============================================
router.get('/dashboard', async (req, res) => {
  try {
    // Get counts from necessary tables - PURGED DEVELOPERS
    const [adminCount] = await db.promise().query(
      'SELECT COUNT(*) as count FROM admin_users WHERE is_active = 1 AND deleted_at IS NULL'
    );
    
    const [userCount] = await db.promise().query(
      'SELECT COUNT(*) as count FROM users WHERE is_active = 1 AND deleted_at IS NULL'
    );

    const [verifiedCount] = await db.promise().query(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE whatsapp_verified = 1 AND deleted_at IS NULL) +
        (SELECT COUNT(*) FROM admin_users WHERE whatsapp_verified = 1 AND deleted_at IS NULL) as count
    `);

    const [activeProjectsCount] = await db.promise().query(
      "SELECT COUNT(*) as count FROM user_projects WHERE status IN ('in-progress', 'active') AND deleted_at IS NULL"
    );

    const [pendingApprovalsCount] = await db.promise().query(
      "SELECT COUNT(*) as count FROM user_projects WHERE status IN ('planning', 'pending') AND deleted_at IS NULL"
    );

    const [liveUsersCount] = await db.promise().query(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE last_active_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE) AND deleted_at IS NULL) +
        (SELECT COUNT(*) FROM admin_users WHERE last_active_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE) AND deleted_at IS NULL) +
        (SELECT COUNT(*) FROM developer_users WHERE last_active_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE) AND deleted_at IS NULL) as count
    `);

    // Get recent activity
    const [recentActivity] = await db.promise().query(`
      (SELECT 
        'admin_login' as type,
        display_name as user_name,
        last_login_at as timestamp,
        'Admin logged in' as description
       FROM admin_users 
       WHERE last_login_at IS NOT NULL
       ORDER BY last_login_at DESC 
       LIMIT 5)
      UNION ALL
      (SELECT 
        'user_login' as type,
        display_name as user_name,
        last_login_at as timestamp,
        'User logged in' as description
       FROM users 
       WHERE last_login_at IS NOT NULL
       ORDER BY last_login_at DESC
       LIMIT 5)
      ORDER BY timestamp DESC
      LIMIT 10
    `);

    const [relayActivity] = await db.promise().query(`
      SELECT
        action_type,
        action_description,
        created_at,
        affected_table,
        affected_record_id
      FROM admin_activity_logs
      WHERE action_type IN ('SMS_SENT', 'WHATSAPP_SENT', 'BULK_SMS_SENT', 'BULK_WHATSAPP_SENT')
      ORDER BY created_at DESC
      LIMIT 8
    `);

    const combinedActivity = [
      ...recentActivity.map((activity) => ({
        ...activity,
        action: activity.description || 'Activity',
        timestamp: activity.timestamp || new Date().toISOString(),
        source: 'system'
      })),
      ...relayActivity.map((activity) => ({
        id: `relay-${activity.created_at}`,
        action: `${activity.action_type.replace(/_/g, ' ')} · ${activity.action_description}`,
        timestamp: activity.created_at,
        source: 'relay',
        status: activity.action_description?.toLowerCase().includes('queued') ? 'queued' : 'sent'
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

    res.json({
      success: true,
      dashboard: {
        userCounts: {
          admins: adminCount[0].count,
          users: userCount[0].count,
          verified: verifiedCount[0].count,
          live: liveUsersCount[0].count,
          total: adminCount[0].count + userCount[0].count,
          total_active_projects: activeProjectsCount[0].count
        },
        pending_count: pendingApprovalsCount[0].count,
        recentActivity: combinedActivity,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
});

// =============================================
// GET BUDGET OVERVIEW
// =============================================
router.get('/budget-overview', async (req, res) => {
  try {
    // 1. Project-based Budget Data
    const [projectBudgetData] = await db.promise().query(`
      SELECT 
        COALESCE(SUM(actual_budget), 0) as spent,
        COALESCE(SUM(estimated_budget), 0) as planned,
        COALESCE(SUM(estimated_budget * 1.1), 0) as forecast
      FROM user_projects
      WHERE deleted_at IS NULL
    `);

    // 2. Ledger-based Financial Telemetry
    const [financialData] = await db.promise().query(`
      SELECT
        COALESCE(SUM(CASE WHEN entry_type IN ('income', 'invoice_payment') THEN amount ELSE 0 END), 0) as revenue,
        COALESCE(SUM(CASE WHEN entry_type = 'expense' THEN amount ELSE 0 END), 0) as expenses
      FROM accounting_entries
      WHERE deleted_at IS NULL AND payment_status = 'completed'
    `);

    const [activeProjectsCount] = await db.promise().query(
      "SELECT COUNT(*) as count FROM user_projects WHERE status IN ('in-progress', 'active') AND deleted_at IS NULL"
    );

    const revenue = financialData[0]?.revenue || 0;
    const expenses = financialData[0]?.expenses || 0;
    const net_income = revenue - expenses;
    const active_count = activeProjectsCount[0]?.count || 0;

    // LEDGER-STRICT TELEMETRY:
    // We now only report data from real ledger entries. Project budget metadata is ignored for "Spent".
    const real_spent = expenses;
    const planned = projectBudgetData[0]?.planned || 0;

    // Only show remaining/forecast if there is actual ledger activity
    const remaining = Math.max(0, planned - real_spent);
    const forecast = real_spent > 0 ? (real_spent * 1.1) : 0;

    // MISSION CRITICAL: Persist this telemetry snapshot to the database for historical audit
    // Only record if there is actual movement to avoid empty row bloat
    if (revenue > 0 || expenses > 0 || active_count > 0) {
      try {
        await db.promise().query(`
          INSERT INTO firm_financial_telemetry (
            total_revenue, total_expenses, net_income,
            total_planned_budget, total_spent_budget,
            forecasted_burn, remaining_capital, active_projects_count
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [revenue, expenses, net_income, planned, real_spent, forecast, remaining, active_count]
        );
      } catch (telemetryErr) {
        console.warn('[TELEMETRY] Failed to commit snapshot:', telemetryErr.message);
      }
    }

    res.json({
      success: true,
      data: {
        planned,
        spent: real_spent,
        forecast,
        revenue,
        expenses,
        net_income,
        active_projects: active_count,
        remaining: real_spent > 0 ? remaining : 0
      }
    });
  } catch (error) {
    console.error('Error fetching budget overview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch budget overview',
      error: error.message
    });
  }
});

// =============================================
// GET PENDING APPROVALS
// =============================================
router.get('/pending-approvals', async (req, res) => {
  try {
    // Get pending approvals from the new user_projects table
    const [approvals] = await db.promise().query(`
      SELECT 
        'project' as type,
        project_name as name,
        created_at as date,
        priority,
        id
      FROM user_projects
      WHERE status = 'planning' AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: approvals.map(a => ({
        id: a.id,
        type: a.type,
        name: a.name,
        priority: a.priority,
        date: a.date
      }))
    });
  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending approvals',
      error: error.message
    });
  }
});

// =============================================
// GET PENDING INVOICES
// =============================================
router.get('/pending-invoices', async (req, res) => {
  try {
    // Get pending invoices from the invoices table
    const [invoices] = await db.promise().query(`
      SELECT 
        i.id,
        i.title as project,
        i.total_amount_kes as amount,
        i.created_at as date
      FROM invoices i
      WHERE i.status != 'paid' AND i.deleted_at IS NULL
      ORDER BY i.created_at DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: invoices.map(inv => ({
        id: inv.id,
        project: inv.project || 'Invoice',
        amount: inv.amount,
        date: inv.date
      }))
    });
  } catch (error) {
    console.error('Error fetching pending invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending invoices',
      error: error.message
    });
  }
});

// =============================================
// GET CLIENT FEEDBACK
// =============================================
router.get('/client-feedback', async (req, res) => {
  try {
    // Get client feedback with user details
    const [feedback] = await db.promise().query(`
      SELECT 
        uf.id,
        uf.feedback_type as type,
        uf.rating,
        uf.created_at as date,
        u.display_name as user_name,
        uf.title
      FROM user_feedback uf
      LEFT JOIN users u ON uf.user_id = u.id
      WHERE uf.deleted_at IS NULL
      ORDER BY uf.created_at DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: feedback.map(f => ({
        id: f.id,
        type: f.type || 'Client',
        rating: f.rating,
        date: f.date,
        user: f.user_name || 'Anonymous',
        title: f.title || 'Service Feedback'
      }))
    });
  } catch (error) {
    console.error('Error fetching client feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch client feedback',
      error: error.message
    });
  }
});

// =============================================
// GET GENERAL LEDGER TELEMETRY
// =============================================
router.get('/ledger', async (req, res) => {
  try {
    const { client_id, project_id, team_member_id, start_date, end_date, type } = req.query;

    let query = `
      SELECT
        ae.*,
        p.project_name,
        u.display_name as client_name,
        cb.display_name as creator_name
      FROM accounting_entries ae
      LEFT JOIN user_projects p ON ae.project_id = p.id
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN users cb ON ae.created_by = cb.id
      WHERE ae.deleted_at IS NULL
    `;

    const params = [];

    if (client_id) {
      query += " AND p.user_id = ?";
      params.push(client_id);
    }

    if (project_id) {
      query += " AND ae.project_id = ?";
      params.push(project_id);
    }

    if (team_member_id) {
      query += " AND (ae.project_id IN (SELECT project_id FROM project_team_members WHERE user_id = ? AND removed_at IS NULL))";
      params.push(team_member_id);
    }

    if (start_date && end_date) {
      query += " AND ae.transaction_date BETWEEN ? AND ?";
      params.push(start_date, end_date);
    }

    if (type && type !== 'all') {
      query += " AND ae.entry_type = ?";
      params.push(type);
    }

    query += " ORDER BY ae.transaction_date DESC, ae.created_at DESC LIMIT 500";

    const [entries] = await db.promise().query(query, params);

    // Metadata for filters
    const [clients] = await db.promise().query("SELECT id, display_name as name FROM users WHERE deleted_at IS NULL");
    const [projects] = await db.promise().query("SELECT id, project_name as name FROM user_projects WHERE deleted_at IS NULL");
    const [team] = await db.promise().query("SELECT id, display_name as name FROM users WHERE primary_role IN ('admin') AND deleted_at IS NULL");

    res.json({
      success: true,
      entries,
      filters: {
        clients,
        projects,
        team
      }
    });
  } catch (error) {
    console.error('Error fetching ledger:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =============================================
// GET RISK ALERTS
// =============================================
router.get('/risk-alerts', async (req, res) => {
  try {
    // Get real risk alerts based on budget overages
    const [budgetRisks] = await db.promise().query(`
      SELECT 
        'Budget overage' as title,
        CONCAT('Project \"', project_name, '\" exceeds 90% of allocated budget') as description,
        'high' as level,
        id
      FROM user_projects
      WHERE actual_budget > estimated_budget * 0.9 AND deleted_at IS NULL
    `);

    // Get real risks based on overdue tasks
    const [taskRisks] = await db.promise().query(`
      SELECT
        'Overdue Task' as title,
        CONCAT('Task \"', task_name, '\" is past due date') as description,
        'medium' as level,
        id
      FROM project_tasks
      WHERE due_date < NOW() AND status != 'completed' AND deleted_at IS NULL
    `);

    const allRisks = [...budgetRisks, ...taskRisks];

    res.json({
      success: true,
      data: allRisks.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        level: r.level
      }))
    });
  } catch (error) {
    console.error('Error fetching risk alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch risk alerts',
      error: error.message
    });
  }
});

// =============================================
// GET ASSIGNED TASKS - PURGED
// =============================================
router.get('/assigned-tasks', async (req, res) => {
  res.json({ success: true, data: [] });
});

// =============================================
// GET CRM TELEMETRY
// =============================================
router.get('/crm-telemetry', async (req, res) => {
  try {
    const [clients] = await db.promise().query(`
      SELECT
        u.id, u.display_name as name, u.email,
        COUNT(p.id) as projects,
        COALESCE(AVG(f.rating), 5.0) as satisfaction,
        'Active' as status
      FROM users u
      LEFT JOIN user_projects p ON u.id = p.user_id AND p.deleted_at IS NULL
      LEFT JOIN user_feedback f ON u.id = f.user_id AND f.deleted_at IS NULL
      WHERE u.deleted_at IS NULL
      GROUP BY u.id
      LIMIT 10
    `);

    const [opportunities] = await db.promise().query(`
      SELECT
        id, project_name as title, client_name as client,
        estimated_budget as value, 'Proposal' as stage,
        DATEDIFF(end_date, NOW()) as daysLeft
      FROM user_projects
      WHERE status = 'planning' AND deleted_at IS NULL
      LIMIT 5
    `);

    const [pipelineData] = await db.promise().query(`
      SELECT status, COUNT(*) as count
      FROM user_projects
      WHERE deleted_at IS NULL
      GROUP BY status
    `);

    const statusMap = {
      'planning': { label: 'Planning', color: 'bg-blue-100 text-blue-700' },
      'in-progress': { label: 'Active', color: 'bg-green-100 text-green-700' },
      'on-hold': { label: 'On Hold', color: 'bg-amber-100 text-amber-700' },
      'completed': { label: 'Completed', color: 'bg-emerald-100 text-emerald-700' }
    };

    const pipeline = pipelineData.map(d => ({
      stage: statusMap[d.status]?.label || d.status,
      count: d.count,
      color: statusMap[d.status]?.color || 'bg-slate-100 text-slate-700'
    }));

    res.json({
      success: true,
      clients,
      opportunities,
      pipeline
    });
  } catch (error) {
    console.error('Error fetching CRM telemetry:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// =============================================
// PROJECT REPORTS (POSTING AREA)
// =============================================
router.get('/projects/all', async (req, res) => {
  try {
    const [projects] = await db.promise().query(
      'SELECT id, project_name FROM user_projects WHERE deleted_at IS NULL ORDER BY project_name ASC'
    );
    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch projects' });
  }
});

router.post('/reports', async (req, res) => {
  try {
    const { project_id, title, summary, file_data, file_type, file_name, file_size, admin_id } = req.body;

    if (!project_id || !title || !file_data) {
      return res.status(400).json({ success: false, message: 'Project, Title, and File are required' });
    }

    const buffer = Buffer.from(file_data.split(',')[1] || file_data, 'base64');

    const [result] = await db.promise().query(`
      INSERT INTO project_reports (
        project_id, title, summary, file_data, file_type, file_size,
        report_date, status, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW(), 'final', ?, NOW())
    `, [project_id, title, summary, buffer, file_type || 'application/pdf', file_size || 0, admin_id || 1]);

    res.status(201).json({
      success: true,
      message: 'Report published successfully to project node',
      reportId: result.insertId
    });
  } catch (error) {
    console.error('Report Publication Error:', error);
    res.status(500).json({ success: false, message: 'Internal server failure during publication' });
  }
});

// =============================================
// ALERT RELAY (SYSTEM UPDATES WITH MEDIA)
// =============================================
router.post('/relay-alert', async (req, res) => {
  try {
    const { project_name, user_identity, title, message, media_data, media_type, media_name, priority } = req.body;

    const [userRows] = await db.promise().query(
      'SELECT id FROM users WHERE email = ? OR display_name = ? LIMIT 1',
      [user_identity, user_identity]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Unique user identity not found in node' });
    }

    const userId = userRows[0].id;
    let buffer = null;
    if (media_data) {
      buffer = Buffer.from(media_data.split(',')[1] || media_data, 'base64');
    }

    const finalMessage = `[Project: ${project_name}] ${message}`;

    const [result] = await db.promise().query(`
      INSERT INTO notifications (
        user_id, notification_type, title, message, priority,
        attachment_data, attachment_type, attachment_name,
        created_at, status
      ) VALUES (?, 'system', ?, ?, ?, ?, ?, ?, NOW(), 'unread')
    `, [userId, title, finalMessage, priority || 'normal', buffer, media_type, media_name]);

    res.json({ success: true, message: 'Strategic alert relayed successfully', id: result.insertId });

  } catch (error) {
    console.error('Relay Error:', error);
    res.status(500).json({ success: false, message: 'Relay link failed' });
  }
});

module.exports = router;
