const jwt = require('jsonwebtoken');
const db = require('../config/database');

/**
 * CLIENT AUTHENTICATION MIDDLEWARE
 * Implements "Set in Stone" routing integrity checks for the mobile client and dashboard.
 */
const authenticateUser = async (req, res, next) => {
  const authHeader = req.header('authorization') || req.header('Authorization');
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (authHeader) {
    token = authHeader.trim();
  }

  if (!token) {
    token = req.header('x-auth-token') || req.query.token || req.body?.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  try {
    // 1. Try to verify as JWT first (standard sessions)
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.authUser = decoded;
      req.userId = decoded.userId || decoded.id || decoded.user?.id;
    } catch (jwtErr) {
      // 2. If JWT fails, check for DB persistent auth_token (Set in Stone routing)
      const [dbUsers] = await db.promise().query(
        'SELECT id, email, primary_role FROM users WHERE auth_token = ? AND is_active = TRUE AND deleted_at IS NULL',
        [token]
      );

      if (dbUsers.length > 0) {
        const user = dbUsers[0];
        req.userId = user.id;
        req.authUser = { userId: user.id, email: user.email, role: user.primary_role };
      } else {
        throw jwtErr;
      }
    }

    if (!req.userId) {
      return res.status(401).json({ success: false, message: 'Invalid authentication token' });
    }

    // 3. "Set in Stone" Routing Integrity Verification
    const providedClientId = req.header('x-greggory-client-id');
    if (providedClientId && parseInt(providedClientId) !== req.userId) {
        console.error(`[ROUTING BREACH] Token for user ${req.userId} used with header X-Greggory-Client-ID: ${providedClientId}`);
        return res.status(403).json({ success: false, message: 'Routing Integrity Breach: Client ID mismatch' });
    }

    next();
  } catch (error) {
    console.error('[AUTH] Invalid token:', error.message);
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token' });
  }
};

module.exports = authenticateUser;
