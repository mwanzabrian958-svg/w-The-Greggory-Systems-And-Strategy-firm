require('dotenv').config();
const { endpoints } = require('./server/config/dbEndpoints');
const mysql = require('mysql2/promise');

const CLIENT_TABLES = [
    'users',
    'projects',
    'user_projects',
    'client_projects',
    'invoices',
    'client_invoices',
    'invoice_line_items',
    'notifications',
    'project_reports',
    'change_requests',
    'user_feedback',
    'client_feedback',
    'client_messages',
    'client_payments',
    'document_signatures',
    'quotes',
    'quote_items',
    'quote_activities',
    'project_tasks',
    'project_milestones',
    'project_team_members',
    'project_docs',
    'project_documents',
    'project_photos',
    'project_resources',
    'project_risks',
    'project_activities',
    'project_expenses',
    'project_invoices',
    'project_timeline',
    'project_budgets',
    'mpesa_transactions',
    'auth_platform_mapping',
    'auth_request_log'
];

async function purgeAllClientData() {
    const list = endpoints();
    console.log(`\n=== PURGING ALL CLIENT DATA (${list.length} endpoints) ===`);

    for (const cfg of list) {
        console.log(`\nProcessing endpoint: ${cfg.label} (${cfg.host})`);
        let conn;
        try {
            const { label, ...opts } = cfg;
            conn = await mysql.createConnection({
                ...opts,
                multipleStatements: true
            });

            console.log('   Disabling foreign key checks...');
            await conn.query('SET FOREIGN_KEY_CHECKS = 0');

            for (const table of CLIENT_TABLES) {
                try {
                    // Check if table exists first to avoid errors on different schemas
                    const [exists] = await conn.query(`SHOW TABLES LIKE '${table}'`);
                    if (exists.length === 0) continue;

                    const [before] = await conn.query(`SELECT COUNT(*) as n FROM \`${table}\``);
                    if (before[0].n > 0) {
                        const [result] = await conn.query(`DELETE FROM \`${table}\``);
                        await conn.query(`ALTER TABLE \`${table}\` AUTO_INCREMENT = 1`);
                        console.log(`   - Purged ${result.affectedRows} rows from \`${table}\``);
                    }
                } catch (tableErr) {
                    console.warn(`   - Error purging \`${table}\`: ${tableErr.message}`);
                }
            }

            await conn.query('SET FOREIGN_KEY_CHECKS = 1');
            console.log('   Re-enabled foreign key checks.');

        } catch (err) {
            console.error(`   FAILED on ${cfg.label}:`, err.message);
        } finally {
            if (conn) await conn.end();
        }
    }
    console.log('\n=== GLOBAL PURGE COMPLETE ===');
}

purgeAllClientData();
