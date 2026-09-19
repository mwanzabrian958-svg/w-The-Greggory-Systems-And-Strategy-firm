// Clean .env parser -> prints which DB blocks are populated.
const fs = require('fs');
const raw = fs.readFileSync('.env', 'utf8');
const kv = {};
raw.split(/\r?\n/).forEach(l => {
  if (!l || l.startsWith('#')) return;
  const i = l.indexOf('=');
  if (i < 0) return;
  kv[l.slice(0, i).trim()] = l.slice(i + 1).trim();
});

const out = [];
const keys = [
  'DB_USER','DB_PASSWORD','DB_HOST','DB_PORT','DB_DATABASE','DB_NAME',
  'DB_BACKUP_HOST','DB_BACKUP_PORT','DB_BACKUP_USER','DB_BACKUP_PASSWORD',
  'DB_HOST_2','DB_PORT_2','DB_USER_2','DB_PASSWORD_2',
  'DB_SSL','SERVER_PORT','MODE','ROUND_ROBIN','JWT_SECRET',
  'ADMIN_CODE','ADMIN_KEY','SESSION_SECRET','ORIGIN','FRONTEND_URL',
  'MPESA_CALLBACK_URL',
];
for (const k of keys) {
  const v = kv[k];
  out.push(`${k}=${v === undefined ? 'UNSET' : (v === '' ? 'EMPTY' : v)}`);
}
console.log(out.join('\n'));

const def = (k) => (kv[k] !== undefined ? kv[k] : null);

const hasDbBlock = (prefix) => {
  const host = def(prefix + '_HOST');
  const port = def(prefix + '_PORT');
  return host && port ? host + ':' + port : null;
};

const primary = hasDbBlock('');
const backup  = hasDbBlock('DB_BACKUP');
const local2  = hasDbBlock('DB_HOST_2') || hasDbBlock('DB_HOST_2');
const print = (label, addr) => console.log((addr ? label + ' -> ' + addr : label + ' -> UNSET/EMPTY'));
print('PRIMARY_BLOCK', primary);
print('BACKUP_BLOCK', backup);
print('LOCAL2_BLOCK', local2);
