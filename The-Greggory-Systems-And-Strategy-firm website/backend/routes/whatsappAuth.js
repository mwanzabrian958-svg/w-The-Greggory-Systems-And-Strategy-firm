/**
 * WHATSAPP AUTH-CODE PROTOCOL — client portal (APK) verification codes.
 *
 * Two unauthenticated endpoints the mobile app / portal calls before login:
 *   POST /api/auth/whatsapp/request-code    { identifier }  (email OR phone)
 *   POST /api/auth/whatsapp/verify-code     { identifier, code }
 *
 * request-code finds the client in `users`, stores a SHA-256 hash of a fresh
 * 6-digit code (10-minute TTL, 5 attempts) in the whatsapp_code_* columns and
 * delivers the plaintext over WhatsApp through services/whatsappService:
 *   - Meta TEMPLATE message when WHATSAPP_OTP_TEMPLATE_NAME is set (works
 *     outside the 24h customer-service window — the production path),
 *   - plain text otherwise (dev / AT fallback),
 *   - simulated relay when no provider is configured — then, and only when
 *     NODE_ENV !== 'production', the response echoes the code so local
 *     development can complete the flow end to end.
 * verify-code burns the code on success and flips `users.whatsapp_verified`.
 *
 * Security mirrors the password-reset protocol in routes/users.js: per-IP
 * rate limits, a 60s per-identifier cooldown, the SAME 200 body for unknown
 * and known identifiers (no enumeration), hashed codes compared with
 * timingSafeEqual, 5-attempt cap. verify-code never issues a session — a
 * leaked code alone can never log anyone in.
 */
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const db = require('../config/database');
const {
  sendWhatsAppToUser,
  sendWhatsAppToUserStrict,
  sendWhatsAppTemplateStrict,
  providerConfigured,
  OTP_TEMPLATE_NAME,
} = require('../services/whatsappService');

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;

// ── Abuse control (same shape as forgot-password) ──────────────────────────
// A per-IP limiter for bursts plus a per-identifier cooldown that still holds
// when the caller rotates IPs.
const requestCodeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many code requests from this device. Please try again in a few minutes.',
  },
});
const verifyCodeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts. Please try again in a few minutes.',
  },
});

const CODE_RESEND_COOLDOWN_MS = 60 * 1000;
const lastCodeSendByIdentifier = new Map();

/** Records a send attempt; reports whether one happened < 60s ago. */
function recentlySentCode(identifierKey) {
  const key = String(identifierKey).toLowerCase();
  const now = Date.now();
  for (const [id, sentAt] of lastCodeSendByIdentifier) {
    if (now - sentAt > CODE_RESEND_COOLDOWN_MS) lastCodeSendByIdentifier.delete(id);
  }
  const last = lastCodeSendByIdentifier.get(key);
  if (last && now - last < CODE_RESEND_COOLDOWN_MS) return true;
  lastCodeSendByIdentifier.set(key, now);
  return false;
}

// ── Schema self-heal ────────────────────────────────────────────────────────
// scripts/setup-whatsapp-verification.js adds whatsapp_verified /
// whatsapp_auth_key, but may never have run against this database — same lazy
// ALTER pattern as ensurePasswordResetColumns in routes/users.js.
let otpSchemaReady = null;
function ensureOtpColumns() {
  if (otpSchemaReady) return otpSchemaReady;
  otpSchemaReady = (async () => {
    const conn = db.promise();
    const [cols] = await conn.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'`,
    );
    const have = new Set(cols.map((c) => c.COLUMN_NAME));
    const adds = [];
    if (!have.has('whatsapp_verified')) adds.push('ADD COLUMN whatsapp_verified BOOLEAN NOT NULL DEFAULT FALSE');
    if (!have.has('whatsapp_auth_key')) adds.push('ADD COLUMN whatsapp_auth_key VARCHAR(10) DEFAULT NULL');
    if (!have.has('whatsapp_code_hash')) adds.push('ADD COLUMN whatsapp_code_hash VARCHAR(64) DEFAULT NULL');
    if (!have.has('whatsapp_code_expires')) adds.push('ADD COLUMN whatsapp_code_expires DATETIME DEFAULT NULL');
    if (!have.has('whatsapp_code_attempts')) adds.push('ADD COLUMN whatsapp_code_attempts TINYINT UNSIGNED NOT NULL DEFAULT 0');
    if (!have.has('whatsapp_code_sent_at')) adds.push('ADD COLUMN whatsapp_code_sent_at DATETIME DEFAULT NULL');
    if (adds.length) {
      await conn.query(`ALTER TABLE users ${adds.join(', ')}`);
      console.log('[WHATSAPP OTP] added columns:', adds.join(', '));
    }
    return true;
  })().catch((err) => {
    console.error('[WHATSAPP OTP] could not verify OTP columns:', err.message);
    otpSchemaReady = null; // retry on next call
    throw err;
  });
  return otpSchemaReady;
}

/** Accepts an email or a phone in any common format ("0712…", "+254 712…"). */
function normalizeIdentifier(raw) {
  const v = String(raw || '').trim();
  if (!v) return null;
  if (v.includes('@')) return { type: 'email', value: v.toLowerCase() };
  const digits = v.replace(/\D/g, '');
  if (digits.length < 9 || digits.length > 15) return null;
  return { type: 'phone', value: `+${digits}`, digits };
}

const hashOtp = (code) => crypto.createHash('sha256').update(String(code)).digest('hex');
const generateOtp = () => String(crypto.randomInt(0, 10 ** OTP_LENGTH)).padStart(OTP_LENGTH, '0');

const maskTail = (v) => {
  const s = String(v);
  return s.length <= 4 ? '••' : s.slice(0, -4).replace(/[\dA-Za-z]/g, '•') + s.slice(-4);
};

/** Same generic answer for known and unknown identifiers → no enumeration. */
function genericResponse(identifier) {
  const shown = identifier.type === 'phone' ? maskTail(identifier.value) : identifier.value;
  return {
    success: true,
    message: `If an account exists for ${shown}, a verification code has been sent via WhatsApp.`,
    expiresInMinutes: OTP_TTL_MINUTES,
  };
}

async function findUser(identifier) {
  const conn = db.promise();
  if (identifier.type === 'email') {
    const [rows] = await conn.query(
      `SELECT id, display_name, email, phone_number, whatsapp_verified
         FROM users WHERE email = ? AND deleted_at IS NULL LIMIT 1`,
      [identifier.value],
    );
    return rows[0] || null;
  }
  // Match phone_number regardless of stored formatting (+254712 / 0712).
  const [rows] = await conn.query(
    `SELECT id, display_name, email, phone_number, whatsapp_verified
       FROM users
      WHERE deleted_at IS NULL
        AND REPLACE(REPLACE(REPLACE(REPLACE(phone_number, '+', ''), '-', ''), ' ', ''), '/', '') = ?
      LIMIT 1`,
    [identifier.digits],
  );
  return rows[0] || null;
}

function buildCodeMessage(user, code) {
  const firstName = String(user.display_name || user.email || 'there').trim().split(/\s+/)[0];
  return [
    `Hello ${firstName},`,
    ``,
    `Your verification code for THE-GREGGORY-SYSTEMS-AND-STRATEGY-FIRM client portal is:`,
    ``,
    `${code}`,
    ``,
    `It expires in ${OTP_TTL_MINUTES} minutes. Never share this code with anyone — our team will never ask for it.`,
  ].join('\n');
}

/**
 * Delivers the code and persists the hash ONLY after a successful send, so a
 * provider failure never leaves a code in the DB that nobody received.
 * Returns { simulated, code?, provider? } or { failure } for the caller to
 * turn into a response.
 */
async function storeAndSendCode(user) {
  const code = generateOtp();
  const message = buildCodeMessage(user, code);

  // ── SIMULATED MODE ─ no provider: store the code (verify-code works
  // locally) and hand it to the caller outside production.
  if (!providerConfigured()) {
    await db.promise().query(
      `UPDATE users
          SET whatsapp_code_hash = ?,
              whatsapp_code_expires = DATE_ADD(NOW(), INTERVAL ? MINUTE),
              whatsapp_code_attempts = 0,
              whatsapp_code_sent_at = NOW(),
              updated_at = NOW()
        WHERE id = ?`,
      [hashOtp(code), OTP_TTL_MINUTES, user.id],
    );
    await sendWhatsAppToUser(user.phone_number, message); // records the relay
    console.log(`[WHATSAPP OTP] SIMULATED code for user ${user.id}: ${code}`);
    return { simulated: true, code };
  }

  // ── REAL MODE ─ strict delivery first; persist the hash only on success.
  const wa = OTP_TEMPLATE_NAME
    ? await sendWhatsAppTemplateStrict(user.phone_number, OTP_TEMPLATE_NAME, [code], {
        fallbackMessage: message,
      })
    : await sendWhatsAppToUserStrict(user.phone_number, message);
  if (!wa.success) {
    console.error(`[WHATSAPP OTP] delivery failed for user ${user.id}: ${wa.error}`);
    return { failure: wa };
  }

  await db.promise().query(
    `UPDATE users
        SET whatsapp_code_hash = ?,
            whatsapp_code_expires = DATE_ADD(NOW(), INTERVAL ? MINUTE),
            whatsapp_code_attempts = 0,
            whatsapp_code_sent_at = NOW(),
            updated_at = NOW()
      WHERE id = ?`,
    [hashOtp(code), OTP_TTL_MINUTES, user.id],
  );
  return { simulated: false, provider: wa.provider };
}

/** POST /request-code — Body: { identifier: email | phone } */
router.post('/request-code', requestCodeLimiter, async (req, res) => {
  const identifier = normalizeIdentifier(req.body && req.body.identifier);
  if (!identifier) {
    return res.status(400).json({
      success: false,
      message: 'Provide the email or phone number registered to your portal account.',
    });
  }

  try {
    await ensureOtpColumns();
    const user = await findUser(identifier);

    // Unknown identifier → identical answer to a known one (no oracle); nothing
    // is generated or sent.
    if (!user) return res.json(genericResponse(identifier));

    // Cooldown hits answer exactly like a fresh send, so resend-spam is
    // worthless while a genuine retry a minute later still delivers.
    const cooldownKey = identifier.type === 'email' ? user.email : (user.phone_number || identifier.value);
    if (recentlySentCode(cooldownKey)) {
      console.log(`[WHATSAPP OTP] cooldown active for user ${user.id}; send suppressed`);
      return res.json(genericResponse(identifier));
    }

    if (!user.phone_number) {
      // No number on file, but revealing that would be an enumeration channel
      // — answer generically, log for ops.
      console.warn(`[WHATSAPP OTP] user ${user.id} has no phone number on file; code not sent`);
      return res.json(genericResponse(identifier));
    }

    const result = await storeAndSendCode(user);

    if (result.failure) {
      // Honest 502 for an existing account. This is a weak oracle that only
      // exists while the provider itself is down; silence here would strand
      // users staring at a phone that never receives anything.
      return res.status(502).json({
        success: false,
        message: 'We could not send the code right now. Please try again in a moment.',
      });
    }

    const body = genericResponse(identifier);
    body.simulated = result.simulated;
    if (result.provider) body.provider = result.provider;
    // Plaintext echo ONLY in simulated mode outside production — with a live
    // provider the code travels exclusively over WhatsApp.
    if (result.simulated && result.code && process.env.NODE_ENV !== 'production') {
      body.code = result.code;
    }
    return res.json(body);
  } catch (error) {
    console.error('[WHATSAPP OTP] request-code failed:', error.message);
    return res.status(500).json({ success: false, message: 'Could not process the code request.' });
  }
});

/** POST /verify-code — Body: { identifier, code } */
router.post('/verify-code', verifyCodeLimiter, async (req, res) => {
  const identifier = normalizeIdentifier(req.body && req.body.identifier);
  const code = String((req.body && req.body.code) || '').trim();

  if (!identifier) {
    return res.status(400).json({
      success: false,
      message: 'Provide the email or phone number registered to your portal account.',
    });
  }
  if (!new RegExp(`^\\d{${OTP_LENGTH}}$`).test(code)) {
    return res.status(400).json({ success: false, message: 'Enter the 6-digit code.' });
  }

  try {
    await ensureOtpColumns();
    const user = await findUser(identifier);
    const invalid = () => ({ success: false, message: 'Invalid or expired code. Please request a new one.' });

    if (!user) return res.status(400).json(invalid());

    const [rows] = await db.promise().query(
      `SELECT whatsapp_code_hash, whatsapp_code_expires, whatsapp_code_attempts
         FROM users WHERE id = ? LIMIT 1`,
      [user.id],
    );
    const state = rows[0];
    if (!state || !state.whatsapp_code_hash) return res.status(400).json(invalid());

    // Burn expired / exhausted codes so a stale hash never lingers as a
    // brute-force target.
    const expired = state.whatsapp_code_expires && new Date(state.whatsapp_code_expires) < new Date();
    if (expired || Number(state.whatsapp_code_attempts) >= OTP_MAX_ATTEMPTS) {
      await db.promise().query(
        'UPDATE users SET whatsapp_code_hash = NULL, whatsapp_code_expires = NULL, whatsapp_code_attempts = 0 WHERE id = ?',
        [user.id],
      );
      return res.status(400).json(expired
        ? invalid()
        : { success: false, message: 'Too many attempts. Please request a new code.' });
    }

    const provided = Buffer.from(hashOtp(code), 'hex');
    const stored = Buffer.from(String(state.whatsapp_code_hash), 'hex');
    const matches = provided.length === stored.length && crypto.timingSafeEqual(provided, stored);

    if (!matches) {
      await db.promise().query(
        'UPDATE users SET whatsapp_code_attempts = whatsapp_code_attempts + 1 WHERE id = ?',
        [user.id],
      );
      return res.status(400).json(invalid());
    }

    // Burn the code in the same statement that marks the phone verified — a
    // verified code can never be replayed.
    await db.promise().query(
      `UPDATE users
          SET whatsapp_verified = TRUE,
              whatsapp_code_hash = NULL,
              whatsapp_code_expires = NULL,
              whatsapp_code_attempts = 0,
              updated_at = NOW()
        WHERE id = ?`,
      [user.id],
    );

    console.log(`[WHATSAPP OTP] user ${user.id} verified their WhatsApp number`);
    return res.json({
      success: true,
      whatsapp_verified: true,
      message: 'Your WhatsApp number has been verified.',
    });
  } catch (error) {
    console.error('[WHATSAPP OTP] verify-code failed:', error.message);
    return res.status(500).json({ success: false, message: 'Could not verify the code.' });
  }
});

// Health probe for the portal/ops — never exposes secrets.
router.get('/status', (req, res) => {
  const diag = require('../services/whatsappService').getProviderDiagnostics();
  res.json({
    success: true,
    configured: diag.configured,
    provider: diag.activeProvider,
    template: OTP_TEMPLATE_NAME || null,
    otpTtlMinutes: OTP_TTL_MINUTES,
    issues: diag.issues,
  });
});

// Shared with other admin/user endpoints that need the same schema+hash.
router.ensureOtpColumns = ensureOtpColumns;
router.hashOtp = hashOtp;
router.generateOtp = generateOtp;
router.buildCodeMessage = buildCodeMessage;
router.OTP_TTL_MINUTES = OTP_TTL_MINUTES;

module.exports = router;

