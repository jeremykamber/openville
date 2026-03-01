"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface UseStepTriggerOptions {
  /**
   * Percentage positions (0-100) within the scroll container where each
   * trigger fires. Length determines the number of steps.
   * Example: [10, 30, 50, 70, 88] → 5 triggers
   */
  positions: number[];
  /**
   * Root margin for the IntersectionObserver.
   * Default: "0px 0px -45% 0px" — triggers when the marker crosses the
   * upper-middle portion of the viewport so the transition feels intentional.
   */
  rootMargin?: string;
}

interface UseStepTriggerReturn {
  /** Ref to attach to the scroll container element */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Index of the currently active step (0-based). -1 before first trigger. */
  activeStep: number;
  /** Render these inside the container — invisible 1px trigger markers */
  TriggerMarkers: () => ReactNode;
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * IntersectionObserver-based step trigger for scroll-driven sequences.
 *
 * Instead of reading scroll position on every frame, this hook places
 * invisible marker divs at specified percentage positions inside a tall
 * scroll container. An IntersectionObserver watches each marker and
 * updates the active step when a marker enters or leaves the viewport.
 *
 * Bidirectional: scrolling back up past a trigger reverts the step.
 *
 * Respects `prefers-reduced-motion` by immediately reporting the final step.
 */
export function useStepTrigger(
  options: UseStepTriggerOptions,
): UseStepTriggerReturn {
  const { positions, rootMargin = "0px 0px -45% 0px" } = options;

  const containerRef = useRef<HTMLElement>(null);
  const markerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeStep, setActiveStep] = useState(-1);

  // Stable reference for positions to avoid re-running the effect
  const positionsKey = positions.join(",");

  useEffect(() => {
    if (prefersReducedMotion()) {
      // Skip animation — show final step immediately
      const frame = window.requestAnimationFrame(() =>
        setActiveStep(positions.length - 1),
      );
      return () => window.cancelAnimationFrame(frame);
    }

    const markers = markerRefs.current.filter(Boolean) as HTMLDivElement[];
    if (markers.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Process all entries and find the highest visible marker index.
        // This handles fast scrolling where multiple triggers fire at once.
        let highestVisible = -1;

        for (const entry of entries) {
          const index = markers.indexOf(entry.target as HTMLDivElement);
          if (index === -1) continue;

          if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
            // Marker is visible or has scrolled above the viewport (passed)
            highestVisible = Math.max(highestVisible, index);
          }
        }

        // Also check which markers are currently above the viewport
        // (they were triggered earlier and the user hasn't scrolled back)
        for (let i = 0; i < markers.length; i++) {
          const rect = markers[i].getBoundingClientRect();
          if (rect.top < window.innerHeight * 0.55) {
            highestVisible = Math.max(highestVisible, i);
          }
        }

        setActiveStep(highestVisible);
      },
      {
        rootMargin,
        threshold: 0,
      },
    );

    for (const marker of markers) {
      observer.observe(marker);
    }

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positionsKey, rootMargin]);

  const setMarkerRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      markerRefs.current[index] = el;
    },
    [],
  );

  const TriggerMarkers = useMemo(() => {
    return function StepTriggerMarkers(): ReactNode {
      return positions.map((position, index) => (
        <div
          key={`step-trigger-${index}`}
          ref={setMarkerRef(index)}
          aria-hidden="true"
          style={{
            position: "absolute",
            top: `${position}%`,
            left: 0,
            width: "100%",
            height: "1px",
            pointerEvents: "none",
          }}
        />
      ));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positionsKey, setMarkerRef]);

  return { containerRef, activeStep, TriggerMarkers };
}
