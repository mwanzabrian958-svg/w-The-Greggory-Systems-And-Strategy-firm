const { exec } = require('child_process');

console.log('🚀 Opening phpMyAdmin in Chrome...');

// Command to open Chrome on Windows specifically for phpMyAdmin
const cmd = 'start chrome "http://localhost/phpmyadmin"';

exec(cmd, (error) => {
  if (error) {
    console.error(`❌ Could not open phpMyAdmin: ${error}`);
    // Fallback to default browser if Chrome start fails
    exec('start http://localhost/phpmyadmin');
  } else {
    console.log('✅ phpMyAdmin opened successfully.');
  }
});
