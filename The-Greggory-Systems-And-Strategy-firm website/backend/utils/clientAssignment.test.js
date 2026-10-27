const test = require('node:test');
const assert = require('node:assert/strict');
const { getActiveClientAccount, getClientDisplayName } = require('./clientAssignment');

test('rejects invalid client identifiers without querying the database', async () => {
  let queried = false;
  const db = {
    query: async () => {
      queried = true;
      return [[]];
    },
  };

  assert.equal(await getActiveClientAccount(db, '0'), null);
  assert.equal(await getActiveClientAccount(db, 'not-an-id'), null);
  assert.equal(queried, false);
});

test('resolves an active client only from the client users table', async () => {
  let query;
  let params;
  const client = { id: 42, email: 'client@example.com', display_name: 'Client' };
  const db = {
    query: async (sql, values) => {
      query = sql;
      params = values;
      return [[client]];
    },
  };

  assert.equal(await getActiveClientAccount(db, '42'), client);
  assert.match(query, /FROM users/);
  assert.match(query, /is_active = 1/);
  assert.match(query, /deleted_at IS NULL/);
  assert.deepEqual(params, [42]);
});

test('uses the account name and falls back to email for display', () => {
  assert.equal(getClientDisplayName({ display_name: 'Client Account', email: 'client@example.com' }), 'Client Account');
  assert.equal(getClientDisplayName({ first_name: 'Jane', last_name: 'Client', email: 'client@example.com' }), 'Jane Client');
  assert.equal(getClientDisplayName({ email: 'client@example.com' }), 'client@example.com');
});
