#!/usr/bin/env node

// Automated Development Environment Startup
// Handles complete setup: backend, frontend, email testing, and database
require('dotenv').config();
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

const log = (color, message) => {
  console.log(`${color}${message}${colors.reset}`);
};

// Check if dependencies are installed
const checkDependencies = () => {
  log(colors.cyan, '📦 Checking dependencies...');
  
  const packageJson = require('./package.json');
  const requiredDeps = ['nodemailer', 'express', 'mysql2', 'bcryptjs', 'jsonwebtoken'];
  
  for (const dep of requiredDeps) {
    try {
      require.resolve(dep);
      log(colors.green, `✅ ${dep}`);
    } catch (error) {
      log(colors.red, `❌ ${dep} - Missing!`);
      log(colors.yellow, `💡 Run: npm install ${dep}`);
      return false;
    }
  }
  
  return true;
};

// Check environment configuration
const checkEnvironment = () => {
  log(colors.cyan, '🔧 Checking environment configuration...');
  
  const requiredEnvVars = ['DB_HOST', 'DB_NAME', 'JWT_SECRET'];
  const optionalEnvVars = ['EMAIL_PASSWORD'];
  
  let allGood = true;
  
  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      log(colors.green, `✅ ${envVar}`);
    } else {
      log(colors.red, `❌ ${envVar} - Required!`);
      allGood = false;
    }
  }
  
  for (const envVar of optionalEnvVars) {
    if (process.env[envVar]) {
      log(colors.green, `✅ ${envVar} (Email service ready)`);
    } else {
      log(colors.yellow, `⚠️  ${envVar} (Email service disabled)`);
    }
  }
  
  if (!allGood) {
    log(colors.red, '❌ Environment configuration incomplete!');
    log(colors.yellow, '💡 Copy .env.example to .env and update values');
    return false;
  }
  
  return true;
};

// Test database connection
const testDatabase = async () => {
  log(colors.cyan, '🗄️  Testing database connection...');
  
  try {
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'mysql'
    });
    
    await connection.ping();
    await connection.end();
    
    log(colors.green, '✅ Database connection successful');
    return true;
  } catch (error) {
    log(colors.red, `❌ Database connection failed: ${error.message}`);
    return false;
  }
};

// Test email service
const testEmailService = async () => {
  log(colors.cyan, '📧 Testing email service...');
  
  try {
    const emailService = require('./backend/services/emailService');
    
    if (emailService.isConfigured) {
      const testResult = await emailService.testConfiguration();
      if (testResult.success) {
        log(colors.green, '✅ Email service working');
        if (testResult.preview) {
          log(colors.blue, `🌐 Preview: ${testResult.preview}`);
        }
      } else {
        log(colors.yellow, `⚠️  Email test failed: ${testResult.error}`);
      }
    } else {
      log(colors.yellow, '⚠️  Email service not configured');
      log(colors.yellow, '💡 Emails will be logged to console');
    }
    return true;
  } catch (error) {
    log(colors.red, `❌ Email service error: ${error.message}`);
    return false;
  }
};

// Start backend server
const startBackend = () => {
  return new Promise((resolve, reject) => {
    log(colors.cyan, '🚀 Starting backend server...');
    
    const backend = spawn('node', ['start-backend.js'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: process.cwd(),
      env: { ...process.env }
    });
    
    backend.stdout.on('data', (data) => {
      process.stdout.write(data);
    });
    
    backend.stderr.on('data', (data) => {
      process.stderr.write(data);
    });
    
    backend.on('error', (error) => {
      log(colors.red, `❌ Backend startup failed: ${error.message}`);
      reject(error);
    });
    
    backend.on('close', (code) => {
      if (code === 0) {
        log(colors.green, '✅ Backend started successfully');
        resolve();
      } else {
        log(colors.red, `❌ Backend exited with code ${code}`);
        reject(new Error(`Backend failed to start (code: ${code})`));
      }
    });
    
    // Give it time to start
    setTimeout(() => {
      resolve();
    }, 5000);
  });
};

// Start frontend server
const startFrontend = () => {
  return new Promise((resolve, reject) => {
    log(colors.cyan, '🎨 Starting frontend server...');
    
    const frontend = spawn('npm.cmd', ['run', 'dev:frontend'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: process.cwd(),
      env: { ...process.env },
      shell: true
    });
    
    frontend.stdout.on('data', (data) => {
      process.stdout.write(data);
    });
    
    frontend.stderr.on('data', (data) => {
      process.stderr.write(data);
    });
    
    frontend.on('error', (error) => {
      log(colors.red, `❌ Frontend startup failed: ${error.message}`);
      reject(error);
    });
    
    frontend.on('close', (code) => {
      if (code === 0) {
        log(colors.green, '✅ Frontend started successfully');
        resolve();
      } else {
        log(colors.red, `❌ Frontend exited with code ${code}`);
        reject(new Error(`Frontend failed to start (code: ${code})`));
      }
    });
    
    // Give it time to start
    setTimeout(() => {
      resolve();
    }, 8000);
  });
};

// Main automation function
const main = async () => {
  log(colors.bright + colors.magenta, '🚀 Greggory Foundation - Automated Development Startup');
  log(colors.cyan, '='.repeat(70));
  
  // Step 1: Check dependencies
  if (!checkDependencies()) {
    process.exit(1);
  }
  
  // Step 2: Check environment
  if (!checkEnvironment()) {
    process.exit(1);
  }
  
  // Step 3: Test database
  if (!await testDatabase()) {
    log(colors.red, '❌ Database connection required!');
    process.exit(1);
  }
  
  // Step 4: Test email service
  if (!await testEmailService()) {
    log(colors.yellow, '⚠️  Continuing without email service...');
  }
  
  // Step 5: Start services
  log(colors.cyan, '\n🌟 Starting all services...');
  
  try {
    // Start backend first
    await startBackend();
    
    // Wait a bit then start frontend
    setTimeout(async () => {
      await startFrontend();
      
      log(colors.bright + colors.green, '\n🎉 All services started successfully!');
      log(colors.cyan, '='.repeat(70));
      
      log(colors.blue, '📱 Frontend: http://localhost:5173');
      log(colors.blue, '🔧 Backend:  http://localhost:8080');
      log(colors.blue, '📧 Email Test: npm run test:email');
      log(colors.cyan, '='.repeat(70));
      
    }, 2000);
    
  } catch (error) {
    log(colors.red, `❌ Startup failed: ${error.message}`);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  log(colors.yellow, '\n🛑 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log(colors.yellow, '\n🛑 Shutting down gracefully...');
  process.exit(0);
});

// Start the automation
main().catch((error) => {
  log(colors.red, `❌ Fatal error: ${error.message}`);
  process.exit(1);
});
