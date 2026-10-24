---
name: skills
description: "Provides project-specific progressive context and AI Project Context MCP workflows. Use when starting repository work, managing long sessions, validating interfaces, documenting changes, or looking up this app's architecture and conventions."
---

# Progressive Context for This Repository

Start with the smallest useful context and follow references only when the task needs them. The always-on entry point is `./AGENTS.md`; this hub routes agents to focused details:

- Session setup, relative paths, checkpoints, and compaction: `./SESSION-WORKFLOW.md`
- API/interface contracts and validation: `./CONTRACT-REFERENCE.md`
- Existing documentation checks and doc updates: `./DOCUMENTATION-WORKFLOW.md`
- React, API, Express, and test patterns: `./PATTERNS-REFERENCE.md`
- Short checklist: `./../QUICK-REFERENCE.md`

## Project-specific starting point

The app lives under `./The-Greggory-Systems-And-Strategy-firm website/`; the repository root provides the main `npm run dev` and `npm run build` scripts. Use repository-relative MCP paths such as `./The-Greggory-Systems-And-Strategy-firm website/src/pages/Home.jsx`. The frontend is React/Vite; the backend is Express in `./The-Greggory-Systems-And-Strategy-firm website/server.js`.

Use the MCP sequence in `./SESSION-WORKFLOW.md`. Before an interface change, inspect registered contracts. Before creating documentation, search for an existing document. Read code and logs selectively rather than loading whole directories or large outputs.

## Context budget

Keep instructions at the right altitude: concrete enough to prevent project-specific mistakes, but not a copy of the codebase. Retrieve detailed source, test output, and documentation just in time. When compressing a long task, retain the goal, decisions, affected files, test results, and unresolved risks; discard repeated logs and superseded investigation.

## Research basis

- [Anthropic: Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) — high-signal context, retrieval, compaction, and durable notes.
- [Inferable: Progressive Context Enrichment (archived copy)](https://web.archive.org/web/20250121110034id_/https://www.inferable.ai/blog/posts/llm-progressive-context-encrichment) — fetch only the information needed for the current step. The requested live URL returned 404 during preparation.
- [AGENTS.md](https://agents.md/) — repository-scoped agent guidance.
- [Claude Agent Skills best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) — concise discovery metadata and on-demand references.
- [HackerNoon: Progressive Context Disclosure](https://hackernoon.com/progressive-context-disclosure-and-the-token-problem) — discovery-first surfaces and focused retrieval.
