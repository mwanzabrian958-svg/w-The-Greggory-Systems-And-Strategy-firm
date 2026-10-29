proceed# Secondary Backup System — Cloud (Aiven) → Local (phpMyAdmin/XAMPP)

The local phpMyAdmin database `the_greggory_systems_and_strategy_firm_db_main`
is a **scheduled standby copy** of the production cloud MySQL (Aiven). The
cloud remains the application's primary database; this local copy is not
automatically promoted when the cloud is unreachable.

## How it works

| Piece | Location | Purpose |
|---|---|---|
| Backup script | `scripts/backup-cloud-to-local.js` | Pulls every cloud table → the XAMPP database in `DB_NAME_2`, row-for-row (IDs preserved) |
| JSON snapshots | `backups/cloud-snapshot-*.json`, `backups/local-snapshot-*.json` | Last 10 cloud copies and last 10 local pre-overwrite copies |
| Status file | `backups/last-backup-status.json` | Machine-readable result of the last run (ok/trigger/tables/rows/errors) |
| API-run log | `backups/last-api-run.log` | Console output of backups triggered from the admin panel |
| Log | `backups/last-backup.log` | Console output of scheduled runs |
| Scheduler | Windows Task Scheduler: **"Greggory DB Cloud-to-Local Backup"** | Runs the backup daily at 02:00 via `scripts/run-backup.cmd` |
| Admin API | `GET /api/admin/backup/status` · `POST /api/admin/backup/run` | Monitor + trigger a backup from the admin panel |

## Live replication and website failover status

Live replication and automatic website failover to XAMPP are **not enabled**.
The verified backup is a scheduled table snapshot, not continuous replication.

The current infrastructure is not ready to serve client traffic safely from
the local database:

- The cloud source is MySQL 8.4.11 with binary logging enabled; the XAMPP
  service is MariaDB 10.4.32 with no replica configured. Cross-version
  replication and promotion/recovery have not been verified.
- The previous Dev Tunnel host is not present in the signed-in tunnel account.
  Microsoft describes Dev Tunnels as a public preview and not recommended for
  production workloads: [Dev Tunnels overview](https://learn.microsoft.com/en-us/azure/developer/dev-tunnels/overview).
- The local database's `root` account has broad privileges and an empty
  password. It must not be exposed to the internet or used by the website.
- Render currently has only the cloud database configured. Pointing it at
  XAMPP without continuous replication and a tested promotion/recovery process
  could cause client writes to diverge or be lost.

Keep the cloud database as the website's primary until a production-grade,
authenticated network path, least-privilege database accounts, compatible
replication, lag monitoring, and a tested failover/recovery procedure are in
place. The scheduled local copy is for backup and recovery; it does not make
the XAMPP database live for website clients.

## Manual runs

```bash
npm run backup:cloud-to-local
node scripts/backup-cloud-to-local.js --overwrite-local
node scripts/backup-cloud-to-local.js --force --overwrite-local
```

The script uses `DB_NAME` for the cloud source and `DB_NAME_2` for the local
target. A populated local target is protected unless `--overwrite-local` is
explicitly supplied. The scheduled Windows command supplies this flag after
the initial target review and saves a local snapshot before each overwrite.

## Safety features

- Cloud credentials come from `.env` (`DB_CLOUD_*`) — never hardcoded.
- Cloud source database is `DB_NAME`; XAMPP target database is `DB_NAME_2`.
- The scheduled mirror runs locally on Windows; Render does not connect to
  `127.0.0.1`, so a public MySQL tunnel is not required.
- Aborts **before** touching local if the cloud is unreachable.
- Aborts **before** touching local if the cloud has 0 rows (unless `--force`)
  — protects against wiping local with nothing.
- Aborts before overwriting a populated XAMPP target unless explicitly
  confirmed with `--overwrite-local`.
- Saves a local pre-overwrite snapshot before replacing any existing tables.
- One failing table never aborts the whole backup; failures are reported.
- Cloud MySQL 8 DDL is translated for local MariaDB (collation fixes).

The configured XAMPP target currently has tables that do not exist in the
cloud database. Those tables are left untouched by the mirror, but data in
shared tables is replaced from the cloud when an overwrite is confirmed.

## If the primary (cloud) fails — how to keep working

1. **Inspect data locally:** use phpMyAdmin to inspect the standby. Production
   traffic remains on the cloud database; failover is not automatic.
2. **Restore the cloud from a snapshot:** import any
   `backups/cloud-snapshot-*.json`, or use `scripts/restore-db-github.js` /
   `The-Greggory-Systems-And-Strategy-firm-db-main/the-greggory-systems-and-strategy-firm-db-main.sql` to rebuild.
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
