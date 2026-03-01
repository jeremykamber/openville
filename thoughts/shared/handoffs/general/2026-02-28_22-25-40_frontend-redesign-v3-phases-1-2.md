---
date: 2026-02-28T22:25:40-08:00
researcher: opencode
git_commit: 994c138cd7965fefd43508bc7b4d0f279c11b077
branch: feat/yirivera-landing
repository: openville
topic: "Frontend Redesign v3 — Hackathon Visual Overhaul Implementation"
tags: [implementation, landing-page, redesign, hackathon, scroll-animation, intersection-observer]
status: complete
last_updated: 2026-02-28
last_updated_by: opencode
type: implementation_strategy
---

# Handoff: Frontend Redesign v3 — Hackathon Visual Overhaul (Phases 1-2 of 11)

## Task(s)

Executing the implementation plan at `thoughts/plans/frontend-redesign-v3-hackathon.md`. This is a complete visual redesign of the Openville landing narrative — the goal is a hackathon-winning page where a judge understands the product in 30 seconds of scrolling with no audio. Visuals carry the story, copy confirms it.

**11-phase plan. Current status:**

| Phase | File | Status |
|-------|------|--------|
| 1 | `hooks/useStepTrigger.tsx` — IntersectionObserver step trigger | **Completed** |
| 2 | `features/landing/components/market/AgentMarketGraph.tsx` — Full-bleed graph | **Completed** |
| 3 | `features/landing/components/FunnelSection.tsx` — Wire up step trigger | Planned, next up |
| 4 | `features/landing/components/market/MarketNode.tsx` — Dimmed collapse + winner glow | Planned |
| 5 | `features/landing/components/market/WinnerBlock.tsx` (new) — Winner-forward redesign | Planned |
| 6 | `features/landing/components/FinalistSection.tsx` — Remove WinnerPath, update layout | Planned |
| 7 | `features/landing/components/OldWaySection.tsx` — Split-screen shards | Planned |
| 8 | `features/landing/components/HandoffSection.tsx` — Floating priority tags | Planned |
| 9 | `features/landing/components/HeroSection.tsx` — Strip info cards, ambient node hint | Planned |
| 10 | `features/landing/components/ClosureSection.tsx` — Timeline + upgraded CTA | Planned |
| 11 | Delete `WinnerPath.tsx` + `useScrollProgress.ts` | Planned |

## Critical References

1. **Implementation plan:** `thoughts/plans/frontend-redesign-v3-hackathon.md` — Decision-complete plan with section-by-section redesign specs, scroll architecture, animation system, and acceptance criteria. READ THIS FULLY before resuming.
2. **Fixture data contracts:** `features/landing/data/storyboard-fixtures.ts` (916 lines) — All domain types and mock data. The redesign touches ONLY presentation; all contracts are unchanged.
3. **Theme system:** `app/openville-theme.css` — All `ov-*` CSS custom properties, utility classes (`ov-panel`, `ov-chip`, `ov-kicker`, etc.), and keyframe animations (`ov-float`, `ov-pulse`, `ov-drift`).

## Recent changes

### Phase 1: `hooks/useStepTrigger.tsx` (new file, 149 lines)
- Created IntersectionObserver-based step advancement hook replacing scroll-event-based `useScrollProgress`
- Places invisible 1px trigger divs at configurable percentage positions inside a scroll container
- Bidirectional: scrolling back up reverts the step
- Returns `containerRef`, `activeStep` (0-based index, -1 before first trigger), and `TriggerMarkers` component
- Respects `prefers-reduced-motion` by snapping to final step
- Default `rootMargin: "0px 0px -45% 0px"` — triggers when marker crosses upper ~55% of viewport

### Phase 2: `features/landing/components/market/AgentMarketGraph.tsx` (rewritten, ~260 lines)
- Removed 2-column grid layout (copy left, paneled graph right)
- Removed `ov-panel-strong` wrapper, borders, rounded corners, `min-h-[34rem]`
- Graph is now `w-screen h-screen` with `margin-left: calc(-50vw + 50%)` to break out of parent padding — edges touch viewport
- Copy moved to bottom-left overlay: eyebrow + title only, no body paragraph
- `StageCopy` interface now has only `eyebrow` and `title` (dropped `body`)
- Stage badge moved to bottom-right overlay with gold treatment on winner stage
- Center glow reacts to stage (cyan → amber → gold)
- SVG connection lines now include `strokeDasharray` + transition for draw-in animation
- Removed `ClusterLegend` import and rendering
- Removed bottom info bar (redundant with FunnelSection badge)
- All position/state helper functions unchanged — same data flow, same spatial logic

## Learnings

1. **File extension matters for JSX in hooks:** The plan specified `useStepTrigger.ts` but the hook returns a `TriggerMarkers` component that renders JSX. Must be `.tsx`. The import path `@/hooks/useStepTrigger` resolves either way.

2. **Pre-existing type error:** `hooks/useScrollProgress.ts:40` has `'element' is possibly 'null'` — this is pre-existing and the file gets deleted in Phase 11. Don't be alarmed by it in `tsc --noEmit` output.

3. **LSP ghost errors:** After renaming `useStepTrigger.ts` → `.tsx`, the LSP may show phantom errors for the old `.ts` path. The real compiler (`npx tsc --noEmit`) shows clean. Trust `tsc`, not stale LSP cache.

4. **StageCopy interface change is forward-compatible:** `AgentMarketGraph` now expects `{ eyebrow, title }` without `body`. `FunnelSection` currently passes objects with `body` too — TypeScript allows the extra property through JSX prop passing. Phase 3 will clean up `STAGE_COPY` to remove `body` fields.

5. **Full-bleed trick:** `w-screen` + `margin-left: calc(-50vw + 50%)` is the CSS pattern to break a child out of a max-width parent to touch viewport edges. No negative padding hacks needed.

6. **Project uses Tailwind v4** — configured through CSS (`@theme inline` in `globals.css`) and PostCSS, NOT a JS config file. No `tailwind.config.ts` exists.

7. **The user explicitly wants this to NOT look like generic AI slop.** Every section should tell a visual story of the AI economy. No template-looking 3-card grids. The audience is hackathon judges doing a 3-minute scroll.

## Artifacts

- `hooks/useStepTrigger.tsx` — New file, IntersectionObserver step trigger hook
- `features/landing/components/market/AgentMarketGraph.tsx` — Rewritten, full-bleed graph
- `thoughts/plans/frontend-redesign-v3-hackathon.md` — Implementation plan (not modified, read-only reference)

## Action Items & Next Steps

**Resume at Phase 3: `FunnelSection.tsx`**

Phase 3 specifics (from the plan):
1. Replace `useScrollProgress` import with `useStepTrigger`
2. Configure trigger positions: `[10, 30, 50, 70, 88]` matching the plan's scroll architecture
3. Map `activeStep` (0-4) to `MarketGraphStage` values
4. Remove the `STAGE_COPY` body text — `StageCopy` now only has `eyebrow` + `title`
5. Remove the `PriorityRail` + stage badge bar from FunnelSection (the graph handles its own badge now)
6. Set container to `min-height: 600vh` (plan specifies 5 stages × ~120vh each) with `position: relative` for the trigger markers
7. Make the graph `sticky top-0` inside this container
8. Render `<TriggerMarkers />` inside the container

After Phase 3, continue sequentially through Phases 4-11. Each phase has detailed specs in the plan document.

**Verification between phases:** Run `npx tsc --noEmit` after each phase. Only `useScrollProgress.ts:40` should error (pre-existing, deleted in Phase 11).

## Other Notes

### Codebase architecture
- Main page orchestrator: `features/chat/components/OpenvilleWorkspace.tsx:163-199` — renders all landing sections in story mode
- `@/*` path alias resolves to project root (defined in `tsconfig.json:26`)
- Component library: shadcn/ui (new-york style) with radix-ui primitives
- All landing components are in `features/landing/components/` (6 section files) and `features/landing/components/market/` (7 sub-components)
- Existing `useInView` hook at `hooks/useInView.ts` — already uses IntersectionObserver, used by OldWaySection, HandoffSection, FinalistSection, ClosureSection. Do NOT touch this; it works fine for simple visibility detection.

### Key fixture data shapes consumed by remaining phases
- `finalists: FinalistNegotiation[]` — 3 items with `outcome: "winner" | "scope_risk" | "cost_risk"`, prices, reliability, etc. Used by WinnerBlock (Phase 5) and FinalistSection (Phase 6)
- `pastFragments: PastFragment[]` — 5 items. Used by OldWaySection (Phase 7) for shard content
- `storyPriorities: StoryPriority[]` — 4 items (Reliability, Budget, Deadline, Scope). Used by HandoffSection (Phase 8) floating tags
- `lifecycleSteps: LifecycleStep[]` — 3 items (booking, notification, review). Used by ClosureSection (Phase 10) timeline
- `winnerExplanation` and `loserExplanations` — Currently used by WinnerPath.tsx which gets deleted in Phase 11
