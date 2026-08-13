const https = require('https');

const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || '';
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || '';
const MPESA_PASSKEY = process.env.MPESA_PASSKEY || '';
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE || '174379';
const MPESA_ENV = process.env.NODE_ENV === 'production' ? 'api' : 'sandbox';

/**
 * Get M-Pesa Access Token
 */
async function getAccessToken() {
  return new Promise((resolve, reject) => {
    if (!MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET) {
      console.warn('[MPESA] Consumer key or secret missing. Payment gateway will run in simulation mode.');
      return resolve('simulated-token');
    }

    const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
    const options = {
      hostname: `${MPESA_ENV}.safaricom.co.ke`,
      path: '/oauth/v1/generate?grant_type=client_credentials',
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response.access_token);
        } catch (e) {
          reject(new Error('Failed to parse access token response'));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.end();
  });
}

/**
 * Initiate STK Push (Lipa Na M-Pesa Online)
 */
async function initiateSTKPush(phoneNumber, amount, accountReference, transactionDesc) {
  const accessToken = await getAccessToken();

  if (accessToken === 'simulated-token') {
    return {
      success: true,
      simulated: true,
      MerchantRequestID: `sim-${Date.now()}`,
      CheckoutRequestID: `chk-${Math.random().toString(36).substring(7)}`,
      ResponseDescription: 'Simulation Mode: STK Push request received and acknowledged locally.'
    };
  }

  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');

  // Format phone number to 254XXXXXXXXX
  const formattedPhone = phoneNumber.replace(/\+/g, '').replace(/^0/, '254');

  const postData = JSON.stringify({
    BusinessShortCode: MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.round(amount),
    PartyA: formattedPhone,
    PartyB: MPESA_SHORTCODE,
    PhoneNumber: formattedPhone,
    CallBackURL: `${process.env.BACKEND_URL || 'https://your-domain.com'}/api/mpesa/callback`,
    AccountReference: accountReference,
    TransactionDesc: transactionDesc
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: `${MPESA_ENV}.safaricom.co.ke`,
      path: '/mpesa/stkpush/v1/processrequest',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({ success: res.statusCode === 200, ...response });
        } catch (e) {
          reject(new Error('Failed to parse STK Push response'));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(postData);
    req.end();
  });
}

module.exports = {
  getAccessToken,
  initiateSTKPush
};
