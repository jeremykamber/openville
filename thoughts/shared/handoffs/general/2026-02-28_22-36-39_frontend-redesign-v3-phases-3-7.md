---
date: 2026-02-28T22:36:39-08:00
researcher: opencode
git_commit: 994c138cd7965fefd43508bc7b4d0f279c11b077
branch: feat/redesign-landing-page
repository: openville
topic: "Frontend Redesign v3 — Hackathon Visual Overhaul Phases 3-7"
tags: [implementation, landing-page, redesign, hackathon, funnel-section, winner-block, negotiation, old-way]
status: complete
last_updated: 2026-02-28
last_updated_by: opencode
type: implementation_strategy
---

# Handoff: Frontend Redesign v3 — Phases 3-7 of 11

## Task(s)

Continuing execution of the implementation plan at `thoughts/plans/frontend-redesign-v3-hackathon.md`. This is a complete visual redesign of the Openville landing narrative for hackathon judges.

**11-phase plan. Current status:**

| Phase | File | Status |
|-------|------|--------|
| 1 | `hooks/useStepTrigger.tsx` — IntersectionObserver step trigger | **Completed** (prior session) |
| 2 | `features/landing/components/market/AgentMarketGraph.tsx` — Full-bleed graph | **Completed** (prior session) |
| 3 | `features/landing/components/FunnelSection.tsx` — Wire up step trigger | **Completed** |
| 4 | `features/landing/components/market/MarketNode.tsx` — Dimmed collapse + winner glow | **Completed** |
| 5 | `features/landing/components/market/WinnerBlock.tsx` (new) — Winner-forward redesign | **Completed** |
| 6 | `features/landing/components/FinalistSection.tsx` — Remove WinnerPath, update layout | **Completed** |
| 7 | `features/landing/components/OldWaySection.tsx` — Split-screen shards | **Completed** |
| 8 | `features/landing/components/HandoffSection.tsx` — Floating priority tags | **Next up** |
| 9 | `features/landing/components/HeroSection.tsx` — Strip info cards, ambient node hint | Planned |
| 10 | `features/landing/components/ClosureSection.tsx` — Timeline + upgraded CTA | Planned |
| 11 | Delete `WinnerPath.tsx` + `NegotiationBoard.tsx` + `useScrollProgress.ts` | Planned |

## Critical References

1. **Implementation plan:** `thoughts/plans/frontend-redesign-v3-hackathon.md` — Decision-complete plan with section-by-section specs. READ THIS FULLY before resuming.
2. **Fixture data contracts:** `features/landing/data/storyboard-fixtures.ts` (916 lines) — All domain types and mock data. The redesign touches ONLY presentation; all contracts are unchanged.
3. **Theme system:** `app/openville-theme.css` — All `ov-*` CSS custom properties, utility classes, and keyframe animations. `prefers-reduced-motion` globally kills all animations at line 192.

## Recent changes

### Phase 3: `features/landing/components/FunnelSection.tsx` (rewritten, ~70 lines)
- Replaced `useScrollProgress` with `useStepTrigger` configured at positions `[10, 30, 50, 70, 88]`
- `activeStep` (0-4) maps to `STAGE_ORDER` array of `MarketGraphStage` values
- Removed `PriorityRail` + stage badge bar (graph handles its own badge since Phase 2)
- Removed `STAGE_COPY.body` fields — now `{ eyebrow, title }` only
- Container is `min-height: 600vh` with `position: relative` for trigger markers
- Graph is `sticky top-0` inside the container
- `containerRef` goes on the tall inner div (not the `<section>`), because trigger markers are absolutely positioned at percentage offsets inside it
- Stripped outer section padding — full-bleed graph shouldn't be padded

### Phase 4: `features/landing/components/market/MarketNode.tsx` (edited, `stateClasses` at line 29)
- `base`: Added `[animation:ov-pulse_3s_ease-in-out_infinite]` — nodes breathe instead of sitting static
- `dimmed`: Collapsed from `size-2.5 opacity-20` to `size-1 opacity-15` — more dramatic "falling away"
- `winner`: Added `[animation:ov-pulse_2s_ease-in-out_infinite]` — gold glow pulses via opacity

### Phase 5: `features/landing/components/market/WinnerBlock.tsx` (new file, ~120 lines)
- Winner stat block: gold-bordered card with name, 3-column stat grid (bid delta with strikethrough, reliability %, scope filled bar), delivery window
- Loser rows: bare flex rows with name, final price, scope, and terse `Lost: {reason}` — no cards
- Consumes `finalists` from fixtures, derives loss reason from `outcome` field

### Phase 6: `features/landing/components/FinalistSection.tsx` (rewritten, ~42 lines)
- Removed `NegotiationBoard` and `WinnerPath` imports and renders
- Replaced with `WinnerBlock`
- Kept `PriorityRail` above the winner block as context chips
- Cut the body paragraph — numbers in WinnerBlock tell the story

### Phase 7: `features/landing/components/OldWaySection.tsx` (rewritten, ~55 lines)
- Replaced 2-column grid (copy left, 5-card panel right) with split-screen
- Left: 5 fragment `detail` strings as scattered bare `<span>` elements with absolute positioning, varied rotation/opacity, container has `blur(0.5px)` + `saturate(0.4)`
- Right: Single bold display heading — "This is what everyone else is still doing."
- Tighter vertical padding for a fast-scroll section
- Zero card elements

## Learnings

1. **`containerRef` placement matters for `useStepTrigger`:** The ref must go on the tall inner div with `position: relative` and `min-height: 600vh`, not the outer `<section>`. The trigger markers are absolutely positioned at percentage offsets inside that div.

2. **`NegotiationBoard.tsx` is now dead code** alongside `WinnerPath.tsx`. Neither is imported anywhere after Phase 6. The plan's Phase 11 lists `WinnerPath.tsx` for deletion — `NegotiationBoard.tsx` should also be deleted then.

3. **`ov-pulse` works well for both base and winner nodes** because it oscillates opacity (0.45-1). On base nodes with 3s duration it's a gentle breathe. On winner nodes with 2s duration the gold shadow pulses more noticeably because the high-opacity shadow values modulate visually.

4. **LSP ghost errors on `useStepTrigger.ts`** persist — the LSP sees the old `.ts` path while the actual file is `.tsx`. Always verify with `npx tsc --noEmit`. Only `useScrollProgress.ts:40` should error (pre-existing, deleted Phase 11).

5. **Project uses Tailwind v4** — no `tailwind.config.ts`. Configured via CSS (`@theme inline` in `globals.css`) and PostCSS.

## Artifacts

- `features/landing/components/FunnelSection.tsx` — Rewritten, intersection-based scroll
- `features/landing/components/market/MarketNode.tsx:29-36` — Updated `stateClasses`
- `features/landing/components/market/WinnerBlock.tsx` — New file, winner stat block
- `features/landing/components/FinalistSection.tsx` — Rewritten, WinnerBlock integration
- `features/landing/components/OldWaySection.tsx` — Rewritten, split-screen shards
- `thoughts/plans/frontend-redesign-v3-hackathon.md` — Implementation plan (read-only reference)

## Action Items & Next Steps

**Resume at Phase 8: `HandoffSection.tsx`**

Phase 8 specifics (from plan, lines 63-74):
1. Remove the two card wrappers (`ov-panel-strong` and `ov-panel`)
2. Make chat bubbles full-width or near-full-width on dark background — human message right (amber), agent response left (blue), no card wrapping
3. Remove the second "extracted priorities" card entirely
4. Replace with floating priority tags that "crystallize" below the agent response — staggered `useInView` animation on each tag
5. Remove the intermediary explanation card ("Human intention -> agent understanding -> market activation")

After Phase 8, continue sequentially:
- **Phase 9** (`HeroSection.tsx`): Remove 3 info cards, strip "Bridge Builder / The Past" kicker, trim sub-copy, replace BridgePreview with ambient node hint, add inline stat row "50 agents · 5 clusters · 1 winner"
- **Phase 10** (`ClosureSection.tsx`): Replace 3 lifecycle cards with vertical animated timeline (dot + label + phrase), upgrade CTA panel with distinct gradient and larger type
- **Phase 11**: Delete `WinnerPath.tsx`, `NegotiationBoard.tsx`, `useScrollProgress.ts`, `ClusterLegend.tsx` (all dead code)

**Verification between phases:** Run `npx tsc --noEmit` after each phase. Only `useScrollProgress.ts:40` should error (pre-existing, deleted Phase 11).

## Other Notes

### Codebase architecture
- Main page orchestrator: `features/chat/components/OpenvilleWorkspace.tsx:163-199` — renders all landing sections in story mode
- Section render order: HeroSection → OldWaySection → HandoffSection → FunnelSection → FinalistSection → ClosureSection
- `@/*` path alias resolves to project root (`tsconfig.json:26`)
- All landing components in `features/landing/components/` (6 section files) and `features/landing/components/market/` (now 8 sub-components including WinnerBlock)
- `useInView` hook at `hooks/useInView.ts` — used by OldWaySection, HandoffSection, FinalistSection, ClosureSection for simple visibility detection. Do NOT touch.

### Dead code after this session
These files are no longer imported anywhere but still exist:
- `features/landing/components/market/WinnerPath.tsx`
- `features/landing/components/market/NegotiationBoard.tsx`
- `features/landing/components/market/ClusterLegend.tsx` (was removed from AgentMarketGraph in Phase 2)
- `hooks/useScrollProgress.ts` (replaced by useStepTrigger in Phase 3)

All should be deleted in Phase 11.

### Key fixture data shapes consumed by remaining phases
- `storyScenario` — has `request`, `assistantResponse`, `eventName`, `deadlineLabel`, `locationLabel`. Used by HandoffSection (Phase 8) and HeroSection (Phase 9)
- `storyPriorities: StoryPriority[]` — 4 items (Reliability, Budget, Deadline, Scope). Used by HandoffSection (Phase 8) floating tags
- `heroPromptChips` — example prompts for the hero input. Used by HeroSection (Phase 9)
- `lifecycleSteps: LifecycleStep[]` — 3 items (booking, notification, review). Used by ClosureSection (Phase 10) timeline
