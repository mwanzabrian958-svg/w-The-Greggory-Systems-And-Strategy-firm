#!/usr/bin/env node
/**
 * Seed the two SYSTEM registration documents into the database.
 *
 *   node scripts/seed-system-documents.js
 *
 * Copies:
 *   public/documents/GSSF_Client_Registration_Agreement.pdf
 *   public/documents/GSSF_Client_Registration_Agreement.docx
 * into `client_documents` as global, client-visible rows:
 *
 *   category      = 'SYSTEM_REGISTRATION'   (stable lookup key)
 *   client_id     = NULL                    (available to EVERY client)
 *   project_id    = NULL                    (not tied to a project)
 *   access_level  = 'public', status = 'approved'
 *
 * The blobs are stored in `file_data` (LONGBLOB) — the column is added
 * automatically when missing, so the script is safe to run on any schema.
 * Idempotent: re-running updates the existing rows (never duplicates them).
 *
 * Runs against BOTH configured MySQL endpoints (local XAMPP + cloud Aiven)
 * so the portal behaves identically in dev and production.
 */
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

require("dotenv").config();
const { endpoints: dbEndpoints } = require("../server/config/dbEndpoints");

const DOCS_DIR = path.join(__dirname, "..", "public", "documents");
const CATEGORY = "SYSTEM_REGISTRATION";

const DOCUMENTS = [
  {
    id: -101,
    title: "GSSF Client Registration Agreement (PDF)",
    summary: "Official registration agreement for The Greggory Firm services.",
    file_name: "GSSF_Client_Registration_Agreement.pdf",
    file_type: "application/pdf",
  },
  {
    id: -102,
    title: "GSSF Client Registration Agreement (MS Word)",
    summary: "Editable registration agreement for The Greggory Firm services.",
    file_name: "GSSF_Client_Registration_Agreement.docx",
    file_type:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
];

/** Add a column only when it is missing (works on MySQL and MariaDB alike). */
async function ensureColumn(conn, table, column, definition) {
  const [rows] = await conn.query(
    `SELECT COUNT(*) AS n FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column],
  );
  if (rows[0].n === 0) {
    await conn.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
    console.log(`   + added column ${table}.${column}`);
    return true;
  }
  return false;
}

async function seedEndpoint(label, cfg) {
  const { label: _drop, ...opts } = cfg;
  const conn = await mysql.createConnection({ connectTimeout: 20000, ...opts });
  try {
    console.log(`\n[${label}] ${opts.host}:${opts.port}`);

    // 1. Make sure the blob column exists.
    await ensureColumn(conn, "client_documents", "file_data", "LONGBLOB NULL");
    await ensureColumn(conn, "client_documents", "file_name", "VARCHAR(255) NULL");

    // 2. Upsert each system document.
    for (const doc of DOCUMENTS) {
      const filePath = path.join(DOCS_DIR, doc.file_name);
      if (!fs.existsSync(filePath)) {
        console.log(`   ! SKIP ${doc.file_name} (missing on disk)`);
        continue;
      }
      const buf = fs.readFileSync(filePath);

      const [existing] = await conn.query(
        `SELECT id FROM client_documents
          WHERE category = ? AND document_name = ? AND deleted_at IS NULL
          LIMIT 1`,
        [CATEGORY, doc.title],
      );

      if (existing.length > 0) {
        await conn.query(
          `UPDATE client_documents
              SET document_name = ?, file_name = ?, description = ?, document_type = 'legal',
                  file_path = ?, file_data = ?, file_size = ?, file_type = ?,
                  version_number = 1, is_current_version = 1, status = 'approved',
                  access_level = 'public', tags = 'system,registration,agreement',
                  updated_at = NOW()
            WHERE id = ?`,
          [
            doc.title,
            doc.file_name,
            doc.summary,
            `public/documents/${doc.file_name}`,
            buf,
            buf.length,
            doc.file_type,
            existing[0].id,
          ],
        );
        console.log(`   ~ updated id=${existing[0].id} ${doc.file_name} (${buf.length} bytes)`);
      } else {
        const [ins] = await conn.query(
          `INSERT INTO client_documents
             (project_id, client_id, document_name, document_type, category, description,
              file_name, file_path, file_data, file_size, file_type, version_number,
              is_current_version, status, access_level, tags)
           VALUES (NULL, NULL, ?, 'legal', ?, ?, ?, ?, ?, ?, ?, 1, 1, 'approved', 'public',
                   'system,registration,agreement')`,
          [
            doc.title,
            CATEGORY,
            doc.summary,
            doc.file_name,
            `public/documents/${doc.file_name}`,
            buf,
            buf.length,
            doc.file_type,
          ],
        );
        console.log(`   + inserted id=${ins.insertId} ${doc.file_name} (${buf.length} bytes)`);
      }
    }

    // 3. Verify.
    const [rows] = await conn.query(
      `SELECT id, file_name, file_size, file_type, LENGTH(file_data) AS blob_len
         FROM client_documents
        WHERE category = ? AND deleted_at IS NULL
        ORDER BY file_name`,
      [CATEGORY],
    );
    for (const r of rows) {
      const ok = r.blob_len === r.file_size ? "OK" : "SIZE MISMATCH";
      console.log(`   = id=${r.id} ${r.file_name} blob=${r.blob_len} type=${r.file_type} [${ok}]`);
    }
    console.log(`   total system documents in DB: ${rows.length}`);
  } finally {
    await conn.end();
  }
}

(async () => {
  const list = dbEndpoints();
  if (!list.length) {
    console.error("No DB endpoints configured — check DB_* / DB_*_2 env vars.");
    process.exit(1);
  }
  for (const cfg of list) {
    try {
      await seedEndpoint(cfg.label || cfg.host, cfg);
    } catch (err) {
      console.error(`   ! ${cfg.label} failed: ${err.code || err.message}`);
      process.exitCode = 1;
    }
  }
  console.log("\nDone.");
})();
