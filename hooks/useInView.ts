"use client";

import { useEffect, useRef, useState } from "react";

interface UseInViewOptions {
  /** Intersection threshold (0-1). Default: 0.15 */
  threshold?: number;
  /** Root margin string. Default: "0px" */
  rootMargin?: string;
  /** If true, stays true after first intersection. Default: true */
  once?: boolean;
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Tracks whether a DOM element is visible in the viewport.
 *
 * Used by landing page sections to trigger scroll-based animations.
 * Returns a ref to attach to the target element and a boolean for visibility.
 *
 * Respects `prefers-reduced-motion` by immediately reporting as in-view
 * so animations can be skipped while content remains visible.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: UseInViewOptions = {},
) {
  const { threshold = 0.15, rootMargin = "0px", once = true } = options;
  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    if (prefersReducedMotion()) {
      const frame = window.requestAnimationFrame(() => setIsInView(true));
      return () => window.cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsInView(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, once]);

  return { ref, isInView };
}
