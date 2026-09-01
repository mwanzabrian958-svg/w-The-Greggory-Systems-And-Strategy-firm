#!/usr/bin/env node
/**
 * Watcher: waits until the Aiven cloud MySQL hostname resolves again
 * (i.e. the service has been powered on / finished rebuilding), then
 * automatically runs the full connectivity + table-parity check.
 *
 * Usage:
 *   node scripts/wait-for-cloud-db.js               # poll for up to 30 minutes
 *   node scripts/wait-for-cloud-db.js --minutes 60  # custom timeout
 *
 * Start it BEFORE clicking "Power on" in the Aiven console — it prints the
 * full success report the moment the database is back. Never prints secrets.
 */
"use strict";

const dns = require("dns").promises;
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

// Minimal .env loader (zero dependencies): fills vars not already in the env.
(function loadDotEnv() {
  const envPath = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
})();

const HOST = process.env.DB_HOST || "";
const flagIdx = process.argv.indexOf("--minutes");
const MINUTES = Number(flagIdx > -1 ? process.argv[flagIdx + 1] : 30) || 30;
const INTERVAL_MS = 30000;

if (!HOST || ["localhost", "127.0.0.1", "::1"].includes(HOST.toLowerCase())) {
  console.error(
    `[wait] DB_HOST is not a cloud hostname (got: "${HOST || "UNSET"}"). Nothing to wait for.`
  );
  process.exit(1);
}

console.log(`[wait] Watching DNS for: ${HOST}:${process.env.DB_PORT || "?"}`);
console.log(
  `[wait] Polling every ${INTERVAL_MS / 1000}s for up to ${MINUTES} min — click "Power on" in the Aiven console now...`
);

const deadline = Date.now() + MINUTES * 60000;

(async function tick() {
  while (Date.now() < deadline) {
    try {
      const addrs = await dns.resolve4(HOST);
      console.log(`\n[wait] ✅ DNS IS LIVE -> ${addrs[0]} — running the table-parity check...\n`);
      const r = spawnSync(
        process.execPath,
        [path.join(__dirname, "_check-cloud-tables.js")],
        { stdio: "inherit" }
      );
      process.exit(r.status || 0);
    } catch {
      process.stdout.write(
        `[wait] ${new Date().toLocaleTimeString()} — not resolvable yet\n`
      );
    }
    await new Promise((r) => setTimeout(r, INTERVAL_MS));
  }
  console.error(
    `[wait] ⏰ Gave up after ${MINUTES} min — the hostname still does not resolve. Check the Aiven console service status.`
  );
  process.exit(2);
})();