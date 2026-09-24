#!/usr/bin/env node
/**
 * Add `users.google_id` — the column that remembers WHICH Google account
 * belongs to a client node (used by POST /api/users/google-auth).
 *
 *   node scripts/add-google-id-column.js --dry-run   # report only
 *   node scripts/add-google-id-column.js             # apply
 *
 * Google sign-in works without this column (accounts are matched by email),
 * but with it the link survives an email change on either side and a second
 * Google account can never be confused with the first. Idempotent: running it
 * twice changes nothing. See GOOGLE_SIGNIN_SETUP.md
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const db = require("../backend/config/database");

const DRY_RUN = process.argv.includes("--dry-run");
const columnSql = "ALTER TABLE users ADD COLUMN google_id VARCHAR(64) NULL";
const indexSql = "ALTER TABLE users ADD UNIQUE KEY uniq_users_google_id (google_id)";

(async () => {
  try {
    const [columns] = await db.promise().query(
      `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'google_id'
       LIMIT 1`,
    );

    if (columns.length > 0) {
      console.log(`OK  users.google_id already exists (${columns[0].COLUMN_TYPE}) — nothing to do.`);
      process.exit(0);
    }

    if (DRY_RUN) {
      console.log("--  dry run — would run:");
      console.log(`      ${columnSql}`);
      console.log(`      ${indexSql}`);
      process.exit(0);
    }

    await db.promise().query(columnSql);
    console.log("OK  added users.google_id");

    // Unique index (multiple NULLs are allowed, so unlinked accounts are fine).
    // Non-fatal: the column alone is enough for Google sign-in to work.
    try {
      const [indexes] = await db.promise().query(
        `SELECT INDEX_NAME FROM information_schema.STATISTICS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'
           AND INDEX_NAME = 'uniq_users_google_id' LIMIT 1`,
      );
      if (indexes.length > 0) {
        console.log("OK  unique index uniq_users_google_id already present");
      } else {
        await db.promise().query(indexSql);
        console.log("OK  added unique index uniq_users_google_id");
      }
    } catch (indexError) {
      console.warn("--  unique index skipped (column is in place):", indexError.code || indexError.message);
    }

    console.log("OK  done — restart the server, then sign in with Google once to link an account.");
    process.exit(0);
  } catch (error) {
    console.error("!!  failed:", error.code || "", error.message);
    console.error("    The script uses the same endpoints as the app (XAMPP locally / Aiven in the cloud).");
    console.error("    Start XAMPP first if this is a local run, or check DB_* in .env.");
    process.exit(1);
  }
})();
