# Google Sign-In — let users register & log in with Google

Customers can create their account **and** sign in with one Google click on
`/signup` and `/login`.

**The code is already wired up** — this page is the configuration that switches
it on. No auth logic needs to be written.

| Piece | Where |
| --- | --- |
| Google button (shared) | `src/components/GoogleSignIn.jsx` |
| Used by | `src/pages/Login.jsx`, `src/pages/Signup.jsx` |
| API endpoint | `POST /api/users/google-auth` in `server.js` |
| Session protocol | `backend/utils/userSessions.js` (same one the password login uses) |
| Env check | `npm run test:env` (flags a half-configured Google setup) |

## How it works

1. Google hands the browser a signed **ID token** (a JWT) for the chosen account.
2. The browser posts that token to `POST /api/users/google-auth`.
3. The server verifies it against **`GOOGLE_CLIENT_ID`** with `google-auth-library`
   (signature + audience + expiry). An unverified token is rejected — the client
   never gets to assert who it is.
4. **First** Google sign-in creates the client node in `users` (with an
   unusable random password hash, so the account stays Google-only and can never
   be brute-forced). **Every later** sign-in resolves the same node — by
   `users.google_id` when available, otherwise by email.
5. The server issues the **same per-device session token as the password login**
   (`user_sessions` + `users.auth_token`), the browser stores it under
   `tgf_user`, and the client lands on `/client-portal`.

Google is therefore *a second door into the same client session*, not a parallel
auth system: logout, multi-device sessions, the client portal and every admin
tool keep working unchanged.

## Step 1 — Create the OAuth client (Google Cloud Console)

> **Status for this project: already done.** The OAuth client exists and was
> discovered in the live deployment's public bundle (see Step 2). Local
> development therefore needed no new Console work — only the value. Follow this
> section if you ever need to recreate or rotate the client.

1. Open <https://console.cloud.google.com> and create (or pick) a project.
2. **APIs & Services → OAuth consent screen** (newer UI calls it *Google Auth
   Platform*):
   - User type: **External**.
   - App name, user-support email, developer contact email.
   - Scopes: keep the defaults — `openid`, `userinfo.email`, `userinfo.profile`.
     Nothing else is needed; the portal never asks for Gmail/Drive access.
   - While the app is in **Testing**, add every Google account allowed to sign in
     under **Test users** (or publish the app afterwards to allow anyone).
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**:
   - Application type: **Web application**
   - Name: e.g. `Greggory website`
   - **Authorized JavaScript origins** — exact scheme + host, **no path, no
     trailing slash**:
     - `http://localhost:5173`
     - `http://127.0.0.1:5173`
     - `https://w-the-greggory-systems-and-strategy-firm-vik4.onrender.com`
     - (add any custom domain you serve the site from, e.g. `https://thegreggory.co.ke`)
   - **Authorized redirect URIs**: *not required* for the JavaScript button —
     leave empty.
4. Copy the **Client ID** (looks like
   `1234567890-abc123.apps.googleusercontent.com`). It is a public identifier,
   not a secret — there is **no client secret to store** anywhere in this project.

## Step 2 — Set the two variables (identical values)

`.env` in the project root:

```bash
GOOGLE_CLIENT_ID=707133684778-olpid71u10eobcsefb43fhbdjjef4fmh.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_ID=707133684778-olpid71u10eobcsefb43fhbdjjef4fmh.apps.googleusercontent.com
```

> This is the client already used by the live Render deployment — it was read out
> of the deployed frontend bundle (public asset), and `http://localhost:5173` is
> authorised on it, so local development works with the same value. If you rotate
> the client, update **both** vars here *and* on Render.

Then on **Render → Environment** set *both*:

- `GOOGLE_CLIENT_ID` — read by the server at runtime.
- `VITE_GOOGLE_CLIENT_ID` — read by Vite **at build time** (it is compiled into
  the bundle). A runtime-only value is too late and the button stays hidden.

> ⚠️ Vite loads `.env` **only when the dev server or build starts**. After
> changing the value you must restart `npm run dev` (locally) or trigger a
> redeploy (on Render). `import.meta.env` is baked in, never read at runtime.

Verify with `npm run test:env` — it now reports whether the two ids are present,
identical, and shaped like an OAuth client id.

## Step 3 — (Recommended) add `users.google_id`

Google sign-in works without it (accounts are then matched by email), but the
column makes the Google ↔ account link explicit and survives an email change.

```bash
node scripts/add-google-id-column.js --dry-run   # show what would change
node scripts/add-google-id-column.js            # add the column + unique index
```

Existing accounts are linked automatically the next time they use Google.

## Step 4 — Verify it end to end

**Automated (recommended).** With the backend on `:3000` and the dev server on
`:5173`:

```bash
npm run test:google
```

It checks the config, the bundle, the server endpoint (401 = configured,
503 = missing id) and then drives a real headless Chrome to both `/login` and
`/signup` to confirm the Google button iframe actually renders (which also proves
the current origin is authorised by Google). Against production:

```bash
# after deploying the server change, this tells you whether Render has GOOGLE_CLIENT_ID
BASE_URL=https://the-greggory-systems-and-strategy-firm-jz7i.onrender.com \
API_BASE_URL=https://the-greggory-systems-and-strategy-firm-jz7i.onrender.com \
npm run test:google
```

**Manual.** 1. `npm run dev` (or redeploy) — the server logs
   `[AUTH] Google Sign-In is DISABLED …` **only when** the id is missing.
2. Open <http://localhost:5173/signup>. A **“Sign up with Google”** button appears
   under the "OR" divider (the divider disappears when Google is off).
3. Click it and pick an account. You should land on `/client-portal` signed in.
4. Confirm the account was created:

   ```sql
   SELECT id, email, display_name, google_id, primary_role, is_active, created_at
   FROM users ORDER BY id DESC LIMIT 3;
   ```

5. Sign out, then use **/login → Sign in with Google** with the same account —
   it must sign the same `id` back in (not create a second row).
6. Server log lines to expect: `[GOOGLE AUTH] registered client node #12 (…@gmail.com)`
   on the first run, nothing but the last-login stamp afterwards.

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| No Google button anywhere | `VITE_GOOGLE_CLIENT_ID` is empty/placeholder, **or** Vite was not restarted after setting it. Check the browser console — `[GoogleSignIn] hidden …` states it exactly. |
| `503 Google Sign-In is not configured on this server yet.` | `GOOGLE_CLIENT_ID` is missing **on the server** (the two halves are independent). |
| `401 That Google account could not be verified` | The server's `GOOGLE_CLIENT_ID` differs from the id the button used, or the token expired. Make both variables identical. |
| `The given origin is not allowed for this client` / `origin_mismatch` (in the browser console) | The page's origin is not listed under **Authorized JavaScript origins**. Add the exact origin — include `http://localhost:5173` for local dev, and remember `127.0.0.1` ≠ `localhost`. |
| Access blocked: app not verified / “has not completed verification” | The OAuth consent screen is in **Testing** — add that Google account under **Test users**, or publish the app. |
| Google popup closes with nothing happening | Often a third-party-cookie/embedded-browser block. Use a normal browser window (not an in-app/incognito-with-blockers view) and allow third-party cookies for `accounts.google.com`. |
| `409 This email belongs to a staff account.` | Deliberate: an admin/developer email must use the staff sign-in — Google never creates a client node for a staff mailbox. |
| `403 This account has been deactivated.` | `users.is_active = 0` for that client. Reactivate the node (or restore it) first. |
| Client signed up with Google, then tries password login | Not possible by design: the stored password hash is random and unmatchable. They can sign in with Google, or a password can be set for them in the admin **Modify Node** form. |
| Two Google accounts, one client | Sign in with the first one to link `google_id`, then an admin should confirm which node holds the projects. Matching is by Google id → email, in that order. |

## Security notes (what the code already enforces)

- The Google token is verified **server-side** against the audience — a forged
  credential is rejected before any DB write.
- `email_verified: false` (a Google account with an unverified email) is refused.
- The **client ID is public** and safe to ship in the bundle; no client secret or
  service-account key is involved. `GOOGLE_APPLICATION_CREDENTIALS` in `.env` is
  for Cloud Storage, unrelated to sign-in.
- Google-created accounts get a **random bcrypt password hash**, so the password
  login can never be used against them.
- Staff mailboxes (`admin_users`, `developer_users`) are refused before creation.
- Deactivated clients are refused before a session is issued.
- Sessions use the same revocable per-device token rows as password logins, so
  "log out" and "sign out everywhere" behave identically.

## Want Google sign-in for staff too?

`POST /api/users/google-auth` is deliberately **client-only** (it writes to
`users`). Staff sign-in lives in the admin auth flow and is password-protected by
design. If you ever want a Google door for admins, mirror this endpoint against
`admin_users`, keep the same `ADMIN_SESSION_SECRET` session, and require an
existing admin row — never create staff accounts from a Google click.

## Endpoint reference

`POST /api/users/google-auth` — no auth header required (the Google token *is*
the credential).

```jsonc
// request
{ "credential": "<Google ID token from the button>", "isSignUp": true }

// 200
{
  "success": true,
  "isNewUser": true,
  "token": "gf_lock_…",              // same token format as the password login
  "id": 12, "email": "client@gmail.com",
  "first_name": "Jane", "last_name": "Doe", "display_name": "Jane Doe",
  "primary_role": "user", "role": "user", "role_type": "user",
  "has_photo": false, "profilePhotoData": null,
  "user": { /* the same fields, nested */ }
}
```

Errors: `400` no credential / no email · `401` unverifiable token ·
`403` unverified email, deactivated account · `409` staff email ·
`503` `GOOGLE_CLIENT_ID` missing on the server · `500` unexpected failure.

