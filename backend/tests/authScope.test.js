const test = require('node:test');
const assert = require('node:assert/strict');
const { resolveAuthenticatedUserId } = require('../utils/authScope');

test('resolves the authenticated account from a bearer token', () => {
  const req = {
    headers: {
      authorization: 'Bearer abc.def.ghi',
    },
  };

  const result = resolveAuthenticatedUserId(req, '99');

  assert.equal(result, '42');
});

test('uses the x-user-id header when present', () => {
  const req = {
    headers: {
      'x-user-id': '7',
    },
  };

  const result = resolveAuthenticatedUserId(req);

  assert.equal(result, '7');
});

test('rejects a requested account that does not match the authenticated identity', () => {
  const req = {
    headers: {
      'x-user-id': '8',
    },
  };

  assert.throws(() => resolveAuthenticatedUserId(req, '9'), /does not match/i);
});
