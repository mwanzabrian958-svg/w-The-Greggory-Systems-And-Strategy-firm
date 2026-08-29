# 🚀 Free Full-Stack Deployment (Frontend + Backend + MySQL, one origin)

This is the **working** deployment path. It replaces the failed Netlify+Railway
split with a **single Render service** that serves the built React app *and* the
Express API from one origin — exactly like `npm run dev` on localhost, where the
Vite proxy makes `/api` and the pages share one server. No CORS, no proxy rules,
no API-URL env var to get wrong.

**Total cost: $0.** No credit card required on any step.

| Piece | Provider | Free allowance |
|---|---|---|
| Backend + built frontend (one service) | **Render** (`greggory-firm.onrender.com`) | 750 instance-hours/month |
| MySQL database | **Aiven for MySQL** (`free-1-5gb`) | 5 GB storage, always on |
| Keep-alive ping (no cold starts) | **cron-job.org** or **UptimeRobot** | Free |
| MongoDB / Redis | *Skipped* — server skips Mongo when `MONGODB_URI` is unset and falls back to memory without Redis | — |

> Your SQL dump is only ~0.1 MB, so the free 5 GB Aiven database is 50,000×
> bigger than you need today.

---

## Step 1 — Free MySQL database (Aiven, ~4 minutes)

1. Go to **https://aiven.io** → *Sign up* (email + password; **no card**).
2. *Create service* → **MySQL** → **Free plan** (`free-1-5gb`).
3. Pick a European region (e.g. `aws-eu-west-1`) → *Create*. Wait ~2 min for *Running*.
4. On the service **Overview** page copy:
   - **Host** (e.g. `mysql-xxxx.g.aivencloud.com`)
   - **Port** (e.g. `12345`)
   - **User** (`avnadmin`)
   - **Password** (click the eye icon)
   - **Database** — use the default **`defaultdb`**

✅ Aiven requires TLS — already handled: the pool enables SSL when
`DB_SSL=true` (set in `render.yaml`).

## Step 2 — Deploy backend + frontend (Render Blueprint, ~5 minutes)

1. Make sure the latest code is pushed to GitHub (`git push`).
2. Go to **https://dashboard.render.com/blueprints** → *New Blueprint Instance*
   → connect GitHub → select **`w-The-Greggory-Systems-And-Strategy-firm`**.
3. Render reads `render.yaml` and asks for the `sync: false` values:
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` → paste from **Step 1.4**
   - `DB_NAME` is preset to `defaultdb`
   - `JWT_SECRET`, `ADMIN_SESSION_SECRET`, `ADMIN_CODE`, `SESSION_SECRET` → copy from your local `.env`
   - `FRONTEND_URL` → put `https://greggory-firm.onrender.com`
     (if that name is taken, Render shows your real URL after deploy — update it then)
   - `MPESA_CALLBACK_URL` → `https://greggory-firm.onrender.com/api/mpesa/callback`
   - The rest (`SMTP_*`, `GOOGLE_CLIENT_ID`, `AFRICASTALKING_*`, `MPESA_*`,
     `COMPANY_*`) → copy from your local `.env`, or skip what you don't use.
4. **Apply.** Render runs `npm install && npm run build`, then
   `node scripts/import-if-empty.js && node server.js`.
5. Watch the deploy log — you should see:
   - `[import] empty DB detected - importing ...` (first boot only)
   - `[import] done - NN tables created`
   - `Server running on port 10000`

## Step 3 — Verify it works (30 seconds)

Open these (replace with your real URL):

| URL | Expected |
|---|---|
| `https://greggory-firm.onrender.com/` | The full React website |
| `https://greggory-firm.onrender.com/login` | SPA route loads (no 404) |
| `https://greggory-firm.onrender.com/api/health` | `{"status":"OK",...,"database":"connected"}` |
| `https://greggory-firm.onrender.com/api/test-db` | `{"success":true,...}` |

If `database` says `unreachable`, re-check the four DB values from Step 1 —
`/api/health` re-probes on every call, so it turns `connected` the moment the
values are right (no redeploy needed if you edit env vars; Render restarts
automatically).

## Step 4 — Keep it awake (free, optional but recommended)

Free Render services sleep after 15 min idle (next visit then takes ~30–60 s to
wake). 750 free hours/month is enough to run **one** service 24/7 (744 h) if it
never sleeps:

1. Go to **https://cron-job.org** (or UptimeRobot) → free sign-up.
2. Create a job: URL = `https://greggory-firm.onrender.com/api/health`,
   interval = **every 14 minutes**.
3. Done — the site now answers instantly at any hour.

## Step 5 — (Optional) a "real" free domain

`greggory-firm.onrender.com` is free forever and works out of the box. If you
want a custom-looking free domain:

- **pp.ua** (free, quick registration) or **eu.org** (free, manual approval can
  take days) — register one, then in Render → your service → *Settings → Custom
  Domains* → add it → create the **CNAME** record it shows you at the domain's
  DNS page. HTTPS is issued automatically.
- Update `FRONTEND_URL` (and `MPESA_CALLBACK_URL`) to the new domain afterwards.

---

## Why the old setups failed (so it doesn't happen again)

1. **Two platforms, two origins** — Netlify served the frontend, Railway the API;
   the proxy URL, CORS list and build-time `VITE_API_BASE_URL` all had to match.
   Any drift = silent breakage. → **Fixed:** one origin, frontend served by the
   API server itself.
2. **Railway `npm ci` crashes** — the shipped lock file didn't match
   `package.json`. → **Fixed:** `render.yaml` uses `npm install` (the lock file
   stays git-ignored as you configured).
3. **Cloud DB needs TLS** — the old pool had no SSL option, so any managed MySQL
   rejected the connection. → **Fixed:** `DB_SSL=true` enables TLS.
4. **Hidden server bugs** — a MongoDB import typo that crashed boot, and a 404
   handler registered *before* some API routes (making `/api/user-projects` and
   the task APIs unreachable even locally). → **Both fixed** in `server.js`.
5. **Production-only traps** (invisible in local dev because Vite serves the
   frontend there): behind Render's proxy all visitors shared one rate-limit
   bucket (site 429s after ~100 requests), helmet's default CSP blocked the
   built app's external resources (Google Sign-In, fonts), and any
   FRONTEND_URL/origin mismatch made CORS 500 every POST (login/register).
   → **Fixed:** `trust proxy = 1`, CSP disabled, same-origin requests always
   allowed, `NODE_VERSION` pinned to 22.

## Redeploys

Every `git push` to `main` auto-deploys (Render `autoDeploy: true`). The DB
import only runs when the database is empty, so restarts are safe.
