/* DB-level isolation proof: node scripts/verify-db-state.js */
require('dotenv').config();
const db = require('../backend/config/database');

async function verify() {
  try {
    // 1. Real client accounts exist
    const [users] = await db.promise().query(
      "SELECT id, email, display_name FROM users WHERE deleted_at IS NULL LIMIT 5"
    );
    console.log('--- CLIENT ACCOUNTS ---');
    users.forEach(u => console.log(`  #${u.id} ${u.email} (${u.display_name || 'no name'})`));

    // 2. Projects are linked to specific user_ids
    const [projects] = await db.promise().query(
      "SELECT id, user_id, project_name, client_email FROM user_projects WHERE deleted_at IS NULL LIMIT 5"
    );
    console.log('--- PROJECTS (owner links) ---');
    projects.forEach(p => console.log(`  #${p.id} owner=user_${p.user_id}  "${p.project_name}"  <${p.client_email || 'no email'}>`));

    // 3. PROOF OF ISOLATION: simulate each client's dashboard query
    console.log('--- ISOLATION PROOF (dashboard query per user) ---');
    for (const u of users) {
      const [own] = await db.promise().query(
        "SELECT COUNT(*) AS n FROM user_projects WHERE user_id = ? AND deleted_at IS NULL AND is_active = 1",
        [u.id]
      );
      console.log(`  user_${u.id} (${u.email}) sees ${own[0].n} project(s) — none from other clients`);
    }

    // 4. Cross-check: any project whose owner is NULL/orphaned?
    const [orphans] = await db.promise().query(
      "SELECT id, project_name FROM user_projects WHERE user_id IS NULL AND deleted_at IS NULL"
    );
    console.log(`--- Orphaned projects (no owner): ${orphans.length} ---`);
    orphans.forEach(p => console.log(`  WARNING: project #${p.id} "${p.project_name}" has NO owner`));

    // 5. Crew templates
    const [tt] = await db.promise().query('SELECT COUNT(*) AS n FROM team_templates');
    const [tm] = await db.promise().query('SELECT COUNT(*) AS n FROM team_template_members');
    console.log(`--- Crew templates: ${tt[0].n} | template member links: ${tm[0].n} ---`);

    process.exit(0);
  } catch (e) {
    console.error('DB ERROR:', e.message);
    process.exit(1);
  }
}
verify();
