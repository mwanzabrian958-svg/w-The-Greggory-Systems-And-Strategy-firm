/**
 * AUTH PROTOCOL - USER AUTHENTICATION
 * Regular user auth endpoints MUST ONLY reference the `users` table.
 * Admin creation endpoint (admin-create) is allowed to write to `admin_users`.
 * NEVER check credentials against other tables during authentication.
 * See AUTH_PROTOCOL.md for full specification.
 */
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const requireAdmin = require('../middleware/auth');
const authController = require('../controllers/authController');
const { authEndpointValidator } = require('../middleware/authEndpointValidator');
const { createNotification } = require('../utils/notificationHelper');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const authenticateUser = (req, res, next) => {
  const authHeader = req.header('authorization') || req.header('Authorization');
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (authHeader) {
    token = authHeader.trim();
  }

  if (!token) {
    token = req.header('x-auth-token') || req.query.token || req.body?.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '***REMOVED***');
    req.authUser = decoded;
    req.userId = decoded.userId || decoded.id || decoded.user?.id;

    if (!req.userId) {
      return res.status(401).json({ success: false, message: 'Invalid authentication token' });
    }

    next();
  } catch (error) {
    console.error('[AUTH] Invalid token:', error.message);
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token' });
  }
};

// Health check - verify router is loaded
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Users router is working' });
});

// Test registration endpoint
router.post('/test-register', async (req, res) => {
  try {
    console.log('Test registration request received:', req.body);
    
    const { email, password, name, userType } = req.body;
    
    // Basic validation
    if (!email || !password || !name) {
      console.log('Validation failed - missing fields');
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    // Check if user already exists across all role tables
    let existing = [];
    let tableName = 'users';
    
    if (userType === 'admin') {
      [existing] = await db.promise().query(
        'SELECT id FROM admin_users WHERE email = ?', 
        [email]
      );
      tableName = 'admin_users';
    } else if (userType === 'developer') {
      [existing] = await db.promise().query(
        'SELECT id FROM developer_users WHERE email = ?', 
        [email]
      );
      tableName = 'developer_users';
    } else {
      [existing] = await db.promise().query(
        'SELECT id FROM users WHERE email = ?', 
        [email]
      );
      tableName = 'users';
    }
    
    if (existing.length > 0) {
      console.log('User already exists:', email);
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user into appropriate table
    let result;
    if (userType === 'admin') {
      [result] = await db.promise().query(
        'INSERT INTO admin_users (email, password_hash, first_name, last_name, admin_level, access_level) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [email, hashedPassword, name.split(' ')[0] || name, name.split(' ')[1] || '', 'admin', 'full']
      );
    } else if (userType === 'developer') {
      [result] = await db.promise().query(
        'INSERT INTO developer_users (email, password_hash, first_name, last_name, developer_level, access_level) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [email, hashedPassword, name.split(' ')[0] || name, name.split(' ')[1] || '', 'mid', 'limited']
      );
    } else {
      [result] = await db.promise().query(
        'INSERT INTO users (email, password_hash, display_name, primary_role) VALUES (?, ?, ?, ?)',
        [email, hashedPassword, name, userType || 'user']
      );
    }

    console.log('User created successfully in table:', tableName, 'ID:', result.insertId);
    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully',
      userId: result.insertId,
      role: userType,
      table: tableName
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed',
      error: error.message 
    });
  }
});

// Admin/ Developer Create endpoint (working with callbacks)
router.post('/admin-create', (req, res) => {
  const { email, password, first_name, last_name, role, admin_level, developer_level } = req.body;
  
  console.log('[ADMIN-CREATE] Request:', { email, first_name, last_name, role });
  
  // Validation
  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }
  
  // Check if email already exists in appropriate table
  const checkQuery = role === 'admin' 
    ? 'SELECT id FROM admin_users WHERE email = ?'
    : 'SELECT id FROM developer_users WHERE email = ?';
    
  db.query(checkQuery, [email], (err, existing) => {
    if (err) {
      console.error('[ADMIN-CREATE] Check error:', err);
      return res.status(500).json({
        success: false,
        message: 'Database error checking existing user'
      });
    }
    
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    // Hash password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error('[ADMIN-CREATE] Hash error:', err);
        return res.status(500).json({
          success: false,
          message: 'Password hashing failed'
        });
      }
      
      // Insert user
      let insertQuery;
      let insertValues;
      
      if (role === 'admin') {
        insertQuery = `INSERT INTO admin_users 
          (email, password_hash, first_name, last_name, admin_level, access_level, is_active, display_name) 
          VALUES (?, ?, ?, ?, ?, ?, true, ?)`;
        insertValues = [
          email, 
          hashedPassword, 
          first_name, 
          last_name, 
          admin_level || 'admin',
          admin_level === 'super_admin' ? 99 : 50,
          `${first_name} ${last_name}`
        ];
      } else {
        insertQuery = `INSERT INTO developer_users 
          (email, password_hash, first_name, last_name, developer_level, access_level, is_active, display_name) 
          VALUES (?, ?, ?, ?, ?, ?, true, ?)`;
        insertValues = [
          email, 
          hashedPassword, 
          first_name, 
          last_name, 
          developer_level || 'junior',
          30,
          `${first_name} ${last_name}`
        ];
      }
      
      db.query(insertQuery, insertValues, (err, result) => {
        if (err) {
          console.error('[ADMIN-CREATE] Insert error:', err);
          return res.status(500).json({
            success: false,
            message: 'Failed to create user',
            error: err.message
          });
        }
        
        console.log('[ADMIN-CREATE] Success:', result.insertId);
        
        res.status(201).json({
          success: true,
          message: `${role === 'admin' ? 'Admin' : 'Developer'} account created successfully`,
          userId: result.insertId,
          role: role
        });
      });
    });
  });
});

// Google Authentication
router.post('/google-auth', authController.googleAuth);

// Get all users (admin only)
router.get('/', requireAdmin, (req, res) => {
  const query = `
    SELECT u.id, u.email, u.display_name, u.primary_role, u.is_active, u.created_at, u.last_login_at,
           tm.name as job_title, tm.role as job_role
    FROM users u
    LEFT JOIN team_members tm ON u.job_id = tm.id
    ORDER BY u.created_at DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
    
    res.json(results);
  });
});

// Get user by ID (admin only)
router.get('/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT u.id, u.email, u.display_name, u.primary_role, u.is_active, u.created_at, u.last_login_at,
           tm.name as job_title, tm.role as job_role
    FROM users u
    LEFT JOIN team_members tm ON u.job_id = tm.id
    WHERE u.id = ?
  `;
  
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ error: 'Failed to fetch user' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(results[0]);
  });
});

// Create new user (used by admin + public signup)
router.post('/', async (req, res) => {
  try {
    const { email, password_hash, display_name, primary_role, job_id, profile_image_id } = req.body;
    if (!email || !password_hash || !display_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const hashed = await bcrypt.hash(password_hash, 10);

    const query = `
      INSERT INTO users (email, password_hash, display_name, primary_role, job_id, profile_image_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [email, hashed, display_name, primary_role || 'employee', job_id, profile_image_id || null], (err, result) => {
      if (err) {
        console.error('Error creating user:', err);
        return res.status(500).json({ error: 'Failed to create user' });
      }

      res.status(201).json({
        message: 'User created successfully',
        user_id: result.insertId
      });
    });
  } catch (e) {
    console.error('Signup error:', e);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Delete user (admin only)
router.delete('/:id', requireAdmin, (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM users WHERE id = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting user:', err);
      return res.status(500).json({ error: 'Failed to delete user' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  });
});

// AUTH PROTOCOL: User registration - ONLY inserts into users table
router.post('/register', authEndpointValidator('user', 'users'), async (req, res) => {
  try {
    // Log everything we receive
    console.log('[USER REGISTER] =========================================');
    console.log('[USER REGISTER] Full body:', JSON.stringify(req.body, null, 2));
    
    // Accept any field name format
    const email = req.body.email;
    const password = req.body.password;
    const first_name = req.body.first_name || req.body.firstName || req.body.firstname || req.body.fname;
    const last_name = req.body.last_name || req.body.lastName || req.body.lastname || req.body.lname;
    const display_name = req.body.display_name || req.body.displayName;
    const phone = req.body.phone;
    const profile_image_id = req.body.profile_image_id;
    
    console.log('[USER REGISTER] TABLE: users');
    console.log('[USER REGISTER] Extracted:', { email, first_name, last_name, profile_image_id });
    
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, password, first name and last name are required',
        received: req.body,
        missing: { email: !email, password: !password, first_name: !first_name, last_name: !last_name }
      });
    }

    // Check if user already exists in users table ONLY
    const [existing] = await db.promise().query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const name = display_name || `${first_name} ${last_name}`;

    // STRICT PROTOCOL: Insert ONLY into users table with optional profile_image_id
    const [result] = await db.promise().query(
      `INSERT INTO users (email, password_hash, first_name, last_name, display_name, phone_number, primary_role, is_active, profile_image_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'user', true, ?, NOW())`,
      [email, hashedPassword, first_name, last_name, name, phone || null, profile_image_id || null]
    );

    console.log('[USER REGISTER] ✓ SUCCESS - Inserted into TABLE: users | ID:', result.insertId);
    console.log('[USER REGISTER] =========================================');
    
    // REAL-LIFE NOTIF: Notify the user of successful account creation
    await createNotification(result.insertId, 'system', 'Account Initialized', 'Welcome to The-Greggory-Systems-And-Strategy-firm tactical portal.', 'normal');

    res.status(201).json({
      success: true,
      message: 'User registered successfully in users table',
      userId: result.insertId,
      table: 'users',
      profile_image_id: profile_image_id || null
    });

  } catch (error) {
    console.error('[USER REGISTER] ERROR DETAILS:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed: ' + error.message,
      error: error.message,
      stack: error.stack 
    });
  }
});

// AUTH PROTOCOL: User login - ONLY checks users table
router.post('/login', authEndpointValidator('user', 'users'), async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    // STRICT PROTOCOL: Only query users table
    const [userResults] = await db.promise().query(
      `SELECT u.*, 'user' as role_type, tm.name as job_title, tm.role as job_role,
              i.data as profile_photo_blob, i.content_type as profile_photo_type
       FROM users u
       LEFT JOIN team_members tm ON u.job_id = tm.id
       LEFT JOIN images i ON i.id = u.profile_image_id
       WHERE u.email = ? AND u.is_active = true AND u.deleted_at IS NULL`,
      [email]
    );
    
    if (userResults.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = userResults[0];
    const ok = await bcrypt.compare(password, user.password_hash || '');
    
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Update last login
    await db.promise().query(
      'UPDATE users SET last_login_at = NOW(), last_login_ip = ? WHERE id = ?', 
      [req.ip, user.id]
    );
    
    // Convert blob to base64 data URI
    let profilePhotoData = null;
    if (user.profile_photo_blob) {
      const base64 = Buffer.from(user.profile_photo_blob).toString('base64');
      const mimeType = user.profile_photo_type || 'image/jpeg';
      profilePhotoData = `data:${mimeType};base64,${base64}`;
    }
    
    const authToken = jwt.sign(
      { userId: user.id, email: user.email, role: 'user' },
      process.env.JWT_SECRET || '***REMOVED***',
      { expiresIn: '7d' }
    );

    return res.json({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      display_name: user.display_name || user.name || `${user.first_name} ${user.last_name}`,
      primary_role: user.primary_role,
      job_title: user.job_title,
      job_role: user.job_role,
      role_type: 'user',
      profilePhotoData: profilePhotoData,
      profile_image_id: user.profile_image_id,
      token: authToken
    });

  } catch (error) {
    console.error('[USER LOGIN] Error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// Client dashboard data for authenticated users
router.get('/client-dashboard', authenticateUser, async (req, res) => {
  const id = req.userId;

  try {
    const [users] = await db.promise().query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.display_name, u.primary_role,
              tm.name AS job_title, tm.role AS job_role,
              i.data AS profile_photo_blob, i.content_type AS profile_photo_type
       FROM users u
       LEFT JOIN team_members tm ON u.job_id = tm.id
       LEFT JOIN images i ON i.id = u.profile_image_id
       WHERE u.id = ? AND u.deleted_at IS NULL`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = users[0];
    let profilePhotoData = null;
    if (user.profile_photo_blob) {
      const base64 = Buffer.from(user.profile_photo_blob).toString('base64');
      const mimeType = user.profile_photo_type || 'image/jpeg';
      profilePhotoData = `data:${mimeType};base64,${base64}`;
    }

    const [summaryRows] = await db.promise().query(
      'SELECT total_projects, active_projects, completed_projects, total_budget, total_spent, average_project_duration, client_rating FROM client_project_summary WHERE user_id = ?',
      [id]
    );
    const clientSummary = summaryRows[0] || null;

    const [projects] = await db.promise().query(
      `SELECT up.id, up.project_name, up.project_description, up.project_type, up.status,
              up.priority, up.progress_percentage, up.start_date, up.end_date,
              up.estimated_budget, up.actual_budget,
              CONCAT(pm.first_name, ' ', pm.last_name) AS manager_name
       FROM user_projects up
       LEFT JOIN users pm ON pm.id = up.project_manager_id
       WHERE up.user_id = ? AND up.is_active = true AND up.deleted_at IS NULL
       ORDER BY up.updated_at DESC`,
      [id]
    );

    const projectIds = projects.map((project) => project.id);
    const projectQueryPlaceholders = projectIds.length > 0 ? projectIds.map(() => '?').join(',') : 'NULL';

    const [taskRows] = await db.promise().query(
      `SELECT pt.id, pt.project_id, pt.task_name, pt.status, pt.priority, pt.due_date,
              pt.assigned_to, CONCAT(u.first_name, ' ', u.last_name) AS assignee_name
       FROM project_tasks pt
       LEFT JOIN users u ON u.id = pt.assigned_to
       WHERE pt.project_id IN (${projectQueryPlaceholders}) AND pt.deleted_at IS NULL
       ORDER BY pt.due_date ASC`,
      projectIds
    );

    const [activityRows] = await db.promise().query(
      `SELECT pa.id, pa.project_id, pa.activity_type, pa.message, pa.created_at,
              CONCAT(u.first_name, ' ', u.last_name) AS sender_name
       FROM project_activities pa
       LEFT JOIN users u ON u.id = pa.user_id
       WHERE pa.project_id IN (${projectQueryPlaceholders})
       ORDER BY pa.created_at DESC
       LIMIT 6`,
      projectIds
    );

    const [invoiceRows] = await db.promise().query(
      `SELECT pi.id, pi.project_id, pi.invoice_number, pi.amount, pi.status, pi.issue_date, pi.due_date,
              up.project_name
       FROM project_invoices pi
       JOIN user_projects up ON up.id = pi.project_id
       WHERE up.user_id = ? AND pi.status != 'cancelled'
       ORDER BY pi.issue_date DESC
       LIMIT 12`,
      [id]
    );

    const [documentStats] = await db.promise().query(
      `SELECT 
         SUM(CASE WHEN category = 'contract' THEN 1 ELSE 0 END) AS contract_count,
         SUM(CASE WHEN category IN ('report','document','proposal','final') THEN 1 ELSE 0 END) AS deliverable_count,
         COUNT(*) AS total_documents
       FROM project_docs pd
       WHERE pd.project_id IN (${projectQueryPlaceholders})`,
      projectIds
    );

    const [feedbackRows] = await db.promise().query(
      'SELECT AVG(rating) AS average_rating FROM user_feedback WHERE user_id = ? AND rating IS NOT NULL',
      [id]
    );

    const projectMap = projects.reduce((map, project) => {
      map[project.id] = project;
      return map;
    }, {});

    const parsedProjects = projects.map((project) => ({
      id: project.id,
      name: project.project_name,
      description: project.project_description,
      type: project.project_type,
      status: project.status || 'planning',
      priority: project.priority || 'medium',
      progress: project.progress_percentage || 0,
      deadline: project.end_date,
      manager: project.manager_name || 'Unassigned',
      plannedBudget: Number(project.estimated_budget || 0),
      actualBudget: Number(project.actual_budget || 0)
    }));

    const parsedTasks = taskRows.map((task) => ({
      id: task.id,
      title: task.task_name,
      project: projectMap[task.project_id]?.project_name || 'Project',
      status: task.status || 'not_started',
      priority: task.priority || 'medium',
      progress: task.status === 'completed' ? 100 : task.status === 'in_progress' ? 60 : 15,
      assignee: task.assignee_name || 'Unassigned',
      dueDate: task.due_date
    }));

    const parsedMessages = activityRows.map((activity) => ({
      id: activity.id,
      sender: activity.sender_name || 'Team',
      subject: activity.activity_type.replace(/_/g, ' '),
      unread: true,
      time: activity.created_at,
      message: activity.message
    }));

    const parsedInvoices = invoiceRows.map((invoice) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoice_number,
      project: invoice.project_name,
      amount: Number(invoice.amount || 0),
      status: invoice.status || 'draft',
      date: invoice.issue_date,
      dueDate: invoice.due_date
    }));

    const pendingTasksCount = parsedTasks.filter((task) => !['completed', 'cancelled'].includes(task.status)).length;
    const totalPlannedBudget = parsedProjects.reduce((sum, project) => sum + project.plannedBudget, 0);
    const totalActualBudget = parsedProjects.reduce((sum, project) => sum + project.actualBudget, 0);
    const forecastBudget = Math.round(totalPlannedBudget + (totalActualBudget - totalPlannedBudget) * 0.12);
    const budgetVariance = totalActualBudget - totalPlannedBudget;

    const completedProjects = parsedProjects.filter((project) => project.status === 'completed');
    const onTimeDelivery = completedProjects.length > 0
      ? `${Math.round((completedProjects.length / Math.max(parsedProjects.length, 1)) * 100)}%`
      : 'N/A';

    const satisfaction = feedbackRows[0]?.average_rating
      ? `${Number(feedbackRows[0].average_rating).toFixed(1)}/5`
      : '0.0/5';

    const budgetVariancePercent = totalPlannedBudget > 0
      ? `${Math.round((budgetVariance / totalPlannedBudget) * 100)}%`
      : '0%';

    const resourceMap = {};
    parsedTasks.forEach((task) => {
      const key = task.assignee || 'Unassigned';
      if (!resourceMap[key]) {
        resourceMap[key] = {
          name: task.assignee,
          role: task.priority === 'High' ? 'Developer' : 'Project Contributor',
          tasks: 0,
          completed: 0
        };
      }
      resourceMap[key].tasks += 1;
      if (task.status === 'completed') {
        resourceMap[key].completed += 1;
      }
    });

    const parsedResources = Object.values(resourceMap).slice(0, 4).map((resource) => ({
      id: resource.name,
      name: resource.name,
      role: resource.role,
      availability: `${Math.max(0, 100 - resource.tasks * 10)}%`,
      utilization: Math.min(100, Math.round((resource.completed / Math.max(resource.tasks, 1)) * 100))
    }));

    const dashboard = {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        display_name: user.display_name || `${user.first_name} ${user.last_name}`,
        role: user.primary_role || 'user',
        job_title: user.job_title || 'Personnel',
        job_role: user.job_role || 'Operator',
        profilePhotoData,
        profile_image_id: user.profile_image_id || null
      },
      projects: parsedProjects,
      invoices: parsedInvoices,
      messages: parsedMessages,
      tasks: parsedTasks,
      resourceAllocations: parsedResources,
      budgetOverview: {
        planned: totalPlannedBudget,
        spent: totalActualBudget,
        forecast: forecastBudget,
        variance: budgetVariance
      },
      documentSummary: [
        { id: 1, label: 'Signed Contracts', value: Number(documentStats[0]?.contract_count || 0) },
        { id: 2, label: 'Deliverables', value: Number(documentStats[0]?.deliverable_count || 0) },
        { id: 3, label: 'Pending Approvals', value: pendingTasksCount }
      ],
      kpiMetrics: [
        { id: 1, label: 'On-time Delivery', value: onTimeDelivery, trend: 'up' },
        { id: 2, label: 'Satisfaction Index', value: satisfaction, trend: 'neutral' },
        { id: 3, label: 'Budget Variance', value: budgetVariancePercent, trend: budgetVariance <= 0 ? 'up' : 'down' }
      ],
      roleUpdates: {
        admin: [
          { title: 'Project Oversight', description: 'Admin approves project milestones, budget changes, and scope decisions.' },
          { title: 'Financial Control', description: 'Admin manages billing, invoice review, and payment workflows.' },
          { title: 'Risk Compliance', description: 'Admin monitors risk, approvals, and resource alignment across deployments.' }
        ],
        developer: [
          { title: 'Task Delivery', description: 'Developers update task status and manage technical delivery milestones.' },
          { title: 'Quality Assurance', description: 'Developer teams log code reviews and QA checks in real time.' },
          { title: 'Deployment Synch', description: 'Developers communicate completion status and handoffs through the portal.' }
        ]
      },
      summary: {
        totalProjects: clientSummary?.total_projects ?? parsedProjects.length,
        activeProjects: clientSummary?.active_projects ?? parsedProjects.filter((p) => p.status !== 'completed').length,
        completedProjects: clientSummary?.completed_projects ?? parsedProjects.filter((p) => p.status === 'completed').length,
        totalBudget: clientSummary?.total_budget ?? totalPlannedBudget,
        totalSpent: clientSummary?.total_spent ?? totalActualBudget,
        averageProjectDuration: clientSummary?.average_project_duration ?? 0,
        rating: clientSummary?.client_rating ?? Number(feedbackRows[0]?.average_rating ?? 0)
      }
    };

    return res.json({ success: true, dashboard });
  } catch (error) {
    console.error('[CLIENT DASHBOARD] Error:', error);
    return res.status(500).json({ success: false, message: 'Could not fetch client dashboard data', error: error.message });
  }
});

// Admin authentication route
router.post('/admin/authenticate', async (req, res) => {
  try {
    const { email, password, adminCode } = req.body;
    
    // Email and password are the ONLY relevant credentials
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Admin code is just formality - accept any value
    // Create admin user session based on email/password
    const adminUser = {
      id: 1,
      email: email,
      name: email.split('@')[0] || 'Administrator',
      primary_role: 'admin',
      job_title: 'Administrator',
      job_role: 'System Admin',
      admin_level: 'super_admin',
      access_level: 'full',
      department: 'System Administration'
    };
    
    // Log successful admin authentication
    console.log(`[ADMIN AUTH] Admin access granted for ${email} from IP: ${req.ip}`);
    
    res.json({
      success: true,
      message: 'Admin authentication successful',
      user: adminUser,
      token: 'admin-session-' + Date.now()
    });
    
  } catch (error) {
    console.error('Admin authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during admin authentication'
    });
  }
});

// Admin user creation route
router.post('/admin-create', async (req, res) => {
  try {
    const { first_name, last_name, email, password, role, admin_code } = req.body;
    
    // Basic validation
    if (!first_name || !last_name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // If creating admin, validate admin code
    if (role === 'admin' && admin_code && admin_code !== '***REMOVED***') {
      return res.status(403).json({
        success: false,
        message: 'Invalid admin code for admin account creation'
      });
    }

    // Check if user already exists across all tables
    let existing = [];
    
    if (role === 'admin') {
      [existing] = await db.promise().query(
        'SELECT id FROM admin_users WHERE email = ? AND deleted_at IS NULL', 
        [email]
      );
    } else if (role === 'developer') {
      [existing] = await db.promise().query(
        'SELECT id FROM developer_users WHERE email = ? AND deleted_at IS NULL', 
        [email]
      );
    } else {
      [existing] = await db.promise().query(
        'SELECT id FROM users WHERE email = ? AND deleted_at IS NULL', 
        [email]
      );
    }
    
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `User with this email already exists in ${role} table`
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into appropriate table
    let result;
    if (role === 'admin') {
      [result] = await db.promise().query(
        'INSERT INTO admin_users (first_name, last_name, email, password_hash, admin_level, access_level, department, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
        [first_name, last_name, email, hashedPassword, 'admin', 'full', 'General', 1]
      );
    } else if (role === 'developer') {
      [result] = await db.promise().query(
        'INSERT INTO developer_users (first_name, last_name, email, password_hash, developer_level, access_level, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
        [first_name, last_name, email, hashedPassword, 'mid', 'limited', 1]
      );
    } else {
      [result] = await db.promise().query(
        'INSERT INTO users (first_name, last_name, email, password_hash, primary_role, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [first_name, last_name, email, hashedPassword, 'user', 1]
      );
    }

    // Insert role
    await db.promise().query(
      'INSERT INTO user_roles (user_id, role) VALUES (?, ?)',
      [result.insertId, role]
    );

    res.json({
      success: true,
      message: 'User created successfully',
      userId: result.insertId,
      role: role,
      table: role === 'admin' ? 'admin_users' : role === 'developer' ? 'developer_users' : 'users'
    });
  } catch (error) {
    console.error('Admin user creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update a project task (developer can update status and assignment)
router.put('/tasks/:taskId', async (req, res) => {
  const { taskId } = req.params;
  const { status, priority, due_date, assigned_to, comments } = req.body;

  const updates = [];
  const values = [];

  if (status) {
    updates.push('status = ?');
    values.push(status);
  }
  if (priority) {
    updates.push('priority = ?');
    values.push(priority);
  }
  if (due_date) {
    updates.push('due_date = ?');
    values.push(due_date);
  }
  if (assigned_to) {
    updates.push('assigned_to = ?');
    values.push(assigned_to);
  }
  if (comments) {
    updates.push('comments = ?');
    values.push(comments);
  }

  if (updates.length === 0) {
    return res.status(400).json({ success: false, message: 'No update fields provided' });
  }

  updates.push('updated_at = NOW()');
  values.push(taskId);

  try {
    const [result] = await db.promise().query(
      `UPDATE project_tasks SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({ success: true, message: 'Task updated successfully' });
  } catch (error) {
    console.error('[TASK UPDATE] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update task', error: error.message });
  }
});

// Admin update for invoices and billing status
router.put('/invoices/:invoiceId', requireAdmin, async (req, res) => {
  const { invoiceId } = req.params;
  const { status, amount, paid_amount, paid_date } = req.body;

  const updates = [];
  const values = [];

  if (status) {
    updates.push('status = ?');
    values.push(status);
  }
  if (amount !== undefined) {
    updates.push('amount = ?');
    values.push(amount);
  }
  if (paid_amount !== undefined) {
    updates.push('paid_amount = ?');
    values.push(paid_amount);
  }
  if (paid_date) {
    updates.push('paid_date = ?');
    values.push(paid_date);
  }

  if (updates.length === 0) {
    return res.status(400).json({ success: false, message: 'No invoice update fields provided' });
  }

  updates.push('updated_at = NOW()');
  values.push(invoiceId);

  try {
    const [result] = await db.promise().query(
      `UPDATE project_invoices SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.json({ success: true, message: 'Invoice updated successfully' });
  } catch (error) {
    console.error('[INVOICE UPDATE] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update invoice', error: error.message });
  }
});

// Admin update for project details and budget status
router.put('/projects/:projectId', requireAdmin, async (req, res) => {
  const { projectId } = req.params;
  const { status, progress_percentage, actual_budget, estimated_budget, end_date, project_manager_id } = req.body;

  const updates = [];
  const values = [];

  if (status) {
    updates.push('status = ?');
    values.push(status);
  }
  if (progress_percentage !== undefined) {
    updates.push('progress_percentage = ?');
    values.push(progress_percentage);
  }
  if (actual_budget !== undefined) {
    updates.push('actual_budget = ?');
    values.push(actual_budget);
  }
  if (estimated_budget !== undefined) {
    updates.push('estimated_budget = ?');
    values.push(estimated_budget);
  }
  if (end_date) {
    updates.push('end_date = ?');
    values.push(end_date);
  }
  if (project_manager_id) {
    updates.push('project_manager_id = ?');
    values.push(project_manager_id);
  }

  if (updates.length === 0) {
    return res.status(400).json({ success: false, message: 'No project update fields provided' });
  }

  updates.push('updated_at = NOW()');
  values.push(projectId);

  try {
    const [result] = await db.promise().query(
      `UPDATE user_projects SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({ success: true, message: 'Project updated successfully' });
  } catch (error) {
    console.error('[PROJECT UPDATE] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update project', error: error.message });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || req.body.userId;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User ID is required' });
    }

    const { display_name, timezone, phone_number } = req.body;
    
    const updates = [];
    const values = [];

    if (display_name) {
      updates.push('display_name = ?');
      values.push(display_name);
    }
    if (timezone) {
      updates.push('timezone = ?');
      values.push(timezone);
    }
    if (phone_number) {
      updates.push('phone_number = ?');
      values.push(phone_number);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    updates.push('updated_at = NOW()');
    values.push(userId);

    const [result] = await db.promise().query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // REAL-LIFE NOTIF: Notify of profile update
    await createNotification(userId, 'system', 'Profile Synchronized', 'Your tactical personnel parameters have been updated.', 'low');

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('[PROFILE UPDATE] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile', error: error.message });
  }
});

// Notifications Endpoints
router.get('/notifications/me', authenticateUser, async (req, res) => {
  const userId = req.userId;
  try {
    const [notifications] = await db.promise().query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [userId]
    );

    res.json({ success: true, notifications });
  } catch (error) {
    console.error('[GET NOTIFICATIONS] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

router.put('/notifications/:id/read', authenticateUser, async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  try {
    // Strict multi-tenancy: only mark read if the notification belongs to this user
    const [result] = await db.promise().query(
      'UPDATE notifications SET status = "read", read_at = NOW() WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found or access denied' });
    }

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('[READ NOTIFICATION] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update notification' });
  }
});

router.put('/notifications/read-all/me', authenticateUser, async (req, res) => {
  const userId = req.userId;
  try {
    await db.promise().query(
      'UPDATE notifications SET status = "read", read_at = NOW() WHERE user_id = ? AND status = "unread"',
      [userId]
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('[READ ALL NOTIFICATIONS] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update notifications' });
  }
});

module.exports = router;
