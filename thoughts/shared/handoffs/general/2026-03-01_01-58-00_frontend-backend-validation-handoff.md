---
date: 2026-03-01T01:58:00-08:00
researcher: codex
branch: integration/frontend-on-dev
repository: openville
topic: "Frontend/backend workflow integration and runtime validation status"
tags: [handoff, frontend, backend, integration, validation, openrouter]
status: in_progress
last_updated: 2026-03-01
last_updated_by: codex
type: implementation_handoff
---

# Handoff: frontend/backend workflow integration + runtime validation status

## Current branch state

The active Step 1-7 flow is implemented as a real frontend-to-backend workflow.

Implemented path:

```text
landing request
  -> active workspace
  -> editable context brief
  -> GET /api/workflow/status
  -> POST /api/agents/search-and-select
  -> shortlist panel
  -> POST /api/agents/negotiate/run
  -> POST /api/agents/select-winner
  -> winner summary
```

### Key implementation files

Frontend orchestration and boundary:
- `features/workflow/hooks/useOpenvilleFlow.ts`
- `features/workflow/client/repository.ts`
- `features/workflow/client/adapters.ts`
- `features/workflow/client/types.ts`

New workflow UI panels:
- `features/workflow/components/WorkflowStatusPanel.tsx`
- `features/workflow/components/ContextFormPanel.tsx`
- `features/workflow/components/ShortlistPanel.tsx`
- `features/workflow/components/NegotiationPanel.tsx`
- `features/workflow/components/WinnerPanel.tsx`

Workspace integration:
- `features/chat/components/OpenvilleWorkspace.tsx`
- `features/chat/components/RequestComposer.tsx`
- `features/search/components/CandidateResults.tsx`
- `features/search/components/CandidateCard.tsx`

Backend fixes made during validation:
- `app/api/agents/select-winner/route.ts`
- `app/api/search/ranked/route.ts`
- `features/agents/negotiation/db/SupabaseNegotiationRepository.ts`
- `features/search/repositories/SupabaseMarketCandidateRepository.ts`

Plan artifact updated to reflect explicit context submission:
- `thoughts/plans/2026-03-01-frontend-on-dev-integration-plan.md`

## Removed old dead path

Deleted the Phase 1 placeholder flow and fake workflow contracts from active use:
- deleted old `useChatFlow`
- deleted old `useRankedResults`
- deleted fake workflow contracts for `Candidate`, `UserPreferences`, `SearchContracts`
- deleted old `FollowUpPrompt`

## Validation completed

### Confirmed

- Lint passed on changed frontend/workflow/runtime files.
- OpenRouter is live and callable with the current key.
- Direct OpenRouter test to `openai/gpt-4o-mini` succeeded.
- Direct reasoning-style OpenRouter prompt also succeeded.

### Not confirmed yet

- Real Supabase-backed search path
- Local Next app runtime
- End-to-end Step 1-7 browser flow

## Environment status

### `.env.local`

Present when checked:
- `OPENROUTER_API_KEY`
- `LLM_PROVIDER=openrouter`
- `NEXT_PUBLIC_SUPABASE_URL`
- `ALLOW_MOCK_LLM_FALLBACK=true`
- `ALLOW_SEEDED_MARKET_FALLBACK=true`

Still appeared missing when checked:
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Without those, real Supabase-backed search is not validated.

## Current blocker

The local npm install is in a broken or inconsistent state.

Symptoms observed:
- `node_modules` exists
- `node_modules/.bin` intermittently missing
- `vitest` unresolved after install attempts
- `typescript` package directory present but package resolution broken
- `npm ci --include=dev` did not leave a stable usable toolchain

This is now an environment or package-manager problem, not an app logic problem.

## What to do next

### 1. Fix env completeness

Verify `.env.local` contains:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
OPENROUTER_API_KEY=...
LLM_PROVIDER=openrouter
ALLOW_MOCK_LLM_FALLBACK=true
ALLOW_SEEDED_MARKET_FALLBACK=true
```

### 2. Repair local install cleanly

Recommended next move:
- remove broken `node_modules`
- reinstall with dev dependencies included
- verify `node_modules/.bin/vitest` and `node_modules/.bin/tsc` exist before doing anything else

### 3. After install is healthy

Run:
- targeted tests
- full typecheck
- local app boot
- actual browser/manual flow

### 4. First real E2E workflow to run

```text
submit request
  -> confirm context brief appears
  -> run market
  -> verify status panel reflects live/degraded correctly
  -> verify ranked candidates render
  -> run negotiations
  -> select winner
  -> verify winner summary renders
```

## Interview-angle summary

What was built:
- a backend-authoritative workflow boundary for the frontend

Why:
- the old UI had a strong shell but fake orchestration
- backend routes already existed and should remain canonical

Trade-off:
- more adapter/view-model code on the frontend
- cleaner contract boundary and less drift

How to explain it:
- "We replaced mock-era UI orchestration with a real workflow hook that adapts canonical backend contracts into presentation models, and we surfaced degraded execution explicitly instead of hiding fallback behavior."
