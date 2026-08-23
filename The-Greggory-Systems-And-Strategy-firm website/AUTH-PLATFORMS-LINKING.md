# Auth Platforms Complete Linking Guide

## Overview
This document links all authentication platforms with their respective database tables, API endpoints, and implementation details for the The-Greggory-Systems-And-Strategy-firm project.

## Three Authentication Platforms

| Platform | Table | Purpose | Access Code Required |
|----------|-------|---------|---------------------|
| **Regular User** | `users` | Public users, donors, beneficiaries | No |
| **Admin** | `admin_users` | Administrative staff, moderators | Yes (ADMIN_CODE) |
| **Developer** | `developer_users` | Development team, technical staff | Yes (DEV_CODE) |

---

## Platform 1: Regular User Authentication

### Database Table: `users`

```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255) DEFAULT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(200) DEFAULT NULL,
    phone_number VARCHAR(50),
    profile_photo_id BIGINT DEFAULT NULL,
    profile_photo_blob LONGBLOB NULL DEFAULT NULL,
    profile_photo_mime_type VARCHAR(100) NULL DEFAULT NULL,
    job_id BIGINT DEFAULT NULL,
    primary_role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP NULL DEFAULT NULL,
    last_login_ip VARCHAR(45) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL
);
```

### API Endpoints

| Endpoint | Method | Purpose | Request Body |
|----------|--------|---------|--------------|
| `/api/login` | POST | User login | `{email, password}` |
| `/api/signup` | POST | User registration | `{email, password, first_name, last_name, phone}` |
| `/api/users/profile` | GET | Get user profile | Header: `Authorization: Bearer <token>` |
| `/api/users/profile` | PUT | Update user profile | `{first_name, last_name, phone, ...}` |
| `/api/users/profile/photo` | POST | Upload profile photo | `FormData` with photo file |

### Authentication Flow

```
1. User navigates to /login
2. Enters email and password
3. POST /api/login
   - Queries users table: SELECT * FROM users WHERE email = ?
   - Verifies password with bcrypt
   - Returns JWT token
4. Token stored in localStorage
5. User redirected to dashboard
6. All subsequent requests include Authorization header
```

### Session Management
- **Cookie Name**: `gf_user_session`
- **Token Storage**: localStorage
- **Token Expiry**: 7 days (configurable via JWT_EXPIRES_IN)
- **Refresh**: Automatic on API calls

### Frontend Integration

**Login Page**: `src/pages/Login.jsx`
```javascript
const handleSubmit = async (e) => {
  e.preventDefault()
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  const data = await response.json()
  if (data.success) {
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    // Redirect to dashboard
  }
}
```

**Signup Page**: `src/pages/Signup.jsx`
```javascript
const handleSubmit = async (e) => {
  e.preventDefault()
  const response = await fetch('/api/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email, password, first_name, last_name, phone
    })
  })
  // Handle response
}
```

---

## Platform 2: Admin Authentication

### Database Table: `admin_users`

```sql
CREATE TABLE admin_users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) DEFAULT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(200) DEFAULT NULL,
    phone_number VARCHAR(50),
    admin_level ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin',
    admin_permissions JSON,
    access_level ENUM('full', 'limited', 'read_only') DEFAULT 'full',
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP NULL DEFAULT NULL,
    last_login_ip VARCHAR(45) DEFAULT NULL,
    failed_login_attempts INT DEFAULT 0,
    account_locked_until TIMESTAMP NULL DEFAULT NULL,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL
);
```

### API Endpoints

| Endpoint | Method | Purpose | Request Body |
|----------|--------|---------|--------------|
| `/api/admin/authenticate` | POST | Admin login with code | `{email, password, adminCode}` |
| `/api/admin/session` | GET | Validate admin session | Header: `Authorization: Bearer <token>` |
| `/api/admin/create` | POST | Create new admin (super admin only) | `{email, password, first_name, last_name, admin_level, ...}` |

### Authentication Flow

```
1. Admin clicks "Admin Access" in auth modal
2. Enters: email, password, admin code
3. POST /api/admin/authenticate
   - Validates adminCode against ADMIN_CODE env variable
   - Queries admin_users table: SELECT * FROM admin_users WHERE email = ?
   - Checks IP restriction (localhost only)
   - Verifies password with bcrypt
   - Updates last_login_at and last_login_ip
   - Returns JWT token signed with ADMIN_SESSION_SECRET
4. Token stored in localStorage as gf_admin_session
5. Admin redirected to /admin dashboard
6. All admin requests include Authorization header
```

### Security Features

- **Access Code**: Required (from env ADMIN_CODE)
- **IP Restriction**: Only localhost allowed
- **Rate Limiting**: 5 attempts per 15 minutes
- **Account Lockout**: 30 minutes after 5 failed attempts
- **Failed Login Tracking**: Tracked in database
- **Two-Factor Auth**: Optional (can be enabled)

### Session Management
- **Cookie Name**: `gf_admin_session`
- **Token Storage**: localStorage
- **Token Expiry**: 8 hours
- **Secret**: ADMIN_SESSION_SECRET (separate from regular users)

### Environment Variables Required

```env
ADMIN_CODE=<YOUR_ADMIN_CODE>
ADMIN_SESSION_SECRET=your_long_random_admin_session_secret
ADMIN_ALLOWED_IPS=127.0.0.1,::1,localhost
```

### Frontend Integration

**Admin Login Modal**: `src/components/AuthPlatformModal.jsx`
```javascript
const handleAdminLogin = async (e) => {
  e.preventDefault()
  const response = await fetch('/api/admin/authenticate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email, password, adminCode
    })
  })
  const data = await response.json()
  if (data.success) {
    localStorage.setItem('admin_token', data.token)
    localStorage.setItem('admin', JSON.stringify(data.admin))
    // Redirect to /admin
  }
}
```

---

## Platform 3: Developer Authentication

### Database Table: `developer_users`

```sql
CREATE TABLE developer_users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) DEFAULT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(200) DEFAULT NULL,
    phone_number VARCHAR(50),
    developer_level ENUM('senior', 'mid', 'junior', 'lead') DEFAULT 'mid',
    tech_stack JSON,
    specialization VARCHAR(100),
    access_level ENUM('full', 'limited', 'read_only') DEFAULT 'limited',
    team_id BIGINT,
    github_username VARCHAR(100),
    linkedin_url VARCHAR(512),
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP NULL DEFAULT NULL,
    last_login_ip VARCHAR(45) DEFAULT NULL,
    failed_login_attempts INT DEFAULT 0,
    account_locked_until TIMESTAMP NULL DEFAULT NULL,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL
);
```

### API Endpoints

| Endpoint | Method | Purpose | Request Body |
|----------|--------|---------|--------------|
| `/api/developer/authenticate` | POST | Developer login with code | `{email, password, devCode}` |
| `/api/developer/session` | GET | Validate developer session | Header: `Authorization: Bearer <token>` |
| `/api/admin/developer-create` | POST | Create new developer (admin only) | `{email, password, first_name, last_name, developer_level, ...}` |

### Authentication Flow

```
1. Developer clicks "Developer Access" in auth modal
2. Enters: email, password, developer code
3. POST /api/developer/authenticate
   - Validates devCode against DEV_CODE env variable (falls back to ADMIN_CODE)
   - Queries developer_users table: SELECT * FROM developer_users WHERE email = ?
   - Checks IP restriction (localhost only)
   - Verifies password with bcrypt
   - Updates last_login_at and last_login_ip
   - Returns JWT token
4. Token stored in localStorage as gf_developer_session
5. Developer redirected to /developer dashboard
6. All developer requests include Authorization header
```

### Security Features

- **Access Code**: Required (from env DEV_CODE or ADMIN_CODE)
- **IP Restriction**: Only localhost allowed
- **Rate Limiting**: 5 attempts per 15 minutes
- **Account Lockout**: 30 minutes after 5 failed attempts
- **Tech Stack Tracking**: JSON field for skills
- **GitHub Integration**: Optional github_username field

### Session Management
- **Cookie Name**: `gf_developer_session`
- **Token Storage**: localStorage
- **Token Expiry**: 8 hours
- **Secret**: ADMIN_SESSION_SECRET (shared with admin)

### Environment Variables Required

```env
DEV_CODE=<YOUR_DEV_CODE>
# Falls back to ADMIN_CODE if DEV_CODE not set
```

### Frontend Integration

**Developer Login Modal**: `src/components/AuthPlatformModal.jsx`
```javascript
const handleDeveloperLogin = async (e) => {
  e.preventDefault()
  const response = await fetch('/api/developer/authenticate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email, password, devCode
    })
  })
  const data = await response.json()
  if (data.success) {
    localStorage.setItem('developer_token', data.token)
    localStorage.setItem('developer', JSON.stringify(data.developer))
    // Redirect to /developer
  }
}
```

---

## Access Codes Management

### Database Table: `access_codes`

```sql
CREATE TABLE access_codes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code_type ENUM('admin', 'developer', 'super_admin') NOT NULL,
    code_value VARCHAR(255) NOT NULL UNIQUE,
    code_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP NULL DEFAULT NULL,
    max_uses INT DEFAULT NULL,
    current_uses INT DEFAULT 0,
    created_by BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL
);
```

### Access Code API Endpoints

| Endpoint | Method | Purpose | Access Level |
|----------|--------|---------|--------------|
| `/api/access-codes` | GET | List all codes | Admin only |
| `/api/access-codes` | POST | Create new code | Admin only |
| `/api/access-codes/:id` | PUT | Update code | Admin only |
| `/api/access-codes/:id` | DELETE | Delete code | Admin only |

### Default Access Codes

| Code Type | Code Value | Status |
|-----------|------------|--------|
| admin | <YOUR_ADMIN_CODE> | Active, unlimited uses |
| developer | <YOUR_DEV_CODE> | Active, unlimited uses |

---

## Complete Authentication Matrix

| Platform | Table | Login Endpoint | Register Endpoint | Session Endpoint | Code Required |
|----------|-------|----------------|-------------------|------------------|---------------|
| User | `users` | `/api/login` | `/api/signup` | N/A (JWT only) | No |
| Admin | `admin_users` | `/api/admin/authenticate` | `/api/admin/create` | `/api/admin/session` | Yes (ADMIN_CODE) |
| Developer | `developer_users` | `/api/developer/authenticate` | `/api/admin/developer-create` | `/api/developer/session` | Yes (DEV_CODE) |

---

## Server.js Implementation Locations

### User Authentication
```javascript
// Location: server.js
// Lines: ~2000-2200 (approximate)

app.post('/api/login', async (req, res) => {
  // Queries users table ONLY
  const sql = 'SELECT * FROM users WHERE email = ? AND is_active = TRUE AND deleted_at IS NULL'
  // Password verification with bcrypt
  // JWT token generation
})

app.post('/api/signup', async (req, res) => {
  // Inserts into users table ONLY
  // Password hashing with bcrypt
  // Email uniqueness check
})
```

### Admin Authentication
```javascript
// Location: server.js
// Lines: ~2500-2800 (approximate)

app.post('/api/admin/authenticate', async (req, res) => {
  // 1. Validate adminCode against env ADMIN_CODE
  // 2. Check IP restriction
  // 3. Query admin_users table ONLY
  const sql = 'SELECT * FROM admin_users WHERE email = ? AND is_active = TRUE AND deleted_at IS NULL'
  // 4. Password verification
  // 5. Update last_login_at
  // 6. Generate admin session token
})

app.get('/api/admin/session', async (req, res) => {
  // Verify admin token
  // Return admin user data
})
```

### Developer Authentication
```javascript
// Location: server.js
// Lines: ~2800-3100 (approximate)

app.post('/api/developer/authenticate', async (req, res) => {
  // 1. Validate devCode against env DEV_CODE (or ADMIN_CODE)
  // 2. Check IP restriction
  // 3. Query developer_users table ONLY
  const sql = 'SELECT * FROM developer_users WHERE email = ? AND is_active = TRUE AND deleted_at IS NULL'
  // 4. Password verification
  // 5. Update last_login_at
  // 6. Generate developer session token
})
```

---

## Database Connection Configuration

All auth platforms use the same database connection (configured in `.env`):

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=the_greggory_systems_and_strategy_firm_db_main
```

Connection is established in server.js:
```javascript
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'the_greggory_systems_and_strategy_firm_db_main',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
```

---

## Testing Each Platform

### Test Regular User
```bash
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"User123!"}'
```

### Test Admin
```bash
curl -X POST http://localhost:8080/api/admin/authenticate \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"<your-admin-password>","adminCode":"<YOUR_ADMIN_CODE>"}'
```

### Test Developer
```bash
curl -X POST http://localhost:8080/api/developer/authenticate \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@example.com","password":"<your-dev-password>","devCode":"<YOUR_DEV_CODE>"}'
```

---

## Security Rules (STRICT)

1. **NO CROSS-TABLE AUTHENTICATION**
   - User auth → ONLY `users` table
   - Admin auth → ONLY `admin_users` table
   - Developer auth → ONLY `developer_users` table

2. **SEPARATE SESSIONS**
   - Each platform has its own session cookie/token
   - No session sharing between platforms

3. **IP RESTRICTION**
   - Admin and Developer login only from localhost
   - Regular users can login from any IP

4. **ACCESS CODES**
   - Admin requires ADMIN_CODE
   - Developer requires DEV_CODE
   - Regular users require no code

5. **RATE LIMITING**
   - 5 attempts per 15 minutes
   - 30-minute lockout after failures

---

## Troubleshooting

### User Login Fails
```sql
-- Check if user exists in users table
SELECT * FROM users WHERE email = 'user@example.com';
```

### Admin Login Fails
```sql
-- Check if admin exists in admin_users table
SELECT * FROM admin_users WHERE email = 'admin@example.com';

-- Check if access code is correct in .env
-- ADMIN_CODE should match what you're sending
```

### Developer Login Fails
```sql
-- Check if developer exists in developer_users table
SELECT * FROM developer_users WHERE email = 'dev@example.com';

-- Check DEV_CODE in .env
```

### Account Locked Out
```sql
-- Reset failed attempts
UPDATE admin_users SET failed_login_attempts = 0, account_locked_until = NULL WHERE email = 'admin@example.com';
```

---

## Quick Reference

| Need | Command |
|------|---------|
| Create admin user | `node create-admin-user.js` |
| Create developer user | `node create-developer-user.js` |
| Create test user | `node create-test-user.js` |
| Test all auth | `node test-all-auth.js` |
| Check DB connection | `node test-db-connection.js` |

---

**Last Updated:** 2024
**Project:** The-Greggory-Systems-And-Strategy-firm
**Version:** 2.0 - Separate Auth Tables
