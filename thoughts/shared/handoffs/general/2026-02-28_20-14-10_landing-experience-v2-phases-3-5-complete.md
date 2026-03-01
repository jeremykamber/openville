---
date: 2026-02-28T20:14:10-08:00
researcher: Dev 1 (Yonie)
git_commit: 6ac8fa3
branch: feat/yirivera-landing
repository: openville
topic: "Landing Experience v2 — Phases 3-5 Complete"
tags: [implementation, landing-page, scroll-animation, funnel-visualization, finalist-cards, transition, accessibility, frontend]
status: complete
last_updated: 2026-02-28
last_updated_by: Dev 1
type: implementation_strategy
---

# Handoff: Landing Experience v2 — All 5 Phases Complete

## Task(s)

Completed the remaining phases of the v2 landing experience implementation using the plan at `thoughts/plans/frontend-landing-experience-v2.md`.

| Phase | Status | Summary |
|---|---|---|
| Phase 1: Design tokens + Layout shell | **Completed (prior session)** | Accent tokens, workspace mode toggle, hooks, landing directory + fixtures |
| Phase 2: Hero + Old Way + Handoff | **Completed (prior session)** | HeroSection, OldWaySection, HandoffSection |
| Phase 3: Funnel section | **Completed** | Wired FunnelSection into workspace, added SVG ConnectorOverlay with stage-driven lines |
| Phase 4: Finalist + Lifecycle + CTA | **Completed** | Built FinalistSection (3 cards, winner treatment) and ClosureSection (lifecycle strip + climax CTA), wired both into workspace |
| Phase 5: Transition + Polish | **Completed** | Story->active mode transition animation, responsive pass (375/768/1024px), accessibility pass, dev-copy cleanup |

All placeholder sections in `OpenvilleWorkspace` have been replaced with real components. The full 6-section scroll narrative is functional.

## Critical References

- `thoughts/plans/frontend-landing-experience-v2.md` — The active v2 plan (source of truth for section specs, visual identity, boundary rules)
- `context/user_flow.md` — The 10-step product flow. Landing page visualizes steps 1-7.
- `AGENTS.md` — Dev 1 frontend workflow rules, contract naming, mock data rules

## Recent changes

- `features/landing/components/FunnelSection.tsx:90-191` — Added `ConnectorOverlay` component: SVG lines from center to dot positions, transitioning per stage (top10 blue branches, top3 narrows, negotiation amber highlight for winner, winner collapses). Also added `role="img"` + `aria-label` to the dot field container.
- `features/landing/components/FunnelSection.tsx:253` — Reduced dot field from `360px` to `300px` on mobile for 375px viewport fit, `sm:400px` for tablet+.
- `features/landing/components/FinalistSection.tsx` — New. 3 finalist cards using `Card`/`Badge` primitives. Winner: accent-amber border, shadow, "Best match" badge. Losers: muted at `opacity-75`. Shows price (with strikethrough original), speed, reliability, scope fit, discount badge, compromise note. Winner explanation below from `winnerExplanation` fixture.
- `features/landing/components/ClosureSection.tsx` — New. 3-step lifecycle strip (CreditCard/Bell/Star icons): "Payment processed", "You're notified", "Both sides review". Full-width `RequestComposer` repeat as climax CTA. Takes same props as HeroSection to drive mode transition.
- `features/chat/components/OpenvilleWorkspace.tsx` — Major update. Added 3-state mode (`story | transitioning | active`). Transition: story fades out (`opacity-0 scale-[0.98]`, 500ms), scrolls to top, then active UI fades in. `submitRequest` deferred via ref until active UI mounts so loading state renders there. Respects `prefers-reduced-motion` (delay=0). Imported and wired `FunnelSection`, `FinalistSection`, `ClosureSection`. No more placeholder divs.
- `features/search/components/CandidateResults.tsx:24,33,67-69` — Replaced 3 dev-facing strings ("mock repository boundary" etc.) with user-appropriate copy.
- `app/globals.css:134-142` — Added global `prefers-reduced-motion` rule that kills all transitions/animations.

## Learnings

1. **SVG connector viewBox alignment**: The dot field positions dots from center using CSS `translate()`. The SVG overlay uses `viewBox="-200 -200 400 400"` so its coordinate origin matches the dot field center. Lines use the same `getTop10Position`/`getTop3Position` functions as the dots, so coordinates are always in sync.

2. **Transition timing with React batching**: In the `transitioning -> active` swap, `setMode("active")` and `submitRef.current?.()` run in the same `setTimeout` callback. React 18+ batches these, so the active UI mounts with the initial `submitRequest` state changes (isSubmitting=true, messages updated) in one render. `requestAnimationFrame` then triggers the fade-in on the next frame.

3. **FinalistSection uses local types deliberately**: `FinalistNegotiation` from storyboard-fixtures, NOT the shared `Candidate` contract. The boundary rule is strict — negotiation data is Dev 3's domain.

4. **Mobile dot field sizing**: At 375px viewport with `px-4` (32px total padding), usable width is 343px. The dot field was 360px (overflow). Reduced to 300px for mobile, 400px at `sm:` breakpoint.

5. **Pre-existing `next build` failure** still exists on `/_global-error` (Next.js 16 / Turbopack `InvariantError`). Use `npx tsc --noEmit` for reliable type checking.

## Artifacts

- `features/landing/components/FunnelSection.tsx` — Section 4 with ConnectorOverlay (SVG lines)
- `features/landing/components/FinalistSection.tsx` — Section 5 (finalist cards)
- `features/landing/components/ClosureSection.tsx` — Section 6 (lifecycle strip + CTA)
- `features/chat/components/OpenvilleWorkspace.tsx` — Workspace with 3-state mode transition, all 6 sections wired
- `features/search/components/CandidateResults.tsx` — Cleaned up dev-facing copy
- `app/globals.css` — Added prefers-reduced-motion rule
- `thoughts/plans/frontend-landing-experience-v2.md` — Active plan (unchanged, all phases now implemented)
- `features/landing/components/HeroSection.tsx` — Section 1 (unchanged this session)
- `features/landing/components/OldWaySection.tsx` — Section 2 (unchanged)
- `features/landing/components/HandoffSection.tsx` — Section 3 (unchanged)
- `features/landing/data/storyboard-fixtures.ts` — Fixture data (unchanged)
- `hooks/useInView.ts` — IntersectionObserver hook (unchanged)
- `hooks/useScrollProgress.ts` — Scroll progress hook (unchanged)

## Action Items & Next Steps

All 5 implementation phases are complete. Remaining work is refinement:

1. **Manual QA**: Scroll through the full 6-section narrative on desktop and mobile. Verify funnel stage transitions, connector lines, finalist cards, and mode transition all behave as expected.
2. **Visual tuning (optional)**: The funnel section height is `300vh` — if stages feel too fast or slow, adjust either the height or the thresholds in `FunnelSection.tsx:138-143`. Connector line opacities can be tuned in the `ConnectorOverlay` component.
3. **SVG path animation (optional enhancement)**: Connector lines currently appear/disappear via opacity transitions. Could add `stroke-dashoffset` animation for a "drawing" effect.
4. **Shared layout animation (optional enhancement)**: The hero RequestComposer and active mode RequestComposer are separate instances. A shared layout animation (e.g., via `framer-motion`) could make the composer appear to persist across the mode transition.
5. **Commit the work**: All changes are currently unstaged. Ready to commit when the user is satisfied with QA.
6. **Integration with backend**: When real APIs are ready, swap mock repositories at the service layer. No landing page components need to change — they use local fixture data. Only `useChatFlow` and `useRankedResults` swap their repository dependencies.

## Other Notes

- All changes pass `npx tsc --noEmit` cleanly.
- The workspace no longer has any placeholder divs — all 6 story sections render real components.
- The `ClosureSection` RequestComposer does NOT have example chips (unlike HeroSection) — this is intentional. The closure CTA is for users who have already scrolled the full story and are ready to act, not browse examples.
- The `ConnectorOverlay` winner line collapses to zero length at the winner stage because the winner dot moves to center (0,0). This looks like the line "resolving" rather than drawing a path to a fixed position, which is a cleaner visual.
- Changes are NOT committed. The branch has no new commits since `6ac8fa3`.
