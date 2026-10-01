/**
 * Admin session guard — the ONLY way into an admin-guarded modular route.
 *
 * This replaced `backend/middleware/auth.js`, an `x-admin-key` guard that was
 * dead weight in the auth system: a shared static string with no expiry, no
 * revocation and no session record. The admin console never sent that header
 * (0 occurrences of `x-admin-key` under src/), so the guard's only reachable
 * behaviour was answering `DELETE /api/users/:id` with a 500 when the env var
 * was unset — and if it had ever been set, it would have opened a second,
 * weaker admin door that skipped session auth entirely.
 *
 * The scheme here matches requireAdminSession in backend/routes/admin.js and
 * the main server's authenticateAdmin: a signed Bearer token minted by the
 * login endpoints (see backend/utils/sessionToken.js), which can expire and be
 * revoked through the session routes.
 */
const { verifySessionToken } = require('../utils/sessionToken');

function requireAdminSession(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization || '';
  const m = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!m) {
    return res.status(401).json({ success: false, message: 'Admin authentication required' });
  }
  const payload = verifySessionToken(m[1].trim());
  if (!payload) {
    return res.status(401).json({ success: false, message: 'Invalid or expired admin session' });
  }
  req.adminId = payload.uid;
  next();
}

module.exports = requireAdminSession;
