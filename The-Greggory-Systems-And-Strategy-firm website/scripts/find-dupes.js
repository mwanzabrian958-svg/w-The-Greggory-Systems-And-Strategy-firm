const fs = require('fs');
const lines = fs.readFileSync('server.js', 'utf8').split('\n');
const routes = {};
lines.forEach((l, i) => {
  const m = l.match(/app\.(post|get|put|delete)\(['"]([^'"]+)['"]/);
  if (m) {
    const key = m[1] + ' ' + m[2];
    if (!routes[key]) routes[key] = [];
    routes[key].push(i + 1);
  }
});
console.log('=== Duplicate routes ===');
let found = false;
Object.entries(routes).forEach(([k, v]) => {
  if (v.length > 1) { console.log(k + ' at lines: ' + v.join(', ')); found = true; }
});
if (!found) console.log('No duplicates found.');
console.log('Total unique route signatures:', Object.keys(routes).length);