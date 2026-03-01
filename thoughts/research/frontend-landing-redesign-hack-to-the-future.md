---
date: 2026-03-01T10:50:00-08:00
branch: feat/yirivera-landing
repository: openville
topic: "Frontend landing redesign research — Hack to the Future / Bridge Builder"
tags: [research, frontend, landing-page, hackathon, storytelling, ai-economy, bridge-builder]
status: active
last_updated: 2026-03-01
---

# Research: Openville Landing Redesign for Hack to the Future

## Goal

Ground the landing-page redesign in the actual repo state before implementation.

This research pass focuses on:

- current landing implementation shape
- reusable UI and orchestration patterns
- constraints from the existing chat/search architecture
- what is blocking the current landing direction from telling a stronger story
- what must be preserved while redesigning for the hackathon prompt

## Hackathon Framing

The current design problem is not only visual quality.
It is also prompt fit.

Hackathon prompt:

```text
BRIDGE BUILDER
THE PAST
AI solutions that bridge unexpected gaps between disciplines that have historically rarely interacted.

When disciplines collide, barriers dissolve.
```

Implication for Openville:

The landing page cannot stop at "AI helps find service providers."
It needs to visibly bridge:

- manual coordination from the past
- marketplace dynamics
- autonomous agents
- negotiation
- human-centered decision transparency

The current implementation only partially tells that story.

## Docs Reviewed

- `context/user_flow.md`
- `context/responsbilities.md`
- `thoughts/plans/frontend-landing-experience.md`
- `thoughts/plans/frontend-landing-experience-v2.md`
- `thoughts/plans/frontend-landing-redesign-hack-to-the-future.md`

## Current Repo State

### Branch / worktree

- branch: `feat/yirivera-landing`
- worktree is not clean
- there is active in-progress landing work and uncommitted research/plan work

### Relevant top-level structure

```text
app/
components/ui/
features/
  chat/
  landing/
  search/
  shared/
hooks/
lib/
thoughts/research/
thoughts/plans/
```

### Route structure

- `app/page.tsx` renders `OpenvilleWorkspace`
- the landing experience and the active product flow currently share the same route

This is important because the existing architecture is already optimized for same-page story mode -> active mode activation.

## Existing Patterns To Follow

## 1. Route-level orchestration stays centralized

`features/chat/components/OpenvilleWorkspace.tsx` is the orchestrator.

Current responsibilities:

- story mode vs transitioning vs active mode
- holding the shared `RequestComposer` input
- triggering the live chat/search flow
- mounting story sections in landing mode
- mounting real chat/results in active mode

This is the correct boundary to preserve.
The redesign should not scatter orchestration logic into multiple landing components.

## 2. Live interaction boundary is already clean

The current real interaction path is:

```text
RequestComposer
  -> useChatFlow
  -> mockChatRepository / mockSearchRepository
  -> MessageList / FollowUpPrompt / CandidateResults
```

This is the refactor-safe boundary the redesign should preserve.
The landing should change presentation, not break this flow.

## 3. Shared contracts are canonical

The shared contract layer is already in place:

- `features/shared/contracts/Candidate.ts`
- `features/shared/contracts/UserPreferences.ts`
- `features/shared/contracts/SearchContracts.ts`
- `features/shared/contracts/ChatMessage.ts`

These should remain canonical.
Landing/storytelling-specific data should remain local under `features/landing/`.

## 4. Reusable UI primitives already exist

Reusable primitives:

- `components/ui/button.tsx`
- `components/ui/input.tsx`
- `components/ui/card.tsx`
- `components/ui/badge.tsx`
- `lib/utils.ts` via `cn`

These are sufficient for the redesign.
There is no evidence yet that a new component library or heavy UI dependency is needed.

## 5. Same-page activation already exists

`OpenvilleWorkspace` already supports:

```text
story
  -> transitioning
  -> active
```

The live request is deferred until active mode mounts, which is a good pattern for preserving the active-mode loading experience.

This should be kept.

## Reusable Code Identified

## Strong reusables

### `OpenvilleWorkspace`

Reusable as the orchestration shell, not as-is visually.

Keep:

- mode model
- submit handoff pattern
- single-page activation behavior

Change:

- landing section composition
- active-mode theming
- visual continuity between story and product

### `RequestComposer`

Already supports:

- controlled value
- submit
- example prompts
- example click callback

This is a good base component and should be visually restyled rather than replaced.

### `useChatFlow`

Good reusable behavior:

- chat state
- follow-up state
- result orchestration
- shared real-to-mock boundary
- stable message ID generation via `createMessageId`

It should not absorb landing-story logic.

### `CandidateResults` and `CandidateCard`

Useful as active-mode building blocks.

Current issue:

- visual treatment is generic
- cards feel like safe default shadcn output

Conclusion:

- keep the data mapping and state handling
- redesign the surface styling later so active mode matches the new theme

### `useInView` / `useScrollProgress`

Conceptually useful for the landing story.

Current implementation should not be treated as production-ready yet because lint is failing on both hooks.

## Dependencies Mapped

## What the redesign depends on

### Design system layer

- `app/globals.css`
- `app/layout.tsx`
- current font setup via `next/font/google`

### Story shell

- `features/chat/components/OpenvilleWorkspace.tsx`
- `features/landing/components/*`
- `features/landing/data/storyboard-fixtures.ts`

### Live product flow

- `features/chat/components/RequestComposer.tsx`
- `features/chat/components/MessageList.tsx`
- `features/chat/components/FollowUpPrompt.tsx`
- `features/chat/hooks/useChatFlow.ts`
- `features/search/components/CandidateResults.tsx`
- `features/search/components/CandidateCard.tsx`

### Mock data and repository boundary

- `features/shared/repositories/chatRepository.ts`
- `features/shared/repositories/searchRepository.ts`
- `features/shared/mocks/chat.ts`
- `features/shared/mocks/preferences.ts`
- `features/shared/mocks/candidates.ts`

## What depends on the redesign

- only `app/page.tsx` through `OpenvilleWorkspace`
- landing-story components
- visual styling of active mode

The underlying shared contracts and repositories are upstream dependencies, not redesign consumers.

## Current Landing Implementation Findings

## 1. Theme mismatch is real

The current page still operates in a mixed visual system:

- base theme tokens in `app/globals.css` are light-first
- landing narrative uses a single dark funnel section
- the rest of the story sits on a white background

This creates the exact whiplash the user called out.

Conclusion:

- the redesign needs a continuous visual world
- a random light page plus dark feature section is not acceptable

## 2. The current landing sections are structurally separated but visually underpowered

Current sections:

- `HeroSection`
- `OldWaySection`
- `HandoffSection`
- `FunnelSection`
- `FinalistSection`
- `ClosureSection`

This composition is directionally useful because the page is already broken into story units.

But the current treatment is too generic:

- clean hero
- three-card "old way"
- simple handoff chat bubbles
- dark funnel
- finalist cards
- simple closure strip

This is readable, but not memorable.

## 3. The story still hardcodes the wrong scenario

Current user story examples still reference gutters directly:

- hero examples
- handoff copy
- storyboard fixtures
- search repository matching behavior
- candidate fixtures

This makes the demo feel small and local.
It is a poor fit for the hackathon framing.

## 4. The funnel concept exists, but the data underneath it is too thin

`FunnelSection` already contains the right high-level concept:

- 50 agents
- top 10
- top 3
- negotiation
- winner

But the fixture layer is not rich enough to support a convincing market:

- `chaosAgents` are just numbered `Agent 1..50`
- there are no specialist clusters
- no meaningful role identity
- top 10 and top 3 lack enough survival/elimination reasoning

This is one of the main reasons the visualization currently feels fake.

## 5. The current "old way" section is too safe

`OldWaySection` currently uses three polished pain cards.

That is a standard SaaS pattern.
It does not feel like "the past."

For the Bridge Builder theme, the old world should feel manually stitched together and fragmented, not neatly summarized.

## 6. The active mode still looks like a prototype, not the live system

The active experience is functionally correct, but visually generic:

- standard white surfaces
- basic error block
- default card styling
- no continuation of the landing atmosphere

This is a continuity problem.
If story mode becomes cinematic and active mode remains generic, the transition will weaken trust.

## 7. Metadata is still default starter content

`app/layout.tsx` still ships with:

- title: `Create Next App`
- description: `Generated by create next app`

This is a clear sign the app shell has not yet been productized.

## Mock and Contract Findings

## 1. Shared contracts are sufficient for the live flow

Current live contract shapes are minimal but usable:

- `Candidate`
- `SearchRequest`
- `RankedSearchResponse`
- `InitialChatResponse`

Nothing in the redesign currently requires changing these types.

## 2. The live search repository is tightly biased toward gutters

`features/shared/repositories/searchRepository.ts` currently:

- matches candidates against the query
- also returns matches if the query includes `"gutter"`

`features/shared/mocks/candidates.ts` is entirely gutter/exterior-maintenance themed.

Implication:

- if the landing story shifts to Launch Event Rescue, the live results experience will feel inconsistent unless the mock search fixtures and matching logic are also updated

This is not only a copy change.
It is a mock data coherence problem between story mode and active mode.

## 3. The chat mock is generic enough to reuse

`buildAssistantReply()` in `features/shared/mocks/chat.ts` is generic.
It only asks a priority follow-up when budget detail is missing.

This is reusable.

## 4. Preference inference is generic but simplistic

`inferPreferencesFromRequest()` supports:

- budget inference
- quality inference
- basic timeline inference
- max budget parsing for `150` and `200`

This is enough for a mock, but if the new story uses event operations and richer priorities, it may feel underspecified.

That is not necessarily a blocker, but it should be noted.

## Accessibility and Engineering Findings

## 1. Reduced-motion intent exists

`app/globals.css` defines a global reduced-motion override.
Both `useInView` and `useScrollProgress` also try to respect reduced motion.

This is good directionally.

## 2. The current hooks fail lint

Current lint failures:

- `hooks/useInView.ts`
- `hooks/useScrollProgress.ts`
- `features/landing/components/HandoffSection.tsx` due to unescaped apostrophe

The hook failures come from synchronous `setState` inside effects under the current React lint rules.

Implication:

- these hooks should be treated as redesign targets, not stable infrastructure
- the redesign should either rewrite them or adjust the implementation pattern before relying on them further

## 3. No heavy motion library is present

Current dependencies include:

- Next.js 16
- React 19
- Tailwind v4
- tw-animate-css

No Framer Motion or equivalent is present.

Implication:

- the current repo is biased toward CSS and lightweight JS animation
- a redesign should prefer CSS transforms and scroll state over introducing a motion framework unless there is a strong reason

## Risks and Constraints

## Primary risks

1. Story mode may become much better than active mode, making activation feel like a downgrade.
2. A dense node network could become visually noisy or unreadable on mobile.
3. Replacing only landing fixtures without updating live search mocks would create scenario mismatch.
4. A dark-first redesign could drift into generic cyberpunk if the typography and spacing are weak.
5. The Bridge Builder fit may remain implicit unless the old-world / future-world contrast is made explicit in both copy and layout.

## Constraints

1. Preserve `UI -> hook -> repository -> mock` architecture.
2. Keep shared contracts canonical unless a concrete need appears.
3. Stay on the single home route.
4. Reuse existing primitives where possible.
5. Avoid building the redesign around a giant single component.

## Recommendations From Research

## Keep

- same-page activation
- route-level orchestration in `OpenvilleWorkspace`
- shared contract boundary
- `RequestComposer` as the primary CTA surface
- local landing-only data for story visualizations

## Replace or redesign heavily

- current light/dark mixed theme
- current gutters story
- current three-card old-way section
- current thin landing fixtures
- current generic finalist-card treatment
- current active-mode visual styling
- current scroll hooks implementation

## Update for coherence

- app metadata
- live candidate fixtures
- live search matching logic
- example prompts
- handoff copy
- winner explanation language

## Questions Resolved By Research

1. Where should landing orchestration live?
   `OpenvilleWorkspace`

2. Should the redesign change shared contracts first?
   No. Shared contracts are already sufficiently stable for this work.

3. Should the landing story use local data or shared contracts?
   Local data for story visuals, shared contracts only for the active results flow.

4. Is same-page activation already aligned with the repo?
   Yes. It already exists and should be preserved.

5. Are the current landing hooks stable enough to build more on top of as-is?
   No. They currently fail lint and should be treated as rewrite candidates.

## Research Conclusion

The repo already has the correct architectural backbone for the redesign:

```text
single route
  -> story mode
  -> active mode
  -> shared chat/search boundary
```

The main problem is not structure.
It is that the current story, theme, and mock data do not yet express the hackathon concept with enough clarity or ambition.

The redesign should therefore be treated as:

- a visual-system reset
- a narrative rewrite
- a mock-data rewrite
- an active-mode continuity pass

It should not be treated as:

- a backend change
- a shared-contract refactor
- a route split
- a simple styling polish
