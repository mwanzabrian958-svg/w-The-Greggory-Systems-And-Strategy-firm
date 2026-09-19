require('dotenv').config();
const db = require('./backend/config/database');

async function listAllUsers() {
    try {
        console.log('--- USERS ---');
        const [users] = await db.promise().query('SELECT id, email, first_name FROM users');
        console.table(users);

        console.log('--- ADMIN USERS ---');
        const [admins] = await db.promise().query('SELECT id, email, first_name FROM admin_users');
        console.table(admins);

        console.log('--- DEVELOPER USERS ---');
        const [devs] = await db.promise().query('SELECT id, email, first_name FROM developer_users');
        console.table(devs);
    } catch (err) {
        console.error('Failed to list users:', err.message);
    } finally {
        await db.end();
    }
}

listAllUsers();
