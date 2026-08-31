/**
 * Client-Portal dashboard diagnostic.
 *
 * Reproduces the exact SQL chain executed by
 * GET /api/users/client-dashboard (server.js) against whichever MySQL endpoint
 * the app is configured to use (same .env / failover logic), then reports:
 *
 *   1. Which endpoint answered
 *   2. Which of the required tables exist
 *   3. Which required columns are missing
 *   4. Which of the individual dashboard queries fail (and why)
 *
 * Usage:
 *   node scripts/diagnose-client-dashboard.js [userId]
 *
 * If no userId is given the first active non-admin user is used.
 * Exit code 0 = all green, 1 = problems found (handy in CI).
 */
require("dotenv").config();
const mysql = require("mysql2/promise");
const { endpoints, DB_NAME } = require("../server/config/dbEndpoints");

const REQUIRED = {
  users: [
    "id", "email", "first_name", "last_name", "display_name", "phone_number",
    "primary_role", "mission_briefing", "last_login_at", "last_login_ip",
    "created_at", "updated_at", "email_verified", "timezone", "locale",
    "profile_photo_blob", "profile_photo_mime_type", "profile_photo_file_name",
    "deleted_at",
  ],
  user_projects: [
    "id", "user_id", "project_name", "project_description", "project_type",
    "status", "priority", "progress_percentage", "end_date",
    "estimated_budget", "actual_budget", "project_manager_id", "is_active",
    "created_at", "updated_at", "deleted_at",
  ],
  project_tasks: [
    "id", "project_id", "task_name", "status", "priority", "due_date",
    "progress_percentage", "assigned_to", "deleted_at",
  ],
  project_team_members: ["project_id", "user_id", "removed_at"],
  project_activities: ["id", "project_id", "user_id", "activity_type", "message", "created_at"],
  project_invoices: ["id", "project_id", "invoice_number", "amount", "status", "due_date", "issue_date"],
  project_docs: ["id", "project_id", "name", "category", "created_at", "deleted_at"],
  user_feedback: [
    "id", "user_id", "title", "message", "feedback_type", "status",
    "priority", "created_at", "admin_response", "responded_at", "rating", "deleted_at",
  ],
  client_project_summary: [
    "user_id", "total_projects", "active_projects", "completed_projects",
    "total_budget", "total_spent", "client_rating",
  ],
};

async function connectFirstEndpoint(prefer) {
  const problems = [];
  let list = endpoints();
  if (prefer === "cloud") list = [...list].reverse(); // cloud endpoint is [1] by default
  for (const cfg of list) {
    const { label, ...opts } = cfg;
    try {
      const conn = await mysql.createConnection({ ...opts, database: DB_NAME });
      console.log(`[OK] Connected to endpoint "${label}" -> ${opts.host}:${opts.port} / ${DB_NAME}`);
      return { conn, label };
    } catch (err) {
      const msg = `${err.code || ""} ${err.message}`.trim();
      console.warn(`[SKIP] endpoint "${label}" (${opts.host}:${opts.port}): ${msg}`);
      problems.push(`endpoint "${label}" (${opts.host}:${opts.port}): ${msg}`);
    }
  }
  console.error("[FATAL] No MySQL endpoint reachable:");
  problems.forEach((p) => console.error("  -", p));
  process.exit(1);
}

async function main() {
  const prefer = (process.argv[2] || "").replace(/^--endpoint=/, "");
  const { conn, label } = await connectFirstEndpoint(
    ["cloud", "local"].includes(prefer) ? prefer : undefined,
  );
  let failures = 0;

  // ── 1. Table existence ──────────────────────────────────────────────────
  const [tables] = await conn.query("SHOW TABLES");
  const tableSet = new Set(tables.map((r) => Object.values(r)[0]));
  console.log(`\nDatabase has ${tableSet.size} tables.`);

  for (const table of Object.keys(REQUIRED)) {
    if (!tableSet.has(table)) {
      console.error(`[MISSING TABLE] ${table}`);
      failures++;
    } else {
      console.log(`[ok] table ${table}`);
    }
  }
  if (failures > 0) {
    console.error("\nRun: node scripts/sync-db-schema.js   (it creates missing tables/columns)");
    await conn.end();
    process.exit(1);
  }

  // ── 2. Column existence ─────────────────────────────────────────────────
  console.log("");
  for (const [table, cols] of Object.entries(REQUIRED)) {
    const [rows] = await conn.query(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
      [DB_NAME, table],
    );
    const have = new Set(rows.map((r) => r.COLUMN_NAME));
    const missing = cols.filter((c) => !have.has(c));
    if (missing.length) {
      console.error(`[MISSING COLUMNS] ${table}: ${missing.join(", ")}`);
      failures++;
    } else {
      console.log(`[ok] columns ${table}`);
    }
  }

  // ── 3. Pick a user and run the real query chain ─────────────────────────
  const argId = Number(process.argv[2]);
  let userId = Number.isFinite(argId) && argId > 0 ? argId : null;
  if (!userId) {
    const [u] = await conn.query(
      `SELECT id FROM users WHERE deleted_at IS NULL
       ORDER BY (primary_role = 'admin') ASC, id ASC LIMIT 1`,
    );
    userId = u[0] ? u[0].id : null;
  }
  if (!userId) {
    console.error("\n[WARN] No user found to run the query chain against; column check only.");
    await conn.end();
    process.exit(failures ? 1 : 0);
  }
  console.log(`\nRunning the /api/users/client-dashboard query chain as user id=${userId}...`);

  const run = async (name, sql, params) => {
    try {
      const [rows] = await conn.query(sql, params);
      console.log(`[ok] ${name} (${rows.length} rows)`);
    } catch (err) {
      console.error(`[FAIL] ${name}: ${err.code || ""} ${err.message}`);
      failures++;
    }
  };

  await runQueryChain(conn, run, userId, failures);
  await conn.end();
  console.log(failures === 0
    ? `\nALL GREEN on "${label}" — the dashboard chain works for user ${userId}.`
    : `\n${failures} problem(s) found on "${label}" — fix the items marked [FAIL]/[MISSING].`);
  process.exit(failures ? 1 : 0);
}
async function runQueryChain(conn, run, userId, failures) {
  const [projectRows] = await conn.query(
    `SELECT up.id FROM user_projects up
     WHERE up.user_id = ? AND up.is_active = true AND up.deleted_at IS NULL`,
    [userId],
  ).catch(() => [[]]);
  const projectIds = projectRows.map((p) => p.id);
  const placeholders = projectIds.length > 0 ? projectIds.map(() => "?").join(",") : "NULL";
  const idParams = projectIds.length > 0 ? projectIds : [];

  await run("users lookup",
    `SELECT id, email, first_name, last_name, display_name, phone_number, primary_role,
            mission_briefing, last_login_at, last_login_ip, created_at, updated_at,
            email_verified, timezone, locale, profile_photo_blob, profile_photo_mime_type, profile_photo_file_name
     FROM users WHERE id = ? AND deleted_at IS NULL`, [userId]);

  await run("projects",
    `SELECT up.id, up.project_name, up.project_description, up.project_type, up.status, up.priority,
            up.progress_percentage, up.end_date, up.estimated_budget, up.actual_budget, up.created_at,
            CONCAT(pm.first_name, ' ', pm.last_name) AS manager_name
     FROM user_projects up
     LEFT JOIN users pm ON pm.id = up.project_manager_id
     WHERE up.user_id = ? AND up.is_active = true AND up.deleted_at IS NULL
     ORDER BY up.updated_at DESC`, [userId]);

  await run("tasks",
    `SELECT pt.id, pt.project_id, up.project_name, pt.task_name, pt.status, pt.priority, pt.due_date,
            pt.progress_percentage, CONCAT(u.first_name, ' ', u.last_name) AS assignee_name
     FROM project_tasks pt
     LEFT JOIN user_projects up ON up.id = pt.project_id
     LEFT JOIN users u ON u.id = pt.assigned_to
     WHERE pt.project_id IN (${placeholders}) AND pt.deleted_at IS NULL
     ORDER BY pt.due_date ASC LIMIT 20`, idParams);

  await run("team members",
    `SELECT ptm.project_id, up.project_name, u.id, 'Team Member' AS duties
     FROM project_team_members ptm
     LEFT JOIN user_projects up ON up.id = ptm.project_id
     LEFT JOIN users u ON u.id = ptm.user_id
     WHERE ptm.project_id IN (${placeholders}) AND ptm.removed_at IS NULL AND u.id IS NOT NULL`, idParams);

  await run("activities",
    `SELECT pa.id, pa.project_id, pa.activity_type, pa.message, pa.created_at,
            CONCAT(u.first_name, ' ', u.last_name) AS sender_name
     FROM project_activities pa
     LEFT JOIN users u ON u.id = pa.user_id
     WHERE pa.project_id IN (${placeholders})
     ORDER BY pa.created_at DESC LIMIT 10`, idParams);

  await run("invoices",
    `SELECT pi.id, pi.invoice_number, pi.amount, pi.status, pi.due_date, up.project_name
     FROM project_invoices pi
     JOIN user_projects up ON up.id = pi.project_id
     WHERE up.user_id = ? AND pi.status != 'cancelled'
     ORDER BY pi.issue_date DESC LIMIT 15`, [userId]);

  await run("documents",
    `SELECT pd.id, pd.project_id, pd.name, pd.category, pd.created_at
     FROM project_docs pd
     WHERE pd.project_id IN (${placeholders}) AND pd.deleted_at IS NULL
     ORDER BY pd.created_at DESC LIMIT 15`, idParams);

  await run("feedback",
    `SELECT id, title, message, feedback_type, status, priority, created_at, admin_response,
            responded_at, rating
     FROM user_feedback
     WHERE user_id = ? AND deleted_at IS NULL AND status != 'closed'
     ORDER BY created_at DESC LIMIT 10`, [userId]);

  await run("summary",
    `SELECT total_projects, active_projects, completed_projects, total_budget, total_spent, client_rating
     FROM client_project_summary WHERE user_id = ? LIMIT 1`, [userId]);
}


main().catch((err) => {
  console.error("[FATAL]", err);
  process.exit(1);
});
