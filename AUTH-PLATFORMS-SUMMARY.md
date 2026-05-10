# Auth Platforms - Visual Summary

## Complete Authentication Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    GREGGORY FOUNDATION LTD                      │
│                    AUTHENTICATION SYSTEM                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  Login Page (/login)           │  Auth Platform Modal            │
│  - Regular user login         │  - Admin access button          │
│  - No code required           │  - Developer access button      │
│  → POST /api/login            │  → POST /api/admin/authenticate │
│                              │  → POST /api/developer/authenticate│
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER (server.js)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐│
│  │  User Auth       │  │  Admin Auth      │  │ Developer Auth  ││
│  │  /api/login      │  │  /api/admin/     │  │ /api/developer/ ││
│  │  /api/signup     │  │  authenticate    │  │ authenticate    ││
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬────────┘│
│           │                    │                    │           │
│           │                    │                    │           │
│           ▼                    ▼                    ▼           │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐│
│  │  No Code Check   │  │  ADMIN_CODE      │  │  DEV_CODE       ││
│  │  Required        │  │  Validation      │  │  Validation     ││
│  │  (from .env)     │  │  (from .env)     │  │  (from .env)    ││
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬────────┘│
└───────────┼─────────────────────┼─────────────────────┼───────────┘
            │                     │                     │
            ▼                     ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER (XAMPP MySQL)                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐│
│  │  users TABLE     │  │  admin_users     │  │developer_users  ││
│  │  - id            │  │  TABLE           │  │  TABLE          ││
│  │  - email         │  │  - id            │  │  - id           ││
│  │  - password_hash │  │  - email         │  │  - email        ││
│  │  - first_name    │  │  - password_hash │  │  - password_hash││
│  │  - last_name     │  │  - first_name    │  │  - first_name   ││
│  │  - phone_number  │  │  - last_name     │  │  - last_name    ││
│  │  - job_id        │  │  - phone_number  │  │  - phone_number ││
│  │  - is_active     │  │  - admin_level   │  │  - developer_   ││
│  │  - created_at    │  │  - access_level  │  │    level        ││
│  │                  │  │  - department    │  │  - tech_stack   ││
│  │                  │  │  - is_active     │  │  - is_active    ││
│  │                  │  │  - last_login_at │  │  - last_login_  ││
│  │                  │  │                  │  │    at           ││
│  └──────────────────┘  └──────────────────┘  └─────────────────┘│
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  access_codes TABLE (for admin/developer code validation)  │ │
│  │  - id, code_type, code_value, code_hash, is_active         │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Platform-Table-Endpoint Mapping

| Platform | Frontend Entry | API Endpoint | Database Table | Access Code |
|----------|---------------|--------------|----------------|-------------|
| **User** | /login page | POST /api/login | `users` | ❌ No |
| **User** | /signup page | POST /api/signup | `users` | ❌ No |
| **Admin** | Auth modal → Admin | POST /api/admin/authenticate | `admin_users` | ✅ ADMIN_CODE |
| **Admin** | Admin panel | POST /api/admin/create | `admin_users` | ✅ Required |
| **Developer** | Auth modal → Developer | POST /api/developer/authenticate | `developer_users` | ✅ DEV_CODE |
| **Developer** | Admin panel | POST /api/admin/developer-create | `developer_users` | ✅ Required |

## Session Management

```
┌─────────────────────────────────────────────────────────────┐
│                    SESSION STORAGE                           │
├─────────────────────────────────────────────────────────────┤
│  User Session:     localStorage.setItem('token', ...)       │
│  Admin Session:    localStorage.setItem('admin_token', ...) │
│  Developer Session: localStorage.setItem('developer_token', ...)│
└─────────────────────────────────────────────────────────────┘
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY CHECKS                           │
├─────────────────────────────────────────────────────────────┤
│  1. Access Code Validation (Admin/Dev only)                 │
│  2. IP Restriction (Admin/Dev: localhost only)              │
│  3. Rate Limiting (5 attempts/15 min)                       │
│  4. Account Lockout (30 min after 5 failures)               │
│  5. Password Hashing (bcrypt, 10 rounds)                    │
│  6. JWT Token Signing (8-hour expiry)                       │
│  7. Failed Login Tracking (in database)                     │
└─────────────────────────────────────────────────────────────┘
```

## Quick Reference Commands

```bash
# Create admin user
node create-admin-user.js

# Create developer user
node create-developer-user.js

# Create test user
node create-test-user.js

# Test all authentication
node test-all-auth.js

# Test database connection
node test-db-connection.js
```

## Environment Variables Required

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=greggory_foundation_db_main

# Access Codes
ADMIN_CODE=***REMOVED***
DEV_CODE=***REMOVED***

# Session Secrets
JWT_SECRET=your_jwt_secret_here
ADMIN_SESSION_SECRET=your_admin_session_secret
```

## Key Files Reference

| File | Purpose |
|------|---------|
| `AUTH-PLATFORMS-LINKING.md` | Complete linking documentation |
| `AUTH_PROTOCOL.md` | Strict table isolation rules |
| `AUTHENTICATION_CHANGES.md` | Migration details |
| `AUTHENTICATION_README.md` | Frontend integration guide |
| `server.js` | API endpoint implementations |
| `database/greggory_foundation_db_main.sql` | Database schema |

---

**Summary**: Three separate authentication platforms, each with isolated database tables, dedicated API endpoints, and specific security requirements. All linked to XAMPP MySQL database `greggory_foundation_db_main`.
