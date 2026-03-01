---
date: 2026-03-01T18:46:30Z
researcher: codex
git_commit: bd4e7f6
branch: feat/tool-calling-api-expose
repository: openville
topic: "Openville HTTP CLI + LangChain Tool"
tags: [implementation, strategy, cli, langchain, api]
status: complete
last_updated: 2026-03-01
last_updated_by: codex
type: implementation_strategy
---

# Handoff: general create-openville-cli-and-langchain-tool

## Task(s)

- Goal: expose existing Next.js backend API routes as a small HTTP CLI and a LangChain tool that maps to that CLI so agents can call backend functionality.
- Status: planning complete; no code changes made by me in this session (implementation not started).
- Scope (planned): implement a Node CLI that POSTs/GETs JSON to the running Next server (default base `http://localhost:3000`), and a TypeScript LangChain tool module that shells out to that CLI and returns parsed JSON.
- Initial endpoints targeted: `POST /api/agents/search-and-select`, `POST /api/agents/select-top3`, `GET /api/workflow/status`. Additional endpoints may be added later (negotiate/run, search/ranked, select-winner).

## Critical References

- `app/api/agents/search-and-select/route.ts`
- `app/api/agents/select-top3/route.ts`
- `app/api/workflow/status/route.ts`

## Recent changes

- No files were edited by me in this session. Branch context: `feat/tool-calling-api-expose` at commit `bd4e7f6`.
- Note: repository already contains backend-first integration edits on this branch (see existing handoffs and plans under `thoughts/shared/*`).

## Learnings

- The backend is organized as Next.js App Router server routes under `app/api/*` and is reachable when Next is running at `http://localhost:3000/api/...`.
- There are existing Zod request/response schemas in `features/shared/schemas/WorkflowSchemas.ts` — use them to validate CLI inputs.
- Design choice: a thin HTTP CLI keeps cross-process isolation and works with remote agents; shelling out from the LangChain tool to the CLI keeps the tool surface simple and avoids importing server internals.
- Environment/config: CLI should accept `--base` or `OPENVILLE_API_BASE` (default `http://localhost:3000`) and optional `--api-key`/`OPENVILLE_API_KEY` hook for future auth.

## Artifacts

Files to be created (planned):

- `scripts/tooling/openville-cli.ts` (executable Node CLI, JSON in/out)
- package.json: add `bin` or `scripts` entry for the CLI (e.g. `tool:openville`)
- `src/tools/langchain/openvilleTool.ts` (TypeScript LangChain-compatible tool that shells out to the CLI; exports `searchAndSelect`, `selectTop3`, `workflowStatus`)
- `docs/tools/openville-cli.md` (short usage examples)

Existing relevant files to inspect when implementing:

- `app/api/agents/search-and-select/route.ts`
- `app/api/agents/select-top3/route.ts`
- `app/api/workflow/status/route.ts`
- `features/shared/schemas/WorkflowSchemas.ts`
- `features/agents/selection/selectTop3.ts`

## Action Items & Next Steps

1. Implement the CLI (high priority)
   - `scripts/tooling/openville-cli.ts`: accept subcommands `search-and-select`, `select-top3`, `workflow-status`.
   - Support `--data '<json>'` or read JSON from stdin.
   - Return JSON on stdout and non-zero exit codes on error.
   - Respect `--base` / `OPENVILLE_API_BASE` and optional `--api-key` / `OPENVILLE_API_KEY` header.

2. Add package.json script/bin so the CLI can be invoked via `npx` or `node ./scripts/...`.

3. Implement LangChain tool wrapper
   - `src/tools/langchain/openvilleTool.ts` wraps the CLI via child_process and exposes typed async functions `searchAndSelect(params)`, `selectTop3(params)`, `workflowStatus()`.
   - Return parsed JSON and surface errors as exceptions.

4. Add minimal docs and examples (README snippet + usage). Include example curl and npx commands.

5. (Optional) Add tests for the CLI and tool (mock the server or run Next in test mode). Add auth header support if endpoints are protected.

## Other Notes

- `scripts/spec_metadata.sh` referenced in the process is not present in this repo; metadata in this file was composed from available git info (`git_commit`, `branch`) and timestamps.
- When implementing, run the Next dev server (`npm run dev`) to test the CLI against local endpoints.
- Keep the CLI and LangChain tool minimal and focused; add auth and broader endpoint coverage in follow-ups.

---

End of handoff.
