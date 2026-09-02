require('dotenv').config();
const db = require('../backend/config/database');

(async () => {
  try {
    // Test the search query
    const searchTerm = '%test%';
    const limit = 5;

    const [users] = await db.promise().query(`
      (SELECT 'user' as type, id,
        COALESCE(display_name, CONCAT_WS(' ', first_name, last_name), email) as title,
        email as subtitle,
        CONCAT('/admin/users/detail/', id, '/client') as link
       FROM users
       WHERE (display_name LIKE ? OR email LIKE ?) AND deleted_at IS NULL)
      UNION ALL
      (SELECT 'user' as type, id,
        COALESCE(display_name, CONCAT_WS(' ', first_name, last_name), email) as title,
        email as subtitle,
        CONCAT('/admin/users/detail/', id, '/admin') as link
       FROM admin_users
       WHERE (display_name LIKE ? OR email LIKE ?) AND deleted_at IS NULL)
      LIMIT ?
    `, [searchTerm, searchTerm, searchTerm, searchTerm, limit]);
    console.log('Users found:', users.length);

    const [projects] = await db.promise().query(`
      SELECT 'project' as type, id, project_name as title, client_name as subtitle,
             '/admin/projects' as link
      FROM user_projects
      WHERE (project_name LIKE ? OR client_name LIKE ?) AND deleted_at IS NULL
      LIMIT ?
    `, [searchTerm, searchTerm, limit]);
    console.log('Projects found:', projects.length);

    const [ledger] = await db.promise().query(`
      SELECT 'ledger' as type, id, description as title,
             CONCAT('KSH ', FORMAT(amount, 2)) as subtitle,
             '/admin/billing' as link
      FROM accounting_entries
      WHERE (description LIKE ? OR transaction_reference LIKE ?) AND deleted_at IS NULL
      LIMIT ?
    `, [searchTerm, searchTerm, limit]);
    console.log('Ledger found:', ledger.length);

    const [tasks] = await db.promise().query(`
      SELECT 'task' as type, id, task_name as title, task_description as description,
             status, priority as metadata,
             CONCAT('/admin/projects/', project_id, '/tasks') as link
      FROM project_tasks
      WHERE (task_name LIKE ? OR task_description LIKE ?) AND deleted_at IS NULL
      LIMIT ?
    `, [searchTerm, searchTerm, limit]);
    console.log('Tasks found:', tasks.length);

    console.log('Search query OK');
  } catch (e) {
    console.log('DB ERROR:', e.message);
  }
})();
