# Client Portal — Technical Reference

The Client Portal is the authenticated self-service hub for clients of The
Greggory Systems & Strategy firm. It is a 1,349-line single-page application
(React 18, lazy-loaded via `React.lazy`) that renders a tabbed command center
with ten sections, each backed by a live REST endpoint.

**Entry point:** `src/pages/ClientPortal.jsx` (`export default ClientPortal`)
**Route:** `/client-portal` (and `/portal`) — protected by `PrivateRoute`
**Auth:** Bearer JWT issued by `POST /api/users/login`, stored in `localStorage.tgf_user`

---

## 1. Architecture

```
ClientPortal.jsx
  │
  ├── authFetch(url, options, timeoutMs)      <-- wrapper: injects Bearer token,
  │       401/403 -> logout() + navigate('/login')
  │
  ├── loadClientData()                        <-- main data loader (Promise.all)
  │       +-- GET  /api/users/client-dashboard   (KPIs, user, projects, invoices, messages, tasks, docs, budget, team)
  │       +-- GET  /api/user-projects             (projects tab)
  │       +-- GET  /api/invoices                 (billing tab)
  │       +-- GET  /api/users/my-change-requests (requests tab)
  │       +-- GET  /api/users/my-quotes          (requests tab)
  │       +-- GET  /api/users/my-signature-requests (requests tab)
  │       +-- GET  /api/users/notifications/me   (notifications tab)
  │       +-- GET  /api/users/my-reports         (documents tab)
  │
  ├── handleDownloadInvoicePdf(inv)            <-- GET /api/users/my-invoices/:id/pdf
  ├── handleMpesaPay(invoice)                 <-- POST /api/mpesa/stkpush
  ├── handleQuoteDecision(id, decision, note) <-- POST /api/users/my-quotes/:id/decision
  ├── handleSignatureDecision(doc, decision)  <-- POST /api/users/my-signature-requests/:id/decision
  ├── handlePhotoChange(e)                    <-- POST /api/users/upload-profile-photo (FormData)
  ├── handleFeedbackSubmit(e)                 <-- POST /api/users/client-feedback
  ├── handleChangePassword(e)                 <-- POST /api/users/change-password
  └── toggleNotifRead / markAllNotifsRead     <-- PUT /api/users/notifications/:id/read
                                                    PUT /api/users/notifications/read-all/me
```

### Auth wrapper

Every request goes through `authFetch`, which:

1. Attaches `Authorization: Bearer ${user.token}`
2. Sets a 15 s AbortController timeout
3. On HTTP 401 or 403 -> calls `logout()`, redirects to `/login`, throws
   `'Session expired'` -- so an expired or revoked token always bounces the
   user to the login page instead of rendering a broken dashboard

---


---

## 3. Complete API Endpoint Map

All endpoints verified live (200) as of build `68a0996`.

| # | Method & Path | Purpose | Backend location |
|---|---|---|---|
| 1 | `GET /api/users/client-dashboard` | Full dashboard payload (user, projects, invoices, tasks, messages, documents, budget, team, KPIs) | `server.js:1275` -- uses `buildClientPortalPayload()` |
| 2 | `GET /api/user-projects` | Client's assigned projects | `server.js:5203` |
| 3 | `GET /api/invoices` | All invoices (filtered client-side) | `server.js:2305` |
| 4 | `GET /api/users/my-invoices/:id/pdf` | Download invoice as PDF (via `invoiceRenderer.js`) | `server.js:3214` |
| 5 | `POST /api/mpesa/stkpush` | Trigger M-Pesa STK Push for an invoice | `server.js:655` (inline) / `backend/routes/mpesa.js` (modular) |
| 6 | `GET /api/mpesa/status/:checkoutRequestId` | Poll payment status (callback updates DB) | `backend/routes/mpesa.js:149` |
| 7 | `POST /api/mpesa/callback` | Safaricom callback -- writes result to `mpesa_transactions` | `server.js:647` |
| 8 | `GET /api/users/my-quotes` | List client's quotes | `server.js:1270` |
| 9 | `POST /api/users/my-quotes/:id/decision` | Approve/reject a quote | `server.js:1271` |
| 10 | `GET /api/users/my-signature-requests` | List pending signature requests | `server.js:1272` |
| 11 | `POST /api/users/my-signature-requests/:id/decision` | Sign/decline a document | `server.js:1273` |
| 12 | `GET /api/users/my-change-requests` | List client's change requests | `server.js:1117` |
| 13 | `POST /api/users/my-change-requests` | Submit new change request (validates project ownership) | `server.js:1118` |
| 14 | `GET /api/users/client-feedback/:userId` | List client's feedback | `server.js:1050` |
| 15 | `POST /api/users/client-feedback` | Submit feedback to admin | `server.js:1051` |
| 16 | `GET /api/users/notifications/me` | List client's notifications | `backend/routes/users.js:284` |
| 17 | `PUT /api/users/notifications/:id/read` | Mark one notification read | `backend/routes/users.js:312` |
| 18 | `PUT /api/users/notifications/read-all/me` | Mark all notifications read | `backend/routes/users.js:323` |
| 19 | `GET /api/users/my-reports` | List finalized project reports | `backend/routes/users.js:334` |
| 20 | `GET /api/users/my-reports/:id/download` | Download a report file | `backend/routes/users.js:350` |
| 21 | `GET /api/users/profile-photo/:userId` | Retrieve profile photo (BLOB to data URI) | `server.js:4948` |
| 22 | `POST /api/users/upload-profile-photo` | Upload photo (FormData, field `profilePhoto`) | `server.js:1264` (auth) / `server.js:4894` |
| 23 | `POST /api/users/change-password` | Change password (validates current + length) | `server.js:1559` |

### Modular route mounting

Routes in `backend/routes/` are mounted at boot via the manifest at `server.js:5148`:


---

## 4. Data Flow

### Bootstrap sequence

1. `PrivateRoute` verifies `AuthContext.user.token` exists -> renders portal
2. `ClientPortal` mounts -> `loadClientData()` fires on every `user` change
3. `Promise.all` fires 3 parallel batches:
   - Dashboard (`client-dashboard`)
   - Projects, invoices (`user-projects`, `invoices`)
   - Requests + notifications + reports (`my-change-requests`, `my-quotes`,
     `my-signature-requests`, `notifications/me`, `my-reports`)
4. Profile-photo probe fires separately (kept above early returns to avoid
   React hook-order errors)

### The `client-dashboard` payload

`server.js` delegates to `buildClientPortalPayload()` (`server/utils/clientPortalData.js`),
which normalizes raw DB rows into the shape the frontend renders:

```js
{
  user: { id, email, first_name, display_name, profilePhotoData, ... },
  projects: [{ id, name, status, priority, progress, deadline, plannedBudget, manager }, ...],
  invoices: [{ id, number, amount, status, dueDate, tax }, ...],
  messages: [{ id, subject, projectName, date, unread }, ...],
  tasks: [{ id, title, project, assignee, status, priority, progress, dueDate }, ...],
  documents: [{ id, name, category, project, date, size, version }, ...],
  budgetOverview: { planned, spent, forecast, variance },
  kpiMetrics: [{ id, label, value, trend }, ...],   // Active / Open Invoices / Open Messages / Next Milestone

---

## 5. Database Tables Read/Written

| Table | Operation | Used by |
|---|---|---|
| `users` | SELECT | `client-dashboard`, profile-photo, change-password |
| `user_projects` | SELECT | `client-dashboard`, `user-projects`, `my-change-requests` (ownership check) |
| `invoices` | SELECT | `invoices`, `my-invoices/:id/pdf` |
| `mpesa_transactions` | SELECT, INSERT, UPDATE | `stkpush`, `callback`, `status` |
| `quotes` | SELECT, UPDATE | `my-quotes`, `my-quotes/:id/decision` |
| `signature_requests` | SELECT, UPDATE | `my-signature-requests`, decision |
| `change_requests` | SELECT, INSERT | `my-change-requests` |
| `user_feedback` | SELECT, INSERT | `client-feedback` |
| `notifications` | SELECT, UPDATE | notifications (me, read, read-all) |
| `project_reports` | SELECT | `my-reports` |
| `project_tasks` | SELECT | `client-dashboard` (tasks panel) |
| `messages` | SELECT | `client-dashboard` (messages panel) |
| `documents` | SELECT | `client-dashboard` (documents panel) |

---

## 6. M-Pesa Payment Flow

```
User clicks "M-Pesa" on an invoice
        |
        v
POST /api/mpesa/stkpush  { invoiceId, amount, phone, accountReference }
        |
        +-- 200 -> returns { checkoutRequestId, simulated }
        |         Frontend shows "Prompt sent." -> reloads data after 5s
        |
        +-- On real Daraja: Safaricom sends user PIN prompt
                |
                v
        POST /api/mpesa/callback  (Safaricom -> server)
                |
                +-- ResultCode 0 -> status = "completed" + ledger entry created
                +-- ResultCode != 0 -> status = "failed"
                |
                v
        GET /api/mpesa/status/:checkoutRequestId  <- returns { status, result_desc, mpesa_receipt }
```

In **simulated mode** (no Daraja credentials), `stkpush` returns immediately with
`simulated: true`. Set `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`,
`MPESA_PASSKEY`, and `MPESA_CALLBACK_URL` in `.env` for live STK Push.

---

## 7. Error Handling

| Layer | Behavior |
|---|---|
| `authFetch` | 15 s timeout; 401/403 -> logout + `/login` redirect; network error -> thrown to caller |
| `loadClientData` | Any failure -> sets `error` state (shows full-screen retry), `isOffline` flag |
| Per-action handlers | `try/catch` -> `setPaymentStatus` / `setFeedbackSuccess` / `settingsMessage` with type `info` / `success` / `error` |
| Backend | All handlers return `{ success: false, message }` on validation failure; 500 with `{ success: false }` on DB error |

---

## 8. Profile Photo

- **Probe:** `useEffect` sets `<img src="/api/users/profile-photo/:id?probe=1">`;
  `onerror` sets `photoAvailable = false` -> UI shows initials fallback
- **Upload:** `handlePhotoChange` sends `FormData` with field `profilePhoto`
  to `POST /api/users/upload-profile-photo`
- **Display priority:** `photoPreview` (local) -> `photoUrl` (probe-verified) ->
  `profilePhotoData` (B64 from login) -> initials

---

## 9. State Shape

```js
// Data
projects, invoices, kpiMetrics, portalUser, tasks, messages, documents,
docSummary, budgetOverviewData, businessSummary, roleUpdates, teamMembers,
changeRequests, quotesList, signatureRequests, feedbackList, notifications, reports

// UI
activeSection, loading, error, isOffline, mpesaLoading, paymentStatus,
isSubmittingFeedback, feedbackSuccess, decisionBusy, photoPreview, photoAvailable,
photoVersion, settingsMessage, passwordForm, passwordErrors, passwordMessage
```

---

## 10. Related Files

| File | Role |
|---|---|
| `src/pages/ClientPortal.jsx` | Main portal component (1,349 lines, `export default`) |
| `src/services/api.js` | `apiCall`, `getApiUrl`, `mpesaAPI`, `projectsAPI`, `invoicesAPI` |
| `src/context/AuthContext.jsx` | `user` (token), `login`, `logout` |
| `src/components/PrivateRoute.jsx` | Route guard -- redirects to `/login` if no token |
| `src/utils/currencyUtils.js` | `formatKSH()` formatter |
| `server/utils/clientPortalData.js` | `buildClientPortalPayload()` -- normalizes DB to UI shape |
| `server/lib/invoiceRenderer.js` | `generatePDFContent()` -- PDF byte generation |
| `backend/routes/mpesa.js` | STK Push, callback, status endpoints |
| `backend/routes/users.js` | Auth + notifications + reports endpoints |
| `scripts/verify-features.js` | End-to-end live verification (37 checks) |
| `src/pages/Projects.jsx` | Standalone project detail (shares `client-dashboard` + notifications endpoints) |

---

## 11. Known Issues

| Issue | Status |
|---|---|
| `GET /api/users/my-reports` returns 500 until `project_reports` table is synced | Run `node scripts/sync-db-schema.js` to create missing tables |

---

## 12. Verification

Run the full suite against a running server:

```bash
node scripts/verify-features.js
# Expected: FEATURE VERIFICATION: 37 passed, 0 failed, 37 total
```

Smoke-test the client-portal-specific endpoints (login as client first, then
hit each endpoint with the Bearer token). All return expected status codes:

- List endpoints -> 200
- Decision endpoints -> 200 (or 403 if not owner -- correct)
- Feedback submit -> 400 if validation fails (correct)
- Invoice PDF -> 404 if invoice does not exist (correct)
- Change-password -> 400 if validation fails (correct)


  businessSummary: { activeProjects, completedProjects, openInvoices, openMessages, nextMilestone },
  teamMembers: [{ id, projectId, projectName, name, email, role, duties }, ...],
}
```

```js
const ROUTES = [
  { path: "/api/users",                  route: "./backend/routes/users" },
  { path: "/api/mpesa",                  route: "./backend/routes/mpesa" },
  { path: "/api/admin-verification",     route: "./backend/routes/admin-verification" },
  { path: "/api/developer-verification", route: "./backend/routes/developer-verification" },
];
ROUTES.forEach(({ path, route }) => app.use(path, require(route)));
```

## 2. Sections

| Section | State key | Content |
|---|---|---|
| Overview | `overview` | KPI dashboard (Active Projects, Open Invoices, Open Messages, Next Milestone), budget variance, role-based mission briefing |
| Projects | `projects` | Grid of assigned projects with status, priority, progress bar, budget, deadline, manager |
| Team | `team` | Team members grouped by project, with role, duties, contact |
| Billing | `billing` | Invoices list with KSH amounts; per-row Download PDF and M-Pesa Pay Now; payment status alerts |
| Tasks | `tasks` | Project tasks with status/priority/progress |
| Messages | `messages` | Messages thread list (subject, project, date, unread) |
| Documents | `documents` | Document cards + client reports list with download |
| Feedback | `feedback` | Submit feedback form (title, message, type, rating 1-5, priority); feedback history |
| Requests | `requests` | Change Requests (create+list), Quotes (approve/reject), Signature Requests (sign/decline) |
| Settings | `settings` | Profile settings, profile photo (upload/remove + initials fallback), change password |
