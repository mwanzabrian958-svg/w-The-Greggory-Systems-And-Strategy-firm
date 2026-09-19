const jwt = require("jsonwebtoken");
const db = require("../config/database");

/**
 * CLIENT AUTHENTICATION MIDDLEWARE
 * Implements "Set in Stone" routing integrity checks for the portal and
 * mobile client.
 *
 * Token resolution order:
 *   1. Bearer token from Authorization header
 *   2. x-auth-token / query token / body token fallbacks
 *   3. JWT verification (only if process.env.JWT_SECRET is configured)
 *   4. DB persistent auth_token lookup (tokens issued by /users/login
 *      start with "gf_lock_"; the legacy "gf_" prefix is also accepted)
 *
 * This middleware intentionally does NOT hard-fail when JWT_SECRET is
 * missing — environments that rely purely on the DB-persistent token
 * protocol (e.g. the Render deployment) must still be able to authenticate
 * portal requests.
 */
const authenticateUser = async (req, res, next) => {
  const authHeader =
    req.header("authorization") || req.header("Authorization");
  let token = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7).trim();
  } else if (authHeader) {
    token = authHeader.trim();
  }

  if (!token) {
    token = req.header("x-auth-token") || req.query.token || req.body?.token;
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication required" });
  }

  try {
    // 1. Try to verify as JWT first (standard sessions).
    //    If JWT_SECRET is not configured, jwt.verify will throw — that is
    //    expected in environments that only use the DB-persistent "gf_lock_…"
    //    token protocol, so we catch it and fall through to the DB lookup.
    let decoded = null;
    if (process.env.JWT_SECRET) {
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (jwtErr) {
        // not a valid JWT for this server — fall through to DB lookup
      }
    }

    if (decoded) {
      req.authUser = decoded;
      req.userId = decoded.userId || decoded.id || decoded.user?.id;
    }

    // 2. If no userId yet, check for DB persistent auth_token ("Set in Stone"
    //    routing). The /users/login endpoint issues tokens that start with
    //    "gf_lock_" — the legacy/alternate path also recognises the shorter
    //    "gf_" prefix used by older auth tokens.
    if (!req.userId) {
      const dbTokenPrefix = "gf_";
      if (typeof token === "string" && token.startsWith(dbTokenPrefix)) {
        const [dbUsers] = await db.promise().query(
          "SELECT id, email, primary_role FROM users WHERE auth_token = ? AND is_active = TRUE AND deleted_at IS NULL",
          [token],
        );

        if (dbUsers.length > 0) {
          const user = dbUsers[0];
          req.userId = user.id;
          req.authUser = {
            userId: user.id,
            email: user.email,
            role: user.primary_role,
          };
        }
      }
    }

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    // 3. "Set in Stone" Routing Integrity Verification
    const providedClientId = req.header("x-greggory-client-id");
    if (providedClientId && parseInt(providedClientId, 10) !== req.userId) {
      console.error(
        `[ROUTING BREACH] Token for user ${req.userId} used with header X-Greggory-Client-ID: ${providedClientId}`,
      );
      return res.status(403).json({
        success: false,
        message: "Routing Integrity Breach: Client ID mismatch",
      });
    }

    next();
  } catch (error) {
    console.error("[AUTH] Invalid token:", error.message);
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired authentication token" });
  }
};

module.exports = authenticateUser;
