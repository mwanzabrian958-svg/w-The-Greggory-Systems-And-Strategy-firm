#!/usr/bin/env node
/**
 * Purge TEST DATA left behind by the verification suites.
 *
 *   node scripts/purge-test-data.js            # delete
 *   node scripts/purge-test-data.js --dry-run  # report only
 *
 * scripts/verify-auth.js, scripts/verify-features.js and scripts/full-audit.js
 * all create throw-away admin/developer/client accounts plus invoice, feedback,
 * category and crew rows. Historically they either cleaned up through ONE pool
 * (leaving residue in the other database) or not at all, so repeated runs
 * polluted the live DB.
 *
 * This module is the single source of truth for that cleanup: it removes only
 * rows that are unambiguously test artifacts (matching the generate/regex
 * patterns below) and runs against EVERY configured MySQL endpoint.
 *
 * SAFETY: nothing here matches a real account. Real addresses are on
 * gmail.com/company domains; every pattern below is scoped to the throw-away
 * @test.com / @example.com addresses and the AUD/Verify/Audit naming the
 * suites generate. Contact forms, personnel, website content and seeded demo
 * media are never touched.
 */
const mysql = require("mysql2/promise");

// Ordered child -> parent so FK constraints are satisfied.
const STEPS = [
  {
    table: "team_template_members",
    where: "template_id NOT IN (SELECT id FROM (SELECT id FROM team_templates) t)",
    label: "orphaned crew links",
  },
  { table: "team_templates", where: "name LIKE 'Audit%'", label: "audit crew templates" },
  {
    table: "team_members",
    where: "email LIKE '%@test.com' OR email LIKE '%@example.com' OR name LIKE 'Audit%'",
    label: "audit team members",
  },
  {
    table: "invoices",
    where: "invoice_number LIKE 'AUD%' OR invoice_number LIKE 'INV-TEST%' OR client_name IN ('Audit Client','Verify Client')",
    label: "audit/verify invoices",
  },
  { table: "accounting_entries", where: "description LIKE '%AUDIT%'", label: "audit ledger entries" },
  { table: "mpesa_transactions", where: "account_reference LIKE 'AUD%'", label: "audit mpesa rows" },
  { table: "user_feedback", where: "title LIKE 'audit %'", label: "audit feedback" },
  { table: "accounting_categories", where: "name LIKE 'VerifyCat %'", label: "verify categories" },
  { table: "user_projects", where: "project_name LIKE 'Audit Project %'", label: "audit projects" },
  {
    table: "users",
    where: "email LIKE '%@test.com' OR email LIKE '%@example.com'",
    label: "test client accounts",
  },
  {
    table: "admin_users",
    where: "email LIKE '%@test.com' OR email LIKE '%@example.com'",
    label: "test admin accounts",
  },
  {
    table: "developer_users",
    where: "email LIKE '%@test.com' OR email LIKE '%@example.com'",
    label: "test developer accounts",
  },
  // Runs after the account deletes above so it also collects rows orphaned by them.
  {
    table: "notifications",
    where: "user_id IS NOT NULL AND user_id NOT IN (SELECT id FROM (SELECT id FROM users) u)",
    label: "orphaned notifications",
  },
];

/** Count rows matching one step (null when the table/column is absent). */
async function countStep(conn, step) {
  try {
    const [rows] = await conn.query(`SELECT COUNT(*) AS n FROM \`${step.table}\` WHERE ${step.where}`);
    return rows[0].n;
  } catch (error) {
    if (error.code === "ER_NO_SUCH_TABLE" || error.code === "ER_BAD_FIELD_ERROR") return null;
    throw error;
  }
}

/**
 * Purge test data from every configured endpoint.
 * @returns {Promise<{deleted:number, found:number, perEndpoint:Array}>}
 */
async function purgeTestData({ dryRun = false, log = console.log, endpoints } = {}) {
  const list = endpoints || require("../server/config/dbEndpoints").endpoints();
  const summary = { deleted: 0, found: 0, perEndpoint: [] };

  for (const cfg of list) {
    const { label, ...opts } = cfg;
    const conn = await mysql.createConnection({ connectTimeout: 20000, ...opts });
    const perEndpoint = { endpoint: label || opts.host, deleted: 0, found: 0, steps: [] };
    try {
      for (const step of STEPS) {
        const found = await countStep(conn, step);
        if (found === null) continue; // table/column not present in this schema
        if (found === 0) continue;
        let deleted = 0;
        if (!dryRun) {
          const [res] = await conn.query(`DELETE FROM \`${step.table}\` WHERE ${step.where}`);
          deleted = res.affectedRows || 0;
        }
        perEndpoint.steps.push({ table: step.table, label: step.label, found, deleted });
        perEndpoint.found += found;
        perEndpoint.deleted += deleted;
        log(
          `   ${dryRun ? "would remove" : "removed"} ${found} ${step.label} ` +
            `(${step.table})${dryRun ? "" : ` -> ${deleted} affected`}`,
        );
      }
      log(`   [${perEndpoint.endpoint}] ${dryRun ? "would remove" : "removed"} ${perEndpoint.deleted || perEndpoint.found} row(s)`);
    } finally {
      await conn.end();
    }
    summary.found += perEndpoint.found;
    summary.deleted += perEndpoint.deleted;
    summary.perEndpoint.push(perEndpoint);
  }
  return summary;
}

module.exports = { purgeTestData, STEPS };

// CLI: node scripts/purge-test-data.js [--dry-run]
if (require.main === module) {
  require("dotenv").config();
  const dryRun = process.argv.includes("--dry-run");
  (async () => {
    console.log(`\n=== ${dryRun ? "DRY RUN — " : ""}PURGING TEST DATA (both endpoints) ===`);
    const summary = await purgeTestData({ dryRun });
    console.log(
      `\n${dryRun ? "Found" : "Removed"} ${dryRun ? summary.found : summary.deleted} test row(s) across ` +
        `${summary.perEndpoint.length} endpoint(s).`,
    );
    if (dryRun) console.log("Re-run without --dry-run to delete.");
  })().catch((error) => {
    console.error("PURGE FAILED:", error.code || error.message);
    process.exit(1);
  });
}