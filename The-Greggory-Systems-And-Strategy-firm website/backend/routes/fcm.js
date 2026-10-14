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
 *   GET  /api/fcm/devices        — admin lists registered devices (MASKED tokens)
 *   GET  /api/fcm/status         — admin FCM config check (admin session)
 */

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifySessionToken } = require('../utils/sessionToken');
// clientAuth.js exports the middleware directly (module.exports = authenticateUser)
const authenticateUser = require('../middleware/clientAuth');
const {
  getFirebaseApp,
  sendToDevice,
  sendToDevices,
  sendToTopic,
  subscribeToTopic,
  unsubscribeFromTopic,
  isConfigured,
} = require('../services/firebaseAdmin');
const { createNotification } = require('../utils/notificationHelper');

// Verifies a signed admin session AND that the admin it names is still
// active. Fails closed on lookup errors.
async function requireAdminSession(req, res, next) {
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

  // OWASP A01/A07 (ASVS v3.3.2): a cryptographically valid token is NOT
  // enough — the admin it names must still exist, be active and not
  // deleted, so a disabled/deleted admin loses push access immediately
  // instead of surviving for the token's full 8h lifetime.
  try {
    const [admins] = await db.promise().query(
      `SELECT id FROM admin_users
        WHERE id = ?
          AND (is_active IS NULL OR is_active = 1)
          AND deleted_at IS NULL
        LIMIT 1`,
      [payload.uid]
    );
    if (!admins.length) {
      return res.status(401).json({ success: false, message: 'Admin session no longer valid' });
    }
  } catch (err) {
    // Fail closed — never grant admin access because of a DB hiccup.
    console.error('[FCM] Admin session verification failed:', err.message);
    return res.status(500).json({ success: false, message: 'Authentication check failed' });
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
    const { title, body, fcmTokens, targets, userId, topic, data, priority } = req.body;

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
    } else if (targets && Array.isArray(targets) && targets.length > 0) {
      // Targeting by device id (preferred): GET /devices returns masked tokens
      // only, so the dashboard sends [{id, userType}] and the full tokens are
      // resolved here, server-side (OWASP A01 — keeps real tokens out of the
      // browser). Table names come from a fixed mapping, never user input.
      if (targets.length > 500) {
        return res.status(400).json({ success: false, message: 'Too many device targets (max 500)' });
      }
      const targetTokens = [];
      for (const t of targets) {
        const id = Number(t && t.id);
        const table = t && t.userType === 'admin' ? 'admin_users' : 'users';
        if (!Number.isInteger(id) || id <= 0) continue;
        const [rows] = await db.promise().query(
          `SELECT fcm_token FROM ${table} WHERE id = ? AND fcm_token IS NOT NULL AND fcm_token <> '' AND deleted_at IS NULL LIMIT 1`,
          [id]
        );
        if (rows[0] && rows[0].fcm_token) targetTokens.push(rows[0].fcm_token);
      }
      if (targetTokens.length === 0) {
        return res.json({ success: true, message: 'No matching devices found — nothing to send', sent: 0, simulated: !isConfigured() });
      }
      result = await sendToDevices(targetTokens, { title, body, data, priority });
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
    res.status(500).json({ success: false, message: 'Failed to send push notification' });
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
    const { fcmToken: rawToken, deviceInfo } = req.body;
    if (!rawToken || typeof rawToken !== 'string') {
      return res.status(400).json({ success: false, message: 'fcmToken is required (string)' });
    }
    // OWASP A07 (ASVS v13.4 / v5.1): bound the credential we persist.
    // Real FCM tokens are ~150-250 chars; the cap rejects junk and
    // accidental blob uploads without breaking future token formats.
    const fcmToken = rawToken.trim();
    if (!fcmToken || fcmToken.length > 4096) {
      return res.status(400).json({ success: false, message: 'fcmToken must be 1-4096 characters' });
    }

    // Update the CALLING user's row, scoped by id.
    //
    // This used to be `INSERT INTO users (fcm_token, device_info, updated_at)
    // ... ON DUPLICATE KEY UPDATE`, which never referenced req.userId. With no
    // unique key on users.fcm_token the ON DUPLICATE branch could never fire,
    // so it inserted a brand-new row on every call — and because email,
    // first_name and last_name are NOT NULL with no default, the statement
    // failed outright. Net effect: every registration returned 500 and no
    // token was ever stored against the real user, so GET by userId could
    // never find one. unregister-token below already used the correct
    // UPDATE-by-id shape; this mirrors it.
    const [upd] = await db.promise().query(
      `UPDATE users
          SET fcm_token = ?, device_info = ?, updated_at = NOW()
        WHERE id = ? AND deleted_at IS NULL`,
      [fcmToken, deviceInfo ? JSON.stringify(deviceInfo) : null, req.userId]
    );
    if (!upd.affectedRows) {
      return res
        .status(404)
        .json({ success: false, message: 'No active user row found for this session' });
    }
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

    // Also mirror the token into admin_users when the caller is genuinely
    // the same person (best-effort, in case they have rows in both tables).
    //
    // OWASP A01: match by EMAIL, never by users.id — users.id and
    // admin_users.id are INDEPENDENT auto-increment sequences, so the old
    // id-scoped UPDATE let a plain client with users.id = N overwrite the
    // device token of admin_users.id = N, redirecting that admin's pushes
    // to the client's device.
    const callerEmail = (req.authUser && req.authUser.email) || null;
    if (callerEmail) {
      try {
        await db.promise().query(
          `UPDATE admin_users
              SET fcm_token = ?, device_info = ?, updated_at = NOW()
            WHERE email = ? AND deleted_at IS NULL`,
          [fcmToken, deviceInfo ? JSON.stringify(deviceInfo) : null, callerEmail]
        );
      } catch (adminErr) {
        console.debug('[FCM /register-token] admin_users update skipped:', adminErr.message);
      }
    }

    res.json({ success: true, message: 'FCM token registered and topic subscribed' });
  } catch (error) {
    console.error('[FCM /register-token] Registration failed:', error);
    res.status(500).json({ success: false, message: 'Failed to register FCM token' });
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
    // OWASP A01: clear by EMAIL, not id — users.id and admin_users.id are
    // independent sequences, so an id-matched UPDATE blanked the token of
    // an unrelated admin who happened to share the numeric id.
    const callerEmail = (req.authUser && req.authUser.email) || null;
    if (callerEmail) {
      await db
        .promise()
        .query('UPDATE admin_users SET fcm_token = NULL, device_info = NULL WHERE email = ?', [callerEmail]);
    }

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
    res.status(500).json({ success: false, message: 'Failed to unregister FCM token' });
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
        // OWASP A01: full tokens are intentionally NOT returned — the dashboard
        // targets devices via POST /send `targets: [{id, userType}]` instead and
        // the server resolves the real tokens internally.
        fcmTokenMasked: r.fcm_token ? r.fcm_token.slice(0, 20) + '...' + r.fcm_token.slice(-10) : null,
      })),
    });
  } catch (error) {
    console.error('[FCM /devices] List failed:', error);
    res.status(500).json({ success: false, message: 'Failed to list devices' });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// GET /api/fcm/status
// ═══════════════════════════════════════════════════════════════════════
// Public: check whether Firebase Admin SDK is configured. Used by the
// admin dashboard Push Notifications page to show config status.
//
router.get('/status', requireAdminSession, async (req, res) => {
  try {
    // Idempotent init. Nothing else runs at boot, so without this the SDK is
    // never initialized and isConfigured() would report false even when valid
    // credentials are present — hiding a working deployment behind "not
    // configured". Returns null (and logs) when no credentials exist.
    getFirebaseApp();
    const configured = isConfigured();
    res.json({
      success: true,
      configured,
      timestamp: new Date().toISOString(),
      note: configured
        ? 'FCM ready — push notifications available'
        : 'FCM not configured — set FIREBASE_SERVICE_ACCOUNT (service-account JSON) in the environment, or place firebase-service-account.json in backend/config/',
    });
  } catch (error) {
    console.error('[FCM /status] Status check failed:', error);
    res.status(500).json({ success: false, message: 'Failed to check FCM status' });
  }
});

module.exports = router;
