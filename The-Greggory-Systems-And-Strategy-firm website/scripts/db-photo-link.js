/**
 * db-photo-link.js — confirm the admin↔user identity link for photo fallback.
 *
 *   node scripts/db-photo-link.js
 *
 * For each admin, shows the matching `users` row (by email) and whether each
 * side holds a profile photo, so we can wire a cross-table fallback safely.
 */
require("dotenv").config({ quiet: true });
const mysql = require("mysql2/promise");

async function main() {
  const pool = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    connectTimeout: 20000,
  });

  const [admins] = await pool.query(
    `SELECT a.id AS admin_id, a.email AS admin_email, a.display_name,
            (a.profile_photo_blob IS NOT NULL OR a.profile_image_id IS NOT NULL) AS admin_has_photo,
            u.id AS user_id, u.display_name AS user_name,
            (u.profile_photo_blob IS NOT NULL OR u.profile_image_id IS NOT NULL) AS user_has_photo,
            u.profile_photo_mime_type AS user_mime
     FROM admin_users a
     LEFT JOIN users u ON LOWER(u.email) = LOWER(a.email)
     ORDER BY a.id`
  );

  if (admins.length === 0) {
    console.log("No admin_users rows found.");
    await pool.end();
    return;
  }

  console.log("admin → users link (matched on email):\n");
  for (const r of admins) {
    const linked = r.user_id != null;
    console.log(
      [
        `admin #${r.admin_id}`,
        `email=${JSON.stringify(r.admin_email)}`,
        `admin_photo=${r.admin_has_photo ? "YES" : "NO"}`,
        linked
          ? `→ users #${r.user_id} "${r.user_name}" user_photo=${r.user_has_photo ? "YES" : "NO"} mime=${r.user_mime || "?"}`
          : "→ NO matching users row by email",
      ].join("  ")
    );
  }

  await pool.end();
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});