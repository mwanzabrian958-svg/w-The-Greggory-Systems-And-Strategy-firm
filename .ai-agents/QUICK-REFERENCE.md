# Quick Reference

1. Identify the repository with `identify_context({ file_path: "./The-Greggory-Systems-And-Strategy-firm website/src/App.jsx" })`.
2. Call `get_current_focus()`. Continue the active objective or start a focused session if none exists.
3. Load `get_merged_guidelines({ context: "frontend" })` or `"backend"` before changing code. Check contracts before changing interfaces.
4. Inspect only the relevant code/docs first; expand context as needed. Keep secrets out of output.
5. Verify with `npm --prefix "./The-Greggory-Systems-And-Strategy-firm website" run build`, `test:unit`, or `test:ui` as appropriate.
6. Call `create_checkpoint({ summary: "Fixed portfolio search and checked the home route", next_focus: "Run the focused UI smoke test" })`; call `complete_session` when finished.

## Project facts

- React 18 + Vite frontend; Express API entry: `./The-Greggory-Systems-And-Strategy-firm website/server.js`.
- Root startup: `npm run dev`; frontend/backend without XAMPP helpers: `npm --prefix "./The-Greggory-Systems-And-Strategy-firm website" run dev:simple`.
- Use `apiCall` in `./The-Greggory-Systems-And-Strategy-firm website/src/services/api.js` where applicable.
- All example file paths and MCP `file_path` values start with `./`.

More detail: `./AGENTS.md`, `./.ai-agents/skills/SKILL.md`, `./.ai-agents/copilot-instructions.md`.
