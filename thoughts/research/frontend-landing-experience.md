---
date: 2026-02-28T17:40:06-08:00
git_commit: ee4399f
branch: feat/yirivera-landing
repository: openville
topic: "Frontend landing experience research"
tags: [research, frontend, landing-page, onboarding, ux, agent-negotiation]
status: complete
last_updated: 2026-02-28
---

# Research: Frontend Landing Experience

## Goal

Define what a first-time user should see when they land on Openville and identify what must change to turn the current home screen into a real product entrypoint.

## Repo State

- The current home route is `app/page.tsx`.
- `app/page.tsx` renders `OpenvilleWorkspace`.
- The current workspace already supports the first mocked flow:
  - request input
  - assistant/context response
  - follow-up prompt
  - ranked candidate results
- The contract-first foundation is already in place:
  - shared contracts under `features/shared/contracts`
  - mocks under `features/shared/mocks`
  - repositories under `features/shared/repositories`

## Docs Reviewed

- `app/page.tsx`
- `features/chat/components/OpenvilleWorkspace.tsx`
- `thoughts/plans/frontend-contract-first-slice.md`
- `thoughts/plans/frontend-landing-experience.md`
- `context/user_flow.md`
- `context/responsbilities.md`

## Existing Patterns To Follow

- Keep `app/page.tsx` as the main entry route
- Preserve the current hook-to-repository flow
- Reuse the existing UI primitives under `components/ui`
- Keep the landing experience connected to the current request-to-results workflow

## Problems Identified

### 1. The page is builder-facing instead of user-facing

The current home screen already includes a working request-to-results flow, but the presentation is still oriented toward builders rather than users.

Examples of what it currently communicates:

- "Dev 1 frontend slice"
- "Contract-first"
- "The refactor-safe boundary is the main engineering win"
- explanation of repository and adapter boundaries

### 2. The primary interaction is already correct

- There is already a clear primary interaction: the request composer.
- The page already demonstrates the core product loop.
- The mocked flow already proves the technical foundation.

### 3. The first impression does not yet communicate product value

- The copy explains implementation rather than product value.
- The right-side panel is developer-facing instead of trust-building or user-facing.
- The page feels like a prototype walkthrough instead of a confident product front door.
- The user is not immediately told, in product language, what Openville does for them.

### 4. The route structure should not be expanded yet

- The home route already contains the real product interaction.
- Splitting into a separate landing shell now would add route complexity before the entry experience is validated.

### 5. The current plan under-explains the multi-agent negotiation story

- The strongest demo moment is not only "request -> results."
- The real differentiator is that many agents compete, the field narrows, the top three negotiate, and the winner is selected based on the human's priorities.
- The current landing direction does not yet visualize eliminations, scope trade-offs, or finalist comparison clearly enough for a hackathon audience.

## Product Flow Findings

From `context/user_flow.md`, the first user-facing page should support:

```text
request
  -> context gathering
  -> search
  -> ranked results
```

This means the landing page should not just market the idea. It should let the user start the real flow immediately.

The user flow also makes the later stages important to visualize:

- many agents respond
- the system narrows to top 10
- priorities narrow the field to top 3
- finalists negotiate on price, scope, and compromises
- one winner is selected
- transaction, notification, and review close the loop

## Ownership Findings

From `context/responsbilities.md`:

- Dev 1 owns the user-facing request and context experience.
- The first screen is therefore a frontend responsibility, not just a styling exercise.
- The landing experience should make the request flow easier to understand and start.

## System Framing

### User journey

```text
user lands on Openville
  -> understands what the app helps with
  -> sees the main action immediately
  -> enters a request
  -> understands that agents compete and get filtered
  -> sees why finalists are compared
  -> understands how a winner is chosen
```

### UI surface

- hero / headline
- supporting product copy
- primary request input
- prompt examples or shortcuts
- trust/value cues
- visual explanation of the agent process
- finalist trade-off comparison
- lifecycle closure for transaction, notification, and review
- continuation into the existing results flow

### State and orchestration

- no new backend behavior is required
- the current request-to-results state flow should be preserved
- the main change is presentation and clarity, not core interaction logic

### Domain logic

- no new domain contract is required for the landing decision itself
- current contracts remain sufficient unless a new UX need reveals a missing field

### Integration boundary

- the repository boundary should remain unchanged
- this work is about the front door, not about changing the contract layer

### Demo comprehension

- the user or audience should be able to explain why the winner was selected
- the experience should avoid looking like opaque "AI magic"
- the system should visibly connect decisions back to the human's priorities

## Decision Direction

The next frontend branch should optimize the landing experience for action-first entry and make the multi-agent negotiation process visually legible.

### Chosen direction

```text
first-time user lands
  -> sees clear headline and request input immediately
  -> understands what happens next
  -> sees that many agents compete for the job
  -> understands that the field narrows from many to few to one
  -> understands that the final choice reflects the human's priorities
  -> starts the workflow with minimal friction
```

### Why

- users come with a task, not with interest in implementation details
- the strongest proof of value is letting them start the flow quickly
- the existing technical foundation already supports this
- the most demo-worthy part of the product is the negotiation and elimination logic, so the landing page should make that visible

## Visualization Findings

### Best primary metaphor

Use an elimination funnel, not a dense graph.

Reason:

- easier to understand in a few seconds
- easier to narrate on stage
- still compatible with animated agent chips or nodes
- works better on mobile than a wide network diagram

### Best treatment for the top-three negotiation stage

Use finalist trade-off cards, not transcript-first UI.

Reason:

- easier to compare
- easier to justify the winner
- lets the audience understand price, speed, reliability, and scope fit at a glance

### Best treatment for human priorities

Keep them pinned and visible throughout the visualization.

Reason:

- every elimination and final decision should be explainable
- the winner should not look arbitrary or purely cheapest

## Risks and Assumptions

### Risks

- the page may still feel like an internal tool if developer-facing language remains
- the user may not know what to type if examples are weak
- the results section may feel disconnected from the hero if the page hierarchy is unclear
- mobile layout may bury the request input below the fold
- a giant graph could become visually noisy and hurt comprehension
- negotiation could look like unexplained AI magic if the trade-offs are hidden

### Assumptions

- the current mocked request flow should remain the main interaction
- the existing contracts and repositories are good enough for this branch
- the next branch should focus on presentation, copy, and entry flow clarity rather than new backend behavior
- the best landing layout for this branch is a storyboard flow, not a separate landing shell and not a single giant network diagram

## Recommended Next Step

Move from research into a decision-complete plan that defines:

- the landing-page section structure
- hero copy and supporting copy strategy
- trust and onboarding content
- the storyboard sequence for the agent funnel
- how top 10, top 3, and winner selection are visualized
- how human priorities stay visible
- how scope fit, price, speed, and reliability are shown during finalist comparison
- how the request composer is positioned
- how the existing request/results flow is preserved inside the new front door
