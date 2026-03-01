---
date: 2026-02-28T19:41:05-08:00
git_commit: 6ac8fa3
branch: feat/yirivera-landing
repository: openville
topic: "Landing branch handoff and shared contract collaboration notes"
tags: [handoff, frontend, landing-page, contracts, collaboration]
status: complete
last_updated: 2026-02-28
---

# Handoff: `feat/yirivera-landing`

## Current State

- Current branch: `feat/yirivera-landing`
- Working tree was clean at handoff time
- Latest branch-specific commit:
  - `6ac8fa3` `docs(landing): record agent-negotiation storyboard research and plan`

## What Was Completed

### Landing branch setup

- Created the landing branch from the frontend contract-first branch
- Added landing-specific RPI artifacts
- Committed the landing documentation as its own story

### RPI artifacts created

- `thoughts/research/frontend-landing-experience.md`
- `thoughts/plans/frontend-landing-experience.md`

These files now capture the updated landing direction, not just the earlier “make the page more product-facing” idea.

## Landing Direction Agreed

The landing page should:

- be action-first
- keep the chat-style request composer as the main CTA
- explain the product through a visual storyboard
- preserve the existing request-to-results mocked flow

### Core product story to visualize

```text
human request
  -> many agents compete
  -> top 10 are shortlisted
  -> top 3 are compared more deeply
  -> finalists negotiate on trade-offs
  -> one winner is selected
  -> transaction completes
  -> human is notified and later reviews
```

### Visualization decisions

- Use a storyboard funnel, not a giant graph
- Keep human priorities pinned and visible throughout
- Show the top-three stage as structured trade-off cards
- Make the winner justification explicit
- Close the loop with transaction / notification / review

## Important Docs

### Research

- [frontend-contract-first-slice research](/Users/isaiahrivera/Documents/GitHubProjects/openville/thoughts/research/frontend-contract-first-slice.md)
- [frontend-landing-experience research](/Users/isaiahrivera/Documents/GitHubProjects/openville/thoughts/research/frontend-landing-experience.md)

### Plans

- [frontend-contract-first-slice plan](/Users/isaiahrivera/Documents/GitHubProjects/openville/thoughts/plans/frontend-contract-first-slice.md)
- [frontend-landing-experience plan](/Users/isaiahrivera/Documents/GitHubProjects/openville/thoughts/plans/frontend-landing-experience.md)

## Contract Collaboration Findings

### Current frontend contract structure

Shared contracts currently live in:

- `features/shared/contracts/Candidate.ts`
- `features/shared/contracts/UserPreferences.ts`
- `features/shared/contracts/SearchContracts.ts`

This is the canonical shared-contract pattern created for the frontend contract-first slice.

### PR #3 finding

PR `#3` adds one file:

- `features/search/types/index.ts`

It introduces overlapping search types in a different location from the shared contract layer.

### PR #2 finding

PR `#2` adds agent-selection-local types under:

- `features/agents/selection/types/Candidate.ts`
- `features/agents/selection/types/UserPreferences.ts`
- `features/agents/selection/types/JobScope.ts`
- `features/agents/selection/types/SelectedCandidate.ts`
- `features/agents/selection/types/SelectTop3Request.ts`
- `features/agents/selection/types/SelectTop3Response.ts`
- `features/agents/selection/types/index.ts`

Important note:

- `JobScope`, `SelectedCandidate`, `SelectTop3Request`, and `SelectTop3Response` are good candidates for feature-local ownership
- `Candidate` and `UserPreferences` are where the architectural conflict appears because shared concepts are being defined in multiple places

## Best-Practice Team Decision Reached

Use this split:

```text
features/shared/contracts/
  = shared, cross-team, cross-feature contracts

features/<feature>/types/
  = feature-local types only
```

### Shared contracts should stay canonical for:

- `Candidate`
- search request/response contracts
- other true cross-team contracts

### Feature-local selection types should stay local for:

- `JobScope`
- `SelectedCandidate`
- `SelectTop3Request`
- `SelectTop3Response`

### Main rule

Do not keep duplicate canonical concepts in both shared and feature-local folders.

## Collaboration Guidance Agreed

Producer-first rule:

- the producer should lead output feasibility
- the consumer should provide usability feedback
- shared boundary types should live in one canonical shared location

Practical team rule:

```text
If a type crosses frontend/backend or feature boundaries, it belongs in shared contracts.
If a type only exists for one feature’s internal workflow, it belongs in that feature’s types folder.
Do not duplicate the same concept in both places.
```

## Open Problem To Solve Next

The next technical decision is a type refactor to reconcile:

- current shared contracts
- PR `#2`’s feature-local agent-selection types
- PR `#3`’s search types

The highest-risk duplicates are:

- `Candidate`
- `UserPreferences`

## Recommended Next Steps

### 1. Create new RPI artifacts for the contract refactor

Suggested files:

- `thoughts/research/shared-vs-feature-contract-refactor.md`
- `thoughts/plans/shared-vs-feature-contract-refactor.md`

### 2. Refactor contract ownership

Goal:

- keep shared concepts canonical in `features/shared/contracts`
- keep selection-specific wrappers in `features/agents/selection/types`
- remove duplicate ownership of `Candidate` and `UserPreferences`

### 3. Then implement the landing page UI

Only after the contract boundary is stable enough to avoid churn.

## Safe Resume Checklist

Before resuming:

1. run `git status --short --branch`
2. confirm branch is still `feat/yirivera-landing`
3. read:
   - `thoughts/research/frontend-landing-experience.md`
   - `thoughts/plans/frontend-landing-experience.md`
4. create the new contract-refactor research/plan pair
5. only then start code changes

## Short Resume Prompt

```text
We are on feat/yirivera-landing.
The landing RPI docs are committed.
Next we need an RPI pass for the shared-vs-feature contract refactor so we can reconcile PR #2 and PR #3 types without duplicate ownership of Candidate and UserPreferences.
After that, continue the landing implementation.
```
