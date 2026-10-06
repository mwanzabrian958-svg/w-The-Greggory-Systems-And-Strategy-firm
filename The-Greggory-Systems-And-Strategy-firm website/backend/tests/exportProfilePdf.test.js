/**
 * Regression tests for the personnel profile PDF export
 * (GET /api/admin/users/:id/export-pdf in backend/routes/admin.js).
 *
 * The route used to ship a plain-text heredoc labelled `application/pdf`, so
 * every "Export Profile" download was a .pdf file that no viewer could open.
 * It now streams a real PDFKit document. These tests stub the DB and the
 * session guard (the same harness style as postsPartialUpdate.test.js) and
 * assert that:
 *   - the response is a genuine %PDF buffer, not text,
 *   - the Content-Disposition filename survives a multi-word display name,
 *   - role_type picks the right table,
 *   - an unknown user still 404s instead of emitting an empty PDF.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

// ── Stub the DB + session modules before requiring the router ────────────────
let lastQuery = { sql: '', params: [] };

const userRow = {
  id: 7,
  display_name: 'Jane Q. Doe',
  first_name: 'Jane',
  last_name: 'Doe',
  email: 'jane@example.com',
  phone_number: '+254700000000',
  alt_phone: null,
  id_number: null,
  department: 'Operations',
  expertise: null,
  tech_stack: 'Node, React',
  created_at: new Date('2024-01-15T00:00:00Z'),
  physical_address: null,
  emergency_contact_name: null,
  emergency_contact_phone: null,
  mission_briefing: null,
  private_notes: null,
  is_active: 1,
  admin_level: null,
  developer_level: null,
  primary_role: null,
};

let nextUsers = [userRow];

const fakeDb = {
  promise: () => ({
    query: async (sql, params = []) => {
      lastQuery = { sql: String(sql), params };
      return [nextUsers];
    },
  }),
};

const originalLoad = Module._load;
Module._load = function patchedLoad(request, parent) {
  if (parent && /routes[\\/]admin\.js$/.test(parent.filename)) {
    if (request === '../config/database') return fakeDb;
    if (request === '../utils/sessionToken') {
      return { verifySessionToken: () => ({ uid: 7, role: 'admin' }) };
    }
  }
  return originalLoad.apply(this, arguments);
};

const router = require('../routes/admin');
Module._load = originalLoad;

/** Minimal express-compatible invocation harness (guards run before handler). */
function invoke(method, path, { params = {}, query = {} } = {}) {
  return new Promise((resolve, reject) => {
    const res = {
      statusCode: 200,
      headers: {},
      payload: null,
      status(code) { this.statusCode = code; return this; },
      setHeader(name, value) { this.headers[name.toLowerCase()] = value; return this; },
      json(payload) {
        this.payload = payload;
        resolve({ status: this.statusCode, body: payload, headers: this.headers, buffer: null });
        return this;
      },
      send(payload) {
        this.payload = payload;
        resolve({
          status: this.statusCode,
          body: payload,
          headers: this.headers,
          buffer: Buffer.isBuffer(payload) ? payload : Buffer.from(String(payload), 'utf8'),
        });
        return this;
      },
    };
    const layer = router.stack.find(
      (l) => l.route && l.route.path === path && l.route.methods[method]
    );
    if (!layer) return reject(new Error(`route not found: ${method.toUpperCase()} ${path}`));

    let i = 0;
    const req = {
      method,
      headers: { authorization: 'Bearer test-token' },
      params,
      query,
      body: {},
    };
    const next = () => {
      const guard = layer.route.stack[i++];
      if (!guard) return;
      guard.handle(req, res, next);
    };
    // Kick off the chain, then wait for the async handler to settle.
    next();
    // The handler resolves `res.send`; give rejections a chance to surface.
    setTimeout(() => reject(new Error('handler never responded')), 5000).unref?.();
  });
}

function reset() {
  lastQuery = { sql: '', params: [] };
  nextUsers = [userRow];
}

test('export-pdf streams a real %PDF document, not text', async () => {
  reset();
  const result = await invoke('get', '/users/:id/export-pdf', { params: { id: '7' } });

  assert.equal(result.status, 200);
  assert.equal(result.headers['content-type'], 'application/pdf');
  assert.ok(
    result.buffer.subarray(0, 5).toString('latin1') === '%PDF-',
    `expected a %PDF header, got: ${result.buffer.subarray(0, 16).toString('latin1')}`
  );
  assert.ok(result.buffer.length > 500, 'PDF body should contain real content');
  // pdfkit output ends with an EOF marker.
  assert.match(result.buffer.subarray(-1024).toString('latin1'), /%%EOF/);
});

test('export-pdf sets an attachment filename built from the display name', async () => {
  reset();
  const result = await invoke('get', '/users/:id/export-pdf', { params: { id: '7' } });

  const disposition = result.headers['content-disposition'] || '';
  assert.match(disposition, /^attachment;/);
  assert.match(disposition, /filename="PROFILE_Jane_Q\._Doe\.pdf"/);
  assert.equal(result.headers['content-length'], result.buffer.length);
});

test('export-pdf queries the table that matches role_type', async () => {
  reset();
  await invoke('get', '/users/:id/export-pdf', { params: { id: '3' }, query: { role_type: 'admin' } });
  assert.match(lastQuery.sql, /FROM admin_users/);
  assert.deepEqual(lastQuery.params, ['3']);

  reset();
  await invoke('get', '/users/:id/export-pdf', { params: { id: '3' }, query: { role_type: 'developer' } });
  assert.match(lastQuery.sql, /FROM developer_users/);

  reset();
  await invoke('get', '/users/:id/export-pdf', { params: { id: '3' } });
  assert.match(lastQuery.sql, /FROM users/);
});

test('export-pdf 404s for an unknown user instead of emitting an empty PDF', async () => {
  reset();
  nextUsers = [];
  const result = await invoke('get', '/users/:id/export-pdf', { params: { id: '999' } });

  assert.equal(result.status, 404);
  assert.notEqual(result.headers['content-type'], 'application/pdf');
});
