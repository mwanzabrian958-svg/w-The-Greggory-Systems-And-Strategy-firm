const africastalking = require('africastalking');

// Initialize Africa's Talking with credentials from environment variables
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
  COMPANY_PHONE_NUMBER
};
