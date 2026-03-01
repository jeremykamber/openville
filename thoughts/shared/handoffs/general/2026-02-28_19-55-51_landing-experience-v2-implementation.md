---
date: 2026-02-28T19:55:51-08:00
researcher: Dev 1 (Yonie)
git_commit: 6ac8fa3
branch: feat/yirivera-landing
repository: openville
topic: "Landing Experience v2 — Scroll-Triggered Story Implementation"
tags: [implementation, landing-page, scroll-animation, funnel-visualization, frontend]
status: complete
last_updated: 2026-02-28
last_updated_by: Dev 1
type: implementation_strategy
---

# Handoff: Landing Experience v2 — Scroll-Triggered Story Implementation

## Task(s)

Implementing the v2 landing experience plan using the `/implement-plan` workflow. The plan has 5 phases.

| Phase | Status | Summary |
|---|---|---|
| Phase 1: Design tokens + Layout shell | **Completed** | Added `--accent-blue`/`--accent-amber` tokens, restructured `OpenvilleWorkspace` into story/active mode toggle, created `hooks/useInView.ts`, created `features/landing/` directory + storyboard fixtures |
| Phase 2: Hero + Old Way + Handoff | **Completed** | Built `HeroSection` (headline + RequestComposer + example chips), `OldWaySection` (3 pain cards with scroll fade-in), `HandoffSection` (scripted conversation + priority badges + color activation pivot) |
| Phase 3: Funnel section | **In Progress — partially built** | Created `hooks/useScrollProgress.ts`, built `FunnelSection` component with full 5-stage scroll-driven dot visualization. **Code is written but NOT yet wired into OpenvilleWorkspace.** The next step was Task 3.5 (wire into workspace) + Task 3.6 (verify build). |
| Phase 4: Finalist + Lifecycle + CTA | **Planned** | Finalist comparison cards with winner treatment, lifecycle strip, climax CTA |
| Phase 5: Transition + Polish | **Planned** | Story-to-active mode transition animation, responsive pass (375/768/1024px), accessibility pass |

The implementation follows the plan at `thoughts/plans/frontend-landing-experience-v2.md`. Research is at `thoughts/research/frontend-landing-experience.md`.

## Critical References

- `thoughts/plans/frontend-landing-experience-v2.md` — The active v2 plan. Contains all section specs, visual identity, boundary rules, implementation phases, and verification criteria.
- `context/user_flow.md` — The product flow (10 steps from request to review). Landing page visualizes steps 1-7.
- `AGENTS.md` — Dev 1 frontend workflow rules, contract naming rules, mock data rules, RPI flow requirements.

## Recent changes

- `app/globals.css:7-14` — Added `--color-accent-blue` and `--color-accent-amber` to `@theme inline` block
- `app/globals.css:77-78` — Added `--accent-blue: oklch(0.55 0.18 250)` and `--accent-amber: oklch(0.75 0.15 75)` to `:root`
- `app/globals.css:87-88` — Added dark mode variants for accent tokens
- `features/chat/components/OpenvilleWorkspace.tsx` — **Major rewrite.** Now has `"story" | "active"` mode toggle. Story mode renders HeroSection, OldWaySection, HandoffSection, plus placeholder shells for sections 4-6. Active mode preserves the full existing chat+results flow. FunnelSection is NOT yet wired in.
- `features/chat/components/RequestComposer.tsx` — Added optional `examples` and `onExampleClick` props for prompt chips. Changed placeholder to "What do you need done?"
- `features/landing/components/HeroSection.tsx` — New. Display headline + RequestComposer with 3 example prompt chips.
- `features/landing/components/OldWaySection.tsx` — New. 3 pain cards (Search/Phone/Scale icons), dashed borders, muted palette, staggered scroll fade-in.
- `features/landing/components/HandoffSection.tsx` — New. Scripted user/agent chat bubble, "From here, your agent takes over" pivot in accent-blue, priority badges.
- `features/landing/components/FunnelSection.tsx` — New. **Written but not yet wired into workspace.** 50-dot chaos burst, 5-stage scroll-driven narrowing (chaos→top10→top3→negotiation→winner), sticky priority badges, dark bg, mini-cards at negotiation stage.
- `features/landing/data/storyboard-fixtures.ts` — New. Local hardcoded data: `storyPriorities`, `chaosAgents` (50), `top10Agents` (10), `finalists` (3 with negotiation outcomes), `winnerExplanation`.
- `hooks/useInView.ts` — New. IntersectionObserver hook with `prefers-reduced-motion` support.
- `hooks/useScrollProgress.ts` — New. Returns 0-1 progress as user scrolls through an element.

## Learnings

1. **Boundary rule is strict**: Do NOT touch `features/shared/contracts/`, `features/shared/repositories/`, or `features/shared/mocks/`. Negotiation data lives only in `features/landing/data/storyboard-fixtures.ts`. Real `Candidate` contract is used only in the activated results flow.

2. **`next build` has a pre-existing failure** on `/_global-error` page due to a Next.js 16 / Turbopack `InvariantError`. This is NOT caused by our changes. Use `npx tsc --noEmit` for reliable type checking and dev server for runtime verification.

3. **Dev server lock file** can become stale. If you see "Unable to acquire lock", run `rm -f .next/dev/lock` before retrying.

4. **Color token registration pattern**: Custom colors need to be registered in both `@theme inline` (for Tailwind utility generation, e.g. `--color-accent-blue: var(--accent-blue)`) AND in `:root` / `.dark` (for actual values). Without the `@theme inline` entry, Tailwind classes like `text-accent-blue` won't work.

5. **OpenvilleWorkspace mode architecture**: `handleSubmit` sets mode to `"active"` AND calls `submitRequest()`. The mode flip happens synchronously before the async request. This means the active UI renders immediately with the loading state, which is correct.

6. **CandidateResults still has dev-facing copy** ("mock repository boundary", etc.). This should be cleaned up in Phase 5 or as a follow-up, not mid-implementation.

7. **Existing UI primitives available** in `components/ui/`: badge, button, card, chart, checkbox, dialog, input, label, sonner. No need to install new shadcn components for the current plan.

## Artifacts

- `thoughts/plans/frontend-landing-experience-v2.md` — Active implementation plan (source of truth)
- `thoughts/plans/frontend-landing-experience.md` — Superseded v1 plan (context only)
- `thoughts/research/frontend-landing-experience.md` — Research findings
- `features/landing/components/HeroSection.tsx` — Section 1 component
- `features/landing/components/OldWaySection.tsx` — Section 2 component
- `features/landing/components/HandoffSection.tsx` — Section 3 component
- `features/landing/components/FunnelSection.tsx` — Section 4 component (written, NOT wired in)
- `features/landing/data/storyboard-fixtures.ts` — Local fixture data for storyboard
- `hooks/useInView.ts` — IntersectionObserver hook
- `hooks/useScrollProgress.ts` — Scroll progress hook
- `features/chat/components/OpenvilleWorkspace.tsx` — Restructured workspace with mode toggle
- `features/chat/components/RequestComposer.tsx` — Updated with example chips support

## Action Items & Next Steps

### Immediate (resume Phase 3)

1. **Wire FunnelSection into OpenvilleWorkspace** — Replace the `<section className="bg-slate-950 ...">` placeholder at `OpenvilleWorkspace.tsx:91-93` with `<FunnelSection />`. Import from `@/features/landing/components/FunnelSection`.
2. **Run `npx tsc --noEmit`** to verify build.
3. **Manual verification**: Scroll through the funnel section and verify all 5 stages transition correctly (chaos burst → top 10 row → top 3 triangle → negotiation mini-cards → winner highlight).
4. **Get user confirmation** before moving to Phase 4.

### Phase 4: Finalist + Lifecycle + CTA

5. Build `features/landing/components/FinalistSection.tsx` — 3 finalist cards extending the `CandidateCard` pattern. Winner gets accent-amber border + "Best match" badge. Show price, reliability, speed, scope fit, discount, compromise note. One-sentence winner explanation below.
6. Build `features/landing/components/ClosureSection.tsx` — 3-step lifecycle strip (Payment processed → You're notified → Both sides review). Full-width RequestComposer repeat as climax CTA.
7. Wire both into OpenvilleWorkspace, replacing the remaining placeholder sections.
8. Verify build + manual check.

### Phase 5: Transition + Polish

9. Add transition animation when story mode → active mode (sections collapse/fade).
10. Validate all existing states still work in active mode (loading, error, empty, success).
11. Responsive pass at 375px, 768px, 1024px.
12. Accessibility pass: `prefers-reduced-motion` (already handled in hooks), keyboard focus, labels, contrast.
13. Clean up any remaining dev-facing copy in active mode components (e.g. `CandidateResults`).

## Other Notes

- The plan specifies `CandidateCard.tsx` should be extended for finalist comparison with winner highlighting. The FinalistSection can either extend CandidateCard directly or create dedicated finalist cards using local fixture types (since finalist data uses `FinalistNegotiation` from storyboard-fixtures, not the shared `Candidate` contract). The latter approach is cleaner given the boundary rules.
- The `useScrollProgress` hook drives stages via progress thresholds: `<0.2` chaos, `<0.4` top10, `<0.6` top3, `<0.8` negotiation, `>=0.8` winner. The funnel section height is `300vh` to give enough scroll runway. If stages feel too fast or slow, adjust either the height or the thresholds in `FunnelSection.tsx:41-47`.
- The plan mentions SVG paths or CSS pseudo-elements for tree connector lines in the funnel. The current implementation uses positioned dots without explicit connector lines. If connectors are desired, they can be added as an SVG overlay in the dot field container at `FunnelSection.tsx`.
