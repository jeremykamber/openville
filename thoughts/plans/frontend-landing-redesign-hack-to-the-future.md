---
date: 2026-03-01T10:30:00-08:00
branch: feat/yirivera-landing
repository: openville
topic: "Frontend landing redesign plan — Hack to the Future / Bridge Builder"
tags: [plan, frontend, landing-page, hackathon, storytelling, ai-economy, bridge-builder]
status: active
supersedes: thoughts/plans/frontend-landing-experience-v2.md
last_updated: 2026-03-01
---

# Plan: Openville Landing Redesign for "Hack to the Future"

## Summary

Redesign the home page as a coherent story about bridging the past and the future through an AI economy.

This landing page should not read like a generic SaaS page or a prototype shell. It should feel like a proof-of-concept for a world where humans no longer manually coordinate fragmented service markets because their agent can enter a live agent economy on their behalf.

The core storytelling frame comes from the hackathon prompt:

```text
BRIDGE BUILDER
THE PAST
AI solutions that bridge unexpected gaps between disciplines that have historically rarely interacted.

When disciplines collide, barriers dissolve.
```

For Openville, the bridge is:

```text
manual service coordination
  + AI agent orchestration
  + marketplace ranking
  + negotiation logic
  + design-led storytelling
  = a visible AI economy
```

The redesigned page should make that bridge feel inevitable, visual, and memorable.

## Product Story

The human should no longer be the one doing:

- search
- vendor comparison
- callbacks
- quote negotiation
- scope clarification
- coordination under time pressure

Instead:

```text
human states need once
  -> personal agent interprets priorities
  -> request enters a multi-agent market
  -> specialist agents compete and advocate
  -> weak fits are eliminated
  -> finalists negotiate
  -> one winner is selected with explainable reasoning
  -> booking and notification complete the loop
```

This story is not just "AI helps with chores."
It is "AI merges historically separate disciplines":

- service marketplaces
- negotiation
- ranking systems
- autonomous coordination
- human-centered product design

That is how Openville fits the Bridge Builder theme.

## Narrative Thesis

Openville is a bridge between:

- the past world of manual coordination
- the future world of agent-mediated markets

The page must visually communicate:

```text
past friction
  -> human handoff
  -> agent economy activation
  -> elimination and negotiation
  -> justified winner
  -> future-state confidence
```

This needs to feel like a collision of disciplines that normally do not meet cleanly in one user-facing experience:

- labor marketplaces
- AI agents
- financial-style market behavior
- cinematic storytelling
- decision transparency

## Why the Current Direction Fails

The current landing direction is not good enough for the hackathon.

### Main problems

1. The theme is incoherent.
   The page starts light, then flips into a dark funnel section. That reads as a section-level styling choice, not a world.

2. The story is too generic.
   It explains product mechanics, but it does not dramatize the shift from past to future.

3. The mock scenario is weak.
   "Fix my gutters" is too small-stakes and too local to carry a broad hackathon story.

4. The agent economy is under-expressed.
   The nodes are not yet dense, alive, or interactive enough to feel like a real marketplace of agents competing.

5. The elimination story is too soft.
   The viewer needs to understand why agents survive and why they lose.

6. The experience risks looking like AI-generated UI.
   Generic cards, generic copy, generic color choices, and arbitrary dark/light switching create "AI slop" instead of intentional design.

## Chosen Direction

Use a hybrid of:

- a past-to-future timeline structure
- a living exchange/network visualization

This direction will be called:

```text
Signal Market
```

### Why this direction

The timeline structure gives the page narrative clarity.
The live node network gives the page spectacle and proof.

If we choose only timeline:
- story improves
- visual impact drops

If we choose only network spectacle:
- demo looks energetic
- meaning becomes muddy

This hybrid is the best fit for both the product and the hackathon framing.

## Canonical Demo Scenario

Replace the current gutters story with:

```text
Launch Event Rescue
```

### Protagonist

The human in the story is:

```text
an event producer trying to save tomorrow's product launch
```

Why this is locked:

- easiest role for judges to understand immediately
- naturally supports deadline pressure
- makes AV, staffing, logistics, and contingency feel coherent
- gives the human a concrete identity without overcomplicating the narrative

### Canonical request

"Tomorrow's launch event is at risk. I need AV setup, on-site support, and backup staffing by 4 PM. Keep costs tight, but reliability matters more than speed."

### Why this scenario fits

It supports:

- urgency
- high stakes
- multiple specialist domains
- visible trade-offs
- negotiation
- elimination logic
- stronger visual storytelling than a home-repair example

It also better reflects the hackathon prompt because it shows AI bridging:

- event operations
- staffing
- logistics
- negotiation
- service markets
- human priorities

### Tone Balance

The visual tone is locked to:

```text
live-system first
  + editorial discipline second
```

This means:

- the page should primarily feel like entering an active AI market
- editorial structure is used to control pacing and legibility
- the page should not read like a magazine spread with a small graph embedded inside it
- the network is the hero, not a supporting visual

## Research Principles Driving This Plan

This plan is being tightened with two explicit research-backed rules:

1. Progressive disclosure for information hierarchy.
   Front-load the primary action and the minimum amount of context needed to understand it, then reveal deeper system detail as the user scrolls.
   Source:
   https://www.nngroup.com/articles/progressive-disclosure/

2. Motion must be classed as essential or decorative.
   Essential motion can remain when it carries meaning. Decorative motion must have a reduced-motion fallback that preserves comprehension.
   Sources:
   https://www.w3.org/WAI/WCAG21/Techniques/css/C39.html
   https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions

Implication for this redesign:

- the hero must show one clear action and one clear promise, not all system detail at once
- the market reveal must deepen chapter by chapter
- every animation in the plan must have a narrative reason
- reduced-motion mode must preserve the story, not just suppress effects

## User Journey

```text
user lands on page
  -> sees the old world is fragmented and stressful
  -> understands they only need to state the problem once
  -> watches the request enter the AI economy
  -> sees many agents respond
  -> sees the system eliminate weak fits
  -> sees finalists negotiate
  -> sees the winner chosen for explicit reasons
  -> activates the real product flow
```

## Story Bible

This section locks the copy and chapter rhythm so the implementer does not invent the narrative during implementation.

### Hero copy

Overline:

```text
BRIDGE BUILDER / THE PAST
```

Headline:

```text
Post one request. Let the AI market compete for you.
```

Subheadline:

```text
Openville turns the old scramble of calls, quotes, and vendor guesswork into an agent-run market that ranks, negotiates, and books the best fit for your priorities.
```

Supporting microcopy:

```text
Tomorrow's launch is still on. Your agent handles the market from here.
```

Hero prompt chips:

- `Need AV, floor staff, and backup coverage by 4 PM tomorrow.`
- `Find the most reliable event ops team without blowing the budget.`
- `Get launch-day AV and onsite support locked in today.`

### Chapter copy

Chapter 1:

- Eyebrow: `THE PAST`
- Heading: `Before AI, saving an event meant running the whole market yourself.`
- Body: `Quotes lived in one tab, staffing texts in another, and the clock kept moving either way.`

Chapter 2:

- Eyebrow: `THE HANDOFF`
- Heading: `One request replaces the scramble.`
- Body: `Your agent extracts the job, the deadline, and the trade-offs without making you manage the market by hand.`

Chapter 3:

- Eyebrow: `THE MARKET`
- Heading: `Fifty specialist agents wake up and compete for the job.`
- Body: `AV crews, staffing reps, venue ops, logistics, and contingency agents all push for the work at once.`

Chapter 4:

- Eyebrow: `THE NARROWING`
- Heading: `The market cuts itself down to the ten strongest fits.`
- Body: `Weak scope, soft availability, and poor trade-offs drop out before you ever see them.`

Chapter 5:

- Eyebrow: `NEGOTIATION`
- Heading: `Three finalists negotiate on price, scope, and certainty.`
- Body: `Your agent pressures the finalists for better terms while protecting the deadline and full event scope.`

Chapter 6:

- Eyebrow: `THE DECISION`
- Heading: `One winner is selected, and the reason is visible.`
- Body: `The final choice is not magic. It is a clear trade-off between cost, scope coverage, and execution risk.`

Chapter 7:

- Eyebrow: `THE FUTURE`
- Heading: `You get the booking. Your agent handled the market.`
- Body: `The launch gets covered, the confirmation arrives, and the human only re-enters when it matters.`

### Handoff chat script

User message:

```text
Tomorrow's launch event is at risk. I need AV setup, on-site support, and backup staffing by 4 PM. Keep costs tight, but reliability matters more than speed.
```

Agent response:

```text
Understood. I am prioritizing full scope coverage, deadline certainty, and the strongest reliability-to-cost trade-off. I am opening the market now.
```

Pinned priorities:

- `Reliability: critical`
- `Budget: controlled`
- `Deadline: before 4 PM tomorrow`
- `Scope: AV + staffing + contingency`

### Winner decision copy

Winner statement:

```text
RelayCrew Systems wins because it covers AV, on-site support, and backup staffing inside the deadline, accepts a tighter price after negotiation, and carries the lowest execution risk.
```

Loser statement A:

```text
Bluewire AV Network lost because its AV quality was strongest, but staffing and contingency coverage still depended on subcontracting.
```

Loser statement B:

```text
StageSprint Ops lost because it could move fastest, but the surge premium and thinner fallback coverage created more risk than the event could tolerate.
```

## Visual System Spec

This section locks the theme so implementation does not drift.

### Font stack

Use:

- display: `Space Grotesk`
- body: existing `Geist Sans`
- data labels: existing `Geist Mono`

Implementation note:

- `app/layout.tsx` should load `Space Grotesk` alongside the existing Geist fonts
- no additional body font should be introduced

### Core token set

Add and use these exact semantic tokens:

- `--ov-bg-0: #07111d`
- `--ov-bg-1: #0d1726`
- `--ov-bg-2: #132033`
- `--ov-surface-0: rgba(9, 17, 29, 0.78)`
- `--ov-surface-1: rgba(19, 32, 51, 0.82)`
- `--ov-border: rgba(124, 170, 255, 0.16)`
- `--ov-text: #eef4ff`
- `--ov-text-muted: #94a4bc`
- `--ov-human: #f2bf7a`
- `--ov-human-soft: rgba(242, 191, 122, 0.14)`
- `--ov-signal: #67d7ff`
- `--ov-signal-strong: #9be9ff`
- `--ov-negotiation: #ffb24d`
- `--ov-winner: #ffd166`
- `--ov-eliminated: #536176`
- `--ov-success: #67d39a`

### Surface rules

Past-state surfaces:

- warm gray / dust tint
- dashed or broken borders
- slight rotation offsets
- lower contrast

Future-state surfaces:

- matte dark panels
- cool 1px border
- restrained internal glow only for active nodes or winner paths

### Section language by chapter

- Past = fragmented, angled, dusty, analog
- Handoff = aligned, clarified, warm
- Market = dense, layered, signal-rich
- Narrowing = ordered, ranked, strategic
- Negotiation = comparative, high-stakes, tactical
- Winner = calm, bright, resolved
- Active mode = live command center

### Layout rules

- Hero uses asymmetric 2-column composition on desktop
- left side = copy + composer
- right side = bridge preview from manual fragments into a waking network
- All major sections use `max-w-6xl`
- Story sections use larger vertical spacing than active mode
- Active mode tightens density and feels operational

## Mock Data Spec

This section locks the story data so both landing mode and active mode tell the same scenario.

### Scenario-wide constants

- event name: `Northstar Launch`
- event date: `tomorrow`
- hard deadline: `4:00 PM`
- location label: `Mission District`
- budget stance: `controlled, not cheapest at all costs`
- decision priority order:
  1. reliability
  2. full scope coverage
  3. timeline certainty
  4. negotiated cost

### Cluster distribution for 50-agent market

The 50 visible agents are distributed as:

- AV systems: `12`
- staffing and floor ops: `10`
- logistics and runner ops: `10`
- venue systems and on-site coordination: `8`
- backup and contingency networks: `10`

### Cluster naming rule

Agent names must sound like specialist service reps or operator networks, not generic AI agents.

Examples:

- `RelayCrew Systems`
- `Bluewire AV Network`
- `VenueGrid Support`
- `LastCall Logistics`
- `Switchboard Ops`
- `FrontRow Relay`
- `Contingent Loop`

### Exact top-10 survivors

The top 10 list is locked to:

1. `RelayCrew Systems`
2. `Bluewire AV Network`
3. `StageSprint Ops`
4. `VenueGrid Support`
5. `LastCall Logistics`
6. `SignalFrame Production Ops`
7. `FrontRow Relay`
8. `Switchboard Ops`
9. `Contingent Loop`
10. `HouseLight Crew`

### Exact top-3 finalists

Finalist 1:

- name: `RelayCrew Systems`
- role: integrated event ops
- opening price: `$4,800`
- negotiated price: `$4,350`
- scope: full
- guarantee: `Crew confirmed by 1 PM, full coverage by 4 PM`
- strength: full-scope coverage with lowest execution risk
- weakness: not the cheapest opening bid
- outcome: winner

Finalist 2:

- name: `Bluewire AV Network`
- role: premium AV lead
- opening price: `$4,200`
- negotiated price: `$4,050`
- scope: partial
- guarantee: `AV locked, staffing routed through partner network`
- strength: strongest AV reputation
- weakness: staffing + contingency are not fully owned
- outcome: loses on incomplete scope

Finalist 3:

- name: `StageSprint Ops`
- role: rapid deployment operations
- opening price: `$5,200`
- negotiated price: `$4,950`
- scope: full
- guarantee: `Fastest arrival window`
- strength: fastest mobilization
- weakness: surge pricing and thinner fallback coverage
- outcome: loses on cost/risk

### Active-mode mock alignment

The live search mocks in `features/shared/mocks/candidates.ts` and `features/shared/repositories/searchRepository.ts` must be rewritten to support the same `Northstar Launch` scenario.

That means:

- remove gutter-specific candidate copy
- remove gutter-specific query bias
- use event-ops-oriented candidate fixtures
- keep the same shared `Candidate` contract

## Motion and State Map

This section classifies motion so it is implementable and accessible.

| Chapter | Trigger | Essential Motion | Decorative Motion | Reduced-Motion Fallback |
|---|---|---|---|---|
| Hero | initial load | bridge preview fades from manual fragments to low-intensity network | subtle pulse glow behind live nodes | static split composition with no pulses |
| Old World | scroll into view | stacked fragments slide into readable positions | dust/noise shimmer | fragments appear already arranged |
| Handoff | section enters viewport | request bubble resolves into pinned priorities | warm highlight bloom | static request + priorities |
| Market | scroll progress | clustered nodes appear by group and establish connections | pulse packets along lines | nodes appear in final clustered positions |
| Top 10 | scroll progress | non-survivors dim and survivors reorganize into ranked lanes | small rank flicker | swap directly to ranked lane layout |
| Top 3 | scroll progress | three finalists expand into negotiation board | minor connector pulse | direct fade between top-10 and top-3 states |
| Winner | scroll progress | winner path brightens and losers recede | soft halo on winner card | static winner card with reason text |
| Activation | submit | story shell compresses and active mode expands in place | background signal drift | immediate shell swap with no scale effect |

### Motion rules

- Essential motion carries meaning and may remain in a simplified form.
- Decorative motion must disappear under reduced motion.
- No chapter should rely on motion alone to explain state change.
- Every stage change must also include copy or label reinforcement.

## Component and File Contract

This section locks ownership so implementation stays modular.

### Keep as route-level orchestrator

- `features/chat/components/OpenvilleWorkspace.tsx`

Responsibilities:

- own `story | transitioning | active`
- wire hero/footer submit into `useChatFlow`
- mount story sections
- mount active chat/results mode
- own the transition between the two

### Keep and restyle, do not replace

- `features/chat/components/RequestComposer.tsx`
- `features/search/components/CandidateResults.tsx`
- `features/search/components/CandidateCard.tsx`

Required additions:

- `RequestComposer` supports `variant: "landing" | "active"`
- active-mode search cards must visually adopt the command-center theme

### Rewrite existing top-level landing sections in place

- `features/landing/components/HeroSection.tsx`
- `features/landing/components/OldWaySection.tsx`
- `features/landing/components/HandoffSection.tsx`
- `features/landing/components/FunnelSection.tsx`
- `features/landing/components/FinalistSection.tsx`
- `features/landing/components/ClosureSection.tsx`

Reason:

- avoids unnecessary rename churn
- preserves current import surface
- keeps the story shape familiar while replacing the actual content and visuals

### Add graph subcomponents

```text
features/landing/components/market/
  AgentMarketGraph.tsx
  BridgePreview.tsx
  PriorityRail.tsx
  ClusterLegend.tsx
  TopTenArena.tsx
  NegotiationBoard.tsx
  WinnerPath.tsx
  MarketNode.tsx
  MarketConnector.tsx
```

### Hooks

Existing hooks are not yet stable enough to treat as final.

- `hooks/useInView.ts`
- `hooks/useScrollProgress.ts`

Implementation requirement:

- either rewrite or refactor both hooks so they pass lint
- both hooks must keep reduced-motion behavior
- both hooks must be deterministic enough for staged SVG/CSS transitions

## System Framing

### UI surface

The landing page becomes a cinematic, dark-first narrative surface with:

- hero request composer
- collapsing old-world fragments
- handoff moment
- dense node network
- elimination stages
- finalist negotiation board
- winner reasoning
- closure and activation CTA

### State / orchestration

No architectural rewrite is needed.
The page should continue to use:

```text
UI
  -> useChatFlow
  -> repositories
  -> mock data now / backend later
```

The landing story remains presentation-first.
The live product still activates through the real `RequestComposer`.

### Domain logic

No new shared contracts should be introduced for this redesign by default.

Landing-only types stay local under `features/landing/`.
They represent story data, not canonical backend-facing domain contracts.

### Persistence / integrations

Unchanged.
No route expansion is required.
No backend changes are required.

### Observability / testing

This redesign needs:

- responsive verification
- reduced-motion behavior
- keyboard accessibility
- preserved chat/results interaction states
- stable unique message IDs in active mode

## Visual Identity

## Theme

Dark-first, continuous, atmospheric, and signal-rich.

The page should feel like one world, not multiple unrelated sections.

### Tone hierarchy

The final ratio should be treated as:

```text
70% live system
30% editorial control
```

Implications:

- large graph-led sections
- visible system state and ranking logic
- typography and spacing keep the experience intelligible
- avoid over-indexing on poster-like layouts that weaken the product proof

### Color logic

Use color to communicate state:

- past = muted, dusty, analog
- present handoff = warm human signal
- active agent market = electric cyan / vivid signal blue
- negotiation pressure = amber
- eliminated candidates = cold desaturated slate
- winner = warm bright amber with controlled glow

### Important rule

Do not use:

- random purple gradients
- arbitrary white-to-black section inversion
- generic glassmorphism everywhere
- default "startup blue" with no narrative reason

### Typography

Typography is locked by the visual system spec above.

Use:

- display: `Space Grotesk`
- body: existing `Geist Sans`
- data labels: existing `Geist Mono`

## Story Structure

## Chapter 1: The Old World

Purpose:
Show the fragmented manual process.

Visual treatment:

- scattered quote fragments
- missed call cards
- vendor tabs
- spreadsheet-like comparison scraps
- desaturated, tired-looking artifacts

Important:
Do not use a clean row of three pain cards.
That is too generic and too polished for the "past."

The past should look overloaded, messy, and manually stitched together.

### Required visual bridge mechanic

The bridge from past to future is not just copy.
It must be a literal transformation:

```text
quote fragments
  + missed calls
  + scheduling scraps
  + vendor tabs
    -> collapse into parsed priorities
    -> feed the network
    -> become ranked contenders
```

This is the core Bridge Builder visual.
If this transformation is not legible, the page is missing the hackathon theme.

## Chapter 2: The Handoff

Purpose:
Show the exact moment where the human steps out of the coordination burden.

Visual treatment:

- one request bubble
- one agent response
- extracted priorities rendered as pinned tags
- the old-world fragments collapse away

Narrative:

```text
human intention
  -> agent understanding
  -> market activation
```

## Chapter 3: The Agent Market Wakes Up

Purpose:
Deliver the first real wow moment.

Visual treatment:

- a large, living network of 50 agents
- category/cluster-based grouping
- signal lines pulsing between nodes
- subtle role differentiation
- cluster labels

This must feel like a market, not a particle effect.

Suggested clusters:

- AV
- staffing
- logistics
- venue ops
- backup support

### Hero requirement

The first screen must already hint at the bridge:

```text
manual chaos
  -> single human request
  -> market waking up
```

Do not defer the market reveal until later sections.
The hero should contain a controlled preview of the living system, even before the full market section.

## Chapter 4: Elimination Engine

Purpose:
Make the ranking logic visible.

Stages:

```text
50 agents
  -> top 10
  -> top 3
  -> negotiation
  -> winner
```

Each elimination must tell the viewer something.

Examples:

- too expensive
- partial scope only
- availability uncertainty
- slower response
- weaker track record

The network should visibly restructure between stages, not simply fade items in and out.

### Stage-specific layout rules

Desktop:

- `50` = dense clustered graph
- `10` = ranked arena / lane layout
- `3` = negotiation triangle / decision room
- `1` = central winner path

Mobile:

- `50` = simplified cluster map with fewer visible labels
- `10` = condensed ranked list or chip-lane hybrid
- `3` = stacked finalist cards with persistent mini-map context
- `1` = single winner card with reason summary

Implementation rule:

- no true force simulation
- no canvas dependency
- no WebGL dependency
- use deterministic SVG / CSS layouts with state transitions

## Chapter 5: Negotiation Board

Purpose:
Show the agent-to-agent economy directly.

The top three finalists need richer information:

- opening bid
- revised bid
- scope coverage
- reliability confidence
- delivery guarantee
- compromise note
- why they are still alive

This section should feel like a decision room, not a row of generic cards.

### Finalist outcome logic

The finalist logic is locked:

1. one finalist loses because scope coverage is incomplete
2. one finalist loses because it introduces too much cost or execution risk
3. one finalist wins because it satisfies the full scope with the best reliability-to-cost trade-off

This logic must be visible in both copy and visual annotations.

## Chapter 6: Winner and Why

Purpose:
Prove the selection was not arbitrary.

Show:

- winner
- winner reason
- why finalist A lost
- why finalist B lost
- how priorities influenced the outcome

The winner explanation should read like an agentic decision, not marketing copy.

## Chapter 7: Future State / Activation

Purpose:
Move from story into real product.

The current same-page activation model stays.

That means:

- user submits from the hero or closing CTA
- landing story transitions out
- active chat/results flow appears
- visual language remains consistent

The active mode must feel like entering the live system, not leaving the designed story.

### Active-mode styling requirement

The active product surface should inherit the same world:

- dark shell
- same accent logic
- same typography hierarchy
- candidate result cards styled as live contenders, not default neutral cards

If active mode looks like a generic prototype, the redesign is not complete.

## Motion Direction

Chosen direction:

```text
High Drama
```

### Motion goals

- make the market feel alive
- make eliminations legible
- create memorable beats for the demo
- avoid gimmick motion outside the key narrative moments

### Allowed motion

- node pulses
- connection travel
- clustering / regrouping
- elimination ghosting
- winner emphasis
- old-world fragment collapse
- chapter reveal transitions

### Motion guardrails

- motion should not compete with the copy
- typography should remain stable
- use transform and opacity where possible
- reduced motion must downgrade to readable static transitions

## Mock Data Redesign

The current mock data is not good enough.

### Problems with current fixtures

- too low stakes
- too homogeneous
- not enough cluster identity
- finalists are not differentiated enough
- not enough elimination reasoning

### Replace with richer local landing-only fixtures

Need local fixtures for:

1. scenario definition
2. pinned priorities
3. 50 market agents
4. top 10 contenders
5. top 3 finalists
6. winner reasoning
7. loser explanations

### Data shape goals

Each visible agent should feel specialized.
The market should not look like 50 clones.

At minimum, each market agent should support:

- id
- display name
- cluster
- specialty
- speed
- reliability
- baseline quote
- availability confidence
- negotiation flexibility
- survivedTo

Each finalist should support:

- opening price
- negotiated price
- scope coverage
- guarantee window
- strength list
- weakness
- negotiation summary
- final outcome

All of this remains local to `features/landing/`.

## Important Interfaces and Boundaries

### Shared contracts

Do not change by default:

- `features/shared/contracts/Candidate.ts`
- `features/shared/contracts/UserPreferences.ts`
- `features/shared/contracts/SearchContracts.ts`

Reason:
The landing redesign is not the place to create backend-facing type churn.

### RequestComposer

May be extended in a backwards-compatible way if needed for themed landing usage.

Allowed additions:

- `variant?: "landing" | "active"`
- `examples?: string[]`
- `onExampleClick?: (example: string) => void`

### OpenvilleWorkspace

Remains the route-level orchestrator.

Responsibilities:

- mount story mode
- handle transition state
- mount active chat/results mode
- preserve same-page activation

### Landing-only components

Use the component/file contract above as the canonical ownership model.

That means:

- rewrite the existing top-level section files in place
- add graph-specific market subcomponents under `features/landing/components/market/`
- do not create a second competing section hierarchy

## Implementation Phases

## Phase 1: Theme Reset

- replace the current mixed-theme landing direction
- define a single dark-first token system
- align both story mode and active mode to the same visual world

## Phase 2: Story Rewrite

- remove gutters copy
- rewrite all hero and supporting copy around Launch Event Rescue
- align the framing to Bridge Builder / past-to-future / cross-discipline AI economy

## Phase 3: Data Rewrite

- replace current storyboard fixtures
- add cluster-specific agents
- add explicit elimination reasons
- add richer top-3 negotiation data

## Phase 4: Graph and Story Sections

- rebuild the network visualization
- rebuild the old-world section
- rebuild the handoff section
- create clearer top-10 and top-3 stages
- make the winner explanation explicit

## Phase 5: Active Mode Continuity

- ensure the live chat/results experience visually belongs to the same world
- prevent the active mode from feeling like a fallback prototype

## Phase 6: Verification

- responsive pass
- keyboard pass
- reduced-motion pass
- story clarity pass
- hackathon demo pass

## Acceptance Criteria

The redesign is complete when:

1. the page feels like one coherent theme
2. the past-to-future story is obvious within 30 seconds
3. the AI economy feels alive and competitive
4. the Launch Event Rescue scenario feels more compelling than the current mock
5. the user can explain why the winner won
6. the live product activation still works
7. the landing does not look like generic AI-generated UI

## Self-Critique

Before coding, the team should challenge this plan on these points.

### Risk 1: Too much spectacle, not enough comprehension

If the node network is visually impressive but the viewer cannot follow the elimination logic, the story fails.

Countermeasure:

- stage labels must be explicit
- pinned priorities must stay visible
- eliminations need reasons, not just visual disappearance

### Risk 2: Hackathon prompt fit could still be too implicit

If we only say "AI economy" without making the cross-discipline bridge obvious, we underuse the Bridge Builder framing.

Countermeasure:

- explicitly frame the product as bridging human coordination, service markets, negotiation, and autonomous agents
- make the old-world and future-world contrast central, not secondary

### Risk 3: Dark theme could become cyberpunk cliche

A dark-first experience is correct, but an undisciplined one can look juvenile or derivative.

Countermeasure:

- limited accent palette
- strong typography hierarchy
- no gratuitous glitch effects
- intentional negative space around the network

### Risk 4: The active product mode might still feel disconnected

If the story mode is polished and the active mode still looks like a dev slice, the transition will weaken trust.

Countermeasure:

- restyle active mode in the same theme famiy
- make transition feel like entering the live system

### Risk 5: The mock scenario could become over-complex

Launch Event Rescue is richer, but it introduces more moving parts.

Countermeasure:

- keep the human request readable in one sentence
- keep the top-three decision criteria focused on 3 to 4 variables

## Decisions Locked

These decisions are now the default unless explicitly changed:

- theme = timeline + network hybrid
- tone = cinematic, strategic, future-facing
- tone balance = live-system first, editorial discipline second
- scenario = Launch Event Rescue
- protagonist = event producer saving tomorrow's product launch
- structure = past -> handoff -> market -> elimination -> winner -> activation
- activation = same-page transition
- motion = high drama with reduced-motion fallback
- contracts = shared contracts unchanged
- landing data = local fixtures only

## Stop Condition

This file is the planning stop point.

Do not start implementation until the following is confirmed in chat:

1. the Bridge Builder framing feels explicit enough
2. the theme direction feels right
3. the Launch Event Rescue scenario feels like the correct story
4. the self-critique risks are acceptable
