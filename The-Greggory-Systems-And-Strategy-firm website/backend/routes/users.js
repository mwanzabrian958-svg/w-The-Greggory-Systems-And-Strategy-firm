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

// Admin Create endpoint
router.post('/admin-create', (req, res) => {
  const { email, password, first_name, last_name, role, admin_level } = req.body;
  
  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }
  
  const checkQuery = role === 'admin'
    ? 'SELECT id FROM admin_users WHERE email = ?'
    : 'SELECT id FROM users WHERE email = ?';
    
  db.query(checkQuery, [email], (err, existing) => {
    if (err) return res.status(500).json({ success: false, message: 'Database error' });
    
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) return res.status(500).json({ success: false, message: 'Hash failed' });
      
      let insertQuery;
      let insertValues;
      
      if (role === 'admin') {
        insertQuery = `INSERT INTO admin_users 
          (email, password_hash, first_name, last_name, admin_level, access_level, is_active, display_name) 
          VALUES (?, ?, ?, ?, ?, ?, true, ?)`;
        insertValues = [email, hashedPassword, first_name, last_name, admin_level || 'admin', 50, `${first_name} ${last_name}`];
      } else {
        insertQuery = `INSERT INTO users
          (email, password_hash, first_name, last_name, display_name, primary_role, is_active)
          VALUES (?, ?, ?, ?, ?, 'user', true)`;
        insertValues = [email, hashedPassword, first_name, last_name, `${first_name} ${last_name}`];
      }
      
      db.query(insertQuery, insertValues, (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Insert failed' });
        res.status(201).json({ success: true, message: 'User created successfully', userId: result.insertId, role: role });
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
    if (err) return res.status(500).json({ error: 'Failed to fetch users' });
    res.json(results);
  });
});

// Delete user (admin only)
router.delete('/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM users WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to delete user' });
    res.json({ message: 'User deleted successfully' });
  });
});

// AUTH PROTOCOL: User registration
router.post('/register', authEndpointValidator('user', 'users'), async (req, res) => {
  try {
    const { email, password, first_name, last_name, display_name, phone, profile_image_id } = req.body;
    
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ success: false, message: 'Fields required' });
    }

    const [existing] = await db.promise().query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ success: false, message: 'Email taken' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const name = display_name || `${first_name} ${last_name}`;

    const [result] = await db.promise().query(
      `INSERT INTO users (email, password_hash, first_name, last_name, display_name, phone_number, primary_role, is_active, profile_image_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'user', true, ?, NOW())`,
      [email, hashedPassword, first_name, last_name, name, phone || null, profile_image_id || null]
    );

    await createNotification(result.insertId, 'system', 'Account Initialized', 'Welcome to the tactical portal.', 'normal');
    res.status(201).json({ success: true, message: 'Registered', userId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// AUTH PROTOCOL: User login
router.post('/login', authEndpointValidator('user', 'users'), async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    const [userResults] = await db.promise().query(
      `SELECT u.*, 'user' as role_type, tm.name as job_title, tm.role as job_role,
              i.data as profile_photo_blob, i.content_type as profile_photo_type
       FROM users u
       LEFT JOIN team_members tm ON u.job_id = tm.id
       LEFT JOIN images i ON i.id = u.profile_image_id
       WHERE u.email = ? AND u.is_active = true AND u.deleted_at IS NULL`,
      [email]
    );
    
    if (userResults.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    
    const user = userResults[0];
    const ok = await bcrypt.compare(password, user.password_hash || '');
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    
    await db.promise().query('UPDATE users SET last_login_at = NOW(), last_login_ip = ? WHERE id = ?', [req.ip, user.id]);
    
    let profilePhotoData = null;
    if (user.profile_photo_blob) {
      const base64 = Buffer.from(user.profile_photo_blob).toString('base64');
      profilePhotoData = `data:${user.profile_photo_type || 'image/jpeg'};base64,${base64}`;
    }
    
    const authToken = jwt.sign({ userId: user.id, email: user.email, role: 'user' }, process.env.JWT_SECRET || '***REMOVED***', { expiresIn: '7d' });

    return res.json({
      id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name,
      display_name: user.display_name || `${user.first_name} ${user.last_name}`,
      primary_role: user.primary_role, role_type: 'user', profilePhotoData, token: authToken
    });
  } catch (error) {
    return res.status(500).json({ error: 'Login failed' });
  }
});

// Client dashboard
router.get('/client-dashboard', authenticateUser, async (req, res) => {
  const id = req.userId;
  try {
    const [users] = await db.promise().query(`SELECT * FROM users WHERE id = ? AND deleted_at IS NULL`, [id]);
    if (users.length === 0) return res.status(404).json({ success: false, message: 'User not found' });

    const user = users[0];
    const [projects] = await db.promise().query(`SELECT * FROM user_projects WHERE user_id = ? AND deleted_at IS NULL`, [id]);
    const [invoiceRows] = await db.promise().query(`SELECT pi.*, up.project_name FROM project_invoices pi JOIN user_projects up ON up.id = pi.project_id WHERE up.user_id = ?`, [id]);

    const dashboard = {
      user: { id: user.id, email: user.email, display_name: user.display_name, role: user.primary_role || 'user' },
      projects: projects.map(p => ({ id: p.id, name: p.project_name, status: p.status, progress: p.progress_percentage || 0 })),
      invoices: invoiceRows.map(i => ({ id: i.id, invoiceNumber: i.invoice_number, project: i.project_name, amount: Number(i.amount || 0), status: i.status })),
      kpiMetrics: [
        { label: 'On-time Delivery', value: '100%', trend: 'up' },
        { label: 'Satisfaction Index', value: '5.0/5', trend: 'neutral' },
        { label: 'Budget Variance', value: '0%', trend: 'up' }
      ]
    };

    return res.json({ success: true, dashboard });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error', error: error.message });
  }
});

// Profile Update
router.put('/profile', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || req.body.userId;
    if (!userId) return res.status(401).json({ success: false });
    const { display_name, phone_number } = req.body;
    await db.promise().query(`UPDATE users SET display_name = ?, phone_number = ?, updated_at = NOW() WHERE id = ?`, [display_name, phone_number, userId]);
    res.json({ success: true, message: 'Updated' });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// Notifications
router.get('/notifications/me', authenticateUser, async (req, res) => {
  const userId = req.userId;
  try {
    const [notifications] = await db.promise().query(
      'SELECT id, user_id, notification_type, title, message, priority, status, attachment_type, attachment_name, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [userId]
    );
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

router.get('/notifications/:id/attachment', authenticateUser, async (req, res) => {
  const userId = req.userId;
  const noteId = req.params.id;
  try {
    const [rows] = await db.promise().query('SELECT attachment_data, attachment_type, attachment_name FROM notifications WHERE id = ? AND user_id = ?', [noteId, userId]);
    if (rows.length === 0 || !rows[0].attachment_data) return res.status(404).json({ success: false });
    const item = rows[0];
    res.setHeader('Content-Type', item.attachment_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${item.attachment_name || 'download'}"`);
    res.send(item.attachment_data);
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

router.put('/notifications/:id/read', authenticateUser, async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  try {
    await db.promise().query('UPDATE notifications SET status = "read", read_at = NOW() WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

router.put('/notifications/read-all/me', authenticateUser, async (req, res) => {
  const userId = req.userId;
  try {
    await db.promise().query('UPDATE notifications SET status = "read", read_at = NOW() WHERE user_id = ? AND status = "unread"', [userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// Client Reports
router.get('/my-reports', authenticateUser, async (req, res) => {
  const userId = req.userId;
  try {
    const [reports] = await db.promise().query(`
      SELECT pr.id, pr.title, pr.summary, pr.file_type, pr.file_size, pr.report_date, pr.status, up.project_name
      FROM project_reports pr
      JOIN user_projects up ON pr.project_id = up.id
      WHERE up.user_id = ? AND pr.status = 'final' AND pr.deleted_at IS NULL
      ORDER BY pr.report_date DESC
    `, [userId]);
    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

router.get('/my-reports/:id/download', authenticateUser, async (req, res) => {
  const userId = req.userId;
  const reportId = req.params.id;
  try {
    const [reports] = await db.promise().query(`
      SELECT pr.file_data, pr.file_type, pr.title
      FROM project_reports pr
      JOIN user_projects up ON pr.project_id = up.id
      WHERE pr.id = ? AND up.user_id = ?
    `, [reportId, userId]);
    if (reports.length === 0) return res.status(403).json({ success: false });
    const report = reports[0];
    res.setHeader('Content-Type', report.file_type);
    res.setHeader('Content-Disposition', `attachment; filename="${report.title}.pdf"`);
    res.send(report.file_data);
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;
