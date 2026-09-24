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
const { issueSessionToken, revokeSessionToken, revokeOtherSessions, listSessions, revokeSessionById } = require('../utils/userSessions');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
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
// NUMERIC-ONLY: this single-segment DELETE used to also swallow
// `DELETE /sessions` (Express matches /:id with id="sessions"), which returned
// 403 for regular users and made "log out everywhere else" unreachable.
router.delete('/:id(\\d+)', requireAdmin, (req, res) => {
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
    
    // MULTI-DEVICE SESSION PROTOCOL: issue a distinct persistent token for
    // THIS device via its own user_sessions row — tokens held by the user's
    // other devices are left untouched, so one credential can carry several
    // live tokens at once. users.auth_token still tracks the latest login for
    // legacy readers / the migration fallback in clientAuth.
    const personalAuthToken = await issueSessionToken(user.id, {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
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
      phone_number: user.phone_number,
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
router.put('/profile', authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;
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

// ── System Registration Documents (static, always available) ────────────────
// These files ship with the app in public/documents, so they are listed for
// EVERY authenticated client — independent of whether the optional
// project_reports table exists or is in sync. They are streamed by
// GET /my-reports/:id/download below. Ids are negative so they can never
// collide with real project_reports rows.
const SYSTEM_DOCUMENTS_DIR = path.join(__dirname, '..', '..', 'public', 'documents');

const SYSTEM_REPORTS = [
  {
    id: -101,
    title: 'GSSF Client Registration Agreement (PDF)',
    summary: 'Official registration agreement for The Greggory Firm services.',
    file_type: 'application/pdf',
    file_name: 'GSSF_Client_Registration_Agreement.pdf',
    file_size: 243570, // Actual file size in bytes
    report_date: new Date().toISOString().split('T')[0],
    status: 'final',
    project_name: 'SYSTEM'
  },
  {
    id: -102,
    title: 'GSSF Client Registration Agreement (MS Word)',
    summary: 'Editable registration agreement for The Greggory Firm services.',
    file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    file_name: 'GSSF_Client_Registration_Agreement.docx',
    file_size: 18548, // Actual file size in bytes
    report_date: new Date().toISOString().split('T')[0],
    status: 'final',
    project_name: 'SYSTEM'
  }
];

/** Resolve a static system document by its negative id. */
const findSystemReport = (id) =>
  SYSTEM_REPORTS.find((r) => String(r.id) === String(id)) || null;

/**
 * Read a system registration document from the database — stored in
 * client_documents under category 'SYSTEM_REGISTRATION' by
 * scripts/seed-system-documents.js. Returns null when the table/column/row is
 * unavailable so the caller can fall back to the copy shipped on disk.
 */
async function fetchSystemDocumentFromDb(doc) {
  try {
    const [rows] = await db.promise().query(
      `SELECT file_data, file_type, file_name
         FROM client_documents
        WHERE category = 'SYSTEM_REGISTRATION' AND document_name = ?
          AND deleted_at IS NULL
        ORDER BY id ASC
        LIMIT 1`,
      [doc.title],
    );
    const row = rows[0];
    if (!row || !row.file_data) return null;
    return row;
  } catch (error) {
    console.error('[CLIENT REPORTS] system document DB lookup failed:', error.code || '', error.message);
    return null;
  }
}

/**
 * Fetch the client's OWN finalized project reports.
 *
 * project_reports exists in two shapes: the full schema shipped in
 * database/*.sql has NO `deleted_at` column, while the table auto-created at
 * boot by server.js DOES. Selecting the missing column throws
 * ER_BAD_FIELD_ERROR, which previously wiped the entire Documents panel — so
 * we try the soft-delete-aware query first and remember which variant works.
 */
let projectReportsHasDeletedAt = null; // null = unknown, true/false = probed

async function fetchClientProjectReports(userId) {
  const base = `
      SELECT pr.id, pr.title, pr.summary, pr.file_type, pr.file_size, pr.report_date, pr.status, up.project_name
      FROM project_reports pr
      JOIN user_projects up ON pr.project_id = up.id
      WHERE up.user_id = ? AND pr.status = 'final'`;
  const withSoftDelete = `${base} AND pr.deleted_at IS NULL
      ORDER BY pr.report_date DESC`;
  const withoutSoftDelete = `${base}
      ORDER BY pr.report_date DESC`;
  const run = (sql) => db.promise().query(sql, [userId]);

  if (projectReportsHasDeletedAt === false) {
    const [rows] = await run(withoutSoftDelete);
    return rows;
  }

  try {
    const [rows] = await run(withSoftDelete);
    projectReportsHasDeletedAt = true;
    return rows;
  } catch (error) {
    // 1054 = ER_BAD_FIELD_ERROR → this schema has no deleted_at column.
    if (error && (error.code === 'ER_BAD_FIELD_ERROR' || error.errno === 1054)) {
      projectReportsHasDeletedAt = false;
      const [rows] = await run(withoutSoftDelete);
      return rows;
    }
    throw error;
  }
}

// Client Reports — the static system registration documents are ALWAYS
// returned (they must never vanish because the optional project_reports table
// is missing or out of sync); the client's own DB reports are appended when
// that table is reachable.
router.get('/my-reports', authenticateUser, async (req, res) => {
  const userId = req.userId;
  let dbReports = [];
  try {
    dbReports = await fetchClientProjectReports(userId);
  } catch (error) {
    // Degrade gracefully — table may not exist yet (pending sync).
    console.error('[CLIENT REPORTS] project reports unavailable:', error.code || '', error.message);
  }
  res.json({ success: true, reports: [...SYSTEM_REPORTS, ...dbReports] });
});

router.get('/my-reports/:id/download', authenticateUser, async (req, res) => {
  const userId = req.userId;
  const reportId = req.params.id;

  // System registration documents — served from the database copy
  // (client_documents) when present, otherwise from the file shipped with the
  // app in public/documents.
  const systemDoc = findSystemReport(reportId);
  if (systemDoc) {
    const dbDoc = await fetchSystemDocumentFromDb(systemDoc);
    if (dbDoc) {
      const name = dbDoc.file_name || systemDoc.file_name;
      res.setHeader('Content-Type', dbDoc.file_type || systemDoc.file_type);
      res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
      return res.send(dbDoc.file_data);
    }

    const filePath = path.join(SYSTEM_DOCUMENTS_DIR, systemDoc.file_name);
    if (!fs.existsSync(filePath)) {
      console.error('[CLIENT REPORTS] system document missing on disk:', filePath);
      return res.status(404).json({ success: false, message: 'System document not available' });
    }
    return res.download(filePath, systemDoc.file_name);
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
    if (!report.file_data) {
      return res.status(404).json({ success: false, message: 'Report file not available' });
    }
    // Derive the download extension from the stored MIME type (reports are not
    // always PDFs) so browsers save the file with a usable name.
    const type = String(report.file_type || '');
    const ext = type.includes('pdf') ? 'pdf'
      : type.includes('word') || type.includes('officedocument') ? 'docx'
      : type.includes('excel') || type.includes('spreadsheet') ? 'xlsx'
      : type.includes('csv') ? 'csv'
      : 'bin';
    const safeTitle = String(report.title || 'report').replace(/[\\/:*?"<>|]/g, '_');
    res.setHeader('Content-Type', type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.${ext}"`);
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

// Logout — PURGE PROTOCOL: revoke ONLY this device's session row so every
// other device holding a token for the same credential stays signed in.
router.post('/logout', authenticateUser, async (req, res) => {
  try {
    // clientAuth validated the token and exposed it as req.authToken.
    let revoked = 0;
    if (req.authToken) {
      // 1. Purge this device's row in user_sessions.
      revoked += await revokeSessionToken(req.authToken);
      // 2. Legacy column cleanup — clear users.auth_token only when it holds
      //    THIS device's token (never another device's).
      const [legacy] = await db.promise().query(
        `UPDATE users SET auth_token = NULL, updated_at = NOW() WHERE id = ? AND auth_token = ?`,
        [req.userId, req.authToken]
      );
      revoked += legacy.affectedRows || 0;
    }
    res.json({ success: true, message: 'Logged out successfully', revoked });
  } catch (error) {
    console.error('[LOGOUT] Error:', error);
    res.status(500).json({ success: false, message: 'Logout failed' });
  }
});

/**
 * MULTI-DEVICE AUDIT: list every live login for this account.
 * The first portal page ("Active Sessions") renders this so the owner can
 * see other devices and kick them out. Raw tokens are NEVER returned —
 * each row only carries metadata plus an `is_current` flag.
 */
router.get('/sessions', authenticateUser, async (req, res) => {
  try {
    const sessions = await listSessions(req.userId, req.authToken || '');

    // Legacy devices (tokens issued before user_sessions existed) authenticate
    // through users.auth_token and have no row — surface the caller anyway so
    // "this device" always appears in its own list.
    if (req.authToken && !sessions.some((s) => s.is_current)) {
      sessions.unshift({
        id: null,
        ip: req.ip || null,
        user_agent: req.header('user-agent') || null,
        created_at: null,
        is_current: true,
        legacy: true,
      });
    }

    res.json({ success: true, sessions });
  } catch (error) {
    console.error('[SESSIONS] List error:', error);
    res.status(500).json({ success: false, message: 'Could not list sessions' });
  }
});

/**
 * MULTI-DEVICE AUDIT: kick ONE other device out by session id.
 * revokeSessionById scopes the UPDATE to the caller's own user_id, so a
 * guessed id can never revoke someone else's session. The portal only
 * offers the button for non-current devices.
 */
router.delete('/sessions/:id', authenticateUser, async (req, res) => {
  try {
    const sessionId = Number(req.params.id);
    if (!Number.isInteger(sessionId) || sessionId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid session id' });
    }

    const { revoked, token } = await revokeSessionById(req.userId, sessionId, req.authToken || '');
    if (!revoked) {
      return res.status(404).json({ success: false, message: 'Session not found or already signed out' });
    }

    // Keep the legacy column in sync when it holds the kicked device's token.
    if (token) {
      await db.promise().query(
        `UPDATE users SET auth_token = NULL, updated_at = NOW() WHERE id = ? AND auth_token = ?`,
        [req.userId, token]
      );
    }

    res.json({ success: true, message: 'Device signed out', revoked });
  } catch (error) {
    console.error('[SESSIONS] Kick error:', error);
    res.status(500).json({ success: false, message: 'Could not sign that device out' });
  }
});

/**
 * AUTH PROTOCOL: Session Revocation ("log out everywhere else")
 * Revokes every live user_sessions row EXCEPT the caller's own token, and
 * clears the legacy users.auth_token column only when it is not the caller's.
 */
router.delete('/sessions', authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;
    const currentToken = req.authToken || req.query.currentToken || '';

    const revoked = await revokeOtherSessions(userId, currentToken);

    // Legacy column: clear only when it is NOT the caller's token.
    const [legacy] = await db.promise().query(
      `UPDATE users SET auth_token = NULL, updated_at = NOW()
       WHERE id = ? AND auth_token IS NOT NULL AND auth_token != ?`,
      [userId, currentToken || '']
    );

    res.json({ success: true, message: 'All other sessions revoked', revoked: revoked + (legacy.affectedRows || 0) });
  } catch (error) {
    console.error('[SESSIONS] Revocation error:', error);
    res.status(500).json({ success: false, message: 'Revocation failed' });
  }
});

module.exports = router;
