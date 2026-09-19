require('dotenv').config();
const { endpoints } = require('./server/config/dbEndpoints');
const mysql = require('mysql2/promise');

async function purgeUsers() {
    const list = endpoints();
    console.log(`\n=== PURGING USERS TABLE CONTENT (${list.length} endpoints) ===`);

    for (const cfg of list) {
        console.log(`\nProcessing endpoint: ${cfg.label} (${cfg.host})`);
        let conn;
        try {
            const { label, ...opts } = cfg;
            conn = await mysql.createConnection({
                ...opts,
                multipleStatements: true
            });

            // 1. Check existing count
            const [before] = await conn.query('SELECT COUNT(*) as n FROM users');
            console.log(`   Current user count: ${before[0].n}`);

            if (before[0].n === 0) {
                console.log('   Table already empty.');
                continue;
            }

            // 2. Perform the purge
            console.log('   Purging users...');

            // We disable foreign key checks to ensure the table can be cleared regardless of dependencies
            await conn.query('SET FOREIGN_KEY_CHECKS = 0');

            // We use DELETE instead of TRUNCATE if there are complex FK relationships or to allow partial purges in future
            const [result] = await conn.query('DELETE FROM users');

            // Also reset auto-increment for a truly fresh start
            await conn.query('ALTER TABLE users AUTO_INCREMENT = 1');

            await conn.query('SET FOREIGN_KEY_CHECKS = 1');

            console.log(`   Success: ${result.affectedRows} users deleted.`);

            // 3. Verify
            const [after] = await conn.query('SELECT COUNT(*) as n FROM users');
            console.log(`   Remaining user count: ${after[0].n}`);

        } catch (err) {
            console.error(`   FAILED on ${cfg.label}:`, err.message);
        } finally {
            if (conn) await conn.end();
        }
    }
    console.log('\n=== PURGE COMPLETE ===');
}

purgeUsers();
