# Repository Guide

## Project overview

This repository contains a React 18/Vite website and its Express API in `./The-Greggory-Systems-And-Strategy-firm website/`. The root `./package.json` provides convenience scripts; the main application manifest is `./The-Greggory-Systems-And-Strategy-firm website/package.json`. JavaScript is the application language. Python files are repository utilities, not a separate application runtime.

The browser entry point is `./The-Greggory-Systems-And-Strategy-firm website/src/main.jsx`. `./The-Greggory-Systems-And-Strategy-firm website/src/App.jsx` owns routing and shared layout; the home page is eager-loaded, other pages are lazy-loaded, and the admin module is split into its own lazy chunk. Frontend API calls are centralized in `./The-Greggory-Systems-And-Strategy-firm website/src/services/api.js`.

The Express entry point is `./The-Greggory-Systems-And-Strategy-firm website/server.js`. It mounts API routes, serves `./The-Greggory-Systems-And-Strategy-firm website/public/` and the built `./The-Greggory-Systems-And-Strategy-firm website/dist/` app, and exposes `/api/health`. Backend feature code is also organized under `./The-Greggory-Systems-And-Strategy-firm website/backend/` and `./The-Greggory-Systems-And-Strategy-firm website/server/`. MySQL is the primary relational store; integrations and service endpoints are configured through environment variables.

Deployment uses the root `./Dockerfile` and `./render.yaml`. The only checked-in GitHub Actions workflow is `./.github/workflows/keep-alive.yml`; it pings the deployed health endpoint and is not a build or test pipeline.

## MCP quick start

Pass repository-relative paths beginning with `./` to Project Context MCP tools:

```text
identify_context({ file_path: "./The-Greggory-Systems-And-Strategy-firm website/src/App.jsx" })
get_current_focus()
get_merged_guidelines({ context: "frontend" })
```

If there is no active session, call `start_session({ context: "frontend", current_focus: "Fix the home page portfolio search" })`. Before implementing an existing or new interface, retrieve relevant contracts with `get_contracts` and validate the proposed implementation with `validate_contract`. Check documentation for duplicates before adding docs. Save meaningful progress with `create_checkpoint` and call `complete_session` when the task is done. See `./.ai-agents/QUICK-REFERENCE.md`, `./.ai-agents/skills/SKILL.md`, and the supplementary `./.ai-agents/copilot-instructions.md`.

## Development and verification

Run commands from the repository root:

```sh
npm run install:all
npm run dev
```

`npm run dev` starts XAMPP services, the workspace opener, the Express server, and Vite. To run only the website's backend and frontend without the XAMPP/workspace helpers:

```sh
npm --prefix "./The-Greggory-Systems-And-Strategy-firm website" run dev:simple
```

Useful checks:

```sh
npm --prefix "./The-Greggory-Systems-And-Strategy-firm website" run build
npm --prefix "./The-Greggory-Systems-And-Strategy-firm website" run test:unit
npm --prefix "./The-Greggory-Systems-And-Strategy-firm website" run test:ui
```

The website build regenerates `./The-Greggory-Systems-And-Strategy-firm website/public/sitemap.xml` before running Vite. Unit tests use Node's built-in test runner. The UI smoke test uses `puppeteer-core` and requires a local Chrome/Edge executable; set `BASE_URL` to test a running server. The main website environment file is `./The-Greggory-Systems-And-Strategy-firm website/.env`; use `./The-Greggory-Systems-And-Strategy-firm website/.env.example` for variable names. Never copy real credentials into instructions, logs, or commits.

## Working conventions

- Read the relevant feature code and existing documentation before changing behavior; keep changes focused and follow the local file's style.
- Reuse `apiCall` from `./The-Greggory-Systems-And-Strategy-firm website/src/services/api.js` for frontend API work where applicable. Keep API request/response behavior consistent with its Express routes and callers.
- Preserve route-level lazy loading and the separate admin boundary in `./The-Greggory-Systems-And-Strategy-firm website/src/App.jsx`.
- Add or update focused tests under `./The-Greggory-Systems-And-Strategy-firm website/backend/tests/`, `./The-Greggory-Systems-And-Strategy-firm website/backend/utils/`, or `./The-Greggory-Systems-And-Strategy-firm website/server/utils/` for behavior changes.
- Do not run database initialization, data-purge, or backup scripts unless the task explicitly requires them and the target environment is understood.
- Keep all paths in agent instructions and MCP examples repository-relative and beginning with `./`.

For on-demand procedures, see `./.ai-agents/skills/SESSION-WORKFLOW.md`, `./.ai-agents/skills/CONTRACT-REFERENCE.md`, `./.ai-agents/skills/DOCUMENTATION-WORKFLOW.md`, and `./.ai-agents/skills/PATTERNS-REFERENCE.md`.
