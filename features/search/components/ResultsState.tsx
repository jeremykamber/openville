"use client";

import { motion } from "motion/react";

import { Button } from "@/components/ui/button";

// ── Motion config ────────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const stateEntrance = {
  hidden: { opacity: 0, y: 16, scale: 0.98, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: EASE },
  },
};

// ── Loading pulse animation (3 dots) ─────────────────────────────────────────

function LoadingDots() {
  return (
    <div className="flex items-center gap-1.5 pt-1" role="status" aria-label="Loading">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block size-1.5 rounded-full bg-[var(--ov-accent)]"
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.85, 1.15, 0.85],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
      <span className="sr-only">Loading results...</span>
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

type StateVariant = "idle" | "loading" | "error" | "empty";

interface ResultsStateProps {
  title: string;
  body: string;
  variant?: StateVariant;
  actionLabel?: string;
  onAction?: () => void;
}

const variantBorder: Record<StateVariant, string> = {
  idle: "border-[rgba(255,255,255,0.08)]",
  loading: "border-[rgba(255,77,77,0.16)]",
  error: "border-[rgba(239,68,68,0.20)]",
  empty: "border-[rgba(255,255,255,0.10)]",
};

export function ResultsState({
  title,
  body,
  variant = "idle",
  actionLabel,
  onAction,
}: ResultsStateProps) {
  return (
    <motion.div
      variants={stateEntrance}
      initial="hidden"
      animate="visible"
      className={`rounded-[1.75rem] border bg-[rgba(255,255,255,0.02)] p-5 shadow-[0_20px_50px_rgba(2,6,15,0.35)] sm:p-6 ${variantBorder[variant]}`}
    >
      <h3 className="font-display text-xl text-[var(--ov-text)]">{title}</h3>
      {variant === "loading" && (
        <div className="mt-2">
          <LoadingDots />
        </div>
      )}
      <p className="mt-3 text-sm leading-7 text-[var(--ov-text-muted)]">
        {body}
      </p>
      {actionLabel && onAction ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE, delay: 0.2 }}
          className="mt-4"
        >
          <Button
            type="button"
            variant="outline"
            onClick={onAction}
            className="border-[rgba(255,77,77,0.24)] bg-[rgba(255,77,77,0.08)] text-[var(--ov-accent)] hover:bg-[rgba(255,77,77,0.14)] hover:text-[var(--ov-text)]"
          >
            {actionLabel}
          </Button>
        </motion.div>
      ) : null}
    </motion.div>
  );
}
