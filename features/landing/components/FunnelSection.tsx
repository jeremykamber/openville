"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  AgentMarketGraph,
  type MarketGraphStage,
} from "@/features/landing/components/market/AgentMarketGraph";
import { PriorityRail } from "@/features/landing/components/market/PriorityRail";
import { EASE } from "@/lib/motion";

// ── Stage definitions ────────────────────────────────────────────────────────

const STAGE_ORDER: MarketGraphStage[] = [
  "market",
  "top10",
  "top3",
  "negotiation",
  "winner",
];

// Duration (ms) each stage is visible before auto-advancing.
const STAGE_DWELL_MS = 2400;

const STAGE_INDICATORS: Record<
  MarketGraphStage,
  { label: string; chipClass: string; count: string }
> = {
  market: { label: "Market open", chipClass: "ov-chip-signal", count: "50" },
  top10: { label: "Ranked survivors", chipClass: "ov-chip-signal", count: "10" },
  top3: { label: "Finalists", chipClass: "ov-chip-negotiation", count: "3" },
  negotiation: {
    label: "Negotiation live",
    chipClass: "ov-chip-negotiation",
    count: "3",
  },
  winner: { label: "Winner selected", chipClass: "ov-chip-success", count: "1" },
};

// ── Auto-play hook ──────────────────────────────────────────────────────────
// Starts immediately on mount and loops forever. No scroll or visibility
// dependency — the animation is always running so the user sees the full
// workflow cycle no matter when they reach this section.

function useAutoStage(): MarketGraphStage {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((prev) => (prev + 1) % STAGE_ORDER.length);
    }, STAGE_DWELL_MS);

    return () => clearInterval(interval);
  }, []);

  return STAGE_ORDER[stageIndex];
}

// ── Component ────────────────────────────────────────────────────────────────

export function FunnelSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stage = useAutoStage();
  const stageIndex = STAGE_ORDER.indexOf(stage);

  return (
    <section
      ref={sectionRef}
      id="funnel"
      className="relative bg-[var(--ov-surface-0)] px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      aria-label="The Agent Economy -- market funnel visualization"
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% 20%, rgba(255,255,255,0.03), transparent 55%), radial-gradient(ellipse 40% 35% at 80% 75%, rgba(255,77,77,0.02), transparent 50%)",
        }}
      />

      <div className="relative z-[1] mx-auto max-w-6xl space-y-6">
        {/* Section header */}
        <div className="text-center">
          <span className="ov-kicker">Communication & Bargaining</span>
          <h2 className="ov-headline mt-3 text-3xl sm:text-4xl lg:text-5xl">
            Your priorities, clearly defined.
          </h2>
          <p className="ov-section-copy mx-auto mt-3 max-w-2xl">
            These signals guide the market. Agents compete within these constraints
            to win your job.
          </p>
        </div>

        {/* Top bar */}
        <div className="flex flex-col gap-3 rounded-[1.75rem] border border-[var(--ov-border)] bg-[rgba(9,9,11,0.96)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:rounded-[2rem] sm:px-6 sm:py-4">
          <div className="min-w-0 flex-1 overflow-x-auto">
            <PriorityRail />
          </div>
          <div className="flex items-center gap-3">
            {/* Count badge — all 5 variants stacked, opacity-only crossfade */}
            <div className="relative flex size-8 items-center justify-center rounded-lg border border-[var(--ov-border-strong)] bg-[var(--ov-surface-1)]">
              {STAGE_ORDER.map((s) => (
                <motion.span
                  key={s}
                  animate={{ opacity: stage === s ? 1 : 0 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className="absolute inset-0 flex items-center justify-center font-mono text-sm font-bold text-[var(--ov-text)]"
                  aria-hidden={stage !== s}
                >
                  {STAGE_INDICATORS[s].count}
                </motion.span>
              ))}
            </div>
            {/* Stage label chip — all 5 variants stacked, opacity-only crossfade.
                 The wrapper has a fixed height and min-width so no label overflows. */}
            <div className="relative h-7 min-w-[10rem] sm:min-w-[11rem]">
              {STAGE_ORDER.map((s) => (
                <motion.div
                  key={s}
                  animate={{ opacity: stage === s ? 1 : 0 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className={`absolute inset-0 flex items-center rounded-full px-4 py-1.5 text-[10px] font-semibold tracking-[0.18em] uppercase ${STAGE_INDICATORS[s].chipClass}`}
                  aria-hidden={stage !== s}
                  style={{ pointerEvents: stage === s ? "auto" : "none" }}
                >
                  {STAGE_INDICATORS[s].label}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Graph + copy */}
        <AgentMarketGraph stage={stage} />

        {/* Stage progress indicator — driven by discrete stage */}
        <div className="mx-auto max-w-lg">
          <div className="h-[2px] w-full overflow-hidden rounded-full bg-[var(--ov-surface-1)]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${((stageIndex + 1) / STAGE_ORDER.length) * 100}%`,
                background:
                  stage === "winner"
                    ? "linear-gradient(90deg, var(--ov-text-muted), var(--ov-accent))"
                    : "linear-gradient(90deg, var(--ov-text-muted), var(--ov-text))",
                transition: "width 0.6s ease, background 0.6s ease",
              }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="font-mono text-[9px] tracking-[0.14em] text-[var(--ov-text-dim)] uppercase">
              Market open
            </span>

            {/* Stage dots */}
            <div className="flex items-center gap-1.5">
              {STAGE_ORDER.map((s, i) => {
                const isActive = i <= stageIndex;
                const isWinnerDot = s === "winner";

                return (
                  <div
                    key={s}
                    className={`size-1.5 rounded-full ${
                      isActive
                        ? isWinnerDot
                          ? "bg-[var(--ov-accent)] shadow-[0_0_8px_rgba(255,77,77,0.3)]"
                          : "bg-[var(--ov-text)]"
                        : "bg-[var(--ov-text-dim)]"
                    }`}
                    style={{
                      transition:
                        "background-color 0.5s ease, box-shadow 0.5s ease",
                    }}
                  />
                );
              })}
            </div>

            <span className="font-mono text-[9px] tracking-[0.14em] text-[var(--ov-text-dim)] uppercase">
              Winner selected
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
