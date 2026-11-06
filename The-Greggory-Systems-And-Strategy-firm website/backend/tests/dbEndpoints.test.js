const test = require('node:test');
const assert = require('node:assert/strict');

for (const key of [
    'DB_HOST', 'DB_CLOUD_HOST', 'DB_HOST_2', 'DB_PORT_2', 'DB_USER_2',
    'DB_SECONDARY_HOST', 'DB_SECONDARY_USER', 'DB_SSL',
]) {
    process.env[key] = '';
}
process.env.DB_NAME = '';
process.env.DATABASE_URL = 'mysql://avnadmin:test%40password@aiven.example.test:27809/defaultdb?ssl-mode=REQUIRED';
process.env.AIVEN_DATABASE_URL = '';

const { DB_NAME, endpoints, parseDatabaseUrl } = require('../../server/config/dbEndpoints');

test('resolves an Aiven Service URI into a verified TLS endpoint', () => {
    assert.equal(DB_NAME, 'defaultdb');
    const [endpoint] = endpoints();
    assert.equal(endpoints().length, 1);
    assert.equal(endpoint.label, 'aiven-uri');
    assert.equal(endpoint.host, 'aiven.example.test');
    assert.equal(endpoint.port, 27809);
    assert.equal(endpoint.user, 'avnadmin');
    assert.equal(endpoint.password, 'test@password');
    assert.equal(endpoint.database, 'defaultdb');
    assert.equal(endpoint.ssl.minVersion, 'TLSv1.2');
    assert.ok(endpoint.ssl.ca);
});

test('rejects malformed or non-MySQL database URIs', () => {
    assert.throws(() => parseDatabaseUrl('not-a-uri'), /valid mysql:\/\//);
    assert.throws(() => parseDatabaseUrl('https://db.example.test/defaultdb'), /mysql:\/\//);
});