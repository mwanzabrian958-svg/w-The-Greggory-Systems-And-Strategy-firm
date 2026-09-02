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

(async () => {
  const email = 'check' + Date.now() + '@test.com';
  const password = 'CheckPass123';

  // 1. Register
  const reg = await api('/api/admin-verification/register', 'POST', { email, password, first_name: 'Check', last_name: 'User', role: 'admin' });
  const regJson = JSON.parse(reg.body);
  console.log('1. REGISTER:', regJson.success ? 'OK' : 'FAIL', '- userId:', regJson.userId);

  // 2. Login
  const login = await api('/api/admin-verification/authenticate-enhanced', 'POST', { email, password });
  const loginJson = JSON.parse(login.body);
  console.log('2. LOGIN:', loginJson.success ? 'OK' : 'FAIL', '- token:', loginJson.token ? loginJson.token.substring(0, 30) + '...' : 'none');

  if (!loginJson.token) { console.log('   Login failed, stopping.'); process.exit(1); }

  // 3. Profile read
  const prof = await api('/api/admin-verification/profile/' + regJson.userId, 'GET', null, loginJson.token);
  const profJson = JSON.parse(prof.body);
  console.log('3. PROFILE:', profJson.success ? 'OK' : 'FAIL', '- name:', profJson.user ? profJson.user.first_name + ' ' + profJson.user.last_name : 'none');

  // 4. Profile update
  const upd = await api('/api/admin-verification/profile/' + regJson.userId, 'PUT', { department: 'QA' }, loginJson.token);
  const updJson = JSON.parse(upd.body);
  console.log('4. UPDATE:', updJson.success ? 'OK' : 'FAIL');

  // 5. Delete user
  const del = await api('/api/admin/users/' + regJson.userId + '?role_type=admin', 'DELETE', null, loginJson.token);
  const delJson = JSON.parse(del.body);
  console.log('5. DELETE:', delJson.success ? 'OK' : 'FAIL', '- table:', delJson.table || 'none');

  console.log('\nALL CHECKS COMPLETE');
})();
