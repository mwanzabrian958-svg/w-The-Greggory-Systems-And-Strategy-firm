// Registers (idempotently) the Windows Task Scheduler job that mirrors the
// cloud database into the local phpMyAdmin/XAMPP secondary every night at 02:00.
// Safe to run repeatedly — it overwrites the existing task definition.
const { execSync } = require("child_process");
const path = require("path");

const TASK_NAME = "Greggory DB Cloud-to-Local Backup";
const RUN_TIME = "02:00";
const CMD_PATH = path.join(__dirname, "run-backup.cmd");

try {
  execSync(
    `schtasks /Create /F /TN "${TASK_NAME}" /SC DAILY /ST ${RUN_TIME} /TR "\\"${CMD_PATH}\\""`,
    { stdio: "inherit" }
  );
  console.log(`[schedule] task "${TASK_NAME}" registered — daily at ${RUN_TIME}`);
  execSync(`schtasks /Query /TN "${TASK_NAME}" /FO LIST`, { stdio: "inherit" });
  console.log("[schedule] done. Logs: backups/last-backup.log · Status: backups/last-backup-status.json");
} catch (e) {
  console.error("[schedule] failed to register the task:", e.message);
  console.error("[schedule] try running this script from an elevated (Administrator) terminal.");
  process.exit(1);
}
