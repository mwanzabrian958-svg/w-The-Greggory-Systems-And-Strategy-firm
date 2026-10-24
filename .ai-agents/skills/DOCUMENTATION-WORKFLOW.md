# Documentation Workflow

This repository already has substantial documentation in both the root and the application directory. Search before adding or replacing any document:

- `./README.md`
- `./CLIENT_PORTAL.md`
- `./The-Greggory-Systems-And-Strategy-firm website/README.md`
- `./The-Greggory-Systems-And-Strategy-firm website/ENDPOINTS-GUIDE.md`
- `./The-Greggory-Systems-And-Strategy-firm website/docs/client-portal/README.md`

## Before writing

1. Call `check_existing_documentation` with a specific title, topics, and keywords.
2. Search the repository for the feature, API, or setup guide and read any close match. The documentation catalog may be incomplete because docs are spread beyond a single `./docs/` directory.
3. Update the authoritative existing document when it already covers the subject. Avoid creating a parallel guide that can drift.

## Create or update

When Project Context MCP is mapped to this repository, use `manage_documentation` to create or update metadata and documentation. For create operations, supply a repository-relative `file_path` beginning with `./`, an accurate context/type, and a concise summary. For updates, use the existing document ID.

During preparation, `identify_context` returned `detected: false`, and documentation sync resolved outside this repository. Therefore, verify project mapping before using filesystem-backed documentation tools; do not claim that metadata was synced or written to this checkout if the tool reports another root. If the mapping is unavailable, edit the requested repository file directly after the duplicate check and report that MCP metadata could not be updated.

Keep docs factual and testable. Use commands that exist in the relevant `package.json`, distinguish root scripts from website scripts, and never include `.env` values or other credentials.
