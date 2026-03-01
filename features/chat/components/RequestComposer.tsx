"use client";

import { useState } from "react";

import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ── Motion config ────────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const composerEntrance = {
  hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: EASE },
  },
};

const chipStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.15 },
  },
};

const chipItem = {
  hidden: { opacity: 0, scale: 0.92, filter: "blur(3px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.35, ease: EASE },
  },
};

// ── Component ────────────────────────────────────────────────────────────────

interface RequestComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  variant?: "landing" | "active";
  /** Optional example prompts shown as clickable chips below the input */
  examples?: string[];
  /** Called when an example chip is clicked — typically sets the input value */
  onExampleClick?: (example: string) => void;
}

export function RequestComposer({
  value,
  onChange,
  onSubmit,
  disabled = false,
  variant = "active",
  examples,
  onExampleClick,
}: RequestComposerProps) {
  const isLanding = variant === "landing";
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div
      variants={composerEntrance}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      <div
        className={`relative flex flex-col gap-3 rounded-[1.5rem] border p-4 shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur transition-shadow duration-500 sm:flex-row sm:items-center ${
          isLanding
            ? "border-[rgba(200,169,126,0.16)] bg-[rgba(17,17,19,0.8)] sm:p-5"
            : "border-[var(--ov-border)] bg-[rgba(17,17,19,0.88)]"
        } ${
          isFocused
            ? isLanding
              ? "shadow-[0_0_48px_rgba(200,169,126,0.1),0_20px_50px_rgba(0,0,0,0.4)]"
              : "shadow-[0_0_48px_rgba(255,255,255,0.04),0_20px_50px_rgba(0,0,0,0.4)]"
            : ""
        }`}
      >
        {/* Glow ring on focus */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[1.5rem] transition-opacity duration-500"
          style={{
            opacity: isFocused ? 1 : 0,
            boxShadow: isLanding
              ? "inset 0 0 28px rgba(200,169,126,0.05), 0 0 40px rgba(200,169,126,0.04)"
              : "inset 0 0 28px rgba(255,255,255,0.03), 0 0 40px rgba(255,255,255,0.02)",
          }}
        />

        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Describe the scope, deadline, and trade-offs."
          aria-label="Describe your service request"
          disabled={disabled}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onSubmit();
            }
          }}
          className={`relative z-[1] h-13 rounded-[1.2rem] border px-4 text-sm text-[var(--ov-text)] placeholder:text-[var(--ov-text-muted)] ${
            isLanding
              ? "border-[rgba(200,169,126,0.14)] bg-[var(--ov-surface-0)]"
              : "border-[var(--ov-border)] bg-[var(--ov-surface-0)]"
          }`}
        />
        <Button
          type="button"
          size="lg"
          onClick={onSubmit}
          disabled={disabled || value.trim().length === 0}
          className={`relative z-[1] rounded-[1.2rem] px-5 font-semibold ${
            isLanding
              ? "border border-[rgba(200,169,126,0.25)] bg-[rgba(200,169,126,0.12)] text-[var(--ov-accent-bright)] hover:bg-[rgba(200,169,126,0.2)] hover:shadow-[0_0_24px_rgba(200,169,126,0.1)]"
              : "bg-[var(--ov-text)] text-[var(--ov-void)] hover:bg-[var(--ov-text-muted)]"
          }`}
        >
          {disabled
            ? "Opening market..."
            : isLanding
              ? "Open the market"
              : "Run ranking"}
        </Button>
      </div>
      {examples && examples.length > 0 ? (
        <motion.div
          variants={chipStagger}
          initial="hidden"
          animate="visible"
          className={`flex flex-wrap gap-2 ${
            isLanding ? "justify-start" : "justify-center"
          }`}
        >
          {examples.map((example) => (
            <motion.button
              key={example}
              variants={chipItem}
              type="button"
              onClick={() => onExampleClick?.(example)}
              disabled={disabled}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ov-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ov-void)] disabled:pointer-events-none disabled:opacity-50 ${
                isLanding
                  ? "border-[rgba(200,169,126,0.16)] bg-[rgba(200,169,126,0.05)] text-[var(--ov-accent-bright)] hover:border-[rgba(200,169,126,0.3)] hover:bg-[rgba(200,169,126,0.1)]"
                  : "border-[var(--ov-border)] bg-[var(--ov-surface-0)] text-[var(--ov-text-muted)] hover:border-[var(--ov-border-strong)] hover:text-[var(--ov-text)]"
              }`}
            >
              {example}
            </motion.button>
          ))}
        </motion.div>
      ) : null}
    </motion.div>
  );
}
