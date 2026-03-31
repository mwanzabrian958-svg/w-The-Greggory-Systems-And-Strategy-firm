#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Check if backend is already running
const checkBackendRunning = () => {
  return new Promise((resolve) => {
    const net = require('net');
    const socket = new net.Socket();
    
    socket.setTimeout(3000);
    
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    
    socket.on('error', () => {
      resolve(false);
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    
    socket.connect(8080, 'localhost');
  });
};

// Test email configuration on startup
const testEmailConfig = async () => {
  console.log('📧 Testing email configuration...');
  try {
    const emailService = require('./backend/services/emailService');
    
    if (emailService.isConfigured) {
      console.log('✅ Email service is configured');
      
      // Send a quick test email
      const testResult = await emailService.testConfiguration();
      if (testResult.success) {
        console.log('✅ Email test successful');
        if (testResult.preview) {
          console.log('🌐 Preview:', testResult.preview);
        }
      } else {
        console.log('⚠️  Email test failed:', testResult.error);
        console.log('💡 Check EMAIL_PASSWORD in .env file');
      }
    } else {
      console.log('⚠️  Email service not configured');
      console.log('💡 Run: npm run test:email');
      console.log('💡 Or set EMAIL_PASSWORD in .env file');
    }
  } catch (error) {
    console.error('❌ Email test error:', error.message);
  }
};

// Start backend server
const startBackend = () => {
  console.log('🚀 Starting backend server...');
  
  const serverProcess = spawn('node', ['server.js'], {
    stdio: 'inherit',
    cwd: process.cwd(),
    env: { ...process.env }
  });

  serverProcess.on('error', (error) => {
    console.error('❌ Failed to start backend:', error.message);
    process.exit(1);
  });

  serverProcess.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
    if (code !== 0) {
      console.log('🔄 Restarting backend...');
      setTimeout(startBackend, 2000);
    }
  });

  return serverProcess;
};

// Main startup function
const main = async () => {
  console.log('🔧 Starting Greggory Foundation Development Environment');
  console.log('='.repeat(60));
  
  // Test email configuration first
  await testEmailConfig();
  
  console.log('\n🔍 Checking if backend is already running...');
  
  const isRunning = await checkBackendRunning();
  
  if (isRunning) {
    console.log('✅ Backend is already running on port 8080');
    console.log('🌐 Backend ready for multiple frontend connections');
  } else {
    console.log('❌ Backend not running, starting now...');
    const serverProcess = startBackend();
    
    // Wait a bit and check again
    setTimeout(async () => {
      const isNowRunning = await checkBackendRunning();
      if (isNowRunning) {
        console.log('✅ Backend started successfully on port 8080');
        console.log('🌐 Backend ready for multiple frontend connections');
      } else {
        console.log('❌ Backend failed to start');
        process.exit(1);
      }
    }, 3000);
  }
};

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down...');
  process.exit(0);
});

// Start the process
main().catch(console.error);
