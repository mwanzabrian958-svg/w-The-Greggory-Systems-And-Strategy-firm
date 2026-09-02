require('dotenv').config();
const db = require('../backend/config/database');

(async () => {
  try {
    const [r] = await db.promise().query(`
      SELECT COALESCE(SUM(actual_budget), 0) as spent,
             COALESCE(SUM(estimated_budget), 0) as planned,
             COALESCE(SUM(estimated_budget * 1.1), 0) as forecast
      FROM user_projects WHERE deleted_at IS NULL
    `);
    console.log('Project budget:', JSON.stringify(r[0]));

    const [r2] = await db.promise().query(`
      SELECT COALESCE(SUM(CASE WHEN entry_type IN ('income', 'invoice_payment') THEN amount ELSE 0 END), 0) as revenue,
             COALESCE(SUM(CASE WHEN entry_type = 'expense' THEN amount ELSE 0 END), 0) as expenses
      FROM accounting_entries WHERE deleted_at IS NULL AND payment_status = 'completed'
    `);
    console.log('Financial:', JSON.stringify(r2[0]));

    // Test the INSERT that's failing
    const [r3] = await db.promise().query(`
      INSERT INTO firm_financial_telemetry (
        snapshot_date, total_revenue, total_expenses, net_income,
        total_planned_budget, total_spent_budget,
        forecasted_burn, remaining_capital, active_projects_count
      ) VALUES (NOW(), 0, 0, 0, 0, 0, 0, 0, 0)
    `);
    console.log('Telemetry insert OK:', r3.insertId);
  } catch (e) {
    console.log('DB ERROR:', e.message);
  }
})();
