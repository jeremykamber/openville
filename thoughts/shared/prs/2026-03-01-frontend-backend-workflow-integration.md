## Summary
Connect the redesigned frontend workflow to the real backend workflow so the app can move from user request to winner selection through live API routes instead of frontend-only mock orchestration.

## What this PR does
This PR turns the frontend into a real client of the backend workflow.

Before this change:
- the frontend experience existed, but key workflow steps were still shaped by local/mock-era assumptions
- the backend routes existed, but the UI was not cleanly running through them end-to-end

After this change:
- the frontend request flow now drives the backend workflow
- the UI submits real workflow context
- the backend performs search, shortlist selection, negotiation, and winner selection
- the frontend renders backend results and degraded-state signals instead of pretending the workflow is fully live

In practical terms, this PR connects:

`request UI -> workflow context -> search/select API -> negotiation API -> winner API -> rendered result`

## What this PR includes
- Frontend-to-backend wiring for the active marketplace workflow
- Request intake and structured context submission
- Ranked candidate retrieval from the backend workflow path
- Finalist shortlist generation rendered in the UI
- Batch negotiation execution rendered in the UI
- Winner selection rendered in the UI
- Explicit degraded-mode handling so the integrated flow still works locally when live infrastructure is incomplete
- Targeted tests for the local integrated workflow path

## Why the fallback work is part of this PR
The goal of this PR is not just to make the UI call an API.
The goal is to make the integrated frontend/backend workflow actually usable.

Once the frontend was wired to the backend, two gaps blocked the full flow:
- seeded fallback data did not support enough candidates to produce a shortlist
- negotiation persistence failed when Supabase admin setup was missing

This PR fixes the minimum backend-side fallback gaps needed for the integrated UI flow to work end-to-end locally.

## What this PR does not include
This PR stops at winner selection.

It does not yet handle what happens after a provider is chosen:
- booking or transaction creation
- checkout/payment behavior
- post-selection confirmation flow
- notification delivery
- review submission and retrieval
- full production-ready live infrastructure across every step

## Why this boundary makes sense
This PR is about integrating the decision workflow between frontend and backend.

It proves that the system can now do this as one connected product flow:

`user request -> backend search -> shortlist -> negotiation -> winner`

The next slice should start after that point and handle commitment and follow-through:
- create the booking
- confirm it to the user
- notify the user
- collect reviews after the work is completed

## Testing
- `npx vitest run app/api/agents/search-and-select/__tests__/route.test.ts app/api/agents/negotiate/run/__tests__/route.test.ts features/agents/negotiation/db/__tests__/InMemoryNegotiationRepository.test.ts`
- `npx eslint app/api/agents/search-and-select/route.ts app/api/agents/select-winner/route.ts app/api/agents/negotiate/run/route.ts features/agents/reasoning/providers/OpenRouterChatModel.ts app/api/agents/search-and-select/__tests__/route.test.ts app/api/agents/negotiate/run/__tests__/route.test.ts features/agents/negotiation/db/InMemoryNegotiationRepository.ts features/agents/negotiation/db/__tests__/InMemoryNegotiationRepository.test.ts features/agents/negotiation/db/SupabaseNegotiationRepository.ts features/search/data/marketCandidateSeeds.ts`

## What’s next
- Add booking/transaction creation after winner selection
- Add a confirmation state showing selected provider, final price, and committed scope
- Add the notification handoff after booking succeeds
- Add review capture and retrieval for the post-job flow
- Replace remaining degraded fallbacks with fully live Supabase-backed infrastructure
