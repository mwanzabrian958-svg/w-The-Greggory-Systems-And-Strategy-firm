# Developer Purge — Status Notes (rewritten 2026-10-12)

> This replaces the old purge notes, which were stale — they still described
> the developer platform as active. **The purge is COMPLETE in code.**

## TL;DR

The "developer" role was removed from the application **in code only**. The
database was deliberately left intact (developer-prefixed tables and mapping
rows were never dropped), so the purge is non-destructive and reversible.

- **Platforms: 2** — `admin` (`admin_users`) and `user` (`users`). There is no
  developer login, navbar entry, route, or permission anywhere in the codebase.
- **Auth validation rules: 25 → 16** — the 9 developer-platform rules were
  removed from the ruleset; the `auth_validation_rules` DB rows are untouched.
- **Commits:** `fff844a` (purge), `6dc567e` (mpesa.js syntax fix), `02ba3a2`
  (fcm.js OWASP hardening), plus the M-Pesa/CORS/token sweep after it.

## What was purged (code/scripts only)

- Frontend permissions, Navbar links, CaseStudies references, SecurityModal,
  Users page, `adminSession` helpers — all developer paths removed.
- Scripts: `init-auth-endpoints-tables`, `verify-auth`, `purge-test-data`,
  `system-reset-step3/4`, `master-solidify`, `preflight-db`, etc.
- `server.js`, `backend/server.js`, `admin-verification.js`, `sessionToken.js`
  — developer branches removed.
- Dead code removed: `server.js signAdminSessionToken()` (zero call sites —
  admin session tokens are minted only by `backend/utils/sessionToken.js`).

## Intentional survivors — DO NOT REMOVE

1. **Fail-closed role guards** — `if (role === 'developer') return 400` in
   `server.js` (~line 2582) and `backend/routes/admin-verification.js`
   (~line 228). These reject any legacy or hand-crafted developer session
   instead of silently accepting it. They are a security control, not debris.
2. **Purge-history comments** across touched files explaining why code went.
3. **DB tables/rows** — `developer_users`, `auth_platform_mapping`,
   `auth_validation_rules` data. The system runs fine with them present.

## Verification performed

- `git grep -i developer` across all `.js/.jsx` → only intentional guards,
  comments, Meta dev-URL constants and test fixtures remain.
- `node --check` passes on every touched file; `npx vite build` passes.

## Hardening done alongside (OWASP Top 10:2025 + ASVS)

- `backend/routes/fcm.js`: register/unregister scoped by **email** (A01),
  `requireAdminSession` re-checks `admin_users` per request (A01/A07), generic
  error messages (A10), FCM token length cap 4096 (A07).
- `/api/fcm/status` + `/api/fcm/devices` now require an admin session;
  `/devices` returns **masked tokens only**; the dashboard targets devices via
  `POST /api/fcm/send` `targets: [{id, userType}]` so real tokens stay
  server-side.
- `backend/routes/mpesa.js` callback hardened (A01/A06):
  - optional `MPESA_CALLBACK_TOKEN` secret path segment (timing-safe compare),
    auto-appended to the default CallBackURL by `mpesaService.js`;
  - the CheckoutRequestID must match a pending row WE created at /stkpush time
    (invented IDs → 404);
  - callback Amount must match the recorded amount; a receipt number can only
    be attached to one transaction; Safaricom retries stay idempotent;
  - no internal error messages echoed (A10).
- `backend/middleware/clientAuth.js` + `server.js authenticateAny`:
  query-string tokens accepted on **GET/HEAD only** (A07) — authenticated PDF
  download links keep working; mutating requests must use headers.
- `server.js` CORS: localhost / private-LAN allowances are now
  development-only (`NODE_ENV !== 'production'`) (A02).
- Verified secure (no change needed): parameterized SQL everywhere checked
  (A05); HMAC session tokens are timing-safe with `exp` (ASVS v3.2/v3.3);
  all `/api/fcm/*` routes are authenticated.

## Accepted risks (documented, deliberately unchanged)

- `/api/fcm/send` with no target broadcasts to all client devices — an
  intentional broadcast tool for the logged-in admin console.
- M-Pesa callback authenticity ultimately relies on the secret URL path above
  plus Daraja portal IP allowlisting (Safaricom does not sign STK callbacks).
- The Android app should move auth tokens out of URLs where it still uses
  them — the server now rejects query-token auth on any mutating request.

## Operational TODOs (not code)

1. Generate and set `MPESA_CALLBACK_TOKEN` (32+ random bytes) in Render env
   vars, then confirm a live STK Push callback succeeds. The server logs a
   one-time warning while it is unset. See `.env.example`.
2. Verify the Safaricom Daraja portal IP allowlisting points at Render's
   egress IPs.
3. Push the local commits to origin when ready.
