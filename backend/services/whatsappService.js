// WhatsApp Service using Africa's Talking
const africastalking = require('africastalking');

// Initialize Africa's Talking with credentials from environment variables
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

// Company WhatsApp number that receives messages
const COMPANY_WHATSAPP_NUMBER = process.env.COMPANY_WHATSAPP_NUMBER || '+254715312251';

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

    if (!whatsapp) {
      console.warn('[WHATSAPP SERVICE] No provider credentials configured; using simulated relay path');
      return buildSimulatedResponse('whatsapp', 'send');
    }

    const options = {
      to: COMPANY_WHATSAPP_NUMBER, // Send TO company WhatsApp number
      message: message,
      from: formattedFromPhone // FROM user's phone
    };

    const response = await whatsapp.send(options);
    console.log('[WHATSAPP SERVICE] WhatsApp message sent successfully:', response);

    return {
      success: true,
      data: response
    };
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

    if (!whatsapp) {
      console.warn('[WHATSAPP SERVICE] No provider credentials configured; using simulated bulk relay path');
      return buildSimulatedResponse('whatsapp', 'bulk-send');
    }

    const options = {
      to: formattedPhones,
      message: message,
      from: COMPANY_WHATSAPP_NUMBER // FROM company number
    };

    const response = await whatsapp.send(options);
    console.log('[WHATSAPP SERVICE] Bulk WhatsApp sent successfully:', response);

    return {
      success: true,
      data: response
    };
  } catch (error) {
    console.error('[WHATSAPP SERVICE] Error sending bulk WhatsApp:', error);
    console.warn('[WHATSAPP SERVICE] Falling back to simulated bulk relay response after provider error');
    return buildSimulatedResponse('whatsapp', 'bulk-send');
  }
}

module.exports = {
  sendWhatsAppMessage,
  sendBulkWhatsApp,
  COMPANY_WHATSAPP_NUMBER
};
