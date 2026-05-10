/**
 * AUTH ENDPOINTS VALIDATOR MIDDLEWARE
 * Enforces platform-to-table mappings locked in auth_platform_mapping table
 * File: backend/middleware/authEndpointValidator.js
 * 
 * This middleware:
 * 1. Validates all auth requests against locked mappings
 * 2. Logs all authentication attempts for audit trail
 * 3. Prevents cross-table authentication attempts
 * 4. Ensures table isolation per platform
 */

const db = require('../config/database');
const crypto = require('crypto');

/**
 * Generate unique request ID for audit trail
 */
function generateRequestId() {
  return `auth-${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
}

/**
 * Hash request body for audit logging (without storing sensitive data)
 */
function hashRequestBody(body) {
  const filtered = {
    email: body.email,
    has_password: !!body.password,
    has_phone: !!body.phone,
    fields: Object.keys(body).length
  };
  const json = JSON.stringify(filtered);
  return crypto.createHash('sha256').update(json).digest('hex');
}

/**
 * Validate auth request against platform mapping
 */
async function validateAuthRequest(platform, tableName, endpoint, email, req) {
  try {
    // 1. Check if platform mapping exists and is locked
    const [mapping] = await db.promise().query(
      `SELECT * FROM auth_platform_mapping 
       WHERE platform_name = ? AND table_name = ? AND is_locked = TRUE AND is_active = TRUE`,
      [platform, tableName]
    );

    if (mapping.length === 0) {
      return {
        valid: false,
        error: `Auth platform mapping not found or not locked for ${platform}/${tableName}`,
        errorCode: 'MAPPING_NOT_LOCKED'
      };
    }

    // 2. Check if endpoint matches the locked endpoint
    const lockedMapping = mapping[0];
    if (!endpoint.includes(platform)) {
      return {
        valid: false,
        error: `Endpoint mismatch: expected platform=${platform}, got ${endpoint}`,
        errorCode: 'ENDPOINT_MISMATCH'
      };
    }

    // 3. Validate required fields
    const [rules] = await db.promise().query(
      `SELECT rule_name, rule_value, enforcement_level FROM auth_validation_rules
       WHERE platform = ? AND rule_type = 'required_field' AND is_active = TRUE`,
      [platform]
    );

    const violations = [];
    for (const rule of rules) {
      const fieldName = rule.rule_value;
      if (!req[fieldName]) {
        violations.push({
          rule: rule.rule_name,
          field: fieldName,
          level: rule.enforcement_level
        });
      }
    }

    if (violations.some(v => v.level === 'strict')) {
      return {
        valid: false,
        error: `Required field validation failed: ${violations.map(v => v.field).join(', ')}`,
        errorCode: 'VALIDATION_FAILED',
        violations
      };
    }

    return {
      valid: true,
      mapping: lockedMapping,
      violations: violations.filter(v => v.level !== 'strict')
    };

  } catch (error) {
    console.error('[AUTH VALIDATOR] Error validating request:', error);
    return {
      valid: false,
      error: 'Validation engine error',
      errorCode: 'VALIDATION_ERROR',
      details: error.message
    };
  }
}

/**
 * Log authentication request to audit table
 */
async function logAuthRequest(requestData) {
  try {
    await db.promise().query(
      `INSERT INTO auth_request_log (
        request_id, platform, table_name, endpoint, email, ip_address, 
        request_method, request_body_hash, response_status, response_message, 
        error_message, execution_time_ms, is_success
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        requestData.requestId,
        requestData.platform,
        requestData.tableName,
        requestData.endpoint,
        requestData.email,
        requestData.ipAddress,
        requestData.method,
        requestData.bodyHash,
        requestData.status,
        requestData.message,
        requestData.error,
        requestData.executionTime,
        requestData.success
      ]
    );
  } catch (error) {
    console.error('[AUTH LOGGER] Error logging request:', error);
  }
}

/**
 * Express middleware factory
 * Usage: app.use(authEndpointValidator('user', 'users'))
 */
function authEndpointValidator(platform, tableName) {
  return async (req, res, next) => {
    const startTime = Date.now();
    const requestId = generateRequestId();
    const bodyHash = hashRequestBody(req.body);

    console.log(`[AUTH ENDPOINT] ${requestId} | ${platform}/${tableName} | ${req.method} ${req.path}`);

    // Store validation info in request for logging
    req.authRequest = {
      requestId,
      platform,
      tableName,
      email: req.body?.email,
      bodyHash,
      startTime
    };

    // Validate the request
    const validation = await validateAuthRequest(
      platform,
      tableName,
      req.path,
      req.body?.email,
      req.body
    );

    if (!validation.valid) {
      const executionTime = Date.now() - startTime;
      
      // Log failed validation
      await logAuthRequest({
        requestId,
        platform,
        tableName,
        endpoint: req.path,
        email: req.body?.email,
        ipAddress: req.ip,
        method: req.method,
        bodyHash,
        status: 400,
        message: validation.error,
        error: validation.error,
        executionTime,
        success: false
      });

      console.error(`[AUTH ENDPOINT] ${requestId} VALIDATION FAILED: ${validation.errorCode}`);

      return res.status(400).json({
        success: false,
        message: validation.error,
        requestId: requestId,
        platform: platform,
        tableName: tableName,
        errorCode: validation.errorCode,
        violations: validation.violations || []
      });
    }

    console.log(`[AUTH ENDPOINT] ${requestId} VALIDATION PASSED`);

    // Attach validation result to request for use in route handler
    req.authValidation = validation;

    // Add error handling wrapper
    const originalJson = res.json.bind(res);
    res.json = function(data) {
      const executionTime = Date.now() - startTime;
      
      // Log successful response
      logAuthRequest({
        requestId,
        platform,
        tableName,
        endpoint: req.path,
        email: req.body?.email,
        ipAddress: req.ip,
        method: req.method,
        bodyHash,
        status: res.statusCode,
        message: data?.message || 'OK',
        error: null,
        executionTime,
        success: res.statusCode >= 200 && res.statusCode < 300
      }).catch(err => console.error('Logging error:', err));

      return originalJson(data);
    };

    next();
  };
}

/**
 * Validate that query ONLY references allowed table
 * Usage in route: validateTableIsolation('users', [db-query])
 */
async function validateTableIsolation(platform, allowedTable, queryString) {
  const forbiddenTables = [];
  
  if (platform === 'user') {
    forbiddenTables.push('admin_users', 'developer_users');
  } else if (platform === 'admin') {
    forbiddenTables.push('users', 'developer_users');
  } else if (platform === 'developer') {
    forbiddenTables.push('users', 'admin_users');
  }

  const violations = [];
  for (const table of forbiddenTables) {
    if (queryString.toUpperCase().includes(table.toUpperCase())) {
      violations.push(table);
    }
  }

  return {
    isolated: violations.length === 0,
    allowed: allowedTable,
    violations: violations
  };
}

/**
 * Get current auth platform mappings (for debugging)
 */
async function getAuthMappings() {
  try {
    const [mappings] = await db.promise().query(
      `SELECT platform_name, table_name, register_endpoint, login_endpoint, is_locked 
       FROM auth_platform_mapping 
       WHERE is_active = TRUE
       ORDER BY platform_name`
    );
    return mappings;
  } catch (error) {
    console.error('[AUTH VALIDATOR] Error fetching mappings:', error);
    return [];
  }
}

/**
 * Check auth request stats
 */
async function getAuthStats(platform = null, hours = 24) {
  try {
    const query = `
      SELECT 
        platform,
        table_name,
        endpoint,
        COUNT(*) as total,
        SUM(CASE WHEN is_success = TRUE THEN 1 ELSE 0 END) as success_count,
        SUM(CASE WHEN is_success = FALSE THEN 1 ELSE 0 END) as fail_count,
        ROUND(AVG(execution_time_ms), 2) as avg_time_ms
      FROM auth_request_log
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? HOUR)
      ${platform ? 'AND platform = ?' : ''}
      GROUP BY platform, table_name, endpoint
      ORDER BY created_at DESC
    `;

    const params = [hours];
    if (platform) params.push(platform);

    const [stats] = await db.promise().query(query, params);
    return stats;
  } catch (error) {
    console.error('[AUTH VALIDATOR] Error fetching stats:', error);
    return [];
  }
}

module.exports = {
  authEndpointValidator,
  validateAuthRequest,
  validateTableIsolation,
  logAuthRequest,
  getAuthMappings,
  getAuthStats,
  generateRequestId,
  hashRequestBody
};
