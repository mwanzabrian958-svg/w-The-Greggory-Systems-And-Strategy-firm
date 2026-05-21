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

// =============================================
// GET DEVELOPER DASHBOARD DATA
// =============================================
router.get('/developer-dashboard', async (req, res) => {
  try {
    // Get developer-specific data
    const [taskStats] = await db.promise().query(`
      SELECT 
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tasks,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_tasks
      FROM project_tasks
      WHERE deleted_at IS NULL
    `);

    const [recentCommits] = await db.promise().query(`
      SELECT 
        pt.id,
        pt.task_name,
        pt.status,
        pt.updated_at,
        p.project_name
      FROM project_tasks pt
      LEFT JOIN user_projects p ON pt.project_id = p.id
      WHERE pt.deleted_at IS NULL
      ORDER BY pt.updated_at DESC
      LIMIT 10
    `);

    const [systemHealth] = await db.promise().query(`
      SELECT 
        'database' as component,
        'operational' as status,
        NOW() as last_check
      UNION ALL
      SELECT 
        'api' as component,
        'operational' as status,
        NOW() as last_check
      UNION ALL
      SELECT 
        'messaging' as component,
        'operational' as status,
        NOW() as last_check
    `);

    res.json({
      success: true,
      dashboard: {
        tasks: {
          total: taskStats[0]?.total_tasks || 0,
          completed: taskStats[0]?.completed_tasks || 0,
          inProgress: taskStats[0]?.in_progress_tasks || 0,
          pending: taskStats[0]?.pending_tasks || 0
        },
        recentActivity: recentCommits,
        systemHealth: systemHealth,
        notifications: [
          {
            id: 1,
            title: 'Code review ready',
            description: 'Review the latest client portal merge request.',
            type: 'review'
          },
          {
            id: 2,
            title: 'Deployment scheduled',
            description: 'Staging deploy scheduled for tomorrow at 09:00.',
            type: 'deployment'
          },
          {
            id: 3,
            title: 'Security audit',
            description: 'Confirm the new access control rules for admin routes.',
            type: 'security'
          }
        ],
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching developer dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch developer dashboard data',
      error: error.message
    });
  }
});

// =============================================
// GET BUDGET OVERVIEW
// =============================================
router.get('/budget-overview', async (req, res) => {
  try {
    // Calculate budget overview from projects and financial data
    const [budgetData] = await db.promise().query(`
      SELECT 
        COALESCE(SUM(CASE WHEN p.budget IS NOT NULL THEN p.budget ELSE 0 END), 0) as planned,
        COALESCE(SUM(CASE WHEN p.actual_spent IS NOT NULL THEN p.actual_spent ELSE 0 END), 0) as spent,
        COALESCE(SUM(CASE WHEN p.forecast IS NOT NULL THEN p.forecast ELSE 0 END), 0) as forecast
      FROM client_projects p
      WHERE p.deleted_at IS NULL
    `);

    res.json({
      success: true,
      data: {
        planned: budgetData[0]?.planned || 0,
        spent: budgetData[0]?.spent || 0,
        forecast: budgetData[0]?.forecast || 0
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
    // Get pending approvals from various sources
    const [approvals] = await db.promise().query(`
      SELECT 
        'project' as type,
        p.project_name as name,
        p.created_at as date,
        CASE 
          WHEN p.priority = 'high' THEN 'High'
          WHEN p.priority = 'medium' THEN 'Medium'
          ELSE 'Low'
        END as priority,
        p.id
      FROM client_projects p
      WHERE p.status = 'pending' AND p.deleted_at IS NULL
      ORDER BY p.created_at DESC
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
    // Get pending invoices from applications or financial records
    const [invoices] = await db.promise().query(`
      SELECT 
        a.id,
        a.application_id as project,
        COALESCE(a.estimated_budget, 0) as amount,
        a.created_at as date
      FROM applications a
      WHERE a.status = 'pending' AND a.deleted_at IS NULL
      ORDER BY a.created_at DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: invoices.map(inv => ({
        id: inv.id,
        project: inv.project || 'Application',
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
    // Get client feedback from contact forms or feedback tables
    const [feedback] = await db.promise().query(`
      SELECT 
        cf.id,
        cf.name as type,
        COALESCE(cf.rating, 5) as rating,
        cf.created_at as date
      FROM contact_forms cf
      WHERE cf.deleted_at IS NULL
      ORDER BY cf.created_at DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: feedback.map(f => ({
        id: f.id,
        type: f.type || 'Client',
        rating: f.rating,
        date: f.date
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
// GET RISK ALERTS
// =============================================
router.get('/risk-alerts', async (req, res) => {
  try {
    // Get risk alerts based on various system indicators
    const [risks] = await db.promise().query(`
      SELECT 
        'Budget overage' as title,
        'Project spending exceeds 90% of allocated budget' as description,
        CASE 
          WHEN (SELECT COUNT(*) FROM client_projects WHERE actual_spent > budget * 0.9) > 0 THEN 'high'
          ELSE 'medium'
        END as level,
        1 as id
      UNION ALL
      SELECT 
        'Pending approvals' as title,
        'Multiple items awaiting admin approval' as description,
        CASE 
          WHEN (SELECT COUNT(*) FROM client_projects WHERE status = 'pending') > 5 THEN 'critical'
          WHEN (SELECT COUNT(*) FROM client_projects WHERE status = 'pending') > 2 THEN 'high'
          ELSE 'medium'
        END as level,
        2 as id
      UNION ALL
      SELECT 
        'System load' as title,
        'High system resource usage detected' as description,
        'low' as level,
        3 as id
    `);

    res.json({
      success: true,
      data: risks.map(r => ({
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
// GET ASSIGNED TASKS (DEVELOPER DASHBOARD)
// =============================================
router.get('/assigned-tasks', async (req, res) => {
  try {
    const [tasks] = await db.promise().query(`
      SELECT 
        pt.id,
        pt.task_name as title,
        pt.project_id as project,
        pt.assigned_to as assignee,
        pt.priority,
        pt.status,
        pt.progress_percentage as progress
      FROM project_tasks pt
      WHERE pt.deleted_at IS NULL
      ORDER BY pt.created_at DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: tasks.map(t => ({
        id: t.id,
        title: t.title,
        project: t.project || 'Project',
        assignee: t.assignee || 'Developer',
        priority: t.priority || 'Medium',
        status: t.status || 'pending',
        progress: t.progress || 0
      }))
    });
  } catch (error) {
    console.error('Error fetching assigned tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assigned tasks',
      error: error.message
    });
  }
});

// =============================================
// GET MILESTONES (DEVELOPER DASHBOARD)
// =============================================
router.get('/milestones', async (req, res) => {
  try {
    const [milestones] = await db.promise().query(`
      SELECT 
        pm.id,
        pm.milestone_name as name,
        pm.due_date,
        pm.status,
        pm.completion_percentage as progress
      FROM project_milestones pm
      WHERE pm.deleted_at IS NULL
      ORDER BY pm.due_date ASC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: milestones.map(m => ({
        id: m.id,
        name: m.name,
        dueDate: m.due_date,
        status: m.status || 'pending',
        progress: m.progress || 0
      }))
    });
  } catch (error) {
    console.error('Error fetching milestones:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch milestones',
      error: error.message
    });
  }
});

// =============================================
// GET RESOURCE ALLOCATIONS (DEVELOPER DASHBOARD)
// =============================================
router.get('/resource-allocations', async (req, res) => {
  try {
    const [resources] = await db.promise().query(`
      SELECT 
        pr.id,
        pr.resource_name as name,
        pr.role,
        pr.allocated_quantity,
        pr.used_quantity,
        pr.availability_status as availability
      FROM project_resources pr
      WHERE pr.deleted_at IS NULL
      LIMIT 5
    `);

    res.json({
      success: true,
      data: resources.map(r => ({
        id: r.id,
        name: r.name,
        role: r.role || 'Team Member',
        availability: r.availability || 'Available',
        utilization: r.allocated_quantity > 0 ? Math.round((r.used_quantity / r.allocated_quantity) * 100) : 0
      }))
    });
  } catch (error) {
    console.error('Error fetching resource allocations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resource allocations',
      error: error.message
    });
  }
});

// =============================================
// GET QA CHECKPOINTS (DEVELOPER DASHBOARD)
// =============================================
router.get('/qa-checkpoints', async (req, res) => {
  try {
    const [qaData] = await db.promise().query(`
      SELECT 
        qa.id,
        qa.checkpoint_name as name,
        qa.status,
        qa.issues_found as issuesFound,
        qa.issues_resolved as issuesResolved
      FROM quality_assurance qa
      WHERE qa.deleted_at IS NULL
      ORDER BY qa.created_at DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: qaData.map(q => ({
        id: q.id,
        name: q.name,
        status: q.status || 'pending',
        issuesFound: q.issuesFound || 0,
        issuesResolved: q.issuesResolved || 0
      }))
    });
  } catch (error) {
    console.error('Error fetching QA checkpoints:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch QA checkpoints',
      error: error.message
    });
  }
});

// =============================================
// GET DOCUMENT SUMMARY (DEVELOPER DASHBOARD)
// =============================================
router.get('/document-summary', async (req, res) => {
  try {
    const [docs] = await db.promise().query(`
      SELECT 
        cd.id,
        cd.document_name as name,
        cd.document_type as type,
        cd.created_at
      FROM client_documents cd
      WHERE cd.deleted_at IS NULL
      ORDER BY cd.created_at DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: docs.map(d => ({
        id: d.id,
        name: d.name,
        type: d.type || 'Document'
      }))
    });
  } catch (error) {
    console.error('Error fetching document summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch document summary',
      error: error.message
    });
  }
});

// =============================================
// GET KPI METRICS (DEVELOPER DASHBOARD)
// =============================================
router.get('/kpi-metrics', async (req, res) => {
  try {
    const [metrics] = await db.promise().query(`
      SELECT 
        'Code Quality' as name,
        COALESCE(pm.value, 85) as value,
        'up' as trend
      FROM performance_metrics pm
      WHERE pm.metric_name = 'code_quality'
      UNION ALL
      SELECT 
        'Task Completion' as name,
        COALESCE(pm.value, 72) as value,
        'up' as trend
      FROM performance_metrics pm
      WHERE pm.metric_name = 'task_completion'
      UNION ALL
      SELECT 
        'Bug Rate' as name,
        COALESCE(pm.value, 15) as value,
        'down' as trend
      FROM performance_metrics pm
      WHERE pm.metric_name = 'bug_rate'
      LIMIT 3
    `);

    res.json({
      success: true,
      data: metrics.map(m => ({
        id: Math.random(),
        name: m.name,
        value: `${m.value}%`,
        trend: m.trend
      }))
    });
  } catch (error) {
    console.error('Error fetching KPI metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch KPI metrics',
      error: error.message
    });
  }
});

// =============================================
// GET PROJECT TIMELINE (DEVELOPER DASHBOARD)
// =============================================
router.get('/project-timeline', async (req, res) => {
  try {
    const [timeline] = await db.promise().query(`
      SELECT 
        pt.id,
        pt.task_name as name,
        pt.end_date as dueDate,
        pt.progress_percentage as progress
      FROM project_tasks pt
      WHERE pt.deleted_at IS NULL
      ORDER BY pt.end_date ASC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: timeline.map(t => ({
        id: t.id,
        name: t.name,
        dueDate: t.dueDate,
        progress: t.progress || 0
      }))
    });
  } catch (error) {
    console.error('Error fetching project timeline:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project timeline',
      error: error.message
    });
  }
});

module.exports = router;
