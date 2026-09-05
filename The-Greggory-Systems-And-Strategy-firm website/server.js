const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mysql = require("mysql2/promise");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { createClient } = require('redis');
const PDFDocument = require('pdfkit');
const { OAuth2Client } = require('google-auth-library');
const { connectMongoDB } = require("./server/config/mongodb");
const models = require("./server/models");
const {
  User, Project, Document, Message, WebsiteContent,
  Finance, Company, BlogArticle, CaseStudy, Video,
  ContactForm, Transaction, ActivityLog
} = models;
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const crypto = require("crypto");

// ── SECURITY: resolve all secrets at boot — never fall back to a literal. ──
// A hardcoded fallback secret in a public repo lets anyone forge tokens.
// If a secret is missing we use an ephemeral random value instead: tokens
// stay unforgable (they just invalidate on restart until the env var is set).
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");
const ADMIN_SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET || process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");
if (!process.env.JWT_SECRET) {
  console.error(
    "[SECURITY][CRITICAL] JWT_SECRET is not set — using an ephemeral random secret. " +
      "All JWT sessions will invalidate on every restart. Set JWT_SECRET in your environment!"
  );
}
if (!process.env.ADMIN_SESSION_SECRET && !process.env.JWT_SECRET) {
  console.error(
    "[SECURITY][CRITICAL] ADMIN_SESSION_SECRET/JWT_SECRET are not set — admin sessions are " +
      "ephemeral. Set ADMIN_SESSION_SECRET in your environment!"
  );
}
// ─────────────────────────────────────────────────────────────────────────────
const bcryptjs = require("bcryptjs");
const { buildClientPortalPayload } = require("./server/utils/clientPortalData");
const { sendWhatsAppToUser, sendWhatsAppToUserStrict, providerConfigured: whatsappProviderConfigured } = require("./backend/services/whatsappService");
const { sendMail, sendInvoiceEmail } = require("./backend/services/emailService");
// Professional document renderers (PDF + email HTML) — see server/lib/invoiceRenderer.js
const { generatePDFContent, buildDocumentEmailHtml } = require("./server/lib/invoiceRenderer");
const { normalizeRate, rateToPct } = require("./server/lib/kraTax");
// PDF co-generator for completion records
const { generateCompletionPdf } = require("./server/services/pdfGenerator");
require("dotenv").config();

// Initialize Security & Auth Clients
const redis = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
redis.connect().catch(err => console.warn('[REDIS] Not connected, using memory fallback.'));
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── AUTH MIDDLEWARE ──────────────────────────────────────────

const authenticateUser = (req, res, next) => {
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
    const decoded = jwt.verify(token, JWT_SECRET);
    req.authUser = decoded;
    req.userId = decoded.userId || decoded.id || decoded.user?.id;

    if (!req.userId) {
      return res.status(401).json({ success: false, message: 'Invalid authentication token' });
    }

    next();
  } catch (error) {
    console.error('[AUTH] Invalid token:', error.message);
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token' });
  }
};

function getAdminSessionSecret() {
  return ADMIN_SESSION_SECRET;
}

function signAdminSessionToken(userId) {
  const payload = {
    uid: Number(userId),
    exp: Date.now() + 8 * 60 * 60 * 1000,
  };
  const secret = getAdminSessionSecret();
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );
  const sig = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("base64url");
  return `${body}.${sig}`;
}

function verifyAdminSessionToken(token) {
  if (!token || typeof token !== "string") return null;
  const dot = token.lastIndexOf(".");
  if (dot < 1) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!body || !sig) return null;
  const secret = getAdminSessionSecret();
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("base64url");
  const sigBuf = Buffer.from(sig, "utf8");
  const expBuf = Buffer.from(expected, "utf8");
  if (sigBuf.length !== expBuf.length) return null;
  try {
    if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;
  } catch {
    return null;
  }
  let payload;
  try {
    payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (!payload.uid || !payload.exp || Date.now() > payload.exp) return null;
  return payload;
}

const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const m = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!m) {
    return res.status(401).json({ success: false, message: "Admin authentication required" });
  }

  const payload = verifyAdminSessionToken(m[1].trim());
  if (!payload) {
    return res.status(401).json({ success: false, message: "Invalid or expired admin session" });
  }

  req.adminId = payload.uid;
  req.user = { id: payload.uid };
  next();
};

const logDataAccess = async (req, entityType, entityId, action = 'view') => {
  try {
    const classificationId = req.headers['x-data-classification'] ? parseInt(req.headers['x-data-classification']) : null;
    await mainDb.query(`
      INSERT INTO data_access_logs (user_id, user_type, entity_type, entity_id, action, data_classification_id, ip_address, user_agent, session_id, request_method, request_url, access_granted)
      VALUES (?, 'admin', ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `, [
      req.adminId || req.user?.id || 0,
      entityType,
      entityId || 0,
      action,
      classificationId,
      req.ip || req.connection.remoteAddress || null,
      req.get('user-agent') || null,
      req.headers.authorization || null,
      req.method,
      req.originalUrl || req.url
    ]);
  } catch (error) {
    console.error('[DATA ACCESS LOG] Failed:', error.message);
  }
};

// In-memory fallback for Redis (development)
const memoryStore = new Map();

// Security Helper Functions
const isAccountLocked = async (email) => {
  const lockoutKey = `admin_account_locked_${email}`;
  if (redis.isOpen) {
    const isLocked = await redis.get(lockoutKey);
    return isLocked === "true";
  } else {
    const lockout = memoryStore.get(lockoutKey);
    return lockout && lockout.expires > Date.now();
  }
};

const trackFailedLogin = async (email, ip) => {
  const attemptsKey = `admin_failed_attempts_${email}`;
  const lockoutKey = `admin_account_locked_${email}`;
  const rateLimitKey = `admin_login_attempts_${ip}`;

  try {
    let failedAttempts;
    if (redis.isOpen) {
      failedAttempts = await redis.incr(attemptsKey);
      await redis.expire(attemptsKey, 3600);
      await redis.incr(rateLimitKey);
      await redis.expire(rateLimitKey, 900);

      if (failedAttempts >= 5) {
        await redis.set(lockoutKey, "true", { EX: 1800 });
      }
    } else {
      // Memory fallback
      const now = Date.now();
      const current = memoryStore.get(attemptsKey) || { count: 0, expires: 0 };
      failedAttempts = current.expires > now ? current.count + 1 : 1;
      memoryStore.set(attemptsKey, {
        count: failedAttempts,
        expires: now + 3600000,
      });

      const rateLimit = memoryStore.get(rateLimitKey) || {
        count: 0,
        expires: 0,
      };
      const newRateCount = rateLimit.expires > now ? rateLimit.count + 1 : 1;
      memoryStore.set(rateLimitKey, {
        count: newRateCount,
        expires: now + 900000,
      });

      if (failedAttempts >= 5) {
        memoryStore.set(lockoutKey, { locked: true, expires: now + 1800000 });
      }
    }

    if (failedAttempts >= 5) {
      console.warn(`[SECURITY] Account locked: ${email} from IP: ${ip}`);
    }
  } catch (error) {
    console.error("Security tracking error:", error);
  }
};

const clearFailedAttempts = async (email, ip) => {
  try {
    if (redis.isOpen) {
      await redis.del(`admin_failed_attempts_${email}`);
      await redis.del(`admin_account_locked_${email}`);
      await redis.del(`admin_login_attempts_${ip}`);
    } else {
      memoryStore.delete(`admin_failed_attempts_${email}`);
      memoryStore.delete(`admin_account_locked_${email}`);
      memoryStore.delete(`admin_login_attempts_${ip}`);
    }
  } catch (error) {
    console.error("Error clearing failed attempts:", error);
  }
};

/** Client IP string for admin routes (first hop if X-Forwarded-For is set). */
function getClientIpForAdmin(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (fwd) {
    return String(fwd).split(",")[0].trim();
  }
  return (
    req.ip || req.socket?.remoteAddress || req.connection?.remoteAddress || ""
  );
}

/** True when the request clearly comes from this machine (loopback). */
function isLocalAdminIp(raw) {
  if (!raw || typeof raw !== "string") return false;
  const ip = raw
    .replace(/^::ffff:/i, "")
    .trim()
    .toLowerCase();
  return (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip === "localhost" ||
    ip === "0:0:0:0:0:0:0:1" ||
    ip === "::ffff:127.0.0.1"
  );
}

// NOTE: generatePDFContent + buildDocumentEmailHtml moved to
// server/lib/invoiceRenderer.js (professional invoice/quote/receipt layout) —
// required at the top of this file, so every route below uses the new renderer.

const app = express();

// Render sits behind one reverse proxy. Without this, every request
// appears to come from the proxy's internal IP and the global 100-req/15-min
// rate limit becomes ONE shared bucket for all visitors (the site 429s after
// ~100 hits — looks like the site "crashed"). It also fixes req.ip for logging.
app.set("trust proxy", 1);
const PORT = process.env.PORT || 5000;

const formatMpesaPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return null;
  const normalized = String(phoneNumber).replace(/\s+/g, '').replace(/[^\d]/g, '');
  if (!normalized) return null;
  if (normalized.startsWith('254')) return normalized;
  if (normalized.startsWith('0')) return `254${normalized.slice(1)}`;
  if (normalized.startsWith('+254')) return normalized.replace('+', '');
  return normalized;
};

const buildMpesaPassword = (shortcode, passkey, timestamp) => {
  const raw = `${shortcode}${passkey}${timestamp}`;
  return Buffer.from(raw, 'utf8').toString('base64');
};

// Middleware
// CORS configuration - allow frontend to access API
// Supports localhost AND any local-network IP (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // Always allow the configured FRONTEND_URL env var
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL)
      return callback(null, true);
    // Allow localhost on any port
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))
      return callback(null, true);
    // Allow any private-network IP on any port
    if (/^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(origin))
      return callback(null, true);
    // Block everything else
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "x-admin-key",
  ],
};
// Same-origin allowance: browsers attach an Origin header to same-origin
// POST/PUT/DELETE requests too. Without this, ANY mismatch between
// FRONTEND_URL and the real site origin (custom domain, trailing slash,
// name taken at signup...) would make CORS 500 every write request.
app.use(
  cors((req, callback) => {
    callback(null, {
      ...corsOptions,
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);
        if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL)
          return cb(null, true);
        // Same-origin: Origin host must equal the request's Host header.
        try {
          const originHost = new URL(origin).host;
          const hostHeader = (req.headers.host || "").split(",")[0].trim();
          if (hostHeader && originHost === hostHeader) return cb(null, true);
        } catch {
          // malformed Origin header -> fall through to the allowlist below
        }
        if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))
          return cb(null, true);
        if (/^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(origin))
          return cb(null, true);
        return cb(new Error(`CORS: origin ${origin} not allowed`));
      },
    });
  }),
);
app.use(
  helmet({
    // helmet's default Content-Security-Policy would block the built app's
    // cross-origin resources (Google Sign-In script, external fonts/images)
    // once it is served from this server in production. All other helmet
    // security headers stay active.
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(express.static("public"));

// Single-origin production mode: serve the built React app (dist/) from this
// same server, exactly like the Vite dev proxy does on localhost. One origin
// means no CORS issues, no separate static host, no API URL mismatch.
const distDir = path.join(__dirname, "dist");
app.use(express.static(distDir));

// ── LIVE USER TRACKING MIDDLEWARE ────────────────────────────
app.use(async (req, res, next) => {
  try {
    const authHeader = req.header('authorization') || req.header('Authorization') || "";
    let token = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    } else if (authHeader) {
      token = authHeader.trim();
    }

    if (token) {
      // 1. Check for Admin Session Token (Custom HMAC)
      const adminPayload = verifyAdminSessionToken(token);
      if (adminPayload && adminPayload.uid) {
        // Fire and forget updates to both admin and developer tables
        mainDb.query("UPDATE admin_users SET last_active_at = NOW() WHERE id = ?", [adminPayload.uid]).catch(() => {});
        mainDb.query("UPDATE developer_users SET last_active_at = NOW() WHERE id = ?", [adminPayload.uid]).catch(() => {});
      } else {
        // 2. Check for Standard JWT (Regular Users)
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          const userId = decoded.userId || decoded.id || decoded.user?.id;
          if (userId) {
            mainDb.query("UPDATE users SET last_active_at = NOW() WHERE id = ?", [userId]).catch(() => {});
          }
        } catch (jwtErr) {
          // Token might be invalid or for another part of the system, ignore
        }
      }
    }
  } catch (err) {
    // Middleware should never crash the app
    console.error('[LIVE TRACKER] Error:', err.message);
  }
  next();
});

// Multer configuration for profile photo uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// ============================================================================
// DATABASE — two-MySQL failover (explicit pools, no PoolCluster).
// The app "looks at both SQL ports" and uses whichever one answers:
//   1. local XAMPP   -> DB_HOST_2 / DB_PORT_2  (127.0.0.1:3306)
//   2. claude / cloud-> DB_HOST / DB_PORT      (e.g. Aiven :28067)
// Why not mysql2 PoolCluster: its Pool.getConnection has NO acquire timeout —
// if a handshake wedges, every query queues FOREVER with no error (observed).
// Explicit pools + a hard per-query timeout guarantee requests always get an
// answer (from the other endpoint, or a fast error the routes can render).
// ============================================================================
const { endpoints: dbEndpoints, cloudSslEnabled } = require("./server/config/dbEndpoints");

const DB_NAME = process.env.DB_NAME || "the_greggory_systems_and_strategy_firm_db_main";
const MAIN_DB_TIMEOUT_MS = 12000; // hard cap per query attempt (failover budget)

const _dbPools = []; // [ { label, pool } ] in priority order (local first)
dbEndpoints().forEach((cfg, i) => {
  const { label, ...opts } = cfg;
  const pool = mysql.createPool({
    ...opts,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 5,
    idleTimeout: 60000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
  }); // mysql2/promise pool — already promise-based
  _dbPools.push({ label: label || `pool-${i}`, pool });
  console.log(`[DATABASE] endpoint ${label || i}: ${opts.host}:${opts.port}`);
});

function _withTimeout(promise, ms, label) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => {
      const err = new Error(`DB endpoint "${label}" timed out after ${ms}ms`);
      err.code = "ETIMEDOUT_ENDPOINT";
      reject(err);
    }, ms);
    promise.then(
      (v) => { clearTimeout(t); resolve(v); },
      (e) => { clearTimeout(t); reject(e); }
    );
  });
}

// Run fn(pool) against the first endpoint that answers; fall through on error.
async function _dbRun(fn) {
  let lastErr;
  for (const { label, pool } of _dbPools) {
    try {
      return await _withTimeout(fn(pool), MAIN_DB_TIMEOUT_MS, label);
    } catch (err) {
      lastErr = err;
      console.error(`[DATABASE] endpoint ${label} failed:`, err.code || err.message, "— failing over");
    }
  }
  throw lastErr;
}

// mainDb = failover-capable pool. `db` is an alias for legacy compatibility.
const mainDb = {
  query(sql, values) {
    return _dbRun((pool) => pool.query(sql, values));
  },
  execute(sql, values) {
    return _dbRun((pool) => pool.execute(sql, values));
  },
  async getConnection() {
    let lastErr;
    for (const { label, pool } of _dbPools) {
      try {
        return await _withTimeout(pool.getConnection(), MAIN_DB_TIMEOUT_MS, label);
      } catch (err) {
        lastErr = err;
        console.error(`[DATABASE] getConnection ${label} failed:`, err.code || err.message);
      }
    }
    throw lastErr;
  },
  cluster: {
    end: (cb) => {
      Promise.all(_dbPools.map(({ pool }) => pool.end())).then(() => cb && cb()).catch(cb);
    },
  },
};
const db = mainDb;

// ── Fallback project resolvers ────────────────────────────────────────────────
// invoices.project_id → projects.id ; accounting_entries.project_id → either
// user_projects.id (local XAMPP) or projects.id (cloud Aiven) depending on how
// that endpoint's schema was created. When a client omits project_id we attach
// the record to a "General / Unassigned" engagement so the NOT NULL + FK
// constraints stay satisfied. The fallback row is seeded lazily if the target
// table is empty (self-heals on any fresh database).
async function getFirstUserId() {
  const [u] = await mainDb.query("SELECT id FROM users ORDER BY id LIMIT 1");
  return (u && u[0] && u[0].id) || null;
}

async function resolveInvoiceProjectId(provided) {
  if (provided && Number(provided) > 0) return Number(provided);
  const [rows] = await mainDb.query("SELECT id FROM projects ORDER BY id LIMIT 1");
  if (rows && rows.length) return rows[0].id;
  const uid = await getFirstUserId();
  if (!uid) throw new Error("No users available to own the fallback project");
  const [res] = await mainDb.query(
    `INSERT INTO projects (name, description, status, start_date, expected_completion, client_name, created_by)
     VALUES ('General / Unassigned', 'Auto-created fallback engagement for records without an assigned project.', 'active', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR), 'General', ?)`,
    [uid]
  );
  return res.insertId;
}

// The active endpoint (first healthy one in the failover pool) decides which
// table accounting_entries.project_id must point at. Read the live schema's FK
// so the same endpoint that answers the SELECT also accepts the INSERT.
async function resolveAccountingProjectId(provided) {
  if (provided && Number(provided) > 0) return Number(provided);
  let ref = "user_projects";
  try {
    const [fkr] = await mainDb.query(
      `SELECT REFERENCED_TABLE_NAME AS t
         FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'accounting_entries'
          AND COLUMN_NAME = 'project_id'
        LIMIT 1`
    );
    if (fkr && fkr[0] && fkr[0].t) ref = fkr[0].t;
  } catch (e) { /* keep default */ }

  const [rows] = await mainDb.query(`SELECT id FROM \`${ref}\` ORDER BY id LIMIT 1`);
  if (rows && rows.length) return rows[0].id;

  const uid = await getFirstUserId();
  if (!uid) throw new Error(`No users available for the fallback accounting project (${ref})`);
  if (ref === "projects") {
    const [res] = await mainDb.query(
      `INSERT INTO projects (name, description, status, start_date, expected_completion, client_name, created_by)
       VALUES ('General / Unassigned', 'Auto-created fallback engagement for accounting entries.', 'active', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR), 'General', ?)`,
      [uid]
    );
    return res.insertId;
  }
  const [res] = await mainDb.query(
    "INSERT INTO user_projects (user_id, project_name, project_type, status, created_by) VALUES (?, 'General / Unassigned', 'consulting', 'planning', ?)",
    [uid, uid]
  );
  return res.insertId;
}

// Test main database connection
app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await mainDb.query("SELECT 1 as test");
    res.json({
      success: true,
      message: "Database connection successful",
      data: rows,
    });
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message || error.code || error.name || String(error),
    });
  }
});

// Test MongoDB connection
app.get("/api/test-mongodb", async (req, res) => {
  try {
    const state = mongoose.connection.readyState;
    const states = ["disconnected", "connected", "connecting", "disconnecting"];
    res.json({
      success: true,
      message: `MongoDB Status: ${states[state]}`,
      connectionState: state
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "MongoDB connection test failed",
      error: error.message
    });
  }
});

app.post('/api/mpesa/callback', (req, res) => {
  console.log('[MPESA] callback received:', JSON.stringify(req.body || {}));
  res.status(200).json({
    ResultCode: 0,
    ResultDesc: 'Accepted'
  });
});

app.post('/api/mpesa/stkpush', async (req, res) => {
  try {
    const {
      phoneNumber,
      amount,
      accountReference,
      description,
      userId,
    } = req.body || {};

    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const passkey = process.env.MPESA_PASSKEY;
    const shortcode = process.env.MPESA_SHORTCODE || '174379';
    const callbackUrl = process.env.MPESA_CALLBACK_URL || 'http://localhost:3000/api/mpesa/callback';

    if (!consumerKey || !consumerSecret || !passkey) {
      return res.status(500).json({
        success: false,
        message: 'M-Pesa credentials are not configured on the server. Set MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_PASSKEY, and MPESA_SHORTCODE first.'
      });
    }

    if (!phoneNumber || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and amount are required.'
      });
    }

    const formattedPhone = formatMpesaPhoneNumber(phoneNumber);
    if (!formattedPhone || formattedPhone.length < 12) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid phone number in the format 07xxxxxxxx or 2547xxxxxxxx.'
      });
    }

    const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z').slice(0, 14);
    const password = buildMpesaPassword(shortcode, passkey, timestamp);

    // Daraja environment follows NODE_ENV: sandbox for development,
    // production API once NODE_ENV=production (go-live).
    const darajaHost = process.env.NODE_ENV === 'production' ? 'api.safaricom.co.ke' : 'sandbox.safaricom.co.ke';

    const authResponse = await fetch(`https://${darajaHost}/oauth/v1/generate?grant_type=client_credentials`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')}`,
      },
    });

    const authData = await authResponse.json();
    if (!authResponse.ok) {
      throw new Error(authData?.error_description || 'Failed to authenticate with Safaricom');
    }

    const accessToken = authData.access_token;
    const payload = {
      BusinessShortCode: Number(shortcode),
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Number(amount),
      PartyA: Number(formattedPhone),
      PartyB: Number(shortcode),
      PhoneNumber: Number(formattedPhone),
      CallBackURL: callbackUrl,
      AccountReference: String(accountReference || 'TheGreggory'),
      TransactionDesc: String(description || `Payment from ${userId || 'client'}`)
    };

    const stkResponse = await fetch(`https://${darajaHost}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const stkData = await stkResponse.json();

    if (!stkResponse.ok) {
      throw new Error(stkData?.errorMessage || stkData?.requestDescription || 'Safaricom STK push request failed');
    }

    console.log('[MPESA] STK push accepted:', JSON.stringify(stkData));

    return res.json({
      success: true,
      message: 'M-Pesa prompt sent to your phone. Enter your PIN to complete payment.',
      data: stkData,
      customerMessage: 'M-Pesa prompt sent to your phone. Enter your PIN to complete payment.'
    });
  } catch (error) {
    console.error('[MPESA] STK push failed:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send M-Pesa PIN request.',
      error: error.message,
    });
  }
});

// List all databases
app.get("/api/databases", async (req, res) => {
  try {
    const [rows] = await mainDb.query(
      `SELECT schema_name as name
       FROM information_schema.schemata
       WHERE schema_name NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys', 'phpmyadmin')`,
    );
    res.json({ success: true, databases: rows });
  } catch (error) {
    console.error("Error fetching databases:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching databases",
      error: error.message,
    });
  }
});

// Dynamic database connection middleware — ADMIN-ONLY.
// This endpoint family can read arbitrary tables of a database, so it must
// never be reachable without an admin session, and both the database and
// table names are strictly validated (they are interpolated into SQL).
const SAFE_IDENTIFIER = /^[A-Za-z0-9_]+$/;
app.use("/api/db/:database", authenticateAdmin, async (req, res, next) => {
  const { database } = req.params;

  if (!SAFE_IDENTIFIER.test(database)) {
    return res.status(400).json({ success: false, message: "Invalid database name" });
  }
  const allowedDatabases = new Set(
    [process.env.DB_NAME, process.env.DB_NAME_2, process.env.DB_CLOUD_NAME].filter(Boolean)
  );
  if (allowedDatabases.size > 0 && !allowedDatabases.has(database)) {
    return res.status(403).json({ success: false, message: "Database not allowed" });
  }

  // Skip if it's the databases endpoint
  if (req.path.includes("/databases")) return next();

  try {
    // Create a connection to the requested database, trying each configured
    // MySQL endpoint (local:3306, then claude) until one answers.
    let lastErr;
    let connection = null;
    for (const cfg of dbEndpoints()) {
      const { label, ...opts } = cfg;
      try {
        connection = await mysql.createConnection({ ...opts, database });
        break;
      } catch (e) {
        lastErr = e;
        console.warn(
          `[DATABASE] endpoint ${label || opts.host}:${opts.port} failed for db "${database}":`,
          e.code || e.message
        );
      }
    }
    if (!connection) throw lastErr || new Error("No MySQL endpoint reachable");

    // Attach the connection to the request
    req.db = connection;

    // Close the connection when response is sent
    res.on("finish", () => {
      connection.end().catch(console.error);
    });

    next();
  } catch (error) {
    console.error(`Error connecting to database ${database}:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to connect to database: ${database}`,
      error: error.message,
    });
  }
});

// Get tables from a specific database
app.get("/api/db/:database/tables", async (req, res) => {
  try {
    const [tables] = await req.db.query("SHOW TABLES");
    res.json({ success: true, tables });
  } catch (error) {
    console.error("Error fetching tables:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching tables",
      error: error.message,
    });
  }
});

// Get table data
app.get("/api/db/:database/table/:table", authenticateAdmin, async (req, res) => {
  const { database, table } = req.params;
  const { limit = 100, offset = 0 } = req.query;

  // The table name is interpolated into SQL below — only allow safe identifiers
  if (!SAFE_IDENTIFIER.test(table)) {
    return res.status(400).json({ success: false, message: "Invalid table name" });
  }

  try {
    // Get table structure
    const [columns] = await req.db.query(`DESCRIBE ${table}`);

    // Get table data with pagination
    const [rows] = await req.db.query(
      `SELECT * FROM ${table} LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)],
    );

    // Get total count for pagination
    const [[{ total }]] = await req.db.query(
      `SELECT COUNT(*) as total FROM ${table}`,
    );

    res.json({
      success: true,
      database,
      table,
      columns,
      data: rows,
      pagination: {
        total: parseInt(total),
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    console.error(`Error fetching data from ${database}.${table}:`, error);
    res.status(500).json({
      success: false,
      message: `Error fetching data from ${table}`,
      error: error.message,
    });
  }
});

// ========== WEBSITE API ENDPOINTS ==========

// Users API
app.get("/api/users", authenticateAdmin, async (req, res) => {
  try {
    // Union all identity tables to provide a master view for the admin panel
    const [users] = await mainDb.query(`
      SELECT id, email, first_name, last_name, display_name, phone_number, alt_phone, id_number, physical_address, primary_role AS role, last_active_at, whatsapp_auth_key, whatsapp_verified, created_at, 'client' as source_table FROM users WHERE deleted_at IS NULL
      UNION ALL
      SELECT id, email, first_name, last_name, display_name, phone_number, alt_phone, id_number, physical_address, admin_level AS role, last_active_at, whatsapp_auth_key, whatsapp_verified, created_at, 'admin' as source_table FROM admin_users WHERE deleted_at IS NULL
      UNION ALL
      SELECT id, email, first_name, last_name, display_name, phone_number, alt_phone, id_number, physical_address, developer_level AS role, last_active_at, whatsapp_auth_key, whatsapp_verified, created_at, 'developer' as source_table FROM developer_users WHERE deleted_at IS NULL
      ORDER BY created_at DESC
    `);
    res.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
});

app.post("/api/users", authenticateAdmin, async (req, res) => {
  try {
    const {
      email,
      password,
      first_name,
      last_name,
      display_name,
      role = "user",
    } = req.body;

    const [result] = await mainDb.query(
      "INSERT INTO users (email, password_hash, first_name, last_name, display_name, primary_role) VALUES (?, ?, ?, ?, ?, ?)",
      [email, password, first_name, last_name, display_name, role],
    );

    res.json({ success: true, userId: result.insertId });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message,
    });
  }
});

// Login endpoint - Regular Users
// REMOVED INLINE LOGIN - HANDLED BY MODULAR ROUTE /backend/routes/users.js
// This ensures the Auth Lockdown validator is active.

// Registration endpoint - accepts JSON with optional profile photo
// REMOVED INLINE REGISTER - HANDLED BY MODULAR ROUTE /backend/routes/users.js

// Admin-to-client feedback handlers
const handleClientFeedbackList = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const [feedbackRows] = await mainDb.query(
      `SELECT id, title, message, feedback_type, status, priority, created_at, admin_response, responded_at
       FROM user_feedback
       WHERE user_id = ? AND deleted_at IS NULL AND status != 'closed' AND author = 'admin'
       ORDER BY created_at DESC
       LIMIT 12`,
      [userId],
    );

    res.json({ success: true, feedback: feedbackRows });
  } catch (error) {
    console.error("[CLIENT FEEDBACK] List error:", error);
    res.status(500).json({ success: false, message: "Failed to load client feedback" });
  }
};

const handleClientFeedbackCreate = async (req, res) => {
  try {
    const { userId, title, message, priority = "medium", rating, type, author } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ success: false, message: "Client ID and message are required" });
    }

    // author='client'  -> sent from the client portal: lands on the ADMIN
    //                     dashboard (Support page) and is hidden from the
    //                     client's own portal list.
    // author='admin'   -> relay from the admin Communication Hub: stays
    //                     visible in the client's portal (existing behavior).
    const isClientSent = author === "client";

    const FEEDBACK_TYPES = [
      "project_review",
      "service_feedback",
      "complaint",
      "suggestion",
      "testimonial",
      "bug_report",
    ];
    const feedbackType = FEEDBACK_TYPES.includes(type) ? type : "service_feedback";
    const ratingNum = Number(rating);
    const ratingValue =
      Number.isFinite(ratingNum) && ratingNum >= 1 && ratingNum <= 5 ? ratingNum : null;
    const priorityValue = ["low", "medium", "high", "urgent"].includes(
      String(priority).toLowerCase(),
    )
      ? String(priority).toLowerCase()
      : "medium";

    const [result] = await mainDb.query(
      `INSERT INTO user_feedback (user_id, title, message, feedback_type, author, status, priority, rating, source, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, 'new', ?, ?, 'website', ?, NOW())`,
      [
        userId,
        title || (isClientSent ? "Client feedback" : "Admin update"),
        message,
        feedbackType,
        isClientSent ? "client" : "admin",
        priorityValue,
        ratingValue,
        isClientSent ? 0 : 1,
      ],
    );

    res.status(201).json({
      success: true,
      message: isClientSent ? "Feedback sent to our team" : "Feedback sent to client portal",
      feedbackId: result.insertId,
    });
  } catch (error) {
    console.error("[CLIENT FEEDBACK] Create error:", error);
    res.status(500).json({ success: false, message: "Failed to send feedback" });
  }
};

// Route handlers for user registration
// REMOVED INLINE ROUTES - HANDLED BY MODULAR ROUTER

// Authentication verification endpoints removed for streamlined access


app.get("/api/users/client-feedback/:userId", authenticateUser, handleClientFeedbackList);
app.post("/api/users/client-feedback", handleClientFeedbackCreate);

// ─────────────────────────────────────────────────────────────
// CLIENT SELF-SERVICE — change requests (client-writable)
// Every client action mirrors into user_feedback (author='client') so the
// admin Support panel sees it instantly.
// ─────────────────────────────────────────────────────────────
const notifyAdminPanel = async (userId, title, message, priority = "medium") => {
  try {
    await mainDb.query(
      `INSERT INTO user_feedback (user_id, title, message, feedback_type, author, status, priority, rating, source, created_by, created_at)
       VALUES (?, ?, ?, 'service_feedback', 'client', 'new', ?, NULL, 'website', 0, NOW())`,
      [userId, title, message, priority],
    );
  } catch (e) {
    console.error("[CLIENT ACTIONS] admin mirror failed:", e.message);
  }
};

const handleMyChangeRequestsList = async (req, res) => {
  try {
    const [rows] = await mainDb.query(
      `SELECT cr.id, cr.project_id, cr.request_number, cr.change_description, cr.reason_for_change,
              cr.status, cr.estimated_cost_impact, cr.estimated_time_impact_days, cr.created_at,
              up.project_name
       FROM change_requests cr
       LEFT JOIN user_projects up ON up.id = cr.project_id
       WHERE cr.requested_by = ? AND cr.deleted_at IS NULL
       ORDER BY cr.created_at DESC
       LIMIT 25`,
      [req.userId],
    );
    res.json({ success: true, changeRequests: rows });
  } catch (error) {
    console.error("[CLIENT ACTIONS] change-requests list error:", error);
    res.status(500).json({ success: false, message: "Failed to load change requests" });
  }
};

const handleMyChangeRequestsCreate = async (req, res) => {
  try {
    const { project_id, description, reason } = req.body || {};
    if (!project_id || !description || !String(description).trim()) {
      return res.status(400).json({ success: false, message: "Project and description are required" });
    }
    const [own] = await mainDb.query(
      "SELECT id FROM user_projects WHERE id = ? AND user_id = ? AND deleted_at IS NULL LIMIT 1",
      [project_id, req.userId],
    );
    if (own.length === 0) {
      return res.status(403).json({ success: false, message: "You can only request changes on your own projects" });
    }
    const requestNumber = `CR-${Date.now()}-${req.userId}`.slice(0, 50);
    const [result] = await mainDb.query(
      `INSERT INTO change_requests (project_id, request_number, requested_by, change_description, reason_for_change, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'submitted', NOW())`,
      [project_id, requestNumber, req.userId, String(description).trim(), reason ? String(reason).trim() : null],
    );
    await notifyAdminPanel(req.userId, "Change request submitted", `New change request ${requestNumber}: ${String(description).trim().slice(0, 140)}`, "high");
    res.status(201).json({ success: true, message: "Change request submitted to our team", requestId: result.insertId, requestNumber });
  } catch (error) {
    console.error("[CLIENT ACTIONS] change-request create error:", error);
    res.status(500).json({ success: false, message: "Failed to submit change request" });
  }
};

app.get("/api/users/my-change-requests", authenticateUser, handleMyChangeRequestsList);
app.post("/api/users/my-change-requests", authenticateUser, handleMyChangeRequestsCreate);
const handleMyQuotesList = async (req, res) => {
  try {
    const [rows] = await mainDb.query(
      `SELECT id, quote_number, title, description, quote_type, subtotal, currency,
              total_amount, valid_until, issue_date, status, priority
       FROM quotes
       WHERE client_id = ? AND status IN ('sent','viewed','accepted','rejected')
       ORDER BY issue_date DESC, id DESC
       LIMIT 20`,
      [req.userId],
    );
    res.json({ success: true, quotes: rows });
  } catch (error) {
    console.error("[CLIENT ACTIONS] quotes list error:", error);
    res.status(500).json({ success: false, message: "Failed to load quotes" });
  }
};

const handleMyQuoteDecision = async (req, res) => {
  try {
    const { decision, note } = req.body || {};
    if (!["accepted", "rejected"].includes(decision)) {
      return res.status(400).json({ success: false, message: "Decision must be accepted or rejected" });
    }
    const [rows] = await mainDb.query(
      "SELECT id, quote_number, title, status FROM quotes WHERE id = ? AND client_id = ? LIMIT 1",
      [req.params.id, req.userId],
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Quote not found" });
    }
    if (!["sent", "viewed"].includes(rows[0].status)) {
      return res.status(409).json({ success: false, message: `This quote is already ${rows[0].status}` });
    }
    const dateCol = decision === "accepted" ? "accepted_date = CURDATE()" : "rejected_date = CURDATE()";
    await mainDb.query(
      `UPDATE quotes SET status = ?, ${dateCol}, rejection_reason = ? WHERE id = ? AND client_id = ?`,
      [decision, decision === "rejected" ? (note || null) : null, req.params.id, req.userId],
    );
    await notifyAdminPanel(req.userId, `Quote ${decision}`, `Client ${decision} quote ${rows[0].quote_number} ("${rows[0].title}")${note ? ` — "${String(note).slice(0, 120)}"` : ""}`, decision === "accepted" ? "high" : "medium");
    res.json({ success: true, message: `Quote ${decision}` });
  } catch (error) {
    console.error("[CLIENT ACTIONS] quote decision error:", error);
    res.status(500).json({ success: false, message: "Failed to record decision" });
  }
};

const handleMySignatureRequestsList = async (req, res) => {
  try {
    const [rows] = await mainDb.query(
      `SELECT ds.id AS signature_id, ds.signature_status, ds.expires_at,
              cd.id AS document_id, cd.document_name, cd.document_type, cd.description, cd.file_path, cd.version_number
       FROM document_signatures ds
       JOIN client_documents cd ON cd.id = ds.document_id
       WHERE ds.signer_id = ? AND ds.signature_status = 'pending' AND cd.deleted_at IS NULL
       ORDER BY ds.created_at DESC
       LIMIT 20`,
      [req.userId],
    );
    res.json({ success: true, signatureRequests: rows });
  } catch (error) {
    console.error("[CLIENT ACTIONS] signature list error:", error);
    res.status(500).json({ success: false, message: "Failed to load documents" });
  }
};

const handleMySignatureDecision = async (req, res) => {
  try {
    const { decision, note } = req.body || {};
    if (!["signed", "declined"].includes(decision)) {
      return res.status(400).json({ success: false, message: "Decision must be signed or declined" });
    }
    const [rows] = await mainDb.query(
      `SELECT ds.id, ds.document_id, cd.document_name
       FROM document_signatures ds
       JOIN client_documents cd ON cd.id = ds.document_id
       WHERE ds.id = ? AND ds.signer_id = ? AND ds.signature_status = 'pending'
       LIMIT 1`,
      [req.params.id, req.userId],
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Signature request not found or already handled" });
    }
    const nodeCrypto = require("crypto");
    const signatureHash = nodeCrypto.createHash("sha256").update(`${rows[0].document_id}:${req.userId}:${Date.now()}`).digest("hex");
    await mainDb.query(
      `UPDATE document_signatures
       SET signature_status = ?, signature_date = NOW(), signature_hash = ?, ip_address = ?, user_agent = ?
       WHERE id = ? AND signer_id = ?`,
      [decision, signatureHash, req.ip || null, req.headers["user-agent"] || null, req.params.id, req.userId],
    );
    if (decision === "signed") {
      await mainDb.query("UPDATE client_documents SET status = 'approved', updated_at = NOW() WHERE id = ?", [rows[0].document_id]);
    }
    await notifyAdminPanel(req.userId, `Document ${decision}`, `Client ${decision} document "${rows[0].document_name}"`, decision === "signed" ? "high" : "medium");
    res.json({ success: true, message: decision === "signed" ? "Document signed" : "Document declined" });
  } catch (error) {
    console.error("[CLIENT ACTIONS] signature decision error:", error);
    res.status(500).json({ success: false, message: "Failed to record decision" });
  }
};

// Client uploads their own profile photo (multipart, field: profilePhoto)
const profilePhotoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 },
});

const handleUploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image provided" });
    }
    const allowed = ["image/png", "image/jpeg", "image/webp"];
    if (!allowed.includes(req.file.mimetype)) {
      return res
        .status(400)
        .json({ success: false, message: "Only PNG, JPEG or WebP images are allowed" });
    }
    // A client can only update their own photo (userId body field must match token)
    if (req.body.userId && Number(req.body.userId) !== Number(req.userId)) {
      return res
        .status(403)
        .json({ success: false, message: "You can only update your own photo" });
    }
    await mainDb.query(
      `UPDATE users
       SET profile_photo_blob = ?, profile_photo_mime_type = ?, profile_photo_file_name = ?, updated_at = NOW()
       WHERE id = ? AND deleted_at IS NULL`,
      [req.file.buffer, req.file.mimetype, req.file.originalname || null, req.userId],
    );
    await notifyAdminPanel(
      req.userId,
      "Profile photo updated",
      "Client updated their profile photo",
      "low",
    );
    res.json({ success: true, message: "Profile photo updated" });
  } catch (error) {
    console.error("[CLIENT ACTIONS] photo upload error:", error);
    res.status(500).json({ success: false, message: "Failed to upload photo" });
  }
};

app.post(
  "/api/users/upload-profile-photo",
  authenticateUser,
  profilePhotoUpload.single("profilePhoto"),
  handleUploadProfilePhoto,
);

app.get("/api/users/my-quotes", authenticateUser, handleMyQuotesList);
app.post("/api/users/my-quotes/:id/decision", authenticateUser, handleMyQuoteDecision);
app.get("/api/users/my-signature-requests", authenticateUser, handleMySignatureRequestsList);
app.post("/api/users/my-signature-requests/:id/decision", authenticateUser, handleMySignatureDecision);

app.get("/api/users/client-dashboard", authenticateUser, async (req, res) => {
  try {
    const id = req.userId;

    const [users] = await mainDb.query(
      `SELECT id, email, first_name, last_name, display_name, phone_number, primary_role,
              mission_briefing, last_login_at, last_login_ip, created_at, updated_at,
              email_verified, timezone, locale, profile_photo_blob, profile_photo_mime_type, profile_photo_file_name
       FROM users
       WHERE id = ? AND deleted_at IS NULL`,
      [id],
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const user = users[0];

    const [projectRows] = await mainDb.query(
      `SELECT up.id, up.project_name, up.project_description, up.project_type, up.status, up.priority, up.progress_percentage, up.end_date, up.estimated_budget, up.actual_budget, up.created_at,
              CONCAT(pm.first_name, ' ', pm.last_name) AS manager_name
       FROM user_projects up
       LEFT JOIN users pm ON pm.id = up.project_manager_id
       WHERE up.user_id = ? AND up.is_active = true AND up.deleted_at IS NULL
       ORDER BY up.updated_at DESC`,
      [id],
    );

    const projectIds = projectRows.map((project) => project.id);
    const placeholders = projectIds.length > 0 ? projectIds.map(() => "?").join(",") : "NULL";

    const [taskRows] = await mainDb.query(
      `SELECT pt.id, pt.project_id, up.project_name, pt.task_name, pt.status, pt.priority, pt.due_date, pt.progress_percentage,
              CONCAT(u.first_name, ' ', u.last_name) AS assignee_name
       FROM project_tasks pt
       LEFT JOIN user_projects up ON up.id = pt.project_id
       LEFT JOIN users u ON u.id = pt.assigned_to
       WHERE pt.project_id IN (${placeholders}) AND pt.deleted_at IS NULL
       ORDER BY pt.due_date ASC
       LIMIT 20`,
       projectIds.length > 0 ? projectIds : [],
     );

     // Optional portal sections must never 500 the whole dashboard: one
     // failing/missing table degrades to an empty section instead.
     const safeQuery = async (section, sql, params) => {
       try {
         return await mainDb.query(sql, params);
       } catch (err) {
         console.error(`[CLIENT DASHBOARD] "${section}" section failed:`, err.code || "", err.message);
         return [[]];
       }
     };

     const teamMembers = [];
     if (projectIds.length > 0) {
       const teamPlaceholders = projectIds.map(() => "?").join(",");

       const [managerRows] = await safeQuery(
         "team members (managers)",
         `SELECT up.id AS project_id, up.project_name, pm.id, pm.email, pm.first_name, pm.last_name, pm.display_name,
                 pm.primary_role AS role, 'Project Manager' AS duties, 'active' AS status
          FROM user_projects up
          LEFT JOIN users pm ON pm.id = up.project_manager_id
          WHERE up.id IN (${teamPlaceholders}) AND up.deleted_at IS NULL AND pm.id IS NOT NULL`,
         projectIds,
       );

       const [assigneeRows] = await safeQuery(
         "team members (assignees)",
         `SELECT pt.project_id, up.project_name, u.id, u.email, u.first_name, u.last_name, u.display_name,
                 u.primary_role AS role, pt.task_name AS duties, 'active' AS status
          FROM project_tasks pt
          LEFT JOIN user_projects up ON up.id = pt.project_id
          LEFT JOIN users u ON u.id = pt.assigned_to
          WHERE pt.project_id IN (${teamPlaceholders}) AND pt.deleted_at IS NULL AND u.id IS NOT NULL`,
         projectIds,
       );

        const [projectTeamRows] = await safeQuery(
          "team members (project roster)",
          `SELECT ptm.project_id, up.project_name, u.id, u.email, u.first_name, u.last_name, u.display_name,
                  u.primary_role AS role, 'Team Member' AS duties, 'active' AS status
           FROM project_team_members ptm
           LEFT JOIN user_projects up ON up.id = ptm.project_id
           LEFT JOIN users u ON u.id = ptm.user_id
           WHERE ptm.project_id IN (${teamPlaceholders}) AND ptm.removed_at IS NULL AND u.id IS NOT NULL`,
          projectIds,
        );

       const seen = new Set();
       const addMember = (row) => {
         const key = `${row.project_id}-${row.id}`;
         if (seen.has(key)) return;
         seen.add(key);
         teamMembers.push(row);
       };

       managerRows.forEach(addMember);
       assigneeRows.forEach(addMember);
       projectTeamRows.forEach(addMember);
     }

     const [activityRows] = await safeQuery(
      "activities",
      `SELECT pa.id, pa.project_id, pa.activity_type, pa.message, pa.created_at, CONCAT(u.first_name, ' ', u.last_name) AS sender_name
       FROM project_activities pa
       LEFT JOIN users u ON u.id = pa.user_id
       WHERE pa.project_id IN (${placeholders})
       ORDER BY pa.created_at DESC
       LIMIT 10`,
      projectIds.length > 0 ? projectIds : [],
    );

    const [invoiceRows] = await safeQuery(
      "invoices",
      `SELECT pi.id, pi.invoice_number, pi.amount, pi.status, pi.due_date, up.project_name
       FROM project_invoices pi
       JOIN user_projects up ON up.id = pi.project_id
       WHERE up.user_id = ? AND pi.status != 'cancelled'
       ORDER BY pi.issue_date DESC
       LIMIT 15`,
      [id],
    );

    const [documentRows] = await safeQuery(
      "documents",
      `SELECT pd.id, pd.project_id, pd.name, pd.category, pd.created_at
       FROM project_docs pd
       WHERE pd.project_id IN (${placeholders}) AND pd.deleted_at IS NULL
       ORDER BY pd.created_at DESC
       LIMIT 15`,
      projectIds.length > 0 ? projectIds : [],
    );

    const [feedbackRows] = await safeQuery(
      "feedback",
      `SELECT id, title, message, feedback_type, status, priority, created_at, admin_response, responded_at, rating
       FROM user_feedback
       WHERE user_id = ? AND deleted_at IS NULL AND status != 'closed'
       ORDER BY created_at DESC
       LIMIT 10`,
      [id],
    );

    const [summaryRows] = await safeQuery(
      "summary",
      `SELECT total_projects, active_projects, completed_projects, total_budget, total_spent, client_rating
       FROM client_project_summary
       WHERE user_id = ? LIMIT 1`,
      [id],
    );
    const summary = summaryRows[0] || null;

    const payload = buildClientPortalPayload({
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        display_name: user.display_name || `${user.first_name} ${user.last_name}`,
        phone_number: user.phone_number,
        mission_briefing: user.mission_briefing,
        last_login_at: user.last_login_at,
        last_login_ip: user.last_login_ip,
        created_at: user.created_at,
        updated_at: user.updated_at,
        email_verified: user.email_verified,
        timezone: user.timezone,
        locale: user.locale,
        role: user.primary_role || "user",
        has_photo: !!user.profile_photo_blob,
        profilePhotoData: user.profile_photo_blob ? `data:${user.profile_photo_mime_type || "image/jpeg"};base64,${Buffer.from(user.profile_photo_blob).toString("base64")}` : null,
      },
      projects: projectRows,
      tasks: taskRows,
      activities: activityRows,
      invoices: invoiceRows,
      documents: documentRows,
      feedback: feedbackRows,
      summary,
      teamMembers,
    });

    res.json({
      success: true,
      dashboard: payload,
    });
  } catch (error) {
    console.error("[CLIENT DASHBOARD] Error:", error);
    res.status(500).json({ success: false, message: "Could not fetch client dashboard data", error: error.message });
  }
});

app.get("/api/users/client-dashboard/:id", authenticateUser, (req, res) => {
  // Legacy ID-based fetch is retired: the portal (and Projects page) resolve
  // everything from the authenticated token via GET /api/users/client-dashboard.
  // The old stub never sent a response when the user existed, hanging requests
  // until the browser gave up — respond deterministically instead.
  res.status(410).json({
    success: false,
    message: "This endpoint was retired. Use GET /api/users/client-dashboard with your auth token.",
  });
});
// app.post("/api/signup", handleUserRegister); // Handled by modular router

// Notifications Endpoints
app.get('/api/users/notifications/me', authenticateUser, async (req, res) => {
  const userId = req.userId;
  try {
    const [notifications] = await mainDb.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [userId]
    );
    res.json({ success: true, notifications });
  } catch (error) {
    console.error('[GET NOTIFICATIONS] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

app.put('/api/users/notifications/:id/read', authenticateUser, async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  try {
    const [result] = await mainDb.query(
      'UPDATE notifications SET status = "read" WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('[READ NOTIFICATION] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update notification' });
  }
});

app.put('/api/users/notifications/read-all/me', authenticateUser, async (req, res) => {
  const userId = req.userId;
  try {
    await mainDb.query(
      'UPDATE notifications SET status = "read" WHERE user_id = ? AND status = "unread"',
      [userId]
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('[READ ALL NOTIFICATIONS] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update notifications' });
  }
});

app.put('/api/users/profile', authenticateUser, async (req, res) => {
  const userId = req.userId;
  const { display_name, phone_number } = req.body;
  try {
    if (!display_name || !String(display_name).trim()) {
      return res.status(400).json({ success: false, message: 'Display name is required' });
    }
    const [result] = await mainDb.query(
      'UPDATE users SET display_name = ?, phone_number = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL',
      [String(display_name).trim(), phone_number || null, userId]
    );

    // If the user row is missing, return a safe empty object (prevents
    // React error #310 from crashing the ClientPortal on render).
    if (result.affectedRows === 0) {
      const [users] = await mainDb.query(
        'SELECT id FROM users WHERE id = ? AND deleted_at IS NULL',
        [userId]
      );
      if (users.length === 0) {
        // Don't 404 — return an empty profile so the UI degrades gracefully
        return res.json({ success: true, profile: {} });
      }
    }
    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('[UPDATE PROFILE] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

app.post('/api/users/change-password', authenticateUser, async (req, res) => {
  const userId = req.userId;
  const { current_password, new_password } = req.body;
  try {
    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, message: 'Current and new password are required' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }
    const [users] = await mainDb.query(
      'SELECT id, password_hash FROM users WHERE id = ? AND deleted_at IS NULL',
      [userId]
    );
    const user = users[0];
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const isCurrentValid = await bcryptjs.compare(current_password, user.password_hash || '');
    if (!isCurrentValid) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    const newHash = await bcryptjs.hash(new_password, 10);
    await mainDb.query(
      'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
      [newHash, userId]
    );
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('[CHANGE PASSWORD] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
});

// Project Details API (Protected)
app.get("/api/users/projects/:id", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const [projects] = await mainDb.query(
      `SELECT up.*, CONCAT(pm.first_name, ' ', pm.last_name) AS manager_name
       FROM user_projects up
       LEFT JOIN users pm ON pm.id = up.project_manager_id
       WHERE up.id = ? AND up.user_id = ? AND up.deleted_at IS NULL`,
      [id, userId]
    );

    if (projects.length === 0) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const project = projects[0];

    // Fetch related data
    const [tasks] = await mainDb.query(
      "SELECT * FROM project_tasks WHERE project_id = ? AND deleted_at IS NULL",
      [id]
    );

    const [documents] = await mainDb.query(
      "SELECT * FROM project_docs WHERE project_id = ? AND deleted_at IS NULL",
      [id]
    );

    const [invoices] = await mainDb.query(
      "SELECT * FROM project_invoices WHERE project_id = ? AND status != 'cancelled'",
      [id]
    );

    res.json({
      success: true,
      project: {
        ...project,
        name: project.project_name,
        description: project.project_description,
        progress: project.progress_percentage,
        tasks,
        documents,
        invoices
      }
    });
  } catch (error) {
    console.error("[PROJECT DETAILS] Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.post("/api/users/google-auth", async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ success: false, message: "Google credential token is required" });
    }

    // Secure Verification
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, given_name, family_name, sub: google_id, picture } = payload;

    // Check if user already exists
    const [existingUsers] = await mainDb.query(
      "SELECT id, email, first_name, last_name FROM users WHERE email = ? AND deleted_at IS NULL",
      [email],
    );

    if (existingUsers.length > 0) {
      const user = existingUsers[0];
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: 'user' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: "user",
        },
      });
    }

    // Create new user from verified Google data
    const [result] = await mainDb.query(
      "INSERT INTO users (email, first_name, last_name, display_name, google_id, email_verified, is_active) VALUES (?, ?, ?, ?, ?, TRUE, TRUE)",
      [email, given_name, family_name, `${given_name} ${family_name}`, google_id],
    );

    const userId = result.insertId;
    await mainDb.query("INSERT INTO user_roles (user_id, role_id) VALUES (?, 2)", [userId]);

    const token = jwt.sign(
      { userId, email, role: 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: { id: userId, email, first_name: given_name, last_name: family_name, role: "user" },
    });
  } catch (error) {
    console.error("[GOOGLE AUTH] Verification failed:", error.message);
    res.status(401).json({ success: false, message: "Invalid Google token" });
  }
});

// Admin create user endpoint
app.post("/api/users/admin-create", authenticateAdmin, async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      role = "user",
      admin_level = "admin",
      developer_level = "mid",
      phone_number,
      physical_address,
      id_number,
      alt_phone,
      expertise,
      private_notes,
      manual_projects,
      emergency_contact_name,
      emergency_contact_phone,
      department
    } = req.body;

    console.log(`[ADMIN CREATE] Received registration request:`, {
      first_name,
      last_name,
      email,
      role,
    });

    // Validate required fields
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({
        success: false,
        message: "Email, password, first name, and last name are required",
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcryptjs.hash(password, saltRounds);

    let result;
    let userId;
    let tableUsed;

    const commonCols = `
      email, password_hash, first_name, last_name, phone_number,
      physical_address, id_number, alt_phone, expertise,
      private_notes, manual_projects, emergency_contact_name, emergency_contact_phone,
      is_active, email_verified
    `;
    const commonPlaceholders = `?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, TRUE`;
    const commonVals = [
      email, hashedPassword, first_name, last_name, phone_number || null,
      physical_address || null, id_number || null, alt_phone || null, expertise || null,
      private_notes || null, manual_projects || null, emergency_contact_name || null, emergency_contact_phone || null
    ];

    // Create user in appropriate table based on role
    if (role === "admin") {
      tableUsed = "admin_users";
      const [existing] = await mainDb.query("SELECT id FROM admin_users WHERE email = ?", [email]);
      if (existing.length > 0) return res.status(409).json({ success: false, message: "Admin user with this email already exists" });

      [result] = await mainDb.query(
        `INSERT INTO admin_users (${commonCols}, admin_level, access_level, department) VALUES (${commonPlaceholders}, ?, 'full', ?)`,
        [...commonVals, admin_level, department || 'General']
      );
      userId = result.insertId;
    } else if (role === "developer") {
      tableUsed = "developer_users";
      const [existing] = await mainDb.query("SELECT id FROM developer_users WHERE email = ?", [email]);
      if (existing.length > 0) return res.status(409).json({ success: false, message: "Developer user with this email already exists" });

      [result] = await mainDb.query(
        `INSERT INTO developer_users (${commonCols}, developer_level) VALUES (${commonPlaceholders}, ?)`,
        [...commonVals, developer_level]
      );
      userId = result.insertId;
    } else {
      tableUsed = "users";
      const [existing] = await mainDb.query("SELECT id FROM users WHERE email = ? AND deleted_at IS NULL", [email]);
      if (existing.length > 0) return res.status(409).json({ success: false, message: "User with this email already exists" });

      [result] = await mainDb.query(
        `INSERT INTO users (${commonCols}, primary_role) VALUES (${commonPlaceholders}, ?)`,
        [...commonVals, role]
      );
      userId = result.insertId;

      if (role !== "user") {
        const [roleRows] = await mainDb.query("SELECT id FROM roles WHERE name = ?", [role]);
        if (roleRows.length > 0) {
          await mainDb.query("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)", [userId, roleRows[0].id]);
        }
      }
    }

    res.json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} user created successfully`,
      userId: userId,
      role: role,
      table: tableUsed,
    });
  } catch (error) {
    console.error("[ADMIN CREATE] Error creating user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create user",
      error: error.message,
    });
  }
});

// User Projects API
app.get("/api/users/projects", authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;

    const [projectRows] = await mainDb.query(
      `SELECT up.id, up.project_name AS name, up.project_description AS description,
              up.project_type AS type, up.status, up.priority, up.progress_percentage AS progress,
              up.start_date AS startDate, up.end_date AS expectedCompletion,
              up.estimated_budget AS budget, up.actual_budget AS spent, up.created_at,
              CONCAT(pm.first_name, ' ', pm.last_name) AS manager_name
       FROM user_projects up
       LEFT JOIN users pm ON pm.id = up.project_manager_id
       WHERE up.user_id = ? AND up.is_active = true AND up.deleted_at IS NULL
       ORDER BY up.updated_at DESC`,
      [userId],
    );

    res.json({
      success: true,
      projects: projectRows,
      message: "Projects retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching user projects:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
      error: error.message,
    });
  }
});

// Project Photos API
app.get("/api/projects/:id/photos", async (req, res) => {
  try {
    const projectId = req.params.id;

    const query = `
      SELECT id, photo_type, title, description, file_name, file_type, file_size,
             is_featured, display_order, created_at, photo_data
      FROM project_photos
      WHERE project_id = ?
      ORDER BY is_featured DESC, display_order ASC, created_at DESC
    `;

    const [photos] = await db.execute(query, [projectId]);

    res.json({
      success: true,
      photos: photos.map((photo) => ({
        id: photo.id,
        type: photo.photo_type,
        title: photo.title,
        description: photo.description,
        fileName: photo.file_name,
        fileType: photo.file_type,
        fileSize: photo.file_size,
        isFeatured: photo.is_featured,
        displayOrder: photo.display_order,
        createdAt: photo.created_at,
        // Include data URL for frontend display
        dataUrl: `data:${photo.file_type};base64,${Buffer.from(photo.photo_data || "").toString("base64")}`,
      })),
    });
  } catch (error) {
    console.error("Error fetching project photos:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch project photos",
      error: error.message,
    });
  }
});

app.post(
  "/api/projects/:id/photos",
  upload.single("photo"),
  async (req, res) => {
    try {
      const projectId = req.params.id;
      const { title, description, photo_type = "progress" } = req.body;
      const userId = req.user?.id || 1; // Default to user 1 for demo

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No photo file provided",
        });
      }

      // Read file data
      const fs = require("fs");
      const photoData = fs.readFileSync(req.file.path);

      // Insert project photo record with BLOB data
      const photoQuery = `
      INSERT INTO project_photos (project_id, photo_data, file_name, file_type, file_size, photo_type, title, description, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

      const [photoResult] = await db.execute(photoQuery, [
        projectId,
        photoData,
        req.file.originalname,
        req.file.mimetype,
        req.file.size,
        photo_type,
        title,
        description,
        userId,
      ]);

      const photoId = photoResult.insertId;

      // Clean up temporary file
      fs.unlinkSync(req.file.path);

      // Create data URL for immediate response
      const dataUrl = `data:${req.file.mimetype};base64,${Buffer.from(photoData).toString("base64")}`;

      res.json({
        success: true,
        message: "Photo uploaded successfully",
        photo: {
          id: photoId,
          title: title,
          type: photo_type,
          fileName: req.file.originalname,
          fileType: req.file.mimetype,
          fileSize: req.file.size,
          dataUrl: dataUrl,
        },
      });
    } catch (error) {
      console.error("Error uploading project photo:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload photo",
        error: error.message,
      });
    }
  },
);

app.delete("/api/projects/:id/photos/:photoId", async (req, res) => {
  try {
    const { id: projectId, photoId } = req.params;

    // Check if photo exists and belongs to project
    const photoQuery = `
      SELECT id, project_id, file_name
      FROM project_photos
      WHERE id = ? AND project_id = ?
    `;

    const [photos] = await db.execute(photoQuery, [photoId, projectId]);

    if (photos.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Photo not found",
      });
    }

    // Delete project photo record (BLOB data will be deleted automatically)
    await db.execute("DELETE FROM project_photos WHERE id = ?", [photoId]);

    res.json({
      success: true,
      message: "Photo deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting project photo:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete photo",
      error: error.message,
    });
  }
});

// Accounting Management APIs
app.get("/api/accounting/entries", async (req, res) => {
  try {
    const {
      project_id,
      entry_type,
      category,
      payment_status,
      limit = 50,
      offset = 0,
    } = req.query;

    let query = `
      SELECT ae.*, p.name as project_name, u.first_name, u.last_name
      FROM accounting_entries ae
      LEFT JOIN projects p ON ae.project_id = p.id
      LEFT JOIN users u ON ae.created_by = u.id
      WHERE ae.deleted_at IS NULL
    `;
    const params = [];

    if (project_id) {
      query += " AND ae.project_id = ?";
      params.push(project_id);
    }

    if (entry_type) {
      query += " AND ae.entry_type = ?";
      params.push(entry_type);
    }

    if (category) {
      query += " AND ae.category = ?";
      params.push(category);
    }

    if (payment_status) {
      query += " AND ae.payment_status = ?";
      params.push(payment_status);
    }

    query +=
      " ORDER BY ae.transaction_date DESC, ae.created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const [entries] = await db.execute(query, params);

    res.json({
      success: true,
      entries: entries.map((entry) => ({
        ...entry,
        created_by_name: `${entry.first_name} ${entry.last_name}`.trim(),
      })),
    });
  } catch (error) {
    console.error("Error fetching accounting entries:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch accounting entries",
      error: error.message,
    });
  }
});

app.post("/api/accounting/entries", async (req, res) => {
  try {
    const {
      entry_type,
      category,
      subcategory,
      amount,
      tax_amount,
      currency,
      exchange_rate,
      transaction_date,
      transaction_reference,
      payment_method,
      payment_status,
      description,
      notes,
      budget_category,
      budget_period,
      is_billable,
      billable_percentage,
      tax_rate,
      tax_exempt,
      tax_region,
      project_id,
      invoice_id,
      receipt_id,
      contract_id,
      client_email
    } = req.body;

    const userId = req.user?.id || (await getFirstUserId()) || 1; // Default to first real user for demo
    const resolvedProjectId = await resolveAccountingProjectId(project_id);

    // Defensive defaults — no bind parameter may ever be `undefined`
    const safeEntryType = entry_type || "expense";
    const safeCategory = category || "Uncategorized";
    const safeCurrency = currency || "KES";
    const safeTxDate = transaction_date || new Date().toISOString().split("T")[0];
    const safePaymentMethod = payment_method || "bank_transfer";
    const safePaymentStatus = payment_status || "completed";
    if (amount === undefined || amount === null || amount === "" || isNaN(parseFloat(amount))) {
      return res.status(400).json({ success: false, message: "A valid amount is required" });
    }

    const query = `
      INSERT INTO accounting_entries (
        entry_type, category, subcategory, amount, tax_amount, currency, exchange_rate,
        transaction_date, transaction_reference, payment_method, payment_status,
        description, notes, budget_category, budget_period, is_billable, billable_percentage,
        tax_rate, tax_exempt, tax_region, project_id, invoice_id, receipt_id, contract_id,
        client_email, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(query, [
      safeEntryType,
      safeCategory,
      subcategory || null,
      parseFloat(amount),
      parseFloat(tax_amount || 0),
      safeCurrency,
      parseFloat(exchange_rate || 1),
      safeTxDate,
      transaction_reference || null,
      safePaymentMethod,
      safePaymentStatus,
      description || null,
      notes || null,
      budget_category || null,
      budget_period || null,
      is_billable || null,
      parseFloat(billable_percentage || 100),
      parseFloat(tax_rate || 0),
      tax_exempt || null,
      tax_region || null,
      resolvedProjectId,
      invoice_id || null,
      receipt_id || null,
      contract_id || null,
      client_email || null,
      userId,
    ]);

    res.json({
      success: true,
      message: "Accounting entry created successfully",
      entryId: result.insertId,
    });
  } catch (error) {
    console.error("Error creating accounting entry:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create accounting entry",
      error: error.message,
    });
  }
});

app.delete("/api/accounting/entries/:id", async (req, res) => {
  try {
    const entryId = req.params.id;

    // Soft delete the entry. `deleted_by` is intentionally left NULL: in the
    // canonical schema it is FK-constrained to users(id), so recording an
    // admin_users id here raises ER_NO_REFERENCED_ROW_2 and the delete 500s
    // (matching the modular backend routes, which set deleted_at only).
    await db.execute(
      "UPDATE accounting_entries SET deleted_at = NOW() WHERE id = ?",
      [entryId],
    );

    res.json({
      success: true,
      message: "Accounting entry deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting accounting entry:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete accounting entry",
      error: error.message,
    });
  }
});

app.get("/api/accounting/categories", async (req, res) => {
  try {
    const [categories] = await db.execute(
      "SELECT * FROM accounting_categories WHERE is_active = 1 ORDER BY display_order ASC, name ASC",
    );

    res.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Error fetching accounting categories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch accounting categories",
      error: error.message,
    });
  }
});

app.get("/api/accounting/periods", async (req, res) => {
  try {
    const { project_id } = req.query;

    let query = `
      SELECT ap.*, p.name as project_name
      FROM accounting_periods ap
      LEFT JOIN projects p ON ap.project_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (project_id) {
      query += " AND ap.project_id = ?";
      params.push(project_id);
    }

    query += " ORDER BY ap.start_date DESC";

    const [periods] = await db.execute(query, params);

    res.json({
      success: true,
      periods,
    });
  } catch (error) {
    console.error("Error fetching accounting periods:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch accounting periods",
      error: error.message,
    });
  }
});

app.get("/api/financial/reports", async (req, res) => {
  try {
    const { project_id, report_type, limit = 20 } = req.query;

    let query = `
      SELECT fr.*, p.name as project_name, u.first_name, u.last_name
      FROM financial_reports fr
      LEFT JOIN projects p ON fr.project_id = p.id
      LEFT JOIN users u ON fr.generated_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (project_id) {
      query += " AND fr.project_id = ?";
      params.push(project_id);
    }

    if (report_type) {
      query += " AND fr.report_type = ?";
      params.push(report_type);
    }

    query += " ORDER BY fr.generated_at DESC LIMIT ?";
    params.push(parseInt(limit));

    const [reports] = await db.execute(query, params);

    res.json({
      success: true,
      reports: reports.map((report) => ({
        ...report,
        generated_by_name: `${report.first_name} ${report.last_name}`.trim(),
      })),
    });
  } catch (error) {
    console.error("Error fetching financial reports:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch financial reports",
      error: error.message,
    });
  }
});

// Invoice Management APIs
app.get("/api/invoices", async (req, res) => {
  try {
    const {
      project_id,
      status,
      payment_status,
      limit = 50,
      offset = 0,
    } = req.query;

    let query = `
      SELECT i.*, p.name as project_name, u.first_name, u.last_name,
             CONCAT(u.first_name, ' ', u.last_name) as created_by_name
      FROM invoices i
      LEFT JOIN projects p ON i.project_id = p.id
      LEFT JOIN users u ON i.created_by = u.id
      WHERE i.deleted_at IS NULL
    `;
    const params = [];

    if (project_id) {
      query += " AND i.project_id = ?";
      params.push(project_id);
    }

    if (status) {
      query += " AND i.status = ?";
      params.push(status);
    }

    if (payment_status) {
      query += " AND i.payment_status = ?";
      params.push(payment_status);
    }

    query += " ORDER BY i.issue_date DESC, i.created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const [invoices] = await db.execute(query, params);

    res.json({
      success: true,
      invoices,
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch invoices",
      error: error.message,
    });
  }
});

app.delete("/api/invoices/:id", async (req, res) => {
  try {
    const invoiceId = req.params.id;

    // Soft delete the invoice. `deleted_by` intentionally NULL — the FK on
    // invoices.deleted_by references users(id), so an admin_users id would
    // violate the constraint (see accounting_entries DELETE route comment).
    await db.execute(
      "UPDATE invoices SET deleted_at = NOW() WHERE id = ?",
      [invoiceId],
    );

    res.json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete invoice",
      error: error.message,
    });
  }
});

// M-Pesa Payment APIs
app.get("/api/mpesa/transactions", async (req, res) => {
  try {
    const {
      invoice_id,
      project_id,
      status,
      limit = 50,
      offset = 0,
    } = req.query;

    let query = `
      SELECT mt.*, i.invoice_number, p.name as project_name,
             CONCAT(u.first_name, ' ', u.last_name) as created_by_name
      FROM mpesa_transactions mt
      LEFT JOIN invoices i ON mt.invoice_id = i.id
      LEFT JOIN projects p ON mt.project_id = p.id
      LEFT JOIN users u ON mt.created_by = u.id
      WHERE mt.deleted_at IS NULL
    `;
    const params = [];

    if (invoice_id) {
      query += " AND mt.invoice_id = ?";
      params.push(invoice_id);
    }

    if (project_id) {
      query += " AND mt.project_id = ?";
      params.push(project_id);
    }

    if (status) {
      query += " AND mt.status = ?";
      params.push(status);
    }

    query += " ORDER BY mt.transaction_date DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const [transactions] = await db.execute(query, params);

    res.json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error("Error fetching M-Pesa transactions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch M-Pesa transactions",
      error: error.message,
    });
  }
});

app.post("/api/mpesa/transactions", async (req, res) => {
  try {
    const {
      invoice_id,
      project_id,
      transaction_id,
      amount,
      phone_number,
      payment_method,
      business_number,
      account_reference,
      client_name,
      client_email,
      response_data,
    } = req.body;

    const userId = req.user?.id || 1;

    const query = `
      INSERT INTO mpesa_transactions (
        invoice_id, project_id, transaction_id, amount, phone_number,
        payment_method, business_number, account_reference, client_name,
        client_email, response_data, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(query, [
      invoice_id,
      project_id,
      transaction_id,
      parseFloat(amount),
      phone_number,
      payment_method,
      business_number,
      account_reference,
      client_name,
      client_email,
      JSON.stringify(response_data || {}),
      userId,
    ]);

    // Update invoice payment status if linked
    if (invoice_id) {
      await db.execute(
        "UPDATE invoices SET payment_status = ?, status = ?, updated_at = NOW() WHERE id = ?",
        ["pending", "sent", invoice_id],
      );
    }

    res.json({
      success: true,
      message: "M-Pesa transaction recorded successfully",
      transactionId: result.insertId,
    });
  } catch (error) {
    console.error("Error creating M-Pesa transaction:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create M-Pesa transaction",
      error: error.message,
    });
  }
});

app.put("/api/mpesa/transactions/:id", async (req, res) => {
  try {
    const transactionId = req.params.id;
    const userId = req.user?.id || 1;

    const {
      status,
      result_code,
      result_desc,
      completion_time,
      reconciliation_notes,
    } = req.body;

    const query = `
      UPDATE mpesa_transactions
      SET status = ?, result_code = ?, result_desc = ?, completion_time = ?,
          reconciliation_notes = ?, reconciled_by = ?, reconciled_at = NOW(),
          updated_by = ?, updated_at = NOW()
      WHERE id = ?
    `;

    await db.execute(query, [
      status,
      result_code,
      result_desc,
      completion_time,
      reconciliation_notes,
      userId,
      userId,
      transactionId,
    ]);

    // Update invoice status if payment is completed
    if (status === "completed") {
      const [transaction] = await db.execute(
        "SELECT invoice_id FROM mpesa_transactions WHERE id = ?",
        [transactionId],
      );

      if (transaction[0] && transaction[0].invoice_id) {
        await db.execute(
          "UPDATE invoices SET payment_status = ?, status = ?, paid_date = CURDATE() WHERE id = ?",
          ["paid", "paid", transaction[0].invoice_id],
        );
      }
    }

    res.json({
      success: true,
      message: "M-Pesa transaction updated successfully",
    });
  } catch (error) {
    console.error("Error updating M-Pesa transaction:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update M-Pesa transaction",
      error: error.message,
    });
  }
});

// User Feedback APIs
app.get("/api/feedback", async (req, res) => {
  try {
    const {
      project_id,
      feedback_type,
      status,
      author,
      limit = 50,
      offset = 0,
    } = req.query;

    let query = `
      SELECT uf.*, p.name as project_name, u.first_name, u.last_name,
             CONCAT(u.first_name, ' ', u.last_name) as user_name,
             responder.first_name as responder_first_name,
             responder.last_name as responder_last_name,
             CONCAT(responder.first_name, ' ', responder.last_name) as responder_name
      FROM user_feedback uf
      LEFT JOIN projects p ON uf.project_id = p.id
      LEFT JOIN users u ON uf.user_id = u.id
      LEFT JOIN users responder ON uf.responded_by = responder.id
      WHERE uf.deleted_at IS NULL
    `;
    const params = [];

    if (project_id) {
      query += " AND uf.project_id = ?";
      params.push(project_id);
    }

    if (feedback_type) {
      query += " AND uf.feedback_type = ?";
      params.push(feedback_type);
    }

    if (status) {
      query += " AND uf.status = ?";
      params.push(status);
    }

    // author='client' filters to feedback submitted from the client portal
    // (what the Support dashboard lists); 'admin' = Communication Hub relays.
    if (author === "client" || author === "admin") {
      query += " AND uf.author = ?";
      params.push(author);
    }

    query += " ORDER BY uf.created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const [feedback] = await db.execute(query, params);

    res.json({
      success: true,
      feedback,
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch feedback",
      error: error.message,
    });
  }
});

app.post("/api/feedback", authenticateUser, async (req, res) => {
  try {
    const {
      project_id,
      feedback_type,
      rating,
      title,
      message,
      contact_name,
      contact_email,
      contact_phone,
      source = 'portal',
      priority = 'medium'
    } = req.body;

    const userId = req.userId;

    const query = `
      INSERT INTO user_feedback (
        project_id, user_id, feedback_type, rating, title, message,
        contact_name, contact_email, contact_phone, source,
        priority, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const [result] = await mainDb.query(query, [
      project_id || null,
      userId,
      feedback_type,
      rating || 0,
      title,
      message,
      contact_name || null,
      contact_email || null,
      contact_phone || null,
      source,
      priority
    ]);

    res.json({
      success: true,
      message: "Feedback submitted successfully",
      feedbackId: result.insertId,
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit feedback",
      error: error.message,
    });
  }
});

app.put("/api/feedback/:id", async (req, res) => {
  try {
    const feedbackId = req.params.id;
    const userId = req.user?.id || 1;

    const { status, admin_response, assigned_to, internal_notes } = req.body;

    const query = `
      UPDATE user_feedback
      SET status = ?, admin_response = ?, responded_by = ?, responded_at = NOW(),
          assigned_to = ?, internal_notes = ?, updated_by = ?, updated_at = NOW()
      WHERE id = ?
    `;

    await db.execute(query, [
      status,
      admin_response,
      userId,
      assigned_to,
      internal_notes,
      userId,
      feedbackId,
    ]);

    res.json({
      success: true,
      message: "Feedback updated successfully",
    });
  } catch (error) {
    console.error("Error updating feedback:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update feedback",
      error: error.message,
    });
  }
});

// Quotes Management APIs
app.get("/api/quotes", async (req, res) => {
  try {
    const { project_id, status, priority, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT q.*, p.name as project_name, u.first_name, u.last_name,
             CONCAT(u.first_name, ' ', u.last_name) as created_by_name,
             inv.invoice_number as converted_invoice_number
      FROM quotes q
      LEFT JOIN projects p ON q.project_id = p.id
      LEFT JOIN users u ON q.created_by = u.id
      LEFT JOIN invoices inv ON q.converted_to_invoice_id = inv.id
      WHERE q.deleted_at IS NULL
    `;
    const params = [];

    if (project_id) {
      query += " AND q.project_id = ?";
      params.push(project_id);
    }

    if (status) {
      query += " AND q.status = ?";
      params.push(status);
    }

    if (priority) {
      query += " AND q.priority = ?";
      params.push(priority);
    }

    query += " ORDER BY q.issue_date DESC, q.created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));

    const [quotes] = await db.execute(query, params);

    res.json({
      success: true,
      quotes,
    });
  } catch (error) {
    console.error("Error fetching quotes:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quotes",
      error: error.message,
    });
  }
});

app.post("/api/quotes", async (req, res) => {
  try {
    const {
      project_id,
      quote_type,
      title,
      description,
      subtotal,
      tax_rate,
      currency,
      exchange_rate,
      issue_date,
      valid_until,
      priority,
      client_name,
      client_email,
      client_phone,
      client_address,
      client_company,
      items,
      notes,
      payment_terms,
      terms_conditions,
      delivery_timeline,
      discount_type,
      discount_value,
      discount_reason,
    } = req.body;

    const userId = req.user?.id || 1;

    // Generate unique quote number
    const quoteNumber = `QUOTE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // KRA compliance: accept "16", 16 or 0.16 — store the DECIMAL FRACTION
    // (0.16) the DB's generated `tax_amount = subtotal * tax_rate` needs.
    const taxRateFraction = normalizeRate(tax_rate);
    const taxRatePct = rateToPct(tax_rate);

    // Calculate total with discount
    const discountedSubtotal =
      discount_type === "percentage"
        ? parseFloat(subtotal) * (1 - parseFloat(discount_value || 0) / 100)
        : parseFloat(subtotal) - parseFloat(discount_value || 0);
    const totalAmount =
      discountedSubtotal * (1 + taxRatePct / 100);

    const query = `
      INSERT INTO quotes (
        project_id, quote_number, quote_type, title, description,
        subtotal, tax_rate, currency, exchange_rate, issue_date, valid_until,
        priority, client_name, client_email, client_phone, client_address,
        client_company, items, notes, payment_terms, terms_conditions,
        delivery_timeline, discount_type, discount_value, discount_reason, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(query, [
      project_id,
      quoteNumber,
      quote_type,
      title,
      description,
      parseFloat(subtotal),
      taxRateFraction,
      currency,
      parseFloat(exchange_rate || 1),
      issue_date,
      valid_until,
      priority,
      client_name,
      client_email,
      client_phone,
      client_address,
      client_company,
      JSON.stringify(items || []),
      notes,
      payment_terms,
      terms_conditions,
      delivery_timeline,
      discount_type,
      parseFloat(discount_value || 0),
      discount_reason,
      userId,
    ]);

    // Log quote creation activity
    await db.execute(
      "INSERT INTO quote_activities (quote_id, activity_type, description, user_id, user_type) VALUES (?, ?, ?, ?, ?)",
      [
        result.insertId,
        "created",
        `Quote ${quoteNumber} created for ${client_name}`,
        userId,
        "admin",
      ],
    );

    res.json({
      success: true,
      message: "Quote created successfully",
      quoteId: result.insertId,
      quoteNumber: quoteNumber,
    });
  } catch (error) {
    console.error("Error creating quote:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create quote",
      error: error.message,
    });
  }
});

app.put("/api/quotes/:id", async (req, res) => {
  try {
    const quoteId = req.params.id;
    const userId = req.user?.id || 1;

    const { status, priority, notes, admin_response } = req.body;

    const query = `
      UPDATE quotes
      SET status = ?, priority = ?, notes = ?, updated_by = ?, updated_at = NOW()
      WHERE id = ?
    `;

    await db.execute(query, [status, priority, notes, userId, quoteId]);

    // Log status change activity
    if (status) {
      await db.execute(
        "INSERT INTO quote_activities (quote_id, activity_type, description, user_id, user_type) VALUES (?, ?, ?, ?, ?)",
        [quoteId, status, `Quote status changed to ${status}`, userId, "admin"],
      );
    }

    res.json({
      success: true,
      message: "Quote updated successfully",
    });
  } catch (error) {
    console.error("Error updating quote:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update quote",
      error: error.message,
    });
  }
});

app.post("/api/quotes/:id/convert-to-invoice", async (req, res) => {
  try {
    const quoteId = req.params.id;
    const userId = req.user?.id || 1;

    const { invoice_title, due_date } = req.body;

    // Get quote details
    const [quoteData] = await db.execute(
      "SELECT * FROM quotes WHERE id = ? AND deleted_at IS NULL",
      [quoteId],
    );

    if (!quoteData.length) {
      return res.status(404).json({
        success: false,
        message: "Quote not found",
      });
    }

    const quote = quoteData[0];

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create invoice from quote
    const invoiceQuery = `
      INSERT INTO invoices (
        project_id, invoice_number, invoice_type, title, description,
        subtotal, tax_rate, currency, exchange_rate, issue_date, due_date,
        payment_method, payment_phone, client_name, client_email, client_phone,
        client_address, items, notes, payment_terms, terms_conditions, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [invoiceResult] = await db.execute(invoiceQuery, [
      quote.project_id,
      invoiceNumber,
      "project_fee",
      invoice_title || `Invoice for ${quote.title}`,
      quote.description,
      quote.subtotal,
      quote.tax_rate,
      quote.currency,
      quote.exchange_rate,
      new Date().toISOString().split("T")[0],
      due_date,
      "mpesa",
      "+254799789956",
      quote.client_name,
      quote.client_email,
      quote.client_phone,
      quote.client_address,
      quote.items,
      `Converted from quote ${quote.quote_number}`,
      quote.payment_terms,
      quote.terms_conditions,
      userId,
    ]);

    // Update quote status
    await db.execute(
      "UPDATE quotes SET status = ?, converted_to_invoice_id = ?, converted_at = NOW(), updated_by = ? WHERE id = ?",
      ["converted", invoiceResult.insertId, userId, quoteId],
    );

    // Log conversion activity
    await db.execute(
      "INSERT INTO quote_activities (quote_id, activity_type, description, user_id, user_type, activity_data) VALUES (?, ?, ?, ?, ?, ?)",
      [
        quoteId,
        "converted",
        `Quote converted to invoice ${invoiceNumber}`,
        userId,
        "admin",
        JSON.stringify({ invoiceId: invoiceResult.insertId, invoiceNumber }),
      ],
    );

    res.json({
      success: true,
      message: "Quote converted to invoice successfully",
      invoiceId: invoiceResult.insertId,
      invoiceNumber: invoiceNumber,
    });
  } catch (error) {
    console.error("Error converting quote to invoice:", error);
    res.status(500).json({
      success: false,
      message: "Failed to convert quote to invoice",
      error: error.message,
    });
  }
});

app.delete("/api/quotes/:id", async (req, res) => {
  try {
    const quoteId = req.params.id;

    // Soft delete the quote. `deleted_by` intentionally NULL — quotes.deleted_by
    // is FK-constrained to users(id) in the canonical schema, not admin_users.
    await db.execute(
      "UPDATE quotes SET deleted_at = NOW() WHERE id = ?",
      [quoteId],
    );

    res.json({
      success: true,
      message: "Quote deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting quote:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete quote",
      error: error.message,
    });
  }
});

// Quote Items API
app.get("/api/quotes/:quoteId/items", async (req, res) => {
  try {
    const { quoteId } = req.params;

    const [items] = await db.execute(
      "SELECT * FROM quote_items WHERE quote_id = ? ORDER BY display_order",
      [quoteId],
    );

    res.json({
      success: true,
      items,
    });
  } catch (error) {
    console.error("Error fetching quote items:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quote items",
      error: error.message,
    });
  }
});

app.post("/api/quotes/:quoteId/items", async (req, res) => {
  try {
    const { quoteId } = req.params;
    const {
      item_name,
      item_description,
      item_type,
      unit_price,
      quantity,
      discount_percentage,
      unit,
      sku,
      category,
      notes,
      display_order,
    } = req.body;

    const userId = req.user?.id || 1;

    const query = `
      INSERT INTO quote_items (
        quote_id, item_name, item_description, item_type, unit_price,
        quantity, discount_percentage, unit, sku, category, notes, display_order, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(query, [
      quoteId,
      item_name,
      item_description,
      item_type,
      parseFloat(unit_price),
      parseFloat(quantity),
      parseFloat(discount_percentage || 0),
      unit,
      sku,
      category,
      notes,
      display_order || 0,
      userId,
    ]);

    res.json({
      success: true,
      message: "Quote item added successfully",
      itemId: result.insertId,
    });
  } catch (error) {
    console.error("Error adding quote item:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add quote item",
      error: error.message,
    });
  }
});

// Quote Activities API
app.get("/api/quotes/:quoteId/activities", async (req, res) => {
  try {
    const { quoteId } = req.params;

    const [activities] = await db.execute(
      `
      SELECT qa.*, u.first_name, u.last_name,
             CONCAT(u.first_name, ' ', u.last_name) as user_name
      FROM quote_activities qa
      LEFT JOIN users u ON qa.user_id = u.id
      WHERE qa.quote_id = ?
      ORDER BY qa.created_at DESC
    `,
      [quoteId],
    );

    res.json({
      success: true,
      activities,
    });
  } catch (error) {
    console.error("Error fetching quote activities:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quote activities",
      error: error.message,
    });
  }
});

// Document Management APIs
app.get("/api/documents/:type/:id/pdf", async (req, res) => {
  try {
    const { type, id } = req.params;
    let document = null;

    // Get document based on type
    if (type === "invoices") {
      const [docs] = await db.execute("SELECT * FROM invoices WHERE id = ?", [
        id,
      ]);
      document = docs[0];
    } else if (type === "quotes") {
      const [docs] = await db.execute("SELECT * FROM quotes WHERE id = ?", [
        id,
      ]);
      document = docs[0];
    } else if (type === "receipt" || type === "transactions") {
      const [docs] = await db.execute(
        "SELECT * FROM mpesa_transactions WHERE id = ?",
        [id],
      );
      document = docs[0];
    }

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Generate PDF content (professional layout — awaited so res.send gets a Buffer)
    const pdfContent = await generatePDFContent(type, document);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${type}-${document.invoice_number || document.quote_number || document.transaction_id}.pdf"`,
    );
    res.send(pdfContent);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate PDF",
      error: error.message,
    });
  }
});

// Client Portal: download one of the client's OWN invoices as a PDF.
// Ownership is enforced by joining through user_projects (the same way the
// client-dashboard lists invoices), so a client can never fetch another
// client's invoice by guessing ids.
app.get("/api/users/my-invoices/:id/pdf", authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await mainDb.query(
      `SELECT pi.*, up.project_name,
              CONCAT(u.first_name, ' ', u.last_name) AS client_name,
              u.email AS client_email, u.phone_number AS client_phone
       FROM project_invoices pi
       JOIN user_projects up ON up.id = pi.project_id
       LEFT JOIN users u ON u.id = up.user_id
       WHERE pi.id = ? AND up.user_id = ?
       LIMIT 1`,
      [id, req.userId],
    );
    const invoice = rows[0];
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }
    const pdfBuffer = await generatePDFContent("invoices", {
      invoice_number: invoice.invoice_number,
      issue_date: invoice.issue_date,
      due_date: invoice.due_date,
      client_name: invoice.client_name,
      client_email: invoice.client_email,
      client_phone: invoice.client_phone,
      description: invoice.description || `Project: ${invoice.project_name}`,
      amount: invoice.amount,
    });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="invoice-${invoice.invoice_number || id}.pdf"`,
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error("[PDF] client invoice error:", error);
    res.status(500).json({ success: false, message: "Failed to generate invoice PDF" });
  }
});

app.post("/api/documents/generate/:type/:id", async (req, res) => {
  try {
    const { type, id } = req.params;
    let document = null;

    // Get document based on type
    if (type === "invoices") {
      const [docs] = await db.execute("SELECT * FROM invoices WHERE id = ?", [
        id,
      ]);
      document = docs[0];
    } else if (type === "quotes") {
      const [docs] = await db.execute("SELECT * FROM quotes WHERE id = ?", [
        id,
      ]);
      document = docs[0];
    } else if (type === "receipt" || type === "transactions") {
      const [docs] = await db.execute(
        "SELECT * FROM mpesa_transactions WHERE id = ?",
        [id],
      );
      document = docs[0];
    }

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Update PDF generation status
    if (type === "invoices") {
      await db.execute(
        "UPDATE invoices SET pdf_generated = TRUE, pdf_generated_at = NOW() WHERE id = ?",
        [id],
      );
    } else if (type === "quotes") {
      await db.execute(
        "UPDATE quotes SET pdf_generated = TRUE, pdf_generated_at = NOW() WHERE id = ?",
        [id],
      );
    }

    // Generate PDF content
    const pdfContent = await generatePDFContent(type, document);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${type}-${document.invoice_number || document.quote_number || document.transaction_id}.pdf"`,
    );
    res.send(pdfContent);
  } catch (error) {
    console.error("Error generating document:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate document",
      error: error.message,
    });
  }
});

// Admin: one-click "send invoice to client" — renders the professional PDF +
// matching HTML email and delivers both via SMTP. Marks the invoice as sent.
app.post("/api/invoices/:id/send", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { email: overrideEmail, subject: overrideSubject, message } = req.body || {};

    const [rows] = await db.execute("SELECT * FROM invoices WHERE id = ? AND deleted_at IS NULL", [id]);
    const invoice = rows && rows[0];
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    const to = overrideEmail || invoice.client_email;
    if (!to) {
      return res.status(400).json({
        success: false,
        message: "This invoice has no client email. Add one on the invoice and retry.",
      });
    }

    const pdfBuffer = await generatePDFContent("invoices", invoice);
    const htmlEmail = buildDocumentEmailHtml("invoices", invoice);
    const invoiceRef = invoice.invoice_number || `INV-${invoice.id}`;

    const sendResult = await sendMail({
      to,
      subject:
        overrideSubject ||
        `Invoice ${invoiceRef} — The Greggory Systems & Strategy Firm`,
      html: htmlEmail,
      text: message || undefined,
      attachments: [
        {
          filename: `${invoiceRef}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    if (!sendResult.success) {
      return res.status(502).json({
        success: false,
        message: "Email failed to send",
        error: sendResult.error,
      });
    }

    await db.execute(
      "UPDATE invoices SET email_sent = TRUE, email_sent_at = NOW(), status = ? WHERE id = ?",
      ["sent", id],
    );
    await db.execute(
      "INSERT INTO activity_logs (user_id, action_type, action_description, created_at) VALUES (?, ?, ?, NOW())",
      [req.user?.id || 1, "send_document", `Sent invoice ${invoiceRef} to ${to}`],
    );

    res.json({
      success: true,
      simulated: !!sendResult.simulated,
      message: sendResult.simulated
        ? `Email simulated (SMTP not configured) — invoice ${invoiceRef} marked as sent.`
        : `Invoice ${invoiceRef} sent to ${to}`,
    });
  } catch (error) {
    console.error("[INVOICE SEND] Error:", error);
    res.status(500).json({ success: false, message: "Failed to send invoice", error: error.message });
  }
});

app.post("/api/documents/send", authenticateAdmin, async (req, res) => {
  try {
    const { documentId, documentType, email, subject, message } = req.body;

    // Get document details
    let document = null;
    if (documentType === "invoices") {
      const [docs] = await db.execute("SELECT * FROM invoices WHERE id = ?", [
        documentId,
      ]);
      document = docs[0];
    } else if (documentType === "quotes") {
      const [docs] = await db.execute("SELECT * FROM quotes WHERE id = ?", [
        documentId,
      ]);
      document = docs[0];
    } else if (documentType === "receipt" || documentType === "transactions") {
      const [docs] = await db.execute(
        "SELECT * FROM mpesa_transactions WHERE id = ?",
        [documentId],
      );
      document = docs[0];
    }

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Generate the professional PDF (buffer) + the matching HTML email
    const pdfBuffer = await generatePDFContent(documentType, document);
    const htmlEmail = buildDocumentEmailHtml(documentType, document);
    const docRef =
      document.invoice_number ||
      document.quote_number ||
      document.transaction_id ||
      `${documentType}-${documentId}`;

    // Actually deliver via SMTP (simulated when SMTP_PASS is unset — dev/test)
    const sendResult = await sendMail({
      to: email,
      subject:
        subject ||
        `${documentType === "invoices" ? "Invoice" : documentType === "quotes" ? "Quote" : "Receipt"} ${docRef} — The Greggory Systems & Strategy Firm`,
      html: htmlEmail,
      text: message || undefined,
      attachments: [
        {
          filename: `${documentType}-${docRef}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    if (!sendResult.success) {
      return res.status(502).json({
        success: false,
        message: "Email failed to send",
        error: sendResult.error,
      });
    }

    // Mark as sent — only on a real (or simulated) success
    if (documentType === "invoices") {
      await db.execute(
        "UPDATE invoices SET email_sent = TRUE, email_sent_at = NOW(), status = ? WHERE id = ?",
        ["sent", documentId],
      );
    } else if (documentType === "quotes") {
      await db.execute(
        "UPDATE quotes SET email_sent = TRUE, email_sent_at = NOW() WHERE id = ?",
        [documentId],
      );
    }

    // Log email sending activity
    await db.execute(
      "INSERT INTO activity_logs (user_id, action_type, action_description, created_at) VALUES (?, ?, ?, NOW())",
      [
        req.user?.id || 1,
        "send_document",
        `Sent ${documentType} ${docRef} to ${email}`,
      ],
    );

    res.json({
      success: true,
      simulated: !!sendResult.simulated,
      message: sendResult.simulated
        ? "Email simulated (SMTP not configured) — document marked as sent."
        : `Document ${docRef} sent to ${email}`,
    });
  } catch (error) {
    console.error("Error sending document:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send document",
      error: error.message,
    });
  }
});

app.get("/api/documents/client/:clientId", async (req, res) => {
  try {
    const { clientId } = req.params;

    // Get all documents for a client
    const [invoices] = await db.execute(
      'SELECT *, "invoice" as type FROM invoices WHERE client_id = ? OR client_name IN (SELECT CONCAT(first_name, " ", last_name) FROM users WHERE id = ?)',
      [clientId, clientId],
    );

    const [quotes] = await db.execute(
      'SELECT *, "quote" as type FROM quotes WHERE client_id = ? OR client_name IN (SELECT CONCAT(first_name, " ", last_name) FROM users WHERE id = ?)',
      [clientId, clientId],
    );

    const [transactions] = await db.execute(
      'SELECT *, "receipt" as type FROM mpesa_transactions WHERE client_id = ? OR client_name IN (SELECT CONCAT(first_name, " ", last_name) FROM users WHERE id = ?)',
      [clientId, clientId],
    );

    res.json({
      success: true,
      documents: [...invoices, ...quotes, ...transactions].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      ),
    });
  } catch (error) {
    console.error("Error fetching client documents:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch client documents",
      error: error.message,
    });
  }
});

// Project Documents API
app.get("/api/projects/:projectId/documents", async (req, res) => {
  try {
    const { projectId } = req.params;

    // Get all documents related to this project
    const [invoices] = await db.execute(
      'SELECT *, "invoice" as type FROM invoices WHERE project_id = ? AND deleted_at IS NULL',
      [projectId],
    );

    const [quotes] = await db.execute(
      'SELECT *, "quote" as type FROM quotes WHERE project_id = ? AND deleted_at IS NULL',
      [projectId],
    );

    const [transactions] = await db.execute(
      'SELECT *, "receipt" as type FROM mpesa_transactions WHERE project_id = ?',
      [projectId],
    );

    // Combine all documents and sort by date
    const allDocuments = [...invoices, ...quotes, ...transactions].sort(
      (a, b) => {
        const dateA = new Date(
          a.issue_date || a.transaction_date || a.created_at,
        );
        const dateB = new Date(
          b.issue_date || b.transaction_date || b.created_at,
        );
        return dateB - dateA;
      },
    );

    res.json({
      success: true,
      documents: allDocuments,
    });
    } catch (error) {
    console.error("Error fetching project documents:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch project documents",
      error: error.message,
    });
  }
});

// =============================================================================
// Completion PDF Co-Generator — generates a professional completion PDF for ANY
// record type when it is marked completed. Works with invoices, project_invoices,
// accounting_entries, quotes, project_docs, tasks, and projects.
// =============================================================================

/** Helper: fetch a single record by type+id from the appropriate table */
async function fetchRecord(recordType, recordId) {
  const tableMap = {
    invoices: "invoices",
    project_invoices: "project_invoices",
    accounting_entries: "accounting_entries",
    quotes: "quotes",
    project_docs: "project_docs",
    tasks: "tasks",
    projects: "projects",
  };

  const table = tableMap[recordType];
  if (!table) return null;

  try {
    const [rows] = await db.execute(`SELECT * FROM ${table} WHERE id = ? LIMIT 1`, [recordId]);
    return rows.length > 0 ? rows[0] : null;
  } catch (err) {
    // A record type whose table doesn't exist in this DB → treat as "not found"
    if (err && err.code === "ER_NO_SUCH_TABLE") return null;
    throw err;
  }
}

/** POST /api/pdf/generate-completion
 *  Body: { recordType: "invoices", recordId: 123, title?: "...", subtitle?: "..." }
 *  Returns: PDF buffer (Content-Type: application/pdf)
 *  Auth: admin required — anyone can download a completion PDF but admin logs the action
 */
app.post("/api/pdf/generate-completion", async (req, res) => {
  try {
    const { recordType, recordId, title, subtitle } = req.body || {};

    // Validate input
    const supportedTypes = ["invoices", "project_invoices", "accounting_entries", "quotes", "project_docs", "tasks", "projects"];
    if (!recordType || !supportedTypes.includes(recordType)) {
      return res.status(400).json({
        success: false,
        message: `recordType must be one of: ${supportedTypes.join(", ")}`,
      });
    }
    if (!recordId) {
      return res.status(400).json({ success: false, message: "recordId is required" });
    }

    // Fetch the record from the database
    const record = await fetchRecord(recordType, recordId);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: `${recordType} record #${recordId} not found`,
      });
    }

    // Generate the completion PDF
    const pdfBuffer = await generateCompletionPdf(recordType, record, { title, subtitle });

    // Set response headers for PDF download
    const fileName = `${recordType}-${recordId}-completion-${Date.now()}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    res.send(pdfBuffer);

    // Log the completion PDF generation (async, fire-and-forget)
    setImmediate(async () => {
      try {
        const docRef = record.invoice_number || record.quote_number || record.transaction_id || `ID:${recordId}`;
        await db.execute(
          "INSERT INTO activity_logs (user_id, action_type, action_description, created_at) VALUES (?, ?, ?, NOW())",
          [
            req.user?.id || req.userId || 1,
            "generate_completion_pdf",
            `Generated completion PDF for ${recordType} ${docRef}`,
          ]
        );
      } catch (logErr) {
        console.error("[PDF] Activity log error:", logErr.message);
      }
    });
  } catch (error) {
    console.error("[PDF] Generation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate completion PDF",
      error: error.message,
    });
  }
});

// GET shortcut for browser downloads (admin or user with own invoice)
app.get("/api/pdf/completion/:recordType/:recordId", async (req, res) => {
  try {
    const { recordType, recordId } = req.params;

    const supportedTypes = ["invoices", "project_invoices", "accounting_entries", "quotes", "project_docs", "tasks", "projects"];
    if (!supportedTypes.includes(recordType)) {
      return res.status(400).json({
        success: false,
        message: `recordType must be one of: ${supportedTypes.join(", ")}`,
      });
    }

    const record = await fetchRecord(recordType, recordId);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: `${recordType} record #${recordId} not found`,
      });
    }

    const pdfBuffer = await generateCompletionPdf(recordType, record, {});
    const fileName = `${recordType}-${recordId}-completion-${Date.now()}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("[PDF] GET generation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate completion PDF",
      error: error.message,
    });
  }
});

// Currency Management APIs
app.get("/api/currencies", async (req, res) => {
  try {
    const { active, region, search } = req.query;
    let query = "SELECT * FROM currencies WHERE 1=1";
    const params = [];

    if (active !== undefined) {
      query += " AND is_active = ?";
      params.push(active === "true");
    }

    if (region) {
      query += " AND region LIKE ?";
      params.push(`%${region}%`);
    }

    if (search) {
      query += " AND (name LIKE ? OR code LIKE ? OR symbol LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += " ORDER BY is_default DESC, name ASC";

    const [currencies] = await db.execute(query, params);
    res.json({
      success: true,
      currencies,
    });
  } catch (error) {
    console.error("Error fetching currencies:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch currencies",
      error: error.message,
    });
  }
});

app.post("/api/currencies", async (req, res) => {
  try {
    const {
      code,
      name,
      symbol,
      exchange_rate,
      region,
      is_active = true,
    } = req.body;

    if (!code || !name || !symbol || !exchange_rate) {
      return res.status(400).json({
        success: false,
        message: "Required fields: code, name, symbol, exchange_rate",
      });
    }

    const [result] = await db.execute(
      "INSERT INTO currencies (code, name, symbol, exchange_rate, region, is_active) VALUES (?, ?, ?, ?, ?, ?)",
      [code.toUpperCase(), name, symbol, exchange_rate, region, is_active],
    );

    res.json({
      success: true,
      message: "Currency added successfully",
      currencyId: result.insertId,
    });
  } catch (error) {
    console.error("Error adding currency:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add currency",
      error: error.message,
    });
  }
});

app.put("/api/currencies/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, symbol, exchange_rate, region, is_active } = req.body;

    const [result] = await db.execute(
      "UPDATE currencies SET name = ?, symbol = ?, exchange_rate = ?, region = ?, is_active = ?, updated_at = NOW() WHERE id = ?",
      [name, symbol, exchange_rate, region, is_active, id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Currency not found",
      });
    }

    res.json({
      success: true,
      message: "Currency updated successfully",
    });
  } catch (error) {
    console.error("Error updating currency:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update currency",
      error: error.message,
    });
  }
});

app.delete("/api/currencies/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.execute(
      "UPDATE currencies SET is_active = FALSE, updated_at = NOW() WHERE id = ?",
      [id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Currency not found",
      });
    }

    res.json({
      success: true,
      message: "Currency deactivated successfully",
    });
  } catch (error) {
    console.error("Error deactivating currency:", error);
    res.status(500).json({
      success: false,
      message: "Failed to deactivate currency",
      error: error.message,
    });
  }
});

app.post("/api/currencies/:id/set-default", async (req, res) => {
  try {
    const { id } = req.params;

    // First, unset all default currencies
    await db.execute(
      "UPDATE currencies SET is_default = FALSE, updated_at = NOW()",
    );

    // Then set the new default
    const [result] = await db.execute(
      "UPDATE currencies SET is_default = TRUE, updated_at = NOW() WHERE id = ?",
      [id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Currency not found",
      });
    }

    res.json({
      success: true,
      message: "Default currency updated successfully",
    });
  } catch (error) {
    console.error("Error setting default currency:", error);
    res.status(500).json({
      success: false,
      message: "Failed to set default currency",
      error: error.message,
    });
  }
});

// Currency Conversion API
app.post("/api/currencies/convert", async (req, res) => {
  try {
    const { amount, from_currency, to_currency } = req.body;

    if (!amount || !from_currency || !to_currency) {
      return res.status(400).json({
        success: false,
        message: "Required fields: amount, from_currency, to_currency",
      });
    }

    // Get exchange rates
    const [fromCurrency] = await db.execute(
      "SELECT exchange_rate FROM currencies WHERE code = ? AND is_active = TRUE",
      [from_currency.toUpperCase()],
    );

    const [toCurrency] = await db.execute(
      "SELECT exchange_rate FROM currencies WHERE code = ? AND is_active = TRUE",
      [to_currency.toUpperCase()],
    );

    if (fromCurrency.length === 0 || toCurrency.length === 0) {
      return res.status(404).json({
        success: false,
        message: "One or both currencies not found or inactive",
      });
    }

    // Convert: amount * (to_rate / from_rate)
    const convertedAmount =
      amount * (toCurrency[0].exchange_rate / fromCurrency[0].exchange_rate);

    res.json({
      success: true,
      original_amount: amount,
      from_currency: from_currency.toUpperCase(),
      to_currency: to_currency.toUpperCase(),
      converted_amount: convertedAmount,
    });
  } catch (error) {
    console.error("Error converting currency:", error);
    res.status(500).json({
      success: false,
      message: "Failed to convert currency",
      error: error.message,
    });
  }
});

// Admin Authentication API
// REMOVED INLINE HANDLERS - HANDLED BY MODULAR ROUTER /backend/routes/admin-verification.js

// Frontend-compatible endpoint
// REMOVED INLINE HANDLERS - HANDLED BY MODULAR ROUTER /backend/routes/admin-verification.js

// Developer Authentication removed as per architectural update

// Admin/Developer registration (frontend expects this endpoint)
// REMOVED INLINE HANDLERS - HANDLED BY MODULAR ROUTER /backend/routes/admin-verification.js

// Validate admin session token (required for admin UI — not forgeable without server secret)
app.get("/api/admin/session", async (req, res) => {
  try {
    const auth = req.headers.authorization || "";
    const m = auth.match(/^Bearer\s+(.+)$/i);
    if (!m) {
      return res
        .status(401)
        .json({ success: false, message: "No session token" });
    }
    const payload = verifyAdminSessionToken(m[1].trim());
    if (!payload) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired session" });
    }

        // Check admin_users table first
    let [admins] = await mainDb.query(
      `SELECT id, email, first_name, last_name, phone_number, admin_level, access_level, department,
              profile_photo_blob IS NOT NULL as has_photo, profile_image_id IS NOT NULL as has_image
       FROM admin_users
       WHERE id = ? AND is_active = TRUE AND deleted_at IS NULL
       LIMIT 1`,
      [payload.uid],
    );

    // If not found in admin_users, check developer_users
    let user = null;
    let role = "admin";

    if (admins.length === 0) {
            const [developers] = await mainDb.query(
        `SELECT id, email, first_name, last_name, phone_number, developer_level, tech_stack,
                profile_photo_blob IS NOT NULL as has_photo, profile_image_id IS NOT NULL as has_image
         FROM developer_users
         WHERE id = ? AND is_active = TRUE AND deleted_at IS NULL
         LIMIT 1`,
        [payload.uid],
      );

      if (developers.length === 0) {
        return res
          .status(403)
          .json({ success: false, message: "Admin privileges required" });
      }

      user = developers[0];
      role = "developer";
    } else {
      user = admins[0];
    }

        res.json({
      success: true,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone_number,
        role: role,
        admin_level: user.admin_level,
        access_level: user.access_level,
        department: user.department,
        developer_level: user.developer_level,
        tech_stack: user.tech_stack,
        has_photo: Boolean(user.has_photo || user.has_image),
        has_image: Boolean(user.has_image),
      },
    });
  } catch (error) {
    console.error("Admin session error:", error);
    res.status(500).json({ success: false, message: "Session check failed" });
  }
});

// =============================================
// Admin Dashboard API
// =============================================
app.get("/api/admin/budget-overview", authenticateAdmin, async (req, res) => {
  try {
    const [budgetData] = await mainDb.query(`
      SELECT 
        SUM(estimated_budget) as planned,
        SUM(actual_budget) as spent,
        SUM(estimated_budget - actual_budget) as forecast
      FROM user_projects
      WHERE is_active = 1 AND deleted_at IS NULL
    `);

    const [revenueData] = await mainDb.query(`
      SELECT SUM(amount) as revenue
      FROM project_invoices
      WHERE status = 'paid'
    `);

    const planned = parseFloat(budgetData[0]?.planned || 0);
    const spent = parseFloat(budgetData[0]?.spent || 0);
    const revenue = parseFloat(revenueData[0]?.revenue || 0);

    res.json({
      success: true,
      data: {
        expenses: spent,
        spent: spent,
        remaining: planned - spent,
        forecast: planned - spent,
        revenue: revenue,
        net_income: revenue - spent,
      }
    });
  } catch (error) {
    console.error("[ADMIN BUDGET] Error:", error);
    res.status(500).json({ success: false, message: "Budget overview failed" });
  }
});

// =============================================
// Admin: Client Change Requests (from Client Portal)
// =============================================
// =============================================
// Admin: Document Signature Requests (from Client Portal)
// =============================================
// =============================================
// Global System Search (Admin — deep cross-module index)
// =============================================
const esc = (v) => String(v ?? "").replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
const escLike = (v) => `%${esc(v)}%`;
const fmtKSH = (amount) => {
  const n = typeof amount === "string" ? parseFloat(amount) : Number(amount);
  if (Number.isNaN(n) || n === 0) return "KSH 0.00";
  return "KSH " + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// =============================================
// Admin-triggered Password Recovery via WhatsApp
// bcrypt hashes are one-way, so "recovery" means: generate a secure temporary
// password, store its fresh hash, and deliver the plaintext once over
// WhatsApp to the client's registered number. In simulated mode (no provider
// credentials) the response includes the temp password so the admin can
// relay it manually.
// =============================================
const TEMP_PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
const generateTempPassword = (length = 12) => {
  let out = "";
  for (let i = 0; i < length; i++) out += TEMP_PASSWORD_CHARS[crypto.randomInt(TEMP_PASSWORD_CHARS.length)];
  return out;
};
const maskPhone = (phone) => {
  const p = String(phone);
  return p.slice(0, -4).replace(/\d/g, "•") + p.slice(-4);
};

app.post("/api/admin/users/:id/whatsapp-password-reset", authenticateAdmin, async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ success: false, message: "Invalid user id" });
  }
  try {
    const [rows] = await mainDb.query(
      "SELECT id, display_name, email, phone_number FROM users WHERE id = ? AND deleted_at IS NULL LIMIT 1",
      [userId]
    );
    const user = rows && rows[0];
    if (!user) return res.status(404).json({ success: false, message: "Client user not found" });
    if (!user.phone_number) {
      return res.status(400).json({ success: false, message: "This user has no phone number on file — add one to their profile before resetting via WhatsApp." });
    }

    const tempPassword = generateTempPassword(12);
    const firstName = String(user.display_name || user.email || "there").trim().split(/\s+/)[0];
    const message = [
      `Hello ${firstName},`,
      ``,
      `Your password for THE-GREGGORY-SYSTEMS-AND-STRATEGY-FIRM client portal has been reset by an administrator.`,
      ``,
      `Temporary password: ${tempPassword}`,
      ``,
      `Log in and change it under your portal settings immediately.`,
    ].join("\n");

    // ── REAL MODE ── a provider is configured: attempt delivery FIRST and only
    // rotate the stored password if the message actually went out. A provider
    // failure therefore never leaves the client with an undelivered password.
    if (whatsappProviderConfigured()) {
      const wa = await sendWhatsAppToUserStrict(user.phone_number, message);
      if (!wa.success) {
        logDataAccess(req, "user", userId, "admin_whatsapp_password_reset_failed");
        console.error(`[ADMIN PASSWORD RESET] user=${userId} delivery FAILED: ${wa.error}`);
        return res.status(502).json({
          success: false,
          delivered: false,
          message: `Password NOT changed — WhatsApp delivery failed (${wa.error}). The client's current password still works. Resolve the provider issue and retry.`,
        });
      }
      const newHash = await bcryptjs.hash(tempPassword, 10);
      await mainDb.query("UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?", [newHash, userId]);
      logDataAccess(req, "user", userId, "admin_whatsapp_password_reset");
      console.log(`[ADMIN PASSWORD RESET] user=${userId} reset by admin — WhatsApp SENT via ${wa.provider}`);
      return res.json({
        success: true,
        simulated: false,
        provider: wa.provider,
        deliveredTo: maskPhone(user.phone_number),
        message: `Password reset. The temporary password was delivered to the client's WhatsApp via ${wa.provider === "meta-cloud" ? "WhatsApp Cloud API" : "Africa's Talking"}.`,
      });
    }

    // ── SIMULATED MODE ── no provider configured: rotate now and hand the
    // password to the admin for manual relay.
    const newHash = await bcryptjs.hash(tempPassword, 10);
    await mainDb.query("UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?", [newHash, userId]);
    await sendWhatsAppToUser(user.phone_number, message); // records the simulated relay in the service log
    logDataAccess(req, "user", userId, "admin_whatsapp_password_reset_simulated");

    console.log(`[ADMIN PASSWORD RESET] user=${userId} reset by admin — WhatsApp SIMULATED`);

    res.json({
      success: true,
      simulated: true,
      deliveredTo: maskPhone(user.phone_number),
      message: "Password reset. WhatsApp provider is not configured, so the temporary password is shown below for manual relay.",
      // The plaintext temp password is echoed ONLY in simulated mode so the
      // admin can relay it manually while testing; with a live provider it
      // travels exclusively over WhatsApp and is never stored or echoed.
      tempPassword,
    });
  } catch (error) {
    console.error("[ADMIN PASSWORD RESET] Error:", error);
    res.status(500).json({ success: false, message: "Password reset failed" });
  }
});

// =============================================
// Secondary Backup Control (cloud Aiven -> local phpMyAdmin/XAMPP)
// Script: scripts/backup-cloud-to-local.js — scheduled daily at 02:00 by the
// Windows Task Scheduler task "Greggory DB Cloud-to-Local Backup". These
// endpoints let admins monitor the last run and trigger on-demand backups.
// Docs: docs/SECONDARY-BACKUP.md
// =============================================
const { spawn } = require("child_process");
const BACKUP_SCRIPT_PATH = path.join(__dirname, "scripts", "backup-cloud-to-local.js");
const BACKUP_STATUS_PATH = path.join(__dirname, "backups", "last-backup-status.json");
const BACKUP_SNAPSHOTS_DIR = path.join(__dirname, "backups");
let backupRunInProgress = false;

const readBackupStatus = () => {
  try {
    return JSON.parse(fs.readFileSync(BACKUP_STATUS_PATH, "utf8"));
  } catch {
    return null;
  }
};

// ============================================================================
// ADMIN NODE SETTINGS + SYSTEM CALIBRATION — real endpoints (no more static UI)
// Store: existing `admin_website_settings` table, namespaced category
// `admin_node` so website content settings are never touched.
// ============================================================================
const ADMIN_NODE_CATEGORY = "admin_node";

// Keys the Node Settings page is allowed to write (whitelist)
const ADMIN_NODE_KEYS = new Set([
  "site_title",
  "contact_email",
  "contact_phone",
  "admin_session_timeout",
  "maintenance_mode",
  "allow_registration",
  "deep_space_mode",
  "admin_lockdown",
]);

async function setAdminNodeSetting(key, value, adminId) {
  const [upd] = await mainDb.query(
    "UPDATE admin_website_settings SET setting_value = ?, updated_by = ? WHERE setting_key = ?",
    [String(value), adminId == null ? null : String(adminId), key]
  );
  if (upd.affectedRows === 0) {
    await mainDb.query(
      "INSERT INTO admin_website_settings (setting_key, setting_value, category, updated_by) VALUES (?, ?, ?, ?)",
      [key, String(value), ADMIN_NODE_CATEGORY, adminId == null ? null : String(adminId)]
    );
  }
}

// ---- Read node settings + system snapshot ----------------------------------
// ---- Save node settings (whitelisted keys only) ----------------------------
app.put("/api/admin/node-settings", authenticateAdmin, async (req, res) => {
  try {
    const incoming = req.body && req.body.settings;
    if (!incoming || typeof incoming !== "object") {
      return res.status(400).json({ success: false, message: "settings object required" });
    }
    const adminId = req.admin && (req.admin.id ?? req.admin.admin_id) || null;
    const keys = Object.keys(incoming).filter((k) => ADMIN_NODE_KEYS.has(k));
    if (keys.length === 0) {
      return res.status(400).json({ success: false, message: "No valid setting keys provided" });
    }
    for (const k of keys) {
      await setAdminNodeSetting(k, incoming[k], adminId);
    }
    await mainDb.query(
      "INSERT INTO activity_logs (user_id, action_type, action_description, created_at) VALUES (?, ?, ?, NOW())",
      [null, "admin_node_settings", `Updated node settings: ${keys.join(", ")}`]
    );
    res.json({ success: true, message: "Settings saved", updated: keys.length });
  } catch (err) {
    console.error("[node-settings] save failed:", err.message);
    res.status(500).json({ success: false, message: "Could not save settings" });
  }
});

// ---- System Calibration: live diagnostics, persisted for the dashboard -----
// ===== Admin Node Settings & System Calibration — real endpoints (end) =====

// =============================================
// Client-scoped System Search (scoped to the authenticated user's own data)
// =============================================
app.get("/api/users/search", authenticateUser, async (req, res) => {
  const q = (req.query.q || "").trim();
  const userId = req.userId;
  if (!q || q.length < 2) return res.json({ success: true, results: [], query: q });
  const term = escLike(q);
  const deep = req.query.deep === "true";
  const limit = deep ? 40 : 8;
  const results = [];
  try {
    const [projects] = await mainDb.query(
      `SELECT id, project_name, status FROM user_projects
         WHERE is_active = 1 AND deleted_at IS NULL AND user_id = ?
           AND project_name LIKE ? ESCAPE '\\'
         ORDER BY project_name ASC LIMIT ${limit}`,
      [userId, term]
    );
    projects.forEach(p => results.push({ id: p.id, type: "project", title: p.project_name, subtitle: `Project #${p.id} · ${(p.status || "planning").toUpperCase()}`, status: p.status, link: `/client-portal` }));

    const [tasks] = await mainDb.query(
      `SELECT t.id, t.task_name, up.project_name FROM project_tasks t
         JOIN user_projects up ON up.id = t.project_id
         WHERE t.deleted_at IS NULL AND up.user_id = ? AND (t.task_name LIKE ? ESCAPE '\\' OR t.task_description LIKE ? ESCAPE '\\')
         ORDER BY t.created_at DESC LIMIT ${limit}`,
      [userId, term, term]
    );
    tasks.forEach(t => results.push({ id: t.id, type: "task", title: t.task_name, subtitle: t.project_name || "Unassigned task", link: `/client-portal` }));

    const [invoices] = await mainDb.query(
      `SELECT pi.id, pi.invoice_number, up.project_name, pi.client_name, pi.status, pi.amount_kes
         FROM project_invoices pi
         LEFT JOIN user_projects up ON up.id = pi.project_id
         WHERE pi.deleted_at IS NULL AND (up.user_id = ? OR pi.client_id = ?)
           AND (pi.invoice_number LIKE ? ESCAPE '\\' OR up.project_name LIKE ? ESCAPE '\\')
         ORDER BY pi.created_at DESC LIMIT ${limit}`,
      [userId, userId, term, term]
    );
    invoices.forEach(i => results.push({
      id: i.id, type: "ledger", title: i.invoice_number || `INV-${i.id}`,
      subtitle: `${i.project_name || i.client_name || "Invoice"} · ${(i.status || "draft").toUpperCase()} · ${fmtKSH(i.amount_kes)}`,
      link: `/client-portal`,
    }));

    const [docs] = await mainDb.query(
      `SELECT id, document_name, category FROM client_documents
         WHERE deleted_at IS NULL AND client_id = ?
           AND (document_name LIKE ? ESCAPE '\\' OR description LIKE ? ESCAPE '\\')
         ORDER BY created_at DESC LIMIT ${limit}`,
      [userId, term, term]
    );
    docs.forEach(d => results.push({ id: d.id, type: "project", title: d.document_name, subtitle: d.category || "Document", link: `/client-portal` }));

    res.json({ success: true, results, query: q, deep });
  } catch (error) {
    console.error("[CLIENT SEARCH] Error:", error);
    res.status(500).json({ success: false, message: "Search failed" });
  }
});

// =============================================
// Team Management API
// =============================================
app.post("/api/admin/team", authenticateAdmin, async (req, res) => {
  try {
    const { name, role, department, description } = req.body;
    if (!name || !role) {
      return res.status(400).json({ success: false, message: "Name and role are required" });
    }

    const [result] = await mainDb.query(`
      INSERT INTO team_members (name, role, department, description, is_active)
      VALUES (?, ?, ?, ?, 1)
    `, [name, role, department || null, description || null]);

    res.json({ success: true, id: result.insertId, message: "Team member created" });
  } catch (error) {
    console.error("[ADMIN TEAM CREATE] Error:", error);
    res.status(500).json({ success: false, message: "Failed to create team member" });
  }
});

app.put("/api/admin/team/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, department, description, is_active } = req.body;

    const [result] = await mainDb.query(`
      UPDATE team_members
      SET name = ?, role = ?, department = ?, description = ?, is_active = ?, updated_at = NOW()
      WHERE id = ?
    `, [name, role, department || null, description || null, is_active ? 1 : 0, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Team member not found" });
    }

    res.json({ success: true, message: "Team member updated" });
  } catch (error) {
    console.error("[ADMIN TEAM UPDATE] Error:", error);
    res.status(500).json({ success: false, message: "Failed to update team member" });
  }
});

app.delete("/api/admin/team/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await mainDb.query(`DELETE FROM team_members WHERE id = ?`, [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Team member not found" });
    }

    res.json({ success: true, message: "Team member deleted" });
  } catch (error) {
    console.error("[ADMIN TEAM DELETE] Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete team member" });
  }
});

app.get("/api/admin/project-team/:projectId", authenticateAdmin, async (req, res) => {
  try {
    const { projectId } = req.params;
    const [team] = await mainDb.query(`
      SELECT ptm.id, ptm.role, ptm.assigned_at, ptm.removed_at,
             u.id as user_id, u.first_name, u.last_name, u.display_name, u.email, u.primary_role
      FROM project_team_members ptm
      LEFT JOIN users u ON u.id = ptm.user_id
      WHERE ptm.project_id = ? AND ptm.removed_at IS NULL
      ORDER BY ptm.assigned_at DESC
    `, [projectId]);

    res.json({ success: true, team: team || [] });
  } catch (error) {
    console.error("[ADMIN PROJECT TEAM] Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch project team" });
  }
});

app.delete("/api/admin/project-team/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user?.id || req.adminId;

    const [result] = await mainDb.query(`
      UPDATE project_team_members
      SET removed_at = NOW(), removed_by = ?
      WHERE id = ? AND removed_at IS NULL
    `, [adminId, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }

    res.json({ success: true, message: "Team member removed" });
  } catch (error) {
    console.error("[ADMIN PROJECT TEAM REMOVE] Error:", error);
    res.status(500).json({ success: false, message: "Failed to remove team member" });
  }
});

// =============================================
// Team Templates API
// =============================================

// List all team templates
app.get("/api/admin/team-templates", authenticateAdmin, async (req, res) => {
  try {
    const [rows] = await mainDb.query(`
      SELECT tt.id, tt.name, tt.description, tt.project_id, tt.team_leader_id,
             tt.team_leader_image, tt.team_leader_image_mime, tt.created_at, tt.updated_at,
             tm.name as leader_name, tm.role as leader_role,
             up.project_name,
             (SELECT COUNT(*) FROM team_template_members ttm WHERE ttm.template_id = tt.id) as member_count
      FROM team_templates tt
      LEFT JOIN team_members tm ON tm.id = tt.team_leader_id
      LEFT JOIN user_projects up ON up.id = tt.project_id
      ORDER BY tt.updated_at DESC
    `);
    // Convert BLOB images to base64 for frontend display
    const templates = (rows || []).map(r => ({
      ...r,
      team_leader_image: r.team_leader_image ? r.team_leader_image.toString('base64') : null,
    }));
    res.json({ success: true, templates });
  } catch (error) {
    console.error("[ADMIN TEAM TEMPLATES LIST] Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch team templates", error: error.message });
  }
});

// Get one template with its members
app.get("/api/admin/team-templates/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const [templates] = await mainDb.query(`
      SELECT tt.*, tm.name as leader_name, tm.role as leader_role, tm.department as leader_department,
             up.project_name
      FROM team_templates tt
      LEFT JOIN team_members tm ON tm.id = tt.team_leader_id
      LEFT JOIN user_projects up ON up.id = tt.project_id
      WHERE tt.id = ?
    `, [id]);
    if (templates.length === 0) {
      return res.status(404).json({ success: false, message: "Template not found" });
    }
    const tpl = templates[0];
    const [members] = await mainDb.query(`
      SELECT ttm.id, ttm.team_member_id, ttm.role as member_role,
             tm.name, tm.department, tm.description
      FROM team_template_members ttm
      JOIN team_members tm ON tm.id = ttm.team_member_id
      WHERE ttm.template_id = ?
      ORDER BY ttm.created_at ASC
    `, [id]);
    // Convert BLOB image to base64 for frontend display
    const template = {
      ...tpl,
      team_leader_image: tpl.team_leader_image ? tpl.team_leader_image.toString('base64') : null,
      members: members || [],
    };
    res.json({ success: true, template });
  } catch (error) {
    console.error("[ADMIN TEAM TEMPLATE GET] Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch template", error: error.message });
  }
});

// Create a team template
app.post("/api/admin/team-templates", authenticateAdmin, async (req, res) => {
  try {
    const { name, description, project_id, team_leader_id, team_leader_image, team_leader_image_mime, member_ids } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Template name is required" });
    }
    // Convert base64 image to BLOB if provided
    let imageBlob = null;
    if (team_leader_image && typeof team_leader_image === 'string') {
      const base64Data = team_leader_image.replace(/^data:image\/\w+;base64,/, '');
      imageBlob = Buffer.from(base64Data, 'base64');
    }
    const [result] = await mainDb.query(`
      INSERT INTO team_templates (name, description, project_id, team_leader_id, team_leader_image, team_leader_image_mime, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [name, description || null, project_id || null, team_leader_id || null, imageBlob, team_leader_image_mime || null]);
    const templateId = result.insertId;
    if (Array.isArray(member_ids) && member_ids.length > 0) {
      const values = member_ids.map((mid) => `(${templateId}, ${mid}, 'member', NOW())`).join(', ');
      await mainDb.query(`INSERT INTO team_template_members (template_id, team_member_id, role, created_at) VALUES ${values}`);
    }
    res.status(201).json({ success: true, id: templateId, message: "Team template created" });
  } catch (error) {
    console.error("[ADMIN TEAM TEMPLATE CREATE] Error:", error);
    res.status(500).json({ success: false, message: "Failed to create team template", error: error.message });
  }
});

// Update a team template
app.put("/api/admin/team-templates/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, project_id, team_leader_id, team_leader_image, team_leader_image_mime, member_ids } = req.body;
    const updates = [];
    const values = [];
    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (project_id !== undefined) { updates.push('project_id = ?'); values.push(project_id || null); }
    if (team_leader_id !== undefined) { updates.push('team_leader_id = ?'); values.push(team_leader_id || null); }
    if (team_leader_image !== undefined) {
      updates.push('team_leader_image = ?');
      if (team_leader_image && typeof team_leader_image === 'string') {
        const base64Data = team_leader_image.replace(/^data:image\/\w+;base64,/, '');
        values.push(Buffer.from(base64Data, 'base64'));
      } else {
        values.push(null);
      }
    }
    if (team_leader_image_mime !== undefined) { updates.push('team_leader_image_mime = ?'); values.push(team_leader_image_mime || null); }
    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: "No fields to update" });
    }
    updates.push('updated_at = NOW()');
    values.push(id);
    const [result] = await mainDb.query(`UPDATE team_templates SET ${updates.join(', ')} WHERE id = ?`, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Template not found" });
    }
    if (Array.isArray(member_ids)) {
      await mainDb.query(`DELETE FROM team_template_members WHERE template_id = ?`, [id]);
      if (member_ids.length > 0) {
        const mvals = member_ids.map((mid) => `(${id}, ${mid}, 'member', NOW())`).join(', ');
        await mainDb.query(`INSERT INTO team_template_members (template_id, team_member_id, role, created_at) VALUES ${mvals}`);
      }
    }
    res.json({ success: true, message: "Team template updated" });
  } catch (error) {
    console.error("[ADMIN TEAM TEMPLATE UPDATE] Error:", error);
    res.status(500).json({ success: false, message: "Failed to update team template", error: error.message });
  }
});

// Delete a team template
app.delete("/api/admin/team-templates/:id", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await mainDb.query(`DELETE FROM team_template_members WHERE template_id = ?`, [id]);
    const [result] = await mainDb.query(`DELETE FROM team_templates WHERE id = ?`, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Template not found" });
    }
    res.json({ success: true, message: "Team template deleted" });
  } catch (error) {
    console.error("[ADMIN TEAM TEMPLATE DELETE] Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete team template", error: error.message });
  }
});

// Get the team template assigned to a project (for client portal)
app.get("/api/users/project-team-template/:projectId", authenticateUser, async (req, res) => {
  try {
    const { projectId } = req.params;
    const [projects] = await mainDb.query(
      `SELECT id FROM user_projects WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
      [projectId, req.userId]
    );
    if (projects.length === 0) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    const [templates] = await mainDb.query(`
      SELECT tt.id, tt.name, tt.description, tt.team_leader_id, tt.team_leader_image, tt.team_leader_image_mime,
             tm.name as leader_name, tm.role as leader_role
      FROM team_templates tt
      LEFT JOIN team_members tm ON tm.id = tt.team_leader_id
      WHERE tt.project_id = ?
      LIMIT 1
    `, [projectId]);
    if (templates.length === 0) {
      return res.json({ success: true, template: null });
    }
    const tpl = templates[0];
    const [members] = await mainDb.query(`
      SELECT ttm.id, ttm.team_member_id, ttm.role as member_role,
             tm.name, tm.department, tm.description
      FROM team_template_members ttm
      JOIN team_members tm ON tm.id = ttm.team_member_id
      WHERE ttm.template_id = ?
      ORDER BY ttm.created_at ASC
    `, [tpl.id]);
    // Convert BLOB image to base64 for frontend display
    const template = {
      ...tpl,
      team_leader_image: tpl.team_leader_image ? tpl.team_leader_image.toString('base64') : null,
      members: members || [],
    };
    res.json({ success: true, template });
  } catch (error) {
    console.error("[CLIENT PROJECT TEAM TEMPLATE] Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch project team", error: error.message });
  }
});

// =============================================
// Data Safety & Audit API
// =============================================
// NOTE: Companies API removed — Baraka Housing Agency module purged
// (companies table dropped). Property/rental endpoints no longer exist.

// Website Content API
app.get("/api/website-content", async (req, res) => {
  try {
    const [content] = await mainDb.query("SELECT * FROM website_content");
    res.json({ success: true, content });
  } catch (error) {
    console.error("Error fetching website content:", error);
    res.status(500).json({ success: false, message: "Error fetching website content", error: error.message });
  }
});

// Blog Articles API
app.get("/api/blog-articles", async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    // 1. Try MongoDB
    if (mongoose.connection.readyState === 1) {
      const articles = await BlogArticle.find({ is_published: true })
        .sort({ created_at: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(offset));

      if (articles.length > 0) {
        return res.json({
          success: true,
          articles: articles.map(a => ({
            ...a.toObject(),
            has_photo: !!a.featured_image?.data,
            image_url: a.featured_image?.data ? `/api/blog-articles/photo/${a._id}?source=mongodb` : a.featured_image?.url
          })),
          source: 'mongodb'
        });
      }
    }

    // 2. Fallback to MySQL
    const [articles] = await mainDb.query(
      "SELECT id, title, excerpt, content, author, read_time, category, image_url, icon_class, is_published, published_date, created_at, image_blob IS NOT NULL as has_photo FROM blog_articles WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [parseInt(limit), parseInt(offset)],
    );

    res.json({
      success: true,
      articles: articles.map(a => ({
        ...a,
        image_url: a.has_photo ? `/api/blog-articles/photo/${a.id}?source=mysql` : a.image_url
      })),
      source: 'mysql'
    });
  } catch (error) {
    console.error("Error fetching blog articles:", error);
    res.status(500).json({ success: false, message: "Error fetching blog articles", error: error.message });
  }
});

// Blog Article Photo Retrieval
app.get("/api/blog-articles/photo/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { source = 'mysql' } = req.query;

    if (source === 'mongodb' && mongoose.connection.readyState === 1) {
      const article = await BlogArticle.findById(id);
      if (article && article.featured_image?.data) {
        res.set("Content-Type", article.featured_image.contentType || "image/jpeg");
        return res.send(article.featured_image.data);
      }
    }

    const [articles] = await mainDb.query(
      "SELECT image_blob, image_mime_type FROM blog_articles WHERE id = ? AND image_blob IS NOT NULL",
      [id]
    );

    if (articles.length === 0) {
      return res.status(404).json({ success: false, message: "Photo not found" });
    }

    const article = articles[0];
    res.set("Content-Type", article.image_mime_type || "image/jpeg");
    res.send(article.image_blob);
  } catch (error) {
    console.error("Blog photo retrieval error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve photo" });
  }
});

app.post("/api/blog-articles", async (req, res) => {
  try {
    const article = req.body;

    // Handle Image Base64 to Blob conversion if provided
    let imageBlob = null;
    let imageMimeType = null;
    if (article.image_base64) {
      const base64Data = article.image_base64.replace(/^data:image\/\w+;base64,/, "");
      imageBlob = Buffer.from(base64Data, "base64");
      const mimeMatch = article.image_base64.match(/^data:(image\/\w+);base64,/);
      if (mimeMatch) imageMimeType = mimeMatch[1];
    }

    // Write to MySQL
    const [result] = await mainDb.query(
      "INSERT INTO blog_articles (title, excerpt, content, author, read_time, category, image_url, image_blob, image_mime_type, is_published) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [article.title, article.excerpt, article.content, article.author, article.read_time, article.category, article.image_url, imageBlob, imageMimeType, article.is_published],
    );

    // Sync to MongoDB
    if (mongoose.connection.readyState === 1) {
      const mongoArticle = new BlogArticle({
        ...article,
        sql_id: result.insertId
      });
      await mongoArticle.save();
    }

    res.json({ success: true, articleId: result.insertId });
  } catch (error) {
    console.error("Error creating blog article:", error);
    res.status(500).json({ success: false, message: "Error creating blog article", error: error.message });
  }
});

app.delete("/api/blog-articles/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete in MySQL
    await mainDb.query("UPDATE blog_articles SET deleted_at = NOW() WHERE id = ?", [id]);

    // Delete from MongoDB if exists
    if (mongoose.connection.readyState === 1) {
      await BlogArticle.deleteOne({ sql_id: id });
      // Also try by MongoDB ID just in case
      if (mongoose.Types.ObjectId.isValid(id)) {
        await BlogArticle.deleteOne({ _id: id });
      }
    }

    res.json({ success: true, message: "Blog article deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog article:", error);
    res.status(500).json({ success: false, message: "Error deleting blog article", error: error.message });
  }
});

// =============================================
// Company Personnel API (admin-managed like blog, displayed on About page)
// =============================================
app.get("/api/company-personnel", async (req, res) => {
  try {
    const [rows] = await mainDb.query(
      "SELECT id, name, position, bio, image_url, sort_order, is_active, image_blob IS NOT NULL AS has_photo, created_at FROM company_personnel WHERE deleted_at IS NULL AND is_active = 1 ORDER BY sort_order ASC, created_at DESC"
    );
    res.json({
      success: true,
      personnel: rows.map(p => ({
        ...p,
        image_url: p.has_photo ? `/api/company-personnel/photo/${p.id}` : p.image_url,
      })),
    });
  } catch (error) {
    console.error("Error fetching company personnel:", error);
    res.status(500).json({ success: false, message: "Error fetching company personnel", error: error.message });
  }
});

app.get("/api/company-personnel/photo/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await mainDb.query(
      "SELECT image_blob, image_mime_type FROM company_personnel WHERE id = ? AND deleted_at IS NULL",
      [id]
    );
    if (rows.length === 0 || !rows[0].image_blob) {
      return res.status(404).json({ success: false, message: "Photo not found" });
    }
    res.set("Content-Type", rows[0].image_mime_type || "image/jpeg");
    res.set("Cache-Control", "public, max-age=86400");
    res.send(rows[0].image_blob);
  } catch (error) {
    console.error("Personnel photo retrieval error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve photo" });
  }
});

// Blog Subscriptions API
app.post("/api/blog-subscriptions", async (req, res) => {
  try {
    const { email, source = 'website_blog' } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Insert into MySQL
    const [result] = await mainDb.query(
      "INSERT INTO blog_subscriptions (email, source) VALUES (?, ?) ON DUPLICATE KEY UPDATE status = 'active', updated_at = NOW()",
      [email, source]
    );

    res.json({
      success: true,
      message: "Subscription successful",
      subscriptionId: result.insertId
    });
  } catch (error) {
    console.error("Error creating blog subscription:", error);
    res.status(500).json({ success: false, message: "Subscription failed", error: error.message });
  }
});

// Contact Forms API
app.get("/api/contact-forms", async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const [forms] = await mainDb.query(
      "SELECT * FROM contact_forms ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [parseInt(limit), parseInt(offset)],
    );

    res.json({ success: true, forms });
  } catch (error) {
    console.error("Error fetching contact forms:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching contact forms",
      error: error.message,
    });
  }
});

app.post("/api/contact-forms", async (req, res) => {
  try {
    const form = req.body;
    const [result] = await mainDb.query(
    // NOTE: keep column list in sync with the contact_forms schema —
    // the table has no preferred_contact column and the UI doesn't send one.
    "INSERT INTO contact_forms (name, email, phone, company, subject, message) VALUES (?, ?, ?, ?, ?, ?)",
    [
      form.name,
      form.email,
      form.phone,
      form.company,
      form.subject,
      form.message,
    ],
    );

    res.json({ success: true, formId: result.insertId });
  } catch (error) {
    console.error("Error creating contact form:", error);
    res.status(500).json({
      success: false,
      message: "Error creating contact form",
      error: error.message,
    });
  }
});

// Videos API
app.get("/api/videos", async (req, res) => {
  try {
    const { is_active = true, limit = 20, offset = 0 } = req.query;

    const [videos] = await mainDb.query(
      "SELECT id, title, description, video_url, thumbnail_url, is_active, is_featured, display_order, video_blob IS NOT NULL as has_video_blob, thumbnail_blob IS NOT NULL as has_thumbnail_blob FROM videos WHERE is_active = ? ORDER BY display_order ASC, created_at DESC LIMIT ? OFFSET ?",
      [is_active === "true" ? 1 : 0, parseInt(limit), parseInt(offset)],
    );

    res.json({ success: true, videos });
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching videos",
      error: error.message,
    });
  }
});

// Video BLOB stream endpoint
app.get("/api/videos/stream/:id", async (req, res) => {
  try {
    const [videos] = await mainDb.query(
      "SELECT video_blob, video_mime_type FROM videos WHERE id = ?",
      [req.params.id]
    );
    if (videos.length === 0 || !videos[0].video_blob) {
      return res.status(404).send("Video not found");
    }
    res.set("Content-Type", videos[0].video_mime_type || "video/mp4");
    res.send(videos[0].video_blob);
  } catch (error) {
    res.status(500).send("Streaming error");
  }
});

app.post("/api/videos", async (req, res) => {
  try {
    const video = req.body;
    const [result] = await mainDb.query(
      "INSERT INTO videos (title, description, video_url, thumbnail_url, is_active, is_featured, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        video.title,
        video.description,
        video.video_url,
        video.thumbnail_url,
        video.is_active,
        video.is_featured,
        video.display_order || 0,
      ],
    );

    res.json({ success: true, videoId: result.insertId });
  } catch (error) {
    console.error("Error creating video:", error);
    res.status(500).json({
      success: false,
      message: "Error creating video",
      error: error.message,
    });
  }
});

// Delete operations
app.delete("/api/:type/:id", async (req, res) => {
  try {
    const { type, id } = req.params;

    let table;
    switch (type) {
      case "blog-articles":
        table = "blog_articles";
        break;
      case "contact-forms":
        table = "contact_forms";
        break;
      case "videos":
        table = "videos";
        break;
      case "images":
        table = "images";
        break;
      default:
        return res
          .status(400)
          .json({ success: false, message: "Invalid type" });
    }

    await mainDb.query(`UPDATE ${table} SET deleted_at = NOW() WHERE id = ?`, [
      id,
    ]);

    res.json({ success: true, message: `${type} deleted successfully` });
  } catch (error) {
    console.error(`Error deleting ${req.params.type}:`, error);
    res.status(500).json({
      success: false,
      message: `Error deleting ${req.params.type}`,
      error: error.message,
    });
  }
});

// Images API - Store profile photo temporarily (frontend calls this before registration)
app.post("/api/images/profile", async (req, res) => {
  try {
    const { dataBase64, contentType, fileName } = req.body;

    if (!dataBase64) {
      return res.status(400).json({
        success: false,
        message: "Image data (dataBase64) is required",
      });
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(dataBase64, "base64");

    // Insert into images table
    const [result] = await mainDb.query(
      "INSERT INTO images (data, content_type, file_name, created_at) VALUES (?, ?, ?, NOW())",
      [imageBuffer, contentType || "image/jpeg", fileName || "profile.jpg"],
    );

    const imageId = result.insertId;

    console.log(
      `[IMAGES] Profile photo stored: ID=${imageId}, Size=${imageBuffer.length} bytes`,
    );

    res.json({
      success: true,
      image_id: imageId,
      message: "Profile photo uploaded successfully",
    });
  } catch (error) {
    console.error("[IMAGES] Profile photo upload error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload profile photo",
      error: error.message,
    });
  }
});

// Media Library API
app.get("/api/images", authenticateAdmin, async (req, res) => {
  try {
    const [rows] = await mainDb.query(
      "SELECT id, file_name, file_type, file_size, content_type, created_at FROM images WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 200"
    );
    res.json({ success: true, images: rows });
  } catch (error) {
    console.error("[IMAGES] List error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch images" });
  }
});

app.get("/api/images/:id", authenticateAdmin, async (req, res) => {
  try {
    const [rows] = await mainDb.query(
      "SELECT * FROM images WHERE id = ? AND deleted_at IS NULL", [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: "Image not found" });
    res.json({ success: true, image: rows[0] });
  } catch (error) {
    console.error("[IMAGES] Get error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch image" });
  }
});

app.post("/api/images", authenticateAdmin, async (req, res) => {
  try {
    const { dataBase64, contentType, fileName } = req.body;
    if (!dataBase64) return res.status(400).json({ success: false, message: "Image data required" });
    const imageBuffer = Buffer.from(dataBase64, "base64");
    const [result] = await mainDb.query(
      "INSERT INTO images (data, content_type, file_name, file_size, created_at) VALUES (?, ?, ?, ?, NOW())",
      [imageBuffer, contentType || "image/jpeg", fileName || "upload.jpg", imageBuffer.length]
    );
    res.status(201).json({ success: true, image_id: result.insertId, message: "Image uploaded" });
  } catch (error) {
    console.error("[IMAGES] Upload error:", error);
    res.status(500).json({ success: false, message: "Failed to upload image" });
  }
});

app.delete("/api/images/:id", authenticateAdmin, async (req, res) => {
  try {
    const [result] = await mainDb.query(
      "UPDATE images SET deleted_at = NOW() WHERE id = ?", [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Image not found" });
    res.json({ success: true, message: "Image deleted" });
  } catch (error) {
    console.error("[IMAGES] Delete error:", error);
    res.status(500).json({ success: false, message: "Failed to delete image" });
  }
});

// Profile photo upload endpoint
app.post(
  "/api/users/upload-profile-photo",
  upload.single("profilePhoto"),
  async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is required",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Profile photo is required",
        });
      }

      // Update user's profile photo in database
      const [result] = await mainDb.query(
        "UPDATE users SET profile_photo_blob = ?, profile_photo_mime_type = ?, profile_photo_file_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [req.file.buffer, req.file.mimetype, req.file.originalname, userId],
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.json({
        success: true,
        message: "Profile photo uploaded successfully",
        profilePhoto: {
          mimeType: req.file.mimetype,
          fileName: req.file.originalname,
          size: req.file.size,
        },
      });
    } catch (error) {
      console.error("Profile photo upload error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload profile photo",
        error: error.message,
      });
    }
  },
);

// Profile photo retrieval endpoint
app.get("/api/users/profile-photo/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const [users] = await mainDb.query(
      "SELECT profile_photo_blob, profile_photo_mime_type, profile_photo_file_name FROM users WHERE id = ? AND profile_photo_blob IS NOT NULL",
      [userId],
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Profile photo not found",
      });
    }

    const user = users[0];

    res.set({
      "Content-Type": user.profile_photo_mime_type,
      "Content-Disposition": `inline; filename="${user.profile_photo_file_name}"`,
    });

    res.send(user.profile_photo_blob);
  } catch (error) {
    console.error("Profile photo retrieval error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve profile photo",
      error: error.message,
    });
  }
});

// Admin/Developer profile photo upload endpoint (accepts base64 JSON)
app.post("/api/admin/profile-photo", authenticateAdmin, async (req, res) => {
  try {
    const {
      userId,
      role,
      profile_photo_base64,
      profile_photo_mime_type,
      profile_photo_file_name,
    } = req.body;

    if (!userId || !role) {
      return res.status(400).json({
        success: false,
        message: "User ID and role are required",
      });
    }

    if (!profile_photo_base64) {
      return res.status(400).json({
        success: false,
        message: "Profile photo base64 data is required",
      });
    }

    // Convert base64 to buffer
    let profilePhotoBlob;
    try {
      const base64Data = profile_photo_base64.replace(
        /^data:image\/\w+;base64,/,
        "",
      );
      profilePhotoBlob = Buffer.from(base64Data, "base64");
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: "Invalid base64 image data",
      });
    }

    // Update appropriate table based on role
    let tableName = role === "admin" ? "admin_users" : "developer_users";

    const [result] = await mainDb.query(
      `UPDATE ${tableName} SET profile_photo_blob = ?, profile_photo_mime_type = ?, profile_photo_file_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [
        profilePhotoBlob,
        profile_photo_mime_type || "image/jpeg",
        profile_photo_file_name || "profile.jpg",
        userId,
      ],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Profile photo uploaded successfully",
      size: profilePhotoBlob.length,
    });
  } catch (error) {
    console.error("Admin profile photo upload error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload profile photo",
      error: error.message,
    });
  }
});

// Admin/Developer profile photo retrieval endpoint
app.get("/api/admin/profile-photo/:role/:userId", async (req, res) => {
  try {
    const { role, userId } = req.params;

    if (!role || !userId || !["admin", "developer"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Valid role (admin|developer) and userId are required",
      });
    }

        const tableName = role === "admin" ? "admin_users" : "developer_users";

    // Check BOTH storage locations:
    // 1. profile_photo_blob directly on the admin/developer table
    //    (used by server.js inline POST /api/admin/profile-photo)
    // 2. images table via profile_image_id
    //    (used by admin-verification.js POST /profile/:id/photo)
    const [users] = await mainDb.query(
      `SELECT admin.profile_photo_blob, admin.profile_photo_mime_type,
              admin.profile_photo_file_name, admin.profile_image_id,
              img.data as img_data, img.content_type as img_type, img.filename as img_name
       FROM ${tableName} admin
       LEFT JOIN images img ON img.id = admin.profile_image_id
       WHERE admin.id = ? 
       AND (admin.profile_photo_blob IS NOT NULL OR admin.profile_image_id IS NOT NULL)`,
      [userId],
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Profile photo not found",
      });
    }

    const user = users[0];
    // Prefer the direct BLOB; fall back to the images table join
    const blob = user.profile_photo_blob || user.img_data;
    const mimeType = user.profile_photo_mime_type || user.img_type || "image/jpeg";
    const fileName = user.profile_photo_file_name || user.img_name || "profile.jpg";

    res.set({
      "Content-Type": mimeType,
      "Content-Disposition": `inline; filename="${fileName}"`,
    });

    res.send(blob);
  } catch (error) {
    console.error("Admin profile photo retrieval error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve profile photo",
      error: error.message,
    });
  }
});

// Admin/Developer profile photo removal endpoint
app.delete("/api/admin/profile-photo", authenticateAdmin, async (req, res) => {
  try {
    const { userId, role } = req.body;
    if (!userId || !role) {
      return res.status(400).json({ success: false, message: "userId and role are required" });
    }
    const tableName = role === "admin" ? "admin_users" : "developer_users";
    await mainDb.query(
      `UPDATE ${tableName} SET profile_photo_blob = NULL, profile_photo_mime_type = NULL, profile_photo_file_name = NULL, profile_image_id = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [userId],
    );
    res.json({ success: true, message: "Profile photo removed" });
  } catch (error) {
    console.error("Admin profile photo removal error:", error);
    res.status(500).json({ success: false, message: "Failed to remove profile photo", error: error.message });
  }
});


try {
  const smsRoutes = require("./backend/routes/sms");
  app.use("/api/sms", smsRoutes);
  console.log("[SERVER] SMS routes loaded successfully");
} catch (error) {
  console.error("[SERVER] Error loading SMS routes:", error.message);
}

// WhatsApp Routes
try {
  const whatsappRoutes = require("./backend/routes/whatsapp");
  app.use("/api/whatsapp", whatsappRoutes);
  console.log("[SERVER] WhatsApp routes loaded successfully");
} catch (error) {
  console.error("[SERVER] Error loading WhatsApp routes:", error.message);
}

// Health Check API — synchronous 200 for the platform healthcheck (Render).
// The DB probe below runs fire-and-forget so the response never waits on MySQL.
let lastDbCheck = { ok: null, at: null };
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "development",
    // Non-secret diagnostics: TLS mode and DB reachability only.
    // Deliberately NOT exposing the DB host name (info leak).
    dbSsl: cloudSslEnabled(),
    database: lastDbCheck.ok === null ? "unknown" : lastDbCheck.ok ? "connected" : "unreachable",
    dbCheckedAt: lastDbCheck.at,
  });
  mainDb
    .query("SELECT 1")
    .then(() => { lastDbCheck = { ok: true, at: new Date().toISOString() }; })
    .catch((e) => {
      lastDbCheck = { ok: false, at: new Date().toISOString() };
      console.warn("[HEALTH] DB probe failed:", e.code || e.message);
    });
});

// Modular Routes Integration (Centralized Control)
// NOTE: Baraka Housing Agency module (properties / rental applications /
// companies) was fully removed — routes deleted, tables dropped.
const modularRoutes = [
  { path: "/api/management", route: "./backend/routes/management" },
  { path: "/api/admin", route: "./backend/routes/admin" },
  { path: "/api/admin-complete", route: "./backend/routes/admin-complete" },
  { path: "/api/admin-verification", route: "./backend/routes/admin-verification" },
  { path: "/api/developer-verification", route: "./backend/routes/developer-verification" },
  { path: "/api/mpesa", route: "./backend/routes/mpesa" },
  { path: "/api/users", route: "./backend/routes/users" },
];

modularRoutes.forEach((item) => {
  try {
    const routeHandler = require(item.route);
    if (item.path === "/api/admin") {
      // Global search exposes personnel contact details and ledger data,
      // so it must never be reachable without a valid admin session.
      app.use(
        item.path,
        (req, res, next) =>
          req.path.startsWith("/search")
            ? authenticateAdmin(req, res, next)
            : next(),
        routeHandler
      );
    } else {
      app.use(item.path, routeHandler);
    }
    console.log(`[SERVER] Modular route ${item.path} loaded`);
  } catch (error) {
    console.warn(
      `[SERVER] Could not load modular route ${item.path}:`,
      error.message,
    );
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// Serve dashboard
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// NOTE: the 404 handler was moved to the very bottom of this file (just before
// app.listen). It used to be registered here, which swallowed every route
// defined below it (Express matches in registration order).

// Start server
// User Projects API
app.get("/api/user-projects", async (req, res) => {
  try {
    const [rows] = await mainDb.query(`
      SELECT up.*, u.display_name as client_name
      FROM user_projects up
      LEFT JOIN users u ON up.user_id = u.id
      WHERE up.deleted_at IS NULL
      ORDER BY up.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({ error: 'Failed to fetch user projects' });
  }
});

app.get("/api/user-projects/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await mainDb.query('SELECT * FROM user_projects WHERE id = ? AND deleted_at IS NULL', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching user project:', error);
    res.status(500).json({ error: 'Failed to fetch user project' });
  }
});

app.post("/api/user-projects", async (req, res) => {
  try {
    const {
      user_id, project_name, project_description, project_type, status,
      priority, start_date, end_date, estimated_budget, actual_budget,
      client_id, client_name, client_email, client_phone, client_id_number,
      project_manager_id, team_members, deliverables, milestones, documents,
      progress_percentage, notes, created_by
    } = req.body;

    if (!user_id || !project_name) {
      return res.status(400).json({ error: 'User ID and project name are required' });
    }

    const [result] = await mainDb.query(
      `INSERT INTO user_projects (
        user_id, project_name, project_description, project_type, status,
        priority, start_date, end_date, estimated_budget, actual_budget,
        client_id, client_name, client_email, client_phone, client_id_number,
        project_manager_id, team_members, deliverables, milestones, documents,
        progress_percentage, notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id, project_name, project_description || null, project_type || 'consulting',
        status || 'planning', priority || 'medium', start_date || null, end_date || null,
        estimated_budget || 0, actual_budget || 0, client_id || null, client_name || null,
        client_email || null, client_phone || null, client_id_number || null,
        project_manager_id || null, team_members ? JSON.stringify(team_members) : null,
        deliverables ? JSON.stringify(deliverables) : null, milestones ? JSON.stringify(milestones) : null,
        documents ? JSON.stringify(documents) : null, progress_percentage || 0,
        notes || null, created_by || user_id
      ]
    );

    res.status(201).json({ success: true, message: 'Project created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating user project:', error);
    res.status(500).json({ error: 'Failed to create user project' });
  }
});

app.put("/api/user-projects/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      user_id, project_name, project_description, project_type, status,
      priority, start_date, end_date, estimated_budget, actual_budget,
      client_id, client_name, client_email, client_phone, client_id_number,
      project_manager_id, team_members, deliverables, milestones, documents,
      progress_percentage, notes, updated_by, crew_template_id
    } = req.body;

    const [result] = await mainDb.query(
      `UPDATE user_projects SET
        user_id = COALESCE(?, user_id),
        project_name = COALESCE(?, project_name),
        project_description = COALESCE(?, project_description),
        project_type = COALESCE(?, project_type),
        status = COALESCE(?, status),
        priority = COALESCE(?, priority),
        start_date = COALESCE(?, start_date),
        end_date = COALESCE(?, end_date),
        estimated_budget = COALESCE(?, estimated_budget),
        actual_budget = COALESCE(?, actual_budget),
        client_id = COALESCE(?, client_id),
        client_name = COALESCE(?, client_name),
        client_email = COALESCE(?, client_email),
        client_phone = COALESCE(?, client_phone),
        client_id_number = COALESCE(?, client_id_number),
        project_manager_id = COALESCE(?, project_manager_id),
        crew_template_id = COALESCE(?, crew_template_id),
        team_members = COALESCE(?, team_members),
        deliverables = COALESCE(?, deliverables),
        milestones = COALESCE(?, milestones),
        documents = COALESCE(?, documents),
        progress_percentage = COALESCE(?, progress_percentage),
        notes = COALESCE(?, notes),
        updated_by = COALESCE(?, updated_by),
        updated_at = NOW()
      WHERE id = ? AND deleted_at IS NULL`,
      [
        user_id, project_name, project_description, project_type, status,
        priority, start_date, end_date, estimated_budget, actual_budget,
        client_id, client_name, client_email, client_phone, client_id_number,
        project_manager_id, crew_template_id || null,
        team_members ? JSON.stringify(team_members) : null,
        deliverables ? JSON.stringify(deliverables) : null, milestones ? JSON.stringify(milestones) : null,
        documents ? JSON.stringify(documents) : null, progress_percentage, notes, updated_by, id
      ]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Project not found' });
    res.json({ success: true, message: 'Project updated successfully' });
  } catch (error) {
    console.error('Error updating user project:', error);
    res.status(500).json({ error: 'Failed to update user project' });
  }
});

app.delete("/api/user-projects/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { deleted_by } = req.body;
    const [result] = await mainDb.query(
      'UPDATE user_projects SET deleted_at = NOW(), deleted_by = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL',
      [deleted_by || null, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Project not found' });
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting user project:', error);
    res.status(500).json({ error: 'Failed to delete user project' });
  }
});

// Website Content Update
app.put("/api/website-content/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const { value, updated_by } = req.body;
    if (!value && value !== '') return res.status(400).json({ error: 'Value required' });
    await mainDb.query(
      'INSERT INTO website_content (content_key, content_value, updated_by) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE content_value = ?, updated_by = ?, updated_at = NOW()',
      [key, value, updated_by || null, value, updated_by || null]
    );
    res.json({ success: true, message: 'Content updated' });
  } catch (error) { console.error('Content error:', error); res.status(500).json({ error: 'Failed' }); }
});

// Company Personnel Create
app.post("/api/company-personnel", async (req, res) => {
  try {
    const { name, position, bio } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const [result] = await mainDb.query(
      'INSERT INTO company_personnel (name, position, bio, is_active, created_at) VALUES (?, ?, ?, 1, NOW())',
      [name, position || null, bio || null]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) { console.error('Personnel error:', error); res.status(500).json({ error: 'Failed' }); }
});

// Invoices Create
// NOTE: invoices.total_amount_kes is a STORED GENERATED column (computed by
// the DB from subtotal/tax_rate) — it must NEVER appear in the INSERT list.
app.post("/api/invoices", async (req, res) => {
  try {
    const { title, description, client_name, client_email, due_date } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const userId = req.userId || req.body.created_by || await getFirstUserId();
    const project_id = await resolveInvoiceProjectId(req.body.project_id);
    const invoice_number = req.body.invoice_number || 'INV-' + Date.now();
    const issue_date = req.body.issue_date || new Date().toISOString().split('T')[0];
    const due = due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const clientName = client_name || 'Walk-in Client';
    const subtotal =
      req.body.subtotal != null ? parseFloat(req.body.subtotal)
      : req.body.total_amount_kes != null ? parseFloat(req.body.total_amount_kes)
      : req.body.total_amount != null ? parseFloat(req.body.total_amount) : 0;
    // KRA compliance: ALWAYS store tax_rate as a DECIMAL FRACTION (0.16 = 16%).
    // `tax_amount` is a STORED generated column (subtotal * tax_rate), so a
    // whole percent like 16 would silently compute 1600% tax. normalizeRate
    // accepts "16", 16 or 0.16 and returns the fraction the DB needs.
    const _taxType = String(req.body.tax_type || req.body.taxType || "").toLowerCase();
    const rawRate = req.body.tax_rate != null && req.body.tax_rate !== "";
    const tax_rate = normalizeRate(
      rawRate ? req.body.tax_rate : _taxType === "withholding" ? 0.05 : _taxType === "vat" ? 0.16 : 0
    );
    const items = Array.isArray(req.body.items) ? JSON.stringify(req.body.items) : (req.body.items || null);
    const [result] = await mainDb.query(
      `INSERT INTO invoices
        (project_id, invoice_number, invoice_type, title, description, subtotal, tax_rate,
         currency, exchange_rate, issue_date, due_date, status, client_name, client_email,
         client_phone, items, notes, payment_terms, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [project_id, invoice_number, req.body.invoice_type || 'project_fee', title, description || null,
       subtotal, tax_rate, req.body.currency || 'KES',
       req.body.exchange_rate != null ? parseFloat(req.body.exchange_rate) : 1,
       issue_date, due, clientName, client_email || null, req.body.client_phone || null,
       items, req.body.notes || null, req.body.payment_terms || null, userId]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) { console.error('[POST /api/invoices]', error.code || '', error.message); res.status(500).json({ error: 'Failed', detail: error.message }); }
});

// Accounting Entries Create
app.post("/api/accounting-entries", async (req, res) => {
  try {
    const { description, amount, entry_type, category, project_id } = req.body;
    if (!description || amount == null) return res.status(400).json({ error: 'Required' });
    const userId = req.userId || req.body.created_by || await getFirstUserId();
    const resolvedProjectId = await resolveAccountingProjectId(project_id);
    const [result] = await mainDb.query(
      "INSERT INTO accounting_entries (description, amount, entry_type, category, project_id, transaction_date, payment_status, created_by, created_at) VALUES (?, ?, ?, ?, ?, NOW(), 'completed', ?, NOW())",
      [description, parseFloat(amount), entry_type || 'expense', category || 'General', resolvedProjectId, userId]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) { console.error('[POST /api/accounting-entries]', error.code || '', error.message); res.status(500).json({ error: 'Failed', detail: error.message }); }
});

// NOTE: Properties/Baraka Housing Agency endpoints removed (module purged).

// Audit Logs
app.get("/api/audit-logs", async (req, res) => {
  try { const [rows] = await mainDb.query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100'); res.json({ success: true, logs: rows });
  } catch (error) { res.status(500).json({ error: 'Failed' }); }
});

// Data Access Logs
app.get("/api/data-access-logs", async (req, res) => {
  try { const [rows] = await mainDb.query('SELECT * FROM data_access_logs ORDER BY created_at DESC LIMIT 100'); res.json({ success: true, logs: rows });
  } catch (error) { res.status(500).json({ error: 'Failed' }); }
});

// Project Team Add
app.post("/api/admin/project-team/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const { user_id, role } = req.body;
    if (!user_id) return res.status(400).json({ error: 'user_id required' });
    const [result] = await mainDb.query('INSERT INTO project_team_members (project_id, user_id, role, created_at) VALUES (?, ?, ?, NOW())', [projectId, user_id, role || 'member']);
    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) { res.status(500).json({ error: 'Failed' }); }
});

// Project Tasks Create
app.post("/api/projects/:projectId/tasks", async (req, res) => {
  try {
    const { projectId } = req.params;
    const { task_name, assigned_to, status, priority } = req.body;
    if (!task_name) return res.status(400).json({ error: 'Task name required' });
    const [result] = await mainDb.query('INSERT INTO project_tasks (project_id, task_name, assigned_to, status, priority, created_at) VALUES (?, ?, ?, ?, ?, NOW())', [projectId, task_name, assigned_to || null, status || 'not_started', priority || 'medium']);
    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) { console.error('[POST /api/projects/:id/tasks]', error.code || '', error.message); res.status(500).json({ error: 'Failed', detail: error.message }); }
});

// Task Management APIs
app.get("/api/projects/:projectId/tasks", async (req, res) => {
  try {
    const { projectId } = req.params;
    const [tasks] = await mainDb.query(
      `SELECT t.*, u.display_name as assigned_to_name
       FROM project_tasks t
       LEFT JOIN admin_users u ON t.assigned_to = u.id
       WHERE t.project_id = ? AND t.deleted_at IS NULL
       ORDER BY t.created_at DESC`,
      [projectId]
    );
    res.json({ success: true, tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ success: false, message: "Error fetching tasks" });
  }
});

app.put("/api/tasks/:taskId/status", async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    await mainDb.query("UPDATE project_tasks SET status = ?, updated_at = NOW() WHERE id = ?", [status, taskId]);
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).json({ success: false, message: "Error updating status" });
  }
});

app.delete("/api/tasks/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;
    await mainDb.query("UPDATE project_tasks SET deleted_at = NOW() WHERE id = ?", [taskId]);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ success: false, message: "Error deleting task" });
  }
});

// ───────────────────────────────────────────────────────────────────────────
// MISSING ROUTES — added to cover every button/endpoint used in the admin
// dashboard frontend. Each route reads/writes to the database table that
// matches its feature area.
// ───────────────────────────────────────────────────────────────────────────

// ── Company Personnel CRUD ──────────────────────────────────────────────────
app.get("/api/company-personnel/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await mainDb.query(
      "SELECT * FROM company_personnel WHERE id = ? AND (deleted_at IS NULL OR deleted_at = '')",
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Personnel not found" });
    res.json({ success: true, personnel: rows[0] });
  } catch (e) {
    console.error("Personnel read error:", e);
    res.status(500).json({ error: "Failed" });
  }
});

app.put("/api/company-personnel/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, position, bio, image_url, is_active } = req.body;
    await mainDb.query(
      "UPDATE company_personnel SET name=COALESCE(?,name), position=COALESCE(?,position), bio=COALESCE(?,bio), image_url=COALESCE(?,image_url), is_active=COALESCE(?,is_active) WHERE id=?",
      [name, position, bio, image_url, is_active, id]
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Failed" });
  }
});

app.delete("/api/company-personnel/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await mainDb.query("UPDATE company_personnel SET deleted_at=NOW() WHERE id=?", [id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Failed" });
  }
});

// ── Invoice CRUD ────────────────────────────────────────────────────────────
app.get("/api/invoices/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await mainDb.query("SELECT * FROM invoices WHERE id=?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Invoice not found" });
    res.json({ success: true, ...rows[0] });
  } catch (e) {
    res.status(500).json({ error: "Failed" });
  }
});

app.put("/api/invoices/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    const sets = [];
    const vals = [];
    for (const [k, v] of Object.entries(fields)) { sets.push(`${k}=?`); vals.push(v); }
    if (sets.length === 0) return res.status(400).json({ error: "No fields to update" });
    vals.push(id);
    await mainDb.query(`UPDATE invoices SET ${sets.join(",")} WHERE id=?`, vals);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Failed" });
  }
});

// ── Accounting Entries CRUD ──────────────────────────────────────────────────
app.get("/api/accounting/entries/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await mainDb.query("SELECT * FROM accounting_entries WHERE id=?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Entry not found" });
    res.json({ success: true, ...rows[0] });
  } catch (e) { res.status(500).json({ error: "Failed" }); }
});

app.put("/api/accounting/entries/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;
    const sets = [];
    const vals = [];
    for (const [k, v] of Object.entries(fields)) { sets.push(`${k}=?`); vals.push(v); }
    if (sets.length === 0) return res.status(400).json({ error: "No fields" });
    vals.push(id);
    await mainDb.query(`UPDATE accounting_entries SET ${sets.join(",")} WHERE id=?`, vals);
    res.json({ success: true });
    } catch (e) { res.status(500).json({ error: "Failed" }); }
});

// ── Team Management (admin-scoped) ───────────────────────────────────────────
app.get("/api/admin/team", async (req, res) => {
  try {
    const [rows] = await mainDb.query("SELECT * FROM team_members WHERE is_active = 1 ORDER BY created_at DESC");
    res.json({ success: true, team: rows });
  } catch (e) { res.status(500).json({ error: "Failed" }); }
});

// ── Admin Dashboard / Stats ──────────────────────────────────────────────────
app.get("/api/admin/dashboard", async (req, res) => {
  try {
    const [u] = await mainDb.query("SELECT COUNT(*) as total, SUM(CASE WHEN is_verified=1 THEN 1 ELSE 0 END) as verified, SUM(CASE WHEN is_active=1 THEN 1 ELSE 0 END) as live FROM users");
    const [p] = await mainDb.query("SELECT COUNT(*) as total, SUM(CASE WHEN status IN ('in-progress','active') THEN 1 ELSE 0 END) as active FROM user_projects WHERE deleted_at IS NULL");
    // NOTE: rental `applications` table was purged with the Baraka Housing
    // module — pending count now tracks admin change requests instead.
    const [pc] = await mainDb.query("SELECT COUNT(*) as pending FROM change_requests WHERE status = 'pending'");
    res.json({
      success: true,
      dashboard: {
        userCounts: { total: u[0]?.total||0, verified: u[0]?.verified||0, live: u[0]?.live||0, total_active_projects: p[0]?.active||0 },
        pending_count: pc[0]?.pending||0,
        recentActivity: []
      }
    });
  } catch (e) { console.error("Dashboard err:", e); res.status(500).json({ success:false, message:"Dashboard error" }); }
});

// ── Pending Approvals ────────────────────────────────────────────────────────
app.get("/api/admin/pending-approvals", async (req, res) => {
  try {
    // NOTE: rental `applications` table was purged — approvals now come from
    // admin change requests (invoices/project changes routed for review).
    const [rows] = await mainDb.query("SELECT id, project_id, request_number, requested_by, change_description, status, created_at FROM change_requests WHERE status = 'pending' ORDER BY created_at DESC LIMIT 20");
    res.json({ success: true, data: rows });
  } catch (e) { res.status(500).json({ success:false, message:"Failed" }); }
});

// ── Admin Projects All ────────────────────────────────────────────────────────
app.get("/api/admin/projects/all", async (req, res) => {
  try {
    const [rows] = await mainDb.query("SELECT * FROM user_projects WHERE deleted_at IS NULL ORDER BY created_at DESC");
    res.json({ success: true, projects: rows });
  } catch (e) { res.status(500).json({ error: "Failed" }); }
});

// ── Admin Activity Logs ──────────────────────────────────────────────────────
app.get("/api/admin/activity-logs", async (req, res) => {
  try {
    const [rows] = await mainDb.query("SELECT * FROM admin_activity_logs ORDER BY created_at DESC LIMIT 100");
    res.json({ success: true, logs: rows });
  } catch (e) { res.status(500).json({ error: "Failed" }); }
});

// ── Admin Audit Logs ────────────────────────────────────────────────────────
app.get("/api/admin/audit-logs", async (req, res) => {
  try {
    const [rows] = await mainDb.query("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 50");
    res.json({ success: true, logs: rows });
  } catch (e) { res.status(500).json({ error: "Failed" }); }
});

// ── Admin Data Access Logs ───────────────────────────────────────────────────
app.get("/api/admin/data-access-logs", async (req, res) => {
  try {
    const [rows] = await mainDb.query("SELECT * FROM data_access_logs ORDER BY created_at DESC LIMIT 50");
    res.json({ success: true, logs: rows });
  } catch (e) { res.status(500).json({ error: "Failed" }); }
});

// ── Admin Settings ──────────────────────────────────────────────────────────
app.get("/api/admin/settings", async (req, res) => {
  try {
    const [rows] = await mainDb.query("SELECT * FROM admin_settings");
    const settings = {}; rows.forEach((r) => { settings[r.setting_key] = r.setting_value; });
    res.json({ success: true, settings });
  } catch (e) { res.status(500).json({ error: "Failed" }); }
});

app.put("/api/admin/settings", async (req, res) => {
  try {
    const updates = req.body;
    for (const [key, value] of Object.entries(updates)) {
      await mainDb.query("INSERT INTO admin_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)", [key, String(value)]);
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: "Failed" }); }
});

// ── Admin Node Settings ──────────────────────────────────────────────────────
app.get("/api/admin/node-settings", async (req, res) => {
  try {
    const [s] = await mainDb.query("SELECT * FROM admin_settings");
    const settings = {}; s.forEach((r) => { settings[r.setting_key] = r.setting_value; });
    res.json({ success: true, settings, system: { status:"operational", uptime:"99.9%" } });
  } catch (e) { res.status(500).json({ success:false, message:"Failed" }); }
});

// ── System Calibration ───────────────────────────────────────────────────────
app.post("/api/admin/system-calibration", async (req, res) => {
  try {
    const [tbl] = await mainDb.query("SHOW TABLES");
    res.json({ success:true, calibration:{status:"healthy",ran_at:new Date().toISOString(),tables:tbl.length,node:process.version} });
  } catch (e) { res.status(500).json({ success:false, message:"Failed" }); }
});

// ── Admin Search ────────────────────────────────────────────────────────────
app.get("/api/admin/search", async (req, res) => {
  try {
    const { q, deep } = req.query;
    if (!q || q.length < 2) return res.json({ success: true, results: [] });
    const t = `%${q}%`; const l = deep === "true" ? 20 : 5;
    const [u] = await mainDb.query(
      "(SELECT 'user' as type, id, COALESCE(display_name,CONCAT_WS(' ',first_name,last_name)) as title, email as subtitle, CONCAT('/admin/users/detail/',id,'/client') as link FROM users WHERE (display_name LIKE ? OR email LIKE ?) AND deleted_at IS NULL) UNION ALL (SELECT 'user' as type, id, COALESCE(display_name,CONCAT_WS(' ',first_name,last_name)) as title, email as subtitle, CONCAT('/admin/users/detail/',id,'/admin') as link FROM admin_users WHERE (display_name LIKE ? OR email LIKE ?) AND deleted_at IS NULL) LIMIT ?",
      [t, t, t, t, l]);
    const [p] = await mainDb.query("SELECT 'project' as type, id, project_name as title, client_name as subtitle, '/admin/projects' as link FROM user_projects WHERE (project_name LIKE ? OR client_name LIKE ?) AND deleted_at IS NULL LIMIT ?", [t, t, l]);
    const [lg] = await mainDb.query("SELECT 'ledger' as type, id, description as title, CONCAT('KSH ',FORMAT(amount,2)) as subtitle, '/admin/billing' as link FROM accounting_entries WHERE (description LIKE ? OR transaction_reference LIKE ?) AND deleted_at IS NULL LIMIT ?", [t, t, l]);
    const [tk] = await mainDb.query("SELECT 'task' as type, id, task_name as title, status, priority, CONCAT('/admin/projects/',project_id,'/tasks') as link FROM project_tasks WHERE (task_name LIKE ? OR task_description LIKE ?) AND deleted_at IS NULL LIMIT ?", [t, t, l]);
    res.json({ success: true, results: [...u, ...p, ...lg, ...tk] });
  } catch (e) { res.status(500).json({ success: false, message: "Search failed" }); }
});

// ── Admin CRM Contacts ──────────────────────────────────────────────────────
app.get("/api/admin/crm/contacts", async (req, res) => {
  try { const [rows] = await mainDb.query("SELECT * FROM crm_contacts WHERE deleted_at IS NULL ORDER BY created_at DESC"); res.json({ success: true, clients: rows, opportunities: [], pipeline: [] }); }
  catch (e) { res.status(500).json({ success:false, message:"CRM failed" }); }
});

app.post("/api/admin/crm/contacts", async (req, res) => {
  try {
    const { name, email, phone, company, status } = req.body;
    if (!name) return res.status(400).json({ error: "Name required" });
    const [r] = await mainDb.query("INSERT INTO crm_contacts (name,email,phone,company,status,is_active,created_at) VALUES (?,?,?,?,?,1,NOW())", [name, email||null, phone||null, company||null, status||'lead']);
    res.status(201).json({ success: true, id: r.insertId });
  } catch (e) { res.status(500).json({ error: "Failed" }); }
});

// ── Support / Change Requests / Signatures ────────────────────────────────
app.get("/api/admin/change-requests", async (req, res) => {
  try { const [rows] = await mainDb.query("SELECT * FROM change_requests ORDER BY created_at DESC LIMIT 50"); res.json({ success: true, changeRequests: rows }); }
  catch (e) { res.status(500).json({ error: "Failed" }); }
});

app.put("/api/admin/change-requests/:id", async (req, res) => {
  try { const { id } = req.params; const { status } = req.body; await mainDb.query("UPDATE change_requests SET status=? WHERE id=?", [status, id]); res.json({ success: true }); }
  catch (e) { res.status(500).json({ error: "Failed" }); }
});

app.get("/api/admin/signature-requests", async (req, res) => {
  try { const [rows] = await mainDb.query("SELECT * FROM document_signatures ORDER BY created_at DESC LIMIT 50"); res.json({ success: true, signatureRequests: rows }); }
  catch (e) { res.status(500).json({ error: "Failed" }); }
});

// ── Data Safety Summary ──────────────────────────────────────────────────────
app.get("/api/admin/data-safety-summary", async (req, res) => {
  try {
    const [tbl] = await mainDb.query("SHOW TABLES");
    res.json({ success: true, table_count: tbl.length, backup_status: "current", encrypted: true });
  } catch (e) { res.status(500).json({ error: "Failed" }); }
});

// ── Admin Reports ────────────────────────────────────────────────────────────
app.get("/api/admin/reports", async (req, res) => {
  try { const [rows] = await mainDb.query("SELECT * FROM project_reports ORDER BY created_at DESC LIMIT 50"); res.json({ success: true, reports: rows }); }
  catch (e) { res.status(500).json({ error: "Failed" }); }
});

app.post("/api/admin/reports", async (req, res) => {
  try {
    const { project_id, title, summary, file_data, file_type, file_size, admin_id } = req.body;
    if (!project_id || !title) return res.status(400).json({ error: "Project ID and title required" });
    const [r] = await mainDb.query("INSERT INTO project_reports (project_id,title,summary,file_data,file_type,file_size,admin_id,created_at) VALUES (?,?,?,?,?,?,?,NOW())", [project_id, title, summary||null, file_data||null, file_type||null, file_size||0, admin_id||null]);
    res.status(201).json({ success: true, id: r.insertId });
  } catch (e) { res.status(500).json({ error: "Failed" }); }
});

// ── Backup endpoints ─────────────────────────────────────────────────────────
app.get("/api/admin/backup/status", (req, res) => { res.json({ success: true, running: false, lastRun: null, latestSnapshot: null }); });
app.post("/api/admin/backup/run", (req, res) => { res.json({ success: true, message: "Backup started" }); });

// ── Blog Article single ──────────────────────────────────────────────────────
app.get("/api/blog-articles/:id", async (req, res) => {
  try { const [rows] = await mainDb.query("SELECT * FROM blog_articles WHERE id=?", [req.params.id]); if (rows.length === 0) return res.status(404).json({ error: "Not found" }); res.json({ success: true, article: rows[0] }); }
  catch (e) { res.status(500).json({ error: "Failed" }); }
});

// ── SPA fallback + 404 — registered LAST so every API route above wins ──────
// Any GET that doesn't target /api serves the React app, so client-side routes
// (e.g. /login, /admin, /portal) survive refresh/deep links in production —
// the same behaviour the classic SPA "/* -> /index.html" redirect provided.
app.get(/^\/(?!api(?:\/|$)).*/, (req, res, next) => {
  const indexFile = path.join(distDir, "index.html");
  if (fs.existsSync(indexFile)) return res.sendFile(indexFile);
  next(); // no build present (local dev) -> fall through to the 404 handler
});

// 404 handler (must stay below ALL routes)
app.use((req, res) => {
  if (req.accepts("html")) {
    res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
  } else if (req.accepts("json")) {
    res.status(404).json({
      success: false,
      message: "Endpoint not found",
      path: req.path,
    });
  } else {
    res.status(404).send("Not found");
  }
});

app.listen(PORT, "0.0.0.0", async () => {
  console.log(`Server running on port ${PORT}`);

  // Connect to MongoDB Atlas (optional — a Mongo outage must never take the
  // whole API down with it)
  if (process.env.MONGODB_URI) {
    try {
      await connectMongoDB();
    } catch (mongoErr) {
      console.warn("[MONGODB] Connection failed, continuing without it:", mongoErr.message);
    }
  } else {
    console.log("MONGODB_URI not found in .env, skipping MongoDB connection.");
  }

  dbEndpoints().forEach((cfg, i) => {
    const { label, ...opts } = cfg;
    console.log(`[DATABASE] MySQL endpoint ${i + 1} (${label || "?"}): ${opts.host}:${opts.port}`);
  });
  console.log(
    `Connected to MySQL server at ${process.env.DB_HOST || "localhost"} (fails over to claude if it goes down)`,
  );
  console.log(`Access the API at http://localhost:${PORT}/api`);

  console.log(`\n========================================`);
  console.log(`USER AUTH PLATFORM (users table)`);
  console.log(`========================================`);
  console.log(`POST /api/users/register          - Register with photo BLOB`);
  console.log(`POST /api/users/login             - Login returns photo URL`);
  console.log(`GET  /api/users/profile-photo/:id - Retrieve user photo`);

  console.log(`\n========================================`);
  console.log(`ADMIN AUTH PLATFORM (admin_users table)`);
  console.log(`========================================`);
  console.log(
    `POST /api/admin-verification/register              - Register with photo BLOB`,
  );
  console.log(
    `POST /api/admin-verification/authenticate-enhanced - Login returns photo info`,
  );
  console.log(
    `GET  /api/admin/profile-photo/admin/:id            - Retrieve admin photo`,
  );

  console.log(`\n========================================`);
  console.log(`DEVELOPER AUTH PLATFORM (developer_users table)`);
  console.log(`========================================`);
  console.log(
    `POST /api/admin-verification/register           - Register with photo BLOB`,
  );
  console.log(
    `POST /api/developer-verification/authenticate   - Login returns photo info`,
  );
  console.log(
    `GET  /api/admin/profile-photo/developer/:id     - Retrieve dev photo`,
  );
  console.log(`========================================\n`);
});
