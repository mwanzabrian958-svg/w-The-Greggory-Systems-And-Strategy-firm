const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { initiateSTKPush } = require('../services/mpesaService');
const db = require('../config/database');

// OWASP A07: constant-time comparison for the shared-secret callback path —
// never use === on secrets (leaks prefix length via timing).
function safeEqual(a, b) {
  const bufA = Buffer.from(String(a || ''), 'utf8');
  const bufB = Buffer.from(String(b || ''), 'utf8');
  if (bufA.length !== bufB.length || bufA.length === 0) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Trigger STK Push
 * POST /api/mpesa/stkpush
 */
router.post('/stkpush', async (req, res) => {
  try {
    const { phoneNumber, amount, accountReference, description, userId } = req.body;

    if (!phoneNumber || !amount) {
      return res.status(400).json({ success: false, message: 'Phone number and amount are required' });
    }

    const result = await initiateSTKPush(
      phoneNumber,
      amount,
      accountReference || 'GSS-FIRM',
      description || 'Consultancy Payment'
    );

    if (result.success) {
      // Resolve a valid creator: prefer the acting user, fall back to any
      // existing account, else NULL (column is nullable for system entries).
      let createdBy = Number(userId) || null;
      if (!createdBy) {
        try {
          const [u] = await db.promise().query("SELECT id FROM users ORDER BY id LIMIT 1");
          createdBy = u?.[0]?.id ?? null;
        } catch (_) { /* leave null */ }
      }

      // Record transaction as pending in MySQL
      try {
        await db.promise().query(
          `INSERT INTO mpesa_transactions (
            transaction_id, amount, phone_number, account_reference,
            status, response_data, created_by, created_at
          ) VALUES (?, ?, ?, ?, 'pending', ?, ?, NOW())`,
          [
            result.CheckoutRequestID,
            amount,
            phoneNumber,
            accountReference || 'GSS-FIRM',
            JSON.stringify(result),
            createdBy
          ]
        );
      } catch (dbErr) {
        console.warn('[MPESA] Failed to log pending transaction:', dbErr.message);
      }

      res.json({
        success: true,
        message: result.simulated ? 'Simulation: STK Push initialized' : 'STK Push sent to your phone',
        checkoutRequestId: result.CheckoutRequestID,
        simulated: result.simulated
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'M-Pesa STK Push failed',
        error: result.errorMessage || result.ResponseDescription
      });
    }
  } catch (error) {
    // A10: never echo internal error details to the caller.
    console.error('[MPESA STKPUSH] Error:', error);
    res.status(500).json({ success: false, message: 'Server error during STK Push' });
  }
});

/**
 * M-Pesa Callback (Safaricom calls this)
 * POST /api/mpesa/callback[/:urlToken]
 *
 * Hardened (OWASP A01/A06 — never trust the caller):
 *   1. Optional shared-secret path segment: set MPESA_CALLBACK_TOKEN and the
 *      STK Push advertises `.../callback/<token>` as its CallBackURL (see
 *      backend/services/mpesaService.js). When the env var is set, a missing
 *      or wrong token is rejected 401 before any DB work.
 *   2. The CheckoutRequestID must match a row WE recorded as 'pending' at
 *      /stkpush time (mpesa_transactions.transaction_id) — invented IDs 404.
 *   3. On success, the callback Amount must match the recorded amount and the
 *      MpesaReceiptNumber must not already belong to another transaction
 *      (blocks receipt-replay forgery). Safaricom retries stay idempotent.
 */
const MPESA_CALLBACK_TOKEN = process.env.MPESA_CALLBACK_TOKEN || '';
let callbackTokenWarned = false;

router.post(['/callback', '/callback/:urlToken'], async (req, res) => {
  try {
    // (1) Shared-secret path segment — fail closed when configured.
    if (MPESA_CALLBACK_TOKEN) {
      if (!safeEqual(req.params.urlToken, MPESA_CALLBACK_TOKEN)) {
        console.warn('[MPESA CALLBACK] Rejected: missing/invalid callback token');
        return res.status(401).json({ ResultCode: 1, ResultDesc: 'Unauthorized' });
      }
    } else if (!callbackTokenWarned) {
      callbackTokenWarned = true;
      console.warn(
        '[MPESA CALLBACK] MPESA_CALLBACK_TOKEN is not set — the callback URL relies solely on CheckoutRequestID secrecy. Set it and redeploy to enable the shared-secret check.'
      );
    }

    const { Body } = req.body || {};
    if (!Body || !Body.stkCallback || !Body.stkCallback.CheckoutRequestID) {
      return res.status(400).json({ ResultCode: 1, ResultDesc: 'Invalid callback payload' });
    }
    const stkCallback = Body.stkCallback;

    const checkoutRequestId = stkCallback.CheckoutRequestID;
    const resultCode = stkCallback.ResultCode;
    const resultDesc = stkCallback.ResultDesc;

    console.log(`[MPESA CALLBACK] Received for ${checkoutRequestId}: ${resultDesc} (${resultCode})`);

    // (2) The transaction must be one WE created as pending at STK Push time.
    const [pendingRows] = await db.promise().query(
      'SELECT id, amount, status FROM mpesa_transactions WHERE transaction_id = ? LIMIT 1',
      [checkoutRequestId]
    );
    if (!pendingRows.length) {
      console.warn(`[MPESA CALLBACK] Rejected: unknown CheckoutRequestID ${checkoutRequestId}`);
      return res.status(404).json({ ResultCode: 1, ResultDesc: 'Unknown transaction' });
    }
    const pending = pendingRows[0];
    if (pending.status === 'completed') {
      // Safaricom retries a callback it never got a 200 for — acknowledge quietly.
      return res.json({ ResultCode: 0, ResultDesc: 'Success' });
    }
    if (pending.status !== 'pending') {
      return res.status(409).json({ ResultCode: 1, ResultDesc: 'Transaction not pending' });
    }

    let status = resultCode === 0 ? 'completed' : 'failed';
    let mpesaReceiptNumber = null;

    if (resultCode === 0) {
      const items =
        (stkCallback.CallbackMetadata && stkCallback.CallbackMetadata.Item) || [];

      // (3a) Amount cross-check — a forged "success" cannot change the price.
      const amountItem = items.find((item) => item.Name === 'Amount');
      if (amountItem && Number(amountItem.Value) !== Number(pending.amount)) {
        console.error(
          `[MPESA CALLBACK] Rejected: amount mismatch for ${checkoutRequestId} (callback ${amountItem.Value} vs recorded ${pending.amount})`
        );
        return res.status(400).json({ ResultCode: 1, ResultDesc: 'Amount mismatch' });
      }

      const receiptItem = items.find((item) => item.Name === 'MpesaReceiptNumber');
      mpesaReceiptNumber = receiptItem ? receiptItem.Value : null;

      // (3b) A receipt number can only ever belong to one transaction.
      if (mpesaReceiptNumber) {
        const [dupes] = await db.promise().query(
          'SELECT transaction_id FROM mpesa_transactions WHERE mpesa_receipt = ? AND transaction_id <> ? LIMIT 1',
          [mpesaReceiptNumber, checkoutRequestId]
        );
        if (dupes.length) {
          console.error(
            `[MPESA CALLBACK] Rejected: receipt ${mpesaReceiptNumber} already used by ${dupes[0].transaction_id}`
          );
          return res.status(409).json({ ResultCode: 1, ResultDesc: 'Receipt already processed' });
        }
      }
    }

    // Update transaction in database
    await db.promise().query(
      `UPDATE mpesa_transactions
       SET status = ?, result_code = ?, result_desc = ?, mpesa_receipt = ?, updated_at = NOW()
       WHERE transaction_id = ?`,
      [status, resultCode, resultDesc, mpesaReceiptNumber, checkoutRequestId]
    );

    // If payment was successful, mirror it to the General Ledger (accounting_entries)
    if (status === 'completed') {
      try {
        const [txRows] = await db.promise().query(
          'SELECT project_id, amount, phone_number, account_reference, client_id, created_by FROM mpesa_transactions WHERE transaction_id = ?',
          [checkoutRequestId]
        );

        if (txRows.length > 0) {
          const tx = txRows[0];
          // accounting_entries.project_id is NOT NULL -> resolve a project the
          // same way server.js resolves invoices: attached project -> any
          // user_projects engagement -> auto-created "General / Unassigned".
          let projectId = tx.project_id;
          if (!projectId) {
            try {
              const [invRowsP] = await db.promise().query(
                "SELECT project_id FROM invoices WHERE invoice_number = ? AND project_id IS NOT NULL LIMIT 1",
                [tx.account_reference]
              );
              if (invRowsP.length) projectId = invRowsP[0].project_id;
            } catch (_) { /* ignore */ }
          }
          if (!projectId) {
            try {
              const [anyProjects] = await db.promise().query(
                "SELECT id FROM user_projects WHERE deleted_at IS NULL AND id > 0 ORDER BY id DESC LIMIT 1"
              );
              projectId = anyProjects[0]?.id ?? null;
            } catch (_) { /* ignore */ }
          }
          if (!projectId) {
            try {
              const [usersRows] = await db.promise().query(
                "SELECT id FROM users WHERE deleted_at IS NULL ORDER BY id LIMIT 1"
              );
              if (usersRows[0]) {
                const [createdProj] = await db.promise().query(
                  `INSERT INTO user_projects (user_id, project_name, project_description, project_type, status, created_by, created_at)
                   VALUES (?, 'General / Unassigned', 'Auto-created fallback engagement for uncategorised M-Pesa payments.', 'consulting', 'active', ?, NOW())`,
                  [usersRows[0].id, usersRows[0].id]
                );
                projectId = createdProj.insertId;
              }
            } catch (_) { /* last resort - leave null, insert will surface the error */ }
          }
          let ledgerCreatedBy = tx.created_by || tx.client_id;
          if (!ledgerCreatedBy) {
            try {
              const [anyUser] = await db.promise().query(
                "SELECT id FROM users WHERE deleted_at IS NULL ORDER BY id LIMIT 1"
              );
              ledgerCreatedBy = anyUser[0]?.id ?? null;
            } catch (_) { /* ignore */ }
          }
          await db.promise().query(
            `INSERT INTO accounting_entries (
              project_id, entry_type, category, amount, currency,
              transaction_date, transaction_reference, payment_method,
              payment_status, description, created_by, created_at
            ) VALUES (?, 'invoice_payment', 'Revenue', ?, 'KES', NOW(), ?, 'online_payment', 'completed', ?, ?, NOW())`,
            [
              projectId,
              tx.amount,
              mpesaReceiptNumber || checkoutRequestId,
              `M-Pesa Payment from ${tx.phone_number} (Ref: ${tx.account_reference})`,
              ledgerCreatedBy
            ]
          );
          console.log(`[MPESA] Ledger Entry Created for transaction ${checkoutRequestId}`);

          // Mark the invoice PAID. The client portal sends the invoice number as
          // the STK Push accountReference, so we match it back here. Also notify
          // the client that their payment landed.
          try {
            const [invRows] = await db.promise().query(
              `SELECT id, project_id, client_email, client_name, title FROM invoices
               WHERE invoice_number = ? AND status <> 'paid' LIMIT 1`,
              [tx.account_reference]
            );
            if (invRows.length) {
              const inv = invRows[0];
              await db.promise().query(
                `UPDATE invoices SET status = 'paid', updated_at = NOW() WHERE id = ?`,
                [inv.id]
              );
              // Notify the client by email-linked user id (best-effort)
              if (inv.client_email) {
                const [clients] = await db.promise().query(
                  "SELECT id FROM users WHERE email = ? AND deleted_at IS NULL LIMIT 1",
                  [inv.client_email]
                );
                if (clients.length) {
                  await db.promise().query(
                    `INSERT INTO notifications (user_id, notification_type, title, message, status, related_entity_type, related_entity_id, created_at)
                     VALUES (?, 'payment_received', ?, ?, 'unread', 'invoices', ?, NOW())`,
                    [clients[0].id, `Payment received — ${inv.title}`, `Your M-Pesa payment of KSH ${Number(tx.amount).toLocaleString()} for invoice ${tx.account_reference} has been received. Receipt: ${mpesaReceiptNumber || checkoutRequestId}.`, inv.id]
                  );
                  // Auto-push receipt to Android (display + cache) — fire-and-forget.
                  try {
                    const { receiptPush } = require('../utils/notificationHelper');
                    receiptPush(db.promise(), {
                      clientEmail: inv.client_email, invoiceId: inv.id,
                      invoiceNumber: tx.account_reference, title: inv.title,
                      amount: tx.amount, receiptNumber: mpesaReceiptNumber || checkoutRequestId,
                    }).catch(() => {});
                  } catch (pushErr) { console.warn('[MPESA] receipt push skipped:', pushErr.message); }
                }
              }
              console.log(`[MPESA] Invoice ${tx.account_reference} marked PAID`);
            }
          } catch (invErr) {
            console.warn('[MPESA] Invoice mark-paid skipped:', invErr.message);
          }
        }
      } catch (ledgerErr) {
        console.error('[MPESA] Failed to create Ledger Entry:', ledgerErr.message);
      }
    }

    res.json({ ResultCode: 0, ResultDesc: "Success" });
  } catch (error) {
    // A10: never echo internal error details to the caller.
    console.error('[MPESA CALLBACK] Error:', error);
    res.status(500).json({ ResultCode: 1, ResultDesc: 'Internal Server Error' });
  }
});

/**
 * Check Transaction Status
 * GET /api/mpesa/status/:checkoutRequestId
 */
router.get('/status/:checkoutRequestId', async (req, res) => {
  try {
    const { checkoutRequestId } = req.params;
    const [rows] = await db.promise().query(
      'SELECT status, result_desc, mpesa_receipt FROM mpesa_transactions WHERE transaction_id = ?',
      [checkoutRequestId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.json({ success: true, ...rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
