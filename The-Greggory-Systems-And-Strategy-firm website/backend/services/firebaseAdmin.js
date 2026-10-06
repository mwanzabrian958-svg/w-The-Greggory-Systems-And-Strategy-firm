/**
 * Firebase Admin SDK — initialized once at server boot.
 *
 * Used by the admin dashboard and all server routes to send FCM push
 * notifications to the Android client portal app (MyFirebaseMessagingService).
 *
 * Credentials are resolved in this order:
 *   1. FIREBASE_SERVICE_ACCOUNT       — raw service-account JSON (Render env var)
 *   2. FIREBASE_SERVICE_ACCOUNT_PATH  — path to that JSON file
 *   3. backend/config/firebase-service-account.json — local dev default
 *
 * Option 1 is the ONLY one that works on Render: no key file ships inside the
 * container image, so any path on its own resolves to nothing.
 *
 * If credentials are missing the service logs a warning and all callers
 * receive a simulated success response — same fail-safe pattern used by
 * smsService.js and whatsappService.js in this project.
 */

const admin = require('firebase-admin');
const { getMessaging } = require('firebase-admin/messaging');
const fs = require('fs');
const path = require('path');

// firebase-admin v14 removed the namespace API this file was written against:
//   admin.credential  -> admin.cert
//   admin.apps        -> admin.getApps()
//   admin.messaging() -> getMessaging(app)
// Keeping the v13 form does not fail loudly — `admin.credential` is just
// `undefined`, so credential.cert() throws inside the try/catch below and the
// SDK silently never initializes. Verified against firebase-admin 14.4.0.

const SERVICE_ACCOUNT_PATH =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
  path.resolve(__dirname, '../config/firebase-service-account.json');

let appInitialized = false;

/**
 * Resolve service-account credentials without requiring a file on disk.
 *
 * Accepts either the raw JSON (Render env var) or a file path (local dev).
 * Returns null when neither is present, which callers treat as "simulated".
 *
 * @returns {Object|null} credential object for admin.cert()
 * @throws {Error} when an env var is set but is not a service account —
 *                 e.g. someone pastes google-services.json by mistake.
 */
function loadCredentials() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (raw && raw.trim()) {
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      throw new Error(
        `FIREBASE_SERVICE_ACCOUNT is not valid JSON: ${err.message}`
      );
    }
    if (parsed.type !== 'service_account' || !parsed.private_key || !parsed.client_email) {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT must be a service-account key ' +
          '(needs type/private_key/client_email) — not google-services.json.'
      );
    }
    return parsed;
  }

  if (fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    return require(SERVICE_ACCOUNT_PATH);
  }

  return null;
}

/**
 * Credential resolution status for boot-time warnings and diagnostics.
 *
 * Wraps loadCredentials() so callers (server.js boot log) can report the SAME
 * resolution order the SDK uses — env var first, then path — instead of the
 * old file-exists check that always warned on Render (where no key file ships)
 * and never surfaced a malformed FIREBASE_SERVICE_ACCOUNT.
 *
 * Never throws; a bad env var comes back as { ok:false, error }.
 *
 * @returns {{ok: boolean, source: string|null, error: string|null}}
 *   source: 'env:FIREBASE_SERVICE_ACCOUNT' | 'file:<path>' | null
 */
function getCredentialStatus() {
  try {
    const creds = loadCredentials();
    if (!creds) return { ok: false, source: null, error: null };
    const raw = (process.env.FIREBASE_SERVICE_ACCOUNT || '').trim();
    const source = raw
      ? 'env:FIREBASE_SERVICE_ACCOUNT'
      : `file:${SERVICE_ACCOUNT_PATH}`;
    return { ok: true, source, error: null };
  } catch (err) {
    return {
      ok: false,
      source: null,
      error: err.message,
    };
  }
}

function getFirebaseApp() {
  const existing = admin.getApps();
  if (existing.length > 0) return existing[0];

  try {
    const credentials = loadCredentials();

    if (!credentials) {
      console.warn(
        '[FIREBASE ADMIN] No service-account credentials found.' +
          '\n  Set FIREBASE_SERVICE_ACCOUNT (raw JSON) — required on Render,' +
          `\n  or place a key file at: ${SERVICE_ACCOUNT_PATH}` +
          '\n[FIREBASE ADMIN] FCM push will be simulated.'
      );
      return null;
    }

    const app = admin.initializeApp({
      credential: admin.cert(credentials),
    });
    appInitialized = true;
    console.log('[FIREBASE ADMIN] Firebase Admin SDK initialized');
    return app;
  } catch (err) {
    console.error('[FIREBASE ADMIN] Initialization failed:', err.message);
    return null;
  }
}

/**
 * Build the FCM message object (shared by all send methods).
 */
function buildMessage({ title, body, data = {}, priority = 'high' }) {
  return {
    notification: {
      title: title || 'Greggory Systems',
      body: body || '',
    },
    data,
    android: {
      notification: {
        icon: 'notification_icon',
        color: '#0d9488',
        priority: priority || 'high',
        channel_id: 'greggory_portal_channel',
      },
    },
  };
}


/**
 * Send a push notification to a single Android device.
 * @param {string} fcmToken
 * @param {Object} payload - { title?, body?, data?, priority? }
 * @returns {Promise<{success:boolean, messageId?, simulated?, error?}>}
 */
async function sendToDevice(fcmToken, payload) {
  const app = getFirebaseApp();
  if (!app) {
    return {
      success: true,
      simulated: true,
      message: 'FCM not configured — push simulated',
      fcmTokenPreview: fcmToken ? fcmToken.slice(0, 20) + '...' : null,
    };
  }

  try {
    const response = await getMessaging(app).send(
      Object.assign({ token: fcmToken }, buildMessage(payload))
    );
    console.log('[FIREBASE ADMIN] Push sent. Message ID:', response);
    return { success: true, messageId: response, simulated: false };
  } catch (error) {
    const code = error.code || '';
    if (code.includes('invalid') || code.includes('not-registered')) {
      console.warn(
        '[FIREBASE ADMIN] Invalid FCM token — will be cleaned up:',
        fcmToken.slice(0, 20) + '...'
      );
    }
    console.error('[FIREBASE ADMIN] Push failed:', error.message);
    return { success: false, error: error.message, simulated: false };
  }
}


/**
 * Send to multiple devices (batched, max 500 per multicast call).
 * @param {string[]} fcmTokens
 * @param {Object} payload - { title?, body?, data?, priority? }
 * @returns {Promise<{successCount:number, failureCount:number, errors:Array, simulated:boolean}>}
 */
async function sendToDevices(fcmTokens, payload) {
  if (!Array.isArray(fcmTokens) || fcmTokens.length === 0) {
    return { successCount: 0, failureCount: 0, errors: [], simulated: true };
  }

  const app = getFirebaseApp();
  if (!app) {
    return {
      successCount: fcmTokens.length,
      failureCount: 0,
      errors: [],
      simulated: true,
      message: 'FCM not configured — pushes simulated',
    };
  }

  // Batch into chunks of 500 (FCM multicast limit)
  const batches = [];
  for (let i = 0; i < fcmTokens.length; i += 500) {
    batches.push(fcmTokens.slice(i, i + 500));
  }

  let totalSuccess = 0;
  let totalFailure = 0;
  const errors = [];

  for (const batch of batches) {
    try {
      const response = await getMessaging(app).sendEachForMulticast(
        Object.assign({ tokens: batch }, buildMessage(payload))
      );
      totalSuccess += response.successCount;
      totalFailure += response.failureCount;

      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const token = batch[idx];
          errors.push({
            token: token ? token.slice(0, 30) + '...' : 'unknown',
            error: resp.error ? resp.error.message || 'Unknown error' : 'Unknown error',
          });
          if (
            resp.error &&
            (resp.error.code.includes('invalid') ||
              resp.error.code.includes('not-registered'))
          ) {
            console.warn(
              '[FIREBASE ADMIN] Removing invalid token from batch:',
              token.slice(0, 20) + '...'
            );
          }
        }
      });
    } catch (err) {
      errors.push({ batchIndex: batches.indexOf(batch), error: err.message });
    }
  }

  return {
    successCount: totalSuccess,
    failureCount: totalFailure,
    errors,
    simulated: false,
  };
}

/**
 * Send to a topic (e.g. /client_devices, /admin_devices).
 * Devices subscribe to topics from the Android app side (on the fly).
 * Admin dashboard can broadcast to all clients via topic.
 * @param {string} topic - e.g. 'client_devices', 'admin_devices'
 * @param {Object} payload
 * @returns {Promise<{success:boolean, messageId?, simulated?, error?}>}
 */
async function sendToTopic(topic, payload) {
  const app = getFirebaseApp();
  if (!app) {
    return {
      success: true,
      simulated: true,
      message: 'FCM not configured — topic push simulated',
    };
  }

  try {
    const response = await getMessaging(app).send(
      Object.assign({ topic }, buildMessage(payload))
    );
    console.log(
      `[FIREBASE ADMIN] Topic push sent to /${topic}. Message ID:`,
      response
    );
    return { success: true, messageId: response, simulated: false };
  } catch (error) {
    console.error(`[FIREBASE ADMIN] Topic push failed for /${topic}:`, error.message);
    return { success: false, error: error.message, simulated: false };
  }
}

/**
 * Subscribe one or more FCM tokens to a topic.
 * Called after a client registers its token so the admin can broadcast.
 */
async function subscribeToTopic(tokens, topic) {
  const app = getFirebaseApp();
  if (!app || !tokens || tokens.length === 0) return;
  try {
    const response = await getMessaging(app).subscribeToTopic(tokens, topic);
    console.log(
      `[FIREBASE ADMIN] Subscribed ${tokens.length} token(s) to /${topic}. Success:`,
      response.successCount
    );
  } catch (err) {
    console.warn('[FIREBASE ADMIN] Topic subscription failed:', err.message);
  }
}

/**
 * Unsubscribe tokens from a topic (called on logout/unregister).
 */
async function unsubscribeFromTopic(tokens, topic) {
  const app = getFirebaseApp();
  if (!app || !tokens || tokens.length === 0) return;
  try {
    const response = await getMessaging(app).unsubscribeFromTopic(tokens, topic);
    console.log(
      `[FIREBASE ADMIN] Unsubscribed ${tokens.length} token(s) from /${topic}. Success:`,
      response.successCount
    );
  } catch (err) {
    console.warn('[FIREBASE ADMIN] Topic unsubscription failed:', err.message);
  }
}

module.exports = {
  getFirebaseApp,
  getCredentialStatus,
  sendToDevice,
  sendToDevices,
  sendToTopic,
  subscribeToTopic,
  unsubscribeFromTopic,
  isConfigured: () => appInitialized && admin.getApps().length > 0,
};

