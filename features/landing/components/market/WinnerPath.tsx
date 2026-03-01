"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import {
  loserExplanations,
  winnerExplanation,
} from "@/features/landing/data/storyboard-fixtures";
import { EASE } from "@/lib/motion";

// ── Motion config (no blur) ─────────────────────────────────────────────────

const winnerReveal = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: EASE },
  },
};

const loserStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
};

const loserItem = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE },
  },
};

// ── Component ────────────────────────────────────────────────────────────────

export function WinnerPath() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.25 });

  return (
    <div ref={ref} className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <motion.article
        variants={winnerReveal}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="group relative overflow-hidden rounded-[1.75rem] border border-[rgba(200,169,126,0.22)] bg-[linear-gradient(180deg,rgba(30,28,22,0.62),rgba(17,17,19,0.96))] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.45)]"
      >
        {/* Winner glow pulse — gold accent */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[1.75rem]"
          animate={{
            boxShadow: [
              "inset 0 0 40px rgba(200,169,126,0.04), 0 0 60px rgba(200,169,126,0.03)",
              "inset 0 0 60px rgba(200,169,126,0.08), 0 0 80px rgba(200,169,126,0.06)",
              "inset 0 0 40px rgba(200,169,126,0.04), 0 0 60px rgba(200,169,126,0.03)",
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="relative">
          <p className="ov-kicker text-[var(--ov-accent-bright)]">
            The Decision
          </p>
          <h3 className="mt-3 font-display text-3xl leading-tight text-[var(--ov-text)]">
            One winner is selected, and the reason is visible.
          </h3>
          <p className="mt-4 text-base leading-8 text-[var(--ov-text-muted)]">
            {winnerExplanation}
          </p>
        </div>
      </motion.article>

      <motion.div
        variants={loserStagger}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="grid gap-4"
      >
        {loserExplanations.map((explanation) => (
          <motion.article
            key={explanation}
            variants={loserItem}
            className="rounded-[1.5rem] border border-[var(--ov-border)] bg-[var(--ov-surface-0)] p-5 text-sm leading-7 text-[var(--ov-text-muted)]"
          >
            {explanation}
          </motion.article>
        ))}
      </motion.div>
    </div>
  );
}
