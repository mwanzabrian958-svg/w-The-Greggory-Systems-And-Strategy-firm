// ── Shared Infobip client ─────────────────────────────────────────────────
// One base URL + API key drives WhatsApp, SMS, Viber, Voice and Email.
// Reads WHATSAPP_INFOBIP_* (already live). No new env vars required.
const INFOBIP_BASE_URL = (() => {
  const raw = (process.env.WHATSAPP_INFOBIP_BASE_URL || '').trim().replace(/\/+$/, '');
  if (!raw) return '';
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
})();
const INFOBIP_API_KEY = (process.env.WHATSAPP_INFOBIP_API_KEY || '').trim();
const INFOBIP_SENDER = (process.env.WHATSAPP_INFOBIP_SENDER || '447860088970').replace(/^\+/, '');

const infobipReady = Boolean(INFOBIP_BASE_URL && INFOBIP_API_KEY);

function infobipHeaders(extra = {}) {
  return {
    Authorization: `App ${INFOBIP_API_KEY}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...extra,
  };
}

/** POST helper — throws on HTTP error, returns parsed JSON. */
async function infobipPost(path, body) {
  const httpRes = await fetch(`${INFOBIP_BASE_URL}${path}`, {
    method: 'POST',
    headers: infobipHeaders(),
    body: JSON.stringify(body),
  });
  const payload = await httpRes.json().catch(() => ({}));
  if (!httpRes.ok) {
    const err = new Error(
      payload?.requestError?.serviceException?.text || `Infobip HTTP ${httpRes.status} on ${path}`,
    );
    err.providerPayload = payload;
    throw err;
  }
  return payload;
}

// Infobip answers HTTP 200 with a per-message status object. groupId >= 5 is a
// final rejection (e.g. REJECTED_SOURCE on Viber without a registered sender).
function throwOnInfobipRejection(payload) {
  const list = Array.isArray(payload?.messages)
    ? payload.messages
    : payload?.status
      ? [payload]
      : [];
  for (const m of list) {
    const st = m?.status;
    if (st && st.groupId >= 5) {
      const err = new Error(`Infobip ${st.name}${st.description ? `: ${st.description}` : ''}`);
      err.providerPayload = payload;
      err.infobipStatus = st;
      throw err;
    }
  }
}

/** Digits-only E.164 helper (Kenyan 07… → 2547…). */
function toDigits(rawPhone) {
  let d = String(rawPhone || '').replace(/\D/g, '');
  if (/^0\d{9}$/.test(d)) d = `254${d.slice(1)}`;
  return d;
}

module.exports = {
  INFOBIP_BASE_URL,
  INFOBIP_API_KEY,
  INFOBIP_SENDER,
  infobipReady,
  infobipHeaders,
  infobipPost,
  throwOnInfobipRejection,
  toDigits,
};
