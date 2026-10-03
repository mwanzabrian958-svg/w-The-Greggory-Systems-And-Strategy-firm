/**
 * Regression tests for the Content Posts router (backend/routes/posts.js).
 *
 * The original implementation used a fixed `col = COALESCE(?, col)` template for
 * every column. That silently destroyed data: mysql2 renders an absent
 * (`undefined`) bind value as a literal NULL, so the admin UI's partial-update
 * toggles — `{ is_active: false }` and `{ is_featured: true }` — overwrote every
 * *other* column with NULL. Hiding one testimonial erased its author role and
 * company; featuring one portfolio row erased its client, sector, summary, body
 * and image URL.
 *
 * These tests capture the emitted SQL so the behaviour is locked in without
 * needing a live MySQL server: an absent key must not appear in the SET clause,
 * while an explicitly empty/null value must be present (so a field can still be
 * deliberately cleared).
 */
const test = require('node:test');
const assert = require('node:assert');
const Module = require('node:module');

// ── Stub the DB + session modules before requiring the router ────────────────
const calls = [];
let lastQuery = { sql: '', params: [] };

const fakeDb = {
  promise: () => ({
    query: async (sql, params = []) => {
      lastQuery = { sql: String(sql), params };
      calls.push(lastQuery);
      // Every UPDATE in this router is followed by an affectedRows check.
      return [{ affectedRows: 1 }];
    },
  }),
};

const originalLoad = Module._load;
Module._load = function patchedLoad(request, parent) {
  if (parent && /routes[\\/]posts\.js$/.test(parent.filename)) {
    if (request === '../config/database') return fakeDb;
    if (request === '../utils/sessionToken') {
      return { verifySessionToken: () => ({ uid: 7, role: 'admin' }) };
    }
  }
  return originalLoad.apply(this, arguments);
};

const router = require('../routes/posts');
Module._load = originalLoad;

/** Express stores each layer's callback on `.handle` (not `.handleRequest`). */
function runLayer(layer, req, res, next) {
  layer.handle(req, res, next);
}

/** Minimal express-compatible invocation harness (guards run before handler). */
function invoke(method, path, { body = {}, params = {} } = {}) {
  return new Promise((resolve) => {
    const res = {
      statusCode: 200,
      payload: null,
      status(code) { this.statusCode = code; return this; },
      json(payload) {
        this.payload = payload;
        resolve({ status: this.statusCode, body: payload });
        return this;
      },
    };
    const layer = router.stack.find(
      (l) => l.route && l.route.path === path && l.route.methods[method]
    );
    if (!layer) throw new Error(`route not found: ${method.toUpperCase()} ${path}`);

    let i = 0;
    const req = { method, headers: { authorization: 'Bearer test-token' }, body, params };
    const next = () => {
      const guard = layer.route.stack[i++];
      if (!guard) return;
      runLayer(guard, req, res, next);
    };
    runLayer(layer.route.stack[0], req, res, next);
  });
}

/** Column names the router wrote to, derived from the `SET ... WHERE` clause. */
function setColumns() {
  const match = /SET([\s\S]*?)WHERE/i.exec(lastQuery.sql);
  if (!match) return [];
  return match[1]
    .split(',')
    .map((c) => c.split('=')[0].trim())
    .filter(Boolean);
}

function reset() {
  calls.length = 0;
  lastQuery = { sql: '', params: [] };
}

test('a partial show/hide toggle does not wipe the other testimonial columns', async () => {
  reset();
  // Verbatim what the admin Posts page sends from its show/hide button.
  await invoke('put', '/admin/testimonials/:id', { body: { is_active: false }, params: { id: '1' } });

  const cols = setColumns();
  assert.ok(cols.includes('is_active'), 'the toggled column must be written');
  for (const untouched of ['author_role', 'author_company', 'quote', 'author_name', 'rating']) {
    assert.ok(
      !cols.includes(untouched),
      `${untouched} must not appear in a partial update (it would be set to NULL)`
    );
  }
});

test('a partial feature toggle does not wipe the other portfolio columns', async () => {
  reset();
  await invoke('put', '/admin/portfolio/:id', { body: { is_featured: true }, params: { id: '1' } });

  const cols = setColumns();
  assert.ok(cols.includes('is_featured'), 'the toggled column must be written');
  for (const untouched of ['client_name', 'sector', 'summary', 'body', 'image_url', 'outcomes']) {
    assert.ok(
      !cols.includes(untouched),
      `${untouched} must not appear in a partial update (it would be set to NULL)`
    );
  }
});

test('a field can still be explicitly cleared by sending an empty value', async () => {
  reset();
  await invoke('put', '/admin/testimonials/:id', {
    body: { quote: 'Kept', author_role: '' },
    params: { id: '1' },
  });

  const cols = setColumns();
  assert.ok(cols.includes('author_role'), 'an explicitly cleared field must be written');
  assert.ok(cols.includes('quote'), 'other supplied fields must still be written');

  // author_role was cleared -> the bound value is NULL, not the literal ''.
  assert.strictEqual(lastQuery.params[cols.indexOf('author_role')], null);
});

test('a full edit writes every supplied field', async () => {
  reset();
  await invoke('put', '/admin/portfolio/:id', {
    body: {
      title: 'Grid Modernisation',
      client_name: 'Acme',
      sector: 'Energy',
      summary: 'Migrated 40 substations',
      image_url: '/images/acme.jpg',
      outcomes: '30% | Faster dispatch',
      status: 'published',
      sort_order: 3,
    },
    params: { id: '9' },
  });

  const cols = setColumns();
  for (const expected of [
    'title', 'client_name', 'sector', 'summary',
    'image_url', 'outcomes', 'status', 'sort_order',
  ]) {
    assert.ok(cols.includes(expected), `${expected} must be written`);
  }
  // The id is always the final bind value of the WHERE clause.
  assert.strictEqual(lastQuery.params[lastQuery.params.length - 1], '9');
});

test('outcomes lines are stored as JSON, splitting "metric | label"', async () => {
  reset();
  await invoke('put', '/admin/portfolio/:id', {
    body: { title: 'T', outcomes: '30% | Faster dispatch\n12 wk | Cut to schedule' },
    params: { id: '1' },
  });

  const cols = setColumns();
  assert.deepStrictEqual(JSON.parse(lastQuery.params[cols.indexOf('outcomes')]), [
    { metric: '30%', label: 'Faster dispatch' },
    { metric: '12 wk', label: 'Cut to schedule' },
  ]);
});

test('admin routes reject a request with no session token', async () => {
  reset();
  const layer = router.stack.find(
    (l) => l.route && l.route.path === '/admin/testimonials' && l.route.methods.get
  );

  // requireAdminSession short-circuits with res.status(401).json(...) and never
  // calls next(), so the promise must settle from the response, not from next.
  const { status, body } = await new Promise((resolve) => {
    const res = {
      statusCode: 200,
      status(code) { this.statusCode = code; return this; },
      json(payload) { resolve({ status: this.statusCode, body: payload }); return this; },
    };
    layer.route.stack[0].handle({ headers: {}, params: {} }, res, () => {
      resolve({ status: res.statusCode, body: null });
    });
  });

  assert.strictEqual(status, 401);
  assert.strictEqual(body.success, false);
});

test('rating is clamped to the 1-5 range', async () => {
  reset();
  await invoke('put', '/admin/testimonials/:id', { body: { quote: 'q', rating: 99 }, params: { id: '1' } });
  assert.strictEqual(lastQuery.params[setColumns().indexOf('rating')], 5);

  reset();
  await invoke('put', '/admin/testimonials/:id', { body: { quote: 'q', rating: -3 }, params: { id: '1' } });
  assert.strictEqual(lastQuery.params[setColumns().indexOf('rating')], 1);
});

test('an empty quote is rejected before any write', async () => {
  reset();
  const res = await invoke('put', '/admin/testimonials/:id', { body: { quote: '   ' }, params: { id: '1' } });
  assert.strictEqual(res.status, 400);
  assert.strictEqual(calls.length, 0, 'no UPDATE may be issued for an invalid quote');
});