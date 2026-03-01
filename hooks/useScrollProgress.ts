"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useMotionValue, type MotionValue } from "motion/react";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Tracks scroll progress through a specific element.
 *
 * Returns:
 * - `progress` — a MotionValue<number> from 0→1, updated every frame WITHOUT
 *   triggering React re-renders. Use with `useTransform` for continuous
 *   animations (progress bars, opacity, etc.).
 * - `stage` — a discrete React state that only re-renders the component when
 *   the stage threshold changes. The consumer provides the thresholds.
 *
 * This split design means the funnel section only re-renders ~5 times (once
 * per stage change) instead of hundreds of times per scroll gesture.
 */
export function useScrollProgress<
  T extends HTMLElement = HTMLDivElement,
  S extends string = string,
>(stages: { threshold: number; stage: S }[]) {
  const ref = useRef<T>(null);
  const progress = useMotionValue(0);
  const stageRef = useRef<S>(stages[0].stage);
  const [stage, setStage] = useState<S>(stages[0].stage);

  const resolveStage = useCallback(
    (ratio: number): S => {
      return (
        stages.find((entry) => ratio <= entry.threshold)?.stage ??
        stages[stages.length - 1].stage
      );
    },
    [stages],
  );

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (prefersReducedMotion()) {
      const frame = window.requestAnimationFrame(() => {
        progress.set(1);
        const finalStage = stages[stages.length - 1].stage;
        stageRef.current = finalStage;
        setStage(finalStage);
      });
      return () => window.cancelAnimationFrame(frame);
    }

    let animationFrame = 0;

    function updateProgress() {
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const total = rect.height + windowHeight;
      const scrolled = windowHeight - rect.top;
      const ratio = Math.min(Math.max(scrolled / total, 0), 1);

      // Update MotionValue (no React re-render)
      progress.set(ratio);

      // Only trigger React re-render when stage actually changes
      const newStage = resolveStage(ratio);
      if (newStage !== stageRef.current) {
        stageRef.current = newStage;
        setStage(newStage);
      }
    }

    function handleScroll() {
      cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(updateProgress);
    }

    updateProgress();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolveStage]);

  return { ref, progress, stage };
}
