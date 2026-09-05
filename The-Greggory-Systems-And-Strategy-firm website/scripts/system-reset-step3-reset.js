/* Step 3 — SYSTEM RESET: purge credentials, logs, user-owned data, reset IDs.
   Run: node scripts/system-reset-step3-reset.js
   DANGER: destructive. Backup first (step2), then run this.

   Purges:
   - Credentials: users, admin_users, developer_users, user_roles, auth_platform_mapping
   - Logs: activity_logs, admin_activity_logs, audit_logs, auth_request_log, data_access_logs
   - User-owned data: projects, tasks, teams, invoices, payments, feedback, notifications,
     documents, quotes, signatures, change requests, images (avatar refs), crm contacts.

   Keeps (site-wide config/public content):
   - admin_settings, admin_navbar_items, admin_website_settings, auth_validation_rules,
     roles, data_classifications, data_retention_policies, currencies, blog_articles,
     blog_subscriptions, company_personnel, website_content, case_studies, videos,
     knowledge_base, accounting_categories, and other config tables (emptied where referenced).

   After truncating, AUTO_INCREMENT restarts at 1 for every purged table. */
require('dotenv').config();
const db = require('../backend/config/database');

// Tables to wipe completely (TRUNCATE resets AUTO_INCREMENT to 1 for InnoDB).
const PURGE = [
  // Credentials
  'users', 'admin_users', 'developer_users', 'user_roles', 'auth_platform_mapping',
  // Logs
  'activity_logs', 'admin_activity_logs', 'audit_logs', 'auth_request_log', 'data_access_logs',
  // User projects + all project-owned data
  'user_projects', 'project_team_members', 'project_activities', 'project_tasks',
  'project_docs', 'project_documents', 'project_photos', 'project_milestones',
  'project_expenses', 'project_risks', 'project_resources', 'project_timeline',
  'project_budgets', 'project_reports', 'project_invoices', 'projects',
  'client_projects', 'client_documents', 'client_invoices', 'client_messages',
  'client_payments', 'client_project_summary', 'client_feedback', 'client_data_consent',
  // Financial
  'invoices', 'invoice_line_items', 'accounting_entries', 'mpesa_transactions',
  'financial_reports', 'firm_financial_telemetry',
  // Team templates
  'team_templates', 'team_template_members', 'team_members',
  // Communication
  'quotes', 'quote_items', 'quote_activities', 'document_signatures',
  'change_requests', 'user_feedback', 'notifications',
  // Media/images (avatar + uploaded files tied to purged users)
  'images',
  // CRM leads (client contact records without user accounts)
  'crm_contacts', 'crm_telemetry',
  // Contact form submissions are visitor data — purge for a clean reset
  'contact_forms',
];

async function main() {
  console.log('===== SYSTEM RESET =====');
  try {
    // 1. Disable FK constraints so TRUNCATE works on parent/child tables in any order
    await db.promise().query('SET FOREIGN_KEY_CHECKS = 0');
    console.log('FK checks disabled.');

    let purged = 0;
    const missing = [];
    for (const tn of PURGE) {
      try {
        await db.promise().query('TRUNCATE TABLE `' + tn + '`');
        purged++;
        console.log('  [TRUNCATED] ' + tn);
      } catch (e) {
        // Table may not exist — just record it
        if (e.code === 'ER_NO_SUCH_TABLE') { missing.push(tn); console.log('  [SKIP (missing)] ' + tn); }
        else { console.log('  [ERROR] ' + tn + ': ' + e.message); throw e; }
      }
    }

    // 2. Re-enable FK checks
    await db.promise().query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('FK checks re-enabled.');
    console.log('\nPurged ' + purged + ' tables' + (missing.length ? ' (missing: ' + missing.join(', ') + ')' : ''));

    // 3. Force AUTO_INCREMENT to explicit 1 on all remaining tables with an id column
    console.log('\nResetting AUTO_INCREMENT to 1 on all tables...');
    const [rows] = await db.promise().query('SHOW TABLES');
    const tables = rows.map(r => Object.values(r)[0]);
    let reset = 0;
    for (const tn of tables) {
      try {
        const [cols] = await db.promise().query('SHOW COLUMNS FROM `' + tn + '`');
        const hasAuto = cols.some(c => c.Extra && String(c.Extra).includes('auto_increment'));
        if (hasAuto) {
          await db.promise().query('ALTER TABLE `' + tn + '` AUTO_INCREMENT = 1');
          reset++;
        }
      } catch { /* non-critical */ }
    }
    console.log('Reset AUTO_INCREMENT on ' + reset + ' tables.');

    // 4. Report what the kept tables hold
    console.log('\n=== KEPT TABLES (site config/public content) ===');
    const keep = tables.filter(tn => !PURGE.includes(tn));
    for (const tn of keep) {
      try {
        const [cnt] = await db.promise().query('SELECT COUNT(*) AS n FROM `' + tn + '`');
        console.log('  ' + tn.padEnd(32) + ' rows: ' + cnt[0].n);
      } catch { /* skip */ }
    }

    console.log('\nSYSTEM RESET COMPLETE.');
    process.exit(0);
  } catch (e) {
    console.error('RESET ERROR:', e.message);
    try { await db.promise().query('SET FOREIGN_KEY_CHECKS = 1'); } catch {}
    process.exit(1);
  }
}
main();