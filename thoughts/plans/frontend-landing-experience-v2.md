---
date: 2026-02-28T20:00:00-08:00
git_commit: ee4399f
branch: feat/yirivera-landing
repository: openville
topic: "Frontend landing experience plan v2 — scroll-triggered story"
tags: [plan, frontend, landing-page, onboarding, ux, agent-negotiation, visual-storytelling]
status: active
supersedes: thoughts/plans/frontend-landing-experience.md
last_updated: 2026-02-28
---

# Plan: Redesign Landing Experience as Scroll-Triggered Story (v2)

## Why This Exists

The v1 plan (`frontend-landing-experience.md`) had strong structural instincts — action-first entry, elimination funnel, pinned priorities, finalist cards — but failed as a hackathon storytelling vehicle. It read like a feature walkthrough (6 sections of "what the product does") without building the emotional contrast that makes an audience care.

The core problem: v1 never showed what life looks like WITHOUT Openville. Without a "before," the "after" has no weight. For a hackathon audience with 30 seconds of attention, that missing contrast is a fatal flaw.

## What Changed From v1

1. Replaced the flat 6-section feature inventory with a narrative arc: tension → pivot → revelation → resolution
2. Added "The Old Way" section to create the past-vs-present bridge
3. Replaced the unspecified "storyboard funnel" with a two-phase visualization: expanding chaos graph (agents competing) → structured decision tree (intelligent narrowing)
4. Defined a concrete visual identity: blue + amber, Geist fonts, dark section inversion
5. Resolved the v1 Section 5 context-switch by making the prototype a same-page mode transition
6. Kept negotiation data local to storyboard components (respecting Dev 1 contract boundaries)

## Critique of v1 (Key Problems)

1. **No emotional arc.** Flat → Flat → Informational × 4. No tension, no "aha."
2. **The "bridge" is missing.** Never shows the old way. No contrast.
3. **The storyboard is undesigned.** Mentioned 4 times, zero visual specification.
4. **Section 5 is a context switch.** Working chat prototype mid-scroll breaks continuity.
5. **Design identity crisis.** "Calm, confident, intentional" undefined. Pure grayscale tokens.
6. **Not demo-able in 30 seconds.** No single visual beat makes a judge lean in.

### What v1 Got Right (Preserved)

- RequestComposer as primary CTA above the fold
- Elimination funnel as the core story (many → 10 → 3 → 1)
- Pinned human priorities during the funnel
- Finalist trade-off cards (not transcript-first)
- Contract preservation (no new shared types)
- Existing hook/repository architecture unchanged

---

## Section Structure: "The Handoff"

The narrative: you used to do all this yourself. Now your agent does it for you. Watch.

### Section 1: The Hook (Hero)

**Shows:** Powerful headline + RequestComposer (actual working component) as primary CTA + 3 example prompt chips.

**Emotional beat:** Curiosity + immediate action opportunity.

**Visual:** Clean white, spacious. The input is the visual anchor — large, centered, generous whitespace. Headline uses Geist Bold at display size. No gradient.

**Copy direction:**
- Headline: "Your AI agent hires for you."
- Subheadline: "No more browsing listings, comparing quotes, or playing phone tag. Tell your agent what you need — it finds, vets, negotiates, and selects the best match."

When submitted, the page transitions from scroll story into the live interaction flow (messages, follow-up, results).

### Section 2: The Old Way (Tension)

**Shows:** 3 "pain cards" in a horizontal row:
1. "Search through dozens of listings" (Search icon)
2. "Call around, wait for callbacks" (Phone icon)
3. "Compare quotes yourself and hope for the best" (Scale icon)

**Emotional beat:** Recognition. "Yeah, I hate that."

**Visual:** Intentionally muted. Dashed borders, `text-muted-foreground`, desaturated. The "before" world should feel tired. Brief — 1 viewport max.

### Section 3: The Handoff (Pivot)

**Shows:** Scripted moment — user says "Fix my gutters this week. I care most about price." Agent responds. Below: "From here, your agent takes over."

**Emotional beat:** Relief + curiosity. "That's all I have to do?"

**Visual:** Color activates here. Muted palette gives way to full brand palette. Priority badges appear: "Budget: low cost", "Timeline: this week". The page "wakes up."

### Section 4: The Agent Economy (Revelation — the wow moment)

**Shows:** Two-phase visualization transitioning from chaos to structure. User priorities pinned via `position: sticky`.

**Emotional beat:** Surprise → delight. "It actually negotiated for me?"

**Visual:** Dark background (`slate-950`) — single dramatic inversion. Tall section (multiple viewports).

#### Phase A — "The Chaos" (expanding center graph)

Agents burst outward from a center point in all directions — force-directed / constellation style. 50 dots radiate from center, filling the space. Marketplace explosion. Energetic, slightly overwhelming.

**Implementation:** CSS transforms + IntersectionObserver. Dots absolutely positioned. Initial: all at `translate(0,0)`. On scroll: transition to pre-calculated radial positions. Angle + radius for circular spread. `transition-all duration-700`. Dots are 6-10px colored circles.

**Label:** "50 agents found for your job"

#### Phase B — "The Narrowing" (tree/decision structure)

Chaos resolves into ordered tree:

| Scroll stage | Visual | Label |
|---|---|---|
| Chaos → Top 10 | 40 dots fade to `opacity-5`. 10 reorganize into horizontal row / two-tier tree. Lines appear. | "Ranked to top 10 by relevance and track record" |
| Top 10 → Top 3 | 7 fade. 3 grow, show names. Only 3 branches remain. | "Narrowed to 3 based on your priorities" |
| Top 3 → Negotiation | 3 nodes become mini-cards with negotiation outcomes. Connector lines. | "Your agent negotiated with each finalist" |
| Negotiation → Winner | 1 elevates, 2 dim. Single highlighted path from origin → winner. | "Winner selected" |

**The contrast IS the story:** Chaos of competing agents → structured tree of intelligent selection = visual proof the AI economy works.

**Implementation:** Dot positions transition between three layout states:
1. Scattered (radial) — Phase A
2. Structured (tree grid) — Phase B stages
3. Resolved (single path) — final

CSS `transition-all duration-700 ease-out`. Tree lines via SVG paths or CSS pseudo-elements. Priority badges `position: sticky; top: 1rem`.

### Section 5: The Finalist Breakdown (Resolution)

**Shows:** 3 finalist cards: name, price, reliability, speed, scope fit, discount, compromise note. Winner gets accent border + "Best match" badge. Below: one-sentence explanation referencing priorities.

**Emotional beat:** Conviction. "The decision is justified."

**Visual:** Light background. Cards extend the `CandidateCard` pattern. Winner gets accent border and background tint. Other two muted.

### Section 6: Lifecycle & Climax CTA (Closure)

**Shows:** 3-step strip: "Payment processed → You're notified → Both sides review." Below: full-width RequestComposer repeat.

**Emotional beat:** Completeness + impulse to act.

**Visual:** Lifecycle strip is minimal — 3 icons + labels. CTA bookends the hero.

---

## Visual Identity: "Machine Precision, Human Warmth"

### Typography
Keep Geist Sans + Geist Mono (already loaded). Weight variation for hierarchy:
- Hero headline: Geist Bold, ~3xl-4xl
- Section heads: Geist Semibold, ~2xl
- Body: Geist Regular, base
- Data labels: Geist Mono

### Color Additions

| Token | Value | Use |
|---|---|---|
| `--accent-blue` | `oklch(0.55 0.18 250)` (~blue-600) | Primary accent, links, active states |
| `--accent-amber` | `oklch(0.75 0.15 75)` (~amber-600) | Winner highlight, CTA hover, selection |

Why blue + amber: Blue = trust, reliability, intelligence. Amber = warmth, human attention, "this is the one."

### Layout
- Full-width sections, content `max-w-5xl mx-auto`
- `py-20 sm:py-28` section padding
- Section 4 dark background; all others light
- No decorative gradients

### Motion (CSS-only)
1. Scroll-triggered fade-in: `opacity-0 translate-y-4` → `opacity-100 translate-y-0` via IntersectionObserver. `transition-all duration-700 ease-out`.
2. Sticky pinning: Priority badges `position: sticky; top: 1rem` during Section 4.
3. Funnel elimination: `transition-all duration-500`. Eliminated: `opacity-10 scale-75`. Winner: `scale-110 shadow-lg`.

---

## How the Live Prototype Fits

The working prototype (`useChatFlow` + `RequestComposer` + `MessageList` + `FollowUpPrompt` + `CandidateResults`) is accessed via the hero RequestComposer. On submit:

1. Scroll story sections collapse or fade
2. Page transitions to interactive chat + results experience
3. All existing states preserved (loading, error, empty, success)

Scroll story = entry experience. Prototype = activated experience. Same page, different modes.

---

## Boundary Rules

- Do NOT touch shared contracts (`Candidate`, `ChatMessage`, `UserPreferences`, etc.) — negotiation is Dev 3's domain
- Storyboard uses local hardcoded fixture data for the visual story
- Real `Candidate` contract used only in the activated results flow
- Preserve `UI → hook → repository → mock` flow
- No new routes — everything stays on `app/page.tsx`

---

## Critical Files

| File | Change |
|---|---|
| `app/globals.css` | Add `--accent-blue` and `--accent-amber` tokens |
| `features/chat/components/OpenvilleWorkspace.tsx` | Restructure from 2-col dev layout → scroll story with mode toggle |
| `features/chat/components/RequestComposer.tsx` | Promote to hero, add example chips |
| `features/search/components/CandidateCard.tsx` | Extend for finalist comparison with winner highlighting |
| New: `features/landing/data/storyboard-fixtures.ts` | Local hardcoded data for funnel and finalist display |
| New: `hooks/useInView.ts` or `hooks/useScrollProgress.ts` | IntersectionObserver hook |
| New: `features/landing/components/` | HeroSection, OldWaySection, HandoffSection, FunnelSection, FinalistSection, ClosureSection |

---

## Implementation Phases

### Phase 1: Design tokens + Layout shell
- Add color tokens to `globals.css`
- Restructure `OpenvilleWorkspace` into section-based scroll layout
- Set up "story mode" vs "active mode" toggle

### Phase 2: Hero + Old Way + Handoff
- Promote RequestComposer to hero CTA with example chips
- Build 3 pain cards (muted, dashed)
- Build scripted handoff moment with priority extraction

### Phase 3: Funnel section
- Implement `useScrollProgress` hook
- Build Phase A: chaos burst — 50 dots expanding from center
- Build Phase B: narrowing tree — dots reorganize, connectors appear
- 4 scroll-triggered transition stages
- Sticky priority badges
- Dark background + SVG/CSS connectors

### Phase 4: Finalist + Lifecycle + CTA
- Finalist comparison cards with winner treatment
- Lifecycle strip
- Climax CTA (RequestComposer repeat)

### Phase 5: Transition + Polish
- Story → active mode transition on submit
- Validate all existing states
- Responsive pass (375px, 768px, 1024px)
- Accessibility pass

---

## Verification

1. Load page → see scroll story, not dev layout
2. Scroll → each section triggers animations, builds narrative
3. Funnel shows chaos burst resolving into structured tree
4. Finalist cards show clear winner with explanation
5. Submit from hero → page transitions to working chat flow
6. All states work: loading, error, empty, success
7. Mobile: composer above the fold, sections stack cleanly
8. `prefers-reduced-motion`: animations suppressed
9. Keyboard: all interactive elements focusable

---

## Decisions Locked

1. **Funnel scope:** Full 5-stage (50→10→3→negotiation→winner)
2. **Prototype integration:** Same-page transition on submit
3. **Negotiation data:** Hardcoded local to storyboard/finalist components. Shared `Candidate` contract untouched.
4. **Scroll direction:** Vertical (top to bottom). Funnel visualization uses expanding center graph (Phase A) transitioning to tree structure (Phase B) within a vertically-scrolled section.
