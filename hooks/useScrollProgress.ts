"use client";

import { useEffect, useRef, useState } from "react";

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Tracks scroll progress through a specific element.
 *
 * Returns a value from 0 (element top at viewport bottom) to 1 (element
 * bottom at viewport top). The funnel section uses this to drive its
 * multi-stage transition: chaos → top 10 → top 3 → negotiation → winner.
 *
 * Respects `prefers-reduced-motion` by snapping to progress 1 so all
 * content is visible without animation.
 */
export function useScrollProgress<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    if (prefersReducedMotion()) {
      const frame = window.requestAnimationFrame(() => setProgress(1));
      return () => window.cancelAnimationFrame(frame);
    }

    let animationFrame = 0;

    function updateProgress() {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const total = rect.height + windowHeight;
      const scrolled = windowHeight - rect.top;
      const ratio = Math.min(Math.max(scrolled / total, 0), 1);

      setProgress(ratio);
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
  }, []);

  return { ref, progress };
}
