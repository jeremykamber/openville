---
date: 2026-03-01T11:05:00-08:00
git_commit: 6ac8fa3
branch: feat/yirivera-landing
repository: openville
topic: "Hack to the Future landing redesign handoff"
tags: [handoff, frontend, landing-page, hackathon, storytelling, ai-economy, bridge-builder]
status: complete
last_updated: 2026-03-01
---

# Handoff: `feat/yirivera-landing` — Hack to the Future Redesign

## Current State

- Current branch: `feat/yirivera-landing`
- Latest commit on branch: `6ac8fa3`
- Working tree is dirty
- This session did **planning and research only**
- No new implementation work was started in this session

## What Was Completed In This Session

### 1. New research artifact created

- [frontend-landing-redesign-hack-to-the-future research](/Users/isaiahrivera/Documents/GitHubProjects/openville/thoughts/research/frontend-landing-redesign-hack-to-the-future.md)

### 2. New implementation plan created and refined

- [frontend-landing-redesign-hack-to-the-future plan](/Users/isaiahrivera/Documents/GitHubProjects/openville/thoughts/plans/frontend-landing-redesign-hack-to-the-future.md)

The plan was tightened beyond a creative brief and now includes:

- a locked story bible
- a locked visual system spec
- a locked mock-data direction
- a motion/state map
- a component/file contract

### 3. Hackathon framing was locked

The landing redesign is now explicitly framed around:

```text
BRIDGE BUILDER
THE PAST
When disciplines collide, barriers dissolve.
```

Openville’s bridge is now defined as:

```text
manual coordination
  -> agent-mediated market
  -> ranking
  -> negotiation
  -> explainable winner selection
```

## Canonical Sources Of Truth

### Research

- [frontend-landing-redesign-hack-to-the-future research](/Users/isaiahrivera/Documents/GitHubProjects/openville/thoughts/research/frontend-landing-redesign-hack-to-the-future.md)
- [frontend-landing-experience research](/Users/isaiahrivera/Documents/GitHubProjects/openville/thoughts/research/frontend-landing-experience.md)

### Plans

- [frontend-landing-redesign-hack-to-the-future plan](/Users/isaiahrivera/Documents/GitHubProjects/openville/thoughts/plans/frontend-landing-redesign-hack-to-the-future.md)
- [frontend-landing-experience-v2 plan](/Users/isaiahrivera/Documents/GitHubProjects/openville/thoughts/plans/frontend-landing-experience-v2.md)

Important:

- the new Hack to the Future plan should be treated as **canonical**
- older landing plans are now background context only

## Decisions Locked

These are no longer open questions unless the user explicitly changes them:

- Theme direction: `timeline + network hybrid`
- Tone balance: `live-system first, editorial discipline second`
- Visual world: `dark-first, continuous, no white-to-black section whiplash`
- Story scenario: `Launch Event Rescue`
- Protagonist: `event producer saving tomorrow's product launch`
- Activation model: `same-page story mode -> active mode`
- Motion: `high drama with reduced-motion fallback`
- Shared contracts: `unchanged`
- Landing story data: `local to features/landing`

## Intended User Experience

The page should now be understood as:

```text
PAST CHAOS
  -> HANDOFF
  -> AGENT MARKET WAKES UP
  -> 50 -> 10 -> 3 -> 1
  -> WINNER IS JUSTIFIED
  -> LIVE PRODUCT ACTIVATES
```

### What the user should see first

```text
left side:
  headline + request composer + examples

right side:
  manual fragments transforming into a waking agent network
```

### What happens on submit

```text
story mode
  -> transition
  -> active mode
  -> user message
  -> assistant reply
  -> ranked matches
```

## Important Repo Findings

### Architecture to preserve

Keep:

```text
OpenvilleWorkspace
  -> RequestComposer
  -> useChatFlow
  -> repositories
  -> mock data now / backend later
```

This architecture is already correct.
The redesign should change presentation, story, mock coherence, and active-mode theming, not the core flow.

### Current implementation problems called out in research

1. The landing theme is still incoherent.
   Light-first shell plus isolated dark funnel section.

2. The story and mock data are still gutter-driven.
   This includes:
   - landing copy
   - storyboard fixtures
   - live candidate fixtures
   - search repository bias

3. The active mode still looks like a prototype.
   It needs to visually belong to the same world as the landing story.

4. The current scroll hooks are not stable enough to treat as final.
   `pnpm lint` currently fails in:
   - [HandoffSection.tsx](/Users/isaiahrivera/Documents/GitHubProjects/openville/features/landing/components/HandoffSection.tsx)
   - [useInView.ts](/Users/isaiahrivera/Documents/GitHubProjects/openville/hooks/useInView.ts)
   - [useScrollProgress.ts](/Users/isaiahrivera/Documents/GitHubProjects/openville/hooks/useScrollProgress.ts)

### Mock-data coherence requirement

The next implementation pass must update both:

- landing-story fixtures under `features/landing/`
- live search mocks under `features/shared/mocks/` and `features/shared/repositories/`

Reason:

If landing mode says `Launch Event Rescue` but active mode still returns gutter providers, the experience will feel broken.

## What The Plan Now Specifies

The new plan is materially more specific than before. It now locks:

### Story bible

- exact headline direction
- exact chapter beats
- exact handoff copy
- exact winner explanation
- exact loser explanations

### Visual system

- exact font strategy
- exact semantic token set
- exact chapter visual language
- exact tone ratio

### Mock data

- scenario constants
- 50-agent cluster distribution
- exact top 10
- exact top 3
- exact finalist outcome logic
- active-mode mock alignment requirement

### Motion

- per-chapter motion purpose
- essential vs decorative motion
- reduced-motion fallback behavior

### Component/file contract

- what stays in `OpenvilleWorkspace`
- which section files are rewritten in place
- which market subcomponents should be added
- which hooks are rewrite/refactor candidates

## Safe Resume Checklist

Before implementing, do this:

1. Run `git status --short --branch`
2. Confirm branch is still `feat/yirivera-landing`
3. Read:
   - [frontend-landing-redesign-hack-to-the-future research](/Users/isaiahrivera/Documents/GitHubProjects/openville/thoughts/research/frontend-landing-redesign-hack-to-the-future.md)
   - [frontend-landing-redesign-hack-to-the-future plan](/Users/isaiahrivera/Documents/GitHubProjects/openville/thoughts/plans/frontend-landing-redesign-hack-to-the-future.md)
4. Treat the new Hack to the Future plan as canonical over older landing plans
5. Start implementation from theme reset + story rewrite, not from piecemeal section polish

## Recommended Implementation Order

1. Theme reset
   - dark-first global token system
   - Space Grotesk font loading
   - active-mode theme continuity

2. Story and copy rewrite
   - remove gutters references
   - swap in Launch Event Rescue copy
   - update handoff and hero

3. Mock-data rewrite
   - landing fixtures
   - live candidate fixtures
   - search repository query behavior

4. Graph / market implementation
   - bridge preview in hero
   - 50-node market
   - top-10 arena
   - top-3 negotiation board
   - winner path

5. Active-mode styling pass
   - command-center styling
   - candidate card redesign
   - preserve existing flow behavior

6. Hook/lint cleanup
   - fix `useInView`
   - fix `useScrollProgress`
   - fix `HandoffSection` apostrophe lint issue

## Short Resume Prompt

```text
We are on feat/yirivera-landing.
Use thoughts/research/frontend-landing-redesign-hack-to-the-future.md and thoughts/plans/frontend-landing-redesign-hack-to-the-future.md as the source of truth.
Do not continue the old gutter-based landing direction.
Implement the dark-first Hack to the Future redesign around the Launch Event Rescue scenario, preserve the story->active architecture, and keep landing fixtures plus live mock results aligned to the same story.
```

## Stop Condition

This handoff ends at planning.

At handoff time:

- research is done
- plan is decision-complete enough to start implementation
- implementation has **not** started in this session
