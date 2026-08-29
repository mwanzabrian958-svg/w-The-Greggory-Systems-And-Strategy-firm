# ☁️ Cloud MySQL + Local phpMyAdmin — the complete link

This is the follow-up to `DEPLOYMENT-FREE-STACK.md`. The deployed Render site
now stores its data in a **free Aiven cloud MySQL**, and your **local phpMyAdmin
can manage that cloud database** as a second server.

> **Why `localhost` can never work in the cloud:** phpMyAdmin is just a web UI
> on your PC talking to MySQL on your PC. Render's servers can't reach your
> machine's `localhost` — that is exactly what `ECONNREFUSED 127.0.0.1:3306`
> in the deploy logs meant. The DB_* env vars were also empty on Render
> (`injected env (0) from .env` — your `.env` is git-ignored, correctly).

## Step 1 — Create the free cloud MySQL (Aiven, ~4 min)

1. Go to **https://aiven.io** → *Sign up* (email + password; **no credit card**).
2. *Create service* → **MySQL** → **Free plan** (`free-1-5gb`).
3. Pick a European region (e.g. `aws-eu-west-1`) → *Create*. Wait ~2 min for *Running*.
4. On the service **Overview** page copy four values — you'll paste them twice
   (Render in Step 2, phpMyAdmin in Step 4):
   - **Host** (e.g. `mysql-xxxx.g.aivencloud.com`)
   - **Port** (e.g. `12345`)
   - **User** (`avnadmin`)
   - **Password** (eye icon)

No console setup needed on Aiven: the database
`the_greggory_systems_and_strategy_firm_db_main` is **auto-created and
auto-imported** from `database/the-…db-main.sql` on the first deploy
(`scripts/import-if-empty.js` strips the dump's local-only
`DROP/CREATE DATABASE`/`USE` lines and creates the DB itself).

## Step 2 — Set the env vars on Render (5 min)

Render dashboard → your service → **Environment** → add / update:

| Key | Value | Notes |
|---|---|---|
| `DB_HOST` | Aiven **Host** | from Step 1.4 |
| `DB_PORT` | Aiven **Port** | from Step 1.4 |
| `DB_USER` | `avnadmin` | |
| `DB_PASSWORD` | Aiven **Password** | |
| `DB_SSL` | `true` | Aiven requires TLS — the pools enable it |
| `DB_NAME` | `the_greggory_systems_and_strategy_firm_db_main` | same name as your XAMPP DB (auto-created) |

Also set these while you're there (they were **all missing** in production —
the log line `injected env (0) from .env` proves no secrets reached Render):

| Key | Value |
|---|---|
| `JWT_SECRET`, `ADMIN_SESSION_SECRET`, `SESSION_SECRET`, `ADMIN_CODE`, `ADMIN_KEY` | copy from your local `.env` |
| `FRONTEND_URL` | `https://w-the-greggory-systems-and-strategy-firm.onrender.com` |
| `MPESA_CALLBACK_URL` | `https://w-the-greggory-systems-and-strategy-firm.onrender.com/api/mpesa/callback` |

Saving env vars triggers a redeploy automatically.

## Step 3 — Verify (30 s)

Watch the deploy logs, then open:

| URL | Expected |
|---|---|
| `/api/health` | `"database":"connected"` |
| `/api/test-db` | `{"success":true,...}` |

Log lines that mean success:

```
[import] database `the_greggory_systems_and_strategy_firm_db_main` ready
[import] empty DB detected - importing the-...db-main.sql...
[import] done - 64 tables created
Server running on port 10000
```

## Step 4 — Manage the cloud DB from your local phpMyAdmin

`C:\xampp\phpMyAdmin\config.inc.php` now contains a second server entry
**"Greggory Cloud (Aiven)"** (a backup of the original is at
`config.inc.php.bak-greggory`). Finish wiring it:

1. Open `C:\xampp\phpMyAdmin\config.inc.php`.
2. Replace `PASTE-AIVEN-HOST-HERE` and `PASTE-PORT` with the values from Step 1.4.
3. Open **http://localhost/phpmyadmin** — choose **Greggory Cloud (Aiven)** in
   the server dropdown (top-left home screen), log in with `avnadmin` +
   your Aiven password.

You now see and edit the **live production data** of the deployed website:
`the_greggory_systems_and_strategy_firm_db_main` (64 tables), alongside your
local XAMPP DB which stays untouched as your dev copy.

> phpMyAdmin talks to Aiven over TLS (`$cfg['Servers'][$i]['ssl'] = true;`)
> — that's why the entry works against the cloud service.

## Step 5 — How the two databases relate now

| | Local XAMPP DB | Cloud (Aiven) DB |
|---|---|---|
| Used by | `npm run dev` on your PC | The deployed Render site |
| Managed via | phpMyAdmin → *localhost* server | phpMyAdmin → *Greggory Cloud (Aiven)* server |
| Seeded from | `database/…db-main.sql` | same dump, auto-imported on first boot |

They are **separate databases from now on**. To move data between them use
phpMyAdmin's **Export / Import** tabs, or `scripts/backup-db.js` /
`scripts/restore-db-github.js`.

## Step 6 — Keep it awake (free, recommended)

Free Render services sleep after 15 min idle (~30–60 s wake). Create a free
cron at **cron-job.org** (or UptimeRobot): URL =
`https://<your-app>.onrender.com/api/health`, every **14 minutes**.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `ETIMEDOUT` / `ENOTFOUND` in Render logs | Wrong `DB_HOST`/`DB_PORT` — re-copy from Aiven Overview |
| `ER_ACCESS_DENIED_ERROR` | Wrong `DB_USER`/`DB_PASSWORD` — re-copy |
| `[import] … skip` but tables missing | The core tables exist → import skipped; drop the cloud DB (Aiven console → *Databases*) and redeploy |
| phpMyAdmin: `#2002` / connection error on cloud server | Host/port typo, or PC offline from Aiven's side — check Aiven service is *Running* |
| Site 500s on login only | `JWT_SECRET`/`SESSION_SECRET` missing on Render → Step 2 table |
| Free-tier cold starts | Step 6 keep-alive |
