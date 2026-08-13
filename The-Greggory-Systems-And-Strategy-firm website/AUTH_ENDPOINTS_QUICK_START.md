# 🔒 AUTH ENDPOINTS LOCKDOWN - QUICK START GUIDE

## Overview
Your authentication endpoints are now LOCKED in the database. Each platform is permanently assigned to ONE table with 100% consistency enforcement.

---

## Step 1: Initialize the Database Tables

Run the initialization script to set up the auth mapping tables:

```bash
# From project root directory
node scripts/init-auth-endpoints-tables.js
```

**Expected Output:**
```
✅ Connected to database

📋 Creating auth_platform_mapping table...
✅ auth_platform_mapping table created/verified

📋 Creating auth_request_log table...
✅ auth_request_log table created/verified

📋 Creating auth_validation_rules table...
✅ auth_validation_rules table created/verified

🔐 Inserting locked auth platform mappings...
✅ Auth platform mappings locked in database

📏 Inserting validation rules...
✅ Inserted 25/25 validation rules

============================================================
✅ AUTH ENDPOINTS INITIALIZATION COMPLETE
============================================================

📊 Database Summary:
  • auth_platform_mapping: 3 locked platforms
  • auth_request_log: Ready for audit logging
  • auth_validation_rules: 25 strict validation rules

🔒 Locked Platforms:
  1. user → users table
     POST /api/users/register
     POST /api/users/login
  2. admin → admin_users table
     POST /api/users/admin-create
     POST /api/admin-verification/authenticate-enhanced
  3. developer → developer_users table
     POST /api/users/admin-create
     POST /api/developer-verification/authenticate
```

---

## Step 2: Verify Locked Endpoints in PhpMyAdmin

Navigate to: `http://localhost/phpmyadmin/index.php?route=/database/structure&db=the_greggory_systems_and_strategy_firm_db_main`

**Check these new tables:**

### 1. auth_platform_mapping
```
Browse → auth_platform_mapping
```
Should show 3 rows:
- user → users
- admin → admin_users
- developer → developer_users

All with `is_locked = 1` and `is_active = 1`

### 2. auth_request_log
Empty initially - logs all auth requests with audit trail

### 3. auth_validation_rules
Should show 25 rules with enforcement levels (strict)

---

## Step 3: Test the Endpoints

### Test User Registration/Login

```bash
# 1. Register a new user
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "***REMOVED***",
    "first_name": "Test",
    "last_name": "User"
  }'
```

Expected Response (201):
```json
{
  "success": true,
  "message": "User registered successfully in users table",
  "userId": 1,
  "table": "users"
}
```

```bash
# 2. Login as user
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "***REMOVED***"
  }'
```

Expected Response (200):
```json
{
  "id": 1,
  "email": "testuser@example.com",
  "first_name": "Test",
  "last_name": "User",
  "role_type": "user",
  "primary_role": "user"
}
```

### Test Admin Creation/Login

```bash
# 1. Create admin (via admin-create endpoint)
curl -X POST http://localhost:3000/api/users/admin-create \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@greggory.org",
    "password": "***REMOVED***",
    "first_name": "Admin",
    "last_name": "User",
    "role": "admin",
    "admin_level": "admin"
  }'
```

Expected Response (201):
```json
{
  "success": true,
  "message": "Admin account created successfully",
  "userId": 15,
  "role": "admin"
}
```

```bash
# 2. Login as admin
curl -X POST http://localhost:3000/api/admin-verification/authenticate-enhanced \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@greggory.org",
    "password": "***REMOVED***"
  }'
```

Expected Response (200):
```json
{
  "success": true,
  "message": "Admin authentication successful",
  "user": {
    "id": 15,
    "email": "admin@greggory.org",
    "role_type": "admin"
  }
}
```

### Test Developer Creation/Login

```bash
# 1. Create developer
curl -X POST http://localhost:3000/api/users/admin-create \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dev@greggory.org",
    "password": "***REMOVED***",
    "first_name": "Dev",
    "last_name": "User",
    "role": "developer",
    "developer_level": "mid"
  }'
```

Expected Response (201):
```json
{
  "success": true,
  "message": "Developer account created successfully",
  "userId": 8,
  "role": "developer"
}
```

```bash
# 2. Login as developer
curl -X POST http://localhost:3000/api/developer-verification/authenticate \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dev@greggory.org",
    "password": "***REMOVED***"
  }'
```

Expected Response (200):
```json
{
  "success": true,
  "message": "Developer authentication successful",
  "user": {
    "id": 8,
    "email": "dev@greggory.org",
    "role_type": "developer"
  }
}
```

---

## Step 4: Monitor Auth Requests

Check the audit log in PhpMyAdmin:

```sql
-- View recent auth requests
SELECT 
  request_id,
  platform,
  table_name,
  email,
  endpoint,
  response_status,
  is_success,
  execution_time_ms,
  created_at
FROM auth_request_log
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
ORDER BY created_at DESC;
```

---

## Step 5: View Active Mappings

```sql
-- View all active platform mappings
SELECT * FROM v_active_auth_platforms;

-- Should return:
-- platform_name | table_name | register_endpoint | login_endpoint | is_locked | locked_at
-- user          | users      | POST /api/users/register | POST /api/users/login | 1 | 2026-05-10...
-- admin         | admin_users | POST /api/users/admin-create | POST /api/admin-verification/authenticate-enhanced | 1 | 2026-05-10...
-- developer     | developer_users | POST /api/users/admin-create | POST /api/developer-verification/authenticate | 1 | 2026-05-10...
```

---

## Key Features Now Active

✅ **Table Isolation Enforcement**
- User requests ONLY touch `users` table
- Admin requests ONLY touch `admin_users` table  
- Developer requests ONLY touch `developer_users` table

✅ **Validation Middleware**
- All auth endpoints validated automatically
- 25 strict validation rules enforced
- Prevents cross-table authentication

✅ **Complete Audit Trail**
- Every auth request logged with unique ID
- Success/failure tracking
- Execution time monitoring
- Email and IP logging

✅ **Database-Level Locking**
- Mappings locked in `auth_platform_mapping` table
- No accidental changes possible
- Immutable after creation

---

## Troubleshooting

### Issue: "Auth platform mapping not found"
**Solution:** Run the initialization script:
```bash
node scripts/init-auth-endpoints-tables.js
```

### Issue: "Validation failed - required field"
**Check:**
- Email field present
- Password field present (min 8 chars)
- First name present
- Last name present
- For admin/developer: role field present

### Issue: "Endpoint mismatch"
**Check:**
- Using correct endpoint for platform
- Admin: POST /api/admin-verification/authenticate-enhanced
- Developer: POST /api/developer-verification/authenticate
- User: POST /api/users/login

### View Error Details
```sql
-- Check failed auth requests
SELECT 
  request_id,
  platform,
  endpoint,
  error_message,
  created_at
FROM auth_request_log
WHERE is_success = FALSE
ORDER BY created_at DESC
LIMIT 10;
```

---

## Documentation Files

- **LOCKED_AUTH_ENDPOINTS.md** - Complete API specification
- **AUTH_PROTOCOL.md** - Original protocol (reference)
- **AUTH_ENDPOINTS_SCHEMA.sql** - Database schema
- **authEndpointValidator.js** - Validation middleware code

---

## What's Locked Now?

| Platform | Table | Register | Login | Status |
|----------|-------|----------|-------|--------|
| User | users | `/api/users/register` | `/api/users/login` | 🔒 LOCKED |
| Admin | admin_users | `/api/users/admin-create` | `/api/admin-verification/authenticate-enhanced` | 🔒 LOCKED |
| Developer | developer_users | `/api/users/admin-create` | `/api/developer-verification/authenticate` | 🔒 LOCKED |

---

## Next Steps

1. ✅ Run initialization script
2. ✅ Test all three endpoints
3. ✅ Monitor auth_request_log table
4. ✅ Keep LOCKED_AUTH_ENDPOINTS.md updated
5. ✅ Review audit logs regularly

---

**System Status:** ✅ ACTIVE & LOCKED  
**Last Updated:** May 10, 2026  
**Support:** Check auth_request_log for detailed error info
