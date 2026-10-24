# Project Patterns

## Frontend structure

- `./The-Greggory-Systems-And-Strategy-firm website/src/main.jsx` mounts React Strict Mode and imports global styles/device setup.
- `./The-Greggory-Systems-And-Strategy-firm website/src/App.jsx` owns React Router layout and routes. The home page is eager-loaded; most other pages and the admin router use lazy loading. Preserve route boundaries and the shared auth/theme providers.
- Page components live in `./The-Greggory-Systems-And-Strategy-firm website/src/pages/`; reusable UI, context, hooks, utilities, and API access live in `./The-Greggory-Systems-And-Strategy-firm website/src/components/`, `./The-Greggory-Systems-And-Strategy-firm website/src/context/`, `./The-Greggory-Systems-And-Strategy-firm website/src/hooks/`, `./The-Greggory-Systems-And-Strategy-firm website/src/utils/`, and `./The-Greggory-Systems-And-Strategy-firm website/src/services/`.
- Use `apiCall` from `./The-Greggory-Systems-And-Strategy-firm website/src/services/api.js` for frontend requests when it fits the endpoint. Avoid duplicating base-URL, auth-header, and response handling.

## Backend and persistence

- `./The-Greggory-Systems-And-Strategy-firm website/server.js` is the Express application entry point. It wires middleware, health reporting, API routes, and static SPA delivery.
- Reusable API feature code is organized in `./The-Greggory-Systems-And-Strategy-firm website/backend/routes/`, `./The-Greggory-Systems-And-Strategy-firm website/backend/controllers/`, `./The-Greggory-Systems-And-Strategy-firm website/backend/middleware/`, and `./The-Greggory-Systems-And-Strategy-firm website/backend/services/`; shared domain/server code also exists under `./The-Greggory-Systems-And-Strategy-firm website/server/`.
- MySQL configuration and external-service credentials are environment-driven. Never hard-code secrets or print `.env` values. Keep frontend and backend request/response and authentication behavior aligned.

## Verification and delivery

- Node tests use the built-in runner via `npm --prefix "./The-Greggory-Systems-And-Strategy-firm website" run test:unit`; tests live under `./The-Greggory-Systems-And-Strategy-firm website/backend/tests/`, `./The-Greggory-Systems-And-Strategy-firm website/backend/utils/`, and `./The-Greggory-Systems-And-Strategy-firm website/server/utils/`.
- Browser route smoke coverage is `./The-Greggory-Systems-And-Strategy-firm website/scripts/ui-smoke.mjs` and is invoked with `test:ui`; it requires Chrome or Edge and can target a server with `BASE_URL`.
- The website package's `build` script regenerates the sitemap and runs Vite. Review the generated sitemap diff if the build updates `./The-Greggory-Systems-And-Strategy-firm website/public/sitemap.xml`.
- `./Dockerfile` is a multi-stage Node 22 image that builds the Vite app and serves it with Express. `./render.yaml` is the deployment blueprint.

## Local style

Follow the style of the file being edited: frontend JSX and backend files do not use identical formatting conventions. Make the smallest change that preserves the existing route, API, and error-handling behavior; add focused tests when behavior changes.
