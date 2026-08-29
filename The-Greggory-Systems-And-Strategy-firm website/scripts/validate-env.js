#!/usr/bin/env node
/**
 * Env sanity check — run before deploying:  node scripts/validate-env.js
 *
 * Validates that .env has every variable the app reads (server.js, backend/,
 * scripts/, render.yaml) and prints a MASKED report — secret values are never
 * printed. Exit code 0 = ready, 1 = a required variable has a problem.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// ---- Raw-file checks (BOM, duplicate keys) -------------------------------
const envPath = path.join(__dirname, '..', '.env');
const raw = fs.readFileSync(envPath);
if (raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf) {
  console.log('!! .env starts with a UTF-8 BOM — dotenv tolerates it, but remove it.');
}
const declaredKeys = raw
  .toString('utf8')
  .split(/\r?\n/)
  .map((l) => (l.match(/^([A-Za-z_][A-Za-z0-9_]*)=/) || [])[1])
  .filter(Boolean);
const dups = declaredKeys.filter((v, i) => declaredKeys.indexOf(v) !== i);
if (dups.length) console.log(`!! duplicate keys in .env: ${dups.join(', ')}`);

// ---- Required for the app to boot & auth to work --------------------------
const required = [
  'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER',
  'JWT_SECRET', 'JWT_EXPIRES_IN', 'ADMIN_SESSION_SECRET', 'ADMIN_KEY', 'ADMIN_CODE', 'SESSION_SECRET',
  'FRONTEND_URL',
];

// ---- Optional: each unlocks a feature -------------------------------------
const recommended = {
  SMTP_HOST: 'email sending (contact forms)',
  SMTP_USER: 'email sending',
  SMTP_PASS: 'email sending (Gmail App Password)',
  SMTP_FROM: 'email sender address',
  MPESA_CONSUMER_KEY: 'real M-Pesa STK Push (Daraja app)',
  MPESA_CONSUMER_SECRET: 'real M-Pesa STK Push (Daraja app)',
  MPESA_PASSKEY: 'M-Pesa STK Push (sandbox passkey OK)',
  MPESA_SHORTCODE: 'M-Pesa STK Push',
  MPESA_CALLBACK_URL: 'M-Pesa result callbacks',
  AFRICASTALKING_USERNAME: 'SMS / WhatsApp relay',
  AFRICASTALKING_API_KEY: 'SMS / WhatsApp relay',
  COMPANY_PHONE_NUMBER: 'SMS hub number',
  COMPANY_WHATSAPP_NUMBER: 'WhatsApp hub number',
  GOOGLE_CLIENT_ID: 'Google Sign-In (empty = button hidden)',
  VITE_GOOGLE_CLIENT_ID: 'Google Sign-In, baked into the frontend bundle',
};

// ---- Local-only: never copy these to Render --------------------------------
const localOnly = [
  'REDIS_URL', 'GOOGLE_APPLICATION_CREDENTIALS', 'GOOGLE_CLOUD_PROJECT',
  'STORAGE_BUCKET_MEDIA', 'STORAGE_BUCKET_BACKUPS',
];

// Values safe to display unmasked (non-secrets)
const showable = new Set([
  'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_SSL', 'NODE_ENV', 'PORT',
  'JWT_EXPIRES_IN', 'FRONTEND_URL', 'COMPANY_PHONE_NUMBER', 'COMPANY_WHATSAPP_NUMBER',
  'MPESA_SHORTCODE', 'MPESA_CALLBACK_URL', 'SMTP_HOST', 'SMTP_PORT', 'SMTP_SECURE',
  'SMTP_FROM', 'SMTP_TO', 'RATE_LIMIT_WINDOW_MS', 'RATE_LIMIT_MAX',
]);

const isLocalDb = ['localhost', '127.0.0.1', '::1'].includes((process.env.DB_HOST || '').trim());
const mask = (v) => (!v || !v.trim() ? 'MISSING/EMPTY' : `set (${v.trim().length} chars)`);
const phoneOk = (v) => /^\+\d{10,15}$/.test((v || '').trim());

let problems = 0;
console.log('=== ENV VALIDATION (secret values masked) ===\n-- required --');
for (const k of required) {
  const v = process.env[k];
  const ok = Boolean(v && v.trim());
  if (!ok) {
    // Empty DB_PASSWORD is normal for a local XAMPP root; fatal in the cloud.
    if (k === 'DB_PASSWORD' && isLocalDb) {
      console.log(`--  ${k} = empty (OK for local XAMPP; REQUIRED on Render/Aiven)`);
      continue;
    }
    problems++;
    console.log(`!!  ${k} = MISSING/EMPTY`);
    continue;
  }
  console.log(`OK  ${k} = ${showable.has(k) ? v : mask(v)}`);
}

console.log('\n-- recommended (unlocks features when set) --');
for (const [k, why] of Object.entries(recommended)) {
  console.log(`${process.env[k] && process.env[k].trim() ? 'OK  ' : '--  '}${k} = ${mask(process.env[k])}  # ${why}`);
}

console.log('\n-- local-only (leave UNSET on Render) --');
for (const k of localOnly) console.log(`    ${k} = ${mask(process.env[k])}`);

console.log('\n-- format checks --');
if (process.env.COMPANY_PHONE_NUMBER && !phoneOk(process.env.COMPANY_PHONE_NUMBER)) {
  problems++;
  console.log('!! COMPANY_PHONE_NUMBER must be E.164, e.g. +254115525854');
}
if (process.env.COMPANY_WHATSAPP_NUMBER && !phoneOk(process.env.COMPANY_WHATSAPP_NUMBER)) {
  problems++;
  console.log('!! COMPANY_WHATSAPP_NUMBER must be E.164, e.g. +254115525854');
}
if (/(^|[^:\w])\/\//.test(process.env.RATE_LIMIT_WINDOW_MS || '') || /\/\//.test(process.env.RATE_LIMIT_MAX || '')) {
  console.log('--  RATE_LIMIT_* contains an inline "//" comment (not read by code; limits are hardcoded)');
}

console.log(
  problems === 0
    ? '\n=== RESULT: .env has everything required — ready to deploy ==='
    : `\n=== RESULT: ${problems} required problem(s) — fix the "!!" lines above ===`
);
process.exit(problems === 0 ? 0 : 1);
