# Android Studio prompt — multi-channel OTP + notify update
# Paste everything BELOW this line into your Android Studio AI assistant.

---

You are updating the Greggory client-portal Android app (Kotlin + Retrofit).
The app talks to the backend ONLY through HTTPS — never to MySQL directly.
BASE_URL (Retrofit) = https://w-the-greggory-systems-and-strategy-firm-1vf9.onrender.com

## 1. What changed on the backend (already live, do NOT re-implement)

OTP codes are now MULTI-CHANNEL. The server tries in order, FIRST success wins:
whatsapp (Infobip template `authentication`, copy-code button) → sms (Infobip,
sender `Greggory`) → email (Gmail SMTP, branded HTML) → voice (Infobip TTS call
reading the code) → viber (skipped until a Viber sender is registered).
Chain order is server-controlled (OTP_CHANNELS). The app must NOT assume which
channel delivered — read the `provider` field in the response.

Endpoints (all JSON, paths include the api/ prefix):
- POST api/auth/whatsapp/request-code { "identifier": "<email OR phone>" }
  200 { success, message, expiresInMinutes, simulated?, provider? }
  ("whatsapp:infobip" | "sms:infobip" | "email:smtp" | "voice:infobip-voice" ...)
  Unknown identifiers return the SAME 200 (no enumeration) — do not treat 200
  as "account exists". Limits: 5 req / 15 min per IP (429), 60s per-identifier
  cooldown (generic 200). Provider outage → 502 { success:false }.
- POST api/auth/whatsapp/verify-code { "identifier": "<same>", "code": "<6 digits>" }
  200 { success:true, whatsapp_verified:true } (single-use, burned on match).
  400 { success:false, message } on wrong/expired code or 5+ attempts.
- GET api/notify/status (no auth) → { success, chain:[...],
  whatsapp:{configured,provider,template}, sms:{...}, email:{...}, voice:{...},
  viber:{...} }. Render channel availability from this at startup.
- POST api/notify/send (Bearer JWT) { phone?, email?, message, subject?,
  channels? } → { success, results:{...} }.
- POST api/notify/test-otp (Bearer JWT) { phone?, email? } → test code.


## 2. What to implement in the app

A. Retrofit (ApiService.kt):
   @POST("api/auth/whatsapp/request-code") suspend fun requestCode(@Body b: OtpRequest): OtpRequestResponse
   @POST("api/auth/whatsapp/verify-code") suspend fun verifyCode(@Body b: OtpVerify): OtpVerifyResponse
   @GET("api/notify/status") suspend fun channelStatus(): ChannelStatusResponse
   Match the existing ApiService path convention (no double /api prefix).

B. Models:
   OtpRequest(identifier: String)
   OtpRequestResponse(success: Boolean, message: String, expiresInMinutes: Int = 10,
     simulated: Boolean? = null, provider: String? = null, channel: String? = null)
   OtpVerify(identifier: String, code: String)
   OtpVerifyResponse(success: Boolean, message: String? = null, whatsapp_verified: Boolean? = null)
   ChannelStatusResponse(success: Boolean, chain: List<String>, whatsapp/sms/email/voice/viber: ChannelInfo)
   ChannelInfo(configured: Boolean, provider: String? = null, template: String? = null)

C. Verify UI flow (VerifyActivity/Fragment + ViewModel):
   1. Identifier screen: one field, email OR phone (accept 07/7/254/+254 raw —
      send trimmed, server normalises). "Send code" → requestCode.
   2. On HTTP 200 ALWAYS go to the 6-digit screen ("If an account exists…").
      Show 10-min countdown from expiresInMinutes.
   3. Announce the channel from `provider`: sms → "Code sent by SMS";
      voice → "You will receive a phone call reading your code";
      email → "Check your email"; whatsapp (default) → "Check WhatsApp".
   4. Verify button → verifyCode. Wrong code → server message + attempts count
      (5 max, then force Resend). Success (whatsapp_verified=true) → login flow.
   5. Resend locked for 60s client-side. 429 → "Too many requests…";
      502 → "Could not send the code, try again"; offline → retry w/ backoff.
   6. Dev builds ONLY: if simulated==true and `code` present, auto-fill it.
      NEVER log/display codes in release. Verify alone issues no session.

D. Existing calls stay untouched (login/profile/dashboard, user_projects,
   notifications/me, project_reports, invoices/quotes/signatures/change_requests,
   sessions). Required tables: users, user_projects, notifications,
   project_reports. HTTPS → Express → pool (XAMPP :3306, failover Aiven :28067).

## 3. Constraints
Kotlin + coroutines, Retrofit + Moshi/Gson (as project uses). No hardcoded
secrets, no direct DB, INTERNET permission only (SMS/voice are server-sent).
Do not reformat identifiers beyond trim(). Keep login/session logic as-is.
Finish with ./gradlew assembleDebug compiling clean.
