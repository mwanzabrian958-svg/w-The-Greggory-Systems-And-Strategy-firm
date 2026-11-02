const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

const databaseCalls = [];
let mediaInsertId = 20;

const transaction = {
  async beginTransaction() {
    databaseCalls.push({ type: 'begin' });
  },
  async query(sql, params = []) {
    databaseCalls.push({ type: 'query', sql: String(sql), params });
    if (String(sql).includes('INSERT INTO portfolio_items')) {
      return [{ insertId: 7 }, []];
    }
    if (String(sql).includes('INSERT INTO portfolio_media')) {
      return [{ insertId: mediaInsertId++ }, []];
    }
    return [{ affectedRows: 1 }, []];
  },
  async commit() {
    databaseCalls.push({ type: 'commit' });
  },
  async rollback() {
    databaseCalls.push({ type: 'rollback' });
  },
};

const fakeConnection = {
  promise: () => transaction,
  release() {
    databaseCalls.push({ type: 'release' });
  },
};

const fakeDb = {
  promise: () => ({
    getConnection: async () => fakeConnection,
  }),
};

const multerStub = () => ({
  array: () => (req, res, next) => next(),
});
multerStub.memoryStorage = () => ({});

const originalLoad = Module._load;
Module._load = function patchedLoad(request, parent) {
  if (parent && /routes[\\/]posts\.js$/.test(parent.filename)) {
    if (request === '../config/database') return fakeDb;
    if (request === '../utils/adminSessionState') {
      return { verifyActiveAdminSession: async () => ({ uid: 3 }) };
    }
    if (request === '../utils/sessionCookies') {
      return { ADMIN_SESSION_COOKIE: 'admin-session', getCookie: () => null };
    }
    if (request === 'multer') return multerStub;
  }
  return originalLoad.apply(this, arguments);
};

const router = require('../routes/posts');
Module._load = originalLoad;

test('portfolio create stores the entry and every uploaded image/video together', async () => {
  databaseCalls.length = 0;
  mediaInsertId = 20;
  const files = [
    {
      originalname: 'C:\\portfolio\\cover.png',
      mimetype: 'image/png',
      size: 8,
      buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    },
    {
      originalname: 'walkthrough.webm',
      mimetype: 'video/webm',
      size: 4,
      buffer: Buffer.from([0x1a, 0x45, 0xdf, 0xa3]),
    },
  ];

  const route = router.stack.find(
    (layer) => layer.route && layer.route.path === '/admin/portfolio' && layer.route.methods.post
  );
  const result = await new Promise((resolve, reject) => {
    const response = {
      statusCode: 200,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(body) {
        resolve({ status: this.statusCode, body });
        return this;
      },
    };
    const request = {
      headers: { authorization: 'Bearer test-session' },
      body: { title: 'Systems modernization', status: 'published' },
      files,
      params: {},
    };
    let index = 0;
    const next = (error) => {
      if (error) return reject(error);
      const layer = route.route.stack[index++];
      if (!layer) return;
      try {
        const pending = layer.handle(request, response, next);
        if (pending && typeof pending.catch === 'function') pending.catch(reject);
      } catch (error) {
        reject(error);
      }
    };
    next();
  });

  assert.equal(result.status, 201);
  assert.equal(result.body.id, 7);
  const mediaWrites = databaseCalls.filter(
    (call) => call.type === 'query' && call.sql.includes('INSERT INTO portfolio_media')
  );
  assert.equal(mediaWrites.length, 2);
  assert.deepEqual(mediaWrites.map((call) => call.params[1]), ['image', 'video']);
  assert.deepEqual(mediaWrites.map((call) => call.params[2]), ['cover.png', 'walkthrough.webm']);
  assert.deepEqual(mediaWrites.map((call) => call.params[5]), files.map((file) => file.buffer));
  assert.ok(
    databaseCalls.some((call) => call.type === 'query' && call.params[0] === '/api/posts/portfolio/media/20'),
    'the first uploaded image becomes the portfolio cover URL'
  );
  assert.ok(databaseCalls.some((call) => call.type === 'commit'));
  assert.ok(!databaseCalls.some((call) => call.type === 'rollback'));
  assert.ok(databaseCalls.some((call) => call.type === 'release'));
});
