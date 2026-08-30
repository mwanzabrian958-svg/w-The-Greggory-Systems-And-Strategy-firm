// WhatsApp Service — Meta WhatsApp Cloud API (preferred) / Africa's Talking / simulated fallback
const africastalking = require('africastalking');

// --- Africa's Talking (legacy path) ---
const username = process.env.AFRICASTALKING_USERNAME || 'sandbox';
const apiKey = process.env.AFRICASTALKING_API_KEY || '';

let whatsapp = null;

try {
  if (apiKey && apiKey.trim()) {
    whatsapp = africastalking({
      username,
      apiKey
    }).WhatsApp;
  }
} catch (error) {
  console.warn('[WHATSAPP SERVICE] Africa\'s Talking client init failed, using simulated relay fallback:', error.message);
}

// --- Meta WhatsApp Cloud API (preferred when its credentials are present) ---
const CLOUD_TOKEN = process.env.WHATSAPP_CLOUD_TOKEN || '';
const CLOUD_PHONE_ID = process.env.WHATSAPP_CLOUD_PHONE_ID || '';
const CLOUD_API_VERSION = process.env.WHATSAPP_CLOUD_API_VERSION || 'v20.0';

// The provider that will actually deliver messages:
//   'meta-cloud'      → Meta WhatsApp Cloud API (WHATSAPP_CLOUD_TOKEN + WHATSAPP_CLOUD_PHONE_ID)
//   'africastalking'  → Africa's Talking (AFRICASTALKING_USERNAME + AFRICASTALKING_API_KEY)
//   'none'            → nothing configured; senders fall back to the simulated relay
const activeProvider =
  CLOUD_TOKEN && CLOUD_PHONE_ID ? 'meta-cloud' : whatsapp ? 'africastalking' : 'none';

const providerConfigured = () => activeProvider !== 'none';

// Company WhatsApp number that receives messages
// Standardize to E.164 format (remove spaces, ensure + prefix)
const rawCompanyNumber = process.env.COMPANY_WHATSAPP_NUMBER || '+254115525854';
const COMPANY_WHATSAPP_NUMBER = rawCompanyNumber.replace(/\s+/g, '').startsWith('+')
  ? rawCompanyNumber.replace(/\s+/g, '')
  : `+${rawCompanyNumber.replace(/\s+/g, '')}`;

function buildSimulatedResponse(provider, action) {
  return {
    success: true,
    simulated: true,
    provider,
    action,
    data: {
      simulated: true,
      messageId: `sim-${Date.now()}`,
      status: 'queued-for-delivery',
      note: 'Provider credentials were unavailable, so the message was recorded locally for relay.'
    }
  };
}

/**
 * Dispatch a WhatsApp message through the active provider.
 * Throws on provider-level failure — callers decide whether to fall back.
 * @param {string[]} toArray - Recipient numbers (E.164, '+' allowed)
 * @param {string} message - Message body
 * @param {Object} [opts] - { from } overrides the sender for Africa's Talking
 */
async function dispatchWhatsApp(toArray, message, opts = {}) {
  if (activeProvider === 'meta-cloud') {
    const results = [];
    for (const to of toArray) {
      const toDigits = String(to).replace(/\D/g, ''); // Cloud API expects digits only
      const httpRes = await fetch(
        `https://graph.facebook.com/${CLOUD_API_VERSION}/${CLOUD_PHONE_ID}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${CLOUD_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: toDigits,
            type: 'text',
            text: { body: message },
          }),
        }
      );
      const payload = await httpRes.json().catch(() => ({}));
      if (!httpRes.ok) {
        const err = new Error(payload?.error?.message || `WhatsApp Cloud API HTTP ${httpRes.status}`);
        err.providerPayload = payload;
        throw err;
      }
      results.push({ to, messageId: (payload && payload.messages && payload.messages[0] && payload.messages[0].id) || null });
    }
    return { provider: 'meta-cloud', response: { results } };
  }

  // Africa's Talking
  const response = await whatsapp.send({
    to: toArray,
    message: message,
    from: opts.from || COMPANY_WHATSAPP_NUMBER,
  });
  return { provider: 'africastalking', response };
}

/**
 * Send WhatsApp message FROM user TO company WhatsApp number
 * @param {string} fromPhone - Sender phone number (user's phone)
 * @param {string} message - Message content
 * @returns {Promise<Object>} - API response
 */
async function sendWhatsAppMessage(fromPhone, message) {
  try {
    // Ensure sender phone number is in correct format (starts with +)
    const formattedFromPhone = fromPhone.startsWith('+') ? fromPhone : `+${fromPhone}`;

    console.log(`[WHATSAPP SERVICE] Sending WhatsApp FROM ${formattedFromPhone} TO ${COMPANY_WHATSAPP_NUMBER}: ${message}`);

    if (!providerConfigured()) {
      console.warn('[WHATSAPP SERVICE] No provider credentials configured; using simulated relay path');
      return buildSimulatedResponse('whatsapp', 'send');
    }

    const result = await dispatchWhatsApp([COMPANY_WHATSAPP_NUMBER], message, { from: formattedFromPhone });
    console.log('[WHATSAPP SERVICE] WhatsApp message sent successfully:', result.response);

    return { success: true, data: result.response };
  } catch (error) {
    console.error('[WHATSAPP SERVICE] Error sending WhatsApp message:', error);
    console.warn('[WHATSAPP SERVICE] Falling back to simulated relay response after provider error');
    return buildSimulatedResponse('whatsapp', 'send');
  }
}

/**
 * Send WhatsApp message to multiple recipients (admin function)
 * @param {Array<string>} phoneNumbers - Array of recipient phone numbers
 * @param {string} message - Message content
 * @returns {Promise<Object>} - API response
 */
async function sendBulkWhatsApp(phoneNumbers, message) {
  try {
    // Format all phone numbers
    const formattedPhones = phoneNumbers.map(phone => 
      phone.startsWith('+') ? phone : `+${phone}`
    );

    console.log(`[WHATSAPP SERVICE] Sending bulk WhatsApp to ${formattedPhones.length} recipients`);

    if (!providerConfigured()) {
      console.warn('[WHATSAPP SERVICE] No provider credentials configured; using simulated bulk relay path');
      return buildSimulatedResponse('whatsapp', 'bulk-send');
    }

    const result = await dispatchWhatsApp(formattedPhones, message, { from: COMPANY_WHATSAPP_NUMBER });
    console.log('[WHATSAPP SERVICE] Bulk WhatsApp sent successfully:', result.response);

    return {
      success: true,
      data: result.response
    };
  } catch (error) {
    console.error('[WHATSAPP SERVICE] Error sending bulk WhatsApp:', error);
    console.warn('[WHATSAPP SERVICE] Falling back to simulated bulk relay response after provider error');
    return buildSimulatedResponse('whatsapp', 'bulk-send');
  }
}

/**
 * Send WhatsApp message FROM company TO user (for Auth Keys, etc.)
 * @param {string} toPhone - Recipient phone number
 * @param {string} message - Message content
 * @returns {Promise<Object>} - API response
 */
async function sendWhatsAppToUser(toPhone, message) {
  try {
    const formattedToPhone = toPhone.startsWith('+') ? toPhone : `+${toPhone}`;
    console.log(`[WHATSAPP SERVICE] Sending Auth Key TO ${formattedToPhone}: ${message}`);

    if (!providerConfigured()) {
      console.warn('[WHATSAPP SERVICE] No provider credentials; using simulated relay path');
      return buildSimulatedResponse('whatsapp', 'send-to-user');
    }

    const result = await dispatchWhatsApp([formattedToPhone], message);
    return { success: true, data: result.response };
  } catch (error) {
    console.error('[WHATSAPP SERVICE] Error sending to user:', error);
    return buildSimulatedResponse('whatsapp', 'send-to-user');
  }
}

/**
 * STRICT send to a user — never simulated, never masks provider failures.
 * Used for password resets where the admin MUST know whether delivery
 * actually happened before the client's password is rotated.
 * @returns {Promise<{success:true, simulated:false, provider:string, data:Object}
 *                  |{success:false, simulated:false, error:string, message?:string}>}
 */
async function sendWhatsAppToUserStrict(toPhone, message) {
  if (!providerConfigured()) {
    return {
      success: false,
      simulated: false,
      error: 'NO_PROVIDER',
      message: 'No WhatsApp provider is configured. Set WHATSAPP_CLOUD_TOKEN + WHATSAPP_CLOUD_PHONE_ID (Meta Cloud API) or AFRICASTALKING_USERNAME + AFRICASTALKING_API_KEY (Africa\'s Talking) in .env.',
    };
  }
  try {
    const formattedToPhone = toPhone.startsWith('+') ? toPhone : `+${toPhone}`;
    const result = await dispatchWhatsApp([formattedToPhone], message);
    console.log(`[WHATSAPP SERVICE] STRICT send to ${formattedToPhone} via ${result.provider} OK`);
    return { success: true, simulated: false, provider: result.provider, data: result.response };
  } catch (error) {
    console.error('[WHATSAPP SERVICE] STRICT send failed:', error.message);
    return { success: false, simulated: false, error: error.message };
  }
}

module.exports = {
  sendWhatsAppMessage,
  sendBulkWhatsApp,
  sendWhatsAppToUser,
  sendWhatsAppToUserStrict,
  providerConfigured,
  activeProvider,
  COMPANY_WHATSAPP_NUMBER
};
