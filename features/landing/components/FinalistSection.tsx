"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "motion/react";
import {
  finalists,
  winnerExplanation,
  loserExplanations,
} from "@/features/landing/data/storyboard-fixtures";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion";

// ── Types ────────────────────────────────────────────────────────────────────

type FinalistOutcome = "winner" | "scope_risk" | "cost_risk";

// ── Motion config ────────────────────────────────────────────────────────────
// All durations ≤0.45s, y-offsets ≤12px, minimal delays, no scale on cards.

const sectionHeader = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE },
  },
};

const lineReveal = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.5, ease: EASE },
  },
};

const boardStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const cardReveal = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE },
  },
};

const decisionReveal = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE, delay: 0.1 },
  },
};

const loserStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.15 },
  },
};

const loserItem = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: EASE },
  },
};

// ── Animated rate counter ────────────────────────────────────────────────────

function useAnimatedRate(
  from: number,
  to: number,
  duration: number,
  active: boolean,
) {
  const [value, setValue] = useState(from);

  useEffect(() => {
    if (!active) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setValue(to);
      return;
    }

    const diff = from - to;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from - diff * eased));

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }, [from, to, duration, active]);

  return value;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function getOutcomeConfig(outcome: FinalistOutcome) {
  switch (outcome) {
    case "winner":
      return {
        label: "Winner",
        chipClass: "ov-chip-human",
        icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      };
    case "scope_risk":
      return {
        label: "Lost on scope",
        chipClass: "ov-chip",
        icon: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z",
      };
    case "cost_risk":
      return {
        label: "Lost on risk",
        chipClass: "ov-chip",
        icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
      };
  }
}

function getScopeLabel(scope: "full" | "partial") {
  return scope === "full" ? "Full coverage" : "Partial coverage";
}

// ── Finalist Card ────────────────────────────────────────────────────────────

function FinalistCard({
  finalist,
  index,
  animate,
}: {
  finalist: (typeof finalists)[number];
  index: number;
  animate: boolean;
}) {
  const isWinner = finalist.outcome === "winner";
  const outcome = getOutcomeConfig(finalist.outcome);

  const animatedRate = useAnimatedRate(
    finalist.openingRate,
    finalist.negotiatedRate,
    800,
    animate,
  );

  const savings = finalist.openingRate - finalist.negotiatedRate;
  const savingsPercent = Math.round((savings / finalist.openingRate) * 100);

  return (
    <motion.article
      variants={cardReveal}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[1.75rem] border",
        isWinner
          ? "border-[rgba(255,77,77,0.25)] bg-[linear-gradient(180deg,rgba(30,28,22,0.6),rgba(17,17,19,0.95))] shadow-[0_28px_80px_rgba(0,0,0,0.5)]"
          : "border-[var(--ov-border)] bg-[linear-gradient(180deg,rgba(25,25,28,0.7),rgba(17,17,19,0.9))] shadow-[0_20px_60px_rgba(0,0,0,0.35)] hover:border-[var(--ov-border-strong)]",
      )}
      style={{ transition: "border-color 0.2s ease" }}
    >
      {/* Winner gradient top accent line */}
      {isWinner && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[1.75rem]"
          style={{
            background: "linear-gradient(90deg, transparent, #ff4d4d, #991b1b, transparent)",
          }}
        />
      )}

      {/* Winner pulsing glow border — opacity animation (GPU-compositable) */}
      {isWinner && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[1.75rem]"
          style={{
            boxShadow:
              "inset 0 0 50px rgba(255,77,77,0.07), 0 0 60px rgba(255,77,77,0.05)",
          }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Card content */}
      <div className="relative flex flex-1 flex-col p-5 sm:p-6">
        {/* Top row: index + outcome badge */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-9 items-center justify-center rounded-xl font-mono text-xs font-bold",
                isWinner
                  ? "border border-[rgba(255,77,77,0.25)] text-white"
                  : "bg-[var(--ov-surface-1)] text-[var(--ov-text-muted)]",
              )}
              style={
                isWinner
                  ? { background: "linear-gradient(135deg, #ff4d4d, #991b1b)" }
                  : undefined
              }
            >
              {String(index + 1).padStart(2, "0")}
            </div>
            <svg
              className={cn(
                "size-4",
                isWinner
                  ? "text-[var(--ov-accent)]"
                  : "text-[var(--ov-text-dim)]",
              )}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={outcome.icon}
              />
            </svg>
          </div>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.18em] uppercase",
              outcome.chipClass,
            )}
          >
            {outcome.label}
          </span>
        </div>

        {/* Name + role */}
        <div className="mb-5">
          <p className="text-[10px] font-semibold tracking-[0.18em] text-[var(--ov-text-muted)] uppercase">
            {finalist.role}
          </p>
          <h3
            className={cn(
              "mt-2 font-display text-2xl leading-tight",
              isWinner ? "text-[var(--ov-text)]" : "text-[var(--ov-text)]",
            )}
          >
            {finalist.name}
          </h3>
        </div>

        {/* Rate negotiation panel */}
        <div className="mb-4 rounded-2xl border border-[var(--ov-border)] bg-[var(--ov-surface-0)] p-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.18em] text-[var(--ov-text-dim)] uppercase">
                Opening
              </p>
              <p className="mt-1 text-lg text-[var(--ov-text-muted)] line-through decoration-[var(--ov-text-dim)]/40">
                {formatPrice(finalist.openingRate)}/hr
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-[var(--ov-text-dim)] uppercase">
                Negotiated
              </p>
              <p
                className={cn(
                  "mt-1 font-mono text-2xl font-semibold",
                  isWinner
                    ? "text-[var(--ov-accent-bright)]"
                    : "text-[var(--ov-text)]",
                )}
              >
                {formatPrice(animatedRate)}/hr
              </p>
            </div>
          </div>
          {/* Savings bar */}
          <div className="mt-3 flex items-center gap-3">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  isWinner
                    ? "bg-[linear-gradient(90deg,var(--ov-accent-dark),var(--ov-accent),var(--ov-accent-bright))]"
                    : "bg-[rgba(255,255,255,0.15)]",
                )}
                initial={{ width: 0 }}
                animate={animate ? { width: `${savingsPercent}%` } : {}}
                transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}
              />
            </div>
            <span
              className={cn(
                "font-mono text-[11px] font-medium",
                isWinner
                  ? "text-[var(--ov-accent)]"
                  : "text-[var(--ov-text-muted)]",
              )}
            >
              -{savingsPercent}%
            </span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          {[
            {
              label: "Est. total",
              value: formatPrice(finalist.estimatedTotal),
            },
            { label: "Scope", value: getScopeLabel(finalist.scopeCoverage) },
            { label: "Reliability", value: `${finalist.reliability}%` },
            { label: "Available", value: finalist.availability },
          ].map((stat) => (
            <div
              key={stat.label}
              className="min-w-0 rounded-xl border border-[var(--ov-border)] bg-[var(--ov-surface-0)] px-3 py-2.5"
            >
              <p className="text-[9px] font-semibold tracking-[0.18em] text-[var(--ov-text-dim)] uppercase">
                {stat.label}
              </p>
              <p className="mt-1 truncate text-[13px] font-medium text-[var(--ov-text)]" title={stat.value}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Negotiation summary */}
        <div className="mt-auto rounded-2xl border border-[var(--ov-border)] bg-[var(--ov-surface-0)] p-4">
          <p className="text-[10px] font-semibold tracking-[0.18em] text-[var(--ov-text-dim)] uppercase">
            Agent summary
          </p>
          <p className="mt-2 text-[13px] leading-6 text-[var(--ov-text-muted)]">
            {finalist.negotiationSummary}
          </p>

          {/* Strength/Weakness chips */}
          <div className="mt-3 space-y-2">
            <div
              className={cn(
                "rounded-xl px-3 py-2.5 text-[12px] leading-5",
                isWinner
                  ? "bg-[rgba(255,77,77,0.06)] text-[var(--ov-accent-bright)]"
                  : "bg-[rgba(255,255,255,0.03)] text-[var(--ov-text)]",
              )}
            >
              <span className="font-semibold">Strength:</span>{" "}
              {finalist.strength}
            </div>
            <div className="rounded-xl bg-[rgba(255,255,255,0.02)] px-3 py-2.5 text-[12px] leading-5 text-[var(--ov-text-muted)]">
              <span className="font-semibold">Weakness:</span>{" "}
              {finalist.weakness}
            </div>
          </div>
        </div>

        {/* Winner guarantee banner */}
        {isWinner && (
            <div
              className="mt-4 rounded-xl border border-[rgba(255,77,77,0.2)] px-4 py-3"
              style={{
                background: "linear-gradient(135deg, rgba(255,77,77,0.06), rgba(153,27,27,0.04))",
              }}
            >
            <p className="text-[10px] font-semibold tracking-[0.18em] text-[var(--ov-accent)] uppercase">
              Guarantee
            </p>
            <p className="mt-1 text-[13px] leading-6 text-[var(--ov-accent-bright)]">
              {finalist.guarantee}
            </p>
          </div>
        )}
      </div>
    </motion.article>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export function FinalistSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const contentOpacity = useTransform(scrollYProgress, [0.1, 0.5], [1, 0]);

  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.08 });

  return (
    <section
      ref={ref}
      id="negotiation"
      className="relative px-4 py-28 sm:px-6 sm:py-36 lg:px-8"
      aria-label="Negotiation -- three finalists compete on price, scope, and certainty"
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 10%, rgba(255,77,77,0.03), transparent 50%), radial-gradient(ellipse 40% 30% at 80% 70%, rgba(255,255,255,0.02), transparent 50%)",
        }}
      />

      <motion.div
        style={{ opacity: contentOpacity }}
        className="relative z-[1] mx-auto max-w-6xl"
      >
        {/* Section header */}
        <motion.div
          variants={sectionHeader}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mx-auto max-w-3xl space-y-5 text-center"
        >
          <div className="flex justify-center">
            <span className="ov-kicker">Negotiation</span>
          </div>
          <h2 className="ov-headline text-3xl sm:text-5xl lg:text-[3.75rem]">
            Three finalists.{" "}
            <span className="ov-text-gradient">One wins on merit.</span>
          </h2>
          <p className="ov-section-copy mx-auto">
            The agent selects three candidates and negotiates on price, scope,
            and timeline. One loses on incomplete coverage. One loses on
            scheduling risk. The winner is chosen with explainable reasoning.
          </p>
        </motion.div>

        {/* Horizontal accent line */}
        <motion.div
          variants={lineReveal}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mx-auto my-12 max-w-lg origin-center sm:my-16"
        >
          <div className="ov-divider" />
        </motion.div>

        {/* Finalist cards */}
        <motion.div
          variants={boardStagger}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid gap-4 lg:grid-cols-3 lg:gap-5"
          aria-label="Finalist negotiation comparison"
        >
          {finalists.map((finalist, i) => (
            <FinalistCard
              key={finalist.agentId}
              finalist={finalist}
              index={i}
              animate={isInView}
            />
          ))}
        </motion.div>

        {/* Decision panel */}
        <div className="mt-10 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Winner explanation */}
          <motion.article
            variants={decisionReveal}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="group relative overflow-hidden rounded-[1.75rem] border border-[rgba(255,77,77,0.22)] bg-[linear-gradient(180deg,rgba(30,28,22,0.62),rgba(17,17,19,0.96))] p-6 sm:p-8 shadow-[0_28px_80px_rgba(0,0,0,0.45)]"
          >
            {/* Gradient top accent line */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{
                background: "linear-gradient(90deg, transparent, #ff4d4d, #991b1b, transparent)",
              }}
            />
            {/* Pulsing glow — opacity animation (GPU-compositable) */}
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-[1.75rem]"
              style={{
                boxShadow:
                  "inset 0 0 60px rgba(255,77,77,0.07), 0 0 70px rgba(255,77,77,0.05)",
              }}
              animate={{ opacity: [0.4, 1, 0.4] }}
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
              <h3 className="mt-3 font-display text-3xl leading-tight text-[var(--ov-text)] sm:text-4xl">
                One winner is selected, and the reason is{" "}
                <span className="ov-text-gradient">visible</span>.
              </h3>
              <p className="mt-5 text-base leading-8 text-[var(--ov-text-muted)]">
                {winnerExplanation}
              </p>
            </div>
          </motion.article>

          {/* Loser explanations */}
          <motion.div
            variants={loserStagger}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="grid gap-4 content-start"
          >
            <div className="px-1">
              <p className="ov-kicker mb-3">Why the others lost</p>
            </div>
            {loserExplanations.map((explanation, i) => (
              <motion.article
                key={i}
                variants={loserItem}
                className="group relative overflow-hidden rounded-[1.5rem] border border-[var(--ov-border)] bg-[linear-gradient(180deg,rgba(25,25,28,0.6),rgba(17,17,19,0.85))] p-5 text-sm leading-7 text-[var(--ov-text-muted)] hover:border-[var(--ov-border-strong)]"
                style={{ transition: "border-color 0.2s ease" }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-[var(--ov-surface-1)]">
                    <svg
                      className="size-3.5 text-[var(--ov-text-dim)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <span className="font-mono text-[10px] font-medium tracking-[0.14em] text-[var(--ov-text-dim)] uppercase">
                    {i === 0 ? "AquaPro Services" : "PipeLine Masters"}
                  </span>
                </div>
                {explanation}

                {/* Hover glow */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-[1.5rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    boxShadow:
                      "inset 0 0 16px rgba(255,255,255,0.03), 0 0 20px rgba(255,255,255,0.01)",
                  }}
                />
              </motion.article>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
