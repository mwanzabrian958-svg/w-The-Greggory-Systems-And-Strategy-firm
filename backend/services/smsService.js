const africastalking = require('africastalking');

// Initialize Africa's Talking with credentials from environment variables
const username = process.env.AFRICASTALKING_USERNAME || 'sandbox';
const apiKey = process.env.AFRICASTALKING_API_KEY || '';

const sms = africastalking({
  username: username,
  apiKey: apiKey
}).SMS;

// Company phone number that receives messages
const COMPANY_PHONE_NUMBER = process.env.COMPANY_PHONE_NUMBER || '+254799789956';

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
    return {
      success: false,
      error: error.message
    };
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
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  sendSMS,
  sendBulkSMS,
  COMPANY_PHONE_NUMBER
};
