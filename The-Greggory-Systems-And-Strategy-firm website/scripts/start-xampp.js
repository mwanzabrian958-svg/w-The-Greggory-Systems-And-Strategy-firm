const { exec } = require('child_process');
const path = require('path');

console.log('Starting XAMPP services...');

const xamppPath = 'C:\\xampp\\xampp-control.exe';

// Start XAMPP Control Panel
exec(`"${xamppPath}"`, (error, stdout, stderr) => {
  if (error) {
    console.error('Error starting XAMPP Control Panel:', error.message);
    return;
  }
  
  console.log('XAMPP Control Panel started');
  console.log('Please ensure Apache and MySQL are running in the Control Panel');
  console.log('The services will start automatically if configured to do so');
});
