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
  // Register and login
  const email = 'finaltest' + Date.now() + '@test.com';
  await api('/api/admin-verification/register', 'POST', { email, password: 'FinalPass123', first_name: 'Final', last_name: 'Test', role: 'admin' });
  const login = await api('/api/admin-verification/authenticate-enhanced', 'POST', { email, password: 'FinalPass123' });
  const token = JSON.parse(login.body).token;
  console.log('Token obtained:', token ? 'OK' : 'FAIL');

  // Test budget-overview with token
  const budget = await api('/api/admin/budget-overview', 'GET', null, token);
  console.log('Budget Overview:', budget.status, budget.body.substring(0, 200));

  // Test search with token
  const search = await api('/api/admin/search?q=test', 'GET', null, token);
  console.log('Search:', search.status, search.body.substring(0, 200));

  // Test PUT /admin/users with token
  const userUpdate = await api('/api/admin/users/11?role_type=admin', 'PUT', { department: 'Updated' }, token);
  console.log('User Update:', userUpdate.status, userUpdate.body.substring(0, 200));
})();
