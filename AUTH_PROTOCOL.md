# Authentication Protocol - Greggory Foundation

## STRICT RULE: Table Isolation for User Credentials

Each authentication platform MUST only reference its designated table. **NO CROSS-TABLE AUTHENTICATION ALLOWED.**

### Platform-Table Mapping

| Platform | Auth Table | Purpose |
|----------|-----------|---------|
| **Regular User** | `users` | Public user accounts, donors, beneficiaries |
| **Admin** | `admin_users` | Administrative staff, moderators, super admins |
| **Developer** | `developer_users` | Development team, technical staff |

### Protocol Rules

1. **ISOLATED AUTHENTICATION**
   - User login → Query ONLY `users` table
   - Admin login → Query ONLY `admin_users` table
   - Developer login → Query ONLY `developer_users` table

2. **NO CROSS-REFERENCING**
   - Never check `admin_users` from user auth route
   - Never check `users` from admin auth route
   - Never check `developer_users` from user/admin routes

3. **SEPARATE REGISTRATION FLOWS**
   - User registration → Insert into `users` table ONLY
   - Admin registration → Insert into `admin_users` table ONLY
   - Developer registration → Insert into `developer_users` table ONLY

4. **SEPARATE SESSIONS**
   - `gf_user_session` → Regular users
   - `gf_admin_session` → Admins
   - `gf_developer_session` → Developers

### Implementation

**Backend Endpoints:**

| Platform | Register Endpoint | Login Endpoint | Table Used |
|----------|-------------------|----------------|------------|
| User | `POST /api/users/register` | `POST /api/users/login` | `users` |
| Admin | `POST /api/users/admin-create` | `POST /api/admin-verification/authenticate-enhanced` | `admin_users` |
| Developer | (via admin-create) | `POST /api/developer-verification/authenticate` | `developer_users` |

```javascript
// CORRECT - User Auth (users.js)
router.post('/login', (req, res) => {
  db.query('SELECT * FROM users WHERE email = ?', [email], ...)
  // ONLY users table - NO admin_users or developer_users check
})

router.post('/register', (req, res) => {
  db.query('INSERT INTO users ...', [...])
  // ONLY users table - NO cross-table insertion
})

// CORRECT - Admin Auth (admin-verification.js)
router.post('/authenticate-enhanced', (req, res) => {
  db.query('SELECT * FROM admin_users WHERE email = ?', [email], ...)
  // ONLY admin_users table - NO users check
})

// CORRECT - Developer Auth (developer-verification.js)
router.post('/authenticate', (req, res) => {
  db.query('SELECT * FROM developer_users WHERE email = ?', [email], ...)
  // ONLY developer_users table
})
```

### WRONG (DO NOT DO THIS)

```javascript
// WRONG - Cross-table checking
router.post('/login', (req, res) => {
  // DON'T check multiple tables
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, users) => {
    if (users.length === 0) {
      // DON'T fall back to admin_users
      db.query('SELECT * FROM admin_users WHERE email = ?', ...)
    }
  })
})
```

### Verification Checklist

- [ ] User auth route uses ONLY `users` table
- [ ] Admin auth route uses ONLY `admin_users` table
- [ ] Developer auth route uses ONLY `developer_users` table
- [ ] No email uniqueness checks across tables
- [ ] No password resets crossing table boundaries
- [ ] Sessions are platform-specific

### Current Implementation Status

| File | Table Used | Status |
|------|-----------|--------|
| `backend/routes/users.js` | `users` | ✅ Correct |
| `backend/routes/admin-verification.js` | `admin_users` | ✅ Correct |
| `backend/routes/users.js` (admin-create) | `admin_users` | ✅ Correct |

---
**Document Version:** 1.0
**Last Updated:** 2026-04-15
**Enforcement:** STRICT - No exceptions without written approval
