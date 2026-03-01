"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

/**
 * SmoothScrollProvider — Initializes Lenis smooth scrolling.
 *
 * Why Lenis over native scroll-behavior:smooth:
 * - Lerp-based interpolation gives buttery 60fps scroll on all browsers
 * - Works with IntersectionObserver and scroll-driven animations
 * - Respects prefers-reduced-motion automatically (duration -> 0)
 * - Gives us programmatic scroll control (scrollTo) for workspace transitions
 *
 * Trade-offs:
 * - Adds ~8KB to bundle (acceptable for the UX gain)
 * - Must be client-only (no SSR)
 * - Overwrites native scroll — users on trackpads may notice slight inertia change
 *
 * This is a renderless provider. It mounts Lenis on the <html> element
 * and cleans up on unmount. No context needed — Lenis operates globally.
 */
export function SmoothScrollProvider() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Respect user motion preferences
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const lenis = new Lenis({
      duration: reducedMotion ? 0 : 0.6,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
      infinite: false,
    });

    lenisRef.current = lenis;

    // Store the latest frame ID so cleanup cancels the correct one.
    // The previous implementation only cancelled the first `frameId`
    // but the recursive `raf` kept spawning new uncancelled frames.
    let currentFrameId = 0;

    function raf(time: number) {
      lenis.raf(time);
      currentFrameId = requestAnimationFrame(raf);
    }

    currentFrameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(currentFrameId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return null;
}
