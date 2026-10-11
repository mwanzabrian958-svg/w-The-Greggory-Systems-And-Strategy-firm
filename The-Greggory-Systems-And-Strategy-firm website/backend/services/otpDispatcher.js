// Multi-channel OTP dispatcher — WhatsApp → SMS → Email → Voice → Viber.
//
// Tries each channel in order and returns the FIRST success, so a code always
// has a path even when one provider is down or unregistered. Callers pass the
// already-generated code; delivery + persistence stays with them.
//
// Channel config comes from OTP_CHANNELS (comma list) or defaults to the full
// chain. STRICT variants are used everywhere — a "simulated" send never counts.
const { sendWhatsAppTemplateStrict, OTP_TEMPLATE_NAME } = require('./whatsappService');
const { sendSMSToUserStrict } = require('./smsService');
const { sendMail } = require('./emailService');
const { sendVoiceToUserStrict } = require('./voiceService');
const { sendViberToUserStrict } = require('./viberService');

const DEFAULT_CHAIN = ['whatsapp', 'sms', 'email', 'voice', 'viber'];

function channelChain() {
  const raw = (process.env.OTP_CHANNELS || '').trim();
  if (!raw) return [...DEFAULT_CHAIN];
  const picked = raw.split(',').map((s) => s.trim().toLowerCase()).filter((s) => DEFAULT_CHAIN.includes(s));
  return picked.length ? picked : [...DEFAULT_CHAIN];
}

function codeEmailHtml(code, ttlMinutes) {
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
    <div style="background:#0f172a;color:#fff;padding:18px 24px;">
      <div style="font-size:9px;color:#5eead4;letter-spacing:3px;text-transform:uppercase;">The Greggory Systems</div>
      <div style="font-size:18px;font-weight:800;">Your verification code</div>
    </div>
    <div style="padding:20px 24px;color:#334155;font-size:14px;line-height:1.6;">
      <p>Your verification code for the client portal is:</p>
      <p style="font-size:32px;font-weight:800;letter-spacing:8px;color:#0f172a;">${code}</p>
      <p>It expires in ${ttlMinutes} minutes. Never share this code — our team will never ask for it.</p>
    </div>
  </div>`;
}

/**
 * Deliver `code` to `user` ({ phone_number, email }) over the first channel
 * that succeeds. Returns { channel, provider } or { failure, attempts }.
 */
async function dispatchOtp({ user, code, message, ttlMinutes = 10 }) {
  const attempts = [];
  for (const channel of channelChain()) {
    try {
      if (channel === 'whatsapp') {
        if (!user.phone_number) { attempts.push('whatsapp: no phone on file'); continue; }
        if (!OTP_TEMPLATE_NAME) { attempts.push('whatsapp: WHATSAPP_OTP_TEMPLATE_NAME unset'); continue; }
        const r = await sendWhatsAppTemplateStrict(user.phone_number, OTP_TEMPLATE_NAME, [code], { fallbackMessage: message });
        if (r.success) return { channel, provider: r.provider };
        attempts.push(`whatsapp: ${r.error || 'failed'}`);
      } else if (channel === 'sms') {
        if (!user.phone_number) { attempts.push('sms: no phone on file'); continue; }
        const r = await sendSMSToUserStrict(user.phone_number, `${message}`);
        if (r.success) return { channel, provider: r.provider };
        attempts.push(`sms: ${r.error || 'failed'}`);
      } else if (channel === 'email') {
        if (!user.email) { attempts.push('email: no email on file'); continue; }
        const r = await sendMail({
          to: user.email,
          subject: 'Your Greggory verification code',
          html: codeEmailHtml(code, ttlMinutes),
          text: `${message}\n\nCode: ${code}\nExpires in ${ttlMinutes} minutes.`,
        });
        if (r.success && !r.simulated) return { channel: 'email', provider: 'smtp' };
        attempts.push(`email: ${r.error || 'simulated (SMTP_PASS unset)'}`);
      } else if (channel === 'voice') {
        if (!user.phone_number) { attempts.push('voice: no phone on file'); continue; }
        const r = await sendVoiceToUserStrict(user.phone_number, `Your Greggory verification code is ${code}. I repeat, ${code}.`);
        if (r.success) return { channel, provider: r.provider };
        attempts.push(`voice: ${r.error || 'failed'}`);
      } else if (channel === 'viber') {
        if (!user.phone_number) { attempts.push('viber: no phone on file'); continue; }
        const r = await sendViberToUserStrict(user.phone_number, `${message}`);
        if (r.success) return { channel, provider: r.provider };
        attempts.push(`viber: ${r.error || 'failed'}`);
      }
    } catch (error) {
      attempts.push(`${channel}: ${error.message}`);
    }
  }
  return { failure: true, attempts };
}

/** Per-channel availability for the /status probe (no secrets). */
function channelStatus() {
  const wa = require('./whatsappService');
  const sms = require('./smsService');
  const viber = require('./viberService');
  const voice = require('./voiceService');
  return {
    chain: channelChain(),
    whatsapp: { configured: wa.providerConfigured(), provider: wa.activeProvider, template: OTP_TEMPLATE_NAME || null },
    sms: { configured: sms.providerConfigured(), provider: sms.activeProvider },
    email: { configured: Boolean(process.env.SMTP_PASS), provider: process.env.SMTP_PASS ? 'smtp' : 'none' },
    voice: { configured: voice.providerConfigured(), provider: voice.providerConfigured() ? 'infobip-voice' : 'none' },
    viber: { configured: viber.providerConfigured(), provider: viber.providerConfigured() ? 'infobip-viber (needs registered sender)' : 'none' },
  };
}

module.exports = { dispatchOtp, channelChain, channelStatus, DEFAULT_CHAIN };
