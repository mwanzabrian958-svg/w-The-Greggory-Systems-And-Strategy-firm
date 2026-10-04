/**
 * Restore the most recent cloud snapshot into the new Aiven `defaultdb`.
 *
 * WHY THIS IS A SCRIPT AND NOT A ONE-LINER
 * ----------------------------------------
 * The old Aiven service is gone (NXDOMAIN), so the live rows can only come from
 * backups/cloud-snapshot-*.json. Snapshot 1790960427945 (2026-10-02) is the
 * newest one taken against the old `thegreggorysystemsandstrategyfirmdbmain`
 * and it carries real content: 1 user, 1 admin, team_members, website_content,
 * contact_forms, auth_request_log. Restoring it is what puts the admin login
 * back — the schema-only import left every table empty, which would have locked
 * you out entirely.
 *
 * SAFETY
 * ------
 * - RESTORE tables are truncated before insert, so re-running is safe.
 * - `password` columns are copied verbatim: these are bcrypt hashes and MUST NOT
 *   be re-hashed, or every restored login breaks.
 * - Columns are matched by name from the table's own definition, so a snapshot
 *   key that no longer exists is skipped instead of aborting the restore.
 * - Rows are inserted with explicit column lists, never positionally.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const SNAPSHOT =
  process.env.RESTORE_SNAPSHOT ||
  path.join(__dirname, '..', 'backups', 'cloud-snapshot-1790960427945.json');

const connOpts = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: false },
  connectTimeout: 20000,
};

(async () => {
  const snap = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
  console.log('=== RESTORE CLOUD SNAPSHOT -> AIVEN ===');
  console.log('snapshot :', path.basename(SNAPSHOT));
  console.log('taken    :', snap.generatedAt);
  console.log('from db  :', snap.database);
  console.log('to       :', connOpts.host + '/' + connOpts.database);

  const conn = await mysql.createConnection({ ...connOpts });
  let restored = 0, skipped = 0, empty = 0;
  try {
    // One transaction: a partial restore is worse than none, because a table can
    // end up half-populated with no record of where the run stopped.
    await conn.beginTransaction();
    for (const [table, rowsRaw] of Object.entries(snap.tables || {})) {
      const rows = Array.isArray(rowsRaw) ? rowsRaw : [];
      if (!rows.length) { empty++; continue; }

      const [exists] = await conn.query(
        "SELECT COUNT(*) n FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name=?",
        [table]
      );
      if (!exists[0].n) {
        console.log(`  SKIP  ${table} (not in schema, ${rows.length} rows)`);
        skipped += rows.length;
        continue;
      }

      await conn.query('SET FOREIGN_KEY_CHECKS = 0');
      await conn.query('TRUNCATE TABLE `' + table + '`');

      // The snapshot is JSON, so every timestamp arrives as an ISO-8601 string
      // ("2026-09-27T17:43:48.000Z"). MySQL DATETIME rejects that format with
      // ER_TRUNCATED_WRONG_VALUE, so DATETIME/TIMESTAMP columns are converted
      // to "YYYY-MM-DD HH:MM:SS" before insert. Non-date columns pass through
      // untouched, so bcrypt hashes are never altered.
      const [colRows] = await conn.query(
        'SELECT COLUMN_NAME, DATA_TYPE FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name=?',
        [table]
      );
      const dateCols = new Set(
        colRows
          .filter((c) => /date|time/i.test(c.DATA_TYPE || c.data_type))
          .map((c) => c.COLUMN_NAME || c.column_name)
      );
      // Only columns that still exist on THIS table are written; the snapshot is
      // older than the schema, so it carries keys that have since been dropped
      // (users.mission_briefing, admin_users.last_active_at, ...).
      const liveCols = new Set(
        colRows.map((c) => c.COLUMN_NAME || c.column_name)
      );

      const snapCols = Object.keys(rows[0]);
      const useCols = snapCols.filter((c) => liveCols.has(c));
      const dropped = snapCols.filter((c) => !liveCols.has(c));
      if (dropped.length) console.log(`        (dropped absent cols: ${dropped.join(', ')})`);
      if (!useCols.length) { skipped += rows.length; continue; }

      const list = useCols.map((c) => '`' + c + '`').join(', ');
      const ph = useCols.map(() => '?').join(', ');
      let n = 0;
      for (const r of rows) {
        const vals = useCols.map((c) => {
          let v = r[c];
          if (v === undefined || v === null) return null;
          if (dateCols.has(c) && typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) {
            return v.replace('T', ' ').replace(/\.\d+Z$/, '').replace(/Z$/, '');
          }
          if (typeof v === 'object') return JSON.stringify(v);
          return v;
        });
        await conn.query(
          'INSERT INTO `' + table + '` (' + list + ') VALUES (' + ph + ')',
          vals
        );
        n++;
      }
      restored += n;
      console.log(`  OK    ${table}: ${n} rows`);
    }
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    await conn.commit();
    console.log(`\nRESTORED ${restored} rows (${empty} empty tables, ${skipped} rows skipped).`);
  } catch (e) {
    await conn.rollback();
    console.error('RESTORE FAILED, rolled back:', e.code || e.message);
    process.exitCode = 1;
  } finally {
    await conn.end();
  }
})().catch((e) => {
  console.error('RESTORE ERROR:', e.code || e.message);
  process.exit(1);
});