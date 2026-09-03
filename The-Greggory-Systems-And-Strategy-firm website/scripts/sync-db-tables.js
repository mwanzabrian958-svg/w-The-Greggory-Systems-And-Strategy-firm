require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mysql = require('mysql2');
const { endpoints, clean, DB_NAME } = require('../server/config/dbEndpoints');
const schema = require('../database/schema-sync.json');

// Tables to create if they exist in schema-sync.json but not in the live DB
const TABLES_TO_SYNC = [
  'images',
  'contact_forms',
  'case_studies',
  'companies',
  'change_requests',
  'notifications',
  'user_projects',
  'invoices',
  'project_tasks',
  'team_members',
  'admin_settings',
  'admin_navbar_items',
  'website_content',
  'blog_articles',
  'crm_contacts',
  'accounting_entries',
  'admin_activity_logs',
  'audit_logs',
  'data_access_logs',
  'client_feedback',
  'project_reports',
  'document_signatures',
  'quotes',
  'quote_items',
  'quote_activities',
  'mpesa_transactions',
  'client_messages',
  'client_documents',
  'client_data_consent',
  'data_classifications',
  'data_retention_policies',
  'data_encryption_keys',
  'quality_assurance',
  'performance_metrics',
  'roles',
  'user_roles',
  'user_feedback',
  'client_payments',
  'client_invoices',
  'client_projects',
  'client_project_summary',
  'financial_reports',
  'firm_financial_telemetry',
  'project_activities',
  'project_budgets',
  'project_docs',
  'project_documents',
  'project_expenses',
  'project_invoices',
  'project_milestones',
  'project_photos',
  'project_resources',
  'project_risks',
  'project_team_members',
  'project_timeline',
  'knowledge_base',
  'videos',
  'currencies',
  'auth_platform_mapping',
  'auth_request_log',
  'auth_validation_rules',
  'blog_subscriptions',
  'accounting_categories',
  'accounting_periods',
];

async function syncDatabase(dbConfig, label) {
  const conn = mysql.createConnection({ ...dbConfig, multipleStatements: true });
  const promisify = (fn) => (...args) => new Promise((resolve, reject) => fn(...args, (err, res) => err ? reject(err) : resolve(res)));

  const query = promisify(conn.query.bind(conn));
  const connect = promisify(conn.connect.bind(conn));

  try {
    await connect();
    console.log(`\n[${label}] Connected to ${dbConfig.host}:${dbConfig.port}`);

    // Get existing tables
    const existingResults = await query(`SHOW TABLES`);
    console.log(`[${label}] SHOW TABLES result type:`, typeof existingResults, Array.isArray(existingResults) ? 'array length ' + existingResults.length : '');
    const existing = Array.isArray(existingResults) && existingResults.length > 0 && Array.isArray(existingResults[0]) ? existingResults[0] : existingResults;
    const existingTables = existing.map(row => Object.values(row)[0]);
    console.log(`[${label}] ${existingTables.length} tables exist`);

    let created = 0;
    let skipped = 0;

    for (const tableName of TABLES_TO_SYNC) {
      if (existingTables.includes(tableName)) {
        skipped++;
        continue;
      }

      const tableDef = schema.tables?.[tableName]?.create;
      if (!tableDef) {
        console.log(`[${label}] SKIP ${tableName} — no definition in schema-sync.json`);
        continue;
      }

      try {
        await query(tableDef);
        console.log(`[${label}] CREATED ${tableName}`);
        created++;
      } catch (err) {
        if (err.code === 'ER_TABLE_EXISTS_ERROR') {
          skipped++;
        } else {
          console.error(`[${label}] FAIL ${tableName}: ${err.message.substring(0, 100)}`);
        }
      }
    }

    console.log(`[${label}] Done: ${created} created, ${skipped} already existed`);
  } catch (err) {
    console.error(`[${label}] Connection error: ${err.message}`);
  } finally {
    conn.end();
  }
}

(async () => {
  const dbEndpoints = endpoints();

  for (const cfg of dbEndpoints) {
    const { label, ...dbConfig } = cfg;
    await syncDatabase({ ...dbConfig, database: DB_NAME }, label);
  }

  console.log('\n=== DB SYNC COMPLETE ===');
  process.exit(0);
})();
