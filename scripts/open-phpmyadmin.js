const { exec } = require('child_process');

console.log('Opening phpMyAdmin in background...');

// Open phpMyAdmin in default browser
const phpMyAdminUrl = 'http://localhost/phpmyadmin/index.php?route=/database/structure&db=greggory_foundation_db_main';

exec(`start ${phpMyAdminUrl}`, (error, stdout, stderr) => {
  if (error) {
    console.error('Error opening phpMyAdmin:', error.message);
    console.log('Please open manually: http://localhost/phpmyadmin');
  } else {
    console.log('✅ phpMyAdmin opened in browser');
  }
});
