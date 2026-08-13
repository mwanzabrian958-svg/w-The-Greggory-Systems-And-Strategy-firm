# Authentication System Changes - Separate Tables

## Overview
The authentication system has been updated to use **three separate tables** instead of a single `users` table with roles:

1. **`admin_users`** - For administrators only
2. **`developer_users`** - For developers only  
3. **`users`** - For regular client/member users (unchanged)

## Changes Made

### Backend (server.js)

#### 1. Admin Authentication (`/api/admin/authenticate`)
- **Before**: Used `users` + `user_roles` + `roles` tables
- **After**: Uses `admin_users` table directly
- **Query**: `SELECT * FROM admin_users WHERE email = ? AND is_active = TRUE AND deleted_at IS NULL`
- **Checks**: Admin code validation → Admin user lookup → Password verification

#### 2. Developer Authentication (`/api/developer/authenticate`) - NEW ENDPOINT
- **New endpoint**: `POST /api/developer/authenticate`
- **Uses**: `developer_users` table
- **Code validation**: Uses `DEV_CODE` env variable (or falls back to `ADMIN_CODE`)
- **Query**: `SELECT * FROM developer_users WHERE email = ? AND is_active = TRUE`

#### 3. Session Validation (`/api/admin/session`)
- **Before**: Checked `users` + `roles` tables
- **After**: 
  1. First checks `admin_users` table
  2. If not found, checks `developer_users` table
  3. Returns appropriate role (`admin` or `developer`)

### Database Schema

#### admin_users table
```sql
- id (BIGINT, PK, Auto)
- email (VARCHAR, Unique)
- password_hash (VARCHAR)
- first_name, last_name (VARCHAR)
- phone_number (VARCHAR)
- admin_level (ENUM: super_admin, admin, moderator)
- access_level (ENUM: full, limited, read_only)
- department (VARCHAR)
- is_active (BOOLEAN)
- last_login_at (TIMESTAMP)
- last_login_ip (VARCHAR)
- created_at, updated_at (TIMESTAMP)
- deleted_at (TIMESTAMP, nullable)
```

#### developer_users table
```sql
- id (BIGINT, PK, Auto)
- email (VARCHAR, Unique)
- password_hash (VARCHAR)
- first_name, last_name (VARCHAR)
- phone_number (VARCHAR)
- developer_level (ENUM: senior, mid, junior, lead)
- tech_stack (JSON)
- is_active (BOOLEAN)
- last_login_at (TIMESTAMP)
- last_login_ip (VARCHAR)
- created_at, updated_at (TIMESTAMP)
- deleted_at (TIMESTAMP, nullable)
```

## Setup Instructions

### Step 1: Run the Setup Script
```bash
node create-admin-user.js
```

This will:
- Create `admin_users` table if it doesn't exist
- Create `developer_users` table if it doesn't exist
- Create the initial admin user (brianmwanza651@gmail.com)

### Step 2: Set Environment Variables
Add to your `.env` file:
```env
# Admin access code (required)
ADMIN_CODE=***REMOVED***

# Optional: Separate developer code
DEV_CODE=GF-DEV-2024-SECURE

# Database connection
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=the_greggory_systems_and_strategy_firm_db_main
```

### Step 3: Restart Server
```bash
node server.js
```

### Step 4: Test Admin Login
1. Open the website
2. Click "Admin access" in the auth platform
3. Enter:
   - Email: `brianmwanza651@gmail.com`
   - Password: `***REMOVED***` (or whatever you set)
   - Admin Code: `***REMOVED***` (or your configured code)

## Authentication Flow

### Admin Login
```
1. User clicks "Admin access"
2. Modal shows admin credentials form
3. User submits: email + password + admin_code
4. Server validates admin_code against env ADMIN_CODE
5. Server queries admin_users table
6. Password verified with bcrypt
7. JWT token generated and returned
8. User redirected to /admin dashboard
```

### Developer Login
```
1. Same flow as admin
2. Uses /api/developer/authenticate endpoint
3. Queries developer_users table
4. Validates against DEV_CODE or ADMIN_CODE
```

### Regular User Login
```
1. Uses existing /api/login endpoint
2. Queries users table (unchanged)
3. No code required, just email + password
```

## API Endpoints

| Endpoint | Method | Table Used | Purpose |
|----------|--------|------------|---------|
| `/api/admin/authenticate` | POST | admin_users | Admin login with code |
| `/api/developer/authenticate` | POST | developer_users | Developer login with code |
| `/api/login` | POST | users | Regular user login |
| `/api/admin/session` | GET | admin_users + developer_users | Validate token |
| `/api/signup` | POST | users | Regular user registration |

## Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Admin account not found" | Email not in admin_users | Run create-admin-user.js |
| "Developer account not found" | Email not in developer_users | Add developer to table |
| "Invalid admin code" | ADMIN_CODE mismatch | Check .env ADMIN_CODE |
| "Invalid developer code" | DEV_CODE mismatch | Check .env DEV_CODE |
| "Invalid password" | Wrong password | Reset password in DB |
| "Access denied from this location" | IP not localhost | Must run from server PC |

## Migration from Old System

If you have existing admin users in the old `users` table:

```sql
-- Migrate admin from users table to admin_users table
INSERT INTO admin_users (
  email, password_hash, first_name, last_name, 
  phone_number, admin_level, access_level, is_active
)
SELECT 
  u.email, u.password_hash, u.first_name, u.last_name,
  u.phone, 'admin', 'full', TRUE
FROM users u
INNER JOIN user_roles ur ON u.id = ur.user_id
INNER JOIN roles r ON ur.role_id = r.id AND r.name = 'admin'
WHERE u.deleted_at IS NULL
ON DUPLICATE KEY UPDATE 
  password_hash = VALUES(password_hash),
  first_name = VALUES(first_name),
  last_name = VALUES(last_name);
```

## Security Features

1. **IP Restriction**: Admin/Dev login only from localhost
2. **Rate Limiting**: Max 5 attempts per 15 minutes
3. **Account Lockout**: 30 min lock after 5 failed attempts
4. **Code Validation**: Separate admin/developer codes required
5. **Password Hashing**: bcrypt with salt rounds 10
6. **JWT Tokens**: Signed with server secret, 8-hour expiry

## Troubleshooting

### Check if admin exists
```sql
SELECT id, email, first_name, last_name, is_active 
FROM admin_users 
WHERE email = 'brianmwanza651@gmail.com';
```

### Check if tables exist
```sql
SHOW TABLES LIKE '%admin%';
SHOW TABLES LIKE '%developer%';
```

### Reset admin password
```javascript
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash('***REMOVED***', 10);
// Then update in database
```

## Support

If you encounter "Internal server error during authentication":
1. Check server console for detailed error logs
2. Verify database tables exist
3. Check environment variables are set
4. Ensure MySQL is running
5. Check IP restrictions (must be localhost)
