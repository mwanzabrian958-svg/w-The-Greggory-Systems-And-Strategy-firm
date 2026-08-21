const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 465,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendInvoiceEmail = async (clientEmail, invoiceData) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || '"The Greggory Firm" <thegreggorysystemsandstrategyf@gmail.com>',
    to: clientEmail,
    subject: `Official Invoice - ${invoiceData.invoice_number}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h1 style="color: #0d9488;">The Greggory Firm</h1>
        <p>Strategic Systems & Business Solutions</p>
        <hr style="border: 1px solid #eee;" />
        <h2>Personnel / Client Invoice</h2>
        <p><strong>Invoice Number:</strong> ${invoiceData.invoice_number}</p>
        <p><strong>Mission Title:</strong> ${invoiceData.title}</p>
        <p><strong>Value:</strong> KSh ${parseFloat(invoiceData.subtotal).toLocaleString()}</p>
        <p><strong>Due Date:</strong> ${invoiceData.due_date}</p>
        <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin-top: 20px;">
          <p style="margin: 0; font-size: 14px;">Please login to your portal to complete the deployment payment.</p>
        </div>
        <p style="font-size: 12px; color: #999; margin-top: 40px;">
          © ${new Date().getFullYear()} Greggory Systems & Strategy Firm. All rights reserved.
        </p>
      </div>
    `
  };

  try {
    if (!process.env.SMTP_PASS) {
      console.log(`[EMAIL SIMULATION] To: ${clientEmail} | Subject: ${mailOptions.subject}`);
      return { success: true, simulated: true };
    }
    await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SUCCESS] Invoice sent to ${clientEmail}`);
    return { success: true };
  } catch (error) {
    console.error(`[EMAIL FAILURE] Failed to send to ${clientEmail}:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendInvoiceEmail };
