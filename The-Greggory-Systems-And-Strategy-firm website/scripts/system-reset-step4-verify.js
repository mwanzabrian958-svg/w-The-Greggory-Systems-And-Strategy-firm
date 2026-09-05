/* Step 4 — POST-RESET VERIFY: count rows + show AUTO_INCREMENT values
   Run: node scripts/system-reset-step4-verify.js */
require('dotenv').config();
const db = require('../backend/config/database');

const IMPORTANT = [
  'users', 'admin_users', 'developer_users', 'user_roles', 'auth_platform_mapping',
  'activity_logs', 'admin_activity_logs', 'audit_logs', 'auth_request_log', 'data_access_logs',
  'user_projects', 'team_members', 'team_templates', 'team_template_members',
  'invoices', 'accounting_entries', 'mpesa_transactions', 'user_feedback', 'notifications',
  'images', 'crm_contacts', 'contact_forms',
];

async function main() {
  try {
    console.log('=== POST-RESET ROW COUNTS (should ALL be 0) ===');
    let ok = true;
    for (const tn of IMPORTANT) {
      const [cnt] = await db.promise().query('SELECT COUNT(*) AS n FROM `' + tn + '`');
      const status = cnt[0].n === 0 ? 'OK' : 'FAIL';
      if (cnt[0].n !== 0) ok = false;
      console.log('  [' + status + '] ' + tn.padEnd(30) + ' rows: ' + cnt[0].n);
    }

    console.log('\n=== AUTO_INCREMENT VALUES (should all be 1) ===');
    for (const tn of IMPORTANT) {
      try {
        const [cols] = await db.promise().query('SHOW COLUMNS FROM `' + tn + '`');
        const hasAuto = cols.some(c => c.Extra && String(c.Extra).includes('auto_increment'));
        if (hasAuto) {
          const [st] = await db.promise().query('SELECT AUTO_INCREMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?', [tn]);
          const ai = st[0] ? st[0].AUTO_INCREMENT : null;
          const status = ai === 1 ? 'OK' : 'CHECK';
          if (ai !== 1) ok = false;
          console.log('  [' + status + '] ' + tn.padEnd(30) + ' next_id: ' + ai);
        }
      } catch { /* non-critical */ }
    }

    console.log('\n=== KEPT CONFIG (unchanged) ===');
    for (const tn of ['roles', 'admin_settings', 'website_content', 'blog_articles', 'company_personnel', 'currencies']) {
      const [cnt] = await db.promise().query('SELECT COUNT(*) AS n FROM `' + tn + '`');
      console.log('  ' + tn.padEnd(26) + ' rows: ' + cnt[0].n);
    }

    console.log(ok ? '\nALL PURGED TABLES ARE EMPTY WITH NEXT_ID=1 ✅' : '\nSOME TABLES STILL HAVE DATA — review above ⚠️');
    process.exit(0);
  } catch (e) { console.error('VERIFY ERROR:', e.message); process.exit(1); }
}
main();