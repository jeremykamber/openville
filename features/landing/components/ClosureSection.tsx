"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { RequestComposer } from "@/features/chat/components/RequestComposer";
import { lifecycleSteps } from "@/features/landing/data/storyboard-fixtures";
import { EASE } from "@/lib/motion";

// ── Lifecycle step icons ─────────────────────────────────────────────────────

const stepIcons: Record<string, string> = {
  booking:
    "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  notification:
    "M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0",
  review:
    "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z",
};

const stepLabels = ["booking", "notification", "review"] as const;

// ── Motion config ────────────────────────────────────────────────────────────

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

const timelineStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

const stepReveal = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE },
  },
};

const ctaReveal = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE, delay: 0.15 },
  },
};

// ── Props ────────────────────────────────────────────────────────────────────

interface ClosureSectionProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}

// ── Component ────────────────────────────────────────────────────────────────

export function ClosureSection({
  value,
  onChange,
  onSubmit,
  disabled,
}: ClosureSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section
      ref={ref}
      className="relative px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:px-8"
      aria-label="The Future -- booking confirmed, your agent handled the market"
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 80%, rgba(255,77,77,0.03), transparent 50%), radial-gradient(ellipse 60% 40% at 30% 20%, rgba(255,255,255,0.02), transparent 50%)",
        }}
      />

      <div
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
            <span className="ov-kicker">The Outcome</span>
          </div>
          <h2 className="ov-headline text-3xl sm:text-5xl lg:text-[3.75rem]">
            The agent handled the market.{" "}
            <span className="ov-text-gradient">You get the result.</span>
          </h2>
          <p className="ov-section-copy mx-auto">
            The plumber arrives on Tuesday, the confirmation lands in your
            inbox, and you only re-enter when it matters. Three steps close
            the loop.
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

        {/* ── Timeline ────────────────────────────────────────────────── */}
        <motion.div
          variants={timelineStagger}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mx-auto max-w-3xl"
        >
          {/* ─── Mobile / Tablet (<lg): stacked cards with arrows ──────── */}
          <div className="flex flex-col items-center gap-4 sm:gap-5 lg:hidden">
            {lifecycleSteps.map((step, index) => {
              const iconKey = stepLabels[index] ?? "booking";
              const iconPath = stepIcons[iconKey] ?? stepIcons.booking;
              const isLast = index === lifecycleSteps.length - 1;

              return (
                <motion.div key={step.id} variants={stepReveal} className="w-full">
                  {/* Step card */}
                  <div className="overflow-hidden rounded-[1.25rem] border border-[var(--ov-border)] bg-[linear-gradient(180deg,rgba(25,25,28,0.6),rgba(17,17,19,0.8))] p-5 sm:rounded-[1.5rem] sm:p-6">
                    <div className="mb-3 flex items-center gap-3">
                      {/* Icon */}
                      <div
                        className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[rgba(255,77,77,0.22)] sm:size-11"
                        style={{
                          background: "linear-gradient(135deg, rgba(255,77,77,0.08), rgba(153,27,27,0.06))",
                        }}
                      >
                        <svg
                          className="size-4.5 text-[var(--ov-accent)] sm:size-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d={iconPath}
                          />
                        </svg>
                      </div>
                      <span className="font-mono text-[10px] font-bold tracking-[0.14em] text-[var(--ov-accent)] uppercase">
                        Step {String(index + 1).padStart(2, "0")}
                      </span>
                      {isLast && (
                        <span className="rounded-full border border-[rgba(255,77,77,0.18)] bg-[rgba(255,77,77,0.05)] px-2.5 py-0.5 text-[9px] font-semibold tracking-[0.16em] text-[var(--ov-accent-bright)] uppercase">
                          Loop closed
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-lg font-medium tracking-[-0.01em] text-[var(--ov-text)] sm:text-xl">
                      {step.label}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-[var(--ov-text-muted)]">
                      {step.description}
                    </p>
                  </div>

                  {/* Down arrow between cards */}
                  {!isLast && (
                    <div className="flex justify-center py-1" aria-hidden="true">
                      <svg
                        className="size-5 text-[var(--ov-text-dim)]"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4.5v15m0 0l6.75-6.75M12 19.5l-6.75-6.75"
                        />
                      </svg>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* ─── Desktop (lg+): stacked cards with arrows ──────────────── */}
          <div className="hidden flex-col items-center gap-4 lg:flex">
            {lifecycleSteps.map((step, index) => {
              const iconKey = stepLabels[index] ?? "booking";
              const iconPath = stepIcons[iconKey] ?? stepIcons.booking;
              const isLast = index === lifecycleSteps.length - 1;

              return (
                <motion.div key={step.id} variants={stepReveal} className="w-full">
                  {/* Step card */}
                  <div className="flex gap-6 overflow-hidden rounded-[1.5rem] border border-[var(--ov-border)] bg-[linear-gradient(180deg,rgba(25,25,28,0.6),rgba(17,17,19,0.8))] p-6">
                    {/* Icon */}
                    <div className="shrink-0">
                      <div
                        className="flex size-14 items-center justify-center rounded-2xl border border-[rgba(255,77,77,0.22)]"
                        style={{
                          background: "linear-gradient(135deg, rgba(255,77,77,0.08), rgba(153,27,27,0.06))",
                        }}
                      >
                        <svg
                          className="size-6 text-[var(--ov-accent)]"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d={iconPath}
                          />
                        </svg>
                      </div>
                    </div>
                    {/* Content */}
                    <div className="flex-1">
                      <div className="mb-3 flex items-center gap-3">
                        <span className="font-mono text-[10px] font-bold tracking-[0.14em] text-[var(--ov-accent)] uppercase">
                          Step {String(index + 1).padStart(2, "0")}
                        </span>
                        {isLast && (
                          <span className="rounded-full border border-[rgba(255,77,77,0.18)] bg-[rgba(255,77,77,0.05)] px-2.5 py-0.5 text-[9px] font-semibold tracking-[0.16em] text-[var(--ov-accent-bright)] uppercase">
                            Loop closed
                          </span>
                        )}
                      </div>
                      <h3 className="font-display text-2xl font-medium tracking-[-0.01em] text-[var(--ov-text)]">
                        {step.label}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-[var(--ov-text-muted)]">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Down arrow between cards */}
                  {!isLast && (
                    <div className="flex justify-center py-2" aria-hidden="true">
                      <svg
                        className="size-6 text-[var(--ov-text-dim)]"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4.5v15m0 0l6.75-6.75M12 19.5l-6.75-6.75"
                        />
                      </svg>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Final CTA panel */}
        <motion.div
          variants={ctaReveal}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mx-auto mt-16 max-w-4xl sm:mt-20"
        >
          <div className="relative overflow-hidden rounded-[2rem] border border-[rgba(255,77,77,0.2)] bg-[linear-gradient(180deg,rgba(30,28,22,0.55),rgba(17,17,19,0.95))] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.45)] sm:p-8 lg:p-10">
            {/* Gradient top accent line */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{
                background: "linear-gradient(90deg, transparent, #ff4d4d, #991b1b, transparent)",
              }}
            />
            {/* Inner accent glow */}
            <div
              className="pointer-events-none absolute inset-0"
              aria-hidden="true"
              style={{
                background:
                  "radial-gradient(circle at 70% 30%, rgba(255,77,77,0.05), transparent 40%), radial-gradient(circle at 20% 80%, rgba(255,77,77,0.03), transparent 40%)",
              }}
            />

            {/* Pulsing border glow — opacity animation (GPU-compositable) */}
            <motion.div
              className="pointer-events-none absolute inset-0 rounded-[2rem]"
              style={{
                boxShadow:
                  "inset 0 0 50px rgba(255,77,77,0.05), 0 0 60px rgba(255,77,77,0.04)",
              }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <div className="relative grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="ov-chip-human rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.18em] uppercase">
                    Tradespeople marketplace
                  </span>
                  <span className="rounded-full border border-[rgba(255,77,77,0.18)] bg-[rgba(255,77,77,0.05)] px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-[var(--ov-accent-bright)] uppercase">
                    Booking confirmed
                  </span>
                </div>
                <h2 className="ov-headline text-3xl sm:text-4xl lg:text-5xl">
                  Ready to skip the{" "}
                  <span className="text-[var(--ov-text-dim)] line-through decoration-[var(--ov-text-dim)]/30">
                    scramble
                  </span>
                  ?
                </h2>
                <p className="text-base leading-8 text-[var(--ov-text-muted)]">
                  Post your request. One message is all it takes. The AI market
                  searches, ranks, negotiates, and books -- so you do not have to.
                </p>
              </div>

              <div>
                <RequestComposer
                  value={value}
                  onChange={onChange}
                  onSubmit={onSubmit}
                  disabled={disabled}
                  variant="landing"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
