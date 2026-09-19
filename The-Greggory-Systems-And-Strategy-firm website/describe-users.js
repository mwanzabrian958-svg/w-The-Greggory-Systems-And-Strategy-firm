require('dotenv').config();
const db = require('./backend/config/database');

async function describeUsers() {
    try {
        const [rows] = await db.promise().query('DESCRIBE users');
        console.log('Users table schema:');
        console.table(rows);
    } catch (err) {
        console.error('Failed to describe users:', err.message);
    } finally {
        await db.end();
    }
}

describeUsers();
