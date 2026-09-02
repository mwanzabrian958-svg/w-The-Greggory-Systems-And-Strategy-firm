require('dotenv').config();
const db = require('../backend/config/database');

(async () => {
  try {
    const [r] = await db.promise().query('SELECT COUNT(*) as cnt FROM user_projects');
    console.log('user_projects count:', r[0].cnt);

    const [r2] = await db.promise().query('SELECT COUNT(*) as cnt FROM accounting_entries');
    console.log('accounting_entries count:', r2[0].cnt);

    const [r3] = await db.promise().query(`
      SELECT COALESCE(SUM(actual_budget), 0) as spent,
             COALESCE(SUM(estimated_budget), 0) as planned
      FROM user_projects WHERE deleted_at IS NULL
    `);
    console.log('Budget data:', JSON.stringify(r3[0]));

    const [r4] = await db.promise().query(`
      SELECT COALESCE(SUM(CASE WHEN entry_type IN ('income', 'invoice_payment') THEN amount ELSE 0 END), 0) as revenue
      FROM accounting_entries WHERE deleted_at IS NULL AND payment_status = 'completed'
    `);
    console.log('Revenue data:', JSON.stringify(r4[0]));
  } catch (e) {
    console.log('DB ERROR:', e.message);
    console.log('STACK:', e.stack);
  }
})();
