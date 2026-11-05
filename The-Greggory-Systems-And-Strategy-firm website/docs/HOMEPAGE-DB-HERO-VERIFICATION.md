# Homepage Database and Hero Verification

**Checked:** 2026-11-06  
**Status:** Aiven TLS and schema verified; Render still requires deployment, and homepage content has not been populated.

## Hero image

- The homepage uses `/hero-phoenix.jpg`, which exists in `public/` and builds successfully.
- The local browser rendered the phoenix and wordmark. The image request returned `200 image/jpeg`.
- `src/pages/Home.jsx` now has accurate alt text and a bounded retry for transient image request failures.
- The live homepage still showed a broken image and the previous skyline alt text during inspection, indicating the current live deployment does not include that local change. Opening the live image URL directly did load the JPEG.

## Homepage database feed

- The homepage requests `/api/posts/portfolio` and `/api/posts/testimonials`.
- The public routes query `portfolio_items`, `portfolio_media`, and `testimonials` through the MySQL connection in `backend/config/database.js`.
- Live checks returned HTTP 500 for both content routes. `/api/health` returned HTTP 200 but reported `database: "unknown"`.
- The bundled Aiven CA was stale. The live MySQL TLS chain presents Project CA `11d76f9c-06ba-4eff-9461-71cff10ea849`; the bundle previously pinned a different Project CA. The new CA was validated with a certificate-verified, read-only MySQL connection. Do not disable certificate verification.
- Aiven's configured database is `defaultdb`. It had no application tables at inspection time. The existing boot-time `sync-db-schema.js` contains idempotent DDL for the homepage tables.
- The updated bundled CA now verifies Aiven's live MySQL TLS chain. `SELECT 1` succeeded with certificate verification enabled.
- The repository's Posts schema sync created the three homepage tables in Aiven. The empty-database seed import then stopped on a SQL syntax error in a `website_content` value; the subsequent schema sync completed and Aiven now has 81 application tables, including `users`, `admin_users`, `portfolio_items`, `portfolio_media`, and `testimonials`.
- No portfolio, media, or testimonial rows were copied from local MySQL. Aiven currently has zero rows in all three homepage tables; publish the intended content through the admin Posts area.

## Verification run

- Production build: passed. Vite emitted an existing large-chunk warning.
- Focused posts-route tests: 10 passed, 0 failed.
- Local hero asset request: `200 image/jpeg`.
- Production `/api/posts/portfolio` and `/api/posts/testimonials`: `500` at inspection time.
- Production health check: `database: "unknown"` at inspection time.
- Recheck after the Aiven schema setup still returned `500` from both production Posts endpoints and `database: "unknown"`; the Render deployment has not picked up the updated source.
- Aiven certificate-verified `SELECT 1`: passed when using the CA presented by the live service.
- Aiven posts-router checks, with local DB endpoints explicitly disabled: both routes returned HTTP 200, `success: true`, and empty arrays.
- Aiven homepage-table check after schema sync: all three required tables are present; row counts are zero.
- Empty-database SQL seed import: incomplete due a syntax error in `website_content`; schema sync completed afterward.

## Required before declaring production fixed

1. Deploy the updated bundled CA, hero retry, and corrected alt text to Render. Keep TLS certificate verification enabled; check that any `DB_CA_PEM`/`DB_CA_FILE` override is current or unset.
2. Review Render logs for the seed SQL syntax error and repair/retry only the `website_content` seed if that bootstrap data is required.
3. Publish the intended portfolio entries and any testimonials through the admin Posts area; the Aiven endpoints currently return valid empty arrays.
4. Recheck Render `/api/health` and require `database: "connected"`; then check both public posts endpoints return HTTP 200 with the expected rows.
5. Verify the live hero image and corrected alt text in a fresh browser load.

Until those production checks pass, the database feed and live hero must not be described as fully fixed.
