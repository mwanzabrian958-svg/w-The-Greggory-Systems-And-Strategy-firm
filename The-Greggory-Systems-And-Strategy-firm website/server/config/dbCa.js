/**
 * Pinned Aiven MySQL Project CA (read-only trust anchor).
 *
 * Aiven's MySQL servers present a chain rooted at a project-specific,
 * self-signed CA (CN "* Project CA"), so verification against the OS trust
 * store always fails. Trusting ONLY this pinned CA gives us full MITM
 * protection while still connecting successfully — verified live 14 Oct 2026:
 * mysql2 with `ca: <this file>` connects; verifying against anything else
 * (leaf-only, garbage) fails the handshake.
 *
 * BUT: Aiven ROTATES the project CA on service rebuild/fork. Cipher suite
 * here is defense-in-depth, not brittle pinning:
 *   - If DB_CA_FILE / DB_CA_PEM env vars are set, THEY win (Render dashboard
 *     can supply the new CA with zero deploys).
 *   - Else this bundled CA is used — the app logs which anchor it loaded.
 *   - To rotate: generate the new CA into this file, or set DB_CA_PEM, redeploy.
 *   - Worst case: verification fails loudly at boot instead of silently
 *     degrading to an unverified connection.
 *
 * "Not Before: 2026-10-04 / Not After: 2036-10-01" — bundled anchor expiry.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const BUNDLED_CA_PATH = path.join(__dirname, "aiven-ca.pem");

function loadCa() {
  if (process.env.DB_CA_PEM) {
    return { ca: process.env.DB_CA_PEM, source: "DB_CA_PEM env" };
  }
  if (process.env.DB_CA_FILE) {
    return {
      ca: fs.readFileSync(process.env.DB_CA_FILE, "utf8"),
      source: "DB_CA_FILE=" + process.env.DB_CA_FILE,
    };
  }
  if (fs.existsSync(BUNDLED_CA_PATH)) {
    return {
      ca: fs.readFileSync(BUNDLED_CA_PATH, "utf8"),
      source: "bundled " + path.basename(BUNDLED_CA_PATH),
    };
  }
  throw new Error(
    "[SECURITY] No MySQL CA trust anchor available: bundled aiven-ca.pem is " +
      "missing and neither DB_CA_PEM nor DB_CA_FILE is set. Refusing to start " +
      "rather than connecting with an unverified TLS channel."
  );
}

module.exports = { loadCa };
