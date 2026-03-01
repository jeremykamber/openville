# Theme Tokenization Audit — Research

**Date:** 2026-02-28
**Purpose:** Catalog every hardcoded color in the codebase to enable a full theme swap from blue/cyan SaaS palette to earth tones.

---

## Current Token System

The theme lives in `app/openville-theme.css` (205 lines). It defines 16 `--ov-*` CSS custom properties. These are bridged into Tailwind v4 via `@theme inline` in `app/globals.css` as `--color-ov-*`.

### Existing tokens (16)

| Token | Current value | Role |
|-------|--------------|------|
| `--ov-bg-0` | `#07111d` | Primary bg (darkest) |
| `--ov-bg-1` | `#0d1726` | Secondary bg |
| `--ov-bg-2` | `#132033` | Tertiary bg |
| `--ov-surface-0` | `rgba(9,17,29,0.88)` | Translucent surface 1 |
| `--ov-surface-1` | `rgba(19,32,51,0.92)` | Translucent surface 2 |
| `--ov-border` | `rgba(124,170,255,0.2)` | Default border (blue tint) |
| `--ov-text` | `#eef4ff` | Primary text |
| `--ov-text-muted` | `#94a4bc` | Secondary text |
| `--ov-human` | `#f2bf7a` | Human/user accent (amber) |
| `--ov-human-soft` | `rgba(242,191,122,0.14)` | Human bg tint |
| `--ov-signal` | `#67d7ff` | Primary signal (cyan) |
| `--ov-signal-strong` | `#9be9ff` | Signal emphasis |
| `--ov-negotiation` | `#ffb24d` | Negotiation (orange) |
| `--ov-winner` | `#ffd166` | Winner (gold) |
| `--ov-eliminated` | `#536176` | Eliminated (gray) |
| `--ov-success` | `#67d39a` | Success (green) |

### Token adoption rate: ~35%

- Text colors (`--ov-text`, `--ov-text-muted`) are well-adopted.
- Accent references (`--ov-signal`, `--ov-winner`, etc.) are used for solid text/border colors.
- Backgrounds, border alphas, shadows, and glows are almost entirely hardcoded rgba values.

---

## Files With Hardcoded Colors (12 files)

### 1. `features/landing/components/HandoffSection.tsx` (7 leaks)
- Line 33: `rgba(242,191,122,0.24)` border, `rgba(242,191,122,0.1)` bg — human message bubble
- Line 46: `rgba(124,170,255,0.18)` border, `rgba(19,32,51,0.82)` bg — agent message bubble
- Line 58: `rgba(124,170,255,0.18)` border, `rgba(8,15,27,0.78)` bg — priority tag
- Line 59: `rgba(103,215,255,0.08)` shadow — tag glow

### 2. `features/landing/components/ClosureSection.tsx` (6 leaks)
- Line 86: `rgba(255,209,102,0.22)` border — CTA panel (inline style)
- Line 87-88: gradient bg — CTA panel (inline style)
- Line 89: `rgba(255,209,102,0.08)` inset shadow — CTA panel (inline style)
- Line 98: `rgba(255,209,102,0.35)` — ambient glow (inline style)
- Lines 36, 58, 60: uses `var(--ov-border)` and `var(--ov-signal)` correctly

### 3. `features/landing/components/market/MarketNode.tsx` (20+ leaks)
- Lines 20-26: 5 cluster border+bg pairs — all hardcoded rgba
- Lines 31-34: state shadows — `rgba(103,215,255,0.35)`, `rgba(255,178,77,0.34)`, `rgba(255,209,102,0.38/.4/.2)`
- Line 67: label shadow `rgba(2,6,15,0.45)`
- Lines 69-70: label border+bg — winner and default variants

### 4. `features/landing/components/market/AgentMarketGraph.tsx` (11+ leaks)
- Line 259: `rgba(103,215,255,0.06)` — ambient bg gradient
- Line 260: `rgba(255,178,77,0.04)` — ambient bg gradient
- Lines 268-271: center glow — winner `rgba(255,209,102,0.1)`, negotiation `rgba(255,178,77,0.07)`, default `rgba(103,215,255,0.05)`
- Lines 216-217: SVG stroke — `rgba(255,209,102,0.82)` winner, `rgba(103,215,255,0.18)` default
- Lines 322-323: badge border+bg — winner and default variants

### 5. `features/landing/components/market/WinnerBlock.tsx` (8 leaks)
- Line 45: border `rgba(255,209,102,0.24)`, gradient bg, shadow `rgba(6,10,18,0.45)`
- Lines 86,91-92: scope bar — `rgba(103,215,255,0.5)` filled, `rgba(124,170,255,0.12)` empty
- Line 113: loser row border `rgba(124,170,255,0.08)`

### 6. `features/chat/components/RequestComposer.tsx` (15+ leaks)
- Lines 34-35: container border+bg — landing and active variants
- Lines 51-52: input border+bg — landing and active variants
- Line 62: button text `#06111d`, hover `#f7cb90`
- Line 63: button text `#06111d`
- Lines 87-88: example chip border+bg — landing and active variants

### 7. `features/chat/components/MessageList.tsx` (7 leaks)
- Line 21: shadow `rgba(2,6,15,0.28)`
- Line 23: user bubble border `rgba(242,191,122,0.24)`, bg `rgba(242,191,122,0.12)`
- Line 25: system bubble border `rgba(124,170,255,0.16)`, bg `rgba(13,23,38,0.68)`
- Line 26: assistant bubble border `rgba(124,170,255,0.16)`, bg `rgba(19,32,51,0.82)`

### 8. `features/chat/components/FollowUpPrompt.tsx` (5 leaks)
- Line 21: card border `rgba(124,170,255,0.16)`, bg `rgba(9,17,29,0.84)`, shadow
- Line 29: prompt border `rgba(124,170,255,0.18)`, bg `rgba(13,23,38,0.72)`

### 9. `features/search/components/CandidateCard.tsx` (7 leaks)
- Line 32: card border, gradient bg, shadow
- Line 35: rank badge bg `rgba(103,215,255,0.14)`
- Line 38: score badge bg `rgba(255,209,102,0.14)`
- Line 59: specialty badge bg `rgba(124,170,255,0.1)`

### 10. `features/search/components/CandidateResults.tsx` (4 leaks)
- Line 70: status badge border+bg `rgba(103,215,255,0.18/.1)`
- Line 75: follow-up card border+bg `rgba(124,170,255,0.14)`, `rgba(13,23,38,0.72)`

### 11. `features/search/components/ResultsState.tsx` (6 leaks)
- Line 20: card border+bg+shadow
- Line 33: retry button border+bg+hover

### 12. `app/openville-theme.css` (internal hardcoded colors in utility classes)
- `.ov-panel` (lines 91-98): gradient bg, shadow, border, inset glow
- `.ov-panel-strong` (lines 100-108): gradient bg, shadow, border, inset glow
- `.ov-chip` (lines 126-130): border, bg, shadow
- `.ov-chip-human` (lines 132-136): border, bg
- `.ov-chip-success` (lines 138-142): border, bg
- `.ov-text-gradient` (lines 148-154): gradient stops
- `body` (lines 63-67): radial gradient background
- `.ov-shell` (lines 76-80): radial gradient
- `.ov-grid` (lines 83-88): grid line color
- `::selection` (lines 70-73): selection bg

---

## Patterns Found

### Recurring rgba base colors (current palette)
These raw RGB channels appear across the codebase:
- `124, 170, 255` — border blue (used ~30 times)
- `103, 215, 255` — signal cyan (used ~15 times)
- `242, 191, 122` — human amber (used ~10 times)
- `255, 209, 102` — winner gold (used ~12 times)
- `255, 178, 77` — negotiation orange (used ~6 times)
- `103, 211, 154` — success green (used ~3 times)
- `155, 233, 255` — signal strong/venue (used ~8 times)
- `19, 32, 51` — surface dark blue (used ~8 times)
- `9, 17, 29` / `8, 15, 27` — deep bg (used ~12 times)
- `13, 23, 38` — mid bg (used ~5 times)
- `2, 6, 15` — shadow base (used ~8 times)

### Components that are already clean (no hardcoded colors)
- `HeroSection.tsx` — uses only `var()` references and utility classes (rewritten in Phase 9)
- `OldWaySection.tsx` — uses only `var(--ov-text)` and `var(--ov-text-muted)`
- `FunnelSection.tsx` — no color references (delegates to AgentMarketGraph)
- `FinalistSection.tsx` — uses only `var(--ov-text)` and delegates to PriorityRail + WinnerBlock
- `PriorityRail.tsx` — uses only `ov-chip` / `ov-chip-human` classes

---

## Token Gaps

### Missing token categories:
1. **Border opacity variants** — most borders are `rgba(base, 0.08-0.24)`. Need `--ov-border-soft`, `--ov-border-medium`, `--ov-border-strong`.
2. **Surface/card backgrounds** — translucent dark bgs at various opacities. Need `--ov-surface-card`, `--ov-surface-elevated`, `--ov-surface-deep`.
3. **Shadow base** — `rgba(2,6,15,...)` appears everywhere. Need `--ov-shadow`.
4. **Accent-derived tokens** — soft bg/border variants of signal, winner, human. Need `--ov-signal-soft`, `--ov-signal-border`, `--ov-winner-soft`, `--ov-winner-border`, `--ov-human-border`.
5. **Cluster colors** — 5 distinct border+bg pairs for market graph nodes. Need `--ov-cluster-*` tokens.
6. **Glow colors** — signal glow, winner glow, negotiation glow. Need `--ov-glow-*` tokens.
7. **Gradient tokens** — card gradient, winner panel gradient, ambient gradient. Need `--ov-gradient-*` tokens.
8. **Dark text on accent** — `#06111d` for button text on light bg. Need `--ov-text-on-accent`.
9. **SVG stroke colors** — winner line, default line. Need `--ov-stroke-winner`, `--ov-stroke-default`.
