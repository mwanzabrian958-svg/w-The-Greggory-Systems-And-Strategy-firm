# 🚀 Deployment Kit — Oracle Always Free + Netlify

**Architecture:** Netlify serves the React app (free, HTTPS, auto-deploy from GitHub).
An Oracle **Always Free** VM runs the Node API + MySQL 24/7 (no sleeping).
Netlify proxies `/api/*` to the VM → same-origin for the browser, zero CORS pain.

```
Browser ──> https://yourname.netlify.app        (React UI)
                └── /api/* ──proxy──> Oracle VM :3000  (Express + MySQL)
Safaricom ─────────────────callback──> Oracle VM /api/mpesa/callback
```

---

## PART A — Create the Oracle VM (~15 min)

1. cloud.oracle.com → sign up (**credit card required for verification only**).
   Choose *Always Free* resources when prompted.
2. Compute → Create Instance:
   - Image: **Ubuntu 22.04** (or 24.04) · Shape: **Ampere A1**, 2 OCPU / 12 GB (Always Free eligible)
   - Add your SSH public key (or let Oracle generate one and download it)
3. **CRITICAL — open the firewall in the cloud layer:** Instance details →
   Subnet → Security List → *Add Ingress Rule*: Source `0.0.0.0/0`, TCP ports **80** and **443**.
4. Connect: `ssh -i <key> ubuntu@<PUBLIC_IP>`

## PART B — Provision the server

```bash
sudo bash deploy/oracle-server-setup.sh     # run from the repo clone it creates at /opt/greggory-app
nano /opt/greggory-app/.env                 # fill every placeholder in this file
```

## PART C — Database

```bash
cd /opt/greggory-app
mysql -u root -p the_greggory_systems_and_strategy_firm_db_main \
      < database/the-greggory-systems-and-strategy-firm-db-main.sql
node scripts/migrate-mpesa-columns.js        # syncs schema with code (idempotent)
node scripts/add-missing-tables.js           # optional extra tables
```

## PART D — Start the API (PM2 keeps it alive forever)

```bash
mkdir -p /var/log/greggory
pm2 start deploy/ecosystem.config.js
pm2 save && pm2 startup    # run the printed command once → survives reboots
curl http://localhost:3000/api/invoices   # expect {"success":true,...}
```

## PART E — Nginx + HTTPS

```bash
sudo cp deploy/nginx-app.conf /etc/nginx/sites-available/greggory
sudo ln -sf /etc/nginx/sites-available/greggory /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
# From outside:  curl http://<PUBLIC_IP>/api/invoices   → should work now
```
**When you have a domain:** point an A-record at the VM IP, then
`sudo certbot --nginx -d api.yourdomain.co.ke` (auto-SSL, auto-renew).

## PART F — Frontend on Netlify

1. app.netlify.com → *Add new site* → *Import from GitHub* → pick this repo
2. Build settings:
   - Base directory: `The-Greggory-Systems-And-Strategy-firm website`
   - Build command: `npm run build`
   - Publish directory: `The-Greggory-Systems-And-Strategy-firm website/dist`
3. In `netlify.toml` (repo root), **replace** the fail-loud `/api/*` block with:

   ```toml
   [[redirects]]
     from = "/api/*"
     to = "http://<ORACLE_PUBLIC_IP>:3000/api/:splat"
     status = 200
     force = true
   ```
   Commit → Netlify auto-redeploys. Your site is live at `https://<site>.netlify.app`,
   talking to your API through the same origin (no CORS, no frontend env vars needed).

## PART G — M-Pesa & go-live checklist

- Sandbox prompts work as soon as Daraja Key/Secret are in `.env`.
- Real money: Go-Live on Daraja → production passkey emailed → update `.env`
  (`MPESA_PASSKEY`, real Paybill in `MPESA_SHORTCODE`,
  `MPESA_CALLBACK_URL=https://api.yourdomain.co.ke/api/mpesa/callback`) → register that
  callback URL in the Daraja portal → `pm2 restart greggory-api`.
- Rotate anything that ever matched the old leaked passwords list.

## Updating after launch

```bash
cd /opt/greggory-app && git pull
npm install --no-audit --no-fund && (cd backend && npm install --no-audit --no-fund)
node scripts/migrate-mpesa-columns.js        # re-run any new migrations
pm2 restart greggory-api                     # frontend deploys via Netlify automatically
```

## Troubleshooting

| Symptom | Check |
|---|---|
| Site loads but API 404s | netlify.toml proxy block missing/IP wrong |
| 502 from API | `pm2 logs greggory-api`; is port 3000 listening? |
| Can't reach server at all | Cloud **Security List** ingress rules (Part A.3) |
| STK push "Failed to authenticate" | Consumer Key/Secret wrong or app not on Lipa Na M-Pesa |
| Callback never arrives | URL must be public HTTPS in production; check `pm2 logs` |
