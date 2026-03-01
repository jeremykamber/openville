---
date: 2026-02-28T22:42:49-08:00
researcher: opencode
git_commit: 994c138cd7965fefd43508bc7b4d0f279c11b077
branch: feat/redesign-landing-page
repository: openville
topic: "Frontend Redesign v3 — Hackathon Visual Overhaul Phases 8-11"
tags: [implementation, landing-page, redesign, hackathon, handoff-section, hero, closure, cleanup]
status: complete
last_updated: 2026-02-28
last_updated_by: opencode
type: implementation_strategy
---

# Handoff: Frontend Redesign v3 — Phases 8-11 of 11

## Task(s)

Continuing execution of the implementation plan at `thoughts/plans/frontend-redesign-v3-hackathon.md`. This is a complete visual redesign of the Openville landing narrative for hackathon judges.

**11-phase plan. Current status:**

| Phase | File | Status |
|-------|------|--------|
| 1 | `hooks/useStepTrigger.tsx` — IntersectionObserver step trigger | **Completed** (prior session) |
| 2 | `features/landing/components/market/AgentMarketGraph.tsx` — Full-bleed graph | **Completed** (prior session) |
| 3 | `features/landing/components/FunnelSection.tsx` — Wire up step trigger | **Completed** (prior session) |
| 4 | `features/landing/components/market/MarketNode.tsx` — Dimmed collapse + winner glow | **Completed** (prior session) |
| 5 | `features/landing/components/market/WinnerBlock.tsx` (new) — Winner-forward redesign | **Completed** (prior session) |
| 6 | `features/landing/components/FinalistSection.tsx` — Remove WinnerPath, update layout | **Completed** (prior session) |
| 7 | `features/landing/components/OldWaySection.tsx` — Split-screen shards | **Completed** (prior session) |
| 8 | `features/landing/components/HandoffSection.tsx` — Floating priority tags | **Completed** |
| 9 | `features/landing/components/HeroSection.tsx` — Strip info cards, ambient node hint | **Next up** |
| 10 | `features/landing/components/ClosureSection.tsx` — Timeline + upgraded CTA | Planned |
| 11 | Delete dead code files | Planned |

## Critical References

1. **Implementation plan:** `thoughts/plans/frontend-redesign-v3-hackathon.md` — Decision-complete plan with section-by-section specs. READ THIS FULLY before resuming.
2. **Fixture data contracts:** `features/landing/data/storyboard-fixtures.ts` (916 lines) — All domain types and mock data. The redesign touches ONLY presentation; all contracts are unchanged.
3. **Theme system:** `app/openville-theme.css` (205 lines) — All `ov-*` CSS custom properties, utility classes, and keyframe animations. `prefers-reduced-motion` globally kills all animations at line 192.

## Recent changes

### Phase 8: `features/landing/components/HandoffSection.tsx` (rewritten, ~75 lines)
- Removed both card wrappers (`ov-panel-strong` and `ov-panel`)
- Removed `PriorityRail` import — priorities are now rendered inline as floating tags
- Removed the "Human intention -> agent understanding -> market activation" explanation card
- Removed the "Extracted priorities" card
- Chat bubbles now sit directly on the dark background with no card container — human message right-aligned (amber border/bg), agent response left-aligned (blue border/bg), max-w-[88%]
- Added 4 floating priority tags below the agent response that animate in with staggered `transitionDelay` (360ms + 100ms per tag) via `useInView` — scale from 0.9 to 1.0, translate-y from 3 to 0, opacity from 0 to 1
- Layout changed from 2-column grid (`lg:grid-cols-[1.05fr_0.95fr]`) to single-column `max-w-3xl` centered
- Added centered "The Handoff" eyebrow above the chat bubbles

## Learnings

1. **`PriorityRail` is still used in `FinalistSection.tsx`** — it was only removed from `HandoffSection`. Do NOT delete `PriorityRail.tsx`; it's still imported at `features/landing/components/FinalistSection.tsx:3`.

2. **`BridgePreview.tsx` will become dead code after Phase 9** — it's only imported by `HeroSection.tsx:4`. The original Phase 11 deletion list doesn't mention it. The next agent should add it to the Phase 11 cleanup list.

3. **Design patterns established by Phases 1-8 (follow these consistently):**
   - `useInView` with `threshold` for section-level scroll animation
   - `cn()` for conditional `isInView` translate-y + opacity transitions
   - `transitionDelay` inline style for stagger, gated on `isInView` (set to `"0ms"` when not in view to prevent exit stagger)
   - No `ov-panel` / `ov-panel-strong` card wrappers — elements breathe directly on the dark background
   - `font-display` for headings, `ov-kicker` class for eyebrows
   - Theme CSS vars: `--ov-text`, `--ov-human`, `--ov-signal`, `--ov-winner`, etc.

4. **`npx tsc --noEmit` is the verification command.** Only `hooks/useScrollProgress.ts:40` should error (pre-existing, deleted Phase 11). LSP may show ghost errors on `hooks/useStepTrigger.ts` because the actual file is `.tsx` — always verify with tsc, not LSP.

5. **Project uses Tailwind v4** — no `tailwind.config.ts`. Configured via CSS (`@theme inline` in `globals.css`) and PostCSS.

6. **Orchestrator renders sections in this order:** Hero → OldWay → Handoff → Funnel → Finalist → Closure (see `features/chat/components/OpenvilleWorkspace.tsx:173-199`). Only `HeroSection` and `ClosureSection` receive props (`value`, `onChange`, `onSubmit`, `disabled`).

## Artifacts

- `features/landing/components/HandoffSection.tsx` — Rewritten, no card wrappers, floating priority tags
- `thoughts/plans/frontend-redesign-v3-hackathon.md` — Implementation plan (read-only reference)
- `thoughts/shared/handoffs/general/2026-02-28_22-36-39_frontend-redesign-v3-phases-3-7.md` — Prior handoff (for historical context only)

## Action Items & Next Steps

**Resume at Phase 9: `HeroSection.tsx`**

Phase 9 specifics (from plan, Section 1):
1. Remove the "Bridge Builder / The Past" kicker (`HeroSection.tsx:28`)
2. Keep headline: "Post one request. Let the AI market compete for you."
3. Trim sub-copy to one line max (currently 3 lines at `HeroSection.tsx:34-37`)
4. Remove the 3 scenario chips (event name, deadline, location) wrapping the `RequestComposer` (`HeroSection.tsx:45-55`)
5. Remove the 3 info cards grid entirely (`HeroSection.tsx:67-89`)
6. Remove `BridgePreview` import and render (`HeroSection.tsx:4,92`)
7. Add below the input: an inline stat row — "50 agents · 5 clusters · 1 winner" as simple text, no chips
8. Keep the `ov-panel-strong` wrapper around the `RequestComposer` — it gives the input visual weight
9. The layout can simplify from 2-column grid to single-column since BridgePreview is gone

After Phase 9, continue sequentially:

**Phase 10** (`ClosureSection.tsx`):
- Replace 3 lifecycle cards with a vertical animated timeline — a vertical line connecting 3 labeled moments. Each moment is a dot + label + one short phrase. No card borders. Staggered `useInView` animation with 150ms delays.
- Upgrade CTA panel: distinct gradient shifting ambient radial to amber/gold to signal completion, significantly larger headline type
- CTA input = last visible element, no content below

**Phase 11** (Dead code deletion):
- Delete `features/landing/components/market/WinnerPath.tsx`
- Delete `features/landing/components/market/NegotiationBoard.tsx`
- Delete `features/landing/components/market/ClusterLegend.tsx`
- Delete `hooks/useScrollProgress.ts`
- Delete `features/landing/components/market/BridgePreview.tsx` (becomes dead after Phase 9)
- Verify no remaining imports with `grep -r` for each deleted file
- Run `npx tsc --noEmit` — should produce zero errors after `useScrollProgress.ts` is gone

**Verification between phases:** Run `npx tsc --noEmit` after each phase. Only `useScrollProgress.ts:40` should error until Phase 11 deletes it.

## Other Notes

### Codebase architecture
- Main page orchestrator: `features/chat/components/OpenvilleWorkspace.tsx:163-199` — renders all landing sections in story mode
- Section render order: HeroSection → OldWaySection → HandoffSection → FunnelSection → FinalistSection → ClosureSection
- `@/*` path alias resolves to project root (`tsconfig.json:26`)
- All landing components in `features/landing/components/` (6 section files) and `features/landing/components/market/` (sub-components including WinnerBlock, PriorityRail, MarketNode, AgentMarketGraph, BridgePreview)
- `useInView` hook at `hooks/useInView.ts` — used by OldWaySection, HandoffSection, FinalistSection, ClosureSection. Do NOT modify.
- `useStepTrigger` hook at `hooks/useStepTrigger.tsx` — used only by FunnelSection. Do NOT modify.
- `RequestComposer` at `features/chat/components/RequestComposer.tsx` — accepts `variant: "landing" | "active"`, optional `examples` and `onExampleClick`. Used by HeroSection (with examples) and ClosureSection (without examples).

### Key fixture data shapes consumed by remaining phases
- `storyScenario` — has `request`, `assistantResponse`, `eventName`, `deadlineLabel`, `locationLabel`. Used by HeroSection (Phase 9)
- `heroPromptChips: string[]` — 3 example prompts for the hero input. Used by HeroSection (Phase 9)
- `lifecycleSteps: LifecycleStep[]` — 3 items (booking, notification, review), each with `id`, `label`, `description`. Used by ClosureSection (Phase 10)
- `storyPriorities` — used by HandoffSection (floating tags) and FinalistSection (via PriorityRail)

### Dead code after this session
These files are no longer imported anywhere but still exist:
- `features/landing/components/market/WinnerPath.tsx`
- `features/landing/components/market/NegotiationBoard.tsx`
- `features/landing/components/market/ClusterLegend.tsx`
- `hooks/useScrollProgress.ts`

After Phase 9, also dead:
- `features/landing/components/market/BridgePreview.tsx`

All should be deleted in Phase 11.
