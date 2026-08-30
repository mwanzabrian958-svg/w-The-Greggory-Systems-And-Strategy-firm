proceed# Secondary Backup System — Cloud (Aiven) → Local (phpMyAdmin/XAMPP)

The local phpMyAdmin database `the_greggory_systems_and_strategy_firm_db_main`
acts as a **live secondary copy** of the production cloud MySQL (Aiven). If the
cloud is ever full, unreachable or corrupted, the local copy is your fallback
source of information.

## How it works

| Piece | Location | Purpose |
|---|---|---|
| Backup script | `scripts/backup-cloud-to-local.js` | Pulls every cloud table → local XAMPP DB, row-for-row (IDs preserved) |
| JSON snapshots | `backups/cloud-snapshot-*.json` | Point-in-time file copies of the whole cloud DB (last 10 kept) |
| Status file | `backups/last-backup-status.json` | Machine-readable result of the last run (ok/trigger/tables/rows/errors) |
| API-run log | `backups/last-api-run.log` | Console output of backups triggered from the admin panel |
| Log | `backups/last-backup.log` | Console output of scheduled runs |
| Scheduler | Windows Task Scheduler: **"Greggory DB Cloud-to-Local Backup"** | Runs the backup daily at 02:00 via `scripts/run-backup.cmd` |
| Admin API | `GET /api/admin/backup/status` · `POST /api/admin/backup/run` | Monitor + trigger a backup from the admin panel |

## Manual runs

```bash
npm run backup:cloud-to-local          # normal run
node scripts/backup-cloud-to-local.js --force   # even if cloud looks empty
```

## Safety features

- Cloud credentials come from `.env` (`DB_CLOUD_*`) — never hardcoded.
- Aborts **before** touching local if the cloud is unreachable.
- Aborts **before** touching local if the cloud has 0 rows (unless `--force`)
  — protects against wiping local with nothing.
- One failing table never aborts the whole backup; failures are reported.
- Cloud MySQL 8 DDL is translated for local MariaDB (collation fixes).

## If the primary (cloud) fails — how to keep working

1. **Inspect/serve data locally:** the local XAMPP DB is a full copy. The dev
   setup already points `DB_*` at it, so `npm run dev` works offline against
   the secondary.
2. **Restore the cloud from a snapshot:** import any
   `backups/cloud-snapshot-*.json`, or use `scripts/restore-db-github.js` /
   `database/the-greggory-systems-and-strategy-firm-db-main.sql` to rebuild.
3. **After recovery:** run `npm run backup:cloud-to-local` once (or wait for
   the 02:00 scheduled run) to re-sync the secondary from the recovered primary.

## Managing the scheduled task (Windows)

```powershell
schtasks /Query /TN "Greggory DB Cloud-to-Local Backup" /V /FO LIST   # inspect
schtasks /Run   /TN "Greggory DB Cloud-to-Local Backup"               # run now
schtasks /Delete /TN "Greggory DB Cloud-to-Local Backup" /F           # remove
```

Note: the task runs under your user account, so the machine must be on (and
XAMPP MySQL running) at 02:00 for a scheduled run to execute.

## Dev-mode note (nodemon)

`package.json` contains a `nodemonConfig` that limits nodemon to watching
`server.js` only. Without it, nodemon restarts the backend whenever the backup
writes a snapshot into `backups/`, which (on Windows) kills the whole process
tree — including a backup triggered from the admin panel. Keep this config; if
you remove it, use `npm run start` (plain node) in development instead.

