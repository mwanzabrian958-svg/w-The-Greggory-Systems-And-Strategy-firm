# 🚀 Free Full-Stack Deployment (Frontend + Backend + MySQL, one origin)

This is the **working** deployment path. It replaces the failed Netlify+Railway
split with a **single Render service** that serves the built React app *and* the
Express API from one origin — exactly like `npm run dev` on localhost, where the
Vite proxy makes `/api` and the pages share one server. No CORS, no proxy rules,
no API-URL env var to get wrong.

**Total cost: $0.** No credit card required on any step.

| Piece | Provider | Free allowance |
|---|---|---|
| Backend + built frontend (one service) | **Render** (`w-the-greggory-systems-and-strategy-firm-1vf9.onrender.com`) | 750 instance-hours/month |
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
   - **Database** — leave Aiven's default; the app's `DB_NAME`
     (`the_greggory_systems_and_strategy_firm_db_main`) is auto-created on first boot

✅ Aiven requires TLS — already handled: the pool enables SSL when
`DB_SSL=true` (set in `render.yaml`).

## Step 2 — Deploy backend + frontend (Render Blueprint, ~5 minutes)

1. Make sure the latest code is pushed to GitHub (`git push`).
2. Go to **https://dashboard.render.com/blueprints** → *New Blueprint Instance*
   → connect GitHub → select **`w-The-Greggory-Systems-And-Strategy-firm`**.
3. Render reads `render.yaml` and asks for the `sync: false` values:
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` → paste from **Step 1.4**
   - `DB_NAME` → `the_greggory_systems_and_strategy_firm_db_main`. `render.yaml`
     deliberately leaves this `sync: false` (a hardcoded value once overrode the
     dashboard and pointed Render at a nonexistent DB), so you type it here.
   - `JWT_SECRET`, `ADMIN_SESSION_SECRET`, `ADMIN_CODE`, `SESSION_SECRET` → copy from your local `.env`
   - `FRONTEND_URL` → put `https://w-the-greggory-systems-and-strategy-firm-1vf9.onrender.com`
     (the live origin as of 2026-09-30 — if you redeployed as a NEW service,
     Render shows your real URL after deploy: update it then. `…-jz7i`, `…-vik4`
     and `greggory-firm-rtl3` are deleted/suspended — do not paste them.)
   - `MPESA_CALLBACK_URL` → `https://w-the-greggory-systems-and-strategy-firm-1vf9.onrender.com/api/mpesa/callback`
   - `SITE_URL` → can be LEFT BLANK: the SEO build step falls back to Render's
     own `RENDER_EXTERNAL_URL`. Set it only for a custom domain (see Step 5).
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
| `https://w-the-greggory-systems-and-strategy-firm-1vf9.onrender.com/` | The full React website |
| `https://w-the-greggory-systems-and-strategy-firm-1vf9.onrender.com/login` | SPA route loads (no 404) |
| `https://w-the-greggory-systems-and-strategy-firm-1vf9.onrender.com/api/health` | `{"status":"OK",...,"database":"connected"}` |
| `https://w-the-greggory-systems-and-strategy-firm-1vf9.onrender.com/api/test-db` | `{"success":true,...}` |
| `https://w-the-greggory-systems-and-strategy-firm-1vf9.onrender.com/sitemap.xml` | Every `<loc>` on the live host — **never** `localhost` (that meant `SITE_URL`/`RENDER_EXTERNAL_URL` resolution failed) |

If `database` says `unreachable`, re-check the four DB values from Step 1 —
`/api/health` re-probes on every call, so it turns `connected` the moment the
values are right (no redeploy needed if you edit env vars; Render restarts
automatically).

## Step 4 — Keep it awake (free, optional but recommended)

Free Render services sleep after 15 min idle (next visit then takes ~30–60 s to
wake). 750 free hours/month is enough to run **one** service 24/7 (744 h) if it
never sleeps:

1. Already in the repo: **`.github/workflows/keep-alive.yml`** pings `/api/health`
   every 14 min on free Actions minutes — nothing to sign up for. After a future
   rename, update its fallback URL (or set the `SITE_URL` repository variable):
   a stale URL stays GREEN while warming nothing.
2. Or go to **https://cron-job.org** (or UptimeRobot) → free sign-up.
3. Create a job: URL = `https://w-the-greggory-systems-and-strategy-firm-1vf9.onrender.com/api/health`,
   interval = **every 14 minutes**.
4. Done — the site now answers instantly at any hour.

## Step 5 — (Optional) a "real" free domain

`w-the-greggory-systems-and-strategy-firm-1vf9.onrender.com` is free forever and works out of the box. If you
want a custom-looking free domain:

- **pp.ua** (free, quick registration) or **eu.org** (free, manual approval can
  take days) — register one, then in Render → your service → *Settings → Custom
  Domains* → add it → create the **CNAME** record it shows you at the domain's
  DNS page. HTTPS is issued automatically.
- Update `FRONTEND_URL`, `MPESA_CALLBACK_URL` **and `SITE_URL`** to the new domain
  afterwards — `SITE_URL` is what makes the sitemap, robots.txt and the canonical
  name your domain instead of the `onrender.com` host, and it is build-time, so it
  needs a redeploy.

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
