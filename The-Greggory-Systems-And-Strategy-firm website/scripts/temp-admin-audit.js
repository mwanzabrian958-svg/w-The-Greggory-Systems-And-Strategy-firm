const http = require('http');

function api(path, method, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const headers = { 'Content-Type': 'application/json' };
    if (data) headers['Content-Length'] = Buffer.byteLength(data);
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const req = http.request(
      { hostname: '127.0.0.1', port: 3000, path, method, headers },
      res => { let b = ''; res.on('data', c => b += c); res.on('end', () => resolve({ status: res.statusCode, body: b })); }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function safeJson(b) { try { return JSON.parse(b); } catch { return null; } }

function log(name, status, ok, detail) {
  const icon = ok ? 'OK' : 'FAIL';
  console.log(`  ${icon} ${name} (${status})${detail ? ' - ' + detail : ''}`);
}

(async () => {
  console.log('=== ADMIN DASHBOARD API AUDIT ===\n');

  const email = 'audit' + Date.now() + '@test.com';
  const reg = await api('/api/admin-verification/register', 'POST', { email, password: 'AuditPass123', first_name: 'Audit', last_name: 'User', role: 'admin' });
  const regJson = safeJson(reg.body);
  const userId = regJson ? regJson.userId : null;
  log('POST /admin-verification/register', reg.status, !!userId);
  if (!userId) { console.log('FATAL: Cannot register'); console.log(reg.body.substring(0,200)); process.exit(1); }

  const login = await api('/api/admin-verification/authenticate-enhanced', 'POST', { email, password: 'AuditPass123' });
  const loginJson = safeJson(login.body);
  const token = loginJson ? loginJson.token : null;
  log('POST /authenticate-enhanced', login.status, !!token);
  if (!token) { console.log('FATAL: Cannot login'); process.exit(1); }
  console.log('  userId:', userId, '\n');

  const results = [];

  async function check(name, path, method, body, expectJson) {
    const r = await api('/api' + path, method, body, token);
    const j = safeJson(r.body);
    const isHtml = r.body.startsWith('<!DOCTYPE') || r.body.startsWith('<html');
    let ok;
    if (expectJson) ok = !isHtml && r.status < 400 && j && (j.success !== false);
    else ok = !isHtml && r.status < 400;
    log(`${method} ${path}`, r.status, ok, isHtml ? 'HTML response' : (j && j.message ? j.message.substring(0,40) : ''));
    results.push({ name: `${method} ${path}`, status: r.status, ok });
    return { r, j };
  }

  console.log('--- AUTH ---');
  await check('Session', '/admin/session', 'GET', null, true);
  await check('Profile Read', '/admin-verification/profile/' + userId, 'GET', null, true);
  await check('Profile Update', '/admin-verification/profile/' + userId, 'PUT', { department: 'QA' }, true);

  console.log('\n--- USERS ---');
  await check('Users List', '/users', 'GET', null, true);
  await check('User Read', '/admin/users/' + userId + '?role_type=admin', 'GET', null, true);
  await check('User Update', '/admin/users/' + userId + '?role_type=admin', 'PUT', { department: 'Updated' }, true);

  console.log('\n--- PROJECTS ---');
  const projCheck = await check('Projects List', '/user-projects', 'GET', null, false);
  await check('Project Create', '/user-projects', 'POST', { title: 'Test Project', description: 'Test', status: 'active' }, true);

  console.log('\n--- CONTENT ---');
  await check('Content List', '/website-content', 'GET', null, true);

  console.log('\n--- PERSONNEL ---');
  await check('Personnel List', '/company-personnel', 'GET', null, true);

  console.log('\n--- DASHBOARD ---');
  await check('Dashboard', '/admin/dashboard', 'GET', null, true);
  await check('Budget Overview', '/admin/budget-overview', 'GET', null, true);
  await check('Pending Approvals', '/admin/pending-approvals', 'GET', null, true);
  await check('Team List', '/admin/team', 'GET', null, true);

  console.log('\n--- ACTIVITY ---');
  await check('Activity Logs', '/admin/activity-logs', 'GET', null, false);

  console.log('\n--- INVOICES ---');
  await check('Invoices List', '/invoices', 'GET', null, false);

  console.log('\n--- APPLICATIONS ---');
  await check('Applications List', '/applications', 'GET', null, false);

  console.log('\n--- PROPERTIES ---');
  await check('Properties List', '/properties', 'GET', null, false);

  console.log('\n--- CRM ---');
  await check('CRM Contacts', '/admin/crm/contacts', 'GET', null, false);

  console.log('\n--- SEARCH ---');
  await check('Search', '/admin/search?q=test', 'GET', null, false);

  console.log('\n--- SETTINGS ---');
  await check('Settings', '/admin/settings', 'GET', null, false);

  // Summary
  console.log('\n=== SUMMARY ===');
  const passed = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok);
  console.log(`Passed: ${passed}/${results.length}`);
  if (failed.length > 0) {
    console.log('\nFAILED ENDPOINTS:');
    failed.forEach(f => console.log(`  - ${f.name} (${f.status})`));
  }

  // Cleanup
  await api('/api/admin/users/' + userId + '?role_type=admin', 'DELETE', null, token);
  console.log('\nAudit complete.');
})().catch(e => { console.error('AUDIT ERROR:', e.message); process.exit(1); });
