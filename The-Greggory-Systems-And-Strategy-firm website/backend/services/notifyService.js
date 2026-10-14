// Shared multi-channel notify service + routes (SMS/Email/Voice/Viber).
// OTP codes flow through backend/services/otpDispatcher.js (WhatsApp first,
// then SMS, Email, Voice, Viber). This module covers everything else:
// notifications, invoices, admin broadcasts.
//
// Usage:
//   const { notifyUser } = require('../services/notifyService');
//   await notifyUser({ phone, email }, 'message text', { subject, channels });
const { sendSMSToUser } = require('./smsService');
const { sendMail } = require('./emailService');
const { sendVoiceToUser } = require('./voiceService');
const { sendViberToUser } = require('./viberService');

const CHANNELS = ['sms', 'email', 'voice', 'viber'];

function pickChannels(opts = {}) {
  if (Array.isArray(opts.channels) && opts.channels.length) {
    return opts.channels.map((c) => String(c).toLowerCase()).filter((c) => CHANNELS.includes(c));
  }
  if (typeof opts.channels === 'string' && opts.channels.trim()) {
    return opts.channels.split(',').map((c) => c.trim().toLowerCase()).filter((c) => CHANNELS.includes(c));
  }
  return [...CHANNELS];
}

/**
 * Send `message` to a user over the requested channels.
 * @param {{phone?:string,email?:string}} to
 * @param {string} message
 * @param {{subject?:string,channels?:string[]|string,voice?:object}} opts
 * @returns per-channel results: { sms:{...}, email:{...}, ... }
 */
async function notifyUser(to, message, opts = {}) {
  const results = {};
  for (const channel of pickChannels(opts)) {
    try {
      if (channel === 'sms') {
        if (!to.phone) { results.sms = { success: false, error: 'no phone' }; continue; }
        results.sms = await sendSMSToUser(to.phone, message);
      } else if (channel === 'email') {
        if (!to.email) { results.email = { success: false, error: 'no email' }; continue; }
        results.email = await sendMail({
          to: to.email,
          subject: opts.subject || 'Notification — The Greggory Systems & Strategy Firm',
          text: message,
          html: `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;color:#334155;font-size:14px;line-height:1.6;"><p>${String(message).replace(/</g, '&lt;').replace(/\n/g, '<br>')}</p><p style="font-size:11px;color:#94a3b8;">The Greggory Systems &amp; Strategy Firm</p></div>`,
        });
      } else if (channel === 'voice') {
        if (!to.phone) { results.voice = { success: false, error: 'no phone' }; continue; }
        results.voice = await sendVoiceToUser(to.phone, message, opts.voice || {});
      } else if (channel === 'viber') {
        if (!to.phone) { results.viber = { success: false, error: 'no phone' }; continue; }
        results.viber = await sendViberToUser(to.phone, message);
      }
    } catch (error) {
      console.error(`[NOTIFY] channel ${channel} failed:`, error.message);
      results[channel] = { success: false, error: 'Channel delivery failed' };
    }
  }
  return results;
}

module.exports = { notifyUser, CHANNELS, pickChannels };
