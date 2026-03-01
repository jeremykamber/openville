---
date: 2026-02-28T23:14:31-0800
researcher: opencode
git_commit: 4d5970a
branch: frontend-premium
repository: openville
topic: "Openville Premium Frontend — Visual Rebuild with Motion/R3F/GSAP"
tags: [implementation, frontend, motion, r3f, gsap, landing-page, premium-visual]
status: complete
last_updated: 2026-02-28
last_updated_by: opencode
type: implementation_strategy
---

# Handoff: Premium Visual Rebuild — Sections 1-6 Motion/R3F/GSAP

## Task(s)

**Building a hackathon-winning premium frontend for Openville** — an AI-powered service marketplace where a user's personal AI agent finds, negotiates with, and books tradespeople.

### Completed (Previous Sessions)
1. Theme system (`openville-theme.css`) — Precision Noir color system
2. Font system (Outfit, Plus Jakarta Sans, JetBrains Mono)
3. Lenis smooth scroll provider
4. Shared contracts aligned with dev branch
5. Mock data (8 tradespeople, preferences, chat)
6. Search repository rewritten
7. Storyboard fixtures (50 agents, 5 clusters, 3 finalists)
8. All landing components fixed for correct types/tokens (27 fixes total)

### Completed (This Session)
9. **Hero Section rebuilt** — R3F particle nebula (lazy-loaded, ssr:false), `useTextScramble` hook for GSAP-style text decode, Motion entrance choreography (stagger, fadeUp, fadeScale), full-viewport centered layout, gradient overlays for readability, bottom fade
10. **Problem Section rebuilt** — Motion `useInView` scroll reveals, staggered card entrance (`cardContainer`/`cardItem` variants), SVG icons per pain type, hover glow effects, warm ambient radial glow
11. **Handoff Section rebuilt** — Motion animated message bubbles (user slides from right, agent slides from left), processing arrow animation, flow diagram (natural language → parsed intent → market rules), rail reveal for extracted priorities
12. **Funnel Section rebuilt** — `AnimatePresence` stage indicator transitions, progress bar at bottom, ambient glow, enhanced backdrop-blur on sticky bar
13. **Finalist Section rebuilt** — Motion `boardReveal` and `winnerReveal` variants, negotiation violet ambient glow, kicker uses `--ov-negotiation` color
14. **Closure Section rebuilt** — Motion stagger lifecycle cards with step numbers + SVG icons, `ctaReveal` for CTA panel, success green + signal blue ambient glow, hover glow on cards

**BUILD STATUS: PASSING** — verified with `npm run build` after all 6 sections.

## Critical References

- `app/openville-theme.css` — The Precision Noir design system with all tokens, utility classes, animations, and reduced-motion support
- `features/landing/data/storyboard-fixtures.ts` — All mock data driving the 6 sections (50 agents, 5 clusters, 3 finalists, pain points, handoff prefs, lifecycle steps)

## Recent changes

- `features/landing/components/three/ParticleNebula.tsx` — NEW: R3F particle field (1800 particles, Gaussian distribution, additive blending, orbital drift)
- `features/landing/components/three/HeroBackground.tsx` — NEW: Lazy-loaded Canvas wrapper with `next/dynamic` ssr:false, reduced-motion check
- `hooks/useTextScramble.ts` — NEW: requestAnimationFrame-based text scramble/decode effect with reduced-motion support
- `features/landing/components/HeroSection.tsx` — REBUILT: Full-viewport hero with R3F background, text scramble headline, Motion choreography
- `features/landing/components/OldWaySection.tsx` — REBUILT: Motion scroll reveals, staggered fragment cards with icons and hover glow
- `features/landing/components/HandoffSection.tsx` — REBUILT: Motion animated chat bubbles, processing arrow, flow diagram, rail reveal
- `features/landing/components/FunnelSection.tsx` — REBUILT: AnimatePresence stage transitions, progress bar, ambient glow
- `features/landing/components/FinalistSection.tsx` — REBUILT: Motion board/winner reveal variants, negotiation ambient glow
- `features/landing/components/ClosureSection.tsx` — REBUILT: Motion stagger lifecycle cards, step icons, CTA with inner glow

## Learnings

1. **Motion `ease` typing**: Motion (framer-motion successor, imported as `motion/react`) requires cubic bezier easing as `[number, number, number, number]` tuple, not `number[]`. Define as: `const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];`
2. **Motion `useInView` vs custom hook**: Motion exports its own `useInView` from `motion/react` which integrates better with Motion variants than the custom `hooks/useInView.ts`. The rebuilt sections use `motion`'s version.
3. **R3F lazy loading pattern**: Use `next/dynamic` with `ssr: false` to wrap the Canvas. The `HeroBackground.tsx` component uses `dynamic(() => import('@react-three/fiber').then(...))` to co-load Canvas + scene in one chunk.
4. **`require()` in dynamic import**: The `HeroBackground.tsx` uses `require("./ParticleNebula")` inside the dynamic import's `.then()` callback to avoid issues with tree-shaking the R3F scene component.
5. **CSS token corrections from previous sessions**: `--ov-signal-strong` → `--ov-signal-bright`, `--ov-winner` → `--ov-human-bright`. Old cluster type `MarketCluster` → `ServiceCluster`. Old finalist fields → `openingRate`/`negotiatedRate`/`estimatedTotal`/`availability`.
6. **Build passes with all animation libraries**: motion, @react-three/fiber, drei, three, gsap all compile cleanly in Next.js 16.1.6 with Turbopack.

## Artifacts

- `features/landing/components/three/ParticleNebula.tsx` — R3F particle scene
- `features/landing/components/three/HeroBackground.tsx` — Lazy Canvas wrapper
- `hooks/useTextScramble.ts` — Text scramble hook
- `features/landing/components/HeroSection.tsx` — Rebuilt hero (231 lines)
- `features/landing/components/OldWaySection.tsx` — Rebuilt problem section
- `features/landing/components/HandoffSection.tsx` — Rebuilt handoff section
- `features/landing/components/FunnelSection.tsx` — Rebuilt funnel section
- `features/landing/components/FinalistSection.tsx` — Rebuilt finalist section
- `features/landing/components/ClosureSection.tsx` — Rebuilt closure section

## Action Items & Next Steps

**Priority 1 — Workspace Mode Premium Rebuild**:
1. Rebuild `features/chat/components/OpenvilleWorkspace.tsx` — The orchestrator works but needs Motion transition from story→active mode (scale(0.98) fade-out is CSS-only currently, upgrade to Motion AnimatePresence)
2. Rebuild `features/chat/components/MessageList.tsx` — Needs Motion stagger on incoming messages
3. Polish `features/chat/components/RequestComposer.tsx` — Add amber glow animation on focus, Motion entrance
4. Polish `features/chat/components/FollowUpPrompt.tsx` — Motion reveal

**Priority 2 — Search Results Premium Polish**:
5. Polish `features/search/components/CandidateCard.tsx` — Motion entrance, hover elevation
6. Polish `features/search/components/CandidateResults.tsx` — Staggered card reveal
7. Polish `features/search/components/ResultsState.tsx` — Loading/error/empty state animations

**Priority 3 — Market Sub-Components Premium Polish**:
8. `features/landing/components/market/AgentMarketGraph.tsx` — Motion transitions between stages (nodes repositioning)
9. `features/landing/components/market/MarketNode.tsx` — Motion scale/opacity on stage changes
10. `features/landing/components/market/NegotiationBoard.tsx` — Animated bid counter (opening→final rate)
11. `features/landing/components/market/WinnerPath.tsx` — Winner glow pulse animation
12. `features/landing/components/market/BridgePreview.tsx` — Motion entrance, may need full rebuild
13. `features/landing/components/market/ClusterLegend.tsx` — Motion stagger

**Priority 4 — Cross-Cutting**:
14. Responsive polish across all viewports (375px, 768px, 1024px, 1440px)
15. Accessibility audit: `prefers-reduced-motion` (partially done in hero/text-scramble, verify all Motion components), keyboard nav, focus management
16. Final build test

## Other Notes

### Design Direction: "Precision Noir"
Dark, deep-space aesthetic. Bloomberg Terminal meets Apple spatial computing. Every light source has intent.

### Color Tokens (key ones)
- `--ov-void: #050a12` (true bg), `--ov-signal: #3b82f6` (AI blue), `--ov-human: #f59e0b` (amber), `--ov-success: #10b981`, `--ov-negotiation: #a78bfa` (violet), `--ov-danger: #ef4444`

### Typography
- Display: Outfit (`--font-display`), Body: Plus Jakarta Sans (`--font-body`), Mono: JetBrains Mono (`--font-mono`)

### Animation Libraries Installed
- `motion` (framer-motion successor) — primary animations
- `lenis` — smooth scrolling
- `@react-three/fiber` + `@react-three/drei` + `@react-three/postprocessing` — Hero 3D
- `gsap` + `@gsap/react` — available for text effects (useTextScramble currently uses vanilla rAF instead)
- `three` + `@types/three` — R3F peer dep

### State Machine
`WorkspaceMode = "story" | "transitioning" | "active"` — in `OpenvilleWorkspace.tsx`

### Key Exports from storyboard-fixtures.ts
`storyScenario`, `heroPromptChips`, `painPoints`, `handoffPreferences`, `marketClusters`, `marketAgents`, `top10Agents`, `finalists`, `winnerExplanation`, `loserExplanations`, `lifecycleSteps`, types `ServiceCluster`, `MarketAgent`, `FinalistNegotiation`, etc.

### Package Manager
npm (not pnpm). Run `npm run build` to verify, `npm run dev` to preview.

### Context Management
When context exceeds 40%, create a handoff using `/create_handoff`, then resume in a new session using `/resume_handoff`. This is a repeatable cycle — always do this.

### Uncommitted Changes
All work is uncommitted on `frontend-premium` branch. There are 32 modified files and 3 untracked files. Consider committing before continuing.
