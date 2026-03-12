---
artifact_type: plan
substantial: true
critique_completed: true
critique_cycles: 2
critique_artifacts: ["/Users/isaiahrivera/Documents/GitHubProjects/openville/.planning/critique/2026-03-11-150104-main-page-rag-workflow-plan-critique.md", "/Users/isaiahrivera/Documents/GitHubProjects/openville/.planning/critique/2026-03-11-152149-main-page-rag-workflow-plan-critique.md"]
refinement_cycles: 4
blocking_unknown_count: 0
dependency_map_present: true
verification_defined: true
rollout_defined: true
plan_ready_for_implementation: true
related_research: ["/Users/isaiahrivera/Documents/GitHubProjects/openville/thoughts/research/2026-03-11-main-page-rag-workflow-research.md"]
last_validated: 2026-03-11
---

# Agent Economy Redesign Plan

Date: 2026-03-11
Repo: `/Users/isaiahrivera/Documents/GitHubProjects/openville`
Primary route: `/Users/isaiahrivera/Documents/GitHubProjects/openville/app/page.tsx`

## Summary

Rebuild `/` as a homepage-first AI agent economy arena instead of a generic workflow dashboard. The page should become a single live product surface with five connected moments:

1. buyer brief intake
2. ranked market elimination
3. top-10 board
4. top-3 showdown
5. final verdict with an inspector rail

`/agents/rag-workflow` stays as a secondary debug/reference route and is not redesigned in this pass.

The new direction is a warm-dark market arena / protocol command center with less marketing filler and more visible agent competition, elimination pressure, and decision evidence. Copy stays horizontally framed for a general service market, but the default demo story should use one cinematic flagship scenario so the market mechanics feel concrete.

## Why This Fits The Repo

- The repo already routes `/` through `OpenvilleWorkspace` and `useOpenvilleFlow`.
- The backend flow for search, shortlist, negotiation, winner selection, and workflow status already exists.
- The current gap is product framing and information hierarchy, not lack of workflow infrastructure.
- The repo already exposes enough data to show a meaningful AI agent economy if the frontend stops treating it like a sequence of generic card grids. Cards are fine when used deliberately (e.g. one card for a single candidate detail), but should not be the default layout primitive for every surface.

## Implementation Changes

### 1. Product framing and layout

- Replace the current stacked operator surface with a three-zone homepage:
  - `Market Intake` hero for request entry and quick controls
  - `Arena Board` main stage for top 10, eliminations, and top 3 showdown
  - `Inspector Rail` for context, workflow readiness, reasoning summaries, and trace artifacts
- Make the first screen immediately actionable. The request composer should feel like posting to the market, not filling out a utility form.
- Keep `useOpenvilleFlow` as the orchestration source of truth. This is a UI and view-model redesign, not a new backend path.
- Keep the detailed context form as the explicit edit boundary before search runs, but visually demote it behind the intake hero and inspector framing.

### 2. Visible market funnel

- Reframe ranked results as a `Top 10 board` using the existing spatial graph visualization, not a card grid. Agents appear as nodes with rank badges and score indicators.
- Add explicit elimination storytelling for candidates outside the top 3:
  - surviving agents (top 10) stay visible as highlighted nodes with rank and key signal
  - eliminated agents (ranks 4-10 at the showdown stage) get dimmed with a brief elimination reason tooltip/label — not a full card each
- Use available ranking data directly where real today:
  - score
  - relevance
  - rating
  - success count
  - price / availability / specialties
- Add a frontend-only derived elimination reason adapter for candidates ranked 4-10 using available ranking signals.
- Label those elimination reasons as inferred market rationale, not backend-provided truth.
- The top 10 rendering should feel like a living market map, not a list of 10 cards stacked vertically.

### 3. Top 3 showdown — agent pitch visualization

The showdown is the signature visual moment. Replace the current shortlist/negotiation stack with a spatial agent visualization, not a card grid.

#### Layout: 1 central agent + 3 surrounding agents

- One **job poster agent** sits at the center of the visualization. This represents the buyer's request — the central authority the finalists are pitching to.
- Three **finalist agents** are positioned around the central agent (roughly triangular spacing). Each represents one of the top-3 candidates.
- All four agents have **thought bubbles** that animate in sequence during the pitch phase:
  - each finalist's bubble shows their pitch reasoning (why their human is the best fit, key strengths, offer terms)
  - the central job poster agent's bubble shows its evaluation (weighing trade-offs, comparing offers, identifying risks)

#### Visual behavior

- **Before negotiations run:** The 3 finalist agents are visible around the center but their thought bubbles are empty/collapsed. The central agent shows "Waiting for pitches..."
- **During negotiations:** Thought bubbles animate in one at a time (staggered). Each finalist's bubble fills with a short pitch summary derived from negotiation outcome data. The central agent's bubble updates as it "listens" — showing brief evaluation notes.
- **After winner selection:** The winning agent's node scales up and glows. The losing agents dim. The central agent's bubble shows the final verdict reasoning. Connection lines from the winner to the center strengthen; loser connections fade.

#### Data mapping

- Finalist pitch content comes from `FinalistShowdownViewModel`: survival reason, negotiated price, scope stance, strength, weakness
- Central agent evaluation comes from winner selection response: comparison strengths/weaknesses, priority alignment, tradeoff rationale
- The visualization reuses the existing `MarketNode` component's positioning and state system (already supports `finalist`, `winner`, `dimmed` states) and extends it with a thought bubble overlay

#### What this replaces

- The current pitch card per finalist is removed. The pitch content moves into the thought bubbles.
- The finalist podium is now the spatial visualization, not a row of cards.
- One action to run negotiations, one action to select the winner — same controls, different visual treatment.

#### Verdict

- Keep winner selection on the existing `/api/agents/select-winner` contract.
- After selection, the visualization transitions to verdict state: winner highlighted, central agent bubble shows the decision rationale (chosen candidate, main tradeoff, confidence).
- A small summary strip below the visualization shows the final price and key comparison points — not a full comparison card grid.

### 4. Inspector and trace visibility

- Upgrade the current evidence, status, and protocol surfaces into one coherent inspector rail.
- Show real data already available in the repo:
  - workflow readiness and degraded-mode warnings from `/api/workflow/status`
  - execution meta from search, negotiation, and winner responses
  - winner comparison strengths, weaknesses, and priority alignment
  - transcript-style status messages already generated in `useOpenvilleFlow`
  - negotiation thread messages via existing `GET /api/agents/negotiate/[id]`
- The source of negotiation IDs for thread retrieval is `NegotiationOutcomeTransport.negotiationId` from the `runNegotiations` response, not `selectionResult.negotiationIds` (which is typed but not reliably populated by the current backend search-and-select flow).
- Add a typed client read path for negotiation detail retrieval so the UI can render actual buyer/provider thread excerpts after negotiations complete.
- Expose trace artifacts as structured blocks, not generic logs:
  - ranking signals
  - shortlist reasoning
  - negotiation thread excerpts
  - fallback warnings
  - final decision comparison
- Keep `real vs inferred` explicit:
  - real: workflow status, ranked candidates, shortlist reasoning, negotiation outcomes, negotiation messages, winner comparison
  - scaffolded: elimination rationale for ranks 4-10, arena labels, some pitch composition if backend does not provide richer narrative text

### 5. Interfaces and boundaries

- Keep existing backend request and response contracts for:
  - `searchAndSelect`
  - `runNegotiations`
  - `selectWinner`
  - `workflow/status`
- Add only frontend-facing types and adapters needed for the new surfaces:
  - `EliminationCandidateViewModel`
  - `FinalistShowdownViewModel` — extended with `pitchText` (short pitch summary for thought bubble) and `evaluationNotes` (central agent's assessment)
  - `NegotiationThreadViewModel`
  - `InspectorArtifactViewModel`
  - `AgentPitchSceneState` — tracks the visualization phase (`idle` | `pitching` | `evaluating` | `verdict`) and controls thought bubble animation sequence
- Add a read-only repository method for negotiation detail fetch using the existing endpoint shape from `GET /api/agents/negotiate/[id]`.
- Keep mock-vs-real separation at the adapter/repository layer. Components should consume canonical or explicit view-model shapes only.

## Expected Files To Change

- `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/chat/components/OpenvilleWorkspace.tsx`
- `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/chat/components/MarketCommandDeck.tsx`
- `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/chat/components/MarketExecutionSurface.tsx`
- `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/chat/components/MarketEvidenceRail.tsx`
- `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/chat/components/ProtocolLog.tsx`
- `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/search/components/CandidateResults.tsx`
- `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/search/components/CandidateCard.tsx`
- `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/workflow/components/ShortlistPanel.tsx`
- `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/workflow/components/NegotiationPanel.tsx`
- `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/workflow/components/WinnerPanel.tsx`
- `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/workflow/components/WorkflowStatusPanel.tsx`
- `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/workflow/client/types.ts`
- `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/workflow/client/adapters.ts`
- `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/workflow/client/repository.ts`
- `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/workflow/hooks/useOpenvilleFlow.ts`
- `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/landing/components/market/AgentMarketGraph.tsx`
- `/Users/isaiahrivera/Documents/GitHubProjects/openville/features/workflow/client/__tests__/adapters.test.ts`

Possible new files:

- `features/landing/components/market/ThoughtBubble.tsx` — animated thought bubble overlay for the agent pitch visualization
- a negotiation thread inspector component under `features/chat/components/` or `features/workflow/components/`
- `features/landing/components/market/AgentPitchVisualization.tsx` if the pitch scene logic outgrows `ShortlistPanel` during implementation

## Phases

Each phase leaves `/` in a working state. Phases are sequential; each depends on the previous.

### Phase 1 — Interfaces, types, and adapter foundation (4 files)

Goal: All new view-model types, the negotiation detail repository method, and adapter functions exist and are tested. No UI changes yet.

Files:
- `features/workflow/client/types.ts` — add `EliminationCandidateViewModel`, `FinalistShowdownViewModel` (with `pitchText` and `evaluationNotes` fields), `NegotiationThreadViewModel`, `InspectorArtifactViewModel`, `AgentPitchSceneState`, and the `NegotiationDetailResponse` type for the `GET /api/agents/negotiate/[id]` payload
- `features/workflow/client/adapters.ts` — add `toEliminationViewModels`, `toFinalistShowdownViewModels` (including `composePitchText` helper that derives a short thought-bubble pitch from negotiation outcome fields), `toNegotiationThreadViewModel`, `toInspectorArtifacts` adapter functions; all new adapters must use explicit field picks from `Candidate` (not spread) to avoid leaking the index signature
- `features/workflow/client/repository.ts` — add `getNegotiationDetail(negotiationId: string)` calling `GET /api/agents/negotiate/[id]`; note that `NegotiationMessage.createdAt` arrives as a JSON string and must be parsed to `Date` or kept as an ISO string in the view-model
- `features/workflow/client/__tests__/adapters.test.ts` — add tests for all new adapters

Risk mitigation:
- **Index signature leakage:** `Candidate` has `[key: string]: unknown` at `features/agents/selection/types/Candidate.ts:24`. Every new adapter must use explicit `Pick<Candidate, 'id' | 'name' | ...>` field selection — never object spread. Pattern: `const vm: EliminationCandidateViewModel = { id: candidate.id, name: candidate.name, ... }`. No shorthand spreading allowed.
- **Type-safety test:** Add at least one test per adapter that asserts the output type does NOT accept arbitrary string keys. Concretely: pass a `Candidate` with an extra unknown field through the adapter and verify the adapter output does not include it. This proves the `Pick<>` boundary is enforced at runtime, not just at compile time.

Depends on: nothing
Shippable: yes — no UI change, old layout still renders

### Phase 2 — Inspector rail and evidence surface (4 files)

Goal: The right-side inspector rail renders workflow status, execution meta, trace artifacts, and negotiation thread excerpts. Replaces the current evidence/protocol surfaces.

Files:
- `features/chat/components/MarketEvidenceRail.tsx` — refactor to become the inspector rail container; render `WorkflowStatusPanel`, trace artifact blocks, and the negotiation thread inspector
- `features/workflow/components/WorkflowStatusPanel.tsx` — update to fit inside the inspector rail layout
- `features/chat/components/ProtocolLog.tsx` — refactor into structured trace blocks (ranking signals, shortlist reasoning, fallback warnings, decision comparison) instead of a generic log
- New file: `features/workflow/components/NegotiationThreadInspector.tsx` — renders buyer/provider message thread from `NegotiationThreadViewModel`; shows loading, error (404 = "thread not available", 500 = "failed to load thread"), and empty states

Depends on: Phase 1 (view-model types and repository method)
Shippable: yes — inspector rail works with current layout; arena board not yet changed

Risk mitigation:
- **Concurrent negotiation detail fetches:** If the user clicks different negotiation threads in rapid succession, `getNegotiationDetail` could return stale data for a previous request. Solution: use an `AbortController` per fetch call. Each new call to `fetchNegotiationDetail` aborts the previous in-flight request. The hook stores the controller ref and calls `controller.abort()` before initiating the next fetch. Aborted fetches resolve silently (do not trigger error state).
- **Empty messages vs 404 distinction:** A 200 response with `messages: []` means the negotiation happened but produced no messages (edge case, but possible). A 404 means the thread does not exist at all. UX treatment differs: empty messages shows "No messages in this negotiation" in the thread inspector. 404 shows "Thread not available" in muted text. The adapter must distinguish these two cases by checking the HTTP status before mapping.
- **negotiationId present but detail returns 404:** This is a backend inconsistency — the negotiation outcome included an ID, but the detail endpoint has no record. The inspector should show "Thread not available — negotiation may still be processing" with no retry action (since retrying a 404 is unlikely to help). Log a console warning with the mismatched negotiationId for debugging.

### Phase 3 — Arena board with agent pitch visualization (6 files)

Goal: The center stage renders the market graph with elimination treatment, the top-3 agent pitch visualization (3 finalists + 1 central job poster agent with thought bubbles), and the verdict summary. Replaces the current results/shortlist/negotiation/winner stack.

Files:
- `features/search/components/CandidateResults.tsx` — refactor to drive the market graph's top-10 stage; feed `EliminationCandidateViewModel` data to `AgentMarketGraph` for elimination labels on dimmed nodes
- `features/landing/components/market/AgentMarketGraph.tsx` — extend to accept real workflow data (not just fixtures); add a `top3-pitch` stage that transitions into the agent pitch visualization layout
- `features/workflow/components/ShortlistPanel.tsx` — refactor into the `AgentPitchVisualization` container: positions 3 finalist nodes around 1 central job poster node, manages thought bubble animation sequence
- `features/workflow/components/NegotiationPanel.tsx` — integrate negotiation outcome into thought bubble content for each finalist agent
- `features/workflow/components/WinnerPanel.tsx` — refactor into the `VerdictSummary`: winner node highlights, central agent bubble shows verdict reasoning, small summary strip below (not a comparison card grid)
- New file: `features/landing/components/market/ThoughtBubble.tsx` — animated thought bubble overlay positioned relative to a `MarketNode`; supports staggered reveal, typing effect for pitch text, and collapse/expand states

Depends on: Phase 1 (adapters), Phase 2 (inspector rail exists for trace context)
Shippable: yes — arena board works with existing layout shell; intake zone not yet changed

Edge case handling for this phase:
- If search returns 3 or fewer candidates, the elimination section is hidden entirely (no empty elimination board)
- Elimination reasons render as tooltips or small labels near dimmed nodes, with an explicit "Inferred" marker so they are never confused with backend-provided data
- If negotiations have not run yet, finalist thought bubbles show collapsed/empty state with "Awaiting pitch..." placeholder
- Central agent node should handle the case where winner selection response is missing comparison data gracefully (show verdict text only, skip comparison)

Risk mitigation:
- **Animation interruption on unmount or workflow reset:** If the user resets the workflow or navigates away while thought bubbles are mid-animation (staggered reveal or typing effect), pending timeouts and animation frames must be cleaned up. Solution: `ThoughtBubble` uses `useEffect` cleanup to cancel any `setTimeout`/`requestAnimationFrame` handles on unmount. The `AgentPitchVisualization` container tracks animation state in a ref and resets it when the workflow stage regresses (e.g. user starts a new search). No orphaned timers, no state updates on unmounted components.
- **Performance budget for animations:** Thought bubble typing effect and staggered reveal must maintain 30fps on a mid-range device. If profiling shows frame drops, degrade to instant reveal (no typing animation) or respect `prefers-reduced-motion` by skipping all stagger delays and showing final state immediately.

### Phase 4 — Layout integration, intake zone, and polish (4 files)

Goal: `OpenvilleWorkspace` restructures from a stacked layout into the three-zone homepage (Market Intake, Arena Board, Inspector Rail). The intake hero replaces the current request entry surface.

Files:
- `features/chat/components/OpenvilleWorkspace.tsx` — restructure component tree into three-zone grid; thread `useOpenvilleFlow` data to the correct zones
- `features/chat/components/MarketCommandDeck.tsx` — refactor into the Market Intake hero zone (request composer + quick controls)
- `features/chat/components/MarketExecutionSurface.tsx` — refactor to be the Arena Board container hosting the components from Phase 3
- `features/workflow/hooks/useOpenvilleFlow.ts` — add `negotiationDetail` async resource state and a `fetchNegotiationDetail` method using the Phase 1 repository method; keep the hook under 700 lines or extract a `useNegotiationDetail` sub-hook

Depends on: Phase 2 (inspector rail), Phase 3 (arena board components)
Shippable: yes — full redesign live

## Component Hierarchy

After Phase 4, the component tree looks like:

```
OpenvilleWorkspace (useOpenvilleFlow)
├── MarketIntakeZone (MarketCommandDeck)
│   ├── RequestComposer (input, prepareRequest)
│   ├── QuickControls (speed preset, budget)
│   └── ContextForm (collapsed by default, expand to edit)
├── ArenaBoardZone (MarketExecutionSurface)
│   ├── MarketGraph (AgentMarketGraph, spatial node visualization)
│   │   ├── MarketNode × N (all agents, clustered → top 10 → top 3 transitions)
│   │   └── EmptyState (when search returns 0)
│   ├── AgentPitchVisualization (top-3 showdown scene)
│   │   ├── CentralAgentNode (job poster agent, center)
│   │   ├── FinalistAgentNode × 3 (surrounding, with thought bubbles)
│   │   └── ThoughtBubble (animated pitch/evaluation text)
│   └── VerdictSummary (winner highlight + summary strip, not a card grid)
└── InspectorRailZone (MarketEvidenceRail)
    ├── WorkflowStatusPanel (readiness, degraded warnings)
    ├── TraceBlocks (ProtocolLog, structured artifacts)
    └── NegotiationThreadInspector (buyer/provider messages)
```

## Rollout

Strategy: **phase-commit with working homepage at each boundary.**

Each phase is a separate PR or commit group. After each phase merges, `/` must render without errors and pass `npm run build`. There is no feature flag; instead, each phase is designed so that:

- Phase 1 changes no UI. Zero visual regression risk.
- Phase 2 replaces the evidence rail but the rest of the layout is unchanged. If the inspector rail has issues, the old evidence components can be reverted independently.
- Phase 3 replaces the center stage components. If any arena board component breaks, the individual component file can be reverted to its pre-phase-3 state because the layout shell from Phase 4 has not landed yet.
- Phase 4 ties the zones together. This is the highest-risk phase. If it breaks, revert Phase 4 only — Phases 1-3 remain safe because they work inside the existing layout.

Rollback path: `git revert` the latest phase. Each phase touches a distinct set of files with no overlap, so reverting one phase does not affect others.

If Phase 4 integration proves too risky as a single step, split it into:
- 4a: `OpenvilleWorkspace` layout restructure only (grid change, prop threading)
- 4b: intake zone and hook additions

## Test Plan

- Add or update adapter/unit tests for:
  - top-10 to elimination/showdown view-model mapping (~4 tests: full 10, exactly 3, fewer than 3, empty)
  - real-vs-inferred artifact labeling (~2 tests: artifact with real source, artifact with inferred source)
  - negotiation detail mapping from API payload to inspector thread view-model (~3 tests: happy path with messages, empty messages array, Date-as-string parsing)
  - winner verdict mapping and comparison rendering inputs (~2 tests: standard winner, winner with missing comparison entries)
  - elimination reason derivation (~3 tests: cost-eliminated, score-eliminated, multi-signal elimination)
  - pitch text composition (~2 tests: full negotiation data produces pitch text, missing fields produce graceful fallback)
  - index signature leakage prevention (~1 test per adapter: pass a `Candidate` with extra unknown fields through the adapter, verify the output does not include them)
  - Estimated total: ~20 new test cases on top of the existing 5 in the test file
- Run `npm run lint`.
- Run `npm run test:run`.
- Run `npm run build`.
- Manual verification on desktop and mobile for:
  - idle homepage
  - request prepared but market not run
  - search loading
  - top 10 success — agents visible as nodes in spatial graph, not a card list
  - empty search
  - degraded workflow readiness
  - agent pitch visualization — 3 finalists + 1 central agent with thought bubbles animating in sequence
  - thought bubble states: empty/awaiting, pitching, evaluating, verdict
  - negotiation loading and success
  - negotiation failure
  - winner loading and success — winner node highlights, loser nodes dim, central bubble shows verdict
  - inspector thread visibility when negotiation outcome IDs are available (from `NegotiationOutcomeTransport.negotiationId`)
  - reduced-motion behavior (thought bubble animations should respect `prefers-reduced-motion`)
  - no horizontal scroll

## Edge Cases And Failure Handling

- **Empty elimination set:** If search returns 3 or fewer candidates, the elimination section (ranks 4-10) is hidden. The arena board shows only the finalist podium. No empty elimination board is rendered.
- **Negotiation detail fetch failure:** If `GET /api/agents/negotiate/[id]` returns 404, the thread inspector shows "Thread not available" in muted text. If it returns 500, show "Failed to load negotiation thread" with a retry action. Neither failure blocks the rest of the inspector rail.
- **refreshStatus staleness:** `useOpenvilleFlow` fires `void refreshStatus()` after each workflow step. If the user triggers actions in rapid succession, the inspector rail may briefly show stale workflow status. Acceptable staleness threshold: **<2 seconds**. The status panel already shows a loading indicator, so brief lag is tolerable. If staleness exceeds 2 seconds (measured from the last user action to the status panel reflecting the new state), add a debounced refresh with a 500ms trailing delay. For v1, the current fire-and-forget approach is acceptable because the data self-corrects after the latest refresh completes. If this proves visually confusing during manual verification, implement the debounce before shipping Phase 4.
- **Negotiation message Date serialization:** `NegotiationMessage.createdAt` is typed as `Date` in the domain layer but arrives as an ISO string from the JSON API. The `toNegotiationThreadViewModel` adapter must accept and parse string timestamps, not assume `Date` objects.

## Assumptions And Defaults

- First pass scope is `/` only. The app shell and `/agents/rag-workflow` are preserved unless verification reveals a blocking mismatch.
- The product remains horizontally framed, with one strong flagship scenario in copy and fixtures to make the market competition legible.
- No backend schema change is required for v1 of this redesign.
- Elimination reasons for ranks 4-10 will be frontend-derived unless a richer backend source is added later.
- Negotiation thread visibility can use the existing negotiation detail endpoint and does not require new write flows.
- The implementation should reduce filler copy aggressively and bias toward decision evidence, survival pressure, and visible agent reasoning summaries.
