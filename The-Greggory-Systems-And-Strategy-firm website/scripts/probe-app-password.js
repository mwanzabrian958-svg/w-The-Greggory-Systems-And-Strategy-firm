// Verify a candidate App Password against Gmail before writing it anywhere.
// Prints the verdict only — never the password.
require('dotenv').config();
const nodemailer = require('nodemailer');

const candidate = process.argv[2] || '';
const stripped = candidate.replace(/\s+/g, '');

(async () => {
  console.log(`candidate: ${candidate.length} chars raw, ${stripped.length} stripped`);
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 465),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: stripped },
  });
  try {
    await transport.verify();
    console.log('VERIFY OK — this App Password is live.');
  } catch (e) {
    console.log('VERIFY FAILED:', e.code || String(e.message).split('\n')[0]);
  }
})();