const { exec } = require('child_process');

console.log('Starting XAMPP services (Apache and MySQL)...');

// Start Apache
exec('net start Apache2.4', (error, stdout, stderr) => {
  if (error) {
    if (error.message.includes('already been started')) {
      console.log('✅ Apache is already running');
    } else {
      console.error('⚠️  Could not start Apache:', error.message);
      console.log('Please start Apache manually from XAMPP Control Panel');
    }
  } else {
    console.log('✅ Apache started successfully');
  }
});

// Start MySQL
exec('net start mysql', (error, stdout, stderr) => {
  if (error) {
    if (error.message.includes('already been started')) {
      console.log('✅ MySQL is already running');
    } else {
      console.error('⚠️  Could not start MySQL:', error.message);
      console.log('Please start MySQL manually from XAMPP Control Panel');
    }
  } else {
    console.log('✅ MySQL started successfully');
  }
});

console.log('\nServices starting... please wait a few seconds for them to be ready.');
