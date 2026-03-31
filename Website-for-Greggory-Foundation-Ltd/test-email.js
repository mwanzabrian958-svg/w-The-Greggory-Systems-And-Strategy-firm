#!/usr/bin/env node

// Email Service Test Script
// Tests the email configuration and sends test emails
require('dotenv').config();
const emailService = require('./backend/services/emailService');

console.log('🔧 Testing Email Service Configuration');
console.log('='.repeat(50));

// Test 1: Check configuration
console.log('\n1️⃣  Checking email service configuration...');
if (emailService.isConfigured) {
  console.log('✅ Email service is configured');
} else {
  console.log('❌ Email service is not configured');
  console.log('💡 Please set EMAIL_PASSWORD in your .env file');
}

// Test 2: Send test email
console.log('\n2️⃣  Sending test email...');
const testResult = await emailService.testConfiguration();

if (testResult.success) {
  console.log('✅ Test email sent successfully!');
  console.log('📧 Message ID:', testResult.messageId);
  if (testResult.preview) {
    console.log('🌐 Preview URL:', testResult.preview);
  }
} else {
  console.log('❌ Failed to send test email:', testResult.error);
}

// Test 3: Test password reset email
console.log('\n3️⃣  Testing password reset email template...');
const resetToken = 'test-reset-token-123';
const resetLink = 'http://localhost:5173/reset-password?token=' + resetToken;
const resetResult = await emailService.sendPasswordResetEmail(
  'test@example.com',
  'Test User',
  resetToken,
  resetLink
);

if (resetResult.success) {
  console.log('✅ Password reset email test successful!');
  console.log('📧 Message ID:', resetResult.messageId);
} else {
  console.log('❌ Password reset email test failed:', resetResult.error);
}

// Test 4: Test welcome email
console.log('\n4️⃣  Testing welcome email template...');
const welcomeResult = await emailService.sendWelcomeEmail(
  'test@example.com',
  'Test User'
);

if (welcomeResult.success) {
  console.log('✅ Welcome email test successful!');
  console.log('📧 Message ID:', welcomeResult.messageId);
} else {
  console.log('❌ Welcome email test failed:', welcomeResult.error);
}

console.log('\n🎉 Email service testing complete!');
console.log('='.repeat(50));

// Configuration instructions
console.log('\n📋 Configuration Instructions:');
console.log('1. Copy .env.example to .env');
console.log('2. Update EMAIL_PASSWORD with your Gmail app password');
console.log('3. For production, set NODE_ENV=production');
console.log('4. Enable 2-factor authentication on Gmail account');
console.log('5. Generate app-specific password from Google Account settings');

console.log('\n🔗 Gmail App Password Setup:');
console.log('1. Go to: https://myaccount.google.com/apppasswords');
console.log('2. Select "Mail" app');
console.log('3. Generate new password');
console.log('4. Copy password to .env file');

process.exit(0);
