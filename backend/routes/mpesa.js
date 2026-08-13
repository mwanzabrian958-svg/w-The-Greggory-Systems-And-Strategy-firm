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
            userId || 1
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
          'SELECT project_id, amount, phone_number, account_reference, client_id FROM mpesa_transactions WHERE transaction_id = ?',
          [checkoutRequestId]
        );

        if (txRows.length > 0) {
          const tx = txRows[0];
          await db.promise().query(
            `INSERT INTO accounting_entries (
              project_id, entry_type, category, amount, currency,
              transaction_date, transaction_reference, payment_method,
              payment_status, description, created_by, created_at
            ) VALUES (?, 'invoice_payment', 'Revenue', ?, 'KES', NOW(), ?, 'online_payment', 'completed', ?, ?, NOW())`,
            [
              tx.project_id,
              tx.amount,
              mpesaReceiptNumber || checkoutRequestId,
              `M-Pesa Payment from ${tx.phone_number} (Ref: ${tx.account_reference})`,
              tx.client_id || 1
            ]
          );
          console.log(`[MPESA] Ledger Entry Created for transaction ${checkoutRequestId}`);
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
