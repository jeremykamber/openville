"use client";

import { useRef } from "react";

import { motion, useInView } from "motion/react";

import {
  marketClusters,
  painPoints,
  storyScenario,
  top10Agents,
} from "@/features/landing/data/storyboard-fixtures";

// ── Motion config ────────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const containerReveal = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: EASE },
  },
};

const fragmentStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const fragmentItem = {
  hidden: { opacity: 0, scale: 0.9, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: EASE },
  },
};

const centerCard = {
  hidden: { opacity: 0, scale: 0.92, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.65, ease: EASE, delay: 0.3 },
  },
};

const rightPanelStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.4 },
  },
};

const rightPanelItem = {
  hidden: { opacity: 0, x: 16, filter: "blur(3px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: EASE },
  },
};

// ── Layout ───────────────────────────────────────────────────────────────────

const fragmentClasses = [
  "left-2 top-3 w-44 -rotate-6",
  "right-8 top-14 w-48 rotate-4",
  "left-12 bottom-24 w-52 -rotate-4",
  "right-3 bottom-10 w-44 rotate-6",
];

const signalClasses = [
  "left-[58%] top-[18%]",
  "left-[73%] top-[26%]",
  "left-[84%] top-[42%]",
  "left-[76%] top-[61%]",
  "left-[59%] top-[72%]",
  "left-[49%] top-[50%]",
];

// ── Component ────────────────────────────────────────────────────────────────

export function BridgePreview() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      variants={containerReveal}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="ov-panel-strong relative min-h-[28rem] overflow-hidden rounded-[2rem] p-5 sm:p-7"
    >
      <div className="absolute inset-0 ov-grid opacity-20" />
      <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.14),transparent_70%)]" />
      <div className="absolute bottom-0 left-1/2 h-36 w-36 -translate-x-1/2 rounded-full bg-[rgba(245,158,11,0.08)] blur-3xl" />

      {/* Pain point fragments — staggered entrance */}
      <motion.div
        variants={fragmentStagger}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {painPoints.slice(0, 4).map((point, index) => (
          <motion.div
            key={point.id}
            variants={fragmentItem}
            className={`absolute rounded-2xl border border-dashed border-[rgba(242,191,122,0.24)] bg-[rgba(30,23,12,0.5)] px-4 py-3 text-left text-xs text-[var(--ov-human)] shadow-[0_18px_40px_rgba(6,10,18,0.32)] [animation:ov-float_8s_ease-in-out_infinite] ${fragmentClasses[index]}`}
            style={{ animationDelay: `${index * 0.6}s` }}
          >
            <p className="font-display text-[11px] tracking-[0.2em] uppercase">
              {point.title}
            </p>
            <p className="mt-2 leading-5 text-[rgba(242,191,122,0.82)]">
              {point.detail.slice(0, 60)}...
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Center request card */}
      <motion.div
        variants={centerCard}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="absolute left-1/2 top-1/2 z-10 w-[17rem] -translate-x-1/2 -translate-y-1/2 rounded-[1.75rem] border border-[rgba(242,191,122,0.24)] bg-[linear-gradient(180deg,rgba(20,24,31,0.96),rgba(10,15,23,0.96))] p-5 shadow-[0_28px_80px_rgba(5,10,20,0.55)]"
      >
        <p className="ov-kicker text-[var(--ov-human)]">Your Request</p>
        <p className="mt-3 font-display text-xl leading-8 text-[var(--ov-text)]">
          One request enters the market.
        </p>
        <p className="mt-3 text-sm leading-7 text-[var(--ov-text-muted)]">
          {storyScenario.request.slice(0, 80)}...
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="ov-chip-human rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.15em] uppercase">
            This week
          </span>
          <span className="ov-chip-human rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.15em] uppercase">
            ~$500 budget
          </span>
        </div>
      </motion.div>

      {/* Connector line */}
      <div className="absolute inset-y-12 right-4 left-[45%] rounded-[1.75rem] border border-[rgba(59,130,246,0.12)] bg-[linear-gradient(180deg,rgba(7,17,29,0.22),rgba(7,17,29,0))]" />
      <div className="absolute left-[46%] top-1/2 h-px w-[12%] -translate-y-1/2 bg-[linear-gradient(90deg,rgba(242,191,122,0.72),rgba(59,130,246,0.72))]" />

      {/* Signal dots */}
      {signalClasses.map((className, index) => (
        <motion.div
          key={className}
          initial={{ opacity: 0, scale: 0 }}
          animate={
            isInView
              ? { opacity: 1, scale: 1 }
              : { opacity: 0, scale: 0 }
          }
          transition={{
            duration: 0.4,
            ease: EASE,
            delay: 0.5 + index * 0.08,
          }}
          className={`absolute h-2 w-2 rounded-full bg-[var(--ov-signal)] shadow-[0_0_24px_rgba(59,130,246,0.45)] [animation:ov-pulse_2.8s_ease-in-out_infinite] ${className}`}
          style={{ animationDelay: `${index * 0.25}s` }}
        />
      ))}

      {/* Right side — cluster list + top 10 */}
      <div className="absolute inset-y-8 right-4 flex w-[42%] flex-col justify-between">
        <motion.div
          variants={rightPanelStagger}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid gap-2"
        >
          {marketClusters.map((cluster, index) => (
            <motion.div
              key={cluster.id}
              variants={rightPanelItem}
              className="flex items-center justify-between rounded-2xl border border-[rgba(59,130,246,0.12)] bg-[rgba(10,17,29,0.7)] px-4 py-3 [animation:ov-float_7s_ease-in-out_infinite]"
              style={{ animationDelay: `${index * 0.35}s` }}
            >
              <div>
                <p className="text-[10px] font-semibold tracking-[0.18em] text-[var(--ov-text-muted)] uppercase">
                  {cluster.shortLabel}
                </p>
                <p className="mt-1 text-sm font-medium text-[var(--ov-text)]">
                  {cluster.label}
                </p>
              </div>
              <p className="font-mono text-xs text-[var(--ov-signal-bright)]">
                {cluster.count}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.6 }}
          className="rounded-2xl border border-[rgba(59,130,246,0.12)] bg-[rgba(10,17,29,0.78)] p-4"
        >
          <p className="text-[10px] font-semibold tracking-[0.18em] text-[var(--ov-text-muted)] uppercase">
            top 10 contenders
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {top10Agents.slice(0, 6).map((agent) => (
              <span
                key={agent.id}
                className="rounded-full border border-[rgba(59,130,246,0.18)] bg-[rgba(59,130,246,0.12)] px-3 py-1 text-[11px] font-medium text-[var(--ov-signal-bright)]"
              >
                {agent.name}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
