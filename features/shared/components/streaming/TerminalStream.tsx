"use client";

import { useEffect, useRef, useState } from "react";

interface TerminalStreamProps {
  text: string;
  speed?: number;
  className?: string;
}

export function TerminalStream({ text, speed = 30, className }: TerminalStreamProps) {
  const [displayedText, setDisplayedText] = useState("");
  const index = useRef(0);
  const showCursor = displayedText.length < text.length;

  useEffect(() => {
    if (index.current < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index.current]);
        index.current++;
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [displayedText, text, speed]);

  return (
    <div className={className}>
      <span className="whitespace-pre-wrap">{displayedText}</span>
      {showCursor && (
        <span className="ml-1 inline-block h-3 w-1.5 animate-pulse bg-white" />
      )}
    </div>
  );
}
