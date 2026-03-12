"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ThoughtBubbleProps {
  text: string;
  visible: boolean;
  className?: string;
}

export function ThoughtBubble({ text, visible, className }: ThoughtBubbleProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!visible || !text) {
      setDisplayedText("");
      setIsTypingComplete(false);
      return;
    }

    if (prefersReducedMotion.current) {
      setDisplayedText(text);
      setIsTypingComplete(true);
      return;
    }

    setDisplayedText("");
    setIsTypingComplete(false);
    let index = 0;

    function tick() {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
        timerRef.current = setTimeout(tick, 18 + Math.random() * 12);
      } else {
        setIsTypingComplete(true);
      }
    }

    timerRef.current = setTimeout(tick, 100);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [text, visible]);

  if (!visible) return null;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {/* Main bubble body */}
      <div
        className="
          relative w-full rounded-3xl border border-[rgba(255,255,255,0.12)]
          bg-[rgba(10,14,12,0.82)] px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.6)]
          backdrop-blur-md
          animate-in zoom-in-95 fade-in duration-400 fill-mode-both
        "
      >
        <p className="text-sm leading-6 text-[var(--ov-text)]">
          {displayedText}
          {!isTypingComplete ? (
            <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-[var(--ov-signal-strong)]" />
          ) : null}
        </p>
      </div>

      {/* Thought bubble tail: 3 descending dots */}
      <div className="flex flex-col items-center gap-[3px] pt-1">
        <div className="h-[10px] w-[10px] rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(10,14,12,0.7)]" />
        <div className="h-[7px] w-[7px] rounded-full border border-[rgba(255,255,255,0.10)] bg-[rgba(10,14,12,0.5)]" />
        <div className="h-[5px] w-[5px] rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(10,14,12,0.3)]" />
      </div>
    </div>
  );
}
