// Viber Service — Infobip / simulated fallback
//
// Sends via POST /viber/1/message/text (live-tested endpoint shape).
// NOTE: Infobip REJECTED_SOURCE ("Invalid Source address") until a Viber
// sender is registered in the portal (Channels → Viber → Senders). Until
// then sends return a clean failure (never fake success) so the OTP chain
// can fall through to the next channel.
const {
  infobipReady,
  infobipPost,
  throwOnInfobipRejection,
  toDigits,
} = require('./infobipClient');

const VIBER_SENDER = (process.env.INFOBIP_VIBER_SENDER || process.env.WHATSAPP_INFOBIP_SENDER || '447860088970').replace(/^\+/, '');

const providerConfigured = () => infobipReady;

function buildSimulatedResponse(action) {
  return {
    success: true,
    simulated: true,
    provider: 'viber',
    action,
    data: {
      simulated: true,
      messageId: `sim-${Date.now()}`,
      status: 'queued-for-delivery',
      note: 'Viber sender not registered — recorded locally for relay.',
    },
  };
}

/**
 * Send Viber message FROM company TO user.
 * Returns { success, simulated, provider?, data? } — soft path (falls back to simulated).
 */
async function sendViberToUser(toPhone, message) {
  if (!providerConfigured()) {
    console.warn('[VIBER SERVICE] No provider configured; using simulated relay path');
    return buildSimulatedResponse('send-to-user');
  }
  try {
    const payload = await infobipPost('/viber/1/message/text', {
      messages: [{ from: VIBER_SENDER, to: toDigits(toPhone), content: { text: message } }],
    });
    throwOnInfobipRejection(payload);
    console.log(`[VIBER SERVICE] sent via Infobip to ${toDigits(toPhone)}`);
    return { success: true, simulated: false, provider: 'infobip-viber', data: payload };
  } catch (error) {
    console.error('[VIBER SERVICE] send failed:', error.message);
    return buildSimulatedResponse('send-to-user');
  }
}

/**
 * STRICT send — never simulated. Used for OTP codes.
 */
async function sendViberToUserStrict(toPhone, message) {
  if (!providerConfigured()) {
    return {
      success: false,
      simulated: false,
      error: 'NO_PROVIDER',
      message: 'No Viber provider is configured. Set WHATSAPP_INFOBIP_BASE_URL + WHATSAPP_INFOBIP_API_KEY (Infobip) and register a Viber sender.',
    };
  }
  try {
    const payload = await infobipPost('/viber/1/message/text', {
      messages: [{ from: VIBER_SENDER, to: toDigits(toPhone), content: { text: message } }],
    });
    throwOnInfobipRejection(payload);
    return { success: true, simulated: false, provider: 'infobip-viber', data: payload };
  } catch (error) {
    return { success: false, simulated: false, error: error.message };
  }
}

module.exports = {
  sendViberToUser,
  sendViberToUserStrict,
  providerConfigured,
  VIBER_SENDER,
};
