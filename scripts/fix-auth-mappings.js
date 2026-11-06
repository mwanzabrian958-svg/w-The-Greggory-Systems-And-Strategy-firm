"use strict";

const path = require("node:path");
const { spawnSync } = require("node:child_process");

const websiteDir = path.resolve(
  __dirname,
  "..",
  "The-Greggory-Systems-And-Strategy-firm website",
);
const preflightScript = path.join(websiteDir, "scripts", "preflight-db.js");

const result = spawnSync(process.execPath, [preflightScript], {
  cwd: websiteDir,
  stdio: "inherit",
});

if (result.error) {
  console.error("Unable to run auth mapping preflight:", result.error.message);
  process.exitCode = 1;
} else if (result.status !== 0) {
  process.exitCode = result.status ?? 1;
}
