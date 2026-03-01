"use client";

import { motion, useInView, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { PriorityRail } from "@/features/landing/components/market/PriorityRail";
import { storyScenario } from "@/features/landing/data/storyboard-fixtures";
import { EASE } from "@/lib/motion";

// ── Motion config ────────────────────────────────────────────────────────────
// All cascading delays compressed: everything appears within ~0.4s of entering view.

const sectionHeader = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE },
  },
};

const bubbleUser = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: EASE, delay: 0.08 },
  },
};

const bubbleAgent = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: EASE, delay: 0.2 },
  },
};

const processingLine = {
  hidden: { opacity: 0, scaleX: 0 },
  visible: {
    opacity: 1,
    scaleX: 1,
    transition: { duration: 0.35, ease: EASE, delay: 0.14 },
  },
};

const flowStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.25 },
  },
};

const flowItem = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: EASE },
  },
};

const railReveal = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE, delay: 0.35 },
  },
};

// ── Flow steps ───────────────────────────────────────────────────────────────

const flowSteps = [
  {
    label: "Natural language",
    description: "You describe the job",
    color: "var(--ov-accent-bright)",
    borderColor: "rgba(255,77,77,0.25)",
  },
  {
    label: "Parsed intent",
    description: "Agent extracts priorities",
    color: "var(--ov-text)",
    borderColor: "rgba(255,255,255,0.12)",
  },
  {
    label: "Market rules",
    description: "Search criteria activated",
    color: "var(--ov-text-muted)",
    borderColor: "rgba(255,255,255,0.08)",
  },
];

// ── Component ────────────────────────────────────────────────────────────────

export function HandoffSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const contentOpacity = useTransform(scrollYProgress, [0.1, 0.5], [1, 0]);

  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.12 });

  return (
    <section
      ref={ref}
      id="handoff"
      className="relative px-4 py-28 sm:px-6 sm:py-36 lg:px-8"
      aria-label="The Handoff -- one request replaces the scramble"
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 20% 20%, rgba(255,255,255,0.03), transparent 50%), radial-gradient(ellipse 40% 35% at 80% 70%, rgba(255,77,77,0.02), transparent 50%)",
        }}
      />

      <motion.div
        style={{ opacity: contentOpacity }}
        className="relative z-[1] mx-auto max-w-6xl"
      >
        {/* Section header — centered */}
        <motion.div
          variants={sectionHeader}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mx-auto max-w-3xl space-y-5 text-center"
        >
          <span className="ov-kicker">The Handoff</span>
          <h2 className="ov-headline text-3xl sm:text-5xl lg:text-[3.75rem]">
            One request replaces the scramble.
          </h2>
          <p className="ov-section-copy mx-auto">
            Your agent extracts the job, the deadline, and the trade-offs
            without making you manage the market by hand.
          </p>
        </motion.div>

        {/* Main content grid */}
        <div className="mt-16 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
          {/* Left — conversation visualization */}
          <div className="ov-panel-strong overflow-hidden rounded-[2rem]">
            {/* Chat header bar */}
            <div className="flex items-center gap-3 border-b border-[var(--ov-border)] bg-[var(--ov-surface-1)] px-5 py-3 sm:px-7 sm:py-4">
              <div className="flex size-8 items-center justify-center rounded-lg border border-[rgba(255,77,77,0.18)] bg-[rgba(255,77,77,0.06)]">
                <div className="size-2 rounded-full bg-[var(--ov-accent)]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-[var(--ov-text)] uppercase">
                  Openville Agent
                </p>
                <p className="text-[10px] text-[var(--ov-text-dim)]">
                  Active session
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-1.5 rounded-full bg-green-500/80" />
                <span className="font-mono text-[9px] tracking-[0.12em] text-[var(--ov-text-dim)] uppercase">
                  Live
                </span>
              </div>
            </div>

            {/* Chat bubbles */}
            <div className="space-y-4 p-5 sm:p-7">
              {/* User message */}
              <motion.div
                variants={bubbleUser}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                className="flex justify-end"
              >
                <article className="max-w-[88%] rounded-[1.25rem] rounded-tr-md border border-[rgba(255,77,77,0.18)] bg-[rgba(255,77,77,0.04)] px-5 py-4">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="size-1.5 rounded-full bg-[var(--ov-accent)]" />
                    <span className="font-mono text-[9px] font-medium tracking-[0.14em] text-[var(--ov-accent-bright)] uppercase">
                      You
                    </span>
                  </div>
                  <p className="text-[13px] leading-6 text-[var(--ov-text)]">
                    {storyScenario.request}
                  </p>
                </article>
              </motion.div>

              {/* Processing indicator */}
              <motion.div
                variants={processingLine}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                className="flex origin-left items-center gap-3 px-3 py-2"
              >
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--ov-border-strong)] to-transparent" />
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="size-1 rounded-full bg-[var(--ov-text-muted)]"
                  />
                  <span className="font-mono text-[9px] tracking-[0.18em] text-[var(--ov-text-dim)] uppercase">
                    Parsing intent
                  </span>
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                    className="size-1 rounded-full bg-[var(--ov-text-muted)]"
                  />
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--ov-border-strong)] to-transparent" />
              </motion.div>

              {/* Agent response */}
              <motion.div
                variants={bubbleAgent}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                className="flex justify-start"
              >
                <article className="max-w-[88%] rounded-[1.25rem] rounded-tl-md border border-[var(--ov-border-strong)] bg-[var(--ov-surface-1)] px-5 py-4">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="size-1.5 rounded-full bg-[var(--ov-text)]" />
                    <span className="font-mono text-[9px] font-medium tracking-[0.14em] text-[var(--ov-text)] uppercase">
                      Agent
                    </span>
                  </div>
                  <p className="text-[13px] leading-6 text-[var(--ov-text-muted)]">
                    {storyScenario.assistantResponse}
                  </p>
                </article>
              </motion.div>
            </div>
          </div>

          {/* Right — flow diagram + extracted priorities */}
          <div className="space-y-5">
            {/* Flow pipeline */}
            <motion.div
              variants={flowStagger}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="ov-panel overflow-hidden rounded-[2rem] p-5 sm:p-7"
            >
              <p className="ov-kicker mb-5 text-[var(--ov-accent-bright)]">
                Intent Pipeline
              </p>

              <div className="space-y-3">
                {flowSteps.map((step, i) => (
                  <motion.div
                    key={step.label}
                    variants={flowItem}
                    className="flex items-center gap-3 sm:gap-4"
                  >
                    {/* Step number */}
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[var(--ov-border)] bg-[var(--ov-surface-0)]">
                      <span className="font-mono text-[10px] font-bold text-[var(--ov-text-muted)]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Content */}
                    <div
                      className="flex-1 rounded-xl border px-4 py-3"
                      style={{ borderColor: step.borderColor }}
                    >
                      <p
                        className="font-mono text-[11px] font-semibold tracking-[0.12em] uppercase"
                        style={{ color: step.color }}
                      >
                        {step.label}
                      </p>
                      <p className="mt-1 text-xs text-[var(--ov-text-muted)]">
                        {step.description}
                      </p>
                    </div>

                    {/* Connector arrow (not on last) */}
                    {i < flowSteps.length - 1 && (
                      <svg
                        className="hidden size-4 shrink-0 text-[var(--ov-text-dim)] sm:block"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                        />
                      </svg>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Extracted priorities */}
            <motion.div
              variants={railReveal}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="ov-panel overflow-hidden rounded-[2rem] p-5 sm:p-7"
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-[var(--ov-text-muted)] uppercase">
                  Extracted priorities
                </p>
                <span className="ov-chip-signal rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.18em] uppercase">
                  6 signals parsed
                </span>
              </div>
              <PriorityRail emphasizeHuman />
            </motion.div>

            {/* Outcome summary */}
            <motion.div
              variants={railReveal}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="rounded-[1.5rem] border border-[rgba(255,77,77,0.12)] bg-[rgba(255,77,77,0.02)] px-5 py-4"
            >
              <p className="text-[13px] leading-6 text-[var(--ov-text-muted)]">
                <span className="font-semibold text-[var(--ov-accent-bright)]">
                  Result:
                </span>{" "}
                Human intention collapsed into 6 machine-readable signals. The
                market search activates immediately with these as binding
                constraints.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
