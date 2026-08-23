# AUTH ENDPOINTS - LOCKED SPECIFICATION

**Status: LOCKED ✓** | Last Updated: May 10, 2026 | Enforcement Level: STRICT

---

## Overview

This document defines the LOCKED authentication endpoints for The-Greggory-Systems-And-Strategy-firm. These mappings are enforced at the database level and cannot be changed without explicit system administrator action.

Each authentication platform is permanently assigned to ONE database table with NO cross-table referencing.

---

## Platform-to-Table Mappings (LOCKED)

### 1. **USER PLATFORM** 👥
| Property | Value |
|----------|-------|
| **Platform Name** | `user` |
| **Database Table** | `users` |
| **Register Endpoint** | `POST /api/users/register` |
| **Login Endpoint** | `POST /api/users/login` |
| **Status** | ✅ LOCKED & ACTIVE |

#### User Registration
```bash
POST /api/users/register
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "<your-password>",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "profile_image_id": 5
}
```

**Response (Success - 201)**
```json
{
  "success": true,
  "message": "User registered successfully in users table",
  "userId": 42,
  "table": "users",
  "profile_image_id": 5
}
```

#### User Login
```bash
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "<your-password>"
}
```

**Response (Success - 200)**
```json
{
  "id": 42,
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "display_name": "John Doe",
  "primary_role": "user",
  "role_type": "user",
  "profilePhotoData": "data:image/jpeg;base64,...",
  "profile_image_id": 5
}
```

**Validation Rules**
- ✅ ONLY queries `users` table
- ❌ NEVER checks `admin_users` table
- ❌ NEVER checks `developer_users` table
- ✅ Email field required
- ✅ Password field required (min 8 characters)
- ✅ First name required
- ✅ Last name required

---

### 2. **ADMIN PLATFORM** 🔐
| Property | Value |
|----------|-------|
| **Platform Name** | `admin` |
| **Database Table** | `admin_users` |
| **Create Endpoint** | `POST /api/users/admin-create` |
| **Login Endpoint** | `POST /api/admin-verification/authenticate-enhanced` |
| **Status** | ✅ LOCKED & ACTIVE |

#### Admin Creation (via admin-create)
```bash
POST /api/users/admin-create
Content-Type: application/json

{
  "email": "admin@greggory.org",
  "password": "<your-admin-password>",
  "first_name": "Admin",
  "last_name": "User",
  "role": "admin",
  "admin_level": "admin"
}
```

**Response (Success - 201)**
```json
{
  "success": true,
  "message": "Admin account created successfully",
  "userId": 15,
  "role": "admin"
}
```

#### Admin Login
```bash
POST /api/admin-verification/authenticate-enhanced
Content-Type: application/json

{
  "email": "admin@greggory.org",
  "password": "<your-admin-password>"
}
```

**Response (Success - 200)**
```json
{
  "success": true,
  "message": "Admin authentication successful",
  "user": {
    "id": 15,
    "email": "admin@greggory.org",
    "name": "Admin User",
    "admin_level": "admin",
    "role_type": "admin",
    "profilePhotoData": "data:image/jpeg;base64,...",
    "profile_image_id": null
  },
  "token": "admin-session-1715395200000-15"
}
```

**Validation Rules**
- ✅ ONLY queries `admin_users` table
- ❌ NEVER checks `users` table
- ❌ NEVER checks `developer_users` table
- ✅ Email field required
- ✅ Password field required (min 8 characters)
- ✅ First name required
- ✅ Last name required
- ✅ Role field required (admin/moderator)

---

### 3. **DEVELOPER PLATFORM** 👨‍💻
| Property | Value |
|----------|-------|
| **Platform Name** | `developer` |
| **Database Table** | `developer_users` |
| **Create Endpoint** | `POST /api/users/admin-create` |
| **Login Endpoint** | `POST /api/developer-verification/authenticate` |
| **Status** | ✅ LOCKED & ACTIVE |

#### Developer Creation (via admin-create)
```bash
POST /api/users/admin-create
Content-Type: application/json

{
  "email": "dev@greggory.org",
  "password": "<your-dev-password>",
  "first_name": "John",
  "last_name": "Developer",
  "role": "developer",
  "developer_level": "mid"
}
```

**Response (Success - 201)**
```json
{
  "success": true,
  "message": "Developer account created successfully",
  "userId": 8,
  "role": "developer"
}
```

#### Developer Login
```bash
POST /api/developer-verification/authenticate
Content-Type: application/json

{
  "email": "dev@greggory.org",
  "password": "<your-dev-password>"
}
```

**Response (Success - 200)**
```json
{
  "success": true,
  "message": "Developer authentication successful",
  "user": {
    "id": 8,
    "email": "dev@greggory.org",
    "name": "John Developer",
    "developer_level": "mid",
    "role_type": "developer",
    "profilePhotoData": "data:image/jpeg;base64,...",
    "profile_image_id": null
  },
  "token": "developer-session-1715395200000-8"
}
```

**Validation Rules**
- ✅ ONLY queries `developer_users` table
- ❌ NEVER checks `users` table
- ❌ NEVER checks `admin_users` table
- ✅ Email field required
- ✅ Password field required (min 8 characters)
- ✅ First name required
- ✅ Last name required
- ✅ Role field required (developer)

---

## Error Responses

### Validation Failed (400)
```json
{
  "success": false,
  "message": "Required field validation failed: email, password",
  "requestId": "auth-1715395200000-a1b2c3d4",
  "platform": "user",
  "tableName": "users",
  "errorCode": "VALIDATION_FAILED",
  "violations": [
    {
      "rule": "email_required",
      "field": "email",
      "level": "strict"
    }
  ]
}
```

### Endpoint Mismatch (400)
```json
{
  "success": false,
  "message": "Auth platform mapping not found or not locked for user/admin_users",
  "requestId": "auth-1715395200000-a1b2c3d4",
  "platform": "user",
  "tableName": "users",
  "errorCode": "MAPPING_NOT_LOCKED"
}
```

### Invalid Credentials (401)
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

## Database Enforcement

All endpoint mappings are stored in the database and enforced through the `auth_platform_mapping` table:

```sql
SELECT * FROM auth_platform_mapping WHERE is_locked = TRUE;
```

| platform_name | table_name | register_endpoint | login_endpoint | is_locked | locked_at |
|---|---|---|---|---|---|
| user | users | POST /api/users/register | POST /api/users/login | ✓ | 2026-05-10 |
| admin | admin_users | POST /api/users/admin-create | POST /api/admin-verification/authenticate-enhanced | ✓ | 2026-05-10 |
| developer | developer_users | POST /api/users/admin-create | POST /api/developer-verification/authenticate | ✓ | 2026-05-10 |

---

## Validation Rules (Locked)

All auth endpoints enforce the following strict validation rules:

### Required Fields by Platform

**User Platform**
- email (required)
- password (required, min 8 chars)
- first_name (required)
- last_name (required)

**Admin Platform**
- email (required)
- password (required, min 8 chars)
- first_name (required)
- last_name (required)
- role (required, must be 'admin')

**Developer Platform**
- email (required)
- password (required, min 8 chars)
- first_name (required)
- last_name (required)
- role (required, must be 'developer')

### Table Isolation Enforcement

Each platform has strict table isolation rules:

**User Platform**
- ✅ CAN query: `users` table
- ❌ CANNOT query: `admin_users` table
- ❌ CANNOT query: `developer_users` table

**Admin Platform**
- ❌ CANNOT query: `users` table
- ✅ CAN query: `admin_users` table
- ❌ CANNOT query: `developer_users` table

**Developer Platform**
- ❌ CANNOT query: `users` table
- ❌ CANNOT query: `admin_users` table
- ✅ CAN query: `developer_users` table

---

## Audit & Logging

All authentication requests are logged to the `auth_request_log` table for audit purposes:

```sql
SELECT 
  request_id,
  platform,
  table_name,
  email,
  is_success,
  execution_time_ms,
  created_at
FROM auth_request_log
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
ORDER BY created_at DESC;
```

---

## Testing Endpoints

### Test User Platform
```bash
# Register new user
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "<test-password>",
    "first_name": "Test",
    "last_name": "User"
  }'

# Login user
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "<test-password>"
  }'
```

### Test Admin Platform
```bash
# Create admin
curl -X POST http://localhost:3000/api/users/admin-create \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "<your-admin-password>",
    "first_name": "Admin",
    "last_name": "Test",
    "role": "admin"
  }'

# Login admin
curl -X POST http://localhost:3000/api/admin-verification/authenticate-enhanced \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "<your-admin-password>"
  }'
```

### Test Developer Platform
```bash
# Create developer
curl -X POST http://localhost:3000/api/users/admin-create \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dev@test.com",
    "password": "<your-dev-password>",
    "first_name": "Dev",
    "last_name": "Test",
    "role": "developer"
  }'

# Login developer
curl -X POST http://localhost:3000/api/developer-verification/authenticate \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dev@test.com",
    "password": "<your-dev-password>"
  }'
```

---

## Monitoring & Stats

View authentication statistics:

```sql
SELECT * FROM v_auth_request_stats;
```

View active platforms:

```sql
SELECT * FROM v_active_auth_platforms;
```

---

## Critical Notes

⚠️ **THESE ENDPOINTS ARE LOCKED IN THE DATABASE**

1. **No Manual Modification**: Platform mappings cannot be changed without database-level locks
2. **100% Consistency**: Each endpoint ALWAYS works with its assigned table
3. **Zero Cross-Table Access**: Validation middleware prevents cross-table queries
4. **Complete Audit Trail**: Every auth request is logged with unique request ID
5. **Immutable Mappings**: Created timestamps and locked flags prevent accidental changes

---

## Support & Issues

For issues with authentication endpoints:

1. Check `auth_request_log` table for detailed error messages
2. Verify platform mappings: `SELECT * FROM v_active_auth_platforms`
3. Review validation rules: `SELECT * FROM auth_validation_rules WHERE platform = '...'`
4. Check execution stats: `SELECT * FROM v_auth_request_stats`

---

**Document Status**: ACTIVE & LOCKED  
**Last Reviewed**: May 10, 2026  
**Next Review**: May 10, 2027
