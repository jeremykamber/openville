"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { RequestComposer } from "@/features/chat/components/RequestComposer";
import { heroPromptChips } from "@/features/landing/data/storyboard-fixtures";
import { useTextScramble } from "@/hooks/useTextScramble";
import { EASE, fadeUp, fadeScale, stagger } from "@/lib/motion";

// ── Stat card variant ───────────────────────────────────────────────────────

const statCardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: EASE,
      delay: 0.5 + i * 0.06,
    },
  }),
};

const orbVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 1.2, ease: EASE, delay: 0.1 },
  },
};

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, ease: EASE, delay: 0.15 },
  },
};

// ── Animated number counter ──────────────────────────────────────────────────

function AnimatedNumber({
  value,
  suffix = "",
  duration = 1200,
  delay = 0,
}: {
  value: number;
  suffix?: string;
  duration?: number;
  delay?: number;
}) {
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (started.current) return;
      started.current = true;

      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReduced) {
        setDisplay(value);
        return;
      }

      const startTime = performance.now();
      function tick(now: number) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        setDisplay(Math.round(eased * value));
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }, delay);

    return () => clearTimeout(timeout);
  }, [value, duration, delay]);

  return (
    <span className="font-mono tabular-nums">
      {display}
      {suffix}
    </span>
  );
}

// ── Pre-computed particles (10 instead of 30) ───────────────────────────────
// Values are fixed so no random calls happen on every render/hydration.

const PARTICLES = [
  { id: 0, size: 1.4, left: 12, top: 18, opacity: 0.12, duration: 5.2, delay: 0.3 },
  { id: 1, size: 2.1, left: 28, top: 42, opacity: 0.18, duration: 7.1, delay: 1.1 },
  { id: 2, size: 1.8, left: 45, top: 12, opacity: 0.10, duration: 6.3, delay: 2.4 },
  { id: 3, size: 2.4, left: 63, top: 68, opacity: 0.14, duration: 8.0, delay: 0.8 },
  { id: 4, size: 1.2, left: 78, top: 25, opacity: 0.20, duration: 4.8, delay: 3.2 },
  { id: 5, size: 2.0, left: 35, top: 78, opacity: 0.09, duration: 7.5, delay: 1.7 },
  { id: 6, size: 1.6, left: 88, top: 55, opacity: 0.16, duration: 5.8, delay: 0.5 },
  { id: 7, size: 2.2, left: 55, top: 35, opacity: 0.11, duration: 9.0, delay: 2.0 },
  { id: 8, size: 1.3, left: 8, top: 62, opacity: 0.22, duration: 6.0, delay: 3.8 },
  { id: 9, size: 1.9, left: 72, top: 85, opacity: 0.13, duration: 7.8, delay: 1.4 },
];

// ── Props ────────────────────────────────────────────────────────────────────

interface HeroSectionProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}

// ── Component ────────────────────────────────────────────────────────────────

const HEADLINE_PLAIN = "Post one request.";
const HEADLINE_GRADIENT = "Let the AI market compete for you.";

export function HeroSection({
  value,
  onChange,
  onSubmit,
  disabled,
}: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  const { text: scrambledPlain, isComplete: plainDone } = useTextScramble(
    HEADLINE_PLAIN,
    { delay: 300, duration: 700 },
  );
  const { text: scrambledGradient } = useTextScramble(HEADLINE_GRADIENT, {
    delay: 500,
    duration: 900,
  });

  // Parallax scroll effect for background elements
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100dvh] overflow-hidden"
      aria-label="Hero -- AI-Powered Service Marketplace"
    >
      {/* === Background layers === */}

      {/* Deep grid pattern */}
      <motion.div
        variants={gridVariants}
        initial="hidden"
        animate="visible"
        className="pointer-events-none absolute inset-0 z-0"
        style={{ y: backgroundY }}
        aria-hidden="true"
      >
        <div className="absolute inset-0 ov-grid opacity-40" />
        {/* Radial fade so grid dissolves at edges */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 40%, transparent 30%, var(--ov-void) 80%)",
          }}
        />
      </motion.div>

      {/* Central orb glow */}
      <motion.div
        variants={orbVariants}
        initial="hidden"
        animate="visible"
        className="pointer-events-none absolute inset-0 z-0"
        style={{ y: backgroundY }}
        aria-hidden="true"
      >
        {/* Primary orb */}
        <div
          className="absolute left-1/2 top-[38%] h-[500px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(200,169,126,0.06) 0%, rgba(200,169,126,0.02) 30%, transparent 65%)",
          }}
        />
        {/* Secondary glow */}
        <div
          className="absolute left-[30%] top-[25%] h-[300px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 60%)",
          }}
        />
        {/* Tertiary subtle accent */}
        <div
          className="absolute right-[20%] top-[55%] h-[250px] w-[350px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(200,169,126,0.03) 0%, transparent 55%)",
          }}
        />
      </motion.div>

      {/* Floating particles (CSS only, no canvas needed for hero) */}
      <motion.div
        variants={orbVariants}
        initial="hidden"
        animate="visible"
        className="pointer-events-none absolute inset-0 z-0"
        style={{ y: backgroundY }}
        aria-hidden="true"
      >
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-white"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: `${p.left}%`,
              top: `${p.top}%`,
              opacity: p.opacity,
              animation: `ov-float ${p.duration}s ease-in-out ${p.delay}s infinite`,
            }}
          />
        ))}
      </motion.div>

      {/* Top gradient overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(180deg, rgba(9,9,11,0.15) 0%, rgba(9,9,11,0.4) 40%, rgba(9,9,11,0.85) 85%, var(--ov-void) 100%)",
        }}
      />

      {/* Horizontal line accents */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
        className="pointer-events-none absolute left-0 right-0 top-[35%] z-[1] h-px origin-left"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 20%, rgba(200,169,126,0.08) 50%, rgba(255,255,255,0.04) 80%, transparent 100%)",
        }}
      />

      {/* === Content === */}
      <motion.div
        className="relative z-[2] flex min-h-[100dvh] items-center"
        style={{ opacity: contentOpacity }}
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-4xl space-y-8 text-center sm:space-y-10"
          >
            {/* Kicker badge */}
            <motion.div variants={fadeUp} className="flex justify-center">
              <div className="inline-flex items-center rounded-full border border-[var(--ov-border)] bg-[rgba(255,255,255,0.02)] px-4 py-2">
                <span className="font-mono text-[10px] font-medium tracking-[0.12em] text-[var(--ov-text-muted)] uppercase sm:text-[11px] sm:tracking-[0.16em]">
                  AI-Powered Service Marketplace
                </span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="font-display text-[2.25rem] leading-[1.04] tracking-[-0.04em] font-light text-[var(--ov-text)] sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.5rem]"
            >
              <span className="block">{scrambledPlain}</span>
              <span
                className={`mt-1 block sm:mt-2 ${
                  plainDone
                    ? "ov-text-gradient"
                    : "text-[var(--ov-text-muted)]"
                }`}
                style={{ transition: "color 0.4s ease" }}
              >
                {scrambledGradient}
              </span>
            </motion.h1>

            {/* Subhead */}
            <motion.p
              variants={fadeUp}
              className="mx-auto max-w-2xl text-base leading-8 text-[var(--ov-text-muted)] sm:text-lg sm:leading-8"
            >
              Openville replaces the scramble of calls, quotes, and guesswork
              with an agent-run market that ranks, negotiates, and books the
              best tradesperson for your priorities.
            </motion.p>

            {/* Composer card */}
            <motion.div
              variants={fadeScale}
              className="ov-panel-elevated mx-auto max-w-3xl rounded-[2rem] p-4 sm:p-6"
            >
              {/* Top bar chips */}
              <div className="mb-3 flex flex-wrap items-center justify-center gap-2 sm:mb-4">
                <span className="ov-chip-human rounded-full px-2.5 py-1 text-[9px] font-semibold tracking-[0.14em] uppercase sm:px-3 sm:text-[10px] sm:tracking-[0.18em]">
                  Tradespeople marketplace
                </span>
                <span className="ov-chip rounded-full px-2.5 py-1 text-[9px] font-semibold tracking-[0.14em] uppercase sm:px-3 sm:text-[10px] sm:tracking-[0.18em]">
                  50 agents ready
                </span>
                <span className="ov-chip-signal rounded-full px-2.5 py-1 text-[9px] font-semibold tracking-[0.14em] uppercase sm:px-3 sm:text-[10px] sm:tracking-[0.18em]">
                  Real-time negotiation
                </span>
              </div>
              <RequestComposer
                value={value}
                onChange={onChange}
                onSubmit={onSubmit}
                disabled={disabled}
                examples={heroPromptChips}
                onExampleClick={onChange}
                variant="landing"
              />
            </motion.div>

            {/* Stat cards — social proof row */}
            <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
              {[
                {
                  number: 50,
                  suffix: "+",
                  label: "Specialist agents",
                  detail: "compete for every request",
                },
                {
                  number: 3,
                  suffix: "",
                  label: "Finalists negotiate",
                  detail: "on price, scope, and timing",
                },
                {
                  number: 1,
                  suffix: "",
                  label: "Winner selected",
                  detail: "with explainable reasoning",
                },
              ].map((stat, i) => (
                <motion.article
                  key={stat.label}
                  custom={i}
                  variants={statCardVariants}
                  initial="hidden"
                  animate="visible"
                  className="ov-panel group relative overflow-hidden rounded-2xl px-5 py-5 text-left hover:border-[var(--ov-border-strong)]"
                  style={{ transition: "border-color 0.2s ease" }}
                >
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-3xl font-light text-[var(--ov-text)]">
                      <AnimatedNumber
                        value={stat.number}
                        suffix={stat.suffix}
                        delay={600 + i * 100}
                        duration={1000}
                      />
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-[var(--ov-text)]">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[var(--ov-text-muted)]">
                    {stat.detail}
                  </p>

                  {/* Hover glow */}
                  <div
                    className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      boxShadow:
                        "inset 0 0 20px rgba(255,255,255,0.03), 0 0 24px rgba(255,255,255,0.02)",
                    }}
                  />
                </motion.article>
              ))}
            </div>

            {/* Scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="flex flex-col items-center gap-2 pt-4"
            >
              <span className="font-mono text-[9px] tracking-[0.2em] text-[var(--ov-text-dim)] uppercase">
                Scroll to explore
              </span>
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
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
                    d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
                  />
                </svg>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
