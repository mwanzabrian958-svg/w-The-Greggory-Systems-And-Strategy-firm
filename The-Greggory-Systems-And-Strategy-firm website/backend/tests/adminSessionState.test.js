const assert = require('node:assert/strict');
const Module = require('node:module');
const test = require('node:test');

function loadSessionState() {
  const versions = new Map();
  let hasSessionVersionColumn = false;
  const database = {
    promise: () => ({
      query: async (sql, values = []) => {
        if (sql.startsWith('SHOW COLUMNS')) {
          return [hasSessionVersionColumn ? [{ Field: 'session_version' }] : []];
        }
        if (sql.startsWith('ALTER TABLE')) {
          hasSessionVersionColumn = true;
          return [{ affectedRows: 0 }];
        }
        if (sql.startsWith('SELECT session_version')) {
          const adminId = Number(values[0]);
          if (!versions.has(adminId)) versions.set(adminId, 0);
          return [[{ session_version: versions.get(adminId) }]];
        }
        if (sql.startsWith('UPDATE admin_users SET session_version')) {
          const adminId = Number(values[0]);
          if (!versions.has(adminId)) return [{ affectedRows: 0 }];
          versions.set(adminId, versions.get(adminId) + 1);
          return [{ affectedRows: 1 }];
        }
        throw new Error(`Unexpected SQL in test: ${sql}`);
      },
    }),
  };

  const sessionTokenPath = require.resolve('../utils/sessionToken');
  const statePath = require.resolve('../utils/adminSessionState');
  delete require.cache[sessionTokenPath];
  delete require.cache[statePath];
  const originalLoad = Module._load;
  Module._load = function (request, parent, isMain) {
    if (request === '../config/database' && parent?.filename === statePath) return database;
    return originalLoad.call(this, request, parent, isMain);
  };
  try {
    return {
      ...require('../utils/adminSessionState'),
      signSessionToken: require('../utils/sessionToken').signSessionToken,
      versions,
      isColumnReady: () => hasSessionVersionColumn,
    };
  } finally {
    Module._load = originalLoad;
  }
}

test('admin logout revokes tokens across sessions and a subsequent login uses the new version', async () => {
  const state = loadSessionState();
  assert.equal(await state.getAdminSessionVersion(17), 0);
  assert.equal(state.isColumnReady(), true);

  const firstToken = state.signSessionToken(17, 'admin', 0);
  assert.equal((await state.verifyActiveAdminSession(firstToken)).uid, 17);

  assert.equal(await state.revokeAllAdminSessions(17), 1);
  assert.equal(await state.verifyActiveAdminSession(firstToken), null);

  const nextToken = state.signSessionToken(17, 'admin', 1);
  assert.equal((await state.verifyActiveAdminSession(nextToken)).uid, 17);
});
