// Probes the tables admin-facing features depend on, against the live DB.
// Created while auditing "does the admin dashboard have everything it needs" —
// posts.js (testimonials + work portfolio, commit 76688e9) references two
// tables that were missing from SHOW TABLES output; this confirms it.
// Run: node scripts/verify-admin-tables.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
require('../backend/config/database');

const REQUIRED = [
  // [table, used by]
  ['users', 'admin Users/ClientPortal pages, fcm.js, auth'],
  ['admin_users', 'admin login, session, fcm devices'],
  ['admin_settings', 'admin Settings page (setting_key/setting_value)'],
  ['admin_website_settings', 'website content management'],
  ['admin_activity_logs', 'Activity page'],
  ['audit_logs', 'Security/audit pages'],
  ['activity_logs', 'Activity page'],
  ['blog_articles', 'Content page (blog posts)'],
  ['contact_forms', 'Communication/Inbox page'],
  ['company_personnel', 'Personnel pages'],
  ['images', 'Media Library'],
  ['invoices', 'Billing/Financial pages'],
  ['invoice_line_items', 'Invoice preview'],
  ['mpesa_transactions', 'Financial page (M-Pesa tab)'],
  ['user_projects', 'Projects pages'],
  ['project_tasks', 'Project tasks'],
  ['project_invoices', 'Client portal invoices'],
  ['client_feedback', 'ClientPortalData / Support feedback'],
  ['change_requests', 'Support page'],
  ['notifications', 'NotificationBell'],
  ['website_content', 'Content page (site settings)'],
  ['testimonials', 'Posts page (public /api/posts/testimonials)'],
  ['portfolio_items', 'Posts page (public /api/posts/portfolio)'],
  ['team_templates', 'Team page templates'],
  ['team_members', 'Team page'],
  ['crm_contacts', 'CRM modals'],
  ['user_feedback', 'Communication/feedback endpoints (/api/feedback)'],
  ['roles', 'PermissionsManager'],
  ['user_roles', 'PermissionsManager'],
  ['document_signatures', 'Support signature requests'],
  ['financial_reports', 'Reports page'],
  ['accounting_entries', 'Financial ledger'],
  ['data_access_logs', 'Data Safety page'],
];

setTimeout(async () => {
  const db = require('../backend/config/database');
  const conn = db.promise ? db.promise() : db;
  let missing = 0;

  const [rows] = await conn.query(
    `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE()`
  );
  const live = new Set(rows.map((r) => r.TABLE_NAME));

  console.log(`\n--- admin-required tables (live DB has ${live.size}) ---`);
  for (const [table, usedBy] of REQUIRED) {
    if (live.has(table)) {
      console.log(`  OK      ${table.padEnd(26)} ${usedBy}`);
    } else {
      missing++;
      console.log(`  MISSING ${table.padEnd(26)} ${usedBy}`);
    }
  }

  console.log(
    missing
      ? `\nRESULT: ${missing} table(s) missing — dependent admin features will 500\n`
      : '\nRESULT: all admin-required tables present\n'
  );
  process.exit(missing ? 1 : 0);
}, 3000);
