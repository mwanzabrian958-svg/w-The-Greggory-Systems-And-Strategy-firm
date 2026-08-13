const mysql = require('mysql2/promise');
const { sendWhatsAppToUser } = require('../backend/services/whatsappService');
require('dotenv').config();

async function trigger() {
  console.log('🚀 Initializing WhatsApp Auth Relay for Account Owner: Brian Mwanza');

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'the_greggory_systems_and_strategy_firm_db_main'
  });

  try {
    const email = 'brianmwanza651@gmail.com';
    const ownerPhone = '254715312251';
    const activationKey = Math.floor(100000 + Math.random() * 900000).toString();

    // 1. Update regular users table
    await conn.query(
      'UPDATE users SET whatsapp_verified = 0, whatsapp_auth_key = ?, phone_number = ? WHERE email = ?',
      [activationKey, ownerPhone, email]
    );

    // 2. Update admin_users table
    await conn.query(
      'UPDATE admin_users SET whatsapp_verified = 0, whatsapp_auth_key = ?, phone_number = ? WHERE email = ?',
      [activationKey, ownerPhone, email]
    );

    console.log(`✅ System State Updated: Account Ownership Unsolidified for ${email} (User + Admin)`);
    console.log(`✅ Unique Marker Generated: ${activationKey}`);

    // 3. Trigger WhatsApp Relay
    const result = await sendWhatsAppToUser(ownerPhone, `*GSS MASTER ACTIVATION*\n\nWelcome back, Brian Mwanza.\n\nYour master activation key is: *${activationKey}*\n\nUse this unique marker to re-verify your owner status on BOTH Client and Admin platforms.`);

    if (result.success) {
      console.log(`\n========================================`);
      console.log(`✅ RELAY SUCCESSFUL`);
      console.log(`📡 FROM: The Greggory Systems Group`);
      console.log(`📡 TO: ${ownerPhone}`);
      console.log(`📦 PAYLOAD: ${activationKey}`);
      console.log(`========================================\n`);
    } else {
      console.error('❌ WhatsApp relay failed.');
    }

  } catch (e) {
    console.error('❌ Operational Error:', e.message);
  } finally {
    await conn.end();
  }
}

trigger();
