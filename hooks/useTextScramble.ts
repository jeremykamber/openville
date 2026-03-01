"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Smooth left-to-right text reveal with a single scramble cursor.
 *
 * Instead of randomizing ALL unrevealed characters every frame (which looked
 * erratic/chaotic), this approach:
 * 1. Reveals characters left-to-right at a steady pace
 * 2. Only the 1-2 characters at the "cursor" position show a brief scramble
 * 3. Unrevealed characters are shown as transparent (invisible) — no random noise
 * 4. Spaces are always preserved as spaces
 *
 * The result is a clean, smooth typewriter-like reveal with just a hint of
 * digital texture at the leading edge.
 */

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

interface UseTextScrambleOptions {
  /** Delay before reveal starts (ms). Default: 100 */
  delay?: number;
  /** Total duration of the reveal (ms). Default: 800 */
  duration?: number;
  /** Whether to start automatically. Default: true */
  autoStart?: boolean;
}

export function useTextScramble(
  finalText: string,
  options: UseTextScrambleOptions = {},
) {
  const {
    delay = 100,
    duration = 800,
    autoStart = true,
  } = options;

  const [text, setText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const frameRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reveal = useCallback(() => {
    setIsComplete(false);
    const length = finalText.length;
    const startTime = performance.now();

    // How many chars ahead of the reveal cursor to scramble (just 1-2)
    const SCRAMBLE_WINDOW = 2;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out: fast start, smooth landing
      const eased = 1 - Math.pow(1 - progress, 2.5);
      const revealedCount = Math.floor(eased * length);

      let result = "";
      for (let i = 0; i < length; i++) {
        if (i < revealedCount) {
          // Already revealed — show final character
          result += finalText[i];
        } else if (finalText[i] === " ") {
          // Always preserve spaces
          result += " ";
        } else if (i < revealedCount + SCRAMBLE_WINDOW) {
          // Scramble cursor — 1-2 chars of digital texture
          result += CHARS[Math.floor(Math.random() * CHARS.length)];
        } else {
          // Not yet reached — show as transparent space (invisible)
          // We use a non-breaking space so layout is stable
          result += "\u00A0";
        }
      }

      setText(result);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        setText(finalText);
        setIsComplete(true);
      }
    };

    frameRef.current = requestAnimationFrame(step);
  }, [finalText, duration]);

  const restart = useCallback(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setText("");
    setIsComplete(false);
    timeoutRef.current = setTimeout(reveal, delay);
  }, [reveal, delay]);

  useEffect(() => {
    if (!autoStart) return;

    // Respect prefers-reduced-motion
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setText(finalText);
      setIsComplete(true);
      return;
    }

    timeoutRef.current = setTimeout(reveal, delay);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [autoStart, reveal, delay, finalText]);

  return { text, isComplete, restart };
}
