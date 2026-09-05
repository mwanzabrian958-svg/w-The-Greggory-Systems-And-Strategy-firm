const fs = require('fs');
const p = 'src/pages/About.jsx';
const s = fs.readFileSync(p, 'utf8');
const lines = s.split('\n');
let si = -1, ei = -1;
for (let i = 155; i < lines.length; i++) {
  if (lines[i].includes('WHAT WE DO') && lines[i].includes('BEGINNING')) { si = i; break; }
}
for (let i = si + 1; i < lines.length; i++) {
    if (lines[i].includes('THE LONG NARRATIVE')) {
    for (let j = i - 1; j >= si; j--) {
      if (lines[j].includes('</section>')) { ei = j; break; }
    }
    break;
  }
}
console.log('si=' + si + ' ei=' + ei);
const before = lines.slice(0, si);
const after = lines.slice(ei + 1);
