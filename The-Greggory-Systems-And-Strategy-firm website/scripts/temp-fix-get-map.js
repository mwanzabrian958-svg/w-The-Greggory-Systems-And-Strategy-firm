// Temp: fix PUT missing paren + add developer mapping to GET /users/:id tableMap
const fs = require("fs");
const path = require("path");
const p = path.join(__dirname, "..", "backend", "routes", "admin.js");
let t = fs.readFileSync(p, "utf8");
const hadCRLF = t.includes("\r\n");
t = t.replace(/\r\n/g, "\n");

// 1) PUT /users/:id tableName line — missing closing paren for String(
const putFix = "tableMap[String(roleType.toLowerCase()] || 'users';";
const putNew = "tableMap[String(roleType.toLowerCase())] || 'users';";
if (t.includes(putFix)) { t = t.replace(putFix, putNew); console.log("OK — PUT paren fixed"); }
else console.log("WARN — PUT paren anchor not found");

// 2) GET /users/:id tableMap — add developer mapping
const anchor = `      client: 'users', user: 'users', users: 'users'\n    };\n    const tableName = tableMap[String(role_type).`;
const repl = `      client: 'users', user: 'users', users: 'users',\n      developer: 'developer_users', developer_users: 'developer_users', 'developer-user': 'developer_users'\n    };\n    const tableName = tableMap[String(role_type).`;

if (t.includes(anchor)) { t = t.replace(anchor, repl); console.log("OK — GET tableMap developer added"); }
else { console.error("ANCHOR NOT FOUND — GET tableMap"); process.exit(1); }

fs.writeFileSync(p, hadCRLF ? t.replace(/\n/g, "\r\n") : t, "utf8");
console.log("DONE");