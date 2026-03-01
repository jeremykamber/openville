# Frontend Redesign v3 — Hackathon Visual Overhaul

**Date:** 2026-02-28  
**Status:** Decision-complete, ready to implement  
**Owner:** Dev 1 (frontend)  
**Scope:** Complete redesign of the landing narrative. No backend contract changes.

---

## 1. What We Are Building

A visual-first redesign of the Openville landing narrative. The goal is that a hackathon judge watching a 3-minute demo — or scrolling through the page alone — understands the product without reading a single word of body text. The visuals carry the story. The copy confirms it.

The current page fails this test because:
- Every section uses the same card container (`.ov-panel`, `.ov-panel-strong`). Nothing has visual hierarchy.
- The most important visual (the agent market graph) is jailed inside a bordered panel on the right side of a 2-column layout.
- Text is doing the job visuals should do. The negotiation section alone has ~9 paragraphs visible at once.
- The scroll mechanism re-computes on every scroll event causing janky transitions.
- Sections look like template UI (3 cards, label + sentence, repeat).

---

## 2. Decisions Made

| Question | Decision |
|----------|----------|
| Graph layout | Full-bleed fullscreen — no panel, no border, edges touch the viewport |
| Negotiation section | Radical cut — winner stat block only, losers collapse to single lines |
| Scroll trigger mechanism | Intersection-based step-through, not continuous scroll progress |
| OldWaySection replacement | Single split-screen moment — chaos visual left, one line right |

---

## 3. Section-by-Section Redesign Plan

### Section 1 — Hero
**Current problems:** 3 info cards below the input add visual noise. "Bridge Builder / The Past" kicker is confusing. BridgePreview is decorative but unconnected.

**New approach:**
- Remove the 3 info cards entirely. The hero is the input + one strong headline.
- Headline stays: "Post one request. Let the AI market compete for you."
- Sub-copy trimmed to one line max.
- Below the input: a single ambient stat row — "50 agents · 5 clusters · 1 winner" as simple inline text, no chips.
- BridgePreview replaced with a live-feeling preview: animated nodes begin pulsing in the background of the hero (the graph starts here, pre-narration).
- The hero background should bleed into the next section with no hard separator.

**What this communicates without words:** There's a big system behind this input box. Hit enter and it wakes up.

---

### Section 2 — The Old Way (OldWaySection)
**Current problems:** 5 fragment cards in a grid. Visual noise. Each card is just a label + sentence. Looks like a feature list.

**New approach — Single split-screen moment:**
- Left half: A chaotic visual — fragmented, overlapping text shards (CSS only, no cards). Think: 4–5 text lines scattered across a blurred, desaturated background. Rotation, opacity variation. Represents the mess. No borders, no cards.
- Right half: One line. Bold. "This is what everyone else is still doing."
- Fade out immediately. This section is fast — scroll through it in 2 seconds.

**What this communicates without words:** The old world is fragmented, messy, overlapping. The contrast with what comes next is the point.

---

### Section 3 — The Handoff (HandoffSection)
**Current problems:** Two cards side by side. One has the chat bubbles, one has "extracted priorities" — both are just more panels.

**New approach:**
- Lean into the chat metaphor. Let it breathe. Full-width or near-full-width.
- Human message on right (amber). Agent response on left (blue). No card wrapping them — just the bubbles on the dark background.
- Below the agent response, the priorities "crystallize" — animate in as floating tags (RELIABILITY: CRITICAL, DEADLINE: 4PM, etc.) rather than a card with a list inside.
- Remove the second "extracted priorities" card. The floating tags replace it.

**What this communicates without words:** One message goes in. Structure comes out. The agent understood it.

---

### Section 4 — The Market Graph (FunnelSection) ← MAIN EVENT
**Current problems:** Graph inside a `min-h-[34rem]` panel on the right side. 280vh scroll height. Continuous `useScrollProgress` hook fires on every scroll event causing jank. Cluster list cards on the left are redundant.

**New approach — full-bleed fullscreen graph with intersection-based steps:**

#### Layout
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   [STEP COPY — bottom-left overlay, max-w-sm]              │
│                                                             │
│                    · · ·  · ·                               │
│              · ·    ·  ·    · ·                             │
│         · ·   ·       ·      · ·   ·                       │
│                                                             │
│   [STAGE BADGE — bottom-right]                              │
└─────────────────────────────────────────────────────────────┘
```

- The graph SVG/div spans `100vw` (negative margin to break out of page padding) at `100vh` height, sticky.
- No border. No rounded corners. No background panel. The nodes exist directly on the page background.
- Copy overlays in the bottom-left: eyebrow + headline only. No body paragraph. One sentence max.
- Stage badge bottom-right: "50 → MARKET OPEN", "10 → SURVIVORS", etc.

#### Scroll trigger mechanism
**Replace `useScrollProgress` with `useIntersection`-based step triggers.**

How it works:
```
[invisible trigger div 1] → intersects → stage: "market"
[graph sticks here]
[invisible trigger div 2] → intersects → stage: "top10"
[invisible trigger div 3] → intersects → stage: "top3"
[invisible trigger div 4] → intersects → stage: "negotiation"
[invisible trigger div 5] → intersects → stage: "winner"
```

Each trigger div is `1px` tall, placed at intervals within the scroll container. When an IntersectionObserver fires, the stage updates. Zero scroll math. Zero per-frame computation. The graph just reacts to discrete events.

**Why this is better:**
- No jank — Intersection Observer is off the main thread
- No `scroll` event listener
- Each stage transition is clean and deliberate
- Easy to tune timing by moving trigger positions

#### Node improvements
- `base` state: nodes pulse gently (`ov-pulse` animation already exists) instead of sitting static
- `dimmed` state: nodes don't just fade — they collapse in size (size-1 instead of size-2.5) and translate slightly toward their cluster center, creating a "falling away" feel
- `winner` state: winner node emits a radial glow that expands beyond the node (CSS box-shadow pulse)
- Connection lines: use `strokeDashoffset` animation to draw lines in when a new stage appears (CSS `stroke-dasharray` + transition)

#### Cluster legend
Remove the `ClusterLegend` component from beside the graph. If needed, show it as a 5-item inline row below the graph copy, very small.

---

### Section 5 — Negotiation (FinalistSection + NegotiationBoard)
**Current problems:** 3 tall cards × 6 sub-sections each = wall of text. The winner doesn't visually win. Strength/weakness boxes are nested 3 levels deep.

**New approach — Winner-forward visual reveal:**

#### Primary view: Winner stat block
```
┌─────────────────────────────────────────────────────────────┐
│  WINNER                                                     │
│  RelayCrew Systems                                          │
│                                                             │
│  $4,800 → $4,350    96% reliable    Full scope              │
│  ─────────────────────────────────────────────────────      │
│  "Crew confirmed by 1 PM"                                   │
└─────────────────────────────────────────────────────────────┘
```

- Large, full-width (or 2/3 width) winner card
- Three stat blocks side by side: bid delta (with a visual arrow ↓), reliability percentage (large number), scope (full/partial/none as a filled bar)
- One line: the delivery window
- No "Negotiation Summary" paragraph. No strength/weakness boxes.

#### Secondary view: Losers — collapsed rows, not cards
```
Bluewire AV Network    $4,050    partial scope    Lost: incomplete coverage
StageSprint Ops        $4,950    full scope       Lost: surge pricing risk
```
Two simple table rows. No card containers. Just the name, final price, scope, and a 4-word loss reason.

**What this communicates without words:** One team won clearly. Two teams had specific flaws. The numbers tell the story.

#### PriorityRail stays
Keep the RELIABILITY: CRITICAL / BUDGET: CONTROLLED / DEADLINE chips. Move them to above the winner block as context.

---

### Section 6 — The Decision (WinnerPath)
**Decision:** Merge WinnerPath into the FinalistSection redesign above. WinnerPath currently duplicates the winner/loser explanation that the new FinalistSection handles better visually. Remove WinnerPath as a standalone section.

---

### Section 7 — Closure (ClosureSection)
**Current problems:** 3 identical cards (BOOKING CONFIRMED, HUMAN RE-ENTERS, FEEDBACK CLOSES THE LOOP) look like a feature list. The final CTA is buried in the same panel style as everything else.

**New approach:**
- Replace the 3 cards with a single animated timeline: a vertical line connecting 3 labeled moments. Each moment is a dot + label + one short phrase. No card borders. The line is the visual.
- The final CTA panel gets a distinct visual treatment: full-width, gradient that differs from the rest of the page (shift the ambient radial to amber/gold to signal completion), significantly larger headline type.
- The CTA input is the last thing visible before the bottom of the page. No content below it.

---

## 4. Component Changes

### Files to modify
| File | Change |
|------|--------|
| `FunnelSection.tsx` | Replace `useScrollProgress` with intersection trigger system |
| `AgentMarketGraph.tsx` | Remove panel wrapper, make full-bleed, improve node animations |
| `MarketNode.tsx` | Improve dimmed/winner state animations |
| `NegotiationBoard.tsx` | Complete rewrite — winner block + loser rows |
| `WinnerPath.tsx` | Delete (logic absorbed into new NegotiationBoard) |
| `FinalistSection.tsx` | Remove WinnerPath reference, update layout |
| `OldWaySection.tsx` | Replace 5-card grid with split-screen shards |
| `HandoffSection.tsx` | Remove card wrappers from chat bubbles, add floating priority tags |
| `HeroSection.tsx` | Remove 3 info cards, simplify copy, add ambient node hint |
| `ClosureSection.tsx` | Replace 3 cards with timeline, upgrade CTA visual weight |

### New files to create
| File | Purpose |
|------|---------|
| `hooks/useStepTrigger.ts` | IntersectionObserver-based step advancement (replaces scroll progress for funnel) |
| `features/landing/components/market/WinnerBlock.tsx` | New winner display component |

### Files to delete
| File | Reason |
|------|--------|
| `features/landing/components/market/WinnerPath.tsx` | Replaced by WinnerBlock inside FinalistSection |
| `hooks/useScrollProgress.ts` | Replaced by useStepTrigger for the funnel use case |

---

## 5. Data Flow (No Contract Changes)

The redesign touches only presentation. All domain contracts stay the same:
- `finalists` array from storyboard-fixtures → used in new WinnerBlock
- `marketAgents` / `top10Agents` → used in AgentMarketGraph (same data, different render)
- `pastFragments` → used for shard content in new OldWaySection
- `storyScenario` → used in Hero and Closure

The swap boundary remains at the repository/fixture level. When backend integration arrives, only the data source changes.

---

## 6. Animation System

All animations use existing CSS + Tailwind. No new libraries.

| Moment | Technique |
|--------|-----------|
| Graph stage change | `transition-all duration-700 ease-out` on node positions (already works) |
| Node pulse in market stage | `animation: ov-pulse` (already in theme) on base-state nodes |
| Winner glow | `box-shadow` pulse via `ov-pulse` on winner node |
| Line draw-in | `stroke-dasharray` + CSS transition on SVG lines |
| Section fade-in | `useInView` + `translate-y + opacity` (existing pattern, keep it) |
| Priority tags appear | Staggered `useInView` on each tag |
| Timeline dots | Sequential `useInView` triggers with 150ms stagger |

---

## 7. Scroll Architecture After Redesign

```
HERO (static, full viewport feel)
    ↓
OLD WAY (fast section, < 1 viewport)
    ↓
HANDOFF (full viewport, breathing room)
    ↓
FUNNEL CONTAINER (min-height: 600vh — 5 stages × ~120vh each)
  [trigger 1 at 10%] → stage: "market"
  [trigger 2 at 30%] → stage: "top10"
  [trigger 3 at 50%] → stage: "top3"
  [trigger 4 at 70%] → stage: "negotiation"
  [trigger 5 at 88%] → stage: "winner"
  [graph: sticky, 100vh, full-bleed]
    ↓
NEGOTIATION / FINALIST (normal scroll, winner-forward)
    ↓
CLOSURE (timeline + CTA)
```

---

## 8. Backend Integration Surface

The page is mock-data-only now. When the backend lands:

- `storyboard-fixtures.ts` → replaced by API response at the repository layer
- `AgentMarketGraph` receives the same `MarketAgent[]` shape
- `WinnerBlock` receives the same `finalist` shape
- No component renames needed

The graph animation is driven by stage transitions, not data volume. If the backend returns 47 agents instead of 50, the visual still works — clusters just have slightly different densities.

---

## 9. Acceptance Criteria

- [ ] Hackathon judge can understand the product in 30 seconds of scrolling with no audio
- [ ] The graph occupies the full viewport with no visible container borders
- [ ] Negotiation section has no paragraphs — only numbers, labels, and one-liners
- [ ] Scroll through the funnel section produces zero jank on a mid-range laptop
- [ ] OldWaySection has zero card elements
- [ ] No section uses more than 2 sentences of body text visible at once
- [ ] The page reads as a sequence: chaos → handoff → market opens → market narrows → winner → done
- [ ] All existing mock data contracts are unchanged
- [ ] `prefers-reduced-motion` still collapses all animations

---

## 10. Implementation Order

1. `useStepTrigger.ts` — foundation for the funnel refactor
2. `AgentMarketGraph.tsx` — full-bleed layout + improved node states
3. `FunnelSection.tsx` — wire up step trigger, remove old scroll hook
4. `MarketNode.tsx` — dimmed collapse animation + winner glow
5. `NegotiationBoard.tsx` → `WinnerBlock.tsx` — winner-forward redesign
6. `FinalistSection.tsx` — remove WinnerPath, update layout
7. `OldWaySection.tsx` — split-screen shards
8. `HandoffSection.tsx` — floating priority tags, no card wrappers
9. `HeroSection.tsx` — strip info cards, ambient node hint
10. `ClosureSection.tsx` — timeline + upgraded CTA
11. Delete `WinnerPath.tsx` + `useScrollProgress.ts`
