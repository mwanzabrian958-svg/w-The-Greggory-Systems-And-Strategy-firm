# Contract Reference

Use this workflow before changing a frontend/backend boundary, authentication behavior, or another stable interface. The app's React client and Express API share contracts through actual routes and payloads, even where no TypeScript interface is declared.

## Validate an existing contract

1. Retrieve relevant records with `get_contracts({ context: "frontend", search: "portfolio API" })` or the matching `"backend"` context.
2. Read the implementation and all relevant callers, especially `./The-Greggory-Systems-And-Strategy-firm website/src/services/api.js`, `./The-Greggory-Systems-And-Strategy-firm website/backend/routes/`, and `./The-Greggory-Systems-And-Strategy-firm website/server.js`.
3. Compare the proposed request, response, errors, and auth behavior with the registered rules.
4. Call `validate_contract` with the exact contract name returned by `get_contracts` and the proposed implementation source in `code` before applying a change to that registered contract. Do not invent a contract name or use a summary in place of implementation code. Resolve violations rather than bypassing them.
5. Add or update focused tests for the affected behavior.

## Register a durable contract

Register only a stable, team-owned interface that needs to constrain future implementations. Use `register_contract` with a precise name, context, interface code, purpose, and enforceable rules. Set `file_path` to the repository-relative source path beginning with `./`. Do not register incidental local helper functions as contracts.

## Project mapping caution

During preparation, `identify_context` did not detect this repository and returned the `default` project. Do not treat an empty contract list or project metadata as proof that this repository has no contracts. First confirm that the MCP project ID resolves to this repository; if it does not, correct the project mapping or clearly report that validation is unavailable. Never validate against an unrelated default project and claim project-level compliance.
