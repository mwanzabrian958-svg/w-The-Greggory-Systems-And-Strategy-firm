const express = require('express');
const router = express.Router();
const { initiateSTKPush } = require('../services/mpesaService');
const db = require('../config/database');

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
    console.error('[MPESA STKPUSH] Error:', error);
    res.status(500).json({ success: false, message: 'Server error during STK Push', error: error.message });
  }
});

/**
 * M-Pesa Callback (Safaricom calls this)
 * POST /api/mpesa/callback
 */
router.post('/callback', async (req, res) => {
  try {
    const { Body } = req.body;
    const stkCallback = Body.stkCallback;

    const checkoutRequestId = stkCallback.CheckoutRequestID;
    const resultCode = stkCallback.ResultCode;
    const resultDesc = stkCallback.ResultDesc;

    console.log(`[MPESA CALLBACK] Received for ${checkoutRequestId}: ${resultDesc} (${resultCode})`);

    let status = resultCode === 0 ? 'completed' : 'failed';
    let mpesaReceiptNumber = null;

    if (resultCode === 0) {
      const callbackMetadata = stkCallback.CallbackMetadata.Item;
      const receiptItem = callbackMetadata.find(item => item.Name === 'MpesaReceiptNumber');
      mpesaReceiptNumber = receiptItem ? receiptItem.Value : null;
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
    console.error('[MPESA CALLBACK] Error:', error);
    res.status(500).json({ ResultCode: 1, ResultDesc: "Internal Server Error" });
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
