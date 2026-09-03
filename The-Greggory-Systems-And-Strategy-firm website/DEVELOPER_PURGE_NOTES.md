# Developer Purge Notes

## Summary
Developer-related items have been purged from the project **except the database tables**. This document tracks what was removed and what remains to avoid confusion during future development.

## What Was Purged (Code/Files)

### Frontend
- Developer-specific UI components, pages, and routes that were separate from admin/client flows
- Developer dashboard panels and widgets
- Developer-specific navigation items
- Developer onboarding/wizard flows

### Backend
- Dedicated developer route modules (if any existed separately)
- Developer-specific middleware
- Developer notification templates

### Auth & Verification
- Developer verification routes merged into admin verification flow
- Developer registration flows consolidated

## What Remains (Database Tables)

The following developer-related database tables are **INTACT** and still in use:

| Table | Status | Notes |
|-------|--------|-------|
| `developer_users` | ✅ Active | Stores developer identity records |
| `developer_level` enum | ✅ Active | Used in `developer_users.developer_level` |

### Table Schema (developer_users)
```sql
-- Core identity columns (shared with users/admin_users)
id, email, first_name, last_name, display_name, phone_number,
physical_address, id_number, alt_phone, expertise, private_notes,
manual_projects, emergency_contact_name, emergency_contact_phone,
department, mission_briefing, is_active, last_login_at, last_login_ip,
created_at, updated_at, deleted_at,

-- Developer-specific
developer_level, tech_stack, access_level,
password_hash, profile_image_id,
whatsapp_auth_key, whatsapp_verified, last_active_at
```

## Active Code Paths That Still Reference Developers

### Backend Routes (`backend/routes/admin.js`)
- `GET /api/admin/users/:id?role_type=developer` — fetches a developer user
- `PUT /api/admin/users/:id?role_type=developer` — updates a developer user
- `DELETE /api/admin/users/:id?role_type=developer` — soft-deletes a developer user
- `GET /api/admin/users` list — includes `developer_users` in the UNION
- `GET /api/admin/live-users` — includes `developer_users` in the UNION

### Frontend
- `Users.jsx` — user list shows `source_table = 'developer'` entries
- `UserDetail.jsx` — view page handles `roleType = 'developer'`
- `UserForm.jsx` — edit form handles `role_type = 'developer'`
- `AdminRouter.jsx` — routes `/admin/users/detail/:id/developer` → UserDetail

### Database
- `developer_users` table is actively queried by the above routes
- Foreign keys from other tables may reference `developer_users.id`

## What This Means for Development

1. **Do NOT re-add developer-specific UI panels** — the admin dashboard handles all user types through the unified user management interface.

2. **The `developer_users` table is still live** — any developer accounts in the DB are still accessible via the admin panel (Users → click a developer name → edit).

3. **The `role_type=developer` path is still functional** — the admin routes handle developer users through the same code path as admin/client users, just with a different `tableName` mapping.

4. **If you need to fully purge developers in the future**, you would need to:
   - Drop the `developer_users` table
   - Remove the `developer_users` UNION from the user list queries
   - Remove the `developer` branch from the `tableMap` in the PUT/GET/DELETE handlers
   - Remove developer-specific columns from shared queries

## Verification

To confirm the current state:
```bash
# Check developer_users table exists and has data
node -e "const db=require('./backend/config/database'); db.promise().query('SELECT COUNT(*) as n FROM developer_users WHERE deleted_at IS NULL').then(([r])=>{console.log('Active dev users:', r[0].n); process.exit(0);});"

# Check admin routes handle developer role_type
grep -n "developer" backend/routes/admin.js
```

---
*Last updated: 2026-09-03*
