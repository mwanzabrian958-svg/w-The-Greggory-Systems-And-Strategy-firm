const assert = require('node:assert/strict');
const test = require('node:test');
const {
  ADMIN_SESSION_COOKIE,
  getCookie,
  setSessionCookie,
  clearSessionCookie,
} = require('../utils/sessionCookies');

test('reads the admin cookie without changing unrelated cookies', () => {
  const req = {
    headers: { cookie: 'theme=dark; gf_admin_session=token.value; other=ok' },
  };
  assert.equal(getCookie(req, ADMIN_SESSION_COOKIE), 'token.value');
  assert.equal(getCookie(req, 'missing'), null);
});

test('handles a malformed encoded cookie value without throwing', () => {
  const req = { headers: { cookie: 'gf_admin_session=%E0%A4%A' } };
  assert.equal(getCookie(req, ADMIN_SESSION_COOKIE), '%E0%A4%A');
});

test('sets and clears an HttpOnly same-site admin session cookie', () => {
  const headers = [];
  const res = { append: (name, value) => headers.push([name, value]) };
  const req = { secure: true };

  setSessionCookie(res, req, ADMIN_SESSION_COOKIE, 'token.value');
  clearSessionCookie(res, req, ADMIN_SESSION_COOKIE);

  assert.equal(headers.length, 2);
  assert.match(headers[0][1], /HttpOnly/);
  assert.match(headers[0][1], /SameSite=Lax/);
  assert.match(headers[0][1], /Secure/);
  assert.match(headers[0][1], /Path=\/api/);
  assert.match(headers[1][1], /Max-Age=0/);
});
