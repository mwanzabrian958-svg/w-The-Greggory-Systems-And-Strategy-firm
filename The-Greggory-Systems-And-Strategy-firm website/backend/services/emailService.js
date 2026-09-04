const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 465,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const DEFAULT_FROM =
  process.env.SMTP_FROM ||
  '"The Greggory Systems & Strategy Firm" <thegreggorysystemsandstrategyf@gmail.com>';

/**
 * Low-level send — the ONLY place the transport is touched.
 * When SMTP_PASS is not configured (local/dev/test) it simulates the send so
 * every caller still gets a definitive success/response to build UI on.
 */
const sendMail = async ({
  to,
  subject,
  html,
  text,
  attachments = [],
  from = DEFAULT_FROM,
}) => {
  const mailOptions = {
    from,
    to,
    subject,
    html,
    text,
    attachments: attachments.map((a) => ({
      filename: a.filename,
      content: a.content,
      contentType: a.contentType || "application/pdf",
    })),
  };

  if (!process.env.SMTP_PASS) {
    console.log(`[EMAIL SIMULATION] To: ${to} | Subject: ${subject} | Attachments: ${attachments.length}`);
    return { success: true, simulated: true };
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SUCCESS] Sent to ${to} | Subject: ${subject}`);
    return { success: true, simulated: false };
  } catch (error) {
    console.error(`[EMAIL FAILURE] Failed to send to ${to}:`, error.message);
    return { success: false, simulated: false, error: error.message };
  }
};

/**
 * Backwards-compatible invoice email helper (kept because older routes import
 * it). `invoiceData` fields: invoice_number, title, subtotal, due_date, email.
 */
const sendInvoiceEmail = async (clientEmail, invoiceData) => {
  const subject = `Official Invoice - ${invoiceData.invoice_number}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h1 style="color: #0d9488;">The Greggory Systems And Strategy Firm</h1>
      <p>Strategic Systems &amp; Business Solutions</p>
      <hr style="border: 1px solid #eee;" />
      <h2>Personnel / Client Invoice</h2>
      <p><strong>Invoice Number:</strong> ${invoiceData.invoice_number}</p>
      <p><strong>Mission Title:</strong> ${invoiceData.title}</p>
      <p><strong>Value:</strong> KSh ${Number(invoiceData.subtotal || 0).toLocaleString()}</p>
      <p><strong>Due Date:</strong> ${invoiceData.due_date}</p>
      <p style="font-size: 12px; color: #666; margin-top: 24px;">
        Thank you for choosing The Greggory Systems And Strategy Firm.
      </p>
    </div>
  `;
  return sendMail({ to: clientEmail, subject, html });
};

module.exports = { sendMail, sendInvoiceEmail };
