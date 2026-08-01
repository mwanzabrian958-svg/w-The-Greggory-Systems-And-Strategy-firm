/**
 * Create Test Users Script
 * Inserts admin and developer users with bcrypt-hashed passwords
 * 
 * Run: node create-test-users.js
 */

const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

const SALT_ROUNDS = 10;

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'the_greggory_systems_and_strategy_firm_db_main',
  port: 5000
};

// Test users data
const testUsers = {
  admins: [
    {
      email: 'admin@thegreggorysystemsandstrategyfirm.org',
      password: '***REMOVED***',
      first_name: 'Super',
      last_name: 'Admin',
      admin_level: 'super_admin',
      access_level: 'full',
      department: 'Executive',
      phone_number: '+254799789956'
    },
    {
      email: 'manager@thegreggorysystemsandstrategyfirm.org',
      password: '***REMOVED***',
      first_name: 'Project',
      last_name: 'Manager',
      admin_level: 'admin',
      access_level: 'full',
      department: 'Projects',
      phone_number: '+254799789957'
    },
    {
      email: 'moderator@thegreggorysystemsandstrategyfirm.org',
      password: '***REMOVED***',
      first_name: 'Content',
      last_name: 'Moderator',
      admin_level: 'moderator',
      access_level: 'limited',
      department: 'Content Management',
      phone_number: '+254799789958'
    }
  ],
  developers: [
    {
      email: 'dev1@thegreggorysystemsandstrategyfirm.org',
      password: '***REMOVED***',
      first_name: 'John',
      last_name: 'Senior',
      developer_level: 'senior',
      access_level: 'full',
      specialization: 'Full Stack Development',
      tech_stack: JSON.stringify(['React', 'Node.js', 'MySQL', 'Express', 'MongoDB', 'Docker']),
      github_username: 'johnsenior',
      phone_number: '+254799789960'
    },
    {
      email: 'dev2@thegreggorysystemsandstrategyfirm.org',
      password: '***REMOVED***',
      first_name: 'Jane',
      last_name: 'Developer',
      developer_level: 'mid',
      access_level: 'limited',
      specialization: 'Frontend Development',
      tech_stack: JSON.stringify(['React', 'JavaScript', 'TypeScript', 'TailwindCSS', 'HTML', 'CSS']),
      github_username: 'janedev',
      phone_number: '+254799789961'
    },
    {
      email: 'junior@thegreggorysystemsandstrategyfirm.org',
      password: '***REMOVED***',
      first_name: 'Mike',
      last_name: 'Trainee',
      developer_level: 'junior',
      access_level: 'limited',
      specialization: 'Backend Development',
      tech_stack: JSON.stringify(['Node.js', 'Express', 'MySQL', 'REST APIs']),
      github_username: 'mikejr',
      phone_number: '+254799789962'
    }
  ]
};

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function clearExistingUsers(connection) {
  console.log('Clearing existing test users...');
  await connection.execute("DELETE FROM admin_users WHERE email LIKE '%@thegreggorysystemsandstrategyfirm.org'");
  await connection.execute("DELETE FROM developer_users WHERE email LIKE '%@thegreggorysystemsandstrategyfirm.org'");
  await connection.execute("DELETE FROM users WHERE email LIKE '%@thegreggorysystemsandstrategyfirm.org'");
  console.log('Existing users cleared.\n');
}

async function createAdminUsers(connection) {
  console.log('Creating admin users...');
  for (const user of testUsers.admins) {
    const hashedPassword = await hashPassword(user.password);
    
    await connection.execute(
      `INSERT INTO admin_users (
        email, password_hash, first_name, last_name, 
        admin_level, access_level, department, 
        is_active, email_verified, phone_number, timezone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, ?, 'Africa/Nairobi')`,
      [
        user.email,
        hashedPassword,
        user.first_name,
        user.last_name,
        user.admin_level,
        user.access_level,
        user.department,
        user.phone_number
      ]
    );
    
    // Also create entry in users table
    await connection.execute(
      `INSERT INTO users (
        email, password_hash, first_name, last_name,
        primary_role, job_id, is_active, email_verified
      ) SELECT ?, ?, ?, ?, 'admin', id, 1, 1 FROM team_members WHERE role='admin' LIMIT 1`,
      [user.email, hashedPassword, user.first_name, user.last_name]
    );
    
    console.log(`  ✓ Admin: ${user.email} (${user.admin_level})`);
  }
  console.log('');
}

async function createDeveloperUsers(connection) {
  console.log('Creating developer users...');
  for (const user of testUsers.developers) {
    const hashedPassword = await hashPassword(user.password);
    
    await connection.execute(
      `INSERT INTO developer_users (
        email, password_hash, first_name, last_name,
        developer_level, access_level, specialization,
        tech_stack, github_username, is_active, email_verified,
        phone_number, timezone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, ?, 'Africa/Nairobi')`,
      [
        user.email,
        hashedPassword,
        user.first_name,
        user.last_name,
        user.developer_level,
        user.access_level,
        user.specialization,
        user.tech_stack,
        user.github_username,
        user.phone_number
      ]
    );
    
    // Also create entry in users table
    await connection.execute(
      `INSERT INTO users (
        email, password_hash, first_name, last_name,
        primary_role, job_id, is_active, email_verified
      ) SELECT ?, ?, ?, ?, 'developer', id, 1, 1 FROM team_members WHERE role='developer' LIMIT 1`,
      [user.email, hashedPassword, user.first_name, user.last_name]
    );
    
    console.log(`  ✓ Developer: ${user.email} (${user.developer_level})`);
  }
  console.log('');
}

async function verifyUsers(connection) {
  console.log('Verifying created users...\n');
  
  const [adminRows] = await connection.execute(
    'SELECT email, admin_level, first_name, last_name FROM admin_users WHERE email LIKE ?',
    ['%@thegreggorysystemsandstrategyfirm.org']
  );
  
  const [devRows] = await connection.execute(
    'SELECT email, developer_level, first_name, last_name FROM developer_users WHERE email LIKE ?',
    ['%@thegreggorysystemsandstrategyfirm.org']
  );
  
  console.log('============================================');
  console.log('   TEST USERS CREATED SUCCESSFULLY');
  console.log('============================================\n');
  
  console.log('ADMIN USERS:');
  console.log('  Email                           | Role        | Name');
  console.log('  ------------------------------------------------------------------');
  adminRows.forEach(row => {
    console.log(`  ${row.email.padEnd(31)} | ${row.admin_level.padEnd(11)} | ${row.first_name} ${row.last_name}`);
  });
  
  console.log('\nDEVELOPER USERS:');
  console.log('  Email                           | Level       | Name');
  console.log('  ------------------------------------------------------------------');
  devRows.forEach(row => {
    console.log(`  ${row.email.padEnd(31)} | ${row.developer_level.padEnd(11)} | ${row.first_name} ${row.last_name}`);
  });
  
  console.log('\n============================================');
  console.log('   LOGIN CREDENTIALS');
  console.log('============================================');
  console.log('  Admin Password: ***REMOVED***');
  console.log('  Developer Password: ***REMOVED***');
  console.log('============================================\n');
}

async function main() {
  let connection;
  
  try {
    console.log('\n========================================');
    console.log('  CREATING TEST USERS');
    console.log('========================================\n');
    
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✓ Connected to database\n');
    
    // Clear existing test users
    await clearExistingUsers(connection);
    
    // Create users
    await createAdminUsers(connection);
    await createDeveloperUsers(connection);
    
    // Verify
    await verifyUsers(connection);
    
    console.log('✓ All test users created successfully!\n');
    
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    console.error('\nMake sure:');
    console.error('  1. MySQL is running on port 5000');
    console.error('  2. Database "the_greggory_systems_and_strategy_firm_db_main" exists');
    console.error('  3. Run: IMPORT_DB.bat first to create the database\n');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the script
main();
