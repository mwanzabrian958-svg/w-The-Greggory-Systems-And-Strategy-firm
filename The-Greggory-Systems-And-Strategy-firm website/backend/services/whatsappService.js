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

// Optional Meta message template used to deliver verification CODES to portal
// / APK users. Meta only delivers business-initiated (no open chat window)
// messages as pre-approved templates, so without this the code can only reach
// clients who messaged the business within the last 24 hours. The template
// must be an Authentication/Utility template with ONE body parameter (the
// code). Unset → codes are sent as plain text instead.
const OTP_TEMPLATE_NAME = (process.env.WHATSAPP_OTP_TEMPLATE_NAME || '').trim();

// ── Credential SHAPE validation ─────────────────────────────────────────────
// WHATSAPP_CLOUD_PHONE_ID must be Meta's NUMERIC "Phone number ID" (e.g.
// "103985765432109", copied from developers.facebook.com → WhatsApp → API
// Setup). A phone number like "+254…" used to pass the old truthy check,
// select meta-cloud as the provider, and then fail EVERY send with an HTTP 404
// from graph.facebook.com. Africa's Talking usernames are bare tokens
// ("sandbox" / your app username) and never contain spaces. Bad values are
// now excluded from provider selection and surfaced through
// getProviderDiagnostics() so boot logs explain why sends are simulated.
const providerIssues = [];
const cloudPhoneIdLooksNumeric = /^\d+$/.test(String(CLOUD_PHONE_ID).trim());
const metaReady = Boolean(CLOUD_TOKEN && CLOUD_PHONE_ID);
if (metaReady && !cloudPhoneIdLooksNumeric) {
  providerIssues.push(
    `WHATSAPP_CLOUD_PHONE_ID="${CLOUD_PHONE_ID}" is not a numeric Meta Phone number ID ` +
    '(it looks like a phone number). Copy the ID from developers.facebook.com -> your app -> ' +
    'WhatsApp -> API Setup. Meta Cloud API is DISABLED until this is fixed — every send ' +
    'would otherwise fail HTTP 404.',
  );
}
const atUsernameHasSpace = /\s/.test(username);
const atReady = Boolean(whatsapp && apiKey && apiKey.trim());
if (atReady && atUsernameHasSpace) {
  providerIssues.push(
    `AFRICASTALKING_USERNAME="${username}" contains whitespace — Africa\'s Talking expects ` +
    'the bare app username (e.g. "sandbox"). Africa\'s Talking is DISABLED until this is fixed.',
  );
}

// The provider that will actually deliver messages:
//   'meta-cloud'      → Meta WhatsApp Cloud API (WHATSAPP_CLOUD_TOKEN + WHATSAPP_CLOUD_PHONE_ID)
//   'africastalking'  → Africa's Talking (AFRICASTALKING_USERNAME + AFRICASTALKING_API_KEY)
//   'none'            → nothing (or nothing VALID) configured; senders fall back
//                        to the simulated relay and boot logs list the issues.
const activeProvider =
  metaReady && cloudPhoneIdLooksNumeric
    ? 'meta-cloud'
    : atReady && !atUsernameHasSpace
      ? 'africastalking'
      : 'none';

const providerConfigured = () => activeProvider !== 'none';

/** Boot/health diagnostics — human-readable config problems, if any. */
function getProviderDiagnostics() {
  return { activeProvider, configured: providerConfigured(), issues: [...providerIssues] };
}

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
 * Dispatch a pre-approved WhatsApp TEMPLATE message (used for verification
 * codes). Meta only delivers business-initiated messages outside a 24h
 * customer-service window when they use an approved template, so code delivery
 * MUST go through this path on meta-cloud (plain dispatchWhatsApp is kept for
 * ordinary conversation messages).
 *
 * @param {string} to - Recipient number (E.164)
 * @param {string} templateName - Approved template name (WHATSAPP_OTP_TEMPLATE_NAME)
 * @param {string[]} placeholders - Body parameter values, in order
 * @param {Object} [opts] - { language: 'en', fallbackMessage } — the fallback
 *   message is used on the Africa's Talking path, which has no template
 *   dispatch wired here (it falls back to plain text, delivering only inside
 *   the 24h window).
 * @throws on provider-level failure — callers decide how to report it.
 */
async function dispatchWhatsAppTemplate(to, templateName, placeholders, opts = {}) {
  if (activeProvider === 'meta-cloud') {
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
          type: 'template',
          template: {
            name: templateName,
            language: { code: opts.language || 'en' },
            components: [
              {
                type: 'body',
                parameters: (placeholders || []).map((text) => ({ type: 'text', text: String(text) })),
              },
            ],
          },
        }),
      },
    );
    const payload = await httpRes.json().catch(() => ({}));
    if (!httpRes.ok) {
      const err = new Error(payload?.error?.message || `WhatsApp Cloud API HTTP ${httpRes.status}`);
      err.providerPayload = payload;
      throw err;
    }
    return { provider: 'meta-cloud', response: payload };
  }

  // Africa's Talking: template dispatch is not wired on this path — degrade to
  // a plain message (delivers only while the 24h customer-service window is open).
  const fallbackMessage =
    opts.fallbackMessage || `Your verification code is ${(placeholders || [])[0] ?? ''}`;
  return dispatchWhatsApp([to], fallbackMessage, opts);
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

/**
 * STRICT template send to a user — never simulated, never masks provider
 * failures. Used for verification codes, where the caller must know whether
 * delivery actually happened before treating the code as "sent".
 * @returns {Promise<{success:true, simulated:false, provider:string, data:Object}
 *                  |{success:false, simulated:false, error:string, message?:string}>}
 */
async function sendWhatsAppTemplateStrict(toPhone, templateName, placeholders, opts = {}) {
  if (!providerConfigured()) {
    return {
      success: false,
      simulated: false,
      error: 'NO_PROVIDER',
      message: 'No WhatsApp provider is configured. Set WHATSAPP_CLOUD_TOKEN + WHATSAPP_CLOUD_PHONE_ID (Meta Cloud API) or AFRICASTALKING_USERNAME + AFRICASTALKING_API_KEY (Africa\'s Talking) in .env.',
    };
  }
  if (!templateName) {
    return {
      success: false,
      simulated: false,
      error: 'NO_TEMPLATE',
      message: 'WHATSAPP_OTP_TEMPLATE_NAME is not set — cannot send a template message.',
    };
  }
  try {
    const formattedToPhone = toPhone.startsWith('+') ? toPhone : `+${toPhone}`;
    const result = await dispatchWhatsAppTemplate(formattedToPhone, templateName, placeholders, opts);
    console.log(`[WHATSAPP SERVICE] STRICT template send to ${formattedToPhone} via ${result.provider} OK`);
    return { success: true, simulated: false, provider: result.provider, data: result.response };
  } catch (error) {
    console.error('[WHATSAPP SERVICE] STRICT template send failed:', error.message);
    return { success: false, simulated: false, error: error.message };
  }
}

module.exports = {
  sendWhatsAppMessage,
  sendBulkWhatsApp,
  sendWhatsAppToUser,
  sendWhatsAppToUserStrict,
  sendWhatsAppTemplateStrict,
  providerConfigured,
  getProviderDiagnostics,
  activeProvider,
  OTP_TEMPLATE_NAME,
  COMPANY_WHATSAPP_NUMBER
};
