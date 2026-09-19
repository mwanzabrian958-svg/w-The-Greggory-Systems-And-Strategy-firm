// READ-ONLY inventory of rows created by the audit/verification runs so they
// can be reviewed before any cleanup. Touches nothing.
require("dotenv").config();
const mysql = require("mysql2/promise");
const { endpoints: dbEndpoints } = require("./server/config/dbEndpoints");

const PATTERNS = {
  users: "SELECT id, email, first_name, last_name, created_at FROM users WHERE email LIKE 'audit%' OR email LIKE '%@test.com' OR email LIKE '%@example.com' ORDER BY id",
  admin_users: "SELECT id, email, name, admin_level, created_at FROM admin_users WHERE email LIKE 'audit%' OR email LIKE '%@test.com' OR email LIKE '%@example.com' ORDER BY id",
  developer_users: "SELECT id, email, created_at FROM developer_users WHERE email LIKE 'audit%' OR email LIKE '%@test.com' OR email LIKE '%@example.com' ORDER BY id",
  invoices: "SELECT id, invoice_number, client_name, status, created_at FROM invoices WHERE invoice_number LIKE 'AUD%' OR invoice_number LIKE 'INV-TEST%' ORDER BY id",
  accounting_entries: "SELECT id, category, description, amount, created_at FROM accounting_entries WHERE category LIKE '%Audit%' OR category LIKE '%Test%' OR description LIKE '%audit%' ORDER BY id",
  mpesa_transactions: "SELECT id, account_reference, amount, status, created_at FROM mpesa_transactions WHERE account_reference LIKE 'AUD%' ORDER BY id",
  team_members: "SELECT id, name, email, role, created_at FROM team_members ORDER BY id",
  team_templates: "SELECT id, name, project_id, created_at FROM team_templates ORDER BY id",
  team_template_members: "SELECT id, template_id, team_member_id FROM team_template_members ORDER BY id",
  user_projects: "SELECT id, project_name, user_id, created_at FROM user_projects ORDER BY id",
  notifications: "SELECT id, user_id, title, created_at FROM notifications ORDER BY id DESC LIMIT 15",
  images: "SELECT id, title, created_at FROM images ORDER BY id DESC LIMIT 12",
  contact_forms: "SELECT id, name, email, created_at FROM contact_forms ORDER BY id DESC LIMIT 10",
  user_feedback: "SELECT id, user_id, title, created_at FROM user_feedback ORDER BY id DESC LIMIT 10",
  accounting_categories: "SELECT id, name, created_at FROM accounting_categories ORDER BY id",
  accounting_periods: "SELECT id, period_name, is_locked, created_at FROM accounting_periods ORDER BY id",
};

(async () => {
  for (const cfg of dbEndpoints()) {
    const { label, ...opts } = cfg;
    const conn = await mysql.createConnection({ connectTimeout: 20000, ...opts });
    try {
      console.log(`\n########## ${label} — ${opts.host} ##########`);
      for (const [table, sql] of Object.entries(PATTERNS)) {
        try {
          const [rows] = await conn.query(sql);
          console.log(`\n--- ${table}: ${rows.length} row(s)`);
          rows.slice(0, 20).forEach((r) => console.log("   ", JSON.stringify(r)));
        } catch (e) {
          console.log(`\n--- ${table}: ERROR ${e.code || e.message}`);
        }
      }
    } finally {
      await conn.end();
    }
  }
})();