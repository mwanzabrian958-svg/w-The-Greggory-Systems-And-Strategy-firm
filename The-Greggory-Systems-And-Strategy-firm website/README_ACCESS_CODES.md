# Database-Based Access Codes System

## Quick Start

Admin and Developer access codes are now stored in the **database**, not environment variables.

### Default Codes (Auto-Created)
| Type | Code | Purpose |
|------|------|---------|
| **Admin** | `<YOUR_ADMIN_CODE>` | Access admin panel |
| **Developer** | `<YOUR_DEV_CODE>` | Access developer panel |

---

## Setup

### 1. Create the Database Table

```bash
# Run the SQL file
mysql -u root -p the_greggory_systems_and_strategy_firm_db_main < database/access_codes.sql
```

Or manually in MySQL:
```sql
USE the_greggory_systems_and_strategy_firm_db_main;
SOURCE database/access_codes.sql;
```

### 2. Restart Server

```bash
node server.js
```

You'll see: `[ACCESS CODE] Table ready`

### 3. Test Login

**Admin Login:**
- Email: `brianmwanza651@gmail.com`
- Password: `<your-admin-password>`
- Admin Code: `<YOUR_ADMIN_CODE>`

**Developer Login:**
- Email: `dev@example.com`
- Password: `<your-dev-password>`
- Dev Code: `<YOUR_DEV_CODE>`

---

## How It Works

### Authentication Flow

```
User enters credentials
       ↓
Server checks access code in database
       ↓
Server validates user in appropriate table
       ↓
Success → JWT token issued
```

### User Types & Tables

| User Type | Code Type | User Table | Login Endpoint |
|-----------|-----------|------------|----------------|
| Regular User | N/A | `users` | `/api/login` |
| Admin | `admin` | `admin_users` | `/api/admin/authenticate` |
| Developer | `developer` | `developer_users` | `/api/developer/authenticate` |

---

## API Endpoints

### Authentication

**Admin Login:**
```bash
POST /api/admin/authenticate
{
  "email": "admin@example.com",
  "password": "<password>",
  "adminCode": "<YOUR_ADMIN_CODE>"
}
```

**Developer Login:**
```bash
POST /api/developer/authenticate
{
  "email": "dev@example.com",
  "password": "<password>",
  "devCode": "<YOUR_DEV_CODE>"
}
```

### Code Management (Admin Only)

**List All Codes:**
```bash
GET /api/access-codes
```

**Create New Code:**
```bash
POST /api/access-codes
{
  "code_type": "admin",
  "code_value": "NEWCODE2024",
  "max_uses": 10
}
```

**Update Code:**
```bash
PUT /api/access-codes/1
{
  "is_active": false
}
```

**Delete Code:**
```bash
DELETE /api/access-codes/1
```

---

## Database Schema

### Table: `access_codes`

| Field | Type | Description |
|-------|------|-------------|
| `id` | BIGINT | Primary key |
| `code_type` | ENUM | `admin`, `developer`, `super_admin` |
| `code_value` | VARCHAR | The actual code (e.g., "<YOUR_ADMIN_CODE>") |
| `code_hash` | VARCHAR | Bcrypt hash of code |
| `is_active` | BOOLEAN | Enable/disable code |
| `expires_at` | TIMESTAMP | Expiration date (NULL = never) |
| `max_uses` | INT | Max allowed uses (NULL = unlimited) |
| `current_uses` | INT | Usage counter |
| `created_at` | TIMESTAMP | Creation date |

---

## SQL Commands

### View All Codes
```sql
SELECT id, code_type, code_value, is_active, current_uses, max_uses
FROM access_codes
WHERE deleted_at IS NULL;
```

### Add New Admin Code
```sql
INSERT INTO access_codes (code_type, code_value, code_hash, is_active)
VALUES ('admin', 'MYNEWCODE', '$2a$10$...', TRUE);
```

### Deactivate a Code
```sql
UPDATE access_codes 
SET is_active = FALSE 
WHERE code_value = '<YOUR_ADMIN_CODE>';
```

### Check Code Status
```sql
SELECT 
  code_value,
  CASE 
    WHEN is_active = FALSE THEN 'INACTIVE'
    WHEN expires_at < NOW() THEN 'EXPIRED'
    WHEN max_uses <= current_uses THEN 'DEPLETED'
    ELSE 'ACTIVE'
  END as status
FROM access_codes;
```

---

## Troubleshooting

### "Invalid admin code" Error

1. Check if code exists:
```sql
SELECT * FROM access_codes WHERE code_value = '<YOUR_ADMIN_CODE>';
```

2. Check if code is active:
```sql
SELECT code_value, is_active FROM access_codes WHERE code_value = '<YOUR_ADMIN_CODE>';
```

3. Check usage limits:
```sql
SELECT code_value, current_uses, max_uses FROM access_codes WHERE code_value = '<YOUR_ADMIN_CODE>';
```

### Reset Default Codes

```sql
-- Reset usage counter
UPDATE access_codes SET current_uses = 0 WHERE code_value = '<YOUR_ADMIN_CODE>';

-- Reactivate if deactivated
UPDATE access_codes SET is_active = TRUE WHERE code_value = '<YOUR_ADMIN_CODE>';
```

---

## Features

- ✅ **Database Storage** - No codes in .env files
- ✅ **Usage Tracking** - Counts every successful use
- ✅ **Usage Limits** - Set max uses per code
- ✅ **Expiration Dates** - Auto-expire codes
- ✅ **Activate/Deactivate** - Enable/disable without deletion
- ✅ **API Management** - Create/update/delete via API
- ✅ **Auto-Initialization** - Table created on server start
- ✅ **Fallback Support** - Falls back to env if DB fails

---

## Environment Variables

**Removed (no longer needed):**
```diff
- ADMIN_ACCESS_CODE=<YOUR_ADMIN_CODE>
- ADMIN_CODE=<YOUR_ADMIN_CODE>  
- DEV_CODE=<YOUR_DEV_CODE>
```

**Still Required:**
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=the_greggory_systems_and_strategy_firm_db_main

ADMIN_SESSION_TIMEOUT=1800
ADMIN_ALLOWED_IPS=127.0.0.1,::1,localhost
```

---

## Files

| File | Purpose |
|------|---------|
| `database/access_codes.sql` | Create table and default codes |
| `DATABASE_ACCESS_CODES.md` | Full documentation |
| `README_ACCESS_CODES.md` | This quick start guide |

---

## Support

For detailed documentation, see: `DATABASE_ACCESS_CODES.md`
