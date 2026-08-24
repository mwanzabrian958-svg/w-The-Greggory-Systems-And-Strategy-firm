// Scan for identifiers used as JSX/props but never imported or declared
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "The-Greggory-Systems-And-Strategy-firm website", "src");

function walk(dir, out = []) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    const s = fs.statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (/\.(jsx|js)$/.test(f)) out.push(p);
  }
  return out;
}

const issues = [];
for (const file of walk(ROOT)) {
  const code = fs.readFileSync(file, "utf8");
  if (!code.includes("lucide-react")) continue;
  const used = new Set();
  for (const m of code.matchAll(/<([A-Z][A-Za-z0-9]*)[\s/>]/g)) used.add(m[1]);
  for (const m of code.matchAll(/icon\s*[:=]\s*\{?([A-Z][A-Za-z0-9]*)/g)) used.add(m[1]);
  const available = new Set();
  for (const m of code.matchAll(/import\s+(?:([A-Za-z0-9_$]+)\s*,?\s*)?(?:\{([^}]*)\})?[^;\n]*/g)) {
    if (m[1]) available.add(m[1].trim());
    if (m[2]) for (const part of m[2].split(",")) {
      const n = part.trim().split(/\s+as\s+/).pop().trim();
      if (n) available.add(n);
    }
  }
  // declarations incl. destructured function params like { icon: Icon = X } and map params
  for (const m of code.matchAll(/(?:function|const|let|var|class)\s+([A-Z][A-Za-z0-9]*)/g)) available.add(m[1]);
  for (const m of code.matchAll(/\(\s*([A-Z][A-Za-z0-9]*)\s*(?:,|\))/g)) available.add(m[1]);
  for (const m of code.matchAll(/\(\s*\{\s*icon:\s*([A-Z][A-Za-z0-9]*)/g)) available.add(m[1]);
  for (const id of used) {
    if (!available.has(id)) {
      issues.push(`${path.relative(ROOT, file)}: <${id}> used but NOT available`);
    }
  }
}
console.log(issues.length ? issues.join("\n") : "NO MISSING IDENTIFIERS FOUND");
