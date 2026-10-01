# Deploy Checklist

Working checklist for the current deployment:
**service** `w-the-greggory-systems-and-strategy-firm-1vf9` on Render
**domain (not yet connected)** `thegreggorysystemsandstrategyfirm.com`
**database** Aiven managed MySQL, over TLS

Values in your local `.env` are complete — `npm run test:env` reports
`RESULT: .env has everything required — ready to deploy`. So every step below is
about getting those local values into the two places that don't have them yet:
the **Render dashboard** and the **Google Cloud Console**.

### Status right now (after `543bf9e`)

- **Done:** the code purge is committed, pushed and **verified live**.
  `npm run test:live` reports six green probes — `database:"connected"`, admin
  routes answering `401` from the session guard, no junk-token data leak, CORS
  allowing `DELETE`.
- **Open — all of it outside this repo:** §3 the Render dashboard, §4 the Google
  origin allowlist, then one redeploy so `VITE_GOOGLE_CLIENT_ID` gets baked into
  the bundle (the only probe still red), and §7 rotating exposed secrets.

`render.yaml` declares every secret as `sync: false`, which means the blueprint
will never overwrite what you type in the dashboard, and never wipes it either.
You can edit `render.yaml` freely; `ADMIN_KEY` was already removed from it with
no effect on the dashboard copy.

---

## 1. Before pushing — local gates

```bash
npm run test:env          # deploy gate: every required var present + secret strength
npm run test:routes       # 9 passed — route guards, no DB needed: session guards + ADMIN_CODE
npm run build             # Vite build must stay green
```

## 2. Push — DONE (`543bf9e`, verified live)

```bash
git add -A
git commit -m "refactor(auth): delete the dead x-admin-key guard; admin routes verify the session token"
git push origin main
```

Committed as `543bf9e` (16 files) and pushed; Render rebuilt and the new build was
confirmed live about two minutes later — `npm run test:live` now reports
`DELETE /api/users/1 -> 401 session guard`, where the previous build returned
`500 "Admin key not configured on server"`. Nothing new had to be set in the
dashboard for this to work: the modular `/api/users` router verifies the Bearer
session token, which needs no variable that was not already required by
`server.js`.

## 3. Render dashboard — Environment tab

### Delete (nothing reads it any more)

| Key | Why |
|---|---|
| `ADMIN_KEY` | The `x-admin-key` middleware was dead code. `scripts/validate-env.js` now prints a warning if this key is ever set again. |

### Add / fix (these were seen missing or wrong in the dashboard)

Copy each value from your local `.env`. `sync: false` in the blueprint means the
dashboard is the only place these get set.

| Key | Value | Breaks if missing |
|---|---|---|
| `ADMIN_SESSION_SECRET` | 64-hex from local `.env` | **Admin sessions — the one this purge depends on.** It signs the Bearer token `requireAdminSession` verifies, and it wins over `JWT_SECRET` in both `server.js:39-40` and `backend/utils/sessionToken.js:21-24` (identical order). Missing → `server.js:47-50` logs `[SECURITY][CRITICAL] … admin sessions are ephemeral` and every admin is logged out on each restart or extra instance |
| `JWT_SECRET` | 64-hex from local `.env` | user login tokens (and admin tokens as the fallback if `ADMIN_SESSION_SECRET` is absent) |
| `ADMIN_CODE` | the admin signup code | Admin/Developer account creation |
| `SMTP_PASS` | Gmail app password | contact-form email |
| `AFRICASTALKING_API_KEY` | from your .env | SMS / WhatsApp relay |
| `MPESA_CONSUMER_KEY` / `_CONSUMER_SECRET` / `_PASSKEY` / `_SHORTCODE` / `_CALLBACK_URL` | from your .env | STK Push payments |
| `FRONTEND_URL` | `https://w-the-greggory-systems-and-strategy-firm-1vf9.onrender.com` | links inside outgoing emails. CORS is **already fine** without it — `server.js:438-469` hardcodes this origin as a fallback |
| `SITE_URL` | same origin | sitemap.xml / robots.txt / canonical tags |
| `VITE_GOOGLE_CLIENT_ID` **and** `GOOGLE_CLIENT_ID` | both `707133684778-olpid71u10eobcsefb43fhbdjjef4fmh.apps.googleusercontent.com` | Google Sign-In. **Measured:** the id is absent from all 30 deployed assets, so the button is currently *hidden* on production |

`VITE_GOOGLE_CLIENT_ID` is baked into the bundle **at build time** — setting it
requires a redeploy, not just a restart. `GOOGLE_CLIENT_ID` is read at runtime.
They must hold the same client id.

`ADMIN_SESSION_SECRET` takes priority over `JWT_SECRET`. If the dashboard already
has a `JWT_SECRET` and you add a *different* `ADMIN_SESSION_SECRET`, the signing
key changes and every token minted before that moment stops verifying — which is
exactly how you revoke all live admin sessions, and costs only a re-login.

## 4. Google Cloud Console — fix the 403 `origin_mismatch`

Correction from probing the live bundle: the Google button does **not** currently
render in production. `scripts/verify-deployed.mjs` scanned all 30 deployed
assets and found no client id baked in (the `gsi/client` loader is there, the id
is not). So the button is hidden on the live site, and the `origin_mismatch` you
saw was from the local dev build, where the id *is* present.

Do both steps, in this order — they fix different layers:

1. This section (origin allowlist) — takes minutes, no deploy.
2. Set `VITE_GOOGLE_CLIENT_ID` in Render and **redeploy** (§3) — until that
   happens the button never appears, so an origin fix alone changes nothing
   visible on the live site.

OAuth 2.0 Client ID → **Authorized JavaScript origins**, add:

```
https://w-the-greggory-systems-and-strategy-firm-1vf9.onrender.com
http://localhost:5173
```

Both live origins and the old one must be listed if you still use it. Changes
here take effect in minutes, no redeploy needed.

## 5. After deploy — confirm from your terminal

```bash
npm run test:live      # scripts/verify-deployed.mjs — probes the running service
```

What each probe actually means (all measured against the live service):

| Probe | Real behavior — do not assume otherwise |
|---|---|
| `GET /api/health` | **Always HTTP 200**, even when the DB is down (`server.js:6847` — Render must never see a 500 from a DB blip). The pass condition is `"database":"connected"`, not the status code. Measured: `"database":"connected", "dbSsl":true, "env":"production"`. |
| `GET /health` | **Not a route.** It falls through to the SPA catch-all and returns HTML. There is no bare `/health` API endpoint — expecting `{"status":"ok"}` here is wrong. |
| `DELETE /api/users/1` | The **deploy detector**: `500 "Admin key not configured on server"` = the OLD build is still live. `401 "Admin authentication required"` = the session-guard purge deployed. |
| `GET /api/users` with a junk Bearer | Must be `401`. A `200` with a list would be a live data leak. |
| preflight `OPTIONS /api/users` | Must echo the origin and list `DELETE` in `Allow-Methods`, plus `authorization` in `Allow-Headers`. |
| Google client id | Scans the entry JS **and** the dynamic chunks it references — the id is usually in a lazy chunk, so scanning only `index.html`'s script tags gives a false negative. |

Raw curl equivalents, if you prefer:

```powershell
$u = 'https://w-the-greggory-systems-and-strategy-firm-1vf9.onrender.com'
curl.exe -s "$u/api/health"                # "database":"connected" is the pass condition
curl.exe -s -X DELETE "$u/api/users/1"     # 401 = new build · 500 = old build still live
curl.exe -s -X OPTIONS "$u/api/users" -H "Origin: $u" -H "Access-Control-Request-Method: DELETE" -D - -o NUL
```

## 6. When the custom domain is connected

Redo step 3 (`FRONTEND_URL`, `SITE_URL`, `MPESA_CALLBACK_URL`) and step 4 with
the real domain, then redeploy so the sitemap and canonical URLs are rebuilt.

## 7. Rotate the secrets that were exposed in a chat window

Anything pasted into this conversation, or printed into a terminal transcript,
has to be treated as disclosed — the transcript outlives the deployment. Rotate
at the provider first, then paste the new value into the Render dashboard.

| Secret | Where to rotate |
|---|---|
| Aiven DB password | Aiven console → your service → Security → reset password, then restart the Render service so the pool reconnects |
| `ADMIN_SESSION_SECRET`, `JWT_SECRET`, `SESSION_SECRET` | fresh 64-hex: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. This logs every admin and user out, which is exactly the point |
| `SMTP_PASS` | Google account → Security → App passwords → revoke, reissue |
| `MPESA_CONSUMER_KEY` / `_CONSUMER_SECRET` / `_PASSKEY` | Daraja developer portal → regenerate the app credentials |
| `AFRICASTALKING_API_KEY` | Africa's Talking → User settings → API key → regenerate |
| `ADMIN_CODE` | set a new code in the dashboard — it gates admin account creation |

Do **not** rotate `GOOGLE_CLIENT_ID` / `VITE_GOOGLE_CLIENT_ID` on the grounds of
exposure: a client id is not a secret, it ships inside the public bundle to every
visitor. Only the origin allowlist in §4 restricts what can be done with it.

---

## Known gaps (not blocking, listed so they aren't rediscovered)

- **`GET /api/users` is unreachable by design.** `server.js` registers an inline
  `router.get('/')` on the same router before this one mounts, so Express picks
  the inline handler. It answers `401` unless the request carries a valid Bearer
  token that passes `authenticateAdminToken`. If it ever returns `200` with a
  user list without a token, that is a live data leak — test
  `curl.exe -s "$u/api/users" -H "Authorization: Bearer junk"`.
- **Database TLS is enforced but unverified.** `server/config/dbEndpoints.js:53`
  uses `ssl: { minVersion: "TLSv1.2", rejectUnauthorized: false }`. No CA file is
  needed (and none is in the repo), but the connection does not verify Aiven's
  certificate. To pin it, download the service CA from the Aiven console, commit
  it, and set `rejectUnauthorized: true` with the file read into `ca`.
- **`backend/server.js` is a second server that is not deployed** (`npm run
  server` / `dev:backend` run the root `server.js`). Its route order shadows
  `/sessions` the same way; don't assume it mirrors production exactly.
