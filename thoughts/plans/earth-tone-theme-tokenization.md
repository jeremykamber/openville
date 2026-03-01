# Earth-Tone Theme + Full Tokenization Plan

**Date:** 2026-02-28
**Status:** Decision-complete, ready to implement
**Depends on:** `thoughts/research/theme-tokenization-audit.md`
**Scope:** Expand CSS token system to ~45 tokens, replace all hardcoded colors across 12 files, swap palette from blue/cyan SaaS to dark olive/slate earth tones.

---

## 1. What We Are Building

A complete theme infrastructure overhaul:
1. Expand `openville-theme.css` from 16 tokens to ~45 semantic tokens covering every color role in the app.
2. Replace every hardcoded `rgba(...)` and hex color in component files with `var(--ov-*)` references.
3. Swap the palette from generic blue/cyan to earth tones — dark olive/charcoal base, warm amber/terracotta accents, cream text.

After this, changing the entire app's color scheme means editing ONE file: `openville-theme.css`.

---

## 2. Earth-Tone Palette

### Design rationale
- **Base:** Dark olive/charcoal (`#0e1210`, `#141a16`, `#1c2620`) instead of navy blue. Feels grounded, not generic.
- **Text:** Warm cream (`#ece5d5`) instead of blue-white. Matches earth direction, still high-contrast.
- **Human accent:** Warm terracotta (`#d4916e`) instead of amber. More distinctive, still warm.
- **Signal accent:** Sage green (`#7bb58f`) instead of cyan. Natural, not techy.
- **Winner accent:** Amber gold (`#d4a24c`) — stays warm gold but shifts slightly to match.
- **Negotiation accent:** Burnt sienna (`#c47a4a`) — complements terracotta.
- **Success:** Moss green (`#6dab72`) — natural green.
- **Eliminated:** Warm gray (`#6b6358`) — not cold blue-gray.
- **Border base:** `rgba(180, 170, 145, 0.18)` — warm, not blue.
- **Shadow base:** `rgba(8, 6, 4, ...)` — warm black, not blue-black.

### Cluster colors (market graph nodes)
- AV Systems: sage green tint
- Staffing Ops: terracotta tint
- Logistics: moss green tint
- Venue Ops: cream/sand tint
- Backup Support: amber tint

---

## 3. Token System Design

### Core palette (16 tokens — existing names, new values)

```
--ov-bg-0           Dark olive base
--ov-bg-1           Mid olive
--ov-bg-2           Light olive
--ov-surface-0      Translucent dark (card interiors)
--ov-surface-1      Translucent mid (elevated surfaces)
--ov-border         Default border
--ov-text           Primary text (cream)
--ov-text-muted     Secondary text (warm gray)
--ov-human          Human accent (terracotta)
--ov-human-soft     Human bg tint
--ov-signal         Primary signal (sage green)
--ov-signal-strong  Signal emphasis (lighter sage)
--ov-negotiation    Negotiation (burnt sienna)
--ov-winner         Winner (amber gold)
--ov-eliminated     Eliminated (warm gray)
--ov-success        Success (moss green)
```

### New border tokens (3)

```
--ov-border-soft    Border at ~0.10 opacity
--ov-border-medium  Border at ~0.16 opacity (most common)
--ov-border-strong  Border at ~0.24 opacity
```

### New surface tokens (2)

```
--ov-surface-card   Card/panel background
--ov-surface-deep   Deepest bg (input fields, nested surfaces)
```

### New accent-derived tokens (10)

```
--ov-signal-soft    Signal at ~0.10 opacity (badge bg)
--ov-signal-border  Signal at ~0.18 opacity (badge/line border)
--ov-winner-soft    Winner at ~0.12 opacity (badge bg)
--ov-winner-border  Winner at ~0.24 opacity (panel/badge border)
--ov-human-border   Human at ~0.24 opacity (user bubble border)
--ov-human-bg       Human at ~0.10 opacity (user bubble bg)
--ov-negotiation-soft  Negotiation at ~0.12 opacity
--ov-success-soft   Success at ~0.12 opacity
--ov-success-border Success at ~0.22 opacity
--ov-eliminated-soft Eliminated at ~0.10 opacity
```

### New cluster tokens (10 — 5 clusters x border + bg)

```
--ov-cluster-av-border
--ov-cluster-av-bg
--ov-cluster-staffing-border
--ov-cluster-staffing-bg
--ov-cluster-logistics-border
--ov-cluster-logistics-bg
--ov-cluster-venue-border
--ov-cluster-venue-bg
--ov-cluster-backup-border
--ov-cluster-backup-bg
```

### New effect tokens (6)

```
--ov-shadow         Shadow base color
--ov-shadow-strong  Stronger shadow
--ov-glow-signal    Signal glow (box-shadow)
--ov-glow-winner    Winner glow (box-shadow)
--ov-glow-negotiation  Negotiation glow
--ov-text-on-accent Dark text for light accent backgrounds
```

### New gradient tokens (3)

```
--ov-gradient-card       Card background gradient
--ov-gradient-card-strong  Emphasized card gradient (ov-panel-strong)
--ov-gradient-winner     Winner/CTA panel gradient (amber-shifted)
```

### New stroke tokens (2)

```
--ov-stroke-default  SVG connection line (default)
--ov-stroke-winner   SVG connection line (winner)
```

**Total: ~52 tokens** (16 existing + 36 new)

---

## 4. Files to Modify

| File | Change | Phase |
|------|--------|-------|
| `app/openville-theme.css` | Rewrite with full token system + earth-tone values | 1 |
| `app/globals.css` | Add new `--color-ov-*` mappings in `@theme inline` | 1 |
| `features/landing/components/HandoffSection.tsx` | Replace 7 hardcoded colors | 2 |
| `features/landing/components/ClosureSection.tsx` | Replace 6 hardcoded inline styles | 2 |
| `features/landing/components/market/MarketNode.tsx` | Replace 20+ hardcoded cluster/state colors | 3 |
| `features/landing/components/market/AgentMarketGraph.tsx` | Replace 11+ gradient/glow/stroke colors | 3 |
| `features/landing/components/market/WinnerBlock.tsx` | Replace 8 hardcoded colors | 3 |
| `features/chat/components/RequestComposer.tsx` | Replace 15+ hardcoded colors | 4 |
| `features/chat/components/MessageList.tsx` | Replace 7 hardcoded colors | 4 |
| `features/chat/components/FollowUpPrompt.tsx` | Replace 5 hardcoded colors | 4 |
| `features/search/components/CandidateCard.tsx` | Replace 7 hardcoded colors | 5 |
| `features/search/components/CandidateResults.tsx` | Replace 4 hardcoded colors | 5 |
| `features/search/components/ResultsState.tsx` | Replace 6 hardcoded colors | 5 |

---

## 5. Implementation Phases

### Phase 1: Theme Infrastructure
**Files:** `openville-theme.css`, `globals.css`
**What:** Rewrite `openville-theme.css` with all ~52 tokens using earth-tone values. Update `globals.css` `@theme inline` block with new `--color-ov-*` mappings. Update `.ov-panel`, `.ov-panel-strong`, `.ov-chip*`, `.ov-text-gradient`, `body` gradient, `.ov-shell`, `.ov-grid`, `::selection` to use earth-tone colors.
**Verify:** `npx tsc --noEmit` (no type errors expected — CSS only). Visual check: page background and text should already shift.

### Phase 2: Landing Sections
**Files:** `HandoffSection.tsx`, `ClosureSection.tsx`
**What:** Replace all hardcoded rgba values with `var(--ov-*)` references. Convert inline styles in ClosureSection CTA panel to use token-based values.
**Note:** HeroSection, OldWaySection, FunnelSection, FinalistSection, PriorityRail are already clean — no hardcoded colors.
**Verify:** `npx tsc --noEmit`

### Phase 3: Market Sub-Components
**Files:** `MarketNode.tsx`, `AgentMarketGraph.tsx`, `WinnerBlock.tsx`
**What:** Replace cluster color maps, state shadow maps, gradient bgs, SVG stroke colors, badge colors with `var(--ov-*)` tokens. This is the highest-leak-count phase.
**Verify:** `npx tsc --noEmit`

### Phase 4: Chat Components
**Files:** `RequestComposer.tsx`, `MessageList.tsx`, `FollowUpPrompt.tsx`
**What:** Replace container border+bg, input border+bg, button colors, example chip colors, message bubble colors with tokens.
**Verify:** `npx tsc --noEmit`

### Phase 5: Search/Candidate Components
**Files:** `CandidateCard.tsx`, `CandidateResults.tsx`, `ResultsState.tsx`
**What:** Replace card border+bg+shadow, badge colors, follow-up card colors, retry button colors.
**Verify:** `npx tsc --noEmit`. Full grep for remaining hardcoded `rgba(` in `.tsx` files.

---

## 6. Acceptance Criteria

- [ ] Changing `openville-theme.css` alone swaps the entire app's color scheme
- [ ] Zero hardcoded `rgba(...)` color values in any `.tsx` component file
- [ ] Zero hardcoded hex color values in any `.tsx` component file (except `var()` references)
- [ ] `npx tsc --noEmit` produces zero errors
- [ ] Earth-tone palette feels warm, grounded, and distinct from generic SaaS blue
- [ ] `prefers-reduced-motion` still works (animations are unchanged)
- [ ] All existing functionality preserved — no layout or behavior changes

---

## 7. Token Replacement Cheatsheet

Quick reference for the most common replacements across files:

```
rgba(124,170,255,0.08)  → var(--ov-border-soft)
rgba(124,170,255,0.12)  → var(--ov-border-soft)
rgba(124,170,255,0.14)  → var(--ov-border-medium)
rgba(124,170,255,0.16)  → var(--ov-border-medium)
rgba(124,170,255,0.18)  → var(--ov-border-medium)
rgba(124,170,255,0.20)  → var(--ov-border)
rgba(124,170,255,0.24)  → var(--ov-border-strong)

rgba(9,17,29,0.84)      → var(--ov-surface-card)
rgba(9,17,29,0.88)      → var(--ov-surface-0)
rgba(9,17,29,0.92)      → var(--ov-surface-0)
rgba(8,15,27,0.72)      → var(--ov-surface-card)
rgba(8,15,27,0.78)      → var(--ov-surface-deep)
rgba(13,23,38,0.68)     → var(--ov-surface-card)
rgba(13,23,38,0.72)     → var(--ov-surface-card)
rgba(13,23,38,0.88)     → var(--ov-surface-deep)
rgba(13,23,38,0.94)     → var(--ov-surface-deep)
rgba(19,32,51,0.82)     → var(--ov-surface-1)
rgba(19,32,51,0.92)     → var(--ov-surface-1)
rgba(19,32,51,0.96)     → var(--ov-surface-1)
rgba(19,32,51,0.98)     → var(--ov-surface-1)
rgba(7,17,29,0.78)      → var(--ov-surface-deep)
rgba(7,17,29,0.94)      → var(--ov-surface-deep)

rgba(242,191,122,0.08)  → var(--ov-human-bg)
rgba(242,191,122,0.10)  → var(--ov-human-bg)
rgba(242,191,122,0.12)  → var(--ov-human-bg)
rgba(242,191,122,0.14)  → var(--ov-human-soft)
rgba(242,191,122,0.20)  → var(--ov-human-border)
rgba(242,191,122,0.24)  → var(--ov-human-border)
rgba(242,191,122,0.38)  → (hover state — use separate token or opacity step)

rgba(103,215,255,0.05)  → var(--ov-signal-soft) at reduced opacity
rgba(103,215,255,0.06)  → var(--ov-signal-soft)
rgba(103,215,255,0.08)  → var(--ov-signal-soft)
rgba(103,215,255,0.10)  → var(--ov-signal-soft)
rgba(103,215,255,0.14)  → var(--ov-signal-soft)
rgba(103,215,255,0.18)  → var(--ov-signal-border)
rgba(103,215,255,0.24)  → var(--ov-signal-border)
rgba(103,215,255,0.32)  → (hover state)
rgba(103,215,255,0.35)  → var(--ov-glow-signal)
rgba(103,215,255,0.50)  → var(--ov-signal) at 50%

rgba(255,209,102,0.10)  → var(--ov-winner-soft)
rgba(255,209,102,0.12)  → var(--ov-winner-soft)
rgba(255,209,102,0.14)  → var(--ov-winner-soft)
rgba(255,209,102,0.20)  → var(--ov-winner-border)
rgba(255,209,102,0.22)  → var(--ov-winner-border)
rgba(255,209,102,0.24)  → var(--ov-winner-border)
rgba(255,209,102,0.30)  → var(--ov-winner-border)
rgba(255,209,102,0.38)  → var(--ov-glow-winner)
rgba(255,209,102,0.40)  → var(--ov-glow-winner)
rgba(255,209,102,0.82)  → var(--ov-stroke-winner)

rgba(255,178,77,0.04)   → var(--ov-negotiation-soft) at reduced opacity
rgba(255,178,77,0.07)   → var(--ov-negotiation-soft)
rgba(255,178,77,0.16)   → var(--ov-negotiation-soft)
rgba(255,178,77,0.24)   → var(--ov-negotiation) at 24%
rgba(255,178,77,0.34)   → var(--ov-glow-negotiation)

rgba(103,211,154,0.14)  → var(--ov-success-soft)
rgba(103,211,154,0.22)  → var(--ov-success-border)

rgba(2,6,15,0.28)       → var(--ov-shadow)
rgba(2,6,15,0.35)       → var(--ov-shadow)
rgba(2,6,15,0.42)       → var(--ov-shadow-strong)
rgba(2,6,15,0.45)       → var(--ov-shadow-strong)
rgba(2,6,15,0.55)       → var(--ov-shadow-strong)
rgba(6,10,18,0.45)      → var(--ov-shadow-strong)

#06111d                  → var(--ov-text-on-accent)
#f7cb90                  → (hover variant of --ov-human — use custom property)
```

---

## 8. Risks and Edge Cases

1. **Tailwind v4 `var()` in arbitrary values.** `border-[var(--ov-border-medium)]` works in Tailwind v4 arbitrary value syntax. Confirmed by existing usage patterns in the codebase (e.g. `text-[var(--ov-text)]`).

2. **Gradients can't be a single token** for `background:` shorthand. We define gradient tokens as full `linear-gradient(...)` strings but they only work in inline `style` or CSS classes, not in Tailwind arbitrary values for `bg-[...]`. Affected: `.ov-panel`, `.ov-panel-strong`, WinnerBlock gradient bg, CandidateCard gradient bg. Solution: keep these as CSS utility classes referencing tokens, not as Tailwind arbitrary values.

3. **Box-shadow with multiple values.** Tailwind's `shadow-[...]` arbitrary value supports complex shadows. The `var()` approach works for the color portion but not for full shadow definitions. Solution: use `shadow-[0_20px_50px_var(--ov-shadow)]` — the color token goes inside the shadow declaration.

4. **Hover state colors.** A few places use a brighter variant on hover (e.g. `hover:border-[rgba(242,191,122,0.38)]`). We could add `--ov-human-border-hover` or just use `hover:opacity-*`. Decision: add a `--ov-human-hover` and `--ov-signal-hover` token for the 2-3 places that need them.

5. **SVG stroke colors** in AgentMarketGraph use inline JSX `stroke={...}`. These need to use `var(--ov-stroke-winner)` etc. as string values passed to the SVG `stroke` attribute. CSS custom properties work in SVG inline styles but need to be in `style={{ stroke: 'var(--ov-stroke-winner)' }}` form, not as a direct attribute. Will need to switch from `stroke="rgba(...)"` to `style={{ stroke: "var(--ov-stroke-winner)" }}`.
