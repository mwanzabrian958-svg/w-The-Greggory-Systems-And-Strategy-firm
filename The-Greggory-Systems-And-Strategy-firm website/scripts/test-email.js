#!/usr/bin/env node
/**
 * Email delivery test — proves SMTP credentials actually work end-to-end.
 *
 *   node scripts/test-email.js                       # sends to SMTP_TO / SMTP_USER
 *   node scripts/test-email.js --to you@example.com  # sends to a specific inbox
 *
 * Verdicts:
 *   REAL       — SMTP accepted the login AND the message (delivery is live)
 *   SIMULATED  — SMTP_PASS is empty; nothing leaves the server (dev mode)
 *   FAILED     — the transport rejected the login/message (see printed error)
 */
require("dotenv").config();
const { sendMail, verifySmtp } = require("../backend/services/emailService");

const arg = (name, fallback = null) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};

(async () => {
  const to = arg("to") || process.env.SMTP_TO || process.env.SMTP_USER;
  if (!to) {
    console.error("No recipient: pass --to you@example.com or set SMTP_TO/SMTP_USER in .env");
    process.exit(1);
  }

  console.log("=== EMAIL DELIVERY TEST ===");
  console.log(`host: ${process.env.SMTP_HOST || "smtp.gmail.com"}:${process.env.SMTP_PORT || 465} (secure=${process.env.SMTP_SECURE === "true"})`);
  console.log(`user: ${process.env.SMTP_USER || "(unset)"}`);
  console.log(`pass: ${process.env.SMTP_PASS ? "set" : "EMPTY  <-- this is why sends simulate"}`);
  console.log(`to:   ${to}\n`);

  // Step 1 — transport + auth probe
  const probe = await verifySmtp();
  console.log(`[1/2] SMTP connection: ${probe.ok ? "OK" : "FAILED"} — ${probe.message}${probe.code ? ` (${probe.code})` : ""}`);
  if (!probe.ok) {
    console.log("\n=== RESULT: FAILED ===");
    console.log("Fix the SMTP credentials in .env (SMTP_PASS) and run again.");
    console.log("Gmail: use a 16-character App Password (no spaces) — NOT your normal login password.");
    process.exit(1);
  }
  if (probe.simulated) {
    console.log("\n=== RESULT: SIMULATED ===");
    console.log("Delivery is NOT live. Set SMTP_PASS in .env (Gmail App Password), restart the server, run again.");
    process.exit(0);
  }

  // Step 2 — send an actual message
  const result = await sendMail({
    to,
    subject: "SMTP test — The Greggory Systems & Strategy Firm",
    html: `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
      <div style="background:#0f172a;color:#fff;padding:18px 24px;">
        <div style="font-size:9px;color:#5eead4;letter-spacing:3px;text-transform:uppercase;">The Greggory Systems</div>
        <div style="font-size:18px;font-weight:800;">Email delivery is live</div>
      </div>
      <div style="padding:20px 24px;color:#334155;font-size:13px;line-height:1.6;">
        <p>This is a test message from <strong>scripts/test-email.js</strong>.</p>
        <p>If you are reading this in your inbox, invoices sent from the admin panel will arrive exactly like this — branded, with the PDF attached.</p>
        <p style="color:#94a3b8;font-size:11px;">Sent ${new Date().toISOString()}</p>
      </div>
    </div>`,
    text: "SMTP test from The Greggory Systems & Strategy Firm — email delivery is live.",
  });

  if (result.success && !result.simulated) {
    console.log(`[2/2] Test email: SENT to ${to}`);
    console.log("\n=== RESULT: REAL DELIVERY CONFIRMED ===");
    console.log("The admin 'Send to Client' button now delivers real emails with the invoice PDF attached.");
  } else {
    console.log(`[2/2] Test email: FAILED — ${result.error}`);
    console.log("\n=== RESULT: FAILED ===");
    process.exit(1);
  }
  process.exit(0);
})().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});