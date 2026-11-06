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

const { DB_NAME, endpoints, cloudEndpoints, parseDatabaseUrl } = require('../../server/config/dbEndpoints');

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

test('application endpoints ignore a configured local XAMPP database', () => {
    const saved = {
        DB_HOST: process.env.DB_HOST,
        DB_PORT: process.env.DB_PORT,
        DB_USER: process.env.DB_USER,
        DB_PASSWORD: process.env.DB_PASSWORD,
        DB_HOST_2: process.env.DB_HOST_2,
        DB_PORT_2: process.env.DB_PORT_2,
        DB_USER_2: process.env.DB_USER_2,
        DB_PASSWORD_2: process.env.DB_PASSWORD_2,
    };
    Object.assign(process.env, {
        DB_HOST: 'cloud.example.test',
        DB_PORT: '27059',
        DB_USER: 'cloud-user',
        DB_PASSWORD: 'cloud-password',
        DB_HOST_2: '127.0.0.1',
        DB_PORT_2: '3306',
        DB_USER_2: 'root',
        DB_PASSWORD_2: '',
    });

    try {
        assert.deepEqual(endpoints().map(({ label }) => label), ['local', 'claude']);
        assert.deepEqual(
            cloudEndpoints().map(({ host, port }) => ({ host, port })),
            [{ host: 'cloud.example.test', port: 27059 }],
        );
    } finally {
        for (const [key, value] of Object.entries(saved)) {
            if (value === undefined) delete process.env[key];
            else process.env[key] = value;
        }
    }
});

test('rejects malformed or non-MySQL database URIs', () => {
    assert.throws(() => parseDatabaseUrl('not-a-uri'), /valid mysql:\/\//);
    assert.throws(() => parseDatabaseUrl('https://db.example.test/defaultdb'), /mysql:\/\//);
});