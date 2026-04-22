// Admin Management Routes
// Handles admin, developer, and user management from separate tables

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcryptjs');

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
        au.admin_level,
        au.access_level,
        au.department,
        au.is_active,
        au.last_login_at,
        au.last_login_ip,
        au.created_at,
        au.updated_at
      FROM admin_users au
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
// GET ALL DEVELOPER USERS
// =============================================
router.get('/developer-users', async (req, res) => {
  try {
    const [developerUsers] = await db.promise().query(`
      SELECT 
        du.id,
        du.email,
        du.first_name,
        du.last_name,
        du.display_name,
        du.developer_level,
        du.access_level,
        du.tech_stack,
        du.specialization,
        du.team_id,
        du.github_username,
        du.linkedin_url,
        du.is_active,
        du.last_login_at,
        du.last_login_ip,
        du.created_at,
        du.updated_at
      FROM developer_users du
      ORDER BY du.created_at DESC
    `);

    res.json({
      success: true,
      users: developerUsers,
      count: developerUsers.length
    });

  } catch (error) {
    console.error('Error fetching developer users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch developer users',
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
        u.primary_role,
        u.is_active,
        u.last_login,
        u.last_login_ip,
        u.created_at,
        u.updated_at,
        tm.name as job_title,
        tm.role as job_role
      FROM users u
      LEFT JOIN team_members tm ON u.job_id = tm.id
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

    // Validate admin code if provided
    if (admin_code && admin_code !== '***REMOVED***') {
      return res.status(403).json({
        success: false,
        message: 'Invalid admin code for admin account creation'
      });
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
// CREATE DEVELOPER USER
// =============================================
router.post('/create-developer', async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      developer_level = 'mid',
      access_level = 'limited',
      tech_stack = [],
      specialization = 'General',
      team_id = null,
      github_username = '',
      linkedin_url = ''
    } = req.body;

    // Basic validation
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if user already exists in developer table
    const [existingDeveloper] = await db.promise().query(
      'SELECT id FROM developer_users WHERE email = ?',
      [email]
    );

    if (existingDeveloper.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Developer user with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create developer user
    const [result] = await db.promise().query(`
      INSERT INTO developer_users (
        email, password_hash, first_name, last_name, developer_level,
        access_level, tech_stack, specialization, team_id,
        github_username, linkedin_url, is_active, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      email, hashedPassword, first_name, last_name, developer_level,
      access_level, JSON.stringify(tech_stack), specialization, team_id,
      github_username, linkedin_url, 1
    ]);

    res.status(201).json({
      success: true,
      message: 'Developer user created successfully',
      userId: result.insertId,
      developer_level: developer_level,
      access_level: access_level
    });

  } catch (error) {
    console.error('Error creating developer user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create developer user',
      error: error.message
    });
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
    } else if (role_type === 'developer') {
      tableName = 'developer_users';
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
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { role_type } = req.query;

    if (!role_type) {
      return res.status(400).json({
        success: false,
        message: 'Role type parameter is required'
      });
    }

    let tableName;
    if (role_type === 'admin') {
      tableName = 'admin_users';
    } else if (role_type === 'developer') {
      tableName = 'developer_users';
    } else {
      tableName = 'users';
    }

    // Soft delete by setting deleted_at
    const [result] = await db.promise().query(
      `UPDATE ${tableName} SET deleted_at = NOW(), is_active = 0 WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully',
      userId: id,
      role_type: role_type
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
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { role_type } = req.query;

    if (!role_type) {
      return res.status(400).json({
        success: false,
        message: 'Role type parameter is required'
      });
    }

    let query;
    if (role_type === 'admin') {
      query = `
        SELECT 
          au.id, au.email, au.first_name, au.last_name, au.display_name,
          au.admin_level, au.access_level, au.department,
          au.is_active, au.last_login_at, au.last_login_ip,
          au.created_at, au.updated_at, au.deleted_at
        FROM admin_users au
        WHERE au.id = ? AND au.deleted_at IS NULL
      `;
    } else if (role_type === 'developer') {
      query = `
        SELECT 
          du.id, du.email, du.first_name, du.last_name, du.display_name,
          du.developer_level, du.access_level, du.tech_stack,
          du.specialization, du.team_id, du.github_username, du.linkedin_url,
          du.is_active, du.last_login_at, du.last_login_ip,
          du.created_at, du.updated_at, du.deleted_at
        FROM developer_users du
        WHERE du.id = ? AND du.deleted_at IS NULL
      `;
    } else {
      query = `
        SELECT 
          u.id, u.email, u.first_name, u.last_name, u.display_name,
          u.primary_role, u.is_active, u.last_login, u.last_login_ip,
          u.created_at, u.updated_at, u.deleted_at,
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
// GET DASHBOARD DATA
// =============================================
router.get('/dashboard', async (req, res) => {
  try {
    // Get counts from all tables
    const [adminCount] = await db.promise().query(
      'SELECT COUNT(*) as count FROM admin_users WHERE is_active = 1 AND deleted_at IS NULL'
    );
    
    const [developerCount] = await db.promise().query(
      'SELECT COUNT(*) as count FROM developer_users WHERE is_active = 1 AND deleted_at IS NULL'
    );
    
    const [userCount] = await db.promise().query(
      'SELECT COUNT(*) as count FROM users WHERE is_active = 1 AND deleted_at IS NULL'
    );

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
        'developer_login' as type,
        display_name as user_name,
        last_login_at as timestamp,
        'Developer logged in' as description
       FROM developer_users 
       WHERE last_login_at IS NOT NULL 
       ORDER BY last_login_at DESC 
       LIMIT 5)
      UNION ALL
      (SELECT 
        'user_login' as type,
        display_name as user_name,
        last_login as timestamp,
        'User logged in' as description
       FROM users 
       WHERE last_login IS NOT NULL 
       ORDER BY last_login DESC 
       LIMIT 5)
      ORDER BY timestamp DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      dashboard: {
        userCounts: {
          admins: adminCount[0].count,
          developers: developerCount[0].count,
          users: userCount[0].count,
          total: adminCount[0].count + developerCount[0].count + userCount[0].count
        },
        recentActivity: recentActivity,
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

module.exports = router;
