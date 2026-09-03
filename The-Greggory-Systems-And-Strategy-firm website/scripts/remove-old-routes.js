const fs = require('fs');
const file = 'server.js';
const lines = fs.readFileSync(file, 'utf8').split('\n');

// Old route start lines (1-indexed) — these are the FIRST in each duplicate pair.
// The new replacement routes are later in the file. We remove the old ones so
// the safe versions take effect. Express uses the FIRST registered route.
const oldRouteStarts = [
  2125,  // put /api/accounting/entries/:id
  2325,  // post /api/invoices (crasher — undefined SQL params)
  2424,  // put /api/invoices/:id
  3886,  // get /api/admin/dashboard
  3976,  // get /api/admin/pending-approvals
  3999,  // get /api/admin/change-requests
  4022,  // put /api/admin/change-requests/:id
  4067,  // get /api/admin/signature-requests
  4097,  // get /api/admin/search
  4335,  // get /api/admin/node-settings
  4394,  // post /api/admin/system-calibration
  4427,  // get /api/admin/backup/status
  4457,  // post /api/admin/backup/run
  4569,  // get /api/admin/team
  4664,  // post /api/admin/project-team/:projectId
  4725,  // get /api/admin/audit-logs
  4765,  // get /api/admin/data-access-logs
  4804,  // get /api/admin/data-safety-summary
  4914,  // put /api/website-content/:key
  4991,  // get /api/blog-articles/:id
  5165,  // get /api/company-personnel/:id
  5186,  // post /api/company-personnel
  5215,  // put /api/company-personnel/:id
  5245,  // delete /api/company-personnel/:id
  6053,  // post /api/projects/:projectId/tasks (DUPLICATE of 6024, remove 6053)
];

// For each old route, find its end by locating the closing `});`
function findRouteEnd(startIdx) {
  let depth = 0;
  let started = false;
  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];
    // Count opening and closing braces/parens
    for (const ch of line) {
      if (ch === '(' || ch === '{') { depth++; started = true; }
      if (ch === ')' || ch === '}') depth--;
    }
    // Also handle semicolons that end route definitions
    if (started && depth <= 0 && line.includes('});')) {
      return i; // 0-indexed line of the closing
    }
  }
  // Fallback: find next app. route
  for (let i = startIdx + 1; i < lines.length; i++) {
    if (lines[i].match(/^app\.(post|get|put|delete|patch)\(/)) return i - 1;
  }
  return startIdx + 30;
}

// Find end for each and also consume trailing blank lines + comment header
const ranges = [];
for (const start of oldRouteStarts) {
  const endIdx = findRouteEnd(start - 1); // 0-indexed
  // Extend to consume trailing blank lines
  let realEnd = endIdx;
  while (realEnd + 1 < lines.length && (lines[realEnd + 1].trim() === '')) {
    realEnd++;
  }
  ranges.push({ start, end: realEnd + 1 }); // convert to 1-indexed inclusive
}

// Sort by start descending for safe removal
ranges.sort((a, b) => b.start - a.start);

console.log('Old/duplicate routes to remove:');
for (const r of ranges) {
  console.log('  Lines ' + r.start + '-' + r.end + ': ' + lines[r.start - 1].trim().substring(0, 70));
}

// Remove from bottom to top
for (const r of ranges) {
  lines.splice(r.start - 1, r.end - r.start + 1);
}

fs.writeFileSync(file, lines.join('\n'));
console.log('\nRemoved ' + ranges.length + ' old/duplicate route blocks.');
console.log('File now has ' + lines.length + ' lines.');