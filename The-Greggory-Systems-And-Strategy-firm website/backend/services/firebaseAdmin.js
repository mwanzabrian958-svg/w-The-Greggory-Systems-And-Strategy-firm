/**
 * Firebase Admin SDK — initialized once at server boot.
 *
 * Used by the admin dashboard and all server routes to send FCM push
 * notifications to the Android client portal app (MyFirebaseMessagingService).
 *
 * Required:
 *   backend/config/firebase-service-account.json  (downloaded from Firebase Console)
 *
 * If credentials are missing the service logs a warning and all callers
 * receive a simulated success response — same fail-safe pattern used by
 * smsService.js and whatsappService.js in this project.
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const SERVICE_ACCOUNT_PATH =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
  path.resolve(__dirname, '../config/firebase-service-account.json');

let appInitialized = false;

function getFirebaseApp() {
  if (admin.apps.length > 0) return admin.apps[0];

  try {
    if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      console.warn(
        '[FIREBASE ADMIN] serviceAccountKey.json not found at:',
        SERVICE_ACCOUNT_PATH,
        '\n[FIREBASE ADMIN] Place it in backend/config/ — FCM push will be simulated.'
      );
      return null;
    }

    const credentials = require(SERVICE_ACCOUNT_PATH);
    admin.initializeApp({
      credential: admin.credential.cert(credentials),
    });
    appInitialized = true;
    console.log('[FIREBASE ADMIN] Firebase Admin SDK initialized');
    return admin.apps[0];
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
    const response = await admin.messaging().send(
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
      const response = await admin.messaging().sendEachForMulticast(
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
    const response = await admin.messaging().send(
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
    const response = await admin.messaging().subscribeToTopic(tokens, topic);
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
    const response = await admin.messaging().unsubscribeFromTopic(tokens, topic);
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
  sendToDevice,
  sendToDevices,
  sendToTopic,
  subscribeToTopic,
  unsubscribeFromTopic,
  isConfigured: () => appInitialized && admin.apps.length > 0,
};

