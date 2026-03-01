---
date: 2026-02-28T17:40:06-08:00
git_commit: ee4399f
branch: feat/yirivera-landing
repository: openville
topic: "Frontend landing experience plan"
tags: [plan, frontend, landing-page, onboarding, ux, agent-negotiation]
status: complete
last_updated: 2026-02-28
---

# Plan: Frontend Landing Experience

## Summary

Create the next frontend branch to turn the current home screen into a real user-facing product entrypoint.

The page should optimize for:

- action-first onboarding
- a chat request box as the main interaction
- a clear explanation of what Openville helps the user do
- a visual explanation of how agents compete, get narrowed, negotiate, and win
- a smooth continuation into the existing request-to-results flow

This branch should improve the first impression without changing the contract layer or backend swap boundary.

## Scope

### In scope

- redesign the home route as the product front door
- rewrite hero and supporting copy for real users
- make the request composer the primary action
- add prompt examples or quick-start suggestions
- replace developer-facing explanation panels with user-facing trust/value content
- add a storyboard section that visualizes the multi-agent funnel
- add a pinned-priorities treatment that stays visible during the story
- add a finalist comparison section for the top 3 negotiation stage
- add winner-selection and lifecycle closure content
- preserve the existing request-to-results mocked flow
- improve visual hierarchy and first-use clarity on desktop and mobile

### Out of scope

- new backend APIs
- new domain contracts by default
- negotiation flow
- booking flow
- notifications
- reviews
- route expansion into a separate marketing shell

## Canonical Locations

Use the existing home route:

```text
app/page.tsx
```

Component ownership for this branch:

- `app/page.tsx`: remains the route entrypoint
- `OpenvilleWorkspace`: becomes user-facing rather than engineer-facing
- `RequestComposer`: remains the primary input surface
- `CandidateResults`: remains responsible for the result-state area

## Product Decisions

### First impression

The page should answer these questions immediately:

1. What is Openville?
2. What should I do first?
3. What happens after I start?
4. Why does the final recommendation deserve trust?

### Main action

The request input is the primary CTA.

The user should be able to land and type a request without reading a long explanation first.

### Voice and copy

Use product-facing language.

Do not expose implementation language such as:

- contract-first
- repository boundary
- mock data
- adapter layer
- frontend slice

## Boundary Rules

- Preserve the current `UI -> hook -> repository -> mock now / backend later` flow.
- Do not introduce new contract types unless a concrete UX requirement exposes a gap.
- Do not move the landing experience into a separate route in this branch.
- Keep developer-facing explanation out of user-visible UI copy.

## Section Structure

The page should be structured in this order:

### 1. Hero section

Contents:

- clear product headline
- short supporting explanation
- primary request composer
- example prompts or quick-start chips

Purpose:

- establish value
- reduce first-input friction
- direct the user into action quickly

### 2. Trust / value section

Contents:

- short explanation of how Openville helps
- simple trust cues such as speed, matching quality, or comparison support

Purpose:

- answer "why should I use this?"
- replace the current developer-facing right panel

### 3. Agent storyboard section

Contents:

- human goal and pinned priorities
- job-posted moment
- many agents responding
- narrowing from many to top 10
- narrowing from top 10 to top 3

Purpose:

- explain the product mechanic visually
- make the elimination process legible
- show that the system is optimizing for the human's priorities

### 4. Finalist negotiation section

Contents:

- three finalist cards
- price
- reliability
- speed
- scope fit
- discount or compromise note
- winner highlight with short explanation

Purpose:

- show why one agent wins
- make trade-offs explicit instead of magical

### 5. Workflow continuity section

Contents:

- existing message flow
- follow-up prompt / inferred preferences
- ranked results

Purpose:

- keep the landing page connected to the actual interaction flow

### 6. Lifecycle closure section

Contents:

- transaction
- notification
- review

Purpose:

- show that the workflow does not end at ranking
- complete the product story for the hackathon audience

## UI and Interaction Requirements

### Request composer

- remains above the fold
- uses action-oriented placeholder copy
- keeps submit obvious and immediate
- supports example prompts if implemented in the parent layout or component

### Supporting examples

Add a few realistic prompt examples such as:

- "Fix my gutters this week. I care most about price."
- "Find a plumber today for a leaking sink."
- "Need the best-rated electrician for a small repair."

Examples should help users start faster without forcing a structured form.

### Pinned priorities

Keep the human's priorities visible during the storyboard.

Examples:

- reliability
- speed
- budget flexibility
- scope priority

These should frame why agents are filtered and why the final winner is selected.

### Storyboard visualization

Use a storyboard funnel instead of a giant graph.

Recommended sequence:

```text
job posted
  -> many responding agents
  -> top 10
  -> top 3
  -> winner
```

The visual should suggest movement and elimination without becoming noisy.

### Finalist comparison

The top-three stage should be shown as a structured trade-off comparison, not as raw chat transcript by default.

Each finalist card should expose:

- price
- reliability
- speed
- scope fit
- discount
- compromise note

### Results continuity

- results should feel like the next step of the same page experience
- avoid strong visual separation that makes the page feel fragmented
- preserve loading, error, empty, and success states

## Design Requirements

### Visual direction

- product-facing, not internal-tool-facing
- calm, confident, and intentional
- distinct enough to feel like a real application front door

### Content direction

- user benefit first
- minimal jargon
- no engineering framing in user-visible copy

### Demonstration direction

- the page should be easy to narrate live
- the audience should understand the elimination and negotiation logic quickly
- the winner should feel justified, not arbitrary

### Responsive behavior

- request composer must remain prominent on mobile
- hero copy must remain readable on small screens
- results and cards must stack cleanly
- the storyboard must remain understandable when stacked vertically

## Public APIs / Interfaces / Types

This branch should not change the current shared contract set:

- `Candidate`
- `ChatMessage`
- `UserPreferences`
- `SearchRequest`
- `RankedSearchResponse`
- `InitialChatResponse`

Unless a concrete UX requirement reveals a missing field, no contract changes should be introduced.

## Implementation Order

### Phase 1

- create the landing-experience research note
- create the landing-experience plan note

### Phase 2

- refactor the top-level copy and section hierarchy in `OpenvilleWorkspace`
- remove developer-facing messaging from the home page

### Phase 3

- reposition the request composer as the main hero action
- add example prompts or quick-start guidance

### Phase 4

- add the agent-process storyboard with pinned priorities
- visualize the narrowing flow from many agents to top 10 to top 3 to winner

### Phase 5

- add the finalist comparison section for negotiation trade-offs
- add winner explanation and lifecycle closure

### Phase 6

- validate mobile layout, accessibility, and state continuity

## Edge Cases and Failure Modes

- first-time user does not know what to type
- user sees the page as an internal tool rather than a product
- results feel visually disconnected from the hero
- the request composer is pushed too low on mobile
- new landing copy accidentally reintroduces engineering language
- the storyboard becomes too graph-heavy and hard to read
- the winner feels arbitrary because priorities are not visible
- the top-three comparison becomes cluttered instead of readable

## Acceptance Criteria

- the home route reads like a real product front door
- the primary call to action is entering a request
- the user can understand what Openville does within a few seconds
- the user or audience can understand that many agents compete and are narrowed to one winner
- the top-three trade-offs are visible and understandable
- the human's priorities remain visible during the decision story
- developer-facing copy is removed from the visible UI
- the current request-to-results mocked flow still works
- loading, error, empty, and success states still read clearly
- the page works on desktop and mobile

## Test and Validation Scenarios

- first-time user immediately understands the main action
- user can submit a request from the hero area
- example prompts reduce blank-input hesitation
- viewer can explain why the system narrows from many agents to top 10, then top 3, then one winner
- viewer can identify price, speed, reliability, and scope trade-offs in the finalist stage
- loading state still appears after submission
- error state still renders clearly
- empty state still provides guidance
- success state still renders ranked candidates
- long prompt text and long candidate content do not break layout

## Handoff Notes

The implementation should be easy to explain as:

```text
preserve the current contract and repository foundation
replace builder-facing messaging with user-facing product messaging
make the request composer the obvious first action
visualize the agent funnel and finalist trade-offs
keep the current request-to-results flow intact
```

## Explicit Assumptions and Defaults

- the current branch for this work is `feat/yirivera-landing`
- `app/page.tsx` remains the route entrypoint
- the chat-style request composer remains the primary entry interaction
- the landing page should use a storyboard funnel as the dominant process visualization
- the top-three stage should be shown as finalist trade-off cards, not transcript-first UI
- this branch is focused on first impression and presentation, not new backend or contract work
