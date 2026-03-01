---
date: 2026-03-01T01:12:15-08:00
researcher: codex
git_commit: 5ceff7059913b80ae683c6a064d70d7a620b4d29
branch: integration/frontend-on-dev
repository: openville
topic: "Backend-first frontend integration implementation handoff"
tags: [implementation, handoff, frontend, backend, integration, workflow]
status: in_progress
last_updated: 2026-03-01
last_updated_by: codex
type: implementation_handoff
---

# Handoff: backend-first frontend integration

## Task(s)

- Implement the plan in `thoughts/plans/2026-03-01-frontend-on-dev-integration-plan.md`.
- Preserve the merged landing/workspace shell while replacing active-path mocks with backend-owned workflow contracts and runtime data sources.
- Prioritize backend truth and explicit fallback visibility before frontend hook replacement.

Current status:

- plan doc updated and finalized
- backend normalization slice partially implemented
- search runtime has been refactored toward a repository/fallback model
- workflow metadata/status primitives have been added
- frontend workflow replacement has not been implemented yet
- tests and lint have not been run yet

## Critical References

- `thoughts/plans/2026-03-01-frontend-on-dev-integration-plan.md`
- `thoughts/research/2026-03-01-frontend-on-dev-integration-research.md`
- `context/user_flow.md`
- `context/responsbilities.md`

## What Changed In This Session

### 1. Plan doc was replaced with the backend-first version

Updated:

- `thoughts/plans/2026-03-01-frontend-on-dev-integration-plan.md`

This doc now states:

- backend is authoritative
- active search path should be Supabase-backed
- fallback must be explicit and visible
- frontend must adapt through repository/view-model boundaries
- `POST /api/agents/search-and-select` is the main search + shortlist route
- `POST /api/agents/negotiate/run` is required for batch negotiation

### 2. Workflow metadata and runtime fallback primitives were added

Added:

- `features/workflow/types.ts`
- `features/workflow/server/runtime.ts`

These introduce:

- workflow readiness/status types
- execution metadata
- explicit LLM fallback resolution
- workflow status response building

### 3. Shared schema layer was added for backend route normalization

Added:

- `features/shared/schemas/WorkflowSchemas.ts`

This centralizes:

- candidate schema
- user preferences schema
- job scope schema
- search request schema
- search-and-select request schema
- select-top3 request schema
- transport negotiation result schema
- select-winner request schema
- run-negotiations request schema

### 4. Search runtime was moved away from the old mock-only shape

Added:

- `features/search/data/marketCandidateSeeds.ts`
- `features/search/repositories/MarketCandidateRepository.ts`
- `features/search/repositories/SupabaseMarketCandidateRepository.ts`

Updated:

- `features/search/services/embedding.ts`
- `features/search/services/ragSearch.ts`
- `features/search/types/index.ts`

Behavior change:

- search now resolves through a market repository
- Supabase is treated as the real source
- seeded fallback is explicit
- embeddings try OpenAI first
- keyword retrieval fallback is explicit
- `SearchResult` now aliases the canonical backend `Candidate` shape

Important nuance:

- this is not fully complete yet because the runtime still needs verification against real Supabase table shape and route tests

### 5. New workflow routes were added

Added:

- `app/api/workflow/status/route.ts`
- `app/api/agents/negotiate/run/route.ts`

Purpose:

- expose backend readiness/fallback status to the frontend
- expose batch negotiation orchestration through HTTP

### 6. Existing routes were partially normalized

Updated:

- `app/api/search/ranked/route.ts`
- `app/api/agents/search-and-select/route.ts`
- `app/api/agents/select-top3/route.ts`
- `app/api/agents/select-winner/route.ts`
- `app/api/agents/negotiate/start/route.ts`
- `app/api/agents/negotiate/[id]/message/route.ts`
- `app/api/agents/negotiate/[id]/propose/route.ts`

Behavior changes intended:

- shared Zod validation
- explicit provider resolution
- search metadata on responses
- transport-safe winner selection input
- search-and-select returns ranked results even when shortlist selection is skipped because there are fewer than 3 candidates

### 7. Negotiation internals were partially normalized

Added:

- `features/agents/negotiation/types/NegotiationTransport.ts`

Updated:

- `features/agents/negotiation/schemas/NegotiationSchemas.ts`
- `features/agents/negotiation/runNegotiations.ts`
- `features/agents/negotiation/db/SupabaseNegotiationRepository.ts`
- `features/agents/negotiation/types/index.ts`

Behavior changes intended:

- shared request schema usage
- explicit `rejected` vs `failed` outcomes
- proposal price derived from preferences/candidate pricing instead of hardcoded `500`
- `maxRounds` is now used
- Supabase repository now throws explicit config errors instead of assuming env at import time

### 8. Selection and winner fallback behavior were partially normalized

Updated:

- `features/agents/selection/selectTop3.ts`
- `features/agents/selection/selectWinner.ts`
- `features/agents/reasoning/prompts/winnerPrompts.ts`
- `features/agents/reasoning/providers/index.ts`
- `features/agents/selection/types/JobScope.ts`

Behavior changes intended:

- deterministic mock fallback for top-3 and winner selection
- winner prompt now tolerates string dates after transport normalization
- `JobScope` gained `rooms` and `details`

### 9. Supabase runtime initialization was relaxed

Updated:

- `lib/supabase/server.ts`
- `lib/supabase/client.ts`
- `.env.local.example`

Purpose:

- avoid crashing at module import time when env is missing
- allow workflow status/degraded mode handling
- expose:
  - `ALLOW_MOCK_LLM_FALLBACK`
  - `ALLOW_SEEDED_MARKET_FALLBACK`

### 10. Database migration for market candidates was added

Added:

- `supabase/migrations/20260301000000_create_market_candidates.sql`

This creates:

- `market_candidates`
- pgvector extension
- vector and lookup indexes

## Working Tree Context

There are two categories of changes in the branch:

1. Pre-existing UI merge work already present before this interrupted slice:
- landing/workspace shell
- chat/request composer components
- candidate board UI
- theme files
- frontend mock contract files

2. New backend-first integration changes added in this session:
- workflow metadata/status/types
- search repository and seed data
- search route normalization
- batch negotiation route
- negotiation transport types
- Supabase runtime/client relaxations
- market candidates migration

Do not assume all modified files in `git status` were created in this session.

## Files Added In This Session

- `app/api/agents/negotiate/run/route.ts`
- `app/api/workflow/status/route.ts`
- `features/agents/negotiation/types/NegotiationTransport.ts`
- `features/search/data/marketCandidateSeeds.ts`
- `features/search/repositories/MarketCandidateRepository.ts`
- `features/search/repositories/SupabaseMarketCandidateRepository.ts`
- `features/shared/schemas/WorkflowSchemas.ts`
- `features/workflow/server/runtime.ts`
- `features/workflow/types.ts`
- `supabase/migrations/20260301000000_create_market_candidates.sql`

## Files Modified In This Session

- `.env.local.example`
- `app/api/agents/negotiate/[id]/message/route.ts`
- `app/api/agents/negotiate/[id]/propose/route.ts`
- `app/api/agents/negotiate/start/route.ts`
- `app/api/agents/search-and-select/route.ts`
- `app/api/agents/select-top3/route.ts`
- `app/api/agents/select-winner/route.ts`
- `app/api/search/ranked/route.ts`
- `features/agents/negotiation/db/SupabaseNegotiationRepository.ts`
- `features/agents/negotiation/runNegotiations.ts`
- `features/agents/negotiation/schemas/NegotiationSchemas.ts`
- `features/agents/negotiation/types/index.ts`
- `features/agents/reasoning/prompts/winnerPrompts.ts`
- `features/agents/reasoning/providers/index.ts`
- `features/agents/selection/selectTop3.ts`
- `features/agents/selection/selectWinner.ts`
- `features/agents/selection/types/JobScope.ts`
- `features/search/services/embedding.ts`
- `features/search/services/ragSearch.ts`
- `features/search/types/index.ts`
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `thoughts/plans/2026-03-01-frontend-on-dev-integration-plan.md`

## What Is Not Done Yet

### Backend verification is incomplete

The server-side refactor is only partially validated.

Not done:

- run TypeScript/test verification
- update route tests to new schemas and response shapes
- update `ragSearch` tests for the repository-based path
- verify `market_candidates` migration assumptions against actual Supabase environment
- verify that `createMockChatModel` fallback behavior still works with existing tests

### Frontend active workflow integration is not started

Still pending:

- replace `useChatFlow`
- replace `useRankedResults`
- remove active-path dependence on `features/shared/contracts/*`
- add frontend repository for:
  - workflow status
  - search-and-select
  - negotiate run
  - select winner
- add `useOpenvilleFlow`
- add UI panels for:
  - status/fallback state
  - structured context form
  - shortlist summary
  - negotiation summary
  - winner summary
- adapt `CandidateCard` and `CandidateResults` to backend-aligned view models

### Search data cutover is only partially complete

The runtime now has:

- repository abstraction
- seeded fallback
- migration for a real table

Still missing:

- a seed/import script to load sample candidates into Supabase
- route or script for generating/storing embeddings in the DB
- any DB-level vector query optimization beyond schema/index setup

## Known Risks / Likely Breakpoints

1. Tests are almost certainly stale
- route tests still expect older request/response shapes
- `selectTop3` and `selectWinner` tests assume older behavior
- `ragSearch` tests assume mock embeddings and in-memory data

2. Frontend still targets old stub contracts
- current UI components and hooks still use:
  - `features/shared/contracts/Candidate.ts`
  - `features/shared/contracts/UserPreferences.ts`
  - `features/shared/contracts/SearchContracts.ts`
- none of that has been replaced yet

3. Search-and-select response shape changed materially
- `selectionResult` can now be `null` when search returns fewer than 3 candidates
- any future frontend consumer must handle that explicitly

4. Supabase runtime changes need validation
- `supabaseAdmin` is now nullable at import time
- existing code outside the edited files may still assume non-null behavior later

5. The seeded market path is explicit but still a fallback
- this matches the plan direction
- but if strict no-seed runtime is desired later, the fallback flags will need to be disabled and routes re-verified

6. Provider metadata is only partially unified
- search route currently reports LLM provider metadata even though search itself does not perform LLM reasoning
- this may be acceptable for status visibility, but it should be reviewed for semantic clarity

## Recommended Next Steps

1. Run targeted verification immediately before further edits
- `npm run test:run -- app/api/agents/select-top3/__tests__/route.test.ts`
- `npm run test:run -- features/agents/selection/__tests__/selectWinner.test.ts`
- `npm run test:run -- features/search/services/__tests__/ragSearch.test.ts`
- then broader route/service test sweep

2. Fix failing backend tests and type errors first
- align tests with:
  - shared schema validation
  - `selectionResult: null` possibility
  - transport-safe negotiation results
  - repository-based search path

3. Implement the frontend repository boundary
- add a frontend workflow repository layer calling:
  - `GET /api/workflow/status`
  - `POST /api/agents/search-and-select`
  - `POST /api/agents/negotiate/run`
  - `POST /api/agents/select-winner`

4. Replace the stub frontend hooks
- `useChatFlow` -> `useOpenvilleFlow`
- `useRankedResults` -> absorbed into the workflow hook or repository-backed helper

5. Adapt the active workspace UI
- keep the shell
- replace placeholder transcript/status/results behavior with real workflow state
- surface degraded/live mode visibly

6. Clean up old frontend mock contract files only after the new hook is wired
- otherwise the shell will lose its current data shape too early

## Suggested Resume Order

```text
backend verification
  -> test fixes
  -> frontend repository
  -> workflow hook
  -> active workspace wiring
  -> mock contract cleanup
```

## Other Notes

- The user interrupted while I was about to start the frontend workflow replacement. No frontend repository/hook files were created yet.
- I did not run tests, lint, or build after the backend edits.
- The branch is dirty from both pre-existing UI merge work and this session's backend-first integration edits. Be careful not to revert the UI shell work while finishing the backend integration.
