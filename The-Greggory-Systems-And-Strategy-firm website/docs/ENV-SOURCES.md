# ENV Keys — Where to Get Each Value (with links)

Companion to `scripts/validate-env.js` and `docs/CLOUD-DB-AND-PHPMYADMIN.md`.
Every key in `.env` / `render.yaml`, bucketed by where it belongs, with the
exact page to grab the value from and the page to paste it into.

**Paste destination for all "Render" values:**
<https://dashboard.render.com/> → your web service → **Environment** tab.
(If the service is owned by a Blueprint, `render.yaml` declares the keys with
`sync: false` — meaning the dashboard entry is the real value holder.)

> ⚠️ Your real Render origin is shown on that same page ("SERVICE URL").
> `greggory-systems-strategy.onrender.com` is only the render.yaml name — it
> 404'd when probed 2026-09-29, so copy the actual hostname from the dashboard.

---

## 1. CRITICAL — site breaks if missing on Render (check the dashboard NOW)

| Key | Get it from | Notes |
|---|---|---|
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` | [Aiven console](https://console.aivencloud.com/) → Project → your MySQL service → **Overview → Connection info** | Port is NOT 3306 on Aiven (yours is a 5-digit one, e.g. 27146). TLS required — `DB_SSL=true` is already fixed in render.yaml, no cert download needed (`rejectUnauthorized:false` in `server/config/dbEndpoints.js`). |
| `DB_NAME` | Same Aiven page — "Database name" (defaults to the service name) | render.yaml deliberately keeps this `sync:false`; a stale hardcoded value once pointed Render at a nonexistent DB. Dashboard is the ONLY place it's set. |
| `JWT_SECRET` | Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` | Must be IDENTICAL on local + Render or tokens won't verify across environments. |
| `ADMIN_SESSION_SECRET` | Same generate command | Signs the admin session token (`backend/utils/sessionToken.js`). |
| `SESSION_SECRET` | Same generate command | |
| `ADMIN_CODE` | **You invent it** (the code typed in the auth modal's Admin button) | Must match what your admins type; same value used by `admin-verification` register. |
| `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `SMTP_TO` | [Gmail App Password](https://myaccount.google.com/apppasswords) (2FA must be on) | `SMTP_PASS` is the 16-char app password, NOT the account password. `SMTP_HOST/PORT/SECURE` are already set in render.yaml. |
| `FRONTEND_URL` | Your Render service URL (Environment page) | Single-origin deploy → same `https://<your-service>.onrender.com`. Live host (2026-09-30): `w-the-greggory-systems-and-strategy-firm-1vf9.onrender.com`. CORS + email links break silently if it names a deleted host. |
| `SITE_URL` | **Optional on Render** — leave blank and the build uses Render's own `RENDER_EXTERNAL_URL`; set it only for a custom domain | Build-time: baked into `sitemap.xml`, `robots.txt`, canonical/og:url/JSON-LD by `scripts/generate-sitemap.js` + `vite-plugin-seo.js`, so a change needs a redeploy. It used to fall back to `http://localhost:5173` when blank, which is how the live sitemap shipped localhost URLs. |

## 2. OPTIONAL integrations — declared in render.yaml, degrade gracefully if unset

| Feature | Keys | Get it from |
|---|---|---|
| Sign in with Google | `GOOGLE_CLIENT_ID` + `VITE_GOOGLE_CLIENT_ID` (SAME value; VITE one needs rebuild) | [Google Cloud → Credentials](https://console.cloud.google.com/apis/credentials) → OAuth 2.0 Client ID (Web). Add BOTH the Render origin and `http://localhost:5173` to *Authorized JavaScript origins*. Full guide: [GOOGLE_SIGNIN_SETUP.md](../GOOGLE_SIGNIN_SETUP.md) |
| M-Pesa (live) | `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_PASSKEY`, `MPESA_SHORTCODE`, `MPESA_CALLBACK_URL` | [Safaricom Daraja portal](https://developer.safaricom.co.ke/) → My apps → your app → Fetch Consumer Key/Secret. Sandbox Passkey: [M-Pesa Express Simulate page](https://developer.safaricom.co.ke/APIs/MpesaExpressSimulate). `MPESA_CALLBACK_URL` = `https://<your-service>.onrender.com/api/mpesa/callback` |
| SMS | `AFRICASTALKING_USERNAME`, `AFRICASTALKING_API_KEY` | [AfricasTalking console](https://account.africastalking.com/) → User settings → API Keys |
| WhatsApp (Meta Cloud) | `WHATSAPP_CLOUD_TOKEN`, `WHATSAPP_CLOUD_PHONE_ID` | [Meta for Developers](https://developers.facebook.com/apps/) → your app → WhatsApp → **API Setup** (Phone number ID + token). For a non-expiring token use a System User: [business.facebook.com/settings/system-users](https://business.facebook.com/settings/system-users). Guide: [developers.facebook.com/docs/whatsapp/cloud-api/get-started](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started). ⚠️ NOT declared in render.yaml yet — until added, production WhatsApp sending stays disabled. |
| Company contacts (shown on site/links) | `COMPANY_PHONE_NUMBER`, `COMPANY_WHATSAPP_NUMBER` | Your own numbers, E.164 format (`+254…`) — validate-env.js enforces it |
| SEO / analytics | `VITE_GA_MEASUREMENT_ID` (G-XXXX), `VITE_GOOGLE_SITE_VERIFICATION`, `VITE_BING_SITE_VERIFICATION` | [GA4 Admin → Data stream](https://analytics.google.com/) · [Google Search Console](https://search.google.com/search-console) · [Bing Webmaster Tools](https://www.bing.com/webmasters) — all optional; tags omitted when unset |

## 3. LOCAL-ONLY — never copy to Render (validate-env.js `localOnly` guard)

| Keys | Why local only |
|---|---|
| `DB_HOST_2` … `DB_SSL_2` | Your XAMPP fallback node. On Render it would make the cluster knock on localhost first. |
| `DB_CLOUD_HOST/PORT/USER/PASSWORD` | Read only by local cron backup scripts (`backup-cloud-to-local.js`); on Render the plain `DB_*` ARE the cloud. |
| `REDIS_URL` | Intentionally omitted — server falls back to in-memory stores (see render.yaml note). |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to a service-account JSON **on your PC** → [IAM service accounts](https://console.cloud.google.com/iam-admin/serviceaccounts). File is never deployed. |
| `GOOGLE_CLOUD_PROJECT`, `STORAGE_BUCKET_BACKUPS`, `STORAGE_BUCKET_MEDIA` | GCP backup/upload scripts only ([buckets](https://console.cloud.google.com/storage)). `GOOGLE_CLOUD_PROJECT` has zero server code refs. |
| `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX` | Not read by the server at all (limits hardcoded). |
| `PORT` | Render injects it; local XAMPP guide uses 3000. |

## 4. Verify after setting anything

1. Render auto-redeploys on env save → wait for the service to go live.
2. `GET https://<your-service>.onrender.com/api/health` → expect
   `"database":"connected"`, `"dbSsl":true`.
3. Route map against production (non-destructive, fake credentials only):
   `set AUTH_CHECK_BASE=https://<your-service>.onrender.com && node scripts/check-auth-route-map.js` → 9/9 PASS.
4. Local `.env` sanity: `node scripts/validate-env.js`.

Related: [scripts/validate-env.js](../scripts/validate-env.js) ·
[CLOUD-DB-AND-PHPMYADMIN.md](./CLOUD-DB-AND-PHPMYADMIN.md) ·
[render.yaml](../render.yaml)

