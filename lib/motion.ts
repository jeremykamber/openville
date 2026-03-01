/**
 * Shared animation constants — single source of truth for motion config.
 *
 * Every landing page component was defining its own copy of EASE,
 * fadeUp, stagger, etc. This module centralizes them so:
 * 1. Timing changes propagate everywhere at once
 * 2. No more copy-paste drift between components
 * 3. `filter: "blur()"` transitions are removed — they trigger
 *    expensive GPU compositing on every frame. Opacity + transform
 *    alone are GPU-accelerated and visually sufficient.
 *
 * ANIMATION PHILOSOPHY:
 * - Fast, smooth, never blocks scroll
 * - Small y-offsets (8-12px) — content "breathes in", not "jumps in"
 * - Short durations (0.3-0.45s) — feels instant but not jarring
 * - Minimal delays — content appears almost immediately on enter
 * - No scale on entrances unless hero-level emphasis
 * - Tight staggers (0.04-0.06s) — children cascade quickly
 */

import type { Variants, Transition } from "motion/react";

// ── Easing ──────────────────────────────────────────────────────────────────

/** Expo ease-out — fast start, smooth deceleration. */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Default spring for layout shifts — snappy but not aggressive. */
export const LAYOUT_TRANSITION: Transition = {
  duration: 0.35,
  ease: EASE,
};

// ── Entrance variants ───────────────────────────────────────────────────────

/** Fade up — the workhorse entrance animation. No blur. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE },
  },
};

/** Fade up with slight scale — for hero-level emphasis only. */
export const fadeScale: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE },
  },
};

/** Simple fade — no positional shift. */
export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.35, ease: EASE },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: EASE },
  },
};

// ── Stagger containers ──────────────────────────────────────────────────────

/** Standard stagger — 0.06s between children, 0.08s initial delay. */
export const stagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.08 },
  },
};

/** Fast stagger — 0.04s, tighter for small chips/badges. */
export const staggerFast: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04, delayChildren: 0.04 },
  },
};

// ── Card / item variants (for use inside stagger containers) ────────────────

/** Card entrance — subtle y shift + opacity. */
export const cardUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: EASE },
  },
};

/** Chip entrance — scale + opacity, no positional shift. */
export const chipItem: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.25, ease: EASE },
  },
};

// ── AnimatePresence swap variants ───────────────────────────────────────────

/** For content that swaps in/out (e.g. stage copy in the funnel). */
export const contentSwap: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: EASE },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: EASE },
  },
};
