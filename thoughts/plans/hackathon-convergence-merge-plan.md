# Hackathon Convergence Plan: Frontend + Search + Selection + Negotiation

## Summary

Build the convergence branch from `origin/dev`, not from `main` or the current frontend branch.

Why:
- `origin/dev` already contains the merged selection + negotiation backend work.
- `feat/yirivera-landing` and `feat/frontend-contract-first-slice` are frontend-only descendants of the old split point.
- `origin/feature/search-and-ranking` is the remaining major backend stream that is not yet integrated.
- `feat/agent-top3-candidate-selection` is now superseded by `origin/dev` and should not be merged independently.

Primary goal:
- Minimize merge pain by converging on shared contracts and repository boundaries before wiring the frontend to real APIs.

Secondary goal:
- Preserve the frontend's mock-driven speed while making backend swap-in a repository concern, not a UI rewrite.

## Research Findings

### Current user journey

```text
Today
user request
  -> landing/chat UI transition
  -> mock chat repository
  -> mock search repository
  -> ranked candidate cards

Target hackathon flow
user request
  -> chat/context gathering
  -> ranked search
  -> top-3 selection
  -> negotiation loop
  -> booking/notification/review
```

### Relevant system layers

UI surface:
- `app/page.tsx`
- `features/chat/components/OpenvilleWorkspace.tsx`
- Landing/storytelling sections plus current search results UI

State/orchestration:
- `features/chat/hooks/useChatFlow.ts`
- `features/search/hooks/useRankedResults.ts`

Domain logic:
- Frontend branch uses shared contracts under `features/shared/contracts/`
- Search branch defines separate search types under `features/search/types/`
- Selection/negotiation branch defines its own selection `UserPreferences`, `Candidate`, `JobScope`, and negotiation types

Persistence/integrations:
- Frontend currently uses mock repositories
- Search branch adds `POST /api/search/ranked`
- `origin/dev` adds `POST /api/agents/select-top3`
- `origin/dev` also contains negotiation endpoints and Supabase-backed persistence

Observability/tests:
- Frontend branch has no meaningful automated tests yet
- Selection/negotiation branches add Vitest tests and route tests
- Search branch appears light on tests relative to risk

### Branch reality after fetch

Use these as source-of-truth streams:
1. `feat/yirivera-landing`
2. `origin/feature/search-and-ranking`
3. `origin/dev`

Reference only, do not merge directly:
1. `feat/frontend-contract-first-slice`
2. `feat/agent-top3-candidate-selection`
3. `origin/feat/agent-negotiation`

### Main coupling points and failure modes

Coupling points:
- `Candidate` shape
- `UserPreferences` shape
- search API response shape
- selection input shape
- negotiation input shape
- package manager + lockfile policy
- environment variable policy
- route naming and feature folder ownership

Failure modes:
- frontend renders fields search API does not return
- selection uses different candidate/preferences semantics than search/frontend
- negotiation depends on selection types that later drift
- merge from stale branches causes duplicate history and duplicated files
- multiple lockfiles create constant meaningless PR noise
- UI hooks begin importing backend-specific types directly, making later refactors expensive

## Decision

Adopt this canonical integration model:

```text
UI components
  -> feature hooks / orchestration
  -> repository interfaces
  -> mock implementations OR HTTP implementations
  -> app/api routes
  -> backend services / persistence
```

Rules:
- Components do not import branch-local backend types.
- Shared domain contracts live in `features/shared/contracts/`.
- Route-specific payload validation can live near the route/service, but must adapt into shared contracts before touching UI-facing code.
- Mock vs real is selected at repository level, never inside components.

## Public Interfaces And Type Decisions

### 1. Canonical `Candidate`

Keep `features/shared/contracts/Candidate.ts` as the UI-facing canonical candidate contract.

Required action:
- Make selection types re-export or consume this type instead of maintaining their own local shape.
- Search branch must adapt its `SearchResult` output into this shared `Candidate` shape before returning data to frontend repositories.

Reason:
- The current frontend already renders this contract.
- A current local file already points selection `Candidate` at this shared type, which is the right direction.
- Changing the frontend to the search branch's raw backend shape would spread backend assumptions into UI code.

### 2. Canonical `UserPreferences`

Evolve `features/shared/contracts/UserPreferences.ts` into the cross-feature normalized user-intent contract.

Final shared shape for convergence:
- `budgetPriority: "low_cost" | "balanced" | "premium"`
- `timeline: "asap" | "this_week" | "flexible"`
- `qualityPriority: "standard" | "high"`
- `notes: string`
- `maxBudget: number | null`
- `location?: string | null`
- `availability?: "any" | "weekdays" | "weekends" | null`
- `dealBreakers?: string[]`
- `preferredQualifications?: string[]`
- `minRating?: number | null`

Rules:
- Search service can derive its own ranking priority from this shared object.
- Selection/negotiation must import this shared type instead of their branch-local `UserPreferences`.
- Do not store separate frontend and backend preference contracts with the same conceptual meaning.

Trade-off:
- This shared contract becomes a normalized intent object, not a perfect mirror of any one backend algorithm's input.
- That is good. It keeps the UI stable and pushes translation logic to adapters.

### 3. Introduce shared `JobScope`

Create a shared contract for job scope under `features/shared/contracts/JobScope.ts`.

Initial shape:
- `serviceType: string`
- `description: string`
- `urgency?: string | null`
- `budget?: number | null`
- `location?: string | null`
- `constraints?: string[]`

Rules:
- Selection and negotiation should import this shared type.
- `useChatFlow` can derive it from request text plus normalized preferences later.
- Frontend does not need to expose all fields immediately, but the contract should exist now to stop branch-local drift.

### 4. Search route response

Keep the backend search internals free to use their richer shape, but the UI-facing repository response must stay aligned to:
- `RankedSearchResponse`
- `candidates: Candidate[]`
- `followUpQuestion: string | null`
- `appliedPreferences: UserPreferences`
- `resultCount: number`

Implementation rule:
- `app/api/search/ranked/route.ts` can return backend-native data internally, but the frontend HTTP repository must adapt it into `RankedSearchResponse`.
- Prefer an adapter in the frontend repository layer rather than forcing the backend branch to rename every internal field.

### 5. Selection route contract

Selection should accept:
- `top10: Candidate[]`
- `userPreferences: UserPreferences`
- `scope: JobScope`

Selection should return:
- `top3: Array<{ candidate: Candidate; reasoning: string; matchScore: number }>`
- `summary: string`

Rule:
- Keep this route contract, but replace branch-local imports with shared contracts.

### 6. Negotiation route contract

Negotiation start should accept:
- `buyerAgentId: string`
- `candidate: Candidate`
- `preferences: UserPreferences`
- `scope: JobScope`
- `jobId?: string`

Rule:
- Same shared imports as selection.
- Negotiation persistence types remain local to negotiation; only request/response boundary types become shared.

## Merge Strategy

### Base branch

Create a new integration branch from `origin/dev`.

Branch name:
- `integration/hackathon-convergence`

Do not base from:
- `main`
- `feat/yirivera-landing`
- `feat/frontend-contract-first-slice`

Reason:
- `origin/dev` already includes the backend work that would otherwise be duplicated.

### Merge order

1. Merge `origin/feature/search-and-ranking` into `integration/hackathon-convergence`.
2. Refactor search contracts and adapters immediately before touching frontend.
3. Merge `feat/yirivera-landing`.
4. Refactor frontend repositories to call real routes behind the existing interfaces.
5. Do not merge `feat/frontend-contract-first-slice` separately.
6. Do not merge `feat/agent-top3-candidate-selection` separately.

Reason for this order:
- Search branch introduces the largest contract mismatch with the current frontend.
- Frontend should land last so its UI can be wired against stabilized repository interfaces rather than unstable route shapes.

## Refactor Plan By Phase

### Phase 1: Convergence groundwork

Goal:
- Establish shared contracts and toolchain policy before resolving business logic conflicts.

Tasks:
1. Standardize on one tracked package manager.
2. Add Vitest to the root toolchain because backend branches already depend on it.
3. Unify `.env.local.example` so selection + negotiation + future search settings live in one place.
4. Create or finalize shared contracts:
   - `Candidate`
   - `UserPreferences`
   - `JobScope`
   - `SearchContracts`
5. Remove duplicate branch-local conceptual contracts where shared ones exist.
6. Keep backend-internal schemas local when they are persistence- or prompt-specific.

Package-manager decision:
- Use `pnpm` as the canonical tracked package manager.
- Remove `package-lock.json` from convergence work.
- Keep only one tracked lockfile after convergence.
- If the team insists on npm later, switch once, repo-wide. Do not carry both.

Why `pnpm`:
- The repo already tracks `pnpm-lock.yaml`.
- The frontend branch is already carrying it.
- Multiple lockfiles are pure merge-noise in a hackathon.

### Phase 2: Search integration boundary

Goal:
- Make search consumable by the current frontend without rewriting the UI.

Tasks:
1. Keep backend search logic in `features/search/services/`.
2. Keep backend-native search types local if useful for internals.
3. Add an adapter from backend `SearchResult` to shared `Candidate`.
4. Add an HTTP implementation of `SearchRepository` that calls `POST /api/search/ranked`.
5. Ensure the frontend hook `useRankedResults` depends only on `SearchRepository`, not on route payload specifics.
6. Preserve current `CandidateResults` and `CandidateCard` inputs.

Mapping requirements for search adapter:
- `agentId -> agentId`
- `name -> name`
- `description -> summary`
- `services -> specialties`
- `hourlyRate -> startingPrice`
- `location -> locationLabel`
- `rating -> rating`
- `successCount -> successCount`
- `relevance -> relevance`
- `score -> score`
- `yearsOnPlatform` maps to either:
  - new optional display metadata on shared contract, or
  - stays internal if UI does not use it
- Missing UI fields must be synthesized predictably:
  - `headline` from primary service + location
  - `availabilityLabel` from preference/default text
  - `reviewCount` from available data or a clearly named placeholder strategy
- Do not let UI components branch on search-source-specific null patterns.

Decision:
- Put search-to-UI shaping in the repository adapter, not in React components.

### Phase 3: Frontend repository split

Goal:
- Preserve mock-driven speed while allowing incremental backend adoption.

Repository set after convergence:
- `ChatRepository`
- `SearchRepository`
- `SelectionRepository`
- `NegotiationRepository`

Each repository gets:
- `mock` implementation
- `http` implementation
- shared interface

Rules:
- `useChatFlow` stays the orchestration layer for request submission.
- New selection and negotiation hooks can be added later, but the first convergence step only needs repository boundaries in place.
- The active UI should still function fully with mocks if a backend service is unavailable.

Decision:
- Use dependency injection at hook level or module-level export swap, but keep one consistent pattern repo-wide.
- Recommended default: keep current simple default-export pattern with explicit repository interface parameters for testability.

### Phase 4: Selection + negotiation contract convergence

Goal:
- Eliminate duplicate type families across backend streams.

Tasks:
1. Replace selection `Candidate` import with shared `Candidate`.
2. Replace selection `UserPreferences` import with shared `UserPreferences`.
3. Replace selection `JobScope` import with shared `JobScope`.
4. Do the same for negotiation route/request types.
5. Keep negotiation DB entities local.
6. Keep prompt schemas local.
7. Ensure selection output still references shared `Candidate`.

Decision:
- Shared contracts define inter-module payloads.
- Negotiation DB models and prompt parsing schemas stay feature-local.

### Phase 5: Frontend merge and wiring

Goal:
- Land the UI on top of converged services without broad component churn.

Tasks:
1. Merge `feat/yirivera-landing`.
2. Keep `app/page.tsx` rendering `OpenvilleWorkspace`.
3. Keep landing/story mode and active mode behavior from the frontend branch.
4. Replace current mock-only search call path with repository-selected mock/http behavior.
5. Keep current components stable:
   - `OpenvilleWorkspace`
   - `RequestComposer`
   - `MessageList`
   - `FollowUpPrompt`
   - `CandidateResults`
   - `CandidateCard`
6. Do not wire top-3 or negotiation into visible UI in this convergence pass unless required for demo.
7. Instead, prepare the state boundary so those steps can be inserted after ranked search.

Reason:
- This optimizes for low merge pain, not for fully exposing every backend step immediately.

### Phase 6: Integration hardening

Goal:
- Make the merged branch safe for parallel hackathon work.

Tasks:
1. Add route contract tests for search similar to selection route tests.
2. Add adapter tests for:
   - search backend result -> shared `Candidate`
   - shared `UserPreferences` -> ranking input expectations if needed
3. Add orchestration tests for frontend hook behavior:
   - request success
   - search empty
   - search error
4. Add one smoke integration test for:
   - request -> ranked search -> render results
5. Add one contract consistency test asserting:
   - selection and negotiation request types import shared contracts
   - no duplicate `Candidate` or `UserPreferences` interfaces remain in feature-local public boundaries

## Conflict Resolution Rules

When merging `origin/feature/search-and-ranking`:
- Keep backend service logic.
- Do not keep its `features/search/types/index.ts` as the frontend boundary.
- Adapt it into shared contracts instead.

When merging `feat/yirivera-landing`:
- Keep the UI structure and storytelling components.
- Keep current frontend shared contracts as the source of truth, then evolve them deliberately.
- Do not let backend route payloads leak into components.

When encountering duplicate type files:
- Shared contract wins for cross-feature payloads.
- Feature-local contract wins only for internal-only logic.

When encountering route shape disagreements:
- Preserve backend capability internally.
- Add adapter at repository boundary.
- Do not rewrite UI around raw backend payloads.

When encountering selection/negotiation imports from `features/agents/selection/types/UserPreferences.ts`:
- Replace with shared contract import.
- Delete or narrow the local type if no longer needed.

## Testing And Acceptance Criteria

### Required tests

Search:
- valid query returns ranked candidates
- empty query returns `400`
- repository adapter maps backend search result into shared `Candidate`
- frontend handles empty search response
- frontend handles route failure and retry

Selection:
- route accepts shared `Candidate[]`, shared `UserPreferences`, shared `JobScope`
- invalid candidate ids from LLM still fail safely
- less than 3 candidates returns `400`

Negotiation:
- route accepts shared contracts
- one candidate failure does not break batch negotiation outcome reporting
- persistence mapping remains isolated from shared contract changes

Frontend:
- story mode to active mode transition still works
- mock mode still works if HTTP repositories are disabled
- active results UI renders adapted backend search data without component changes
- long text and missing optional fields do not break cards
- mobile layout still works for active results

### Acceptance criteria

The convergence branch is complete when:
1. `integration/hackathon-convergence` contains `origin/dev`, search, and frontend work.
2. Frontend components compile against shared contracts only.
3. Search results can come from either mock or HTTP repository without UI changes.
4. Selection and negotiation import shared boundary types.
5. Only one tracked package-manager lockfile remains.
6. The merged branch can demo:
   - request submission
   - result ranking
   - stable contract path for top-3 and negotiation next steps

## Risks And Mitigations

Risk:
- search branch raw fields do not satisfy current UI card requirements

Mitigation:
- repository adapter synthesizes UI-facing fields predictably

Risk:
- selection/negotiation semantics need richer preference data than the current frontend captures

Mitigation:
- shared `UserPreferences` becomes normalized and extensible; missing fields are optional with explicit defaults

Risk:
- the frontend branch has uncommitted work

Mitigation:
- do convergence work on a new integration branch after preserving the current branch state; do not force-reset or rebase the in-progress branch

Risk:
- `origin/dev` may continue moving during the hackathon

Mitigation:
- use short-lived convergence PRs/slices:
  - contracts/tooling
  - search boundary
  - frontend wiring

## Implementation Sequence

1. Fetch latest remotes.
2. Create `integration/hackathon-convergence` from `origin/dev`.
3. Merge `origin/feature/search-and-ranking`.
4. Resolve search boundary via shared contracts + adapters.
5. Standardize package manager, env example, and test tooling.
6. Merge `feat/yirivera-landing`.
7. Replace mock-only search path with repository-selected mock/http implementations.
8. Converge selection/negotiation imports to shared contracts.
9. Add missing tests.
10. Open follow-up slice for visible top-3/negotiation UI only after the convergence branch is stable.

## Assumptions And Defaults

- Planning scope includes only branches discoverable after fetch:
  - `feat/yirivera-landing`
  - `origin/feature/search-and-ranking`
  - `origin/dev`
- `origin/dev` is the correct backend integration base because it already includes selection and negotiation PRs.
- `feat/frontend-contract-first-slice` is superseded by `feat/yirivera-landing`.
- `feat/agent-top3-candidate-selection` is superseded by `origin/dev`.
- The first convergence pass optimizes for merge safety and stable boundaries, not for exposing every backend step in the UI immediately.
- Mock support remains a hard requirement during the hackathon.
- Shared contracts are the canonical inter-team boundary; feature-local types are allowed only for internal implementation details.

## Interview Angle

What:
- Introduce a contract-first integration layer and use repository adapters to merge independently developed frontend, search, selection, and negotiation streams.

Why:
- Multiple branches diverged from an old base and evolved different payload shapes. A direct merge would have spread backend assumptions into the UI and created repeated refactor churn.

Trade-offs:
- Accept some adapter code and a slightly richer shared contract to avoid broader component rewrites and to keep hackathon velocity high.

Interview angle:
- "I optimized for integration stability under parallel development. I separated UI contracts from backend-native payloads, converged shared types, and used repository boundaries so mock and real implementations could coexist while the team merged backend work incrementally."
