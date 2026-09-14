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
const authenticateUser = require('../middleware/clientAuth');
const authController = require('../controllers/authController');
const { authEndpointValidator } = require('../middleware/authEndpointValidator');
const { createNotification } = require('../utils/notificationHelper');
const crypto = require('crypto');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Health check - verify router is loaded
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Users router is working' });
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

  try {
    const [users] = await db.promise().query('SELECT id, first_name FROM users WHERE email = ? AND deleted_at IS NULL', [email]);

    // For security, we always return success even if email not found
    if (users.length > 0) {
      const user = users[0];
      // In a real production setup, here we would:
      // 1. Generate a temporary reset token
      // 2. Save it to a password_resets table
      // 3. Send an email via SMTP_USER
      console.log(`[PASSWORD RESET] Requested for: ${email}`);

      await createNotification(user.id, 'system', 'Security Alert', 'A password reset was requested for your account.', 'high');
    }

    res.json({ success: true, message: `If an account exists for ${email}, you will receive a reset link shortly.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error processing request' });
  }
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
    const { email, password, first_name, last_name, display_name, phone } = req.body;
    const profilePhotoBase64 = req.body.profile_photo_base64 || null;
    const profilePhotoMime = req.body.profile_photo_mime_type || "image/jpeg";
    const profilePhotoName = req.body.profile_photo_file_name || "profile.jpg";

    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ success: false, message: 'Fields required' });
    }

        // Handle existing user gracefully: if the email already exists in the
    // users table (including soft-deleted ones), do NOT block with an error.
    // Instead, return success so the client can be redirected to log in
    // with their existing credentials. This prevents the registration flow
    // from being a dead end and removes the "Email taken" user-facing message.
    const [existing] = await db.promise().query('SELECT id, deleted_at, password_hash, first_name, last_name, display_name FROM users WHERE email = ? LIMIT 1', [email]);

    if (existing.length > 0) {
      const existingUser = existing[0];
      // If the user exists but was soft-deleted, restore them
      if (existingUser.deleted_at) {
        await db.promise().query('UPDATE users SET deleted_at = NULL, is_active = TRUE WHERE id = ?', [existingUser.id]);
      }
      // Return success with flags so the client knows to log in, not re-register
      return res.status(200).json({
        success: true,
        message: 'Account already exists — proceed to login',
        existingUser: {
          userId: existingUser.id,
          email: email,
          first_name: existingUser.first_name,
          last_name: existingUser.last_name,
          display_name: existingUser.display_name,
          passwordExists: !!existingUser.password_hash
        },
        loginInstead: true
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const name = display_name || `${first_name} ${last_name}`;
    const personalAuthToken = `gf_${crypto.randomBytes(16).toString('hex')}`;

    // Store the optional profile photo as a blob in the columns the users table actually has.
    let photoBlob = null;
    if (profilePhotoBase64) {
      const commaIdx = profilePhotoBase64.indexOf(",");
      const base64Data = commaIdx > -1 ? profilePhotoBase64.slice(commaIdx + 1) : profilePhotoBase64;
      photoBlob = Buffer.from(base64Data, "base64");
    }

    const [result] = await db.promise().query(
      `INSERT INTO users (email, password_hash, auth_token, first_name, last_name, display_name, phone_number, primary_role, is_active, profile_photo_blob, profile_photo_mime_type, profile_photo_file_name, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'user', true, ?, ?, ?, NOW())`,
      [email, hashedPassword, personalAuthToken, first_name, last_name, name, phone || null, photoBlob, profilePhotoMime, profilePhotoName]
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
      `SELECT u.*, 'user' as role_type, tm.name as job_title, tm.role as job_role
       FROM users u
       LEFT JOIN team_members tm ON u.job_id = tm.id
       WHERE u.email = ? AND u.is_active = true AND u.deleted_at IS NULL`,
      [email]
    );
    
    if (userResults.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    
    const user = userResults[0];
    const ok = await bcrypt.compare(password, user.password_hash || '');
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    
    // TERMINAL & ACCOUNT LOCK: Generate a fresh persistent token for this specific login session.
    // This "wires" the account to this specific device terminal and invalidates any previous device's lock.
    const personalAuthToken = `gf_lock_${crypto.randomBytes(24).toString('hex')}`;
    await db.promise().query('UPDATE users SET auth_token = ?, last_login_at = NOW(), last_login_ip = ? WHERE id = ?', [personalAuthToken, req.ip, user.id]);
    
    // Profile photo is stored directly on the users table (set at registration).
    let profilePhotoData = null;
    if (user.profile_photo_blob) {
      const base64 = Buffer.from(user.profile_photo_blob).toString('base64');
      profilePhotoData = `data:${user.profile_photo_mime_type || 'image/jpeg'};base64,${base64}`;
    }
    
    // Return the persistent DB token as the primary authentication token
    // This sets the routing in stone for this terminal/device
    return res.json({
      id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name,
      display_name: user.display_name || `${user.first_name} ${user.last_name}`,
      primary_role: user.primary_role, role_type: 'user', has_photo: !!user.profile_photo_blob,
      profilePhotoData, token: personalAuthToken
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

    // Build profile photo data URI from DB blob for the dashboard user object
    let dashboardPhotoData = null;
    if (user.profile_photo_blob) {
      const b64 = Buffer.from(user.profile_photo_blob).toString('base64');
      dashboardPhotoData = `data:${user.profile_photo_mime_type || 'image/jpeg'};base64,${b64}`;
    }

    const dashboard = {
      user: { id: user.id, email: user.email, display_name: user.display_name, phone_number: user.phone_number, role: user.primary_role || 'user', has_photo: !!user.profile_photo_blob, profilePhotoData: dashboardPhotoData },
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

// Profile Photo Upload
router.post('/profile-photo', authenticateUser, upload.single('photo'), async (req, res) => {
  try {
    const userId = req.userId;
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No photo provided' });
    }

    const photoBlob = req.file.buffer;
    const mimeType = req.file.mimetype;
    const fileName = req.file.originalname;

    await db.promise().query(
      `UPDATE users
       SET profile_photo_blob = ?, profile_photo_mime_type = ?, profile_photo_file_name = ?, updated_at = NOW()
       WHERE id = ?`,
      [photoBlob, mimeType, fileName, userId]
    );

    res.json({
      success: true,
      message: 'Profile photo updated successfully',
      imageUrl: `data:${mimeType};base64,${photoBlob.toString('base64')}`
    });
  } catch (error) {
    console.error('[PROFILE PHOTO] Upload error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
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

// Client Reports — degrade gracefully if project_reports table is missing
router.get('/my-reports', authenticateUser, async (req, res) => {
  const userId = req.userId;
  try {
    const [dbReports] = await db.promise().query(`
      SELECT pr.id, pr.title, pr.summary, pr.file_type, pr.file_size, pr.report_date, pr.status, up.project_name
      FROM project_reports pr
      JOIN user_projects up ON pr.project_id = up.id
      WHERE up.user_id = ? AND pr.status = 'final' AND pr.deleted_at IS NULL
      ORDER BY pr.report_date DESC
    `, [userId]);

    // System Registration Documents (Static)
    const systemDocs = [
      {
        id: -101,
        title: 'GSSF Client Registration Agreement (PDF)',
        summary: 'Official registration agreement for The Greggory Firm services.',
        file_type: 'application/pdf',
        file_size: 245760, // Approx size
        report_date: new Date().toISOString().split('T')[0],
        status: 'final',
        project_name: 'SYSTEM'
      },
      {
        id: -102,
        title: 'GSSF Client Registration Agreement (MS Word)',
        summary: 'Editable registration agreement for The Greggory Firm services.',
        file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        file_size: 45056, // Approx size
        report_date: new Date().toISOString().split('T')[0],
        status: 'final',
        project_name: 'SYSTEM'
      }
    ];

    res.json({ success: true, reports: [...systemDocs, ...dbReports] });
  } catch (error) {
    // ...
    // Table may not exist yet (pending sync) — return empty section instead of 500
    console.error('[CLIENT REPORTS] my-reports error:', error.code || '', error.message);
    res.json({ success: true, reports: [] });
  }
});

router.get('/my-reports/:id/download', authenticateUser, async (req, res) => {
  const userId = req.userId;
  const reportId = req.params.id;

  // Handle System Documents
  if (reportId == '-101') {
    const filePath = path.join(__dirname, '../../public/documents/GSSF_Client_Registration_Agreement.pdf');
    return res.download(filePath, 'GSSF_Client_Registration_Agreement.pdf');
  }
  if (reportId == '-102') {
    const filePath = path.join(__dirname, '../../public/documents/GSSF_Client_Registration_Agreement.docx');
    return res.download(filePath, 'GSSF_Client_Registration_Agreement.docx');
  }

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
    console.error('[CLIENT REPORTS] download error:', error.code || '', error.message);
    res.status(404).json({ success: false, message: 'Report not available' });
  }
});

// Client Invoices
router.get('/my-invoices/:id/pdf', authenticateUser, async (req, res) => {
  const userId = req.userId;
  const invoiceId = req.params.id;

  try {
    const [rows] = await db.promise().query(
      'SELECT pdf_data, pdf_file_path, invoice_number, total_amount FROM invoices WHERE id = ? AND client_id = ?',
      [invoiceId, userId]
    );

    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Invoice not found' });

    const invoice = rows[0];

    // If we have BLOB data, send it
    if (invoice.pdf_data) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Invoice_${invoice.invoice_number}.pdf"`);
      return res.send(invoice.pdf_data);
    }

    // Fallback to file system if path exists
    if (invoice.pdf_file_path) {
        return res.download(invoice.pdf_file_path, `Invoice_${invoice.invoice_number}.pdf`);
    }

    res.status(404).json({ success: false, message: 'PDF document not generated yet' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
