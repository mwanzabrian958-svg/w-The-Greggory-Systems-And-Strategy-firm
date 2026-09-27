# Database SQL

All SQL for The Greggory Systems And Strategy Firm lives in this folder.
Database name: `the_greggory_systems_and_strategy_firm_db_main`

## Files

| File | Purpose | Run when |
| --- | --- | --- |
| `the-greggory-systems-and-strategy-firm-db-main.sql` | Full seed dump: `DROP`/`CREATE DATABASE`, all tables, indexes, seed data, and views. | Fresh install. **Drops the database** — never run against production data you want to keep. |
| `AUTH_ENDPOINTS_SCHEMA.sql` | `auth_platform_mapping`, `auth_request_log`, `auth_validation_rules` + monitoring views and their seed rows. | After the seed dump, for the auth-endpoint feature. Idempotent (`IF NOT EXISTS`). |
| `portal-sync-schema.sql` | Client Portal tables (e.g. `user_projects`). | After the seed dump, for portal features. Idempotent. |
| `add_role_column_to_users.sql` | Adds `users.role` (`DEFAULT 'user'`) after `primary_role` — guarded by an `information_schema` lookup so it is valid on MySQL 8 **and** MariaDB. | One-off migration on older installs; a no-op on a fresh one (the dump already declares `role`). |
| `fix-missing-brian-mwanza.sql` | Seeds the founder profile into `company_personnel` if absent (Brian Mwanza = id 1, read by the About page fallback). | After the seed dump. Idempotent. |
| `check_users_table.sql` | Read-only diagnostics: `SHOW CREATE TABLE users`, column list, sample rows. | Any time, to inspect the `users` table. Safe — SELECT/`SHOW` only. |

## Recommended order

1. `the-greggory-systems-and-strategy-firm-db-main.sql`
2. `AUTH_ENDPOINTS_SCHEMA.sql`
3. `portal-sync-schema.sql`
4. `add_role_column_to_users.sql`
5. `fix-missing-brian-mwanza.sql`

## Notes

- `schema-sync.json` intentionally stays in `database/` (not here) because it is
  `require()`d by `scripts/sync-db-tables.js` and `scripts/compare-seed-vs-phpmyadmin.js`.
- `scripts/initialize-db.js`, `scripts/import-if-empty.js` and
  `scripts/compare-seed-vs-phpmyadmin.js` load the seed dump from this folder.
- The password-reset columns (`password_reset_token`, `password_reset_expires`,
  `password_reset_attempts`, etc.) are created at boot by
  `backend/routes/users.js` → `ensurePasswordResetColumns()`, so they are not in the dump.
- Known nit: `check_users_table.sql` queries
  `the_greggory_systems_and_strategy_firm_db_main`, matching the database the
  seed dump creates.


## Fixes applied (schema audit)

- **Duplicate table definitions removed.** `project_tasks` and
  `project_expenses` were each declared **twice** with contradictory shapes
  (one tied to `user_projects`/`projects`, one to `client_projects`, with
  different status enums, date types and column names). Because both used
  `CREATE TABLE IF NOT EXISTS`, only the **first** was ever created and the
  second was dead code in every database. The dead copies are gone, replaced by
  a comment pointing at the surviving definition. The application queries the
  surviving one, so **no live behaviour changed**.
- **`FOREIGN_KEY_CHECKS` now toggled in the dump itself.** `website_content`
  is created before `users` but carries `FOREIGN KEY (updated_by) REFERENCES
  users(id)`, so a top-to-bottom import with referential integrity on failed
  with errno 150. The dump now disables checks after the `SQL_MODE` line and
  re-enables them in its final line. `scripts/initialize-db.js` does the same
  around its statement loop; `scripts/import-if-empty.js` already did.
- **`ADD COLUMN IF NOT EXISTS` removed** (MariaDB-only; a parse error on the
  MySQL 8 cloud database). Replaced with an `information_schema` probe in both
  this folder's `add_role_column_to_users.sql` and
  `backend/routes/users.js` -> `ensurePasswordResetColumns()`.
- `check_users_table.sql` pointed at `..._firm_db`; corrected to
  `..._firm_db_main`.
- `schema-sync.json` was left untouched: it is generated from the live database
  by `scripts/sync-db-schema.js`, so its `app_status_enum` / `prop_type_enum`
  entries are real tables, not stray artifacts.

## Follow-up fixes (policy + import safety)

- **Password policy is now `8` everywhere a password is SET**, matching the
  single declared rule (`auth_validation_rules.password_min_length = 8`, seeded
  for the `user`, `admin` and `developer` platforms alike):
  - `backend/routes/users.js` — user signup (already 8, kept)
  - `backend/routes/admin-verification.js` — admin/developer `/register`
    previously checked only that a password was *present*; it now enforces 8
  - `server.js` — `/api/users/change-password` was 6, now 8
  - `src/pages/ClientPortal.jsx` — change-password was 6, now 8
  - `src/pages/Signup.jsx`, `src/pages/ResetPassword.jsx` — 8 (unchanged)
  - `src/admin/pages/Login.jsx` — admin registration: `minLength` 6 -> 8, plus
    an explicit check
  - `src/components/AuthPlatformModal.jsx` — registration modal: `minLength`
    6 -> 8, plus an explicit check
  - **Login is deliberately exempt.** `src/pages/Login.jsx` no longer applies a
    minimum length, because the policy belongs at set/change time; enforcing it
    at login would lock out accounts created when the minimum was 6.
- **`website_content` moved below `users`** in the seed dump, so the dump is now
  valid on its own with referential integrity **on** (0 forward references).
- **`user_sessions` added to the dump**, matching
  `backend/utils/userSessions.js` (`ensureSessionTable`) column for column, so a
  database restored from this dump is complete without waiting for the app to
  self-heal it.
- Removed the redundant `INDEX idx_users_email (email)` from `users`: the
  `UNIQUE` constraint already provides that index. (Existing databases keep
  theirs; drop it manually if you want the space back.)
- `portal-sync-schema.sql` — its 9 tables now declare
  `DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci` like the rest, instead
  of relying on the database default.
- `check_users_table.sql` — the example INSERT referenced a `name` column that
  does not exist on `users` (it is `first_name`/`last_name`), and suggested
  hashing passwords with `MD5`/`SHA2`. Both corrected: the backend verifies with
  bcrypt, so only a bcrypt hash will ever match.
