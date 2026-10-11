// =============================================================================
// GENERATE + SEND a 25,000 KES invoice for Brian Mwanza
//   recipient : Brian Maundu Mwanza
//             : brianmwanza651@gmail.com
//             : 0793946644   (direct-dial)
//             : 0799789956   (hardcoded payment number used by invoiceRenderer)
// =============================================================================
const fs = require("fs");
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "..", "..", ".env") });

const invoiceRenderer = require("../lib/invoiceRenderer");

const documentPayload = {
  title: "Invoice 2026-0417",
  invoice_number: "INV-2026-0417",
  client_name: "Brian Maundu Mwanza",
  client_email: "brianmwanza651@gmail.com",
  client_phone: "0793946644",
  payment_phone: "0799789956",
  subtotal: 25000,
  tax_rate: 16,
  total_amount: 29000,
  due_date: "2026-05-17",
  status: "SENT",
  issue_date: new Date().toISOString().slice(0, 10),
  created_at: new Date().toISOString(),
  items: [
    {
      description: "Professional project services (Phase 1)",
      quantity: 1,
      unit_price: 25000,
      line_total: 25000,
    },
  ],
};

// ── Terminal status helpers (green ✅ = REALLY delivered) ────────────────
const C = {
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  reset: "\x1b[0m",
};

// A result is a TRUE success only when it delivered for real (not simulated).
function statusIcon(result) {
  if (result && result.success && !result.simulated) {
    return { icon: "✅", color: C.green, word: "SENT" };
  }
  if (result && result.success && result.simulated) {
    return { icon: "⚠️ ", color: C.yellow, word: "SIMULATED (not delivered)" };
  }
  return { icon: "❌", color: C.red, word: "FAILED" };
}

function statusLine(label, result) {
  const s = statusIcon(result);
  return `${s.color}${s.icon} ${label}: ${s.word}${C.reset}`;
}

async function main() {
  // 2) Generate the PDF.
  const pdfBuffer = await invoiceRenderer.generatePDFContent(
    "invoice",
    documentPayload
  );

  // 3) Write the PDF to disk.
  const outDir = path.resolve(__dirname, "invoices", "2026-0417-brian-maundu");
  fs.mkdirSync(outDir, { recursive: true });
  const pdfPath = path.join(outDir, "invoice-25000.pdf");
  fs.writeFileSync(pdfPath, pdfBuffer);
  console.log(`[PDF] written to ${pdfPath} (${pdfBuffer.length} bytes)`);

  // 4) Build the email HTML (payment instructions match the PDF).
  const payLines = invoiceRenderer.paymentInstructions(documentPayload);
  const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Invoice ${documentPayload.invoice_number}</title>
    </head>
    <body style="font-family: Arial, sans-serif; background: #f4f6f8; margin: 0; padding: 24px; color: #333;">
      <div style="max-width: 720px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <div style="display: flex; align-items: center; gap: 16px;">
          <div>
            <h1 style="color: #0d9488; margin: 0; font-size: 20px;">The Greggory Systems And Strategy Firm</h1>
            <p style="margin: 0; font-size: 12px; color: #666;">Strategic Systems &amp; Business Solutions</p>
          </div>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />

        <h2 style="color: #0d9488; margin: 0 0 8px;">Personnel / Client Invoice</h2>
        <p style="margin: 4px 0;"><strong>Invoice Number:</strong> ${documentPayload.invoice_number}</p>
        <p style="margin: 4px 0;"><strong>Client:</strong> ${documentPayload.client_name}</p>
        <p style="margin: 4px 0;"><strong>Client Email:</strong> ${documentPayload.client_email}</p>
        <p style="margin: 4px 0;"><strong>Client Phone:</strong> ${documentPayload.client_phone}</p>
        <p style="margin: 4px 0;"><strong>Payment Phone:</strong> ${documentPayload.payment_phone}</p>
        <p style="margin: 4px 0;"><strong>Value (Subtotal):</strong> KSh 25,000.00</p>
        <p style="margin: 4px 0;"><strong>Tax Rate:</strong> 16%</p>
        <p style="margin: 4px 0;"><strong>Tax Amount:</strong> KSh 4,000.00</p>
        <p style="margin: 4px 0; font-size: 16px; font-weight: bold; color: #0d9488;">
          Total: KSh 29,000.00 (KES 29,000)
        </p>
        <p style="margin: 4px 0;"><strong>Due Date:</strong> ${documentPayload.due_date}</p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />

        <h3 style="color: #0d9488; margin: 0 0 12px;">Payment Instructions</h3>
        <ul style="margin: 0; padding-left: 20px;">
          ${payLines.map((line) => `<li>${line}</li>`).join("")}
        </ul>

        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="font-size: 12px; color: #666; margin-top: 24px;">
          Thank you for choosing The Greggory Systems And Strategy Firm.
        </p>
        <p style="font-size: 11px; color: #999; margin-top: 16px; text-align: center;">
          Issued ${documentPayload.issue_date} &middot; The Greggory Systems And Strategy Firm
        </p>
      </div>
    </body>
    </html>
  `;

  const emailText = `
The Greggory Systems And Strategy Firm — Invoice ${documentPayload.invoice_number}

Client: ${documentPayload.client_name}
Email: ${documentPayload.client_email}
Phone: ${documentPayload.client_phone}
Payment Phone: ${documentPayload.payment_phone}
Subtotal: KSh 25,000.00
Tax (16%): KSh 4,000.00
Total: KSh 29,000.00
Due Date: ${documentPayload.due_date}

Payment Instructions:
${payLines.map((line) => "  " + line).join("\n")}

Thank you for choosing The Greggory Systems And Strategy Firm.
`;

  // 5) Send via email WITH the invoice PDF attached (sendMail supports
  //    attachments + our branded HTML/plain-text; sendInvoiceEmail does not).
  const { sendMail } = require("../../backend/services/emailService");
  const emailResult = await sendMail({
    to: documentPayload.client_email,
    subject: `Official Invoice - ${documentPayload.invoice_number}`,
    html: emailHtml,
    text: emailText,
    attachments: [
      {
        filename: `Invoice-${documentPayload.invoice_number}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
  console.log(statusLine("EMAIL", emailResult));

  // 6) Send via WhatsApp using the STRICT sender so a provider rejection is
  //    shown honestly (❌ FAILED) instead of being masked as a fake success.
  //    Normalize to E.164 so Infobip accepts the recipient (07XXXXXXXX -> +2547…).
  const toE164ForDelivery = (rawPhone) => {
    const d = String(rawPhone || "").replace(/\D/g, "");
    if (/^0\d{9}$/.test(d)) return `+254${d.slice(1)}`;
    if (/^[17]\d{8}$/.test(d)) return `+254${d}`;
    if (/^254\d{9}$/.test(d)) return `+${d}`;
    return `+${d}`;
  };
  const { sendWhatsAppToUserStrict } = require("../../backend/services/whatsappService");
  const whatsappMessage = `
Hello Brian,

Your invoice INV-2026-0417 from The Greggory Systems And Strategy Firm has been issued.

Invoice Number: INV-2026-0417
Amount: KSh 25,000.00
Total: KSh 29,000.00 (KES 29,000)
Due Date: ${documentPayload.due_date}

Payment Instructions:
${payLines.map((line) => "  " + line).join("\n")}

Thank you for your business.
`;
  const waResult = await sendWhatsAppToUserStrict(
    toE164ForDelivery(documentPayload.client_phone),
    whatsappMessage
  );
  console.log(statusLine("WHATSAPP", waResult));
  if (!waResult.success) {
    console.log(
      `  ${C.dim}Reason: ${waResult.error || "not delivered"}. ` +
        `Brian must opt in to the test sender +44 7860 088970 ` +
        `(send the keyword THEGREGGORYSYSTEMS001), then re-run to get a real ✅.${C.reset}`
    );
  }

  // 6b) SMS fallback — rides the SAME Infobip key and needs NO opt-in, so the
  //     client is notified immediately even before they opt in to WhatsApp.
  const { sendSMSToUserStrict } = require("../../backend/services/smsService");
  const smsMessage =
    `Invoice ${documentPayload.invoice_number} from The Greggory Systems And Strategy Firm. ` +
    `Amount KSh 25,000 (total KSh 29,000). Due ${documentPayload.due_date}. ` +
    `Pay to 0799789956. Ref ${documentPayload.invoice_number}. ` +
    `Full invoice emailed to ${documentPayload.client_email}.`;
  const smsResult = await sendSMSToUserStrict(
    toE164ForDelivery(documentPayload.client_phone),
    smsMessage
  );
  console.log(statusLine("SMS", smsResult));

  console.log(`\n${C.bold}=== SUMMARY ===${C.reset}`);
  console.log(`Invoice: ${documentPayload.invoice_number}`);
  console.log(`Client:  ${documentPayload.client_name}`);
  console.log(`Email:   ${documentPayload.client_email}`);
  console.log(`Phone:   ${documentPayload.client_phone}`);
  console.log(`Amount:  KSh 25,000.00 (KES 29,000.00 total)`);
  console.log(`PDF:     ${pdfPath}`);
  console.log("");
  console.log(statusLine("EMAIL", emailResult));
  console.log(statusLine("WHATSAPP", waResult));
  console.log(statusLine("SMS", smsResult));
}

main().catch((err) => {
  console.error("[FATAL]", err);
  process.exit(1);
});
