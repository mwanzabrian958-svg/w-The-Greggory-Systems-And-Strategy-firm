// Shared invoice/receipt → FCM push helper.
//
// Pipeline: [ Aiven MySQL ] ──► [ Render Backend ] ──► [ Firebase (FCM) ]
//              ──► [ Client Android Phone ] (display + cache receipt/report)
//
// Why this exists: POST /api/invoices and the M-Pesa callback each wrote an
// in-portal `notifications` row, but nothing ever pushed to the Android app —
// the phone only learned about a new invoice/receipt on its next poll.
// This helper closes that gap: after the DB insert it looks up the client's
// registered fcm_token (users.fcm_token, by client_email → users.email) and
// fires a data+notification FCM message carrying everything the app needs to
// display immediately AND cache offline (receipt/report payload).
//
// Fire-and-forget by design — push failures are logged, never thrown, so a
// Firebase outage can never fail an invoice creation or payment callback.
const db = require('../config/database');
const { sendToDevice } = require('./firebaseAdmin');

/**
 * Creates a real notification in the database for a specific user.
 * @param {number} userId - The recipient user ID
 * @param {string} type - notification_type (e.g., 'project_update', 'task_assigned', 'system')
 * @param {string} title - The notification title
 * @param {string} message - The main notification body
 * @param {string} priority - 'low', 'normal', 'high', 'urgent'
 */
const createNotification = async (userId, type, title, message, priority = 'normal') => {
  try {
    if (!userId) return;

    await db.promise().query(
      'INSERT INTO notifications (user_id, notification_type, title, message, priority, status, created_at) VALUES (?, ?, ?, ?, ?, \'unread\', NOW())',
      [userId, type, title, message, priority]
    );
    console.log(`[REAL-LIFE NOTIF] Created for User ${userId}: ${title}`);
  } catch (error) {
    console.error('[REAL-LIFE NOTIF ERROR] Failed to create notification:', error);
  }
};

function fmtKsh(n) {
  const v = Number(n || 0);
  return 'KSH ' + v.toLocaleString('en-KE');
}

/**
 * Push an invoice/receipt event to a client's Android device(s).
 * @param {object} dbConn - mysql2 promise pool (mainDb or db.promise())
 * @param {object} opts
 * @param {string} opts.clientEmail - users.email lookup key
 * @param {string} opts.kind - 'invoice_sent' | 'payment_received'
 * @param {string} opts.title - push title
 * @param {string} opts.body - push body
 * @param {number|string} opts.invoiceId
 * @param {string} opts.invoiceNumber
 * @param {number} opts.amount
 * @param {string} [opts.receiptNumber]
 * @param {string} [opts.dueDate]
 * @returns {Promise<{pushed:boolean, reason?:string}>}
 */
async function pushInvoiceEvent(dbConn, opts) {
  const query = (sql, params) =>
    typeof dbConn.query === 'function'
      ? dbConn.query(sql, params)
      : dbConn.promise().query(sql, params);
  try {
    if (!opts || !opts.clientEmail) return { pushed: false, reason: 'no-client-email' };
    const [rows] = await query(
      'SELECT id, fcm_token FROM users WHERE email = ? AND deleted_at IS NULL LIMIT 1',
      [opts.clientEmail]
    );
    if (!rows.length) return { pushed: false, reason: 'no-client-user' };
    const token = rows[0] && rows[0].fcm_token;
    if (!token) return { pushed: false, reason: 'no-fcm-token' };
    const data = {
      kind: String(opts.kind || 'invoice_sent'),
      invoiceId: String(opts.invoiceId || ''),
      invoiceNumber: String(opts.invoiceNumber || ''),
      amount: String(opts.amount != null ? opts.amount : ''),
      receiptNumber: String(opts.receiptNumber || ''),
      dueDate: String(opts.dueDate || ''),
    };
    const res = await sendToDevice(token, { title: opts.title, body: opts.body, data, priority: 'high' });
    if (res && res.success) {
      console.log(`[INVOICE-PUSH] ${opts.kind} → user ${rows[0].id} (${res.simulated ? 'simulated' : res.messageId || 'sent'})`);
      return { pushed: true };
    }
    console.warn(`[INVOICE-PUSH] ${opts.kind} → user ${rows[0].id} failed:`, (res && res.error) || 'unknown');
    return { pushed: false, reason: (res && res.error) || 'fcm-failed' };
  } catch (err) {
    console.warn('[INVOICE-PUSH] skipped:', err.message);
    return { pushed: false, reason: err.message };
  }
}

function invoiceSentPush(dbConn, { clientEmail, invoiceId, invoiceNumber, title, clientName, amount, dueDate }) {
  return pushInvoiceEvent(dbConn, {
    clientEmail,
    kind: 'invoice_sent',
    title: `New invoice ${invoiceNumber}`,
    body: `Invoice "${title}" for ${clientName} — ${fmtKsh(amount)} due ${dueDate}.`,
    invoiceId,
    invoiceNumber,
    amount,
    dueDate,
  });
}

function receiptPush(dbConn, { clientEmail, invoiceId, invoiceNumber, title, amount, receiptNumber }) {
  return pushInvoiceEvent(dbConn, {
    clientEmail,
    kind: 'payment_received',
    title: `Payment received — ${title || invoiceNumber}`,
    body: `Your M-Pesa payment of ${fmtKsh(amount)} for invoice ${invoiceNumber} has been received. Receipt: ${receiptNumber}.`,
    invoiceId,
    invoiceNumber,
    amount,
    receiptNumber,
  });
}

module.exports = { createNotification, pushInvoiceEvent, invoiceSentPush, receiptPush };
