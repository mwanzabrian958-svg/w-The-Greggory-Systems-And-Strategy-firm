# Homepage Database and Hero Verification

**Checked:** 2026-11-06  
**Status:** Aiven TLS and all 91 local table definitions verified; Render still requires deployment, and homepage content has not been populated.

## Hero image

- The homepage uses `/hero-phoenix.jpg`, which exists in `public/` and builds successfully.
- The local browser rendered the phoenix and wordmark. The image request returned `200 image/jpeg`.
- `src/pages/Home.jsx` now has accurate alt text and a bounded retry for transient image request failures.
- The live homepage still showed a broken image and the previous skyline alt text during inspection, indicating the current live deployment does not include that local change. Opening the live image URL directly did load the JPEG.

## Homepage database feed

- The homepage requests `/api/posts/portfolio` and `/api/posts/testimonials`.
- Admin Posts are for the public website: Portfolio Manager writes `/api/posts/admin/portfolio`, and Posts & Testimonials writes `/api/posts/admin/testimonials`. The public Home page reads the published records from the two public endpoints above. The Client Portal does not call `/posts/*`; these records do not update client portal projects, invoices, or documents.
- The admin dashboard navbar is not populated from `admin_navbar_items`: its link list is hard-coded in `src/admin/utils/permissions.js`. Aiven currently has 8 rows in `admin_navbar_items`, but the current sidebar does not query that table. Role-based visibility is fetched from `/api/admin/settings` (`admin_settings`); Aiven currently has no `role_permissions_*` settings, so the code uses its default navigation behavior.
- The public routes query `portfolio_items`, `portfolio_media`, and `testimonials` through the MySQL connection in `backend/config/database.js`.
- Live checks returned HTTP 500 for both content routes. `/api/health` returned HTTP 200 but reported `database: "unknown"`.
- The bundled Aiven CA was stale. The live MySQL TLS chain presents Project CA `11d76f9c-06ba-4eff-9461-71cff10ea849`; the bundle previously pinned a different Project CA. The new CA was validated with a certificate-verified, read-only MySQL connection. Do not disable certificate verification.
- Aiven's configured database is `defaultdb`. It had no application tables at inspection time. The existing boot-time `sync-db-schema.js` contains idempotent DDL for the homepage tables.
- The updated bundled CA now verifies Aiven's live MySQL TLS chain. `SELECT 1` succeeded with certificate verification enabled.
- The repository's Posts schema sync created the three homepage tables in Aiven. The empty-database seed import then stopped on a SQL syntax error in a `website_content` value; the subsequent schema sync completed. The updated schema sync also created the active admin tables `crm_contacts` and `management_info` in Aiven.
- No portfolio, media, or testimonial rows were copied from local MySQL. Aiven currently has zero rows in all three homepage tables; publish the intended content through the admin Posts area.
- Schema-only capture from phpMyAdmin refreshed `database/schema-sync.json` to 91 tables. Applying it to Aiven created the eight missing tables without copying records. A final information-schema comparison confirmed 91 local and 91 Aiven tables, with no table-name differences.

## Admin Navbar Pipeline Audit

Static route audit result: 70 admin UI API paths have handlers; 0 missing and 0 unmounted route files. Aiven contains all 91 local table names. The matrix below distinguishes a wired database pipeline from a working, semantically correct feature.

| Navbar item | API and database tables | Website/client consumer and result |
|---|---|---|
| Dashboard | `/api/admin/dashboard`, `/api/admin/budget-overview`, `/api/admin/pending-approvals`, `/api/admin/pending-invoices`, `/api/admin/team`; reads `users`, `user_projects`, `change_requests`, `project_invoices`, `invoices`, `team_members` | Admin-only aggregate view; project and invoice source rows are also used by client-facing project/billing views. |
| User Management | `/api/users`, `/api/admin/users/*`; reads/writes `users` and `admin_users` | Manages client/admin accounts. Client Portal authenticates and displays the `users` account's own data. |
| Personnel | `/api/company-personnel*`; table `company_personnel` | Public About and personnel-profile pages read active personnel. |
| Team | `/api/admin/team*`, `/api/admin/team-templates*`; tables `team_members`, `team_templates`, `team_template_members` | Admin team/assignment editor; Client Portal project-team widget reads team templates. |
| Projects | `/api/user-projects*`, `/api/projects/:id/tasks*`; tables `user_projects`, project/task tables | Admin manages projects and tasks; Client Portal reads the scoped project/task records. |
| Applications | UI calls `/api/admin/pending-invoices`; table `invoices`. A separate `/api/admin/applications` handler reads `applications` and `app_status_enum`, but this page does not call it. | **Mismatched pipeline:** the Applications screen is showing invoices as applications; its Audit/Validate buttons have no handlers. No valid application workflow is connected from this page. |
| Blog | `/api/blog-articles*`, `/api/website-content*`; tables `blog_articles`, `website_content` | Public Blog/BlogDetails pages read blog articles; public site content uses website-content values. |
| Posts & Testimonials | `/api/posts/admin/testimonials*`; table `testimonials` | Published testimonials are read by the public Home page. |
| Portfolio Manager | `/api/posts/admin/portfolio*`; tables `portfolio_items`, `portfolio_media` | Published portfolio entries feed the Home page and Case Studies page. |
| Media Library | `/api/images*`; table `images` | Admin-only image storage/listing. No public page consumer of this table was found. |
| Messages | `/api/contact-forms`; table `contact_forms` | Public Contact form writes; admin Email Inbox reads. **Access-control gap:** the GET handler has no `authenticateAdmin` middleware while returning contact submissions. |
| Support | `/api/feedback`, `/api/admin/change-requests*`, `/api/admin/signature-requests`; tables `client_feedback`, `change_requests`, `document_signatures` | Client Portal sends feedback/change/signature requests; Support reviews and updates them. |
| Financial Hub | `/api/admin/ledger`, `/api/invoices*`, `/api/mpesa/transactions`, portal invoice APIs; tables `accounting_entries`, `invoices`, `invoice_line_items`, `project_invoices`, `mpesa_transactions` | Admin finance workflows; Client Portal reads invoices and payment status. |
| Reports | `/api/admin-complete/budget-overview`, `/api/invoices`, `/api/user-projects`, `/api/admin/ledger`, `/api/admin/reports`; reads `project_reports` and finance/project tables | Admin-only reports and aggregates; underlying project/finance records are shared with the Client Portal. |
| Records | `/api/admin/client-documents`; tables `client_documents`, `users`, `client_projects` | Admin document register; client documents are also shown in the Client Portal. |
| Security | No API or table read by `Security.jsx`; security nodes and threat entries are hard-coded. | **Not live telemetry:** displayed “Active”/“Valid” statuses do not come from database or security checks. |
| Data Safety | `/api/admin/data-safety-summary`, audit/access-log and backup endpoints; reads `audit_logs`, `data_access_logs`, classification/retention tables | Admin-only compliance/backup view. The summary endpoint hard-codes `backup_status: "current"` and `encrypted: true`; those fields are not proof of actual backup/encryption state. |
| Activity Logs | `/api/admin/activity-logs`; table `admin_activity_logs` | Internal admin audit feed; not public/client-visible. |
| Roles & Permissions | `/api/admin/settings`; table `admin_settings`, keys `role_permissions_<level>` | Controls which admin navbar items each role sees. Aiven currently has no saved role-permission keys, so defaults are used. |
| Settings | `/api/admin/node-settings`, `/api/admin/system-calibration`, profile-photo endpoints; tables `admin_settings`, `admin_users` | Admin configuration/profile. Some public configuration values are read by the public site; admin profile data stays private. |
| Push Notifications | `/api/fcm/status`, `/api/fcm/devices`, `/api/fcm/send`; reads FCM tokens from `users` and `admin_users`, writes notification records | Sends to registered Android-app devices; not a public website navbar/content feed. |

## Verification run

- Production build: passed. Vite emitted an existing large-chunk warning.
- Focused posts-route tests: 10 passed, 0 failed.
- Local hero asset request: `200 image/jpeg`.
- Production `/api/posts/portfolio` and `/api/posts/testimonials`: `500` at inspection time.
- Production health check: `database: "unknown"` at inspection time.
- Recheck after the Aiven schema setup still returned `500` from both production Posts endpoints and `database: "unknown"`; the Render deployment has not picked up the updated source.
- Aiven certificate-verified `SELECT 1`: passed when using the CA presented by the live service.
- Aiven posts-router checks, with local DB endpoints explicitly disabled: both routes returned HTTP 200, `success: true`, and empty arrays.
- Aiven homepage/admin table check after schema sync: `portfolio_items`, `portfolio_media`, `testimonials`, `crm_contacts`, and `management_info` are present; homepage row counts are zero.
- Latest local-vs-Aiven base-table comparison: 91 local, 91 Aiven, exact table-name match.
- Aiven-only public Posts routes: both returned HTTP 200 and `success: true`, with empty arrays because no content rows were migrated or published.
- Empty-database SQL seed import: incomplete due a syntax error in `website_content`; schema sync completed afterward.

## Required before declaring production fixed

1. Deploy the updated bundled CA, hero retry, and corrected alt text to Render. Keep TLS certificate verification enabled; check that any `DB_CA_PEM`/`DB_CA_FILE` override is current or unset.
2. Review Render logs for the seed SQL syntax error and repair/retry only the `website_content` seed if that bootstrap data is required.
3. Publish the intended portfolio entries and any testimonials through the admin Posts area; the Aiven endpoints currently return valid empty arrays.
4. Recheck Render `/api/health` and require `database: "connected"`; then check both public posts endpoints return HTTP 200 with the expected rows.
5. Verify the live hero image and corrected alt text in a fresh browser load.

Until those production checks pass, the database feed and live hero must not be described as fully fixed.
