# Copilot Instructions

Use `./AGENTS.md` as the repository's canonical project guide. This is a supplementary reference stored at the requested `./.ai-agents/copilot-instructions.md` path; the root `./AGENTS.md` remains the repository-level discovery entry point. Keep project-wide rules in `./AGENTS.md` to avoid duplicate, drifting instruction sets.

- Treat `./The-Greggory-Systems-And-Strategy-firm website/` as the application root; run the documented npm scripts from the repository root.
- Use repository-relative paths beginning with `./` in examples and AI Project Context MCP calls.
- Before work, identify context, check the active focus, start or update a focused session, and load the relevant guidelines. See `./.ai-agents/skills/SESSION-WORKFLOW.md`.
- Check registered contracts before changing API/interface behavior and search existing docs before writing new ones. See `./.ai-agents/skills/CONTRACT-REFERENCE.md` and `./.ai-agents/skills/DOCUMENTATION-WORKFLOW.md`.
- Prefer targeted source reads and tests. Never expose or commit `.env` credentials. Do not initialize, purge, or back up databases unless explicitly required.
- Checkpoint meaningful progress; complete the MCP session when the task is done.
