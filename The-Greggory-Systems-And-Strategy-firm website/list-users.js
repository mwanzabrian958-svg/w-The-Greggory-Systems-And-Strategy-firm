require('dotenv').config();
const db = require('./backend/config/database');
const { endpoints } = require('./server/config/dbEndpoints');

async function listUsers() {
    const list = endpoints();
    console.log('Endpoints detected:', list.map(e => e.label));

    // Test each endpoint specifically
    const mysql = require('mysql2/promise');
    for (const cfg of list) {
        console.log(`Testing endpoint: ${cfg.label} (${cfg.host})`);
        try {
            const { label, ...opts } = cfg;
            const conn = await mysql.createConnection(opts);
            const [rows] = await conn.query('SELECT id, email, first_name FROM users');
            console.log(`Users on ${label}:`);
            console.table(rows);
            await conn.end();
        } catch (err) {
            console.error(`Failed to connect to ${cfg.label}:`, err.message);
        }
    }
}

listUsers();
