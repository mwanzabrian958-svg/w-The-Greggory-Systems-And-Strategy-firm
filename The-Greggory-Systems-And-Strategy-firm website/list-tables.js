require('dotenv').config();
const db = require('./backend/config/database');

async function listTables() {
    try {
        const [rows] = await db.promise().query('SHOW TABLES');
        console.log('Tables in DB:');
        console.table(rows);
    } catch (err) {
        console.error('Failed to list tables:', err.message);
    } finally {
        await db.end();
    }
}

listTables();
