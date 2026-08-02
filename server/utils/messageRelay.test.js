const test = require('node:test');
const assert = require('node:assert/strict');
const { sendSMS } = require('../../backend/services/smsService');
const { sendWhatsAppMessage } = require('../../backend/services/whatsappService');

test('SMS relay falls back to a local success path when gateway credentials are missing', async () => {
  const result = await sendSMS('+254700000000', 'Portal sync check');
  assert.equal(result.success, true);
  assert.equal(result.data?.simulated, true);
});

test('WhatsApp relay falls back to a local success path when gateway credentials are missing', async () => {
  const result = await sendWhatsAppMessage('+254700000000', 'Portal sync check');
  assert.equal(result.success, true);
  assert.equal(result.data?.simulated, true);
});
