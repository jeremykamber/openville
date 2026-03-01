"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { finalists } from "@/features/landing/data/storyboard-fixtures";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion";

// ── Motion config (no blur) ─────────────────────────────────────────────────

const boardStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const cardReveal = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: EASE },
  },
};

// ── Animated counter hook ────────────────────────────────────────────────────

function useAnimatedCounter(target: number, duration: number, active: boolean) {
  const [value, setValue] = useState(target);

  useEffect(() => {
    if (!active) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setValue(target);
      return;
    }

    // Animate from opening rate (roughly 20-40% higher) down to negotiated rate
    const start = Math.round(target * 1.3);
    const diff = start - target;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(start - diff * eased));

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }, [target, duration, active]);

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

function getOutcomeLabel(outcome: (typeof finalists)[number]["outcome"]) {
  switch (outcome) {
    case "winner":
      return "Winner";
    case "scope_risk":
      return "Lost on scope";
    case "cost_risk":
      return "Lost on risk";
  }
}

// ── Component ────────────────────────────────────────────────────────────────

export function NegotiationBoard() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      variants={boardStagger}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="grid gap-5 lg:grid-cols-3"
      aria-label="Finalist negotiation comparison"
    >
      {finalists.map((finalist) => (
        <NegotiationCard
          key={finalist.agentId}
          finalist={finalist}
          animate={isInView}
        />
      ))}
    </motion.div>
  );
}

function NegotiationCard({
  finalist,
  animate,
}: {
  finalist: (typeof finalists)[number];
  animate: boolean;
}) {
  const animatedRate = useAnimatedCounter(
    finalist.negotiatedRate,
    1200,
    animate,
  );

  return (
    <motion.article
      variants={cardReveal}
      className={cn(
        "group rounded-[1.5rem] border p-4 shadow-[0_24px_60px_rgba(0,0,0,0.4)] sm:rounded-[1.75rem] sm:p-5",
        finalist.outcome === "winner"
          ? "border-[rgba(200,169,126,0.22)] bg-[linear-gradient(180deg,rgba(30,28,22,0.55),rgba(17,17,19,0.96))]"
          : "border-[var(--ov-border)] bg-[linear-gradient(180deg,rgba(25,25,28,0.92),rgba(17,17,19,0.92))]",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.18em] text-[var(--ov-text-muted)] uppercase">
            {finalist.role}
          </p>
          <h3 className="mt-2 font-display text-2xl leading-tight text-[var(--ov-text)]">
            {finalist.name}
          </h3>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.18em] uppercase",
            finalist.outcome === "winner" ? "ov-chip-human" : "ov-chip",
          )}
        >
          {getOutcomeLabel(finalist.outcome)}
        </span>
      </div>

      <div className="mt-5 grid gap-3 text-sm text-[var(--ov-text-muted)]">
        <div className="flex flex-col gap-3 rounded-2xl border border-[var(--ov-border)] bg-[var(--ov-surface-0)] px-4 py-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase">
              Opening rate
            </p>
            <p className="mt-1 text-xl font-semibold text-[var(--ov-text)] sm:mt-2">
              {formatPrice(finalist.openingRate)}/hr
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase">
              Negotiated rate
            </p>
            <p className="mt-1 font-mono text-xl font-semibold text-[var(--ov-text)] sm:mt-2">
              {formatPrice(animatedRate)}/hr
            </p>
          </div>
        </div>

        <dl className="grid gap-3 rounded-2xl border border-[var(--ov-border)] bg-[var(--ov-surface-0)] px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[10px] font-semibold tracking-[0.18em] uppercase">
              Estimated total
            </dt>
            <dd className="font-medium text-[var(--ov-text)]">
              {formatPrice(finalist.estimatedTotal)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[10px] font-semibold tracking-[0.18em] uppercase">
              Scope
            </dt>
            <dd className="font-medium text-[var(--ov-text)]">
              {finalist.scopeCoverage}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[10px] font-semibold tracking-[0.18em] uppercase">
              Reliability
            </dt>
            <dd className="font-medium text-[var(--ov-text)]">
              {finalist.reliability}%
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[10px] font-semibold tracking-[0.18em] uppercase">
              Availability
            </dt>
            <dd className="max-w-[10rem] text-right font-medium text-[var(--ov-text)] sm:max-w-[12rem]">
              {finalist.availability}
            </dd>
          </div>
        </dl>

        <div className="space-y-3 rounded-2xl border border-[var(--ov-border)] bg-[var(--ov-surface-0)] px-4 py-4">
          <p className="text-[10px] font-semibold tracking-[0.18em] uppercase">
            Negotiation summary
          </p>
          <p className="leading-7">{finalist.negotiationSummary}</p>
          <p className="rounded-2xl bg-[rgba(255,255,255,0.04)] px-3 py-3 text-[13px] leading-6 text-[var(--ov-text)]">
            <span className="font-semibold text-[var(--ov-text)]">
              Strength:
            </span>{" "}
            {finalist.strength}
          </p>
          <p className="rounded-2xl bg-[rgba(255,255,255,0.03)] px-3 py-3 text-[13px] leading-6 text-[var(--ov-text)]">
            <span className="font-semibold text-[var(--ov-text-muted)]">
              Weakness:
            </span>{" "}
            {finalist.weakness}
          </p>
        </div>
      </div>
    </motion.article>
  );
}
