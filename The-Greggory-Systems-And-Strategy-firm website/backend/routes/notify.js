const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { notifyUser, CHANNELS } = require('../services/notifyService');
const { channelStatus } = require('../services/otpDispatcher');

const authenticateUser = (req, res, next) => {
  const authHeader = req.header('authorization') || req.header('Authorization');
  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (authHeader) {
    token = authHeader.trim();
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.authUser = decoded;
    req.userId = decoded.userId || decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token' });
  }
};

// Health — which channels are live (no secrets).
router.get('/status', (req, res) => {
  res.json({ success: true, ...channelStatus() });
});

// Send a notification over SMS / Email / Voice / Viber.
router.post('/send', authenticateUser, async (req, res) => {
  try {
    const { phone, email, message, subject, channels, voice } = req.body || {};
    if (!message) {
      return res.status(400).json({ success: false, message: 'message is required' });
    }
    if (!phone && !email) {
      return res.status(400).json({ success: false, message: 'phone or email is required' });
    }
    const results = await notifyUser({ phone, email }, message, { subject, channels, voice });
    const anySuccess = Object.values(results).some((r) => r && r.success);
    res.json({ success: anySuccess, results });
  } catch (error) {
    console.error('[NOTIFY SEND] Error:', error);
    res.status(500).json({ success: false, message: 'Error sending notification', error: "Internal server error" });
  }
});

// OTP test send — same chain the login flow uses, to the company number.
router.post('/test-otp', authenticateUser, async (req, res) => {
  try {
    const { dispatchOtp } = require('../services/otpDispatcher');
    const to = {
      phone_number: req.body.phone || process.env.COMPANY_PHONE_NUMBER || '+254115525854',
      email: req.body.email || process.env.SMTP_USER,
    };
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const message = `Hello, your Greggory test verification code is ${code}. It expires in 10 minutes. (TEST — please ignore.)`;
    const sent = await dispatchOtp({ user: to, code, message, ttlMinutes: 10 });
    if (sent.failure) {
      return res.status(502).json({ success: false, attempts: sent.attempts });
    }
    res.json({ success: true, channel: sent.channel, provider: sent.provider, attemptsNote: 'first success wins; later channels skipped' });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
