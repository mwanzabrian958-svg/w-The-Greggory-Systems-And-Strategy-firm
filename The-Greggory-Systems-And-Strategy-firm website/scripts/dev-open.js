const { exec } = require('child_process');

// The strategic URLs for development
const urls = [
  'http://localhost:5173',      // The Website
  'http://localhost/phpmyadmin' // The Strategic Database Center
];

console.log('🚀 Initializing Chrome development workspace...');

// Command to open multiple tabs in Chrome on Windows
// "start chrome" opens the browser, and appending URLs opens them in tabs
const chromeCmd = `start chrome ${urls.map(url => `"${url}"`).join(' ')}`;

// Wait a few seconds for servers to initialize before opening
setTimeout(() => {
  exec(chromeCmd, (error) => {
    if (error) {
      console.error('❌ Failed to open Chrome automatically.');
      console.log('Please open manually:');
      urls.forEach(url => console.log(`  - ${url}`));
    } else {
      console.log('✅ Chrome workspace initialized successfully.');
    }
  });
}, 3000); // 3-second delay to allow Vite and MySQL to breath
