# Frontend On Dev Integration Research

Date: 2026-03-01
Branch: `integration/frontend-on-dev`

## Summary

The correct baseline is the current `dev` head, not `feat/redesign-landing-page`.

Why:
- `dev` now contains the working backend route surface for search, shortlist selection, negotiation, and winner selection.
- `feat/redesign-landing-page` contains the user-facing UI, but its orchestration and shared contracts are mock-shaped and diverge from the backend contracts now present on `dev`.
- The integration problem is not mainly visual. The real work is preserving the frontend experience while adapting it to the current backend structure without breaking working routes.

## Current Repo Truth

### Working backend surface on `dev`

Implemented routes:
- `POST /api/search/ranked`
- `POST /api/agents/search-and-select`
- `POST /api/agents/select-top3`
- `POST /api/agents/select-winner`
- `POST /api/agents/negotiate/start`
- `GET /api/agents/negotiate/[id]`
- `POST /api/agents/negotiate/[id]/message`
- `POST /api/agents/negotiate/[id]/propose`
- `POST /api/agents/negotiate/[id]/cancel`

Key files:
- `app/api/search/ranked/route.ts`
- `app/api/agents/search-and-select/route.ts`
- `app/api/agents/select-top3/route.ts`
- `app/api/agents/select-winner/route.ts`
- `app/api/agents/negotiate/start/route.ts`
- `app/api/agents/negotiate/[id]/route.ts`
- `app/api/agents/negotiate/[id]/message/route.ts`
- `app/api/agents/negotiate/[id]/propose/route.ts`
- `app/api/agents/negotiate/[id]/cancel/route.ts`

### Current frontend state on `dev`

The app page is still the default Next.js placeholder.

Key files:
- `app/page.tsx`
- `app/layout.tsx`
- `app/globals.css`

### What `feat/redesign-landing-page` adds

- full landing-to-workspace UI
- chat-style request surface
- candidate board UI
- landing storytelling sections
- theme system and motion
- mock repositories and frontend-only shared contracts

Key files:
- `features/chat/components/OpenvilleWorkspace.tsx`
- `features/chat/hooks/useChatFlow.ts`
- `features/search/components/CandidateResults.tsx`
- `features/search/components/CandidateCard.tsx`
- `features/shared/repositories/chatRepository.ts`
- `features/shared/repositories/searchRepository.ts`
- `features/shared/contracts/Candidate.ts`
- `features/shared/contracts/UserPreferences.ts`

## Actual Current User Journey

Today, the repo supports an API-first backend flow, not a product-ready frontend flow.

```text
request payload
  -> search route or search-and-select route
  -> RAG search on mock tradespeople data
  -> ranking
  -> LLM top-3 selection
  -> optional negotiation routes
  -> winner selection
```

There is no real user-facing request flow yet on `dev`.

Missing from the intended product flow:
- Step 1 user request UI
- Step 2 context gathering UI and preferences retrieval
- Step 8 transaction
- Step 9 notification
- Step 10 reviews

## System Layers

### UI surface

Current `dev`:
- placeholder only

Frontend branch:
- preserves the strongest user-facing experience and should be treated as the UI source

Preserve:
- `features/chat/components/OpenvilleWorkspace.tsx`
- `features/landing/components/*`
- `features/search/components/*`
- `features/chat/components/RequestComposer.tsx`
- `features/chat/components/MessageList.tsx`
- `features/chat/components/FollowUpPrompt.tsx`
- `app/openville-theme.css`

### State / orchestration

Frontend branch currently orchestrates the flow in:
- `features/chat/hooks/useChatFlow.ts`
- `features/search/hooks/useRankedResults.ts`

Current problem:
- both default to mock repositories
- no adapters exist from UI input to current backend route contracts

### Domain logic

Current backend contracts live in:
- `features/search/types/index.ts`
- `features/agents/selection/types/Candidate.ts`
- `features/agents/selection/types/UserPreferences.ts`
- `features/agents/selection/types/JobScope.ts`
- `features/agents/negotiation/schemas/NegotiationSchemas.ts`

Current frontend branch introduces a parallel contract layer under:
- `features/shared/contracts/*`

This is the main integration risk.

### Persistence / integrations

Negotiation persistence exists via Supabase:
- `features/agents/negotiation/db/SupabaseNegotiationRepository.ts`
- `lib/supabase/server.ts`
- `supabase/migrations/20260228000000_create_negotiation_tables.sql`

Search is not true production RAG yet:
- embeddings and tradespeople data are mock-backed
- the route surface exists, but the data source is still mock infrastructure

### Observability / tests

Existing backend-focused tests exist on `dev`, including search, selection, negotiation, and integration-flow test files.

Current local environment issue:
- `npm run test:run` failed before discovery because `vitest` is not installed locally
- this is an environment problem, not application validation

## Reusable Code To Keep

Backend and orchestration primitives to reuse:
- `features/search/services/ragSearch.ts`
- `features/search/services/ranking.ts`
- `features/agents/selection/selectTop3.ts`
- `features/agents/selection/selectWinner.ts`
- `features/agents/negotiation/negotiate.ts`
- `features/agents/negotiation/runNegotiations.ts`

Frontend UI to reuse:
- `features/chat/components/OpenvilleWorkspace.tsx`
- `features/landing/components/*`
- `features/search/components/CandidateResults.tsx`
- `features/search/components/CandidateCard.tsx`
- `hooks/useInView.ts`
- `hooks/useStepTrigger.tsx`

## Coupling Points And Failure Modes

### 1. Candidate type drift

Backend candidate shape on `dev` is broad and backend-oriented.
Frontend branch candidate shape is narrower and presentation-oriented.

Risk:
- if the frontend branch replaces backend candidate contracts directly, selection and negotiation code will break

### 2. User preferences drift

Backend `dev`:
- `budget`
- `priority`
- `dealBreakers`
- `preferredQualifications`
- `minRating`
- `location`
- `availability`

Frontend branch:
- `budgetPriority`
- `timeline`
- `qualityPriority`
- `notes`
- `maxBudget`

Risk:
- no direct compatibility
- this requires an adapter, not a blind merge

### 3. Job scope drift

Backend selection type:
- `jobType`
- `description`
- `location`
- `urgency`
- `estimatedDuration`

Negotiation schema:
- accepts a different urgency vocabulary
- includes fields like `rooms`

Risk:
- frontend can be type-correct against TS interfaces but still fail backend validation

### 4. Mock-first frontend assumptions

Frontend branch assumes:
- mock chat repository
- mock search repository
- frontend-owned follow-up question and preferences inference

Risk:
- if merged directly, the active flow remains fake even though backend routes now exist

### 5. Repo-level regression risk

`feat/redesign-landing-page` removes or conflicts with:
- backend-related dependencies in `package.json`
- `package-lock.json`
- `vitest.config.ts`
- test scripts
- `.env.local.example`

Risk:
- merging branch tips naively can break the backend toolchain or silently remove validation

## Likely Merge Hotspots

Direct conflict risk:
- `.gitignore`
- `package.json`
- `features/agents/selection/types/Candidate.ts`

Semantic conflict risk:
- `app/page.tsx`
- `app/layout.tsx`
- `app/globals.css`
- `app/api/search/ranked/route.ts`
- `app/api/agents/search-and-select/route.ts`
- `features/search/types/index.ts`
- `features/agents/selection/types/UserPreferences.ts`
- `features/agents/selection/types/SelectTop3Request.ts`
- `tsconfig.json`

## Preserve Vs Rewrite

### Preserve

- the landing narrative and transition flow
- the Openville visual system
- chat and candidate presentation components
- scroll-triggered market storytelling

### Rewrite / adapt

- repository layer
- request orchestration hooks
- frontend shared contracts that conflict with backend truth
- selection type aliasing from the frontend branch
- any mock-default active path

## Research Conclusion

This should be treated as a backend-preserving frontend adaptation project.

The right mental model is:

```text
keep the frontend experience
  -> discard mock assumptions
  -> adapt UI orchestration to current dev routes
  -> preserve backend contracts unless an adapter boundary is introduced
```

The current backend on `dev` is the source of truth.
The redesign branch is the source of truth for UX and presentation.
The integration layer must sit between them.

## Open Questions Resolved

- Should work base from `dev` or the frontend branch?
  - `dev`

- Does `dev` now contain the meaningful backend route surface?
  - yes

- Is the redesign branch safe to merge as-is?
  - no

- Is the main risk styling?
  - no
  - the main risk is contract drift plus repo-level tooling regression

## Recommended Next Step

Write the implementation-ready plan around:
1. merge order
2. repository and adapter boundaries
3. canonical request/response contracts for the UI
4. staged replacement of mock flow with real route orchestration
