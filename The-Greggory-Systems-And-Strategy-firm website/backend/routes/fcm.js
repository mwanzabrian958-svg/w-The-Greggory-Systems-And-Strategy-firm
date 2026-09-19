/**
 * FCM (Firebase Cloud Messaging) Routes
 *
 * Connects the admin dashboard to the Android app's
 * MyFirebaseMessagingService via Firebase Cloud Messaging.
 *
 * Endpoints:
 *   POST /api/fcm/send           — admin pushes to Android app
 *   POST /api/fcm/register-token — Android app registers FCM token
 *   POST /api/fcm/unregister-token — Android app unregisters
 *   GET  /api/fcm/devices        — admin lists registered devices
 *   GET  /api/fcm/status         — public FCM config check
 */

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifySessionToken } = require('../utils/sessionToken');
// clientAuth.js exports the middleware directly (module.exports = authenticateUser)
const authenticateUser = require('../middleware/clientAuth');
const {
  sendToDevice,
  sendToDevices,
  sendToTopic,
  subscribeToTopic,
  unsubscribeFromTopic,
  isConfigured,
} = require('../services/firebaseAdmin');
const { createNotification } = require('../utils/notificationHelper');

function requireAdminSession(req, res, next) {
  const authHeader =
    (req.headers.authorization || req.headers.Authorization || '').trim();
  const m = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!m) {
    return res.status(401).json({ success: false, message: 'Admin authentication required' });
  }
  const payload = verifySessionToken(m[1]);
  if (!payload) {
    return res.status(401).json({ success: false, message: 'Invalid or expired admin session' });
  }
  req.adminId = payload.uid;
  req.adminEmail = payload.email;
  next();
}


// ═══════════════════════════════════════════════════════════════════════
// POST /api/fcm/send
// ═══════════════════════════════════════════════════════════════════════
// Send a push notification from the admin dashboard to the Android app.
//
// Request body: title, body, fcmTokens?, userId?, topic?, data?, priority?
// Targeting priority: topic → fcmTokens → userId → fallback (all devices)
//
router.post('/send', requireAdminSession, async (req, res) => {
  try {
    const { title, body, fcmTokens, userId, topic, data, priority } = req.body;

    await createNotification(
      userId || req.adminId,
      'admin_push',
      title || 'Admin Notification',
      body || '',
      priority || 'normal'
    ).catch((err) =>
      console.warn('[FCM /send] createNotification failed:', err.message)
    );

    let result;

    if (topic) {
      result = await sendToTopic(topic, { title, body, data, priority });
    } else if (fcmTokens && Array.isArray(fcmTokens) && fcmTokens.length > 0) {
      result = await sendToDevices(fcmTokens, { title, body, data, priority });
    } else if (userId) {
      const [rows] = await db.promise().query(
        'SELECT fcm_token FROM users WHERE id = ? AND deleted_at IS NULL LIMIT 1',
        [userId]
      );
      if (rows.length === 0 || !rows[0].fcm_token) {
        return res.status(404).json({ success: false, message: 'No FCM token registered for this user' });
      }
      result = await sendToDevice(rows[0].fcm_token, { title, body, data, priority });
    } else {
      const [users] = await db.promise().query(
        `SELECT fcm_token FROM users WHERE fcm_token IS NOT NULL AND fcm_token != '' AND deleted_at IS NULL`
      );
      const tokens = users.map((u) => u.fcm_token).filter(Boolean);
      if (tokens.length === 0) {
        return res.json({ success: true, message: 'No devices registered — nothing to send', sent: 0, simulated: !isConfigured() });
      }
      result = await sendToDevices(tokens, { title, body, data, priority });
    }

    res.json({ success: true, timestamp: new Date().toISOString(), sentBy: req.adminId, ...result });
  } catch (error) {
    console.error('[FCM /send] Send failed:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// POST /api/fcm/register-token
// ═══════════════════════════════════════════════════════════════════════
// Called by Android app (MyFirebaseMessagingService.onNewToken) to
// register its FCM token with the server. Admin dashboard uses this
// token to push notifications back to the client.
//
// Body: { fcmToken, deviceInfo?: { os, osVersion, model, appVersion, clientId } }
// Auth: client JWT Bearer token (authenticateUser)
//
router.post('/register-token', authenticateUser, async (req, res) => {
  try {
    const { fcmToken, deviceInfo } = req.body;
    if (!fcmToken || typeof fcmToken !== 'string') {
      return res.status(400).json({ success: false, message: 'fcmToken is required (string)' });
    }

    // Store in users table
    await db.promise().query(
      `INSERT INTO users (fcm_token, device_info, updated_at)
       VALUES (?, ?, NOW())
       ON DUPLICATE KEY UPDATE
         fcm_token = VALUES(fcm_token),
         device_info = VALUES(device_info),
         updated_at = NOW()`,
      [fcmToken, deviceInfo ? JSON.stringify(deviceInfo) : null]
    );
    console.log(`[FCM /register-token] FCM token registered for user ${req.userId}`);

    // Subscribe to topic based on role (clients→client_devices, admins→admin_devices)
    const [userRows] = await db.promise().query('SELECT role FROM users WHERE id = ? LIMIT 1', [req.userId]);
    const role = userRows && userRows[0] ? (userRows[0].role || 'user') : 'user';
    const topic = role === 'admin' ? 'admin_devices' : 'client_devices';
    try {
      const app = require('../services/firebaseAdmin').getFirebaseApp();
      if (app) await subscribeToTopic([fcmToken], topic);
    } catch (subErr) {
      console.warn('[FCM /register-token] Topic subscription failed (non-fatal):', subErr.message);
    }

    // Also try admin_users table (best-effort, in case client is also admin)
    try {
      await db.promise().query(
        `INSERT INTO admin_users (fcm_token, device_info, updated_at)
         VALUES (?, ?, NOW())
         ON DUPLICATE KEY UPDATE fcm_token = VALUES(fcm_token), device_info = VALUES(device_info), updated_at = NOW()`,
        [fcmToken, deviceInfo ? JSON.stringify(deviceInfo) : null]
      );
    } catch (adminErr) {
      console.debug('[FCM /register-token] admin_users upsert skipped:', adminErr.message);
    }

    res.json({ success: true, message: 'FCM token registered and topic subscribed' });
  } catch (error) {
    console.error('[FCM /register-token] Registration failed:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// POST /api/fcm/unregister-token
// ═══════════════════════════════════════════════════════════════════════
// Called by Android app on logout / app uninstall.
// Clears FCM token from DB and unsubscribes from topics.
//
router.post('/unregister-token', authenticateUser, async (req, res) => {
  try {
    const [userRows] = await db.promise().query(
      'SELECT fcm_token FROM users WHERE id = ? LIMIT 1',
      [req.userId]
    );
    const oldToken = userRows && userRows[0] ? userRows[0].fcm_token : null;

    // Clear from DB
    await db.promise().query('UPDATE users SET fcm_token = NULL, device_info = NULL WHERE id = ?', [req.userId]);
    await db.promise().query('UPDATE admin_users SET fcm_token = NULL, device_info = NULL WHERE id = ?', [req.userId]);

    // Unsubscribe from topics (best-effort)
    if (oldToken) {
      try {
        const app = require('../services/firebaseAdmin').getFirebaseApp();
        if (app) {
          await unsubscribeFromTopic([oldToken], 'client_devices');
          await unsubscribeFromTopic([oldToken], 'admin_devices');
        }
      } catch (unsubErr) {
        console.debug('[FCM /unregister-token] Topic unsubscription skipped:', unsubErr.message);
      }
    }

    res.json({ success: true, message: 'FCM token unregistered' });
  } catch (error) {
    console.error('[FCM /unregister-token] Unregister failed:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// GET /api/fcm/devices
// ═══════════════════════════════════════════════════════════════════════
// Admin-only: list all registered FCM devices. Used by Device Management
// panel in the admin dashboard's Push Notifications page.
//
router.get('/devices', requireAdminSession, async (req, res) => {
  try {
    const [rows] = await db.promise().query(
      `SELECT
         u.id, u.display_name, u.email, u.fcm_token, u.device_info, u.last_active_at, 'client' AS user_type
       FROM users u
       WHERE u.fcm_token IS NOT NULL AND u.fcm_token != '' AND u.deleted_at IS NULL
       UNION ALL
       SELECT
         a.id, a.display_name, a.email, a.fcm_token, a.device_info, a.last_active_at, 'admin' AS user_type
       FROM admin_users a
       WHERE a.fcm_token IS NOT NULL AND a.fcm_token != '' AND a.deleted_at IS NULL
       ORDER BY last_active_at DESC`
    );
    res.json({
      success: true,
      count: rows.length,
      devices: rows.map((r) => ({
        id: r.id,
        displayName: r.display_name,
        email: r.email,
        userType: r.user_type,
        deviceInfo: r.device_info ? JSON.parse(r.device_info) : null,
        lastActiveAt: r.last_active_at,
        fcmToken: r.fcm_token,
        fcmTokenMasked: r.fcm_token ? r.fcm_token.slice(0, 20) + '...' + r.fcm_token.slice(-10) : null,
      })),
    });
  } catch (error) {
    console.error('[FCM /devices] List failed:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// GET /api/fcm/status
// ═══════════════════════════════════════════════════════════════════════
// Public: check whether Firebase Admin SDK is configured. Used by the
// admin dashboard Push Notifications page to show config status.
//
router.get('/status', async (req, res) => {
  try {
    const configured = isConfigured();
    res.json({
      success: true,
      configured,
      timestamp: new Date().toISOString(),
      note: configured
        ? 'FCM ready — push notifications available'
        : 'FCM not configured — place serviceAccountKey.json in backend/config/',
    });
  } catch (error) {
    console.error('[FCM /status] Status check failed:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
