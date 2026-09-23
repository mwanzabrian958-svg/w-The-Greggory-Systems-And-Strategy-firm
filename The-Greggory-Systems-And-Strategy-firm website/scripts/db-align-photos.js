/**
 * db-align-photos.js — put every identity's photo on its OWN source table.
 *
 *   node scripts/db-align-photos.js            # dry run (report only)
 *   node scripts/db-align-photos.js --apply    # write the alignment
 *
 * Why: the photo routes resolve by source table —
 *   client -> users | admin -> admin_users | developer -> developer_users —
 * so a person who uploaded a photo from the client portal only has it on
 * `users`. Their admin/developer row stays NULL and the admin platform shows
 * initials. This script copies that photo onto the matching admin/developer row
 * (never overwriting an existing one) and normalizes wildcard MIME values such
 * as "image/*" to the real image type.
 */
require("dotenv").config({ quiet: true });
const mysql = require("mysql2/promise");

const APPLY = process.argv.includes("--apply");

/** Concrete image type from magic bytes (mirrors resolveImageMimeType in server.js). */
function sniffMime(blob, storedMime) {
  const mime = String(storedMime || "").toLowerCase().trim();
  if (/^image\/(jpeg|jpg|png|gif|webp|avif|bmp)$/.test(mime)) {
    return mime === "image/jpg" ? "image/jpeg" : mime;
  }
  if (!blob || blob.length < 4) return "image/jpeg";
  if (blob.length > 12 && blob.toString("ascii", 0, 4) === "RIFF" && blob.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  if (blob[0] === 0xff && blob[1] === 0xd8) return "image/jpeg";
  if (blob[0] === 0x89 && blob[1] === 0x50 && blob[2] === 0x4e && blob[3] === 0x47) return "image/png";
  if (blob.toString("ascii", 0, 3) === "GIF") return "image/gif";
  if (blob.length > 12 && blob.toString("ascii", 4, 12) === "ftypavif") return "image/avif";
  if (blob[0] === 0x42 && blob[1] === 0x4d) return "image/bmp";
  return "image/jpeg";
}

async function tableExists(conn, table) {
  const [rows] = await conn.query(
    "SELECT COUNT(*) AS n FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?",
    [table],
  );
  return rows[0].n > 0;
}

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    connectTimeout: 20000,
  });

  console.log(`mode: ${APPLY ? "APPLY (writing)" : "dry run (read only)"}`);
  console.log(`db  : ${process.env.DB_NAME} @ ${process.env.DB_HOST}\n`);

  let linked = 0;
  let normalized = 0;

  // ── 1. Fill a missing photo on admin/developer rows from the same person's
  //       `users` row (matched on email). Never overwrites an existing photo.
  for (const table of ["admin_users", "developer_users"]) {
    if (!(await tableExists(conn, table))) {
      console.log(`${table}: (table does not exist — skipped)`);
      continue;
    }
    const [rows] = await conn.query(
      `SELECT a.id, a.email, a.display_name,
              u.profile_photo_blob, u.profile_photo_mime_type, u.profile_photo_file_name
       FROM ${table} a
       JOIN users u ON LOWER(u.email) = LOWER(a.email)
       WHERE a.profile_photo_blob IS NULL
         AND a.profile_image_id IS NULL
         AND u.profile_photo_blob IS NOT NULL
       ORDER BY a.id`,
    );

    console.log(`${table}: ${rows.length} row(s) missing a photo that users holds`);
    for (const r of rows) {
      const mime = sniffMime(r.profile_photo_blob, r.profile_photo_mime_type);
      const fileName = r.profile_photo_file_name || "profile.jpg";
      console.log(
        `  ${table} #${r.id} ${JSON.stringify(r.display_name || r.email)} <- users photo (${r.profile_photo_blob.length} bytes, ${mime})`,
      );
      if (APPLY) {
        await conn.query(
          `UPDATE ${table}
             SET profile_photo_blob = ?, profile_photo_mime_type = ?, profile_photo_file_name = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ? AND profile_photo_blob IS NULL AND profile_image_id IS NULL`,
          [r.profile_photo_blob, mime, fileName, r.id],
        );
      }
      linked += 1;
    }
  }

  // ── 2. Normalize wildcard/invalid MIME values so <img> tags render.
  console.log("");
  for (const table of ["users", "admin_users", "developer_users"]) {
    if (!(await tableExists(conn, table))) continue;
    const [rows] = await conn.query(
      `SELECT id, profile_photo_mime_type, profile_photo_blob
       FROM ${table}
       WHERE profile_photo_blob IS NOT NULL
         AND (profile_photo_mime_type IS NULL
              OR profile_photo_mime_type NOT REGEXP '^image/(jpeg|jpg|png|gif|webp|avif|bmp)$')`,
    );
    if (rows.length === 0) {
      console.log(`${table}: MIME types already concrete`);
      continue;
    }
    for (const r of rows) {
      const mime = sniffMime(r.profile_photo_blob, r.profile_photo_mime_type);
      console.log(
        `  ${table} #${r.id}: ${JSON.stringify(r.profile_photo_mime_type)} -> ${mime}`,
      );
      if (APPLY) {
        await conn.query(`UPDATE ${table} SET profile_photo_mime_type = ? WHERE id = ?`, [
          mime,
          r.id,
        ]);
      }
      normalized += 1;
    }
  }

  await conn.end();
  console.log(
    `\n${APPLY ? "DONE" : "DRY RUN"} — ${linked} photo(s) ${APPLY ? "linked" : "to link"}, ${normalized} MIME value(s) ${APPLY ? "normalized" : "to normalize"}.`,
  );
  if (!APPLY) console.log("Re-run with --apply to write these changes.");
}

main().catch((e) => {
  console.error("FAILED:", e.message);
  process.exit(1);
});
