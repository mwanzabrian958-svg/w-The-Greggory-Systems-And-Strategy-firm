/**
 * SESSION TOKEN UTIL
 * Signs/verifies admin & developer session tokens in the EXACT format that the
 * main server (server.js -> signAdminSessionToken / verifyAdminSessionToken)
 * accepts: `base64url(JSON payload).base64url(HMAC-SHA256 signature)`.
 *
 * Before this module existed, the login endpoints returned an UNSIGNED
 * placeholder token (`admin-session-<timestamp>-<id>`), so every subsequent
 * session check (`/api/admin/session`), the `authenticateAdmin` middleware
 * (`/api/users`, dashboard) and inline admin endpoints rejected the session —
 * the auth system appeared broken and the admin UI couldn't reliably load or
 * manage users.
 */

const crypto = require('crypto');

// Resolve the signing secret ONCE at module load (mirrors server.js, which also
// computes its session secret at boot). If no env secret is configured we fall
// back to an ephemeral random value — but it MUST be captured once so sign and
// verify always agree within the same process.
const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  process.env.JWT_SECRET ||
  crypto.randomBytes(32).toString('hex');

function getSessionSecret() {
  return SESSION_SECRET;
}

/**
 * Sign a user id into a session token.
 * @param {number|string} userId
 * @param {string} [role] - 'admin' | 'developer' (informational only)
 * @returns {string} `${base64url(payload)}.${base64url(hmac)}`
 */
function signSessionToken(userId, role) {
  const payload = {
    uid: Number(userId),
    exp: Date.now() + 8 * 60 * 60 * 1000, // 8h — matches server.js
  };
  if (role) payload.role = role;

  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto
    .createHmac('sha256', getSessionSecret())
    .update(body)
    .digest('base64url');
  return `${body}.${sig}`;
}

/**
 * Verify a session token exactly like server.js does (timing-safe).
 * @returns {object|null} decoded payload `{ uid, exp, role? }` or null
 */
function verifySessionToken(token) {
  if (!token || typeof token !== 'string') return null;

  const dot = token.lastIndexOf('.');
  if (dot < 1) return null;

  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!body || !sig) return null;

  const expected = crypto
    .createHmac('sha256', getSessionSecret())
    .update(body)
    .digest('base64url');

  const sigBuf = Buffer.from(sig, 'utf8');
  const expBuf = Buffer.from(expected, 'utf8');
  if (sigBuf.length !== expBuf.length) return null;

  try {
    if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;
  } catch {
    return null;
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch {
    return null;
  }

  if (!payload.uid || !payload.exp || Date.now() > payload.exp) return null;
  return payload;
}

module.exports = { signSessionToken, verifySessionToken, getSessionSecret };