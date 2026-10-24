# Session Workflow

Use this sequence for work in this repository. Paths passed to MCP tools and shown in examples are relative to the repository root and start with `./`.

## Start with context and focus

1. Identify a real file in the area being changed:

   ```text
   identify_context({ file_path: "./The-Greggory-Systems-And-Strategy-firm website/src/pages/Home.jsx" })
   ```

2. Call `get_current_focus()`. Continue that objective if it matches; if not, use `update_focus` to record the changed goal.
3. If no session is active, call `start_session` with the task-specific context and focus. For example: `start_session({ context: "frontend", current_focus: "Fix the portfolio search behavior" })`.
4. Load `get_merged_guidelines({ context: "frontend" })` or `"backend"` before editing. Use `"shared"` for cross-cutting work.
5. Retrieve `get_complete_project_context` only when architectural, feature, or constraint context is needed; do not load it automatically for a small local fix.
6. For narrower guidance, use `get_guidelines` with the relevant context and topic. When working on a registered feature, query `get_features` and `get_feature_context` before changing its behavior; use `register_feature` only for a genuinely new user-visible feature.

## Execute with progressive disclosure

- Begin with `./AGENTS.md` and this task's relevant source. Search for callers, tests, and established patterns before expanding scope.
- Use `get_contracts` before changing a registered API or critical interface, then use `validate_contract` against the proposed implementation.
- Record a durable architecture choice with `add_decision`; use `learn_pattern` only after confirming a reusable pattern in working code.
- Load one of the sibling reference files only when the task matches its subject. Use focused search and bounded reads for long files, logs, and generated output.
- Keep credentials from `./The-Greggory-Systems-And-Strategy-firm website/.env` out of prompts, tool output, notes, and commits. Refer to `./The-Greggory-Systems-And-Strategy-firm website/.env.example` for variable names.

## Checkpoints and long sessions

After a meaningful implementation or verification milestone, call `create_checkpoint` with a concise summary, the next focus, and repository-relative modified file paths. For example: `create_checkpoint({ summary: "Fixed portfolio search and verified its route", next_focus: "Run the focused frontend checks", files_modified: ["./The-Greggory-Systems-And-Strategy-firm website/src/pages/Home.jsx"] })`. Refresh guidelines/contracts with `refresh_session_context` at least every 10 turns or 30 minutes.

When context must be compacted, preserve:

- Current goal and user constraints
- Decisions and their rationale
- Changed files and implementation state
- Exact checks run and their outcomes
- Remaining blockers, risks, and next action

Drop repeated logs, redundant tool output, and investigations that no longer affect the next step. Prefer a checkpoint over copying long command output into the summary.

## Finish

Run the narrowest relevant checks. Report failures and skipped checks explicitly. Add a final checkpoint if useful, then call `complete_session` using the session ID returned by `start_session`. Do not commit or push unless requested.
