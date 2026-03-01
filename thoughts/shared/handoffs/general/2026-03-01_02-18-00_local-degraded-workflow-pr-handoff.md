---
date: 2026-03-01T02:18:00-08:00
researcher: codex
branch: integration/frontend-on-dev
repository: openville
topic: "PR-sized degraded local workflow slice"
tags: [handoff, frontend, backend, workflow, fallback, local-demo]
status: in_progress
last_updated: 2026-03-01
last_updated_by: codex
type: implementation_handoff
---

# Handoff: degraded local workflow PR slice

## Goal of this slice

Make the local Step 1-7 workflow demonstrable in degraded mode without requiring full Supabase admin setup.

That means the local path can now do:

```text
request
  -> context brief
  -> seeded search
  -> shortlist
  -> negotiation
  -> winner
```

## What changed

### 1. Seeded market now supports a real shortlist path

Added three more plumbing candidates in:

- `features/search/data/marketCandidateSeeds.ts`

Result:
- plumbing requests can now produce 4 ranked candidates
- shortlist no longer stops at the "fewer than 3 candidates" boundary

### 2. Negotiation persistence now degrades locally

Added:

- `features/agents/negotiation/db/InMemoryNegotiationRepository.ts`

Updated:

- `features/agents/negotiation/db/SupabaseNegotiationRepository.ts`
- `app/api/agents/negotiate/run/route.ts`

Behavior:
- if Supabase admin is configured, negotiation persistence still uses Supabase
- if Supabase admin is missing, the route now uses an in-memory repository
- the negotiation route surfaces this as an explicit degraded warning

### 3. OpenRouter local path is more resilient

Updated:

- `features/agents/reasoning/providers/OpenRouterChatModel.ts`
- `app/api/agents/search-and-select/route.ts`
- `app/api/agents/select-winner/route.ts`

Behavior:
- OpenRouter now defaults to `openai/gpt-4o-mini` unless `OPENROUTER_MODEL` is set
- shortlist selection falls back to mock if the live provider fails and mock fallback is allowed
- winner selection falls back to mock if the live provider fails and mock fallback is allowed
- fallback is surfaced in route meta and in the UI

## Validation completed

### Targeted automated checks

Passed:

- `npx vitest run app/api/agents/search-and-select/__tests__/route.test.ts app/api/agents/negotiate/run/__tests__/route.test.ts features/agents/negotiation/db/__tests__/InMemoryNegotiationRepository.test.ts`
- targeted `eslint` on all touched files

### Manual browser validation

Validated in the live local app on March 1, 2026:

```text
request entered
  -> active workspace opens
  -> workflow status shows degraded seed/keyword mode
  -> market run returns 4 plumbing candidates
  -> shortlist renders 3 finalists
  -> negotiations run successfully
  -> winner selection completes
```

Observed current behavior:

- Step 3-5 succeeded with live OpenRouter shortlist selection
- Step 6 succeeded with in-memory persistence fallback
- Step 7 hit an OpenRouter provider error and then degraded to mock winner selection

## Important current runtime facts

### What is genuinely real

- frontend is calling real Next API routes
- search route runs for real
- shortlist route orchestration is real
- negotiation route orchestration is real
- fallback states are surfaced in the UI

### What is still degraded

- market data source is seeded fallback, not Supabase
- retrieval is keyword fallback, not embeddings/vector search
- negotiation persistence is in-memory fallback when Supabase admin is absent
- winner selection may degrade to mock when OpenRouter fails

## Remaining issues for tomorrow

### 1. Winner selection provider instability

Observed:
- `POST /api/agents/select-winner` attempted OpenRouter first
- OpenRouter returned `400 Provider returned error`
- route degraded to mock winner selection successfully

Suggested follow-up:
- inspect OpenRouter winner-selection prompt/response format
- decide whether to harden prompt/model choice further or keep mock fallback as acceptable degraded behavior

### 2. Negotiation latency is still high

Observed:
- `POST /api/agents/negotiate/run` took about 37.8 seconds in local validation

Suggested follow-up:
- inspect number of model calls per finalist
- consider reducing rounds or adding a local mock toggle for demo mode

### 3. Local shell env is still wrong for dev

Observed:
- `NODE_ENV=production` is set in the shell during `next dev`

Suggested follow-up:
- unset it or set `NODE_ENV=development` before local development

### 4. Repo still has unrelated pre-existing test failures

This slice did not fix the broader failing tests outside the targeted workflow checks.

## PR recommendation

This is a coherent PR if framed as:

`fix/local-degraded-workflow-fallbacks`

Summary:
- enable end-to-end degraded local workflow for Step 1-7
- add in-memory negotiation persistence fallback
- enrich seeded market data for shortlist coverage
- make LLM failure degrade explicitly instead of hard-failing

## Interview angle

You can explain this slice as:

"We created a PR-sized local workflow slice that makes the product testable even when live infrastructure is incomplete. Instead of hiding fallback behavior, we made degraded execution explicit and preserved the full interaction loop so frontend and backend integration could be validated end-to-end."
