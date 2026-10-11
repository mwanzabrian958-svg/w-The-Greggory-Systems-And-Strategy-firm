// One-off live check: place a real Infobip TTS voice call to the company number.
// Confirms the voice channel works with the existing WHATSAPP_INFOBIP_* credentials.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const { sendVoiceToUserStrict } = require('../../backend/services/voiceService');

const TO = process.argv[2] || '254115525854'; // company number (proven to accept)
const TEXT = process.argv[3] || 'This is a test call from The Greggory Systems voice system. Voice is working.';

(async () => {
  console.log('VOICE TEST →', TO);
  const res = await sendVoiceToUserStrict(TO, TEXT);
  console.log('RESULT:', JSON.stringify(res, null, 2));
  console.log(res.success && !res.simulated ? '\n✅ VOICE: REAL CALL PLACED' : '\n❌ VOICE: NOT DELIVERED / SIMULATED');
})();
