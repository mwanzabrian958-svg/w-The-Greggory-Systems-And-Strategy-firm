const test = require('node:test');
const assert = require('node:assert/strict');

process.env.DB_HOST = 'auth-validator-test.invalid';
process.env.DB_PORT = '3306';
process.env.DB_USER = 'auth-validator-test';
process.env.DB_PASSWORD = 'not-a-real-password';
process.env.DB_NAME = 'auth_validator_test';
process.env.DATABASE_URL = '';
process.env.AIVEN_DATABASE_URL = '';
process.env.DB_SSL = 'false';

const db = require('../config/database');
const { validateAuthRequest } = require('../middleware/authEndpointValidator');

test('repairs a missing locked user mapping before validating registration', async () => {
  const originalPromise = db.promise;
  let mappingAttempts = 0;
  let repairCalls = 0;
  db.promise = () => ({
    query: async (sql) => {
      if (sql.includes('FROM auth_platform_mapping')) {
        mappingAttempts += 1;
        return [mappingAttempts === 1 ? [] : [{ platform_name: 'user', table_name: 'users' }], []];
      }
      if (sql.includes('FROM auth_validation_rules')) return [[], []];
      throw new Error(`Unexpected query: ${sql}`);
    },
  });

  try {
    const result = await validateAuthRequest(
      'user',
      'users',
      '/register',
      'person@example.test',
      {
        originalUrl: '/api/users/register',
        body: { email: 'person@example.test', password: 'valid-password' },
      },
      async () => {
        repairCalls += 1;
      },
    );

    assert.equal(result.valid, true);
    assert.equal(repairCalls, 1);
    assert.equal(mappingAttempts, 2);
  } finally {
    db.promise = originalPromise;
  }
});
