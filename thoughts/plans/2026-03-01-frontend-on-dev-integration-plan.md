# Backend-First Frontend Integration Plan

Date: 2026-03-01
Branch: `integration/frontend-on-dev`
Research basis: `thoughts/research/2026-03-01-frontend-on-dev-integration-research.md`

## Summary

Build a real backend-to-frontend workflow for Steps 1-7 while removing mock dependencies from the active runtime path.

Authoritative rule for this branch:

```text
frontend adapts to finalized backend contracts
  -> backend functionality is preserved
  -> active path uses real persistence-backed data and real route orchestration
  -> any fallback is explicit in API responses and visible in the UI
```

This replaces the earlier March 1 plan in three material ways:

- replacing mock tradespeople and mock embeddings is now in scope for the active path
- the frontend should use the existing backend workflow route for Steps 3-5: `POST /api/agents/search-and-select`
- backend contract drift must be normalized before wiring the frontend, because the current negotiation/search/selection boundary is not safe enough to expose as-is

## Success Criteria

- the landing page transitions into the active workspace and submits a real workflow request
- the active path for search uses a Supabase-backed market dataset, not `features/search/data/mockTradespeople.ts`
- the frontend no longer depends on `features/shared/contracts/*` for workflow data
- the frontend uses real backend routes for search + shortlist + negotiation + winner selection
- fallback behavior is explicit:
  - backend responses declare whether they ran live or degraded
  - the workspace renders that status clearly
- existing backend functionality is preserved:
  - `POST /api/search/ranked`
  - `POST /api/agents/search-and-select`
  - `POST /api/agents/select-top3`
  - `POST /api/agents/select-winner`
  - existing single-negotiation routes
- Steps 8-10 remain out of scope for this branch

## User Journey

```text
landing request
  -> transition into active workspace
  -> local transcript records the request
  -> workflow status is read from backend
  -> structured context form is shown and prefilled from current request state
  -> search-and-select runs against backend
  -> ranked results + top-3 shortlist render
  -> user triggers batch negotiation
  -> backend runs negotiations for all finalists
  -> negotiation outcomes render with live/degraded badges
  -> user triggers winner selection
  -> backend selects winner
  -> winner summary renders
```

## System Layers

### UI Surface

Keep the redesigned landing/workspace shell as the presentation source.

The active workspace will contain these functional panels:

- request composer
- local transcript
- context form and context summary
- system status / fallback indicator
- ranked candidate board
- top-3 shortlist summary
- negotiation outcomes summary
- winner summary

The transcript stays local-only. There is no fake chat backend.

### State / Orchestration

Replace `useChatFlow` and `useRankedResults` with one workflow hook:

- `useOpenvilleFlow`

It owns:

- request input
- local transcript
- context form
- workflow status
- search-and-select state
- negotiation state
- winner selection state
- retry / rerun / reset behavior

### Domain Logic

Backend contracts stay canonical.

Frontend-only contracts under `features/shared/contracts/*` are not canonical and should be removed from the active path.

The frontend may keep explicit view models, but only after backend responses are adapted at the boundary.

### Persistence / Integrations

Search must move from in-memory TypeScript data to Supabase-backed market data.

Negotiation persistence remains in Supabase.

LLM and embedding providers remain backend integrations, but fallback behavior becomes explicit instead of silent.

### Observability / Tests

Every workflow route should expose execution metadata describing:

- data source used
- retrieval mode used
- LLM provider used
- whether fallback was used
- warnings / degraded reasons

The UI must surface that metadata.

## Key Decisions

### 1. Use `POST /api/agents/search-and-select` as the primary frontend entrypoint for Steps 3-5

What:
- the frontend calls the existing combined backend route instead of manually chaining `/api/search/ranked` and `/api/agents/select-top3`

Why:
- backend remains authoritative
- that route already owns the intended orchestration

Trade-offs:
- slightly less granular client-side stage separation during search vs selection

Interview angle:
- "We integrated against the backend's existing workflow boundary instead of reproducing backend orchestration in the browser."

### 2. Add a new batch negotiation route and keep the existing per-negotiation routes

What:
- add `POST /api/agents/negotiate/run` for Step 6
- preserve `start`, `message`, `propose`, and `cancel`

Why:
- the frontend needs a workflow-grade API for all finalists
- existing routes are session-level primitives

Trade-offs:
- one new route plus normalization work in negotiation contracts

Interview angle:
- "We added a thin workflow route without deleting lower-level primitives, so product flow and backend composability both remained intact."

### 3. Normalize backend contracts before frontend wiring

What:
- unify `UserPreferences`, `JobScope`, negotiation transport types, and winner-selection date handling

Why:
- current drift will cause runtime bugs even if TypeScript passes

Trade-offs:
- more backend cleanup up front
- less brittle integration later

Interview angle:
- "We fixed the contract boundary first because integration code on top of drifting schemas just hides bugs."

### 4. Replace runtime mocks with a persistence-backed market source

What:
- search reads from Supabase, not `mockTradespeople` or generated mock embeddings

Why:
- "active-path only" mock removal changes the backend architecture, not just the UI

Trade-offs:
- more backend work now
- the system becomes defendably real

Interview angle:
- "We moved sample data to seed/setup only, and made runtime retrieval come from real persistence."

### 5. Make fallback explicit, never silent

What:
- route responses and a status endpoint report live vs degraded execution

Why:
- developers need to know when the system is using fallback behavior

Trade-offs:
- slightly more API surface and UI state

Interview angle:
- "We treated fallback as an observable system mode, not an invisible implementation detail."

## Public APIs, Interfaces, and Type Changes

### New Route: `GET /api/workflow/status`

Purpose:
- tell the frontend whether the backend is live, degraded, or unavailable before and during execution

Response shape:

```ts
interface WorkflowStatusResponse {
  readiness: "live" | "degraded" | "unavailable";
  marketData: {
    source: "supabase";
    candidateCount: number;
    seeded: boolean;
    ready: boolean;
  };
  retrieval: {
    mode: "vector" | "keyword";
    embeddingProvider: "openai" | "unconfigured";
    ready: boolean;
    fallbackAllowed: boolean;
  };
  llm: {
    provider: "openai" | "openrouter" | "mock" | "unconfigured";
    ready: boolean;
    fallbackAllowed: boolean;
  };
  warnings: string[];
}
```

### Existing Route to Keep and Extend: `POST /api/agents/search-and-select`

Request shape:

```ts
interface SearchAndSelectRequest {
  query: string;
  userPreferences: UserPreferences;
  scope: JobScope;
  limit?: number;
}
```

Response shape:

```ts
interface WorkflowExecutionMeta {
  mode: "live" | "degraded";
  dataSource: "supabase";
  retrievalMode: "vector" | "keyword";
  llmProvider: "openai" | "openrouter" | "mock";
  fallbacksUsed: Array<"keyword_search" | "mock_llm">;
  warnings: string[];
}

interface SearchAndSelectResponse {
  searchResults: Candidate[];
  selectionResult: SelectTop3Response;
  meta: WorkflowExecutionMeta;
}
```

Decision:
- `limit` must be honored rather than ignored

### New Route: `POST /api/agents/negotiate/run`

Request shape:

```ts
interface RunNegotiationsRequest {
  buyerAgentId: string;
  candidates: SelectedCandidate[];
  preferences: UserPreferences;
  scope: JobScope;
  jobId?: string;
  providerType?: "openai" | "openrouter" | "mock";
  maxRounds?: number;
}
```

Response shape:

```ts
interface NegotiationOutcomeTransport {
  negotiationId: string;
  candidateId: string;
  status: "completed" | "rejected" | "failed" | "cancelled";
  result?: TransportNegotiationResult;
  summary?: string;
}

interface RunNegotiationsResponse {
  outcomes: NegotiationOutcomeTransport[];
  meta: WorkflowExecutionMeta;
}
```

Decisions:
- rejected proposals become `rejected`, not generic `failed`
- `maxRounds` must be implemented rather than left unused

### Existing Route to Normalize: `POST /api/agents/select-winner`

Request shape:

```ts
interface TransportNegotiationResult {
  id: string;
  negotiationId: string;
  proposedBy: string;
  finalPrice?: number;
  scope?: {
    description?: string;
    rooms?: number;
    details?: Record<string, unknown>;
  };
  status: "accepted" | "rejected" | "pending";
  responseMessage?: string;
  createdAt: string;
}

interface SelectWinnerRequest {
  negotiations: Array<{
    result: TransportNegotiationResult;
    candidateId: string;
  }>;
  userPreferences: UserPreferences;
  providerType?: "openai" | "openrouter" | "mock";
}
```

Server behavior:
- normalize `createdAt` string to `Date` before prompt building
- validate request with Zod
- return execution `meta`

### Canonical Backend Types

These remain the single backend truth for workflow contracts:

- `Candidate`
- `UserPreferences`
- `JobScope`
- `SelectedCandidate`
- `SelectTop3Request`
- `SelectTop3Response`
- transport-safe negotiation request/response schemas

### Frontend View Models

These are allowed because they are presentation-only:

```ts
interface CandidateCardViewModel {
  agentId: string;
  name: string;
  scoreLabel: string;
  headline?: string;
  summary: string;
  specialties: string[];
  ratingLabel: string;
  pricingLabel: string;
  availabilityLabel: string;
  locationLabel: string;
  trackRecordLabel: string;
}
```

```ts
interface ContextFormState {
  budget?: number;
  priority?: "cost" | "quality" | "speed" | "rating";
  dealBreakers: string[];
  preferredQualifications: string[];
  minRating?: number;
  location?: string;
  availability?: "any" | "weekdays" | "weekends";
  urgency?: "asap" | "flexible" | "scheduled";
  estimatedDuration?: string;
}
```

```ts
interface WorkflowMessage {
  id: string;
  role: "user" | "system";
  content: string;
  timestamp: string;
  status?: "sent" | "pending" | "error";
}
```

## Backend Changes

### 1. Normalize Contract Drift

Unify these backend contracts first:

- `UserPreferencesSchema` used by search, selection, and negotiation
- `JobScopeSchema` used by selection and negotiation
- transport negotiation result schema for API requests
- winner-selection input validation

Chosen canonical `JobScope.urgency`:

- `"asap" | "flexible" | "scheduled"`

Decisions:

- `SelectTop3Response.negotiationIds` is removed from the active contract unless the backend truly populates it
- `limit` is honored in `search-and-select`

### 2. Replace Mock Search Data

Add a Supabase-backed market table, e.g.:

- `market_candidates`

Required fields:

- `agent_id`
- `name`
- `description`
- `services`
- `specialties`
- `location`
- `hourly_rate`
- `base_price`
- `success_count`
- `rating`
- `years_on_platform`
- `years_experience`
- `availability`
- `certifications`
- `response_time`
- `tags`
- `embedding`
- timestamps

Chosen search storage design:

- use Supabase/Postgres with `pgvector`
- store candidate embeddings in the database
- query top candidates through vector similarity first
- apply ranking as the second-stage scorer

Seed strategy:

- current sample corpus may be imported once into Supabase as dev seed data
- runtime code must not import `mockTradespeople` anymore

### 3. Replace Mock Embedding Generation

Current issue:

- `features/search/services/embedding.ts` uses `generateMockEmbedding`

Chosen replacement:

- primary embedding provider: OpenAI embeddings
- if embedding provider is unavailable, backend performs explicit keyword fallback
- keyword fallback is marked as degraded in route metadata

Result:

- no fake embeddings in the active path
- no silent failure
- local/dev remains usable

### 4. Keep Search Route Surface but Repoint Internals

Keep:

- `POST /api/search/ranked`

Change:

- it reads from the new Supabase-backed market source
- it returns the same candidate family plus `meta`

Purpose:

- preserve backend functionality
- allow lower-level debugging and tests outside the combined workflow route

### 5. Tighten Negotiation Orchestration

Refactor `runNegotiations` so it is safe to expose through `POST /api/agents/negotiate/run`.

Required fixes:

- stop relying on undeclared ad hoc `estimatedPrice`
- either derive proposal amount from candidate pricing + preferences, or require `targetPrice` in the request
- chosen default: derive from `preferences.budget ?? candidate.basePrice ?? candidate.hourlyRate ?? null`; if none exist, mark the candidate negotiation as `failed` with explicit reason
- implement `maxRounds`
- distinguish `rejected` from `failed`
- return transport-safe outcome objects

### 6. Preserve Existing Single-Negotiation Routes

Keep unchanged in purpose:

- `POST /api/agents/negotiate/start`
- `GET /api/agents/negotiate/[id]`
- `POST /api/agents/negotiate/[id]/message`
- `POST /api/agents/negotiate/[id]/propose`
- `POST /api/agents/negotiate/[id]/cancel`

Normalize them only where needed to share canonical schemas and metadata.

## Frontend Changes

### 1. Remove Frontend-Owned Workflow Contracts from the Active Path

Do not use these as workflow truth anymore:

- `features/shared/contracts/Candidate.ts`
- `features/shared/contracts/UserPreferences.ts`
- `features/shared/contracts/SearchContracts.ts`

These can be deleted or replaced with view-model-only files.

### 2. Introduce a Backend-Aligned Repository Boundary

Chosen frontend boundary:

- `openvilleWorkflowRepository.searchAndSelect`
- `openvilleWorkflowRepository.runNegotiations`
- `openvilleWorkflowRepository.selectWinner`
- `openvilleWorkflowRepository.getStatus`

The repository talks only to backend HTTP routes and returns parsed backend contracts plus metadata.

### 3. Replace Stub Hooks

Replace:

- `useChatFlow`
- `useRankedResults`

With:

- `useOpenvilleFlow`

State machine:

```text
story
  -> activating
  -> active.idle
  -> active.searching
  -> active.searchReady
  -> active.negotiating
  -> active.negotiationReady
  -> active.selectingWinner
  -> active.winnerReady
  -> active.error
```

### 4. Make Step 2 Real Through a Structured Context Form

Chosen interaction:

- initial request still triggers the transition into active workspace
- the context form is visible immediately in the active workspace
- the form is prefilled from the initial request using:
  - `scope.description = query`
  - `scope.jobType = query`
  - sane defaults for optional preferences until the user edits them
- the first search-and-select does not run until the user explicitly submits the context form
- editing the form does not auto-fire requests
- user explicitly clicks `Run market` for the first search and `Rerun market` for later refreshes

Reason:

- preserves the current landing-to-active motion
- makes Step 2 genuinely user-editable before backend execution
- keeps backend contracts explicit

### 5. Adapt UI Components Through View Models

Keep presentational components when reasonable, but adapt their inputs.

Examples:

- `CandidateCard` should consume `CandidateCardViewModel`, not frontend fake domain types
- `FollowUpPrompt` should become a context/status panel driven by backend-aligned form state
- `MessageList` can keep local transcript messages
- add required panels for shortlist, negotiation outcomes, and winner summary

### 6. Surface System Status and Fallbacks

The workspace must visibly render:

- backend readiness
- whether retrieval ran in `vector` or `keyword` mode
- which LLM provider executed
- whether any fallback was used
- why degraded mode occurred

This should be visible in:

- a compact status panel fed by `GET /api/workflow/status`
- per-stage result badges fed by route response `meta`

## Coupling Points and Failure Modes

### Coupling Points

- search candidate type used by ranking, selection, negotiation prompts, and candidate cards
- `UserPreferences` shared across search, selection, negotiation, and winner choice
- `JobScope` shared across selection and negotiation
- negotiation results reused by winner selection
- fallback metadata consumed by both backend tests and frontend rendering

### Failure Modes to Handle Explicitly

- Supabase market table is empty
- embedding provider is unconfigured
- embedding request fails mid-search
- LLM provider is unconfigured
- mock LLM fallback is disallowed
- fewer than 3 candidates survive ranking
- one finalist negotiation fails while others succeed
- all finalist negotiations fail
- winner selection receives string dates
- backend returns degraded mode and the frontend hides it
- frontend reruns search with stale shortlist or stale winner state

## Rejected Alternatives

### Frontend-only adaptation with no backend normalization

Rejected because current negotiation/search drift will still fail at runtime.

### Strict no-fallback runtime

Rejected because it makes local and dev environments brittle and blocks integration testing.

### Frontend loops three times over `/negotiate/start` and `/propose`

Rejected because it leaks backend orchestration into the browser and makes Step 6 harder to defend and test.

## Implementation Phases

### 1. Backend contract normalization

Deliverables:

- shared Zod schemas for `UserPreferences`, `JobScope`, and transport negotiation payloads
- `select-winner` request validation
- `search-and-select` request validation
- `limit` behavior corrected
- stale `negotiationIds` removed or implemented

### 2. Real market data backend

Deliverables:

- Supabase migration for `market_candidates`
- seed/import path for dev data
- repository for candidate retrieval
- pgvector-backed search path
- keyword degraded fallback path
- response metadata

### 3. Negotiation workflow route

Deliverables:

- refactored `runNegotiations`
- `POST /api/agents/negotiate/run`
- explicit live/degraded metadata
- transport-safe outcome types

### 4. Frontend workflow boundary

Deliverables:

- repository for status/search-select/negotiate/winner
- `useOpenvilleFlow`
- removal of stubbed `useChatFlow` / `useRankedResults`
- local transcript retained

### 5. Frontend active workspace integration

Deliverables:

- context form
- status panel
- candidate board adapters
- shortlist panel
- negotiation outcomes panel
- winner summary panel

### 6. Verification and cleanup

Deliverables:

- tests updated and passing
- dead mock contracts removed from active path
- docs updated so developers know when the system is live vs degraded

## Test Cases and Scenarios

### Backend Unit Tests

- unified `UserPreferencesSchema` accepts the fields used by search, selection, and negotiation
- unified `JobScopeSchema` accepts `"asap" | "flexible" | "scheduled"`
- winner selection normalizes `createdAt` strings safely
- `runNegotiations` returns `rejected` distinctly from `failed`
- proposal amount derivation behaves correctly for:
  - budget present
  - base price only
  - hourly rate only
  - no usable price source

### Backend Route Tests

- `GET /api/workflow/status` returns `live`
- `GET /api/workflow/status` returns `degraded` when embeddings are unavailable
- `POST /api/search/ranked` uses Supabase-backed data
- `POST /api/search/ranked` returns keyword degraded metadata when embeddings fail
- `POST /api/agents/search-and-select` returns 400 for invalid request bodies
- `POST /api/agents/search-and-select` returns explicit degraded metadata when mock LLM fallback is used
- `POST /api/agents/negotiate/run` returns partial success when one candidate fails
- `POST /api/agents/negotiate/run` returns explicit error when all candidates fail
- `POST /api/agents/select-winner` accepts transport-safe negotiation payloads with string dates

### Frontend Unit / Integration Tests

- initial landing submission transitions to active workspace and reveals the prefilled context form without triggering search-and-select yet
- first market run only starts after explicit context form submission
- context form reruns the market only on explicit submit
- status panel shows live vs degraded mode correctly
- candidate board renders from backend candidates via adapter without relying on fake frontend contract fields
- shortlist panel renders top 3 from backend response
- negotiation panel renders partial failures without collapsing the whole flow
- winner panel renders selected candidate and reasoning
- retry resets only the failed stage, not the whole workspace
- degraded fallback badges are visible whenever backend metadata indicates fallback

### End-to-End Scenario

- user enters a request
- workspace activates
- backend status shows live or degraded
- search-and-select returns ranked results + top 3
- user adjusts context and reruns
- user starts batch negotiation
- negotiation outcomes render
- user selects winner
- winner summary renders with backend reasoning
- no step uses `features/shared/contracts/*` or runtime mock search data

## Assumptions and Defaults

- Steps 8-10 remain out of scope
- the transcript is local UI state, not persisted chat history
- Supabase is the real candidate source for this branch
- dev seed data is allowed, but only as database seed/setup content, never as runtime TypeScript mock imports
- OpenAI embeddings are the primary embedding provider
- OpenAI or OpenRouter are the primary LLM providers
- mock LLM is allowed only as an explicit fallback mode and must be surfaced in both API metadata and UI status
- if no real LLM provider is configured and mock fallback is disabled, reasoning routes return an explicit failure instead of silently degrading
- the frontend adapts to backend contracts; the backend is not reshaped to preserve the redesign branch's fake contracts
