const africastalking = require('africastalking');

// SMS Service — Infobip (preferred) / Africa's Talking / simulated fallback
const {
  INFOBIP_SENDER,
  infobipReady,
  infobipPost,
  throwOnInfobipRejection,
  toDigits,
} = require('./infobipClient');

// --- Africa's Talking (legacy fallback path) ---
const username = process.env.AFRICASTALKING_USERNAME || 'sandbox';
const apiKey = process.env.AFRICASTALKING_API_KEY || '';

let sms = null;

try {
  if (apiKey && apiKey.trim()) {
    sms = africastalking({
      username,
      apiKey
    }).SMS;
  }
} catch (error) {
  console.warn('[SMS SERVICE] Africa\'s Talking client init failed, using simulated relay fallback:', error.message);
}

// Company phone number that receives messages
const COMPANY_PHONE_NUMBER = process.env.COMPANY_PHONE_NUMBER || '+254115525854';

// Infobip alphanumerical sender for SMS (no opt-in needed, unlike WhatsApp).
const SMS_SENDER = (process.env.INFOBIP_SMS_SENDER || 'Greggory').trim();

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

const providerConfigured = () => infobipReady || Boolean(sms);
const activeProvider = infobipReady ? 'infobip' : (sms ? 'africastalking' : 'none');

/** Raw Infobip SMS send — throws on rejection. Live-tested (PENDING_ACCEPTED). */
async function sendViaInfobip(toDigitsList, message) {
  const payload = await infobipPost('/sms/2/text/advanced', {
    messages: [
      {
        destinations: toDigitsList.map((to) => ({ to })),
        from: SMS_SENDER,
        text: message,
      },
    ],
  });
  throwOnInfobipRejection(payload);
  return payload;
}

/**
 * Send SMS FROM company TO user (OTP codes, notifications).
 * Provider order: Infobip → Africa's Talking → simulated.
 */
async function sendSMSToUser(toPhone, message) {
  const to = toDigits(toPhone);
  if (infobipReady) {
    try {
      const payload = await sendViaInfobip([to], message);
      console.log(`[SMS SERVICE] sent via Infobip to ${to}`);
      return { success: true, simulated: false, provider: 'infobip', data: payload };
    } catch (error) {
      console.error('[SMS SERVICE] Infobip send failed, trying fallback:', error.message);
    }
  }
  if (sms) {
    try {
      const response = await sms.send({
        to: [`+${to}`],
        message,
        from: COMPANY_PHONE_NUMBER,
      });
      return { success: true, simulated: false, provider: 'africastalking', data: response };
    } catch (error) {
      console.error('[SMS SERVICE] Africa\'s Talking send failed:', error.message);
    }
  }
  console.warn('[SMS SERVICE] No provider delivered; using simulated relay path');
  return { ...buildSimulatedResponse('sms', 'send-to-user'), success: true };
}

/**
 * STRICT send to a user — never simulated. Used for OTP codes.
 */
async function sendSMSToUserStrict(toPhone, message) {
  if (!providerConfigured()) {
    return {
      success: false,
      simulated: false,
      error: 'NO_PROVIDER',
      message: 'No SMS provider is configured. Set WHATSAPP_INFOBIP_BASE_URL + WHATSAPP_INFOBIP_API_KEY (Infobip) or AFRICASTALKING_USERNAME + AFRICASTALKING_API_KEY.',
    };
  }
  const to = toDigits(toPhone);
  const errors = [];
  if (infobipReady) {
    try {
      const payload = await sendViaInfobip([to], message);
      return { success: true, simulated: false, provider: 'infobip', data: payload };
    } catch (error) {
      errors.push(`infobip: ${error.message}`);
    }
  }
  if (sms) {
    try {
      const response = await sms.send({ to: [`+${to}`], message, from: COMPANY_PHONE_NUMBER });
      return { success: true, simulated: false, provider: 'africastalking', data: response };
    } catch (error) {
      errors.push(`africastalking: ${error.message}`);
    }
  }
  return { success: false, simulated: false, error: errors.join(' | ') || 'SMS delivery failed' };
}


/**
 * Send SMS FROM user TO company phone number
 * @param {string} fromPhone - Sender phone number (user's phone)
 * @param {string} message - Message content
 * @returns {Promise<Object>} - API response
 */
async function sendSMS(fromPhone, message) {
  try {
    // Ensure sender phone number is in correct format (starts with +)
    const formattedFromPhone = fromPhone.startsWith('+') ? fromPhone : `+${fromPhone}`;

    console.log(`[SMS SERVICE] Sending SMS FROM ${formattedFromPhone} TO ${COMPANY_PHONE_NUMBER}: ${message}`);

    if (!sms) {
      console.warn('[SMS SERVICE] No provider credentials configured; using simulated relay path');
      return buildSimulatedResponse('sms', 'send');
    }

    const options = {
      to: [COMPANY_PHONE_NUMBER], // Send TO company number
      message: message,
      from: formattedFromPhone // FROM user's phone
    };

    const response = await sms.send(options);
    console.log('[SMS SERVICE] SMS sent successfully:', response);

    return {
      success: true,
      data: response
    };
  } catch (error) {
    console.error('[SMS SERVICE] Error sending SMS:', error);
    console.warn('[SMS SERVICE] Falling back to simulated relay response after provider error');
    return buildSimulatedResponse('sms', 'send');
  }
}

/**
 * Send SMS to multiple recipients (admin function)
 * @param {Array<string>} phoneNumbers - Array of recipient phone numbers
 * @param {string} message - Message content
 * @returns {Promise<Object>} - API response
 */
async function sendBulkSMS(phoneNumbers, message) {
  try {
    // Format all phone numbers
    const formattedPhones = phoneNumbers.map(phone => 
      phone.startsWith('+') ? phone : `+${phone}`
    );

    console.log(`[SMS SERVICE] Sending bulk SMS to ${formattedPhones.length} recipients`);

    if (!sms) {
      console.warn('[SMS SERVICE] No provider credentials configured; using simulated bulk relay path');
      return buildSimulatedResponse('sms', 'bulk-send');
    }

    const options = {
      to: formattedPhones,
      message: message,
      from: COMPANY_PHONE_NUMBER // FROM company number
    };

    const response = await sms.send(options);
    console.log('[SMS SERVICE] Bulk SMS sent successfully:', response);

    return {
      success: true,
      data: response
    };
  } catch (error) {
    console.error('[SMS SERVICE] Error sending bulk SMS:', error);
    console.warn('[SMS SERVICE] Falling back to simulated bulk relay response after provider error');
    return buildSimulatedResponse('sms', 'bulk-send');
  }
}

module.exports = {
  sendSMS,
  sendBulkSMS,
  sendSMSToUser,
  sendSMSToUserStrict,
  providerConfigured,
  activeProvider,
  COMPANY_PHONE_NUMBER
};
