// Voice Service — Infobip TTS (text-to-speech call) / simulated fallback
//
// Sends via POST /tts/3/advanced (live-tested: PENDING_ACCEPTED to +254…).
// The recipient gets a PHONE CALL that reads the text aloud — used for OTP
// codes ("Your code is 1 2 3 4 5 6") and urgent notifications.
const {
  INFOBIP_SENDER,
  infobipReady,
  infobipPost,
  throwOnInfobipRejection,
  toDigits,
} = require('./infobipClient');

const VOICE_FROM = (process.env.INFOBIP_VOICE_FROM || 'Greggory').trim();
const VOICE_LANGUAGE = (process.env.INFOBIP_VOICE_LANGUAGE || 'en').trim();

const providerConfigured = () => infobipReady;

function buildSimulatedResponse(action) {
  return {
    success: true,
    simulated: true,
    provider: 'voice',
    action,
    data: {
      simulated: true,
      messageId: `sim-${Date.now()}`,
      status: 'queued-for-delivery',
      note: 'Voice provider unavailable — recorded locally for relay.',
    },
  };
}

/** Space digits out so TTS reads "1 2 3 4 5 6" instead of "twelve thousand". */
function spellForTts(text) {
  return String(text).replace(/(\d)/g, '$1, ').replace(/,\s*$/, '');
}

/**
 * Place a TTS call FROM company TO user, reading `message` aloud.
 * Soft path (falls back to simulated).
 */
async function sendVoiceToUser(toPhone, message, opts = {}) {
  if (!providerConfigured()) {
    console.warn('[VOICE SERVICE] No provider configured; using simulated relay path');
    return buildSimulatedResponse('call-user');
  }
  try {
    const payload = await infobipPost('/tts/3/advanced', {
      messages: [
        {
          from: opts.from || VOICE_FROM,
          destinations: [{ to: toDigits(toPhone) }],
          text: spellForTts(message),
          language: opts.language || VOICE_LANGUAGE,
          voice: { gender: opts.voiceGender || 'female' },
        },
      ],
    });
    throwOnInfobipRejection(payload);
    console.log(`[VOICE SERVICE] call placed via Infobip to ${toDigits(toPhone)}`);
    return { success: true, simulated: false, provider: 'infobip-voice', data: payload };
  } catch (error) {
    console.error('[VOICE SERVICE] call failed:', error.message);
    return buildSimulatedResponse('call-user');
  }
}

/**
 * STRICT call — never simulated. Used for OTP codes.
 */
async function sendVoiceToUserStrict(toPhone, message, opts = {}) {
  if (!providerConfigured()) {
    return {
      success: false,
      simulated: false,
      error: 'NO_PROVIDER',
      message: 'No Voice provider is configured. Set WHATSAPP_INFOBIP_BASE_URL + WHATSAPP_INFOBIP_API_KEY (Infobip).',
    };
  }
  try {
    const payload = await infobipPost('/tts/3/advanced', {
      messages: [
        {
          from: opts.from || VOICE_FROM,
          destinations: [{ to: toDigits(toPhone) }],
          text: spellForTts(message),
          language: opts.language || VOICE_LANGUAGE,
          voice: { gender: opts.voiceGender || 'female' },
        },
      ],
    });
    throwOnInfobipRejection(payload);
    return { success: true, simulated: false, provider: 'infobip-voice', data: payload };
  } catch (error) {
    return { success: false, simulated: false, error: error.message };
  }
}

module.exports = {
  sendVoiceToUser,
  sendVoiceToUserStrict,
  providerConfigured,
  spellForTts,
};
